"use client"
import { Elements } from '@stripe/react-stripe-js';
const StripeProvider = ({ children, stripePromise, options }: any) => {
    return (
        <Elements stripe={stripePromise} options={options}>{children}</Elements>
    )
}

export default StripeProvider;