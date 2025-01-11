import { connectToDatabase } from '../lib/utils/db';
import { Client } from '../lib/models/client';
import { Invoice } from '../lib/models/invoice';

async function main() {
  await connectToDatabase();

  const clientUpdates = [
    {
      keepId: '6782814311780a797ea1edd1', // Making Movies is Hard (keep)
      deleteId: '678280e9b7e1a6a765699a68', // Making Movies is Hard (delete)
      name: 'Making Movies is Hard'
    },
    {
      keepId: '6782814311780a797ea1edd3', // Just Screen It (keep)
      deleteId: '678280e9b7e1a6a765699a6a', // Just Screen It (delete)
      name: 'Just Screen It'
    }
  ];

  try {
    for (const update of clientUpdates) {
      console.log(`Processing ${update.name}...`);
      
      // 1. Update all invoices that reference the old client ID
      const updateResult = await Invoice.updateMany(
        { clientId: update.deleteId },
        { $set: { clientId: update.keepId } }
      );
      
      console.log(`Updated ${updateResult.modifiedCount} invoices for ${update.name}`);

      // 2. Delete the duplicate client document
      const deleteResult = await Client.deleteOne({ _id: update.deleteId });
      
      if (deleteResult.deletedCount === 1) {
        console.log(`Deleted duplicate client document for ${update.name}`);
      } else {
        console.log(`No duplicate client document found for ${update.name}`);
      }
    }

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }

  process.exit(0);
}

main(); 