'use client'
import {FC, useState} from 'react'
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js'
import {useUser} from '@clerk/nextjs'
import {StripeCardElement} from '@stripe/stripe-js'
import {Button, Input, Snackbar, Alert} from '@mui/material'
import {useUserContext} from '@/context/UserContext'

export const CheckoutForm: FC<{className?: string}> = ({className}) => {
  const stripe = useStripe()
  const elements = useElements()
  const {user} = useUser()
  const {refreshCredits} = useUserContext()
  const [credits, setCredits] = useState(0)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>(
    'success'
  )
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null)

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements || !user) {
      return
    }

    const cardElement = elements.getElement(CardElement) as StripeCardElement

    if (!cardElement) {
      setSnackbarSeverity('error')
      setSnackbarMessage('Card Element not found')
      setSnackbarOpen(true)
      return
    }

    const {error, paymentMethod} = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement
    })

    if (error) {
      setSnackbarSeverity('error')
      setSnackbarMessage(error.message || 'An unknown error occurred')
      setSnackbarOpen(true)
      return
    }

    if (!paymentMethod) {
      setSnackbarSeverity('error')
      setSnackbarMessage('Failed to create payment method')
      setSnackbarOpen(true)
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
        setSnackbarSeverity('error')
        setSnackbarMessage(errorMessage || 'Failed to complete purchase')
        setSnackbarOpen(true)
        return
      }

      await response.json()
      setSnackbarSeverity('success')
      setSnackbarMessage('Purchase successful!')
      setSnackbarOpen(true)
      setTimeout(() => {
        refreshCredits()
      }, 200)
    } catch (error) {
      setSnackbarSeverity('error')
      setSnackbarMessage('Failed to complete purchase')
      setSnackbarOpen(true)
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
      </form>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbarOpen(false)
        }}
      >
        <Alert
          onClose={() => {
            setSnackbarOpen(false)
          }}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}
