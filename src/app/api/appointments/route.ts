import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupérer toutes les dates et heures des rendez-vous pour le calendrier
    const appointments = await prisma.appointment.findMany({
      select: {
        id: true,
        date: true,
        duration: true,
        title: true,
        user: {
          select: {
            username: true
          }
        }
      }
    });

    // Transformer les données pour le calendrier
    const calendarEvents = appointments.map(appointment => {
      const date = appointment.date;
      const startStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`;
      const endDate = new Date(date.getTime() + appointment.duration * 60000);
      const endStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}T${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`;

      return {
        id: appointment.id,
        title: appointment.title,
        start: startStr,
        end: endStr,
        user: appointment.user.username
      };
    });

    return NextResponse.json(calendarEvents);
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
    const { appointments } = body;

    if (!appointments || !Array.isArray(appointments)) {
      return NextResponse.json(
        { error: 'Liste de rendez-vous requise' },
        { status: 400 }
      );
    }

    // Pour l'instant, on utilise un utilisateur par défaut (admin)
    // Dans un vrai scénario, on récupérerait l'utilisateur connecté
    const defaultUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });

    if (!defaultUser) {
      return NextResponse.json(
        { error: 'Aucun utilisateur trouvé' },
        { status: 400 }
      );
    }

    const createdAppointments = [];

    for (const appointmentData of appointments) {
      const { date, time, service, name, email, phone, guests, message } = appointmentData;

      // Combiner date et heure
      const appointmentDate = new Date(`${date}T${time}`);

      const appointment = await prisma.appointment.create({
        data: {
          title: service ? `Réservation ${service}` : 'Réservation',
          description: message || null,
          date: appointmentDate,
          duration: 60, // Durée par défaut
          userId: defaultUser.id,
          clientName: name || null,
          clientEmail: email || null,
          clientPhone: phone || null,
          clientMessage: message || null
        }
      });

      createdAppointments.push(appointment);
    }

    return NextResponse.json({
      success: true,
      appointments: createdAppointments,
      message: `${createdAppointments.length} rendez-vous créés avec succès`
    });
  } catch (error) {
    console.error('Erreur lors de la création des rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
