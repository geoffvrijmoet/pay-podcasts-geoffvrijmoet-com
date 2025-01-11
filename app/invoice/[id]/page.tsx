import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/utils/db';
import { Invoice, IInvoice } from '@/lib/models/invoice';
import { createPaymentIntent } from '@/lib/utils/stripe';
import { PaymentForm } from '@/components/payment-form';
import { formatCurrency } from '@/lib/format';

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

    if (invoice.datePaid) {
      // Invoice is already paid
      return (
        <div className="max-w-2xl mx-auto p-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h1 className="text-green-800 text-xl font-semibold">Invoice Paid</h1>
            <p className="text-green-700 mt-1">This invoice was paid on {new Date(invoice.datePaid).toLocaleDateString()}</p>
          </div>
          <InvoiceDetails invoice={invoice} />
        </div>
      );
    }

    const paymentIntent = await createPaymentIntent(invoice.invoicedAmount, 'USD');

    return (
      <div className="max-w-2xl mx-auto p-4">
        <InvoiceDetails invoice={invoice} />
        <div className="mt-8">
          <PaymentForm 
            clientSecret={paymentIntent.client_secret!}
            amount={invoice.invoicedAmount}
            currency="USD"
          />
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

function InvoiceDetails({ invoice }: { invoice: IInvoice }) {
  return (
    <div className="bg-white border rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Invoice Details</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold text-gray-700">Client</h2>
          <p className="text-gray-600">{invoice.client}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-700">Episode</h2>
          <p className="text-gray-600">{invoice.episodeTitle}</p>
        </div>

        <div>
          <h2 className="font-semibold text-gray-700">Amount</h2>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(invoice.invoicedAmount)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold text-gray-700">Billed Minutes</h2>
            <p className="text-gray-600">{invoice.billedMinutes} minutes</p>
          </div>
          
          <div>
            <h2 className="font-semibold text-gray-700">Rate per Minute</h2>
            <p className="text-gray-600">{formatCurrency(invoice.ratePerMinute)}/min</p>
          </div>
        </div>

        {invoice.note && (
          <div>
            <h2 className="font-semibold text-gray-700">Note</h2>
            <p className="text-gray-600">{invoice.note}</p>
          </div>
        )}

        <div>
          <h2 className="font-semibold text-gray-700">Invoice Date</h2>
          <p className="text-gray-600">
            {invoice.dateInvoiced ? new Date(invoice.dateInvoiced).toLocaleDateString() : 'Not yet invoiced'}
          </p>
        </div>
      </div>
    </div>
  );
} 