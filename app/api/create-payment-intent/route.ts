import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe';
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

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        invoiceId,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 