/**
 * Códigos de erro que o app sabe explicar. As regras do banco (triggers/RPC) levantam
 * exatamente estas chaves; o Supabase Auth tem as dele.
 */
export type AppErrorCode =
  | 'size_exceeds_max'
  | 'weight_exceeds_max'
  | 'invalid_size'
  | 'invalid_weight'
  | 'species_not_found'
  | 'free_limit_reached'
  | 'pro_required'
  | 'demo_purchases_disabled'
  | 'invalid_credentials'
  | 'email_taken'
  | 'weak_password'
  | 'invalid_email'
  | 'rate_limited'
  | 'not_authenticated'
  | 'network'
  | 'unknown';

const KNOWN: readonly AppErrorCode[] = [
  'size_exceeds_max',
  'weight_exceeds_max',
  'invalid_size',
  'invalid_weight',
  'species_not_found',
  'free_limit_reached',
  'pro_required',
  'demo_purchases_disabled',
  'not_authenticated',
];

export class AppError extends Error {
  constructor(public readonly code: AppErrorCode, message?: string) {
    super(message ?? code);
    this.name = 'AppError';
  }
}

interface ErrorLike {
  message?: unknown;
  code?: unknown;
  status?: unknown;
  name?: unknown;
}

/** Traduz erro do Supabase (PostgREST, Auth, Storage) ou de rede para um código do app. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  const e = (error ?? {}) as ErrorLike;
  const message = typeof e.message === 'string' ? e.message : '';
  const code = typeof e.code === 'string' ? e.code : '';

  const known = KNOWN.find((k) => message === k || message.includes(k));
  if (known) return new AppError(known, message);

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(message)) {
    return new AppError('invalid_credentials', message);
  }
  if (code === 'user_already_exists' || code === 'email_exists' || /already registered/i.test(message)) {
    return new AppError('email_taken', message);
  }
  if (code === 'weak_password' || /password should be/i.test(message)) {
    return new AppError('weak_password', message);
  }
  if (code === 'email_address_invalid' || /invalid.*email|email.*invalid/i.test(message)) {
    return new AppError('invalid_email', message);
  }
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || e.status === 429) {
    return new AppError('rate_limited', message);
  }
  if (/network request failed|failed to fetch|fetch failed|network/i.test(message)) {
    return new AppError('network', message);
  }
  return new AppError('unknown', message);
}
