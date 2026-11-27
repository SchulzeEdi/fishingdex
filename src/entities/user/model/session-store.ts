import { createPersistedStore, useStore } from '@/shared/lib';

import type { Plan } from './user';

/** Mercados do app (catálogo regionalizado, D-14). */
export type Country = 'BR' | 'AR' | 'US';

export const COUNTRIES: readonly Country[] = ['BR', 'AR', 'US'];

export interface LocalProfile {
  name: string;
  country: Country;
}

interface SessionState {
  /** null até o onboarding (perfil local enquanto a auth real não entra — DT-03). */
  profile: LocalProfile | null;
  plan: Plan;
}

export const sessionStore = createPersistedStore<SessionState>({
  key: 'fishingdex.session',
  version: 1,
  initial: { profile: null, plan: 'free' },
});

/** Nome limpo e com tamanho razoável; null se vazio. */
export function sanitizeName(name: string): string | null {
  const clean = name.replace(/\s+/g, ' ').trim().slice(0, 40);
  return clean.length > 0 ? clean : null;
}

export const sessionActions = {
  saveProfile(profile: LocalProfile) {
    const name = sanitizeName(profile.name);
    if (!name) return;
    sessionStore.setState((s) => ({ ...s, profile: { name, country: profile.country } }));
  },
  setPlan(plan: Plan) {
    sessionStore.setState((s) => (s.plan === plan ? s : { ...s, plan }));
  },
};

export function useProfile(): LocalProfile | null {
  return useStore(sessionStore, (s) => s.profile);
}

export function usePlan(): Plan {
  return useStore(sessionStore, (s) => s.plan);
}
