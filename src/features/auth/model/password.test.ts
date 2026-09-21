import { describe, expect, it } from 'vitest';

import { hashPassword, isValidPassword, verifyPassword } from './password';

describe('password', () => {
  it('valida comprimento mínimo', () => {
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('12345678')).toBe(true);
  });

  it('hasheia e verifica corretamente', () => {
    const hash = hashPassword('segredo123');
    expect(hash).not.toBe('segredo123');
    expect(verifyPassword('segredo123', hash)).toBe(true);
    expect(verifyPassword('errada', hash)).toBe(false);
  });

  it('recusa hashear senha inválida', () => {
    expect(() => hashPassword('curta')).toThrow();
  });
});
