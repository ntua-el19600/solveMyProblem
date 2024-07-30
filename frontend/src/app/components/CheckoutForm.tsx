"use client";
import {FC, useState} from 'react';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import {useUser} from '@clerk/nextjs';
import {StripeCardElement} from '@stripe/stripe-js';
import {Button, Input} from '@mui/material';

export const CheckoutForm: FC<{className?: string}> = ({className}) => {
  const stripe = useStripe();
  const elements = useElements();
  const {user} = useUser();
  const [credits, setCredits] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    const cardElement = elements.getElement(CardElement) as StripeCardElement;

    if (!cardElement) {
      setError('Card Element not found');
      return;
    }

    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement
    });

    if (error) {
      setError(error.message || 'An unknown error occurred');
      return;
    }

    if (!paymentMethod) {
      setError('Failed to create payment method');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PAYMENT_ENDPOINT}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user.id,
            credits,
            paymentMethodId: paymentMethod.id
          })
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        setError(errorMessage || 'Failed to complete purchase');
        return;
      }

      const data = await response.json();
      console.log(data);
      setError(null);
    } catch (error) {
      setError('Failed to complete purchase');
      console.error('Error during purchase:', error);
    }
  };

  return (
    <form className={className} onSubmit={handlePurchase}>
      <h1 className="pb-2">Purchase Credits</h1>
      <Input
        className="mb-2"
        type="number"
        placeholder="Number of credits"
        value={credits}
        onChange={(e) => setCredits(Number(e.target.value))}
      />
      <CardElement className="w-full pb-2" />
      <Button type="submit" disabled={!stripe} variant="outlined">
        Purchase
      </Button>
      {error && <div>{error}</div>}
    </form>
  );
};
