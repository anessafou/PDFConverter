// src/core/auth/postgres-adapter.ts
import { createHmac, timingSafeEqual } from 'crypto';
import { IAuthService, AdminUser } from './auth.interface';

export class PostgresAuthAdapter implements IAuthService {
  private getSecretKey(): string {
    const secret = process.env.ADMIN_SECRET_KEY;
    if (!secret || secret.trim().length === 0) {
      throw new Error('ADMIN_SECRET_KEY environment variable is not defined.');
    }
    return secret;
  }

  async verifyAdminCredentials(password: string): Promise<boolean> {
    const expected = this.getSecretKey();
    if (!password || password.length === 0) return false;

    // Constant-time comparison to prevent timing attacks
    const bufferA = Buffer.from(password);
    const bufferB = Buffer.from(expected);

    if (bufferA.length !== bufferB.length) {
      return false;
    }
    return timingSafeEqual(bufferA, bufferB);
  }

  async generateSessionToken(user: AdminUser): Promise<string> {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours expiration
      })
    ).toString('base64url');

    const signature = createHmac('sha256', this.getSecretKey())
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  async validateSession(token: string): Promise<AdminUser | null> {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;

    const expectedSignature = createHmac('sha256', this.getSecretKey())
      .update(`${header}.${payload}`)
      .digest('base64url');

    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);

    if (sigA.length !== sigB.length || !timingSafeEqual(sigA, sigB)) {
      return null;
    }

    try {
      const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      if (typeof data.exp === 'number' && data.exp < Math.floor(Date.now() / 1000)) {
        return null; // Token expired
      }

      return {
        id: data.sub,
        email: data.email,
        role: data.role,
      };
    } catch {
      return null;
    }
  }
}

export const authService = new PostgresAuthAdapter();