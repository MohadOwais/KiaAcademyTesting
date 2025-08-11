import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {

});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cartItems = JSON.parse(body.metadata.cart_items);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: body.customer_email,
      line_items: cartItems.map((item: any) => ({
        price_data: {
          currency: body.currency,
          product_data: {
            name: item.course_id, // You might want to include course name here
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: 1,
      })),
      success_url: `${body.success_url}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancel_url,
      metadata: body.metadata,
    });

    return NextResponse.json({ 
      sessionId: session.id,
      metadata: session.metadata 
    });
  } catch (err: any) {
    console.error('Stripe Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
