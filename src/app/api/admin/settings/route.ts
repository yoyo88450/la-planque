import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get the first settings record (there should only be one)
    let settings = await prisma.settings.findFirst();

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          artistsEnabled: true,
          boutiqueEnabled: true,
          spotifyEnabled: false
        }
      });
    }

    return NextResponse.json({
      artistsEnabled: settings.artistsEnabled,
      boutiqueEnabled: settings.boutiqueEnabled,
      spotifyEnabled: settings.spotifyEnabled,
      spotifyPlaylistId: settings.spotifyPlaylistId,
      spotifyClientId: settings.spotifyClientId,
      spotifyClientSecret: settings.spotifyClientSecret,
      googleEnabled: settings.googleEnabled,
      googleApiKey: settings.googleApiKey,
      googleClientId: settings.googleClientId,
      googleClientSecret: settings.googleClientSecret,
      googlePlaceId: settings.googlePlaceId
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Get the first settings record
    let settings = await prisma.settings.findFirst();

    if (!settings) {
      // Create settings if they don't exist
      settings = await prisma.settings.create({
        data: {
          artistsEnabled: body.artistsEnabled ?? true,
          boutiqueEnabled: body.boutiqueEnabled ?? true,
          spotifyEnabled: body.spotifyEnabled ?? false,
          spotifyPlaylistId: body.spotifyPlaylistId,
          spotifyClientId: body.spotifyClientId,
          spotifyClientSecret: body.spotifyClientSecret,
          googleEnabled: body.googleEnabled ?? false,
          googleApiKey: body.googleApiKey,
          googleClientId: body.googleClientId,
          googleClientSecret: body.googleClientSecret,
          googlePlaceId: body.googlePlaceId
        }
      });
    } else {
      // Update existing settings
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: {
          artistsEnabled: body.artistsEnabled ?? settings.artistsEnabled,
          boutiqueEnabled: body.boutiqueEnabled ?? settings.boutiqueEnabled,
          spotifyEnabled: body.spotifyEnabled ?? settings.spotifyEnabled,
          spotifyPlaylistId: body.spotifyPlaylistId ?? settings.spotifyPlaylistId,
          spotifyClientId: body.spotifyClientId ?? settings.spotifyClientId,
          spotifyClientSecret: body.spotifyClientSecret ?? settings.spotifyClientSecret,
          googleEnabled: body.googleEnabled ?? settings.googleEnabled,
          googleApiKey: body.googleApiKey ?? settings.googleApiKey,
          googleClientId: body.googleClientId ?? settings.googleClientId,
          googleClientSecret: body.googleClientSecret ?? settings.googleClientSecret,
          googlePlaceId: body.googlePlaceId ?? settings.googlePlaceId
        }
      });
    }

    return NextResponse.json({
      artistsEnabled: settings.artistsEnabled,
      boutiqueEnabled: settings.boutiqueEnabled,
      spotifyEnabled: settings.spotifyEnabled,
      spotifyPlaylistId: settings.spotifyPlaylistId,
      spotifyClientId: settings.spotifyClientId,
      spotifyClientSecret: settings.spotifyClientSecret,
      googleEnabled: settings.googleEnabled,
      googleApiKey: settings.googleApiKey,
      googleClientId: settings.googleClientId,
      googleClientSecret: settings.googleClientSecret,
      googlePlaceId: settings.googlePlaceId
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
