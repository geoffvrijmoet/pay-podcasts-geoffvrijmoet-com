'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function PaymentStatusContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    if (paymentIntentId) {
      fetch(`/api/payments/verify?payment_intent=${paymentIntentId}`)
        .then((res) => res.json())
        .then((data) => {
          setStatus(data.success ? 'success' : 'error');
        })
        .catch(() => setStatus('error'));
    }
  }, [paymentIntentId]);

  return (
    <Card className="p-6 text-center">
      {status === 'loading' && (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">Verifying Payment...</h1>
          <p>Please wait while we confirm your payment.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-green-600">Payment Successful!</h1>
          <p>Thank you for your payment. A confirmation email has been sent.</p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-red-600">Payment Error</h1>
          <p>There was an issue confirming your payment. Please contact support.</p>
          <Button asChild variant="outline">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      )}
    </Card>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="max-w-md mx-auto p-4">
      <Suspense fallback={
        <Card className="p-6 text-center">
          <div className="space-y-4">
            <h1 className="text-xl font-bold">Loading...</h1>
            <p>Please wait while we load the payment status.</p>
          </div>
        </Card>
      }>
        <PaymentStatusContent />
      </Suspense>
    </div>
  );
} 