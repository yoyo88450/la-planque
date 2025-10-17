import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const appointments = await prisma.appointment.findMany({
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

    // No user lookup needed - appointments can be created without user association

    const appointment = await prisma.appointment.create({
      data: {
        title,
        description: description || null,
        date: new Date(date),
        duration: duration || 60,
        // No userId needed
        clientName: clientName || null,
        clientEmail: clientEmail || null,
        clientPhone: clientPhone || null,
        clientMessage: clientMessage || null
      }
      // No user include needed
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
