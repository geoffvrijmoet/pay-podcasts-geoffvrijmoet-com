import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/utils/db';
import { Invoice } from '@/lib/models/invoice';
import { createPaymentIntent } from '@/lib/utils/stripe';
import { PaymentForm } from '@/components/payment-form';

export default async function InvoicePage({ params }: { params: { id: string } }) {
  await connectToDatabase();
  const invoice = await Invoice.findById(params.id);

  if (!invoice) {
    notFound();
  }

  const paymentIntent = await createPaymentIntent(invoice.amount, invoice.currency);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Invoice Payment</h1>
      <div className="mb-6">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-gray-600">{invoice.description}</p>
        <p className="text-sm text-gray-500 mt-1">
          Due by: {new Date(invoice.dueDate).toLocaleDateString()}
        </p>
      </div>
      
      <PaymentForm 
        clientSecret={paymentIntent.client_secret!}
        amount={invoice.amount}
        currency={invoice.currency}
      />
    </div>
  );
} 