import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {

});

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    // Retrieve the session from Stripe with expanded payment_intent
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent']
    });

    // Create response data using the expanded payment_intent
    const responseData = {
      ...session,
      payment_intent_data: session.payment_intent,
      amount: (session.payment_intent as Stripe.PaymentIntent)?.amount,
      currency: (session.payment_intent as Stripe.PaymentIntent)?.currency,
      status: (session.payment_intent as Stripe.PaymentIntent)?.status,
      customer: session.customer,
      metadata: session.metadata
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Stripe verification error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
