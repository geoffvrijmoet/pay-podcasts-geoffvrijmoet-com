import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe';
import { Invoice } from '@/lib/models/invoice';
import { Client } from '@/lib/models/client';
import { connectToDatabase } from '@/lib/utils/db';

export async function POST(request: Request) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Missing invoice ID' },
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

    // Get the client's email
    const client = await Client.findById(invoice.clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!invoice.stripeCustomerId) {
      // Create a new customer with the client's email
      const customer = await stripe.customers.create({
        email: client.email,
        metadata: {
          clientId: invoice.clientId.toString(),
        },
      });
      invoice.stripeCustomerId = customer.id;
      await invoice.save();
    }

    // Get the customer's saved payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: invoice.stripeCustomerId,
      type: 'card',
    });

    if (paymentMethods.data.length === 0) {
      return NextResponse.json(
        { error: 'No saved payment methods found' },
        { status: 400 }
      );
    }

    // Use the most recently added payment method
    const paymentMethod = paymentMethods.data[0];

    // Create and confirm the payment intent in one step
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(invoice.invoicedAmount * 100),
      currency: 'USD',
      customer: invoice.stripeCustomerId,
      payment_method: paymentMethod.id,
      off_session: true,
      confirm: true,
      metadata: {
        invoiceId: invoice._id.toString(),
      },
    });

    // Update invoice if payment was successful
    if (paymentIntent.status === 'succeeded') {
      await Invoice.findByIdAndUpdate(invoiceId, {
        datePaid: new Date(),
        paymentMethod: 'card',
      });

      return NextResponse.json({
        success: true,
        paymentIntent,
      });
    }

    return NextResponse.json({
      success: false,
      status: paymentIntent.status,
    });

  } catch (error) {
    console.error('Error charging saved card:', error);
    
    if (typeof error === 'object' && error !== null && 'type' in error) {
      const stripeError = error as { message: string; code?: string; type: string };
      return NextResponse.json({
        error: stripeError.message,
        code: stripeError.code,
        type: stripeError.type
      }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
} 
