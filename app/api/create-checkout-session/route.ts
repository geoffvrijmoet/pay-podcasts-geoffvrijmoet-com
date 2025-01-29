import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/utils/stripe';
import { Invoice } from '@/lib/models/invoice';
import { connectToDatabase } from '@/lib/utils/db';

export async function POST(request: Request) {
  try {
    const { amount, currency, invoiceId } = await request.json();

    if (!amount || !currency || !invoiceId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (invoice.datePaid) {
      return NextResponse.json(
        { error: 'Invoice has already been paid' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(amount, currency, invoiceId);

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 