import { describe, expect, it } from 'vitest';

import { signToken, verifyToken } from './token';

const SECRET = 'test_secret';

describe('token', () => {
  it('assina e verifica um token válido', () => {
    const token = signToken({ sub: 'u1', email: 'a@b.com' }, SECRET);
    const payload = verifyToken(token, SECRET);
    expect(payload.sub).toBe('u1');
    expect(payload.email).toBe('a@b.com');
  });

  it('rejeita token com segredo errado', () => {
    const token = signToken({ sub: 'u1', email: 'a@b.com' }, SECRET);
    expect(() => verifyToken(token, 'outro')).toThrow();
  });

  it('rejeita token malformado', () => {
    expect(() => verifyToken('nao.e.jwt', SECRET)).toThrow();
  });
});
