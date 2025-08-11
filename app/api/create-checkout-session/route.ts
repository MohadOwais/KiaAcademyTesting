import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      plan_id,
      customer_email,
      success_url,
      cancel_url,
      amount,
      currency,
      metadata,
    } = body;

    if (!plan_id || !customer_email || !success_url || !cancel_url || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (typeof amount !== "number" || !Number.isInteger(amount)) {
      return NextResponse.json({ error: "Amount must be an integer (in cents)" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: metadata?.plan_name || "Subscription",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${success_url}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url,
      metadata: {
        plan_id: plan_id,
        plan_name: metadata?.plan_name || "Subscription",
        user_id: metadata?.user_id,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 