import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { connectToDatabase } from '@/lib/utils/db';
import { Client } from '@/lib/models/client';
import { Invoice } from '@/lib/models/invoice';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { PipelineStage, Types } from 'mongoose';
import { formatCurrency } from '@/lib/format';

interface BaseInvoiceResult {
  hasDateInvoiced: number;
  sortDate: Date;
  episodeTitle: string;
  dateInvoiced: Date | null;
  earnedAfterFees: number;
  datePaid: Date | null;
}

interface InvoiceResult extends BaseInvoiceResult {
  _id: string;
}

type MongoAggregateResult = {
  _id: { toString(): string };
  hasDateInvoiced: number;
  sortDate: Date;
  episodeTitle: string;
  dateInvoiced: Date | null;
  earnedAfterFees: number;
  datePaid: Date | null;
};

async function getClientInvoices(email: string): Promise<InvoiceResult[]> {
  await connectToDatabase();
  
  const aggregation: PipelineStage[] = [
    {
      $project: {
        _id: 1,
        hasDateInvoiced: { 
          $cond: { 
            if: { $eq: ["$dateInvoiced", null] }, 
            then: 0, 
            else: 1 
          }
        },
        sortDate: { $ifNull: ["$dateInvoiced", "$createdAt"] },
        episodeTitle: 1,
        dateInvoiced: 1,
        earnedAfterFees: 1,
        datePaid: 1
      }
    },
    {
      $sort: { 
        hasDateInvoiced: -1 as const,
        sortDate: -1 as const
      }
    }
  ];

  if (email === 'hello@geoffvrijmoet.com') {
    const results = await Invoice.aggregate(aggregation) as MongoAggregateResult[];
    return results.map(doc => ({
      hasDateInvoiced: doc.hasDateInvoiced,
      sortDate: doc.sortDate,
      episodeTitle: doc.episodeTitle,
      dateInvoiced: doc.dateInvoiced,
      earnedAfterFees: doc.earnedAfterFees,
      datePaid: doc.datePaid,
      _id: doc._id.toString()
    }));
  }
  
  const client = await Client.findOne({ email }).lean();
  if (!client) return [];

  const results = await Invoice.aggregate([
    { 
      $match: { 
        clientId: new Types.ObjectId(client._id) 
      } 
    },
    ...aggregation
  ]) as MongoAggregateResult[];

  return results.map(doc => ({
    hasDateInvoiced: doc.hasDateInvoiced,
    sortDate: doc.sortDate,
    episodeTitle: doc.episodeTitle,
    dateInvoiced: doc.dateInvoiced,
    earnedAfterFees: doc.earnedAfterFees,
    datePaid: doc.datePaid,
    _id: doc._id.toString()
  }));
}

export default async function HomePage() {
  const session = await auth();
  
  if (!session.userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const invoices = await getClientInvoices(user?.emailAddresses[0].emailAddress ?? '');

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Your Invoices</h1>
      </div>

      {invoices.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No invoices found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => {
            console.log('Rendering invoice:', {
              id: invoice._id,
              title: invoice.episodeTitle,
              date: invoice.dateInvoiced,
              amount: invoice.earnedAfterFees,
              datePaid: invoice.datePaid
            });
            
            return (
              <Link 
                key={(invoice._id as { toString(): string }).toString()} 
                href={`/invoice/${invoice._id}`}
                className="block"
              >
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{invoice.episodeTitle || 'Untitled Episode'}</p>
                      <p className="text-sm text-gray-500">
                        {invoice.dateInvoiced ? new Date(invoice.dateInvoiced).toLocaleDateString() : 'No date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(invoice.earnedAfterFees || 0)}
                      </p>
                      <span className={`
                        inline-block px-2 py-1 text-xs rounded-full
                        ${invoice.datePaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      `}>
                        {invoice.datePaid ? 'Paid' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
