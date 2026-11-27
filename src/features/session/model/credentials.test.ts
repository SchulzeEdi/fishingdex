import { describe, expect, it } from 'vitest';

import { validateCredentials } from './credentials';

describe('validateCredentials', () => {
  it('cadastro exige e-mail válido, senha de 8+ e nome', () => {
    expect(validateCredentials({ mode: 'signUp', email: 'ana@x.dev', password: '12345678', name: 'Ana' })).toEqual({});
    expect(validateCredentials({ mode: 'signUp', email: 'ana@x', password: '123', name: ' ' })).toEqual({
      email: 'invalid_email',
      password: 'weak_password',
      name: 'name_required',
    });
  });

  it('login só exige e-mail válido e senha preenchida', () => {
    expect(validateCredentials({ mode: 'signIn', email: ' ana@x.dev ', password: 'x' })).toEqual({});
    expect(validateCredentials({ mode: 'signIn', email: 'ana', password: '' })).toEqual({
      email: 'invalid_email',
      password: 'weak_password',
    });
  });
});
