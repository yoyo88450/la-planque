import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get Google credentials from settings
    const settings = await prisma.settings.findFirst();
    if (!settings?.googleClientId) {
      return NextResponse.json({ error: 'Google client ID not configured' }, { status: 400 });
    }

    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/google/callback`;

    // Required scopes for Google My Business API and Calendar API
    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
      'https://www.googleapis.com/auth/plus.business.manage',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ].join(' ');

    // ✅ Corrected OAuth URL
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      new URLSearchParams({
        client_id: settings.googleClientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: scopes,
        access_type: 'offline',
        prompt: 'consent'
      });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Google auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}
