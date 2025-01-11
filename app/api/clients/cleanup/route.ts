import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/utils/db';
import { Invoice } from '@/lib/models/invoice';

export async function POST() {
  try {
    await connectToDatabase();

    const clientUpdates = [
      {
        keepId: '6782814311780a797ea1edd1', // Making Movies is Hard (keep)
        oldId: '678280e9b7e1a6a765699a68',  // Making Movies is Hard (old)
        name: 'Making Movies is Hard'
      },
      {
        keepId: '6782814311780a797ea1edd3', // Just Screen It (keep)
        oldId: '678280e9b7e1a6a765699a6a',  // Just Screen It (old)
        name: 'Just Screen It'
      }
    ];

    const results = [];

    for (const update of clientUpdates) {
      // Update all invoices that reference the old client ID
      const updateResult = await Invoice.updateMany(
        { clientId: update.oldId },
        { $set: { clientId: update.keepId } }
      );

      results.push({
        name: update.name,
        updatedInvoices: updateResult.modifiedCount
      });
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error updating invoice references:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice references' },
      { status: 500 }
    );
  }
} 