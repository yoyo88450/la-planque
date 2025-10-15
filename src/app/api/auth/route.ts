import { NextRequest, NextResponse } from 'next/server';

// POST /api/auth/login - Simple authentication
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Simple password check - in production, use proper authentication
    if (password === 'admin123') {
      return NextResponse.json({
        success: true,
        message: 'Authentication successful'
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
