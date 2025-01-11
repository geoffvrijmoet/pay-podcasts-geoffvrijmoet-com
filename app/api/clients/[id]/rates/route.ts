import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils/db';
import { Client, IRate } from '@/lib/models/client';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const rates: IRate[] = [
      {
        episodeType: 'Podcast',
        rateType: 'Per delivered minute',
        rate: 1.25
      },
      {
        episodeType: 'Podcast video',
        rateType: 'Hourly',
        rate: 47
      }
    ];

    const updatedClient = await Client.findByIdAndUpdate(
      params.id,
      { $set: { rates } },
      { new: true }
    );

    if (!updatedClient) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client rates:', error);
    return NextResponse.json(
      { error: 'Failed to update client rates' },
      { status: 500 }
    );
  }
} 