import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  sub: string; // user id
  email: string;
}

/** Assina um JWT de sessão. Adapter local (ADR-0003 troca por Supabase Auth em prod). */
export function signToken(payload: AuthTokenPayload, secret: string, expiresInSec = 60 * 60 * 24 * 30): string {
  return jwt.sign(payload, secret, { expiresIn: expiresInSec });
}

/** Verifica e decodifica o JWT; lança se inválido/expirado. */
export function verifyToken(token: string, secret: string): AuthTokenPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === 'string' || !decoded.sub || !('email' in decoded)) {
    throw new Error('token inválido');
  }
  return { sub: String(decoded.sub), email: String(decoded.email) };
}
