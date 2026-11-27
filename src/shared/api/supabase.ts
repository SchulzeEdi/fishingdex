import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/shared/config';

/** Armazenamento da sessão (AsyncStorage no app, configurado em app-init). */
export interface AuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

let client: SupabaseClient | null = null;
let storage: AuthStorage | undefined;

/** Chamado uma vez na inicialização, antes do primeiro uso. */
export function configureSupabase(authStorage: AuthStorage): void {
  storage = authStorage;
  client = null;
}

/** Cliente único do Supabase (Auth, banco com RLS e Storage). */
export function getSupabase(): SupabaseClient {
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseKey, {
      auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
