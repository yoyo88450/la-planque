import { NextRequest, NextResponse } from 'next/server';
import { mockReservations } from '../../../data/mockData';

// GET /api/reservations - Get all reservations
export async function GET() {
  try {
    return NextResponse.json(mockReservations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reservations' },
      { status: 500 }
    );
  }
}

// POST /api/reservations - Create a new reservation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Basic validation
    const requiredFields = ['date', 'time', 'name', 'email', 'phone', 'guests'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field ${field} is required` },
          { status: 400 }
        );
      }
    }

    // Create new reservation
    const newReservation = {
      id: Date.now().toString(),
      date: body.date,
      time: body.time,
      name: body.name,
      email: body.email,
      phone: body.phone,
      guests: parseInt(body.guests),
      message: body.message || ''
    };

    // In a real app, this would be saved to a database
    mockReservations.push(newReservation);

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    );
  }
}
