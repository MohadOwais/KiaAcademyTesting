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
        const body = await req.json();
        const { 
            customer_email, 
            amount, 
            currency = 'INR',
            metadata = {} 
        } = body;

        if (!customer_email || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields: customer_email and amount' },
                { status: 400 }
            );
        }

        // Create Razorpay order for subscription payment
        const order = await razorpay.orders.create({
            amount: amount, // Amount in paise (smallest currency unit)
            currency: currency,
            receipt: `subscription_${Date.now()}`,
            notes: {
                customer_email: customer_email,
                payment_type: 'subscription_plan',
                plan_id: metadata.plan_id,
                plan_name: metadata.plan_name,
                user_id: metadata.user_id,
                ...metadata
            }
        });

        const responseData = {
            orderId: order.id,
            key: RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            status: order.status,
            created_at: order.created_at,
            metadata: metadata
        };

        console.log('Razorpay subscription order created:', responseData);

        return NextResponse.json(responseData);
    } catch (error: any) {
        console.error('Razorpay subscription payment error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create Razorpay subscription order' },
            { status: 500 }
        );
    }
} 