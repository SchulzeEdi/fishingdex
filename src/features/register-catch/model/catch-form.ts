import type { FishSpecies } from '@/entities/fish-species';
import { parseDecimal, type Messages } from '@/shared/i18n';

import { isPlausibleCatch } from './validate';

export interface CatchFormInput {
  speciesId: string | null;
  /** Texto digitado ("62", "62,5"). */
  size: string;
  /** Opcional. */
  weight: string;
}

export interface FieldError {
  key: keyof Messages;
  params?: Record<string, string | number>;
}

export type CatchFormErrors = Partial<Record<'species' | 'size' | 'weight', FieldError>>;

export type CatchFormResult =
  | { ok: true; sizeCm: number; weightKg?: number }
  | { ok: false; errors: CatchFormErrors };

/**
 * Valida o formulário de registrar captura: espécie obrigatória, tamanho obrigatório e
 * plausível para a espécie (anti "mentira de pescador", D-13), peso opcional e plausível.
 */
export function validateCatchForm(input: CatchFormInput, species: FishSpecies | null): CatchFormResult {
  const errors: CatchFormErrors = {};
  const sizeCm = parseDecimal(input.size);
  const weightText = input.weight.trim();
  const weightKg = weightText ? parseDecimal(weightText) : undefined;

  if (!species || species.id !== input.speciesId) errors.species = { key: 'register.speciesRequired' };
  if (sizeCm === null || sizeCm <= 0) errors.size = { key: 'register.sizeInvalid' };
  if (weightKg === null || (weightKg !== undefined && weightKg <= 0)) {
    errors.weight = { key: 'register.weightInvalid' };
  }

  if (species && !errors.size && !errors.weight && sizeCm !== null) {
    const check = isPlausibleCatch(species, { sizeCm, weightKg: weightKg ?? undefined });
    if (check.reason === 'size_exceeds_max') {
      errors.size = { key: 'register.sizeTooBig', params: { max: species.maxPlausibleSizeCm } };
    } else if (check.reason === 'weight_exceeds_max') {
      errors.weight = { key: 'register.weightTooBig', params: { max: species.maxPlausibleWeightKg ?? 0 } };
    }
  }

  if (Object.keys(errors).length > 0 || sizeCm === null) return { ok: false, errors };
  return weightKg === undefined || weightKg === null ? { ok: true, sizeCm } : { ok: true, sizeCm, weightKg };
}
