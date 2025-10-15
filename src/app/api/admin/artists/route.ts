import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(artists);
  } catch (error) {
    console.error('Erreur lors de la récupération des artistes:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, profileImage, albumCover } = body;

    if (!name || !description || !profileImage || !albumCover) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const artist = await prisma.artist.create({
      data: {
        name,
        description,
        profileImage,
        albumCover
      }
    });

    return NextResponse.json(artist);
  } catch (error) {
    console.error('Erreur lors de la création de l\'artiste:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
