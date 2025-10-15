import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Compter le nombre total de rendez-vous
    const totalAppointments = await prisma.appointment.count();

    // Compter les rendez-vous à venir
    const upcomingAppointments = await prisma.appointment.count({
      where: {
        date: {
          gte: new Date()
        }
      }
    });

    // Compter les rendez-vous passés
    const pastAppointments = await prisma.appointment.count({
      where: {
        date: {
          lt: new Date()
        }
      }
    });

    return NextResponse.json({
      totalAppointments,
      upcomingAppointments,
      pastAppointments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
