import { getSupabase, toAppError } from '@/shared/api';

import { toCountry, type Country, type Profile } from '../model/session-store';

interface UserRow {
  id: string;
  email: string | null;
  name: string;
  country: string | null;
  plan: string;
}

function toProfile(row: UserRow): Profile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    country: toCountry(row.country),
    plan: row.plan === 'pro' ? 'pro' : 'free',
  };
}

/** Perfil do usuário logado (RLS: só a própria linha). */
export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await getSupabase()
    .from('users')
    .select('id, email, name, country, plan')
    .eq('id', userId)
    .single<UserRow>();
  if (error) throw toAppError(error);
  return toProfile(data);
}

/** Atualiza nome e país (o plano só muda pelo servidor). */
export async function updateProfile(userId: string, patch: { name: string; country: Country }): Promise<Profile> {
  const { data, error } = await getSupabase()
    .from('users')
    .update({ name: patch.name, country: patch.country })
    .eq('id', userId)
    .select('id, email, name, country, plan')
    .single<UserRow>();
  if (error) throw toAppError(error);
  return toProfile(data);
}
