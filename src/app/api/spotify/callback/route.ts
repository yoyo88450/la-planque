import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Spotify auth error:', error);
      return NextResponse.redirect(new URL('/admin?spotify_error=' + encodeURIComponent(error), request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL('/admin?spotify_error=no_code', request.url));
    }

    // Get credentials from settings
    const settings = await prisma.settings.findFirst();
    const clientId = settings?.spotifyClientId;
    const clientSecret = settings?.spotifyClientSecret;
    const redirectUri = `${process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000'}/api/spotify/callback`.replace(/\/$/, '');

    if (!clientId || !clientSecret) {
      console.error('Spotify credentials not configured in settings');
      return NextResponse.redirect(new URL('/admin?spotify_error=credentials_not_configured', request.url));
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed:', errorData);
      return NextResponse.redirect(new URL('/admin?spotify_error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();

    // Update settings with new tokens
    let settingsRecord = await prisma.settings.findFirst();

    if (!settingsRecord) {
      settingsRecord = await prisma.settings.create({
        data: {
          artistsEnabled: true,
          boutiqueEnabled: true,
          spotifyEnabled: true,
          spotifyAccessToken: tokenData.access_token,
          spotifyRefreshToken: tokenData.refresh_token
        }
      });
    } else {
      settingsRecord = await prisma.settings.update({
        where: { id: settingsRecord.id },
        data: {
          spotifyEnabled: true,
          spotifyAccessToken: tokenData.access_token,
          spotifyRefreshToken: tokenData.refresh_token
        }
      });
    }

    // Redirect back to admin with success
    return NextResponse.redirect(new URL('/admin?spotify_success=true', request.url));
  } catch (error) {
    console.error('Error in Spotify callback:', error);
    return NextResponse.redirect(new URL('/admin?spotify_error=server_error', request.url));
  }
}
