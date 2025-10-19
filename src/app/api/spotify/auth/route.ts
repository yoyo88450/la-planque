import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get client ID from settings instead of env
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const settings = await prisma.settings.findFirst();
    const clientId = settings?.spotifyClientId;

    if (!clientId) {
      return NextResponse.json({ error: 'Spotify client ID not configured in settings' }, { status: 500 });
    }

    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000'}/api/spotify/callback`.replace(/\/$/, '');

    // Required scopes for Web Playback SDK
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'app-remote-control'
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?` +
      new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        scope: scopes,
        show_dialog: 'true'
      });

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Error generating Spotify auth URL:', error);
    return NextResponse.json({ error: 'Failed to generate auth URL' }, { status: 500 });
  }
}
