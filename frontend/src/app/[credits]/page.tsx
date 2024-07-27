'use client'
import {FC} from 'react'
import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'

import {CheckoutForm} from '@/app/components'

const stripePromise = loadStripe(
  'pk_test_51ESlBjBdhnqCifPCEil0H2uW4cXFA0yHJ0oltIX62ILlfoJlpe7YaoZvghInuHotIYGOWB7pqhyKylJbyJa0EBqg00bQNx2Rme'
)

const Credits: FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <main className="flex items-center">
        <CheckoutForm className="w-80" />
      </main>
    </Elements>
  )
}

export default Credits
