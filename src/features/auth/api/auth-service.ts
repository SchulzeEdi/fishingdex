import type { User } from '@/entities/user';
import { UserDbRepository } from '@/entities/user/api/user.db-repository';
import type { Db } from '@/shared/db/client';

import { hashPassword, isValidPassword, verifyPassword } from '../model/password';
import { signToken } from '../model/token';

export interface AuthResult {
  user: User;
  token: string;
}

export class AuthError extends Error {
  constructor(public readonly code: 'email_taken' | 'invalid_credentials' | 'invalid_password') {
    super(code);
    this.name = 'AuthError';
  }
}

/** Serviço de autenticação local (bcrypt + JWT). Em prod, trocar por Supabase Auth (ADR-0003). */
export class AuthService {
  private readonly users: UserDbRepository;

  constructor(
    db: Db,
    private readonly jwtSecret: string,
  ) {
    this.users = new UserDbRepository(db);
  }

  async register(input: { email: string; name: string; password: string; country?: string }): Promise<AuthResult> {
    if (!isValidPassword(input.password)) throw new AuthError('invalid_password');
    if (await this.users.findByEmail(input.email)) throw new AuthError('email_taken');

    const user = await this.users.create({
      email: input.email,
      name: input.name,
      passwordHash: hashPassword(input.password),
      country: input.country,
    });
    return { user, token: this.issue(user) };
  }

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const found = await this.users.findByEmail(input.email);
    if (!found || !found.passwordHash || !verifyPassword(input.password, found.passwordHash)) {
      throw new AuthError('invalid_credentials');
    }
    const { passwordHash: _omit, ...user } = found;
    return { user, token: this.issue(user) };
  }

  private issue(user: User): string {
    return signToken({ sub: user.id, email: user.email }, this.jwtSecret);
  }
}
