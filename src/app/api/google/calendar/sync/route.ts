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

// Process events from Google Calendar (similar to webhook logic)
async function processEventsFromGoogle(events: any[], accessToken: string) {
  const results = {
    synced: 0,
    failed: 0,
    errors: [] as string[]
  };

  for (const event of events) {
    try {
      // Skip cancelled events
      if (event.status === 'cancelled') {
        continue;
      }

      // Check if this event corresponds to an existing appointment
      const existingAppointment = await prisma.appointment.findFirst({
        where: { googleEventId: event.id }
      });

      if (existingAppointment) {
        // Update existing appointment
        const startDate = new Date(event.start.dateTime || event.start.date);
        const endDate = new Date(event.end.dateTime || event.end.date);
        const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60)); // in minutes

        await prisma.appointment.update({
          where: { id: existingAppointment.id },
          data: {
            title: event.summary || 'Appointment',
            description: event.description || '',
            date: startDate,
            duration: duration,
            updatedAt: new Date()
          }
        });

        console.log(`Updated appointment from Google Calendar: ${existingAppointment.id}`);
      } else {
        // Create new appointment for ALL Google Calendar events
        const startDate = new Date(event.start.dateTime || event.start.date);
        const endDate = new Date(event.end.dateTime || event.end.date);
        const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));

        // Parse client info from description if available
        const description = event.description || '';
        const clientNameMatch = description.match(/Client: ([^\n]*)/);
        const emailMatch = description.match(/Email: ([^\n]*)/);
        const phoneMatch = description.match(/Phone: ([^\n]*)/);
        const messageMatch = description.match(/Message: ([^\n]*)/);

        await prisma.appointment.create({
          data: {
            title: event.summary || 'Appointment',
            description: description,
            date: startDate,
            duration: duration,
            clientName: clientNameMatch ? clientNameMatch[1].trim() : null,
            clientEmail: emailMatch ? emailMatch[1].trim() : null,
            clientPhone: phoneMatch ? phoneMatch[1].trim() : null,
            clientMessage: messageMatch ? messageMatch[1].trim() : null,
            googleEventId: event.id
          }
        });

        console.log(`Created new appointment from Google Calendar: ${event.id}`);
      }

      results.synced++;
    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error);
      results.errors.push(`Event ${event.id}: ${error.message}`);
      results.failed++;
    }
  }

  return results;
}

// Sync appointments bidirectionally: database to Google Calendar and Google Calendar to database
export async function POST(request: NextRequest) {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings?.googleAccessToken || !settings.googleCalendarId) {
      return NextResponse.json(
        { error: 'Google Calendar not configured' },
        { status: 400 }
      );
    }

    let accessToken = settings.googleAccessToken;

    const results = {
      toGoogle: { synced: 0, failed: 0, errors: [] as string[] },
      fromGoogle: { synced: 0, failed: 0, errors: [] as string[] }
    };

    // First, sync from database to Google Calendar
    // Get all appointments (not just recent ones)
    const appointments = await prisma.appointment.findMany({
      orderBy: { date: 'asc' }
    });

    for (const appointment of appointments) {
      try {
        // Check if event already exists in Google Calendar
        if ((appointment as any).googleEventId) {
          // Update existing event
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
            `https://www.googleapis.com/calendar/v3/calendars/${(settings as any).googleCalendarId}/events/${(appointment as any).googleEventId}`,
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
              `https://www.googleapis.com/calendar/v3/calendars/${(settings as any).googleCalendarId}/events/${(appointment as any).googleEventId}`,
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
        } else {
          // Create new event in Google Calendar
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
            `https://www.googleapis.com/calendar/v3/calendars/${(settings as any).googleCalendarId}/events`,
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
              `https://www.googleapis.com/calendar/v3/calendars/${(settings as any).googleCalendarId}/events`,
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
        }

        results.toGoogle.synced++;
      } catch (error: any) {
        console.error(`Error syncing appointment ${appointment.id}:`, error);
        results.toGoogle.errors.push(`Appointment ${appointment.id}: ${error.message}`);
        results.toGoogle.failed++;
      }
    }

    // Then, sync from Google Calendar to database
    // Get ALL events from Google Calendar (not just recent ones)
    // We'll get events from the past and future to ensure complete sync
    const timeMin = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year ago
    const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year from now

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${(settings as any).googleCalendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 401) {
      accessToken = await refreshGoogleToken(settings);
      const retryResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${(settings as any).googleCalendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!retryResponse.ok) {
        throw new Error('Failed to fetch events after token refresh');
      }

      const eventsData = await retryResponse.json();
      const fromGoogleResults = await processEventsFromGoogle(eventsData.items || [], accessToken);
      results.fromGoogle = fromGoogleResults;
    } else if (response.ok) {
      const eventsData = await response.json();
      const fromGoogleResults = await processEventsFromGoogle(eventsData.items || [], accessToken);
      results.fromGoogle = fromGoogleResults;
    } else {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${results.toGoogle.synced} appointments to Google, ${results.fromGoogle.synced} events from Google. Failed: ${results.toGoogle.failed + results.fromGoogle.failed}`,
      results
    });

  } catch (error) {
    console.error('Error syncing to Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to sync appointments' },
      { status: 500 }
    );
  }
}

// Get calendar list to help user select a calendar
export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings?.googleAccessToken) {
      return NextResponse.json(
        { error: 'Google not authenticated' },
        { status: 400 }
      );
    }

    let accessToken = settings.googleAccessToken;

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 401) {
      // Try to refresh token
      try {
        accessToken = await refreshGoogleToken(settings);
        const retryResponse = await fetch(
          'https://www.googleapis.com/calendar/v3/users/me/calendarList',
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!retryResponse.ok) {
          throw new Error('Failed to get calendars after token refresh');
        }

        const data = await retryResponse.json();
        return NextResponse.json(data);
      } catch (refreshError) {
        return NextResponse.json(
          { error: 'Failed to refresh token and get calendars' },
          { status: 401 }
        );
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to get calendars: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error getting Google calendars:', error);
    return NextResponse.json(
      { error: 'Failed to get calendars' },
      { status: 500 }
    );
  }
}
