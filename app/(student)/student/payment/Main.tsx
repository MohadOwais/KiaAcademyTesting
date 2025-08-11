"use client"

import { authorizationObj, baseUrl } from '@/app/utils/core'
import { Button, Typography } from '@mui/material'
import axios from 'axios'
import React, { FormEvent, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import CartComponent from './components/CartComponent'
import DeleteIcon from '@mui/icons-material/Delete'
import ConfirmAlertMUI from '@/app/components/mui/ConfirmAlertMUI'
import AlertMUI from '@/app/components/mui/AlertMUI'
import { FaRegCreditCard } from "react-icons/fa";
import CustomDialogue from '@/app/components/mui/CustomDialogue'
import BillingForm from '@/app/components/mui/BillingForm'
import FullScreenDialog from '@/app/components/mui/FullScreenDialogue'
import StripeProvider from '@/app/components/stripe/StripeProvider'
import PayCard from '@/app/(web)/current-courses/components/courses-section/PayCard'
import { appearance } from '@/app/utils/stripe'
import { loadStripe } from "@stripe/stripe-js";
import sha256 from "crypto-js/sha256";
import { initiatePhonePePayment } from './actions/phonepe';
import PaymentOptions from './components/PaymentOptions'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Main = () => {
    const currentUser = useSelector((state: any) => state?.user)

    const [cart, set_cart] = useState<any[]>([])
    const [is_loading, set_is_loading] = useState(false)
    const [alertData, setAlertdata] = React.useState<any>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
    const [error_message, set_error_message] = useState<null | string>(null)
    const [success_message, set_success_message] = useState<null | string>(null)
    const [totalPrice, setTotalPrice] = useState(0);
    const [payment_secret, set_payment_secret] = useState("")
    const [show_popup, set_show_popup] = useState(false)
    const [billing_data, set_billing_data] = useState<any>(null)
    const [show_stripe_form, set_show_stripe_form] = useState(false)

    useEffect(() => {
        get_cart()
    }, [currentUser, currentUser?.user_id])

    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + (+item?.display_price || 0), 0);
        setTotalPrice(total);
    }, [cart]);

    const get_user_courses = async () => {
        try {
            set_is_loading(true)
            const resp = await axios.get(`${baseUrl}/enrollments/student/${currentUser?.user_id}`, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.data) {
                return resp?.data?.data
            } else {
                return []
            }
        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            return []
        }
    }

    const get_cart = async () => {
        try {
            set_is_loading(true)
            const resp = await axios.get(`${baseUrl}/cart/view/${currentUser?.user_id}`, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.data) {
                const enrolledCourses: any = await get_user_courses()
                const final_courses = resp?.data?.data?.filter((course: any) => {
                    const isEnrolled = enrolledCourses.some((enrolled: any) => enrolled.course_id === course.course_id);
                    return !isEnrolled;
                });
                set_cart(final_courses)
            } else {
                set_cart([])
            }
        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            set_cart([])
        }
    }

    const clear_cart = async () => {
        try {
            set_is_loading(true)
            const resp = await axios.delete(`${baseUrl}/cart/clear/${currentUser?.user_id}`, authorizationObj)
            set_is_loading(false)
            setAlertdata(null)
            setIsAlertOpen(false)
            if (resp?.data?.status > 199 && resp?.data?.status < 300) {
                set_success_message("Cart cleared")
                get_cart()
                setTimeout(() => {
                    set_success_message(null)
                }, 3000);
            } else {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null)
                }, 3000);
            }
        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            setAlertdata(null)
            setIsAlertOpen(false)
            set_error_message("Something went wrong please try later")
            setTimeout(() => {
                set_error_message(null)
            }, 3000);
        }
    }

    const clear_cart_confirmation = () => {
        setAlertdata({
            title: "Clear Cart?",
            description: "Are you sure you want to clear your cart?. The action cannot be undone",
            fun: clear_cart,
        })
        setIsAlertOpen(true)
    }

    const get_client_secret = async (e: FormEvent) => {
        e.preventDefault()

        if (!billing_data?.address) {
            set_error_message("Address is required")
            setTimeout(() => set_error_message(""), 3000)
            return
        }

        if (!billing_data?.country) {
            set_error_message("Country is required")
            setTimeout(() => set_error_message(""), 3000)
            return
        }

        if (!billing_data?.state) {
            set_error_message("State is required")
            setTimeout(() => set_error_message(""), 3000)
            return
        }

        if (!billing_data?.city) {
            set_error_message("City is required")
            setTimeout(() => set_error_message(""), 3000)
            return
        }

        if (!billing_data?.postal_code) {
            set_error_message("Postal Code is required")
            setTimeout(() => set_error_message(""), 3000)
            return
        }

        try {
            set_is_loading(true)
            const client_secret_resp = await axios.post(`${baseUrl}/stripe/payment-intent`, {

                customer_address_line1: billing_data?.address,
                customer_country: billing_data?.country,
                customer_state: billing_data?.state,
                customer_city: billing_data?.city,
                customer_postal_code: billing_data?.postal_code,
                amount: +totalPrice * 100,
                currency: cart[0]?.currency?.toLowerCase(),
                customer_name: `${currentUser?.first_name} ${currentUser?.last_name}`,
                payment_method_types: ["card"],
                description: `Payment for Course multiple courses by userId ${currentUser?.user_id}`,
                metadata: {
                    customer_id: currentUser?.user_id
                },
                receipt_email: currentUser?.email,

            }, authorizationObj)
            set_is_loading(false)

            const client_secret = client_secret_resp?.data?.paymentIntent?.client_secret
            set_payment_secret(client_secret)

        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            set_error_message("Something went wrong, please try later")
            setTimeout(() => set_error_message(""), 3000)
        }
    }

    const create_payment = async (price: any, currency: any, title: any,transactionId:string) => {

        if (!price || price?.trim() === "") return
        if (!currency || currency?.trim() === "") return
        if (!title || title?.trim() === "") return

        const formData = new FormData()
        formData.append("amount", price)
        formData.append("currency", currency)
        formData.append("description", `Payment for ${title}`)
        formData.append("user_id", currentUser?.user_id)
        formData.append("payment_method", 'card')
        formData.append("transaction_id", transactionId)

        try {
            const resp = await axios.post(`${baseUrl}/payment/process`, formData, authorizationObj)
            return resp?.data?.payment_id
        } catch (error) {
            // console.error(error)
            return ""
        }
    }

    const complete_payment = async (transactionId: string) => {
        try {
            set_is_loading(true);

            const enrollmentPromises = cart?.map(async (cr: any) => {
                const courseId = cr?.course_id;
                if (!courseId) return Promise.resolve();

                try {
                    const paymentId = await create_payment(cr?.display_price, cr?.currency, cr?.course_title, transactionId);
                    const formData = new FormData();
                    formData.append("user_id", currentUser?.user_id);
                    formData.append("course_id", courseId);
                    formData.append("payment_id", paymentId);

                    const resp = await axios.post(`${baseUrl}/enrollment/enroll`, formData, authorizationObj);

                    if (resp?.data?.status >= 200 && resp?.data?.status <= 299) {
                        return { success: true };
                    } else {
                        throw new Error(resp?.data?.message || "Enrollment failed.");
                    }
                } catch (error: any) {
                    // console.error(error);
                    return { success: false, message: error.message };
                }
            });

            const results = await Promise.all(enrollmentPromises);
            const failed = results?.filter((result: any) => !result?.success);
            if (failed?.length) {
                set_error_message("Some courses failed to enroll. Please try again.");
                setTimeout(() => set_error_message(null), 3000);
            } else {
                set_success_message("You have enrolled successfully");
                setTimeout(() => set_success_message(null), 3000);
            }

            set_billing_data(null);
            set_show_popup(false);
            set_payment_secret("");
        } catch (error) {
            // console.error(error);
            set_error_message("An unexpected error occurred. Please try again.");
            setTimeout(() => set_error_message(null), 3000);
        } finally {
            set_is_loading(false);
            get_cart()
        }
    };
       
    const handle_phonepe_success = async (transactionId: string) => {
        try {
            set_is_loading(true);
            
            // Retrieve stored transaction details
            const storedTransaction = localStorage.getItem('phonepe_transaction');
            if (!storedTransaction) {
                throw new Error('Transaction details not found');
            }

            // Process the payment and enroll in courses
            await complete_payment(transactionId);
            
            // Clear stored transaction data
            localStorage.removeItem('phonepe_transaction');
            
            set_success_message("Payment successful! You have been enrolled in the courses.");
            
            // Redirect to courses page after successful payment
            setTimeout(() => {
                window.location.href = '/student/courses';
            }, 2000);
            
        } catch (error: any) {
            console.error("Error in PhonePe success handler:", error);
            set_error_message("Failed to complete enrollment after payment");
        } finally {
            set_is_loading(false);
            setTimeout(() => {
                set_error_message(null);
                set_success_message(null);
            }, 3000);
        }
    };

    const handleStripePayment = () => {
        if (!billing_data) {
            set_show_popup(true);
            return;
        }
        set_show_stripe_form(true);
    };

    const handlePhonePePayment = async () => {
        try {
            set_is_loading(true);
            const transactionDetails = {
                amount: totalPrice,
                userId: currentUser?.user_id,
                email: currentUser?.email,
                phoneNumber: currentUser?.phone_number || "",
                name: `${currentUser?.first_name} ${currentUser?.last_name}`,
                courses: cart.map(course => ({ id: course.id, title: course.title, price: course.price }))
            };

            // Store transaction details in localStorage
            localStorage.setItem('phonepe_transaction', JSON.stringify(transactionDetails));

            const response = await initiatePhonePePayment({
                amount: totalPrice,
                userId: currentUser?.user_id,
                email: currentUser?.email,
                phoneNumber: currentUser?.phone_number || "",
                name: `${currentUser?.first_name} ${currentUser?.last_name}`,
                address: '', // Dummy value
                city: '', // Dummy value
                state: '', // Dummy value
                postalCode: '', // Dummy value
                country: '', // Dummy value
                pincode: '', // Dummy value
                courses: cart.map(course => ({ id: course.id, title: course.title, price: course.price }))
            });

            if (response.success) {
                window.location.href = response.redirectUrl;
            } else {
                set_error_message("Failed to initiate PhonePe payment");
                setTimeout(() => set_error_message(null), 3000);
            }
        } catch (error) {
            console.error('PhonePe payment error:', error);
            set_error_message("Failed to initiate payment");
            setTimeout(() => set_error_message(null), 3000);
        } finally {
            set_is_loading(false);
        }
    };

    return (
        <>
            {error_message && <AlertMUI text={error_message} status="error" />}
            {success_message && <AlertMUI text={success_message} status="success" />}
            
            <ConfirmAlertMUI
                open={isAlertOpen}
                setOpen={setIsAlertOpen}
                title={alertData?.title}
                description={alertData?.description}
                fun={alertData?.fun}
                isLoading={is_loading}
            />

            <CustomDialogue
                open={show_popup}
                setOpen={set_show_popup}
                title="Billing Information"
                description="Please provide your billing information to proceed with the payment."
            >
                <BillingForm
                    data={billing_data}
                    setData={set_billing_data}
                    onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                        e.preventDefault();
                        set_show_popup(false);
                        handleStripePayment();
                    }}
                />
            </CustomDialogue>

            <FullScreenDialog
                open={show_stripe_form && !!payment_secret}
                setOpen={set_show_stripe_form}
                title="Complete Payment"
            >
                <StripeProvider stripePromise={stripePromise}>
                    <PayCard
                        clientSecret={payment_secret}
                        appearance={appearance}
                        return_url={window.location.href}
                    />
                </StripeProvider>
            </FullScreenDialog>

            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12 d-flex justify-content-between align-items-center">
                        <Typography variant="h5" component="h3">Shopping Cart</Typography>
                        {cart?.length > 0 && (
                            <Button
                                className="d-flex align-items-center"
                                onClick={clear_cart_confirmation}
                                color="secondary"
                                variant="contained"
                                disabled={is_loading}
                            >
                                <DeleteIcon sx={{ fontSize: "16px", marginRight: "8px" }} />
                                Clear Cart
                            </Button>
                        )}
                    </div>
                </div>

                <CartComponent 
                    data={cart} 
                    get_data={get_cart} 
                    is_loading={is_loading} 
                    set_is_loading={set_is_loading} 
                    onStripePayment={handleStripePayment} 
                    onPhonePePayment={handlePhonePePayment} 
                    totalAmount={totalPrice || 0} 
                />
            </div>
        </>
    );
};

export default Main;