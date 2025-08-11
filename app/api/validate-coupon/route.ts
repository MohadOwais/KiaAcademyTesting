import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

if (!process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key');
}

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY, {

});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { coupon_code, amount } = body;

    if (!coupon_code) {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    try {
      // Retrieve the coupon from Stripe
      const coupon = await stripe.coupons.retrieve(coupon_code);

      // Check if coupon is valid
      if (!coupon.valid) {
        return NextResponse.json({
          valid: false,
          message: 'Coupon is no longer valid'
        });
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (coupon.percent_off) {
        discountAmount = (amount * coupon.percent_off) / 100;
      } else if (coupon.amount_off) {
        discountAmount = coupon.amount_off / 100; // Convert from cents to dollars
      }

      return NextResponse.json({
        valid: true,
        discount_percentage: coupon.percent_off || 0,
        discount_amount: discountAmount,
        coupon_type: coupon.percent_off ? 'percentage' : 'fixed_amount'
      });

    } catch (error: any) {
      // If coupon doesn't exist in Stripe, return invalid
      if (error.type === 'StripeInvalidRequestError') {
        return NextResponse.json({
          valid: false,
          message: 'Invalid coupon code'
        });
      }
      throw error;
    }

  } catch (error: any) {
    console.error('Coupon Validation Error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to validate coupon',
        details: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
} 
