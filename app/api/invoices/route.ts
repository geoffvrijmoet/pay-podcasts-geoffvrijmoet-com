import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils/db';
import { Invoice } from '@/lib/models/invoice';
import { Client } from '@/lib/models/client';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET() {
  try {
    await connectToDatabase();
    const session = await auth();
    
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0].emailAddress;

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    // Super user can see all invoices
    if (email === 'hello@geoffvrijmoet.com') {
      const invoices = await Invoice.find()
        .sort({ createdAt: -1 })
        .populate('clientId');
      return NextResponse.json(invoices);
    }

    // Regular user flow
    const client = await Client.findOne({ email });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const invoices = await Invoice.find({ clientId: client._id })
      .sort({ createdAt: -1 });

    return NextResponse.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const session = await auth();
    
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const user = await currentUser();
    const email = user?.emailAddresses[0].emailAddress;

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    // Find client by email
    const client = await Client.findOne({ email });

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Create invoice with client reference
    const invoice = new Invoice({
      ...data,
      clientId: client._id,
      status: 'pending',
    });

    await invoice.save();
    return NextResponse.json(invoice);
  } catch (err) {
    console.error('Error creating invoice:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 