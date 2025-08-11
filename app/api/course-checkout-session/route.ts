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

    // Enhanced validation
    if (!body.customer_email || !body.currency || !body.metadata?.cart_items) {
      return NextResponse.json(
        { error: 'Missing required fields: customer_email, currency, or cart_items' },
        { status: 400 }
      );
    }

    let cartItems;
    try {
      cartItems = JSON.parse(body.metadata.cart_items);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid cart items format' },
        { status: 400 }
      );
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate each cart item
    for (const item of cartItems) {
      if (!item.course_id || !item.price) {
        return NextResponse.json(
          { error: 'Invalid cart item: missing course_id or price' },
          { status: 400 }
        );
      }
    }

    // Calculate amounts in cents to avoid floating point issues
    const subtotalCents = cartItems.reduce((sum, item) => sum + Math.round(parseFloat(item.price) * 100), 0);
    const discountPercentage = parseFloat(body.metadata.discount_percentage) || 0;
    const donationPercentage = parseFloat(body.metadata.donation_percentage) || 0;
    
    const discountCents = Math.round(subtotalCents * (discountPercentage / 100));
    const donationCents = Math.round(subtotalCents * (donationPercentage / 100));
    const finalAmountCents = subtotalCents - discountCents + donationCents;

    // Prepare line items
    const lineItems = [];

    // Add course items with discounted prices
    cartItems.forEach((item: any) => {
      const itemPriceCents = Math.round(parseFloat(item.price) * 100);
      const itemDiscountCents = Math.round(itemPriceCents * (discountPercentage / 100));
      const finalItemPriceCents = itemPriceCents - itemDiscountCents;

      lineItems.push({
        price_data: {
          currency: body.currency.toLowerCase(),
          product_data: {
            name: item.course_title || 'Course',
            description: discountPercentage > 0 ? `Original price: ${(itemPriceCents / 100).toFixed(2)} ${body.currency.toUpperCase()}, Discount: ${discountPercentage}%` : undefined,
            metadata: {
              course_id: item.course_id,
              original_price: item.price,
            }
          },
          unit_amount: finalItemPriceCents,
        },
        quantity: 1,
      });
    });

    // Add donation as a separate line item if there's a donation
    if (donationCents > 0) {
      lineItems.push({
        price_data: {
          currency: body.currency.toLowerCase(),
          product_data: {
            name: 'Donation',
            description: `${donationPercentage}% donation`,
          },
          unit_amount: donationCents,
        },
        quantity: 1,
      });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: body.customer_email,
      line_items: lineItems,
      success_url: `${body.success_url}session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancel_url,
      metadata: {
        customer_id: body.metadata.customer_id,
        cart_items: body.metadata.cart_items,
        discount_percentage: discountPercentage.toString(),
        donation_percentage: donationPercentage.toString(),
        coupon_code: body.metadata.coupon_code || undefined,
        total_amount: (finalAmountCents / 100).toString()
      },
      billing_address_collection: 'required'
    });

    return NextResponse.json({
      sessionId: session.id,
      totalAmount: finalAmountCents / 100,
    });
  } catch (err: any) {
    console.error('Stripe Error:', err);
    return NextResponse.json(
      { 
        error: err.message || 'Payment processing failed',
        details: err.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
