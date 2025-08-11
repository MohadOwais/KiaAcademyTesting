import { NextRequest } from 'next/server';

type PhonePePayload = {
    code?: string;
    status?: string;
    // Add other expected payload fields
};

export async function POST(
    request: NextRequest,
): Promise<Response> {
    try {
        // Get transactionId from URL
        const transactionId = request.url.split('/').pop();
        if (!transactionId) {
            return Response.json(
                { success: false, message: 'Transaction ID not found' },
                { status: 400 }
            );
        }

        const payload = await request.json() as PhonePePayload;
        
        // Log the incoming payload for debugging
        console.log('PhonePe callback payload:', payload);
        
        // Validate the callback payload
        if (!payload) {
            return Response.json(
                { success: false, message: 'Invalid payload' },
                { status: 400 }
            );
        }
        
        // PhonePe specific status validation
        const paymentStatus = payload.code || payload.status;
        
        if (paymentStatus !== 'PAYMENT_SUCCESS' && paymentStatus !== 'SUCCESS') {
            return Response.json(
                { 
                    success: false, 
                    message: 'Payment was not successful',
                    status: paymentStatus 
                },
                { status: 400 }
            );
        }
        
        // Return success response if everything is good
        return Response.json(
            { 
                success: true, 
                transactionId,
                message: 'Payment processed successfully'
            },
            { status: 200 }
        );
    } catch (error) {
        // Handle any internal server errors
        console.error('PhonePe callback error:', error);
        return Response.json(
            { 
                success: false, 
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}