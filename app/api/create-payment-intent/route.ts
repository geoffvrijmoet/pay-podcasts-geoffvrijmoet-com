import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe';
import { Invoice } from '@/lib/models/invoice';
import { connectToDatabase } from '@/lib/utils/db';
import type Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    const { amount, currency, invoiceId, saveCard } = await request.json();

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

    // Handle customer creation/retrieval
    let customerId = invoice.stripeCustomerId;
    
    if (!customerId) {
      // Create a new customer
      const customer = await stripe.customers.create({
        email: invoice.client,
        metadata: {
          clientId: invoice.clientId.toString(),
        },
      });
      customerId = customer.id;
      
      // Save the customer ID to the invoice
      await Invoice.findByIdAndUpdate(invoiceId, {
        stripeCustomerId: customerId,
      });
    }

    const paymentIntentData: Stripe.PaymentIntentCreateParams = {
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      metadata: {
        invoiceId,
      },
    };

    // If user wants to save the card, we'll set up future usage
    if (saveCard) {
      paymentIntentData.setup_future_usage = 'off_session';
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

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