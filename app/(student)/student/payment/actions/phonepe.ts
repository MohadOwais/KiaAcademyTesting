'use server'

import SHA256 from 'crypto-js/sha256';

interface PaymentInitiationParams {
    userId: string;
    amount: number;
    email: string;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    postalCode: string;
    courses: Array<{
        id: string;
        title: string;
        price: number;
    }>;
    phoneNumber?: string;
}

export async function initiatePhonePePayment({
    userId,
    amount,
    courses,
    phoneNumber,
    email,
    name,
    address,
    city,
    state,
    pincode,
    country,
    postalCode

}: PaymentInitiationParams) {
    try {
        // Validate environment variables
        const envVars = {
            merchantId: process.env.NEXT_PUBLIC_MERCHANT_ID,
            saltKey: process.env.NEXT_PUBLIC_SALT_KEY,
            saltIndex: process.env.NEXT_PUBLIC_SALT_INDEX,
            baseUrl: process.env.NEXT_URL,
            phonePayUrl: process.env.NEXT_PUBLIC_PHONE_PAY_HOST_URL
        };

        // Validate required environment variables
        const missingVars = Object.entries(envVars)
            .filter(([_, value]) => !value)
            .map(([key]) => key);

        if (missingVars.length > 0) {
            throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
        }

        // Generate transaction ID
        const transactionId = "Tr-" + Math.random().toString(36).substring(2, 15);

        // Construct URLs
        const redirectUrl = `${envVars.baseUrl}/student/payment/phonepe/status/${transactionId}`;
        const callbackUrl = `${envVars.baseUrl}/api/phonepe/callback/${transactionId}`;

        // Prepare payload
        const payload = {
            merchantId: envVars.merchantId,
            merchantTransactionId: transactionId,
            merchantUserId: `MUID-${userId || 'GUEST'}`,
            amount: Math.round(amount * 100),
            redirectUrl: redirectUrl,
            redirectMode: "REDIRECT",
            callbackUrl: callbackUrl,
            mobileNumber: phoneNumber || "",
            paymentInstrument: {
                type: "PAY_PAGE"
            },
            metadata: {
                userId,
                courses: courses.map(course => course.id).join(','),
                totalAmount: amount
            }
        };

        // Base64 encode payload
        const dataBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");

        // Generate checksum
        const string = `${dataBase64}/pg/v1/pay${envVars.saltKey}`;
        const sha256Hash = SHA256(string).toString();
        const checksum = `${sha256Hash}###${envVars.saltIndex}`;

        // Make API request
        const response = await fetch(`${envVars.phonePayUrl}/pg/v1/pay`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            body: JSON.stringify({
                request: dataBase64
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to initiate payment');
        }

        return {
            success: true,
            redirectUrl: data.data.instrumentResponse.redirectInfo.url,
            transactionId,
            transactionDetails: {
                amount,
                courses
            }
        };

    } catch (error: any) {
        console.error("Server error initiating payment:", error);
        return {
            success: false,
            error: error.message || 'Failed to initiate payment'
        };
    }
} 