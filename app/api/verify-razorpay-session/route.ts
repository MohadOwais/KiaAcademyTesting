import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const { paymentId, orderId, signature } = await req.json();

    // Validate required fields
    if (!paymentId || !orderId || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, orderId, or signature' },
        { status: 400 }
      );
    }

    // Verify the payment signature
    const text = `${orderId}|${paymentId}`;
    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (generated_signature !== signature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(paymentId);
    const order = await razorpay.orders.fetch(orderId);

    // Create response data
    const responseData = {
      payment_id: payment.id,
      order_id: order.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      email: payment.email,
      contact: payment.contact,
      created_at: payment.created_at,
      metadata: payment.notes || {},
      payment_status: payment.status === 'captured' ? 'paid' : payment.status,
      transaction_id: payment.id,
      customer_id: payment.email,
      // Additional fields for consistency with Stripe
      payment_intent: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      }
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify Razorpay payment' },
      { status: 500 }
    );
  }
} 