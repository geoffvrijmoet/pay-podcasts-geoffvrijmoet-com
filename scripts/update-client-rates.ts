import { updateClientRates } from '../lib/utils/db';
import type { IRate } from '../lib/models/client';

async function main() {
  const clientId = '678280e9b7e1a6a765699a69';
  
  const rates: IRate[] = [
    {
      episodeType: 'Podcast' as const,
      rateType: 'Per delivered minute' as const,
      rate: 1.25
    },
    {
      episodeType: 'Podcast video' as const,
      rateType: 'Hourly' as const,
      rate: 47
    }
  ];

  try {
    const updatedClient = await updateClientRates(clientId, rates);
    console.log('Successfully updated client rates:', updatedClient);
  } catch (error) {
    console.error('Error updating client rates:', error);
  }

  process.exit(0);
}

main(); 