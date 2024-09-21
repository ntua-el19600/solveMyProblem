'use client'
import {FC, useState} from 'react'
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js'
import {useUser} from '@clerk/nextjs'
import {StripeCardElement} from '@stripe/stripe-js'
import {Button, Input, Snackbar, Alert} from '@mui/material'

export const CheckoutForm: FC<{className?: string}> = ({className}) => {
  const stripe = useStripe()
  const elements = useElements()
  const {user} = useUser()
  const [credits, setCredits] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null) // New state for success notification

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements || !user) {
      return
    }

    const cardElement = elements.getElement(CardElement) as StripeCardElement

    if (!cardElement) {
      setError('Card Element not found')
      return
    }

    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement
    })

    if (error) {
      setError(error.message || 'An unknown error occurred')
      return
    }

    if (!paymentMethod) {
      setError('Failed to create payment method')
      return
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
      )

      if (!response.ok) {
        const errorMessage = await response.text()
        setError(errorMessage || 'Failed to complete purchase')
        return
      }

      const data = await response.json()
      console.log(data)
      setError(null)
      setSuccessMessage('Purchase successful!')
    } catch (error) {
      setError('Failed to complete purchase')
      console.error('Error during purchase:', error)
    }
  }

  return (
    <>
      <form className={className} onSubmit={handlePurchase}>
        <h1 className="pb-2 text-xl">Purchase Credits</h1>
        <Input
          className="mb-4"
          type="number"
          placeholder="Number of credits"
          value={credits}
          onChange={(e) => setCredits(Number(e.target.value))}
        />
        <CardElement className="w-full pb-4" />
        <Button type="submit" disabled={!stripe} variant="outlined">
          Purchase
        </Button>
        {error && <div>{error}</div>}
      </form>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
