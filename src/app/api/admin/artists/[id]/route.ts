import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, description, profileImage, albumCover } = body;

    if (!name || !description || !profileImage || !albumCover) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    const artist = await prisma.artist.update({
      where: { id: params.id },
      data: {
        name,
        description,
        profileImage,
        albumCover
      }
    });

    return NextResponse.json(artist);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'artiste:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.artist.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Artiste supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'artiste:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
