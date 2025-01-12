'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from './ui/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  amount: number;
  currency: string;
  invoiceId: string;
}

function CheckoutForm({ amount, currency }: { amount: number; currency: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message ?? 'An error occurred');
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      },
    });

    if (error) {
      setErrorMessage(error.message ?? 'An error occurred');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement 
        className="payment-element"
        options={{
          layout: {
            type: 'tabs',
            defaultCollapsed: false,
          },
        }}
      />

      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        disabled={!stripe || isLoading}
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}

export function PaymentForm({ amount, currency, invoiceId }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        invoiceId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        setError(err.message ?? 'Failed to initialize payment');
      });
  }, [amount, currency, invoiceId]);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-400">
          Loading payment form...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'night',
            variables: {
              colorPrimary: '#3B82F6',
              colorBackground: '#1F2937',
              colorText: '#F3F4F6',
              colorDanger: '#EF4444',
              fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
              spacingUnit: '4px',
              borderRadius: '6px',
            },
            rules: {
              '.Input': {
                border: '1px solid #374151',
                boxShadow: 'none',
              },
              '.Input:focus': {
                border: '1px solid #3B82F6',
                boxShadow: '0 0 0 1px #3B82F6',
              },
              '.Tab': {
                border: '1px solid #374151',
                backgroundColor: '#1F2937',
              },
              '.Tab:hover': {
                color: '#F3F4F6',
                border: '1px solid #4B5563',
              },
              '.Tab--selected': {
                border: '1px solid #3B82F6',
                backgroundColor: '#1F2937',
              },
              '.Label': {
                color: '#9CA3AF',
              },
            },
          },
        }}
      >
        <CheckoutForm amount={amount} currency={currency} />
      </Elements>
    </div>
  );
} 