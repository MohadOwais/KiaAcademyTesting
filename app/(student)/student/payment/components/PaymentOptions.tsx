import React from 'react';
import { Button } from '@mui/material';
import { FaStripe } from "react-icons/fa";
import { SiPhonepe } from "react-icons/si";

interface PaymentOptionsProps {
    onStripeClick: () => void;
    onPhonePeClick: () => void;
    isLoading: boolean;
    totalAmount: number;
    currency: string;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({
    onStripeClick,
    onPhonePeClick,
    isLoading,
    totalAmount,
    currency
}) => {
    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <h5 className="card-title mb-4">Payment Options</h5>
                
                <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="fw-bold">Total Amount:</span>
                        <span className="fs-5">{currency} {totalAmount ? totalAmount.toFixed(2) : '0.00'}</span>
                    </div>

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onStripeClick}
                        disabled={isLoading}
                        className="d-flex align-items-center gap-2 py-2"
                        fullWidth
                    >
                        <FaStripe size={24} />
                        Pay with Stripe
                    </Button>

                    <Button
                        variant="contained"
                        style={{ 
                            backgroundColor: '#5f259f',
                            color: 'white'
                        }}
                        onClick={onPhonePeClick}
                        disabled={isLoading}
                        className="d-flex align-items-center gap-2 py-2"
                        fullWidth
                    >
                        <SiPhonepe size={24} />
                        Pay with PhonePe
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentOptions; 