import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/utils/db';
import { Invoice, IInvoice } from '@/lib/models/invoice';
import { Client, IRate } from '@/lib/models/client';
import { createPaymentIntent } from '@/lib/utils/stripe';
import { PaymentForm } from '@/components/payment-form';
import { formatCurrency } from '@/lib/format';

function getInvoiceCalculation(invoice: IInvoice, clientRates: IRate[]) {
  const matchingRate = clientRates.find(rate => rate.episodeType === invoice.type);
  
  if (!matchingRate) {
    return `${formatCurrency(invoice.invoicedAmount)}`;
  }

  switch (matchingRate.rateType) {
    case 'Per delivered minute':
      return `${invoice.billedMinutes} minutes @ ${formatCurrency(matchingRate.rate)}/minute`;
    case 'Hourly':
      return `${invoice.billableHours} hours @ ${formatCurrency(matchingRate.rate)}/hour`;
    case 'Flat rate':
      return 'Flat fee';
    default:
      return `${formatCurrency(invoice.invoicedAmount)}`;
  }
}

function InvoiceDetails({ invoice, clientRates }: { invoice: IInvoice; clientRates: IRate[] }) {
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-gray-400 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <span className="text-blue-400">{invoice.client}</span>
          <span className="hidden md:inline text-gray-500">•</span>
          <span>{invoice.episodeTitle}</span>
          <span className="hidden md:inline text-gray-500">•</span>
          <span>{invoice.dateInvoiced ? new Date(invoice.dateInvoiced).toLocaleDateString() : 'Not yet invoiced'}</span>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {formatCurrency(invoice.invoicedAmount)}
        </h2>
        <p className="text-gray-400">
          {getInvoiceCalculation(invoice, clientRates)}
        </p>
        {invoice.note && (
          <p className="text-gray-400 mt-2 text-sm">
            Note: {invoice.note}
          </p>
        )}
      </div>
    </div>
  );
}

export default async function InvoicePage({ params }: { params: { id: string } }) {
  if (!params.id) {
    notFound();
  }

  try {
    await connectToDatabase();
    const invoice = await Invoice.findById(params.id);

    if (!invoice) {
      notFound();
    }

    // Fetch client data to get rates
    const clientDoc = await Client.findById(invoice.clientId);
    
    if (!clientDoc) {
      console.error('Client not found:', invoice.clientId);
      notFound();
    }

    // Debug logging
    console.log('Invoice details:', {
      id: invoice._id.toString(),
      client: invoice.client,
      clientId: invoice.clientId.toString(),
      type: invoice.type,
      billedMinutes: invoice.billedMinutes,
      billableHours: invoice.billableHours,
      invoicedAmount: invoice.invoicedAmount
    });

    // Access rates directly from the Mongoose document
    const clientRates = clientDoc.get('rates') || [];

    console.log('Client document:', {
      id: clientDoc._id.toString(),
      name: clientDoc.get('name'),
      hasRatesArray: Array.isArray(clientRates),
      ratesCount: clientRates.length,
      rates: JSON.stringify(clientRates, null, 2)
    });

    const matchingRate = clientRates.find((rate: IRate) => rate.episodeType === invoice.type);
    console.log('Matching rate:', matchingRate || 'No matching rate found');

    if (invoice.datePaid) {
      // Invoice is already paid
      return (
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h1 className="text-green-800 text-xl font-semibold">Invoice Paid</h1>
            <p className="text-green-700 mt-1">This invoice was paid on {new Date(invoice.datePaid).toLocaleDateString()}</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg">
            <InvoiceDetails invoice={invoice} clientRates={clientRates} />
          </div>
        </div>
      );
    }

    const paymentIntent = await createPaymentIntent(invoice.invoicedAmount, 'USD');

    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg">
            <InvoiceDetails invoice={invoice} clientRates={clientRates} />
          </div>
          
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
            <PaymentForm 
              clientSecret={paymentIntent.client_secret!}
              amount={invoice.invoicedAmount}
              currency="USD"
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading invoice:', error);
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h1 className="text-red-800 text-xl font-semibold">Error</h1>
          <p className="text-red-700 mt-1">Unable to load invoice. Please try again later.</p>
        </div>
      </div>
    );
  }
} 