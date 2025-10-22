import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to refresh Google access token
async function refreshGoogleToken(settings: any) {
  if (!settings.googleRefreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: settings.googleClientId,
      client_client_secret: settings.googleClientSecret,
      refresh_token: settings.googleRefreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh Google token');
  }

  const tokens = await response.json();

  // Update the access token in database
  await prisma.settings.update({
    where: { id: settings.id },
    data: { googleAccessToken: tokens.access_token },
  });

  return tokens.access_token;
}

// Helper function to sync appointment to Google Calendar
async function syncAppointmentToGoogle(appointment: any) {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings?.googleAccessToken || !settings.googleCalendarId) {
      console.log('Google Calendar not configured, skipping sync');
      return;
    }

    let accessToken = settings.googleAccessToken;

    const clientName = appointment.clientName || 'Client';
    const eventData = {
      summary: `${appointment.title} - ${clientName}`,
      description: appointment.description || `Client: ${appointment.clientName || 'N/A'}\nEmail: ${appointment.clientEmail || 'N/A'}\nPhone: ${appointment.clientPhone || 'N/A'}\nMessage: ${appointment.clientMessage || 'N/A'}`,
      start: {
        dateTime: appointment.date.toISOString(),
        timeZone: 'Europe/Paris'
      },
      end: {
        dateTime: new Date(appointment.date.getTime() + appointment.duration * 60000).toISOString(),
        timeZone: 'Europe/Paris'
      }
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      }
    );

    if (response.status === 401) {
      accessToken = await refreshGoogleToken(settings);
      const retryResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!retryResponse.ok) {
        throw new Error(`Failed to create event after token refresh: ${retryResponse.status}`);
      }

      const eventResult = await retryResponse.json();
      // Store the Google event ID
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { googleEventId: eventResult.id } as any
      });
    } else if (!response.ok) {
      throw new Error(`Failed to create event: ${response.status}`);
    } else {
      const eventResult = await response.json();
      // Store the Google event ID
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { googleEventId: eventResult.id } as any
      });
    }

    console.log(`Synced appointment ${appointment.id} to Google Calendar`);
  } catch (error) {
    console.error('Error syncing appointment to Google Calendar:', error);
    // Don't fail the appointment creation if sync fails
  }
}

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

    // Sync to Google Calendar after creation
    await syncAppointmentToGoogle(appointment);

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
