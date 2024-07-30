"use client";
import { FC } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { CheckoutForm } from '@/app/components';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Credits: FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <main className="flex items-center">
        <CheckoutForm className="w-80" />
      </main>
    </Elements>
  );
};

export default Credits;
