import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js"
import { useEffect, useState } from 'react';
import logo from "../../../../../public/images/logo-black.png"
import Image from "next/image"
import { Button } from "@mui/material";

const PayCard = ({ payment_secret, complete_payment }: any) => {

    const stripe: any = useStripe();
    const elements: any = useElements();

    const [hostName, setHostName] = useState("")
    const [loading, set_loading] = useState(false)

    useEffect(() => { setHostName(window?.location?.origin) }, [])

    const pay_with_stripe = async (e: any) => {
        e?.preventDefault();
        if (!stripe || !elements) return;
        const paymentElement = elements.getElement(PaymentElement);

        if (!paymentElement) {
            // console.error("PaymentElement is not found.");
            return;
        }
        set_loading(true)
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements: elements,
            confirmParams: {
                return_url: `${hostName}/current-courses`,
            },
            handleActions: false,
        });
        set_loading(false)

        if (error) {
            // console.error("payment failed", error);
        } else {
            // console.log("payment done", paymentIntent);
            complete_payment(paymentIntent?.id)
        }

    };

    return (
        <div className="w-full h-full flex justify-center items-center gap-[6em]">
            <Image src={logo} width={250} height={120} alt="logo"
                className="hidden md:block"
            />
            <div className="flex flex-col justify-center items-center gap-4">
                <PaymentElement />
                <Button onClick={pay_with_stripe} fullWidth
                    color="secondary" variant="contained"
                    disabled={loading}
                >Complete Payment</Button>
            </div>
        </div>
    )
}

export default PayCard