import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Define Client Schema
const ClientSchema = new mongoose.Schema({
  rates: [{
    episodeType: { 
      type: String,
      enum: ['Podcast', 'Podcast video', 'Other']
    },
    rateType: {
      type: String,
      enum: ['Hourly', 'Flat rate', 'Per delivered minute']
    },
    rate: Number
  }]
}, { collection: 'clients' });

const Client = mongoose.model('Client', ClientSchema);

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const clientUpdates = [
      {
        id: '6782814311780a797ea1edd1', // Making Movies is Hard
        rates: [{
          episodeType: 'Podcast',
          rateType: 'Flat rate',
          rate: 75
        }]
      },
      {
        id: '6782814311780a797ea1edd3', // Just Screen It
        rates: [{
          episodeType: 'Podcast',
          rateType: 'Per delivered minute',
          rate: 1.50
        }]
      }
    ];

    for (const client of clientUpdates) {
      const result = await Client.findByIdAndUpdate(
        client.id,
        { $set: { rates: client.rates } },
        { new: true }
      );

      if (result) {
        console.log(`\nSuccessfully updated rates for client ${result._id}:`);
        console.log(JSON.stringify(result.rates, null, 2));
      } else {
        console.log(`\nClient not found with ID: ${client.id}`);
      }
    }

    console.log('\nAll updates completed');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main(); 