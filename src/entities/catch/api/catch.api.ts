import { getSupabase, toAppError } from '@/shared/api';

import type { Catch, CommunityCatch } from '../model/catch';

interface CatchRow {
  id: string;
  user_id: string;
  species_id: string;
  size_cm: number;
  weight_kg: number | null;
  caught_at: string;
  is_private: boolean;
  photo_url: string | null;
  bait: string | null;
  place: string | null;
}

const CATCH_COLUMNS =
  'id, user_id, species_id, size_cm, weight_kg, caught_at, is_private, photo_url, bait, place';

export function toCatch(row: CatchRow): Catch {
  return {
    id: row.id,
    userId: row.user_id,
    speciesId: row.species_id,
    sizeCm: Number(row.size_cm),
    weightKg: row.weight_kg === null ? undefined : Number(row.weight_kg),
    caughtAt: row.caught_at,
    isPrivate: row.is_private,
    photoUrl: row.photo_url,
    bait: row.bait ?? undefined,
    place: row.place ?? undefined,
  };
}

/** Capturas do usuário logado (RLS: só as próprias), mais recentes primeiro. */
export async function fetchMyCatches(): Promise<Catch[]> {
  const { data, error } = await getSupabase()
    .from('catches')
    .select(CATCH_COLUMNS)
    .order('caught_at', { ascending: false })
    .returns<CatchRow[]>();
  if (error) throw toAppError(error);
  return data.map(toCatch);
}

export interface NewCatch {
  speciesId: string;
  sizeCm: number;
  weightKg?: number;
  photoUrl?: string | null;
  isPrivate: boolean;
  bait?: string;
  place?: string;
}

/**
 * Registra a captura. O banco valida (teto plausível, cota Free), carimba a data e
 * desbloqueia a espécie na Dex; erros voltam como AppError (size_exceeds_max...).
 */
export async function insertCatch(input: NewCatch): Promise<Catch> {
  const { data, error } = await getSupabase()
    .from('catches')
    .insert({
      species_id: input.speciesId,
      size_cm: input.sizeCm,
      weight_kg: input.weightKg ?? null,
      photo_url: input.photoUrl ?? null,
      is_private: input.isPrivate,
      bait: input.bait ?? null,
      place: input.place ?? null,
    })
    .select(CATCH_COLUMNS)
    .single<CatchRow>();
  if (error) throw toAppError(error);
  return toCatch(data);
}

interface FeedRow {
  catch_id: string;
  user_id: string;
  user_name: string;
  user_country: string | null;
  species_id: string;
  size_cm: number;
  weight_kg: number | null;
  photo_url: string | null;
  caught_at: string;
  is_private: boolean;
  place: string | null;
  bait: string | null;
  like_count: number;
  liked_by_me: boolean;
}

export interface FeedItem extends CommunityCatch {
  liked: boolean;
}

/** Feed da comunidade (Pro). O servidor já esconde quem é Free e o lugar dos privados. */
export async function fetchFeed(
  opts: { before?: string; limit?: number } = {},
): Promise<FeedItem[]> {
  const { data, error } = await getSupabase().rpc('get_feed', {
    p_limit: opts.limit ?? 30,
    p_before: opts.before ?? null,
  });
  if (error) throw toAppError(error);
  return ((data ?? []) as FeedRow[]).map((r) => ({
    id: r.catch_id,
    userId: r.user_id,
    authorName: r.user_name,
    authorCountry: r.user_country ?? '',
    speciesId: r.species_id,
    sizeCm: Number(r.size_cm),
    weightKg: r.weight_kg === null ? undefined : Number(r.weight_kg),
    photoUrl: r.photo_url,
    caughtAt: r.caught_at,
    isPrivate: r.is_private,
    place: r.place ?? undefined,
    bait: r.bait ?? undefined,
    likes: Number(r.like_count),
    liked: r.liked_by_me,
  }));
}

/** Denuncia uma captura (foto imprópria, tamanho falso). Some do feed de quem denunciou. */
export async function reportCatch(catchId: string, reason: string): Promise<void> {
  const { error } = await getSupabase().from('reports').insert({ catch_id: catchId, reason });
  if (error && error.code !== '23505') throw toAppError(error);
}

/** Curtir/descurtir (idempotente). */
export async function setLike(catchId: string, liked: boolean): Promise<void> {
  const likes = getSupabase().from('likes');
  const { error } = liked
    ? await likes.upsert(
        { catch_id: catchId },
        { onConflict: 'user_id,catch_id', ignoreDuplicates: true },
      )
    : await likes.delete().eq('catch_id', catchId);
  if (error) throw toAppError(error);
}
