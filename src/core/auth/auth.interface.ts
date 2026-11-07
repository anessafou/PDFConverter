export interface AdminUser {
  id: string;
  email: string;
  role: 'superadmin' | 'editor';
}

export interface IAuthService {
  verifyAdminCredentials(password: string): Promise<boolean>;
  generateSessionToken(user: AdminUser): Promise<string>;
  validateSession(token: string): Promise<AdminUser | null>;
}