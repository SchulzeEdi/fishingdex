// Configuração pública do app (embutida no build). EXPO_PUBLIC_* é visível no app por design:
// a chave publicável do Supabase só dá o que o RLS permite. Valores em eas.json (builds) e
// .env (desenvolvimento local).
export const env = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY ?? '',
};

export function isBackendConfigured(): boolean {
  return env.supabaseUrl.startsWith('https://') && env.supabaseKey.length > 20;
}
