import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get credentials from settings
    const settings = await prisma.settings.findFirst();
    const clientId = settings?.spotifyClientId;
    const clientSecret = settings?.spotifyClientSecret;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'Spotify credentials not configured in settings' }, { status: 500 });
    }

    // Get new access token using refresh token flow
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: settings?.spotifyRefreshToken || ''
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token request failed:', errorData);
      return NextResponse.json({ error: 'Failed to get token' }, { status: 400 });
    }

    const tokenData = await tokenResponse.json();

    // Note: With client_credentials flow, we don't store the access token
    // as it should be requested fresh each time

    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in
    });
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
