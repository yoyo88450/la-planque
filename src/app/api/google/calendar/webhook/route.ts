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

// Webhook endpoint for Google Calendar push notifications
export async function POST(request: NextRequest) {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings?.googleAccessToken || !settings.googleCalendarId) {
      return NextResponse.json(
        { error: 'Google Calendar not configured' },
        { status: 400 }
      );
    }

    // Get the channel ID from headers (Google sends this)
    const channelId = request.headers.get('X-Goog-Channel-ID');
    const resourceId = request.headers.get('X-Goog-Resource-ID');
    const resourceState = request.headers.get('X-Goog-Resource-State');

    console.log('Google Calendar webhook received:', {
      channelId,
      resourceId,
      resourceState
    });

    // If this is a sync message, fetch recent events
    if (resourceState === 'sync') {
      console.log('Initial sync message received');
      return NextResponse.json({ status: 'sync_acknowledged' });
    }

    // Fetch recent events from Google Calendar
    let accessToken = settings.googleAccessToken;

    // Get events from the last 24 hours to catch any changes
    const timeMin = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 401) {
      accessToken = await refreshGoogleToken(settings);
      const retryResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime`,
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
      await processEvents(eventsData.items || []);
    } else if (response.ok) {
      const eventsData = await response.json();
      await processEvents(eventsData.items || []);
    } else {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    return NextResponse.json({ status: 'processed' });

  } catch (error) {
    console.error('Error processing Google Calendar webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Process events from Google Calendar
async function processEvents(events: any[]) {
  for (const event of events) {
    try {
      // Skip cancelled events
      if (event.status === 'cancelled') {
        // If we have a corresponding appointment, we might want to delete it
        // For now, just skip
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

        console.log(`Updated appointment: ${existingAppointment.id}`);
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
    } catch (error) {
      console.error(`Error processing event ${event.id}:`, error);
    }
  }
}

// Endpoint to set up webhook (watch) for calendar changes
export async function PUT(request: NextRequest) {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings?.googleAccessToken || !settings.googleCalendarId) {
      return NextResponse.json(
        { error: 'Google Calendar not configured' },
        { status: 400 }
      );
    }

    let accessToken = settings.googleAccessToken;

    // Check if the URL is HTTPS (required for Google Calendar webhooks)
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const isHttps = baseUrl.startsWith('https://');

    if (!isHttps) {
      return NextResponse.json({
        error: 'Webhook setup requires HTTPS',
        message: 'Google Calendar webhooks require HTTPS URLs. For development, use manual sync instead.',
        suggestion: 'Use ngrok or similar tunneling service for webhook testing'
      }, { status: 400 });
    }

    // Set up webhook for calendar changes
    const webhookData = {
      id: `appointment-sync-${Date.now()}`, // Unique channel ID
      type: 'web_hook',
      address: `${baseUrl}/api/google/calendar/webhook`,
      token: 'webhook-token', // Optional token for verification
      expiration: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days from now
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events/watch`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      }
    );

    if (response.status === 401) {
      accessToken = await refreshGoogleToken(settings);
      const retryResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events/watch`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        }
      );

      if (!retryResponse.ok) {
        throw new Error('Failed to set up webhook after token refresh');
      }

      const result = await retryResponse.json();
      return NextResponse.json({
        success: true,
        message: 'Webhook set up successfully',
        channelId: result.id,
        resourceId: result.resourceId
      });
    }

    if (!response.ok) {
      throw new Error(`Failed to set up webhook: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Webhook set up successfully',
      channelId: result.id,
      resourceId: result.resourceId
    });

  } catch (error) {
    console.error('Error setting up Google Calendar webhook:', error);
    return NextResponse.json(
      { error: 'Failed to set up webhook' },
      { status: 500 }
    );
  }
}
