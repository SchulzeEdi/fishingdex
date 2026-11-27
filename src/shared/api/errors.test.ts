import { describe, expect, it } from 'vitest';

import { AppError, toAppError } from './errors';

describe('toAppError', () => {
  it('reconhece as regras do banco pela mensagem', () => {
    expect(toAppError({ message: 'size_exceeds_max', code: 'P0001' }).code).toBe('size_exceeds_max');
    expect(toAppError({ message: 'free_limit_reached' }).code).toBe('free_limit_reached');
    expect(toAppError({ message: 'pro_required' }).code).toBe('pro_required');
  });

  it('traduz erros do Supabase Auth', () => {
    expect(toAppError({ code: 'invalid_credentials', message: 'Invalid login credentials' }).code).toBe(
      'invalid_credentials',
    );
    expect(toAppError({ code: 'user_already_exists' }).code).toBe('email_taken');
    expect(toAppError({ message: 'Password should be at least 6 characters' }).code).toBe('weak_password');
    expect(toAppError({ code: 'email_address_invalid' }).code).toBe('invalid_email');
    expect(toAppError({ status: 429 }).code).toBe('rate_limited');
  });

  it('identifica falha de rede e cai em unknown no resto', () => {
    expect(toAppError(new TypeError('Network request failed')).code).toBe('network');
    expect(toAppError({ message: 'boom' }).code).toBe('unknown');
    expect(toAppError(null).code).toBe('unknown');
  });

  it('mantém um AppError como está', () => {
    const e = new AppError('pro_required');
    expect(toAppError(e)).toBe(e);
  });
});
