// src/app/api/admin/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/core/auth/postgres-adapter';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    const isValid = await authService.verifyAdminCredentials(password);
    if (!isValid) {
      return NextResponse.json({ error: 'Unauthorized: Invalid administrative credentials.' }, { status: 401 });
    }

    const sessionToken = await authService.generateSessionToken({
      id: 'admin-master',
      email: 'admin@pdfconverter.space',
      role: 'superadmin',
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin authentication failure:', error);
    return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 500 });
  }
}