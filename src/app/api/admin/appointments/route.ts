import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, date, duration, clientName, clientEmail, clientPhone, clientMessage } = body;

    if (!title || !date) {
      return NextResponse.json(
        { error: 'Titre et date sont requis' },
        { status: 400 }
      );
    }

    // Utiliser automatiquement l'utilisateur admin pour les réservations admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Aucun utilisateur admin trouvé' },
        { status: 500 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        duration: duration || 60,
        userId: adminUser.id,
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
        clientMessage: clientMessage || null
      },
      include: {
        user: {
          select: {
            username: true
          }
        }
      }
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
