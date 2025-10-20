import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/admin/reglage?error=google_auth_failed', request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/admin/reglage?error=no_code', request.url));
    }

    // Get Google credentials from settings
    const settings = await prisma.settings.findFirst();
    if (!settings || !settings.googleClientId || !settings.googleClientSecret) {
      return NextResponse.redirect(new URL('/admin/reglage?error=google_not_configured', request.url));
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: settings.googleClientId,
        client_secret: settings.googleClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/google/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for tokens');
      return NextResponse.redirect(new URL('/admin/reglage?error=token_exchange_failed', request.url));
    }

    const tokens = await tokenResponse.json();

    // Update settings with tokens
    await prisma.settings.update({
      where: { id: settings.id },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
        googleEnabled: true,
      },
    });

    return NextResponse.redirect(new URL('/admin/reglage?success=google_connected', request.url));
  } catch (error) {
    console.error('Error in Google callback:', error);
    return NextResponse.redirect(new URL('/admin/reglage?error=callback_error', request.url));
  }
}
