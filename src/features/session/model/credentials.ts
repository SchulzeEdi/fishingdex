/** Senha mínima no cadastro (o Supabase também valida). */
export const MIN_PASSWORD_LENGTH = 8;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type CredentialsError = 'invalid_email' | 'weak_password' | 'name_required';

/** Validação local antes de ir ao servidor (resposta imediata na tela). */
export function validateCredentials(input: {
  email: string;
  password: string;
  name?: string;
  mode: 'signIn' | 'signUp';
}): Partial<Record<'email' | 'password' | 'name', CredentialsError>> {
  const errors: Partial<Record<'email' | 'password' | 'name', CredentialsError>> = {};
  if (!EMAIL.test(input.email.trim())) errors.email = 'invalid_email';
  if (input.mode === 'signUp') {
    if (input.password.length < MIN_PASSWORD_LENGTH) errors.password = 'weak_password';
    if (!input.name?.trim()) errors.name = 'name_required';
  } else if (input.password.length === 0) {
    errors.password = 'weak_password';
  }
  return errors;
}
