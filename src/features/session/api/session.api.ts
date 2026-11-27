import type { Session } from '@supabase/supabase-js';

import { catchActions, fetchMyCatches } from '@/entities/catch';
import { fetchProfile, sessionActions, type Country } from '@/entities/user';
import { AppError, getSupabase, toAppError } from '@/shared/api';
import { isBackendConfigured } from '@/shared/config';

/** Carrega perfil e capturas do usuário logado nos stores. */
async function loadUserData(session: Session): Promise<void> {
  const profile = await fetchProfile(session.user.id);
  sessionActions.signedIn(profile);
  catchActions.loading();
  try {
    catchActions.loaded(await fetchMyCatches());
  } catch {
    catchActions.failed();
  }
}

/** Recarrega as capturas (ex.: puxar para atualizar). */
export async function reloadMyCatches(): Promise<void> {
  catchActions.loading();
  try {
    catchActions.loaded(await fetchMyCatches());
  } catch (e) {
    catchActions.failed();
    throw toAppError(e);
  }
}

let started = false;

/**
 * Liga a sessão do app ao Supabase Auth: restaura o login salvo no aparelho e acompanha
 * entrar/sair. Resolve quando o estado inicial (logado ou não) é conhecido.
 */
export async function startSession(): Promise<void> {
  if (started) return;
  started = true;
  if (!isBackendConfigured()) {
    sessionActions.signedOut();
    return;
  }
  const supabase = getSupabase();
  // Login/cadastro carregam os dados direto; aqui só tratamos a sessão que cai (token revogado,
  // conta excluída em outro aparelho).
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
      sessionActions.signedOut();
      catchActions.clear();
    }
  });
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) await loadUserData(data.session);
    else sessionActions.signedOut();
  } catch {
    // Sem rede no início: o token salvo continua; tenta de novo ao voltar a conexão.
    sessionActions.signedOut();
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  const { data, error } = await getSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw toAppError(error);
  await loadUserData(data.session);
}

export async function signUp(input: {
  email: string;
  password: string;
  name: string;
  country: Country;
}): Promise<void> {
  const { data, error } = await getSupabase().auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { name: input.name, country: input.country } },
  });
  if (error) throw toAppError(error);
  // Supabase devolve usuário sem identidades quando o e-mail já existe (proteção de enumeração).
  if (data.user && data.user.identities?.length === 0) throw new AppError('email_taken');
  if (!data.session) throw new AppError('unknown', 'confirmação de e-mail ligada no servidor');
  await loadUserData(data.session);
}

export async function signOut(): Promise<void> {
  await getSupabase().auth.signOut();
  sessionActions.signedOut();
  catchActions.clear();
}

/**
 * Exclui a conta (exigência da Google Play): apaga as fotos do Storage, depois a conta e,
 * em cascata no banco, perfil, capturas, curtidas e desbloqueios.
 */
export async function deleteAccount(): Promise<void> {
  const supabase = getSupabase();
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new AppError('not_authenticated');
  const bucket = supabase.storage.from('catch-photos');
  const { data: files } = await bucket.list(uid, { limit: 1000 });
  if (files && files.length > 0) await bucket.remove(files.map((f) => `${uid}/${f.name}`));
  const { error } = await supabase.rpc('delete_my_account');
  if (error) throw toAppError(error);
  await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
  sessionActions.signedOut();
  catchActions.clear();
}
