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
  client: String,
  episodeTitle: String,
  invoicedAmount: Number,
  dateInvoiced: Date
}, { collection: 'invoices' });

const Invoice = mongoose.model('Invoice', InvoiceSchema);

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const idToCheck = '6782814311780a797ea1edd2';
    console.log(`\nChecking for invoices with client ID: ${idToCheck}`);
    
    const invoices = await Invoice.find({ 
      clientId: new mongoose.Types.ObjectId(idToCheck)
    }).select('client episodeTitle invoicedAmount dateInvoiced');

    if (invoices.length > 0) {
      console.log(`Found ${invoices.length} invoices:`);
      invoices.forEach(inv => {
        const date = inv.dateInvoiced ? new Date(inv.dateInvoiced).toLocaleDateString() : 'Not invoiced';
        console.log(`- ${inv.client}: ${inv.episodeTitle} ($${inv.invoicedAmount}) - ${date}`);
      });
    } else {
      console.log('No invoices found with this ID');
    }

    console.log('\nCheck completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main(); 