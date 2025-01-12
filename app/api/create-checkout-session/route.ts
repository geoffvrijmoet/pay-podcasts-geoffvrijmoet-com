import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/utils/stripe';

export async function POST(request: Request) {
  try {
    const { amount, currency, invoiceId } = await request.json();

    if (!amount || !currency || !invoiceId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(amount, currency, invoiceId);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 