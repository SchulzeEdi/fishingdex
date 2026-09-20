import { describe, expect, it } from 'vitest';

import type { Catch } from '@/entities/catch';
import { SPECIES_SEED } from '@/entities/fish-species';

import { buildDex, isFirstCatchOfSpecies, unlockedSpeciesIds } from './dex';

const mkCatch = (speciesId: string, id = speciesId): Catch => ({
  id,
  userId: 'u1',
  speciesId,
  sizeCm: 40,
  caughtAt: '2026-09-20T10:00:00Z',
  isPrivate: false,
});

describe('unlockedSpeciesIds', () => {
  it('retorna vazio sem capturas', () => {
    expect(unlockedSpeciesIds([]).size).toBe(0);
  });

  it('deduplica capturas da mesma espécie', () => {
    const ids = unlockedSpeciesIds([mkCatch('tilapia', 'a'), mkCatch('tilapia', 'b')]);
    expect([...ids]).toEqual(['tilapia']);
  });
});

describe('isFirstCatchOfSpecies', () => {
  it('é true quando ainda não há captura da espécie', () => {
    expect(isFirstCatchOfSpecies([mkCatch('dourado')], 'tilapia')).toBe(true);
  });

  it('é false quando já existe captura da espécie (não desbloqueia de novo)', () => {
    expect(isFirstCatchOfSpecies([mkCatch('tilapia')], 'tilapia')).toBe(false);
  });
});

describe('buildDex', () => {
  it('marca desbloqueadas e calcula o progresso', () => {
    const dex = buildDex(SPECIES_SEED, [mkCatch('tilapia'), mkCatch('robalo')]);
    expect(dex.total).toBe(SPECIES_SEED.length);
    expect(dex.unlocked).toBe(2);
    expect(dex.percent).toBe(Math.round((2 / SPECIES_SEED.length) * 100));
    const tilapia = dex.entries.find((e) => e.species.id === 'tilapia');
    expect(tilapia?.unlocked).toBe(true);
  });

  it('filtra por habitat (abas água doce/salgada)', () => {
    const salt = buildDex(SPECIES_SEED, [mkCatch('robalo')], 'saltwater');
    expect(salt.entries.every((e) => e.species.habitat === 'saltwater')).toBe(true);
    expect(salt.unlocked).toBe(1);
  });

  it('percent = 0 quando não há espécies no escopo', () => {
    expect(buildDex([], []).percent).toBe(0);
  });
});
