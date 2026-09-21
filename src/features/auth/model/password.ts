import bcrypt from 'bcryptjs';

const COST = 10;

/** Regras mínimas de senha (validação de borda antes de hashear). */
export function isValidPassword(password: string): boolean {
  return typeof password === 'string' && password.length >= 8;
}

export function hashPassword(password: string): string {
  if (!isValidPassword(password)) {
    throw new Error('senha inválida (mínimo 8 caracteres)');
  }
  return bcrypt.hashSync(password, COST);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
