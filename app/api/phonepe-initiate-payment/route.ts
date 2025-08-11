import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import axios from 'axios';

const MERCHANT_ID = process.env.NEXT_PUBLIC_MERCHANT_ID!;
const SALT_KEY = process.env.NEXT_PUBLIC_SALT_KEY!;
const SALT_INDEX = process.env.NEXT_PUBLIC_SALT_INDEX!;
const PHONEPE_HOST = process.env.NEXT_PUBLIC_PHONE_PAY_HOST_URL!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("📦 Incoming request body:", body);

    const {
      amount,
      currency,
      customer_email,
      success_url,
      cancel_url,
      metadata,
    } = body;

    // Validate required fields
    if (!amount || !customer_email || !success_url || !cancel_url || !metadata?.customer_id) {
      console.error("❌ Missing required fields:", { amount, customer_email, success_url, cancel_url, metadata });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transactionId = `TID-${Date.now()}`;
    const redirectUrl = `${success_url}&transactionId=${transactionId}`;
    const callbackUrl = `${cancel_url}&transactionId=${transactionId}`;

    const payload = {
      merchantId: MERCHANT_ID,
      transactionId,
      amount,
      merchantUserId: metadata.customer_id,
      redirectUrl,
      redirectMode: 'POST',
      callbackUrl,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToHash = `${encodedPayload}${SALT_KEY}`;
    const xVerify = crypto.createHash('sha256').update(stringToHash).digest('hex') + `###${SALT_INDEX}`;

    console.log("🔒 Payload:", payload);
    console.log("🔐 Encoded payload:", encodedPayload);
    console.log("🔑 X-VERIFY:", xVerify);

    const response = await axios.post(
      `${PHONEPE_HOST}/pg/v1/pay`,
      { request: encodedPayload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': MERCHANT_ID,
        },
      }
    );

    const data = response.data;
    console.log("✅ PhonePe response:", data);

    if (data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({ redirectUrl: data.data.instrumentResponse.redirectInfo.url });
    } else {
      return NextResponse.json({ error: 'PhonePe did not return a redirect URL' }, { status: 400 });
    }

  } catch (error: any) {
    console.error("🔥 PhonePe API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
