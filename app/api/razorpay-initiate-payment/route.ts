import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency, customer_email, metadata } = body;

    // Validate required fields
    if (
      typeof amount !== 'number' ||
      !customer_email ||
      !metadata?.customer_id
    ) {
      return NextResponse.json({ error: 'Missing or invalid required fields' }, { status: 400 });
    }

    // Razorpay expects amount in paise for INR (e.g., ₹100 = 10000)
    if (amount < 100) {
      return NextResponse.json({ error: 'Amount must be at least 1 INR (100 paise)' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount, // amount in paise
      currency: (currency || 'INR').toUpperCase(),
      receipt: `rcptid_${Date.now()}`,
      payment_capture: 1,
      notes: {
        customer_email,
        ...metadata,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    // In production, avoid leaking sensitive error details
    console.error('🔥 Razorpay API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 