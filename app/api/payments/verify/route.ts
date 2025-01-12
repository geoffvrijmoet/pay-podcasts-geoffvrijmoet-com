import { NextResponse } from 'next/server';
import { stripe } from '@/lib/utils/stripe';
import { Invoice } from '@/lib/models/invoice';
import { connectToDatabase } from '@/lib/utils/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paymentIntentId = searchParams.get('payment_intent');

  if (!paymentIntentId) {
    return NextResponse.json({ error: 'Missing payment_intent' }, { status: 400 });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === 'succeeded') {
      await connectToDatabase();
      
      // Update invoice status
      await Invoice.findByIdAndUpdate(
        paymentIntent.metadata?.invoiceId,
        { 
          $set: { 
            datePaid: new Date(),
            paymentMethod: paymentIntent.payment_method_types?.[0] || 'card'
          } 
        }
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
} 