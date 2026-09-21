import { and, eq } from 'drizzle-orm';

import type { FishSpecies } from '@/entities/fish-species';
import type { Db } from '@/shared/db/client';
import { catches, dexUnlocks, fishSpecies } from '@/shared/db/schema';

import { isPlausibleCatch, type ImplausibleReason } from '../model/validate';

export interface RegisterCatchInput {
  userId: string;
  speciesId: string;
  sizeCm: number;
  weightKg?: number;
  photoUrl?: string;
  lat?: number;
  lng?: number;
  isPrivate?: boolean;
  bait?: string;
  rod?: string;
  reel?: string;
  line?: string;
}

export interface RegisterCatchResult {
  catchId: string;
  /** Espécie desbloqueada agora (1ª captura), ou null se já estava desbloqueada. */
  dexUnlockedSpeciesId: string | null;
}

export class RegisterCatchError extends Error {
  constructor(
    public readonly reason: ImplausibleReason | 'species_not_found',
    message?: string,
  ) {
    super(message ?? reason);
    this.name = 'RegisterCatchError';
  }
}

/**
 * Registra uma captura: valida plausibilidade contra a espécie (anti "mentira de pescador",
 * D-13) e, se for a 1ª captura daquela espécie do usuário, desbloqueia na Dex (D-12).
 * Tudo numa transação.
 */
export async function registerCatch(
  db: Db,
  input: RegisterCatchInput,
): Promise<RegisterCatchResult> {
  const [speciesRow] = await db
    .select()
    .from(fishSpecies)
    .where(eq(fishSpecies.id, input.speciesId))
    .limit(1);
  if (!speciesRow) throw new RegisterCatchError('species_not_found');

  const species: FishSpecies = {
    id: speciesRow.id,
    namePt: speciesRow.namePt,
    nameEs: speciesRow.nameEs,
    nameEn: speciesRow.nameEn,
    scientificName: speciesRow.scientificName,
    habitat: speciesRow.habitat as FishSpecies['habitat'],
    rarity: speciesRow.rarity as FishSpecies['rarity'],
    regions: speciesRow.regions as FishSpecies['regions'],
    maxPlausibleSizeCm: speciesRow.maxPlausibleSizeCm,
    maxPlausibleWeightKg: speciesRow.maxPlausibleWeightKg ?? undefined,
  };

  const plausible = isPlausibleCatch(species, {
    sizeCm: input.sizeCm,
    weightKg: input.weightKg,
  });
  if (!plausible.ok) throw new RegisterCatchError(plausible.reason!);

  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(catches)
      .values({
        userId: input.userId,
        speciesId: input.speciesId,
        sizeCm: input.sizeCm,
        weightKg: input.weightKg ?? null,
        photoUrl: input.photoUrl ?? null,
        lat: input.lat ?? null,
        lng: input.lng ?? null,
        isPrivate: input.isPrivate ?? false,
        bait: input.bait ?? null,
        rod: input.rod ?? null,
        reel: input.reel ?? null,
        line: input.line ?? null,
      })
      .returning({ id: catches.id });
    if (!created) throw new Error('falha ao inserir captura');

    const catchId = created.id;

    // Desbloqueio idempotente: só insere se ainda não existe (1ª da espécie).
    const existing = await tx
      .select({ id: dexUnlocks.id })
      .from(dexUnlocks)
      .where(and(eq(dexUnlocks.userId, input.userId), eq(dexUnlocks.speciesId, input.speciesId)))
      .limit(1);

    let dexUnlockedSpeciesId: string | null = null;
    if (existing.length === 0) {
      await tx.insert(dexUnlocks).values({
        userId: input.userId,
        speciesId: input.speciesId,
        firstCatchId: catchId,
      });
      dexUnlockedSpeciesId = input.speciesId;
    }

    return { catchId, dexUnlockedSpeciesId };
  });
}
