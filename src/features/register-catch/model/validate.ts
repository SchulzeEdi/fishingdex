import type { FishSpecies } from '@/entities/fish-species';

export type ImplausibleReason =
  | 'invalid_size'
  | 'size_exceeds_max'
  | 'invalid_weight'
  | 'weight_exceeds_max';

export interface PlausibilityResult {
  ok: boolean;
  reason?: ImplausibleReason;
}

export interface CatchMeasurement {
  sizeCm: number;
  weightKg?: number;
}

/**
 * Anti "mentira de pescador": valida a captura contra os tetos plausíveis da espécie
 * antes de aceitar no ranking. É a primeira linha de defesa; a comunidade ainda pode
 * denunciar capturas absurdas (moderação — ver spec/architecture.md).
 */
export function isPlausibleCatch(
  species: FishSpecies,
  measurement: CatchMeasurement,
): PlausibilityResult {
  const { sizeCm, weightKg } = measurement;

  if (!Number.isFinite(sizeCm) || sizeCm <= 0) {
    return { ok: false, reason: 'invalid_size' };
  }
  if (sizeCm > species.maxPlausibleSizeCm) {
    return { ok: false, reason: 'size_exceeds_max' };
  }

  if (weightKg !== undefined) {
    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      return { ok: false, reason: 'invalid_weight' };
    }
    if (species.maxPlausibleWeightKg !== undefined && weightKg > species.maxPlausibleWeightKg) {
      return { ok: false, reason: 'weight_exceeds_max' };
    }
  }

  return { ok: true };
}
