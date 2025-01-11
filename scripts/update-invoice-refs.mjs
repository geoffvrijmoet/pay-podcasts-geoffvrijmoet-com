import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define Invoice Schema
const InvoiceSchema = new mongoose.Schema({
  clientId: mongoose.Schema.Types.ObjectId,
}, { collection: 'invoices' });

const Invoice = mongoose.model('Invoice', InvoiceSchema);

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

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

    for (const update of clientUpdates) {
      console.log(`Processing ${update.name}...`);
      
      const result = await Invoice.updateMany(
        { clientId: new mongoose.Types.ObjectId(update.oldId) },
        { $set: { clientId: new mongoose.Types.ObjectId(update.keepId) } }
      );

      console.log(`Updated ${result.modifiedCount} invoices for ${update.name}`);
    }

    // Double check the updates
    for (const update of clientUpdates) {
      const count = await Invoice.countDocuments({ clientId: new mongoose.Types.ObjectId(update.keepId) });
      console.log(`${update.name} now has ${count} invoices`);
    }

    console.log('All updates completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main(); 