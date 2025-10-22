import { NextRequest } from 'next/server';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Store active WebSocket connections
const clients = new Set<WebSocket>();

// Helper function to broadcast to all connected clients
function broadcast(message: any) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

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

// Sync appointments from Google Calendar to database
async function syncFromGoogleCalendar() {
  try {
    const settings = await prisma.settings.findFirst();

    if (!settings?.googleAccessToken || !settings.googleCalendarId) {
      console.log('Google Calendar not configured for sync');
      return;
    }

    let accessToken = settings.googleAccessToken;

    // Get events from the last 24 hours to catch any changes
    const timeMin = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events?timeMin=${timeMin}&singleEvents=true&orderBy=updated`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status === 401) {
      accessToken = await refreshGoogleToken(settings);
      const retryResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${settings.googleCalendarId}/events?timeMin=${timeMin}&singleEvents=true&orderBy=updated`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!retryResponse.ok) {
        throw new Error('Failed to fetch events after token refresh');
      }

      const data = await retryResponse.json();
      await processGoogleEvents(data.items || []);
    } else if (response.ok) {
      const data = await response.json();
      await processGoogleEvents(data.items || []);
    }

  } catch (error) {
    console.error('Error syncing from Google Calendar:', error);
  }
}

// Process Google Calendar events and sync to database
async function processGoogleEvents(events: any[]) {
  for (const event of events) {
    try {
      // Check if this event corresponds to an existing appointment
      const existingAppointment = await prisma.appointment.findFirst({
        where: { googleEventId: event.id }
      });

      if (existingAppointment) {
        // Update existing appointment
        await prisma.appointment.update({
          where: { id: existingAppointment.id },
          data: {
            title: event.summary || existingAppointment.title,
            description: event.description || existingAppointment.description,
            date: new Date(event.start.dateTime || event.start.date),
            duration: event.end && event.start ?
              Math.round((new Date(event.end.dateTime || event.end.date).getTime() -
                         new Date(event.start.dateTime || event.start.date).getTime()) / (1000 * 60)) :
              existingAppointment.duration,
            updatedAt: new Date()
          }
        });

        // Broadcast update to all clients
        broadcast({
          type: 'appointment_updated',
          appointment: {
            id: existingAppointment.id,
            title: event.summary || existingAppointment.title,
            date: event.start.dateTime || event.start.date,
            duration: event.end && event.start ?
              Math.round((new Date(event.end.dateTime || event.end.date).getTime() -
                         new Date(event.start.dateTime || event.start.date).getTime()) / (1000 * 60)) :
              existingAppointment.duration
          }
        });

      } else {
        // Create new appointment from Google Calendar event
        const newAppointment = await prisma.appointment.create({
          data: {
            title: event.summary || 'Appointment from Google Calendar',
            description: event.description || '',
            date: new Date(event.start.dateTime || event.start.date),
            duration: event.end && event.start ?
              Math.round((new Date(event.end.dateTime || event.end.date).getTime() -
                         new Date(event.start.dateTime || event.start.date).getTime()) / (1000 * 60)) :
              60, // Default 1 hour
            googleEventId: event.id
          }
        });

        // Broadcast new appointment to all clients
        broadcast({
          type: 'appointment_created',
          appointment: {
            id: newAppointment.id,
            title: newAppointment.title,
            date: newAppointment.date.toISOString(),
            duration: newAppointment.duration
          }
        });
      }
    } catch (error) {
      console.error(`Error processing Google Calendar event ${event.id}:`, error);
    }
  }
}

// WebSocket server setup
let wss: WebSocketServer | null = null;

export async function GET(request: NextRequest) {
  // Upgrade to WebSocket
  const upgradeHeader = request.headers.get('upgrade');

  if (upgradeHeader !== 'websocket') {
    return new Response('Expected websocket', { status: 400 });
  }

  // Create WebSocket server if it doesn't exist
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');
      clients.add(ws);

      // Send initial sync
      syncFromGoogleCalendar();

      ws.on('message', (message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received message:', data);

          // Handle different message types
          switch (data.type) {
            case 'sync_request':
              syncFromGoogleCalendar();
              break;
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
      });
    });

    // Set up periodic sync every 5 minutes
    setInterval(() => {
      syncFromGoogleCalendar();
    }, 5 * 60 * 1000);
  }

  // This is a simplified WebSocket upgrade handler
  // In a real Next.js app, you'd need to handle this at the server level
  return new Response('WebSocket upgrade required', { status: 426 });
}

// For HTTP requests, return server status
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'sync') {
      await syncFromGoogleCalendar();
      broadcast({ type: 'sync_completed' });
      return Response.json({ success: true, message: 'Sync initiated' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('WebSocket API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
