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
      client_secret: settings.googleClientSecret,
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

// Helper function to sync appointment update to Google Calendar
async function syncAppointmentUpdateToGoogle(appointment: any) {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings?.googleAccessToken || !settings.googleCalendarId || !appointment.googleEventId) {
      console.log('Google Calendar not configured or no event ID, skipping sync');
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
      `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events/${appointment.googleEventId}`,
      {
        method: 'PUT',
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
        `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events/${appointment.googleEventId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        }
      );

      if (!retryResponse.ok) {
        throw new Error(`Failed to update event after token refresh: ${retryResponse.status}`);
      }
    } else if (!response.ok) {
      throw new Error(`Failed to update event: ${response.status}`);
    }

    console.log(`Updated appointment ${appointment.id} in Google Calendar`);
  } catch (error) {
    console.error('Error syncing appointment update to Google Calendar:', error);
    // Don't fail the appointment update if sync fails
  }
}

// Helper function to delete appointment from Google Calendar
async function syncAppointmentDeleteFromGoogle(appointment: any) {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings?.googleAccessToken || !settings.googleCalendarId || !appointment.googleEventId) {
      console.log('Google Calendar not configured or no event ID, skipping sync');
      return;
    }

    let accessToken = settings.googleAccessToken;

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events/${appointment.googleEventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 401) {
      accessToken = await refreshGoogleToken(settings);
      const retryResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events/${appointment.googleEventId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!retryResponse.ok && retryResponse.status !== 410) { // 410 Gone is OK for deleted events
        throw new Error(`Failed to delete event after token refresh: ${retryResponse.status}`);
      }
    } else if (!response.ok && response.status !== 410) {
      throw new Error(`Failed to delete event: ${response.status}`);
    }

    console.log(`Deleted appointment ${appointment.id} from Google Calendar`);
  } catch (error) {
    console.error('Error syncing appointment deletion to Google Calendar:', error);
    // Don't fail the appointment deletion if sync fails
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, date, duration, clientName, clientEmail, clientPhone, clientMessage } = body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined,
        date: date ? new Date(date) : undefined,
        duration: duration || undefined,
        clientName: clientName || undefined,
        clientEmail: clientEmail || undefined,
        clientPhone: clientPhone || undefined,
        clientMessage: clientMessage || undefined
      }
    });

    // Sync update to Google Calendar
    await syncAppointmentUpdateToGoogle(appointment);

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Erreur lors de la modification du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the appointment before deleting to sync with Google Calendar
    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (appointment) {
      // Sync deletion to Google Calendar
      await syncAppointmentDeleteFromGoogle(appointment);
    }

    await prisma.appointment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
