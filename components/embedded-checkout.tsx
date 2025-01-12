'use client';

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutProps {
  amount: number;
  currency: string;
  invoiceId: string;
}

export function EmbeddedCheckoutComponent({ amount, currency, invoiceId }: CheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          invoiceId,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        setErrorMessage(error.message ?? 'An error occurred');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-2xl font-bold">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
            }).format(amount)}
          </p>
        </div>

        {errorMessage && (
          <div className="text-red-500 text-sm mt-2">
            {errorMessage}
          </div>
        )}

        <Button
          onClick={handlePayment}
          className="w-full bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Pay Now'}
        </Button>
      </div>
    </Card>
  );
} 