import { createPersistedStore, useStore } from '@/shared/lib';

import type { Plan } from './user';

/** Mercados do app (catálogo regionalizado, D-14). */
export type Country = 'BR' | 'AR' | 'US';

export const COUNTRIES: readonly Country[] = ['BR', 'AR', 'US'];

/** Perfil do usuário logado (tabela public.users no Supabase). */
export interface Profile {
  id: string;
  email: string | null;
  name: string;
  country: Country | null;
  plan: Plan;
}

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

interface SessionState {
  status: SessionStatus;
  profile: Profile | null;
}

/** Sessão em memória: a fonte é o Supabase Auth (que guarda o token no aparelho). */
export const sessionStore = createPersistedStore<SessionState>({
  key: 'fishingdex.session',
  version: 2,
  initial: { status: 'loading', profile: null },
  persist: false,
});

/** Nome limpo e com tamanho razoável; null se vazio. */
export function sanitizeName(name: string): string | null {
  const clean = name.replace(/\s+/g, ' ').trim().slice(0, 40);
  return clean.length > 0 ? clean : null;
}

export function toCountry(value: unknown): Country | null {
  return COUNTRIES.find((c) => c === value) ?? null;
}

export const sessionActions = {
  signedIn(profile: Profile) {
    sessionStore.setState(() => ({ status: 'signedIn', profile }));
  },
  signedOut() {
    sessionStore.setState(() => ({ status: 'signedOut', profile: null }));
  },
  patchProfile(patch: Partial<Omit<Profile, 'id'>>) {
    sessionStore.setState((s) => (s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s));
  },
};

export function useSessionStatus(): SessionStatus {
  return useStore(sessionStore, (s) => s.status);
}

export function useProfile(): Profile | null {
  return useStore(sessionStore, (s) => s.profile);
}

export function usePlan(): Plan {
  return useStore(sessionStore, (s) => s.profile?.plan ?? 'free');
}
