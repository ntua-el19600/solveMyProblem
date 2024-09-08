'use client'
import {FC} from 'react'
import {Elements} from '@stripe/react-stripe-js'
import {loadStripe} from '@stripe/stripe-js'

import {CheckoutForm} from '@/app/components'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

const Credits: FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <main className="grid justify-items-center p-10">
        <CheckoutForm className="max-w-96 w-full border-2 border-blue-400 py-6 px-8 rounded-lg" />
      </main>
    </Elements>
  )
}

export default Credits
