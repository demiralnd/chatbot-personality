import { NextRequest, NextResponse } from 'next/server';
import { trackConversion } from '@/lib/db-vercel';

export async function POST(request: NextRequest) {
  try {
    const { conversationId, productId, eventType, value } = await request.json();

    if (!conversationId || !productId || !eventType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = await trackConversion(conversationId, productId, eventType, value);

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Conversion tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to track conversion' },
      { status: 500 }
    );
  }
}