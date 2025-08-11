"use client"

import { authorizationObj, baseUrl} from '@/app/utils/core'
import axios from 'axios'
import React, {useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import CartComponent from './components/CartComponent'
import DeleteIcon from '@mui/icons-material/Delete'
import ConfirmAlertMUI from '@/app/components/mui/ConfirmAlertMUI'
import AlertMUI from '@/app/components/mui/AlertMUI'
import { loadStripe } from "@stripe/stripe-js";
import RecommededCourse from '@/app/(web)/home/components/RecommededCourse'
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { toast, Toaster } from 'react-hot-toast';


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (typeof window !== 'undefined' && (window as any).Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

const Main = () => {
    const currentUser = useSelector((state: any) => state?.user)

    const [cart, set_cart] = useState<any[]>([])
    const [is_loading, set_is_loading] = useState(false)
    const [alertData, setAlertdata] = React.useState<any>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
    const [error_message, set_error_message] = useState<null | string>(null)
    const [success_message, set_success_message] = useState<null | string>(null)
    const [totalPrice, setTotalPrice] = useState(0);
    const searchParams = useSearchParams();

    
    // Coupon Code
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState<number>(0);
    const [message, setMessage] = useState(''); 
    const [messageType, setMessageType] = useState<200 | 404>(200);

    

    // Calculate amounts properly
    const initialCartTotal = totalPrice || 0;
    const discountAmount = (initialCartTotal * discount) / 100;
    const amountAfterDiscount = initialCartTotal - discountAmount;
    const [donationPercentage, setDonationPercentage] = useState(3); // Default 3%
    const donationAmount = (amountAfterDiscount * donationPercentage) / 100;
    const finalPayableAmount = amountAfterDiscount + donationAmount;
    
    // Format amounts for display
    const paybleAmount = finalPayableAmount.toFixed(2);
    const donationAmountDisplay = donationAmount.toFixed(2);
    const discountAmountDisplay = discountAmount.toFixed(2);
  

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setMessage('Please enter the promo code');
            setMessageType(404);
            return;
        }
    
        set_is_loading(true);
        try {
            const response = await axios.post(`${baseUrl}/payment/coupon-apply`, {
                coupon_code: couponCode,
            }, authorizationObj);
            if (response.data.status==200) {

                const discountValue = response.data.data.coupon_discount;
                setDiscount(discountValue);
                setMessage(`Coupon applied! ${discountValue}% off.`);
                setMessageType(response.data.status);
            } else {
                setDiscount(0);
                setMessage(response.data.message || 'Invalid or expired coupon.');
                setMessageType(response.data.status);
            }
        } catch (error) {
            console.error(error);
            setMessage('Something went wrong while applying the coupon.');
            setMessageType(404);
        } finally {
            set_is_loading(false);
        }
    };
    


    useEffect(() => {
        get_cart()
    }, [currentUser, currentUser?.user_id])

    useEffect(() => {
        // Only process payments if user is logged in
        if (!currentUser?.user_id) {
            return;
        }
        
        // Check for Stripe payment status
        const sessionId = searchParams.get("session_id");
        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled");
        
        // Check for Razorpay payment status
        const razorpayPaymentId = searchParams.get("razorpay_payment_id");
        const razorpayOrderId = searchParams.get("razorpay_order_id");
        const razorpaySignature = searchParams.get("razorpay_signature");
        
        console.log("Stripe - sessionId:", sessionId, "success:", success, "canceled:", canceled);
        console.log("Razorpay - paymentId:", razorpayPaymentId, "orderId:", razorpayOrderId, "signature:", razorpaySignature);
        
        // Check if there's a Stripe session ID
        if (sessionId) {
          verifyStripeSession(sessionId);
          // Clean up URL parameters after processing
          const url = new URL(window.location.href);
          url.searchParams.delete('session_id');
          window.history.replaceState({}, '', url.toString());
        }
        
        // Check if there's a Razorpay payment ID
        if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
          verifyRazorpaySession(razorpayPaymentId, razorpayOrderId, razorpaySignature);
          // Clean up URL parameters after processing
          const url = new URL(window.location.href);
          url.searchParams.delete('razorpay_payment_id');
          url.searchParams.delete('razorpay_order_id');
          url.searchParams.delete('razorpay_signature');
          window.history.replaceState({}, '', url.toString());
        } else {
          // Check localStorage for Razorpay payment details
          const storedPaymentDetails = localStorage.getItem('razorpay_payment_details');
          if (storedPaymentDetails) {
            try {
              const details = JSON.parse(storedPaymentDetails);
              if (details.paymentId && details.orderId && details.signature) {
                verifyRazorpaySession(details.paymentId, details.orderId, details.signature);
                // Clear localStorage after processing
                localStorage.removeItem('razorpay_payment_details');
              }
            } catch (error) {
              console.error('Error parsing stored payment details:', error);
              localStorage.removeItem('razorpay_payment_details');
            }
          }
        }
    
        if (success === "true") {
          setPaymentStatus({
            status: "success",
            message: "Payment completed successfully!"
          });
        }
    
        if (canceled === "true") {
          setPaymentStatus({
            status: "error",
            message: "Payment was canceled."
          });
        }
      }, [currentUser, searchParams]);

    useEffect(() => {
        const total = cart.reduce((sum, item) => sum + (+item?.display_price || 0), 0);
        setTotalPrice(total);
    }, [cart]);

    const verifyStripeSession = async (sessionId: string) => {
        // Check if already processed
        const sessionKey = `stripe_${sessionId}`;
        if (processedRef.current.has(sessionKey)) {
            console.log('Stripe session already processed:', sessionId);
            return;
        }
        
        try {
            set_is_loading(true);
            processedRef.current.add(sessionKey);
            
            const response = await axios.post('/api/verify-stripe-session', {
                sessionId,
                user_id: currentUser?.user_id
            });
    
            const session = response?.data;
            console.log('Payment Session Data:', session);
    
            if (session.status === "complete" || session.payment_status === "paid") {
                try {
                    // Get cart items from session metadata
                    const cartItems = JSON.parse(session.metadata.cart_items || '[]');
                    
                    // Create single payment record for entire cart
                    const totalAmount = session.metadata?.total_amount || session.amount / 100;
                    console.log('Creating payment with total amount:', totalAmount);
                    console.log('Payment metadata:', session.metadata);
                    
                    const paymentId = await create_payment(
                        totalAmount.toString(),
                        session.currency || "usd",
                        'Stripe',
                        session.payment_intent.id,
                        session.payment_status,
                        {
                            coupon_code: session.metadata?.coupon_code || null,
                            coupon_amount: session.metadata?.coupon_amount || 0,
                            discount_percentage: session.metadata?.discount_percentage || 0,
                            donation_amount: session.metadata?.donation_amount || 0,
                            donation_percentage: session.metadata?.donation_percentage || 0
                        }
                    );
                    
                    console.log('Payment created with ID:', paymentId);
    
                    // Process enrollments for each course (with payment_id)
                    const enrollmentPromises = cartItems.map(async (cr: any) => {
                        const courseId = cr?.course_id;
                        if (!courseId) return Promise.resolve();
    
                        try {
                            const formData = new FormData();
                            formData.append("user_id", currentUser?.user_id);
                            formData.append("course_id", courseId);
                            formData.append("payment_id", paymentId); // Include payment_id
                            
                            console.log('Stripe: Enrolling course:', courseId, 'with payment_id:', paymentId);
                            console.log('Stripe Enrollment FormData:');
                            formData.forEach((value, key) => {
                                console.log(`${key}: ${value}`);
                            });
    
                            const resp = await axios.post(
                                `${baseUrl}/enrollment/enroll`,
                                formData,
                                authorizationObj
                            );
    
                            if (resp?.data?.status >= 200 && resp?.data?.status <= 299) {
                                return { success: true };
                            } else {
                                throw new Error(resp?.data?.message || "Enrollment failed.");
                            }
                        } catch (error: any) {
                            console.error('Enrollment Error:', error);
                            return { success: false, message: error.message };
                        }
                    });
    
                    const results = await Promise.all(enrollmentPromises);
                    const failed = results.filter((result: any) => !result?.success);
    
                    if (failed.length) {
                        setPaymentStatus({
                            status: 'error',
                            message: "Some courses failed to enroll. Please try again.",
                            data: session
                        });
                    } else {
                        setPaymentStatus({
                            status: 'success',
                            message: "Successfully enrolled in all courses!",
                            data: session
                        });
                        // Clear cart after successful enrollment
                        await clear_cart();
                        // Redirect to courses page
                        window.location.href = `${window.location.origin}/student/courses`;
                    }
    
                } catch (error: any) {
                    console.error('Enrollment Process Error:', error);
                    setPaymentStatus({
                        status: 'error',
                        message: error.message || 'Failed to process enrollments',
                        data: session
                    });
                }
            } else {
                setPaymentStatus({
                    status: 'error',
                    message: 'Payment verification failed',
                    data: session
                });
            }
        } catch (error: any) {
            console.error('Verification Error:', error);
            setPaymentStatus({
                status: 'error',
                message: error.message || 'Failed to verify payment'
            });
        } finally {
            set_is_loading(false);
        }
    };

    const verifyRazorpaySession = async (paymentId: string, orderId: string, signature: string) => {
        // Check if already processed
        const paymentKey = `razorpay_${paymentId}_${orderId}`;
        if (processedRef.current.has(paymentKey)) {
            console.log('Razorpay payment already processed:', paymentKey);
            return;
        }
        
        try {
            set_is_loading(true);
            processedRef.current.add(paymentKey);
            
            const response = await axios.post('/api/verify-razorpay-session', {
                paymentId,
                orderId,
                signature,
                user_id: currentUser?.user_id
            });
    
            const session = response?.data;
            console.log('Razorpay Payment Session Data:', session);
    
            if (session.payment_status === "paid" || session.status === "captured") {
                try {
                    // Get cart items from session metadata
                    const cartItems = session.metadata?.cart_items ? 
                        (typeof session.metadata.cart_items === 'string' ? 
                            JSON.parse(session.metadata.cart_items) : 
                            session.metadata.cart_items) : cart;
                    
                    console.log('Processing enrollments for cart items:', cartItems);
                    
                    // Create single payment record for entire cart
                    const totalAmount = session.metadata?.total_amount || session.amount / 100;
                    console.log('Creating Razorpay payment with total amount:', totalAmount);
                    console.log('Razorpay payment metadata:', session.metadata);
                    
                    const paymentId = await create_payment(
                        totalAmount.toString(),
                        session.currency || "inr",
                        'Razorpay',
                        session.payment_id,
                        session.payment_status,
                        {
                            coupon_code: session.metadata?.coupon_code || null,
                            coupon_amount: session.metadata?.coupon_amount || 0,
                            discount_percentage: session.metadata?.discount_percentage || 0,
                            donation_amount: session.metadata?.donation_amount || 0,
                            donation_percentage: session.metadata?.donation_percentage || 0
                        }
                    );
                    
                    console.log('Razorpay payment created with ID:', paymentId);
    
                    // Process enrollments for each course (with payment_id)
                    const enrollmentPromises = cartItems.map(async (cr: any) => {
                        const courseId = cr?.course_id;
                        if (!courseId) return Promise.resolve();
    
                        try {
                            const formData = new FormData();
                            formData.append("user_id", currentUser?.user_id);
                            formData.append("course_id", courseId);
                            formData.append("payment_id", paymentId); // Include payment_id
                            
                            console.log('Razorpay: Enrolling course:', courseId, 'with payment_id:', paymentId);
                            console.log('Razorpay Enrollment FormData:');
                            formData.forEach((value, key) => {
                                console.log(`${key}: ${value}`);
                            });
    
                            const resp = await axios.post(
                                `${baseUrl}/enrollment/enroll`,
                                formData,
                                authorizationObj
                            );
    
                            if (resp?.data?.status >= 200 && resp?.data?.status <= 299) {
                                return { success: true, course_id: courseId };
                            } else {
                                throw new Error(resp?.data?.message || "Enrollment failed.");
                            }
                        } catch (error: any) {
                            console.error('Enrollment Error for course:', courseId, error);
                            return { success: false, message: error.message, course_id: courseId };
                        }
                    });
    
                    const results = await Promise.all(enrollmentPromises);
                    const failed = results.filter((result: any) => !result?.success);
    
                    if (failed.length) {
                        console.error('Failed enrollments:', failed);
                        setPaymentStatus({
                            status: 'error',
                            message: "Some courses failed to enroll. Please try again.",
                            data: { session, failed }
                        });
                    } else {
                        setPaymentStatus({
                            status: 'success',
                            message: "Successfully enrolled in all courses!",
                            data: session
                        });
                        // Clear cart after successful enrollment
                        await clear_cart();
                        // Redirect to courses page
                        window.location.href = `${window.location.origin}/student/courses`;
                    }
    
                } catch (error: any) {
                    console.error('Enrollment Process Error:', error);
                    setPaymentStatus({
                        status: 'error',
                        message: error.message || 'Failed to process enrollments',
                        data: session
                    });
                }
            } else {
                setPaymentStatus({
                    status: 'error',
                    message: 'Payment verification failed - payment not completed',
                    data: session
                });
            }
        } catch (error: any) {
            console.error('Razorpay Verification Error:', error);
            setPaymentStatus({
                status: 'error',
                message: error.message || 'Failed to verify Razorpay payment'
            });
        } finally {
            set_is_loading(false);
        }
    };
    
    // Helper function to create payment
    const create_payment = async (amount: string, currency: string, payment_method: string, transactionId: string, paymentStatus: string, additionalData?: any) => {
        try {
            const formData = new FormData();
            formData.append("amount", amount);
            formData.append("user_id", currentUser?.user_id);
            formData.append("currency", currency);
            formData.append("payment_method", payment_method);
            formData.append("transaction_id", transactionId);
            formData.append("payment_status", paymentStatus);
            
            // Add optional coupon and donation data
            if (additionalData) {
                console.log('Additional data for payment:', additionalData);
                if (additionalData.coupon_code) {
                    formData.append("coupon_code", additionalData.coupon_code);
                }
                if (additionalData.coupon_amount) {
                    formData.append("coupon_amount", additionalData.coupon_amount.toString());
                }
                if (additionalData.donation_amount) {
                    formData.append("donation", additionalData.donation_amount.toString());
                    console.log('Adding donation amount:', additionalData.donation_amount.toString());
                }
                if (additionalData.donation_percentage) {
                    formData.append("donation_percentage", additionalData.donation_percentage.toString());
                    console.log('Adding donation percentage:', additionalData.donation_percentage.toString());
                }
            }
            
            console.log('Payment Data (FormData):');
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });
            
            const response = await axios.post(`${baseUrl}/payment/process`, formData, authorizationObj);
            if (response?.data?.status > 299 || response?.data?.status < 199) {
                throw new Error(response?.data?.message || 'Payment creation failed');
            }
            
            console.log('Payment created successfully:', response.data);
            console.log('Payment ID from response:', response.data.id);
            console.log('Full payment response:', response.data);
            
            set_success_message("Payment created successfully");
            setTimeout(() => {
                set_success_message("");
            }, 3000);
            return response.data.id;
        } catch (error) {
            console.error('Error creating payment:', error);
            throw error;
        }
    };
    const [paymentStatus, setPaymentStatus] = useState<{
        status: 'success' | 'error';
        message: string;
        data?: any;
    } | null>(null);
    
    // Track processed payments to prevent double processing
    const processedRef = useRef<Set<string>>(new Set());

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
                toast.success("Cart cleared")
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


    const handleCheckout = async () => {
        if (!currentUser?.user_id) {
            set_error_message("Please login to proceed with payment.");
            setTimeout(() => set_error_message(null), 3000);
            return;
        }
        
        if (!cart || cart.length === 0) {
            set_error_message("Cart is empty. Please add courses before proceeding to payment.");
            setTimeout(() => set_error_message(null), 3000);
            return;
        }
        
        try {
            set_is_loading(true);
            
            const response = await axios.post('/api/course-checkout-session', {
                customer_email: currentUser?.email,
                currency: cart[0]?.currency?.toLowerCase() || 'usd',
                amount: Math.round(Number(paybleAmount) * 100),
                success_url: `${window.location.origin}/student/cart?success=true&`,
                cancel_url: `${window.location.origin}/student/cart?canceled=true`,
                metadata: {
                    customer_id: currentUser?.user_id,
                    cart_items: JSON.stringify(cart.map(item => ({
                        course_id: item.course_id,
                        course_title: item.title,
                        course_description: item.description,
                        course_image: item.image,
                        instructor_name: item.instructor_name,
                        duration: item.duration,
                        level: item.level,
                        category: item.category,
                        language: item.language || 'English',
                        price: item.display_price
                    }))),
                    coupon_code: couponCode || null,
                    coupon_amount: discountAmount,
                    discount_percentage: discount,
                    donation_amount: donationAmount,
                    donation_percentage: donationPercentage,
                    total_amount: paybleAmount
                }
            });

            const { sessionId } = response.data;
            const stripe = await stripePromise;
            if (!stripe) {
                throw new Error('Stripe failed to initialize');
            }

            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                throw error;
            }

        } catch (error: any) {
            console.error('Checkout Error:', error);
            set_error_message(error.message || "Failed to initiate checkout");
            setTimeout(() => set_error_message(null), 3000);
        } finally {
            set_is_loading(false);
        }
    };

    // PhonePe payment status
    const [phonePeStatus, setPhonePeStatus] = useState<null | string>(null);

    // PhonePe Checkout Handler
    const handleCheckoutPhonePe = async () => {
        if (!currentUser?.user_id) {
            set_error_message("Please login to proceed with payment.");
            setTimeout(() => set_error_message(null), 3000);
            return;
        }
        
        if (!cart || cart.length === 0) {
            set_error_message("Cart is empty. Please add courses before proceeding to payment.");
            setTimeout(() => set_error_message(null), 3000);
            return;
        }
        
        try {
            set_is_loading(true);
            setPhonePeStatus(null);
            const response = await axios.post('/api/phonepe-initiate-payment', {
                customer_email: currentUser?.email,
                currency: cart[0]?.currency?.toLowerCase() || 'inr',
                amount: Math.round(Number(paybleAmount) * 100),
                success_url: `${window.location.origin}/student/cart?success=true`,
                cancel_url: `${window.location.origin}/student/cart?canceled=true`,
                metadata: {
                    customer_id: currentUser?.user_id,
                    cart_items: cart.map(item => ({
                        course_id: item.course_id,
                        course_title: item.title,
                        course_description: item.description,
                        course_image: item.image,
                        instructor_name: item.instructor_name,
                        duration: item.duration,
                        level: item.level,
                        category: item.category,
                        language: item.language || 'English',
                        price: item.display_price,
                    })),
                    coupon_code: couponCode || null,
                    coupon_amount: discountAmount,
                    discount_percentage: discount,
                    donation_amount: donationAmount,
                    donation_percentage: donationPercentage,
                    total_amount: paybleAmount
                }
            });

            const { redirectUrl } = response.data;
            if (!redirectUrl) {
                setPhonePeStatus("PhonePe payment gateway is NOT working (no redirect URL returned)");
                throw new Error("Invalid response: Missing redirect URL from PhonePe");
            }
            setPhonePeStatus("PhonePe payment gateway is working!");
            // Uncomment the next line to actually redirect
            // window.location.href = redirectUrl;
        } catch (error: any) {
            console.error('PhonePe Checkout Error:', error);
            set_error_message(error.message || "Failed to initiate PhonePe checkout");
            setPhonePeStatus("PhonePe payment gateway is NOT working");
            setTimeout(() => set_error_message(null), 3000);
        } finally {
            set_is_loading(false);
        }
    };
    
    // Razorpay payment status
    const [razorpayStatus, setRazorpayStatus] = useState<null | string>(null);

    // Razorpay Checkout Handler
    const handleCheckoutRazorpay = async () => {
        if (!currentUser?.user_id) {
            set_error_message("Please login to proceed with payment.");
            setTimeout(() => set_error_message(null), 3000);
            return;
        }
        
        if (!cart || cart.length === 0) {
            set_error_message("Cart is empty. Please add courses before proceeding to payment.");
            setTimeout(() => set_error_message(null), 3000);
            return;
        }
        
        set_is_loading(true);
        setRazorpayStatus(null);
        try {
            const res = await loadRazorpayScript();
            if (!res) {
                setRazorpayStatus("Failed to load Razorpay SDK. Are you online?");
                set_is_loading(false);
                return;
            }

            console.log('Initiating Razorpay payment with cart:', cart);
            console.log('Payable amount:', paybleAmount);
            
            const response = await axios.post('/api/razorpay-initiate-payment', {
                customer_email: currentUser?.email,
                currency: 'INR',
                amount: Math.round(Number(paybleAmount) * 100),
                metadata: {
                    customer_id: currentUser?.user_id,
                    cart_items: cart.map(item => ({
                        course_id: item.course_id,
                        course_title: item.title,
                        course_description: item.description,
                        course_image: item.image,
                        instructor_name: item.instructor_name,
                        duration: item.duration,
                        level: item.level,
                        category: item.category,
                        language: item.language || 'English',
                        price: item.display_price
                    })),
                    coupon_code: couponCode || null,
                    coupon_amount: discountAmount,
                    discount_percentage: discount,
                    donation_amount: donationAmount,
                    donation_percentage: donationPercentage,
                    total_amount: paybleAmount
                }
            });

            const { orderId, key, amount, currency } = response.data;
            if (!orderId || !key) {
                setRazorpayStatus("Razorpay payment gateway is NOT working (no orderId or key returned)");
                set_is_loading(false);
                return;
            }

            const options = {
                key,
                amount,
                currency,
                name: "Your Company Name",
                description: "Course Payment",
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        console.log('Razorpay payment successful:', response);
                        
                        // Store payment details in localStorage for verification
                        const paymentDetails = {
                            paymentId: response.razorpay_payment_id,
                            orderId: orderId,
                            signature: response.razorpay_signature,
                            amount: amount,
                            currency: currency,
                            cart: cart
                        };
                        localStorage.setItem('razorpay_payment_details', JSON.stringify(paymentDetails));
                        
                        // Redirect to cart page with payment parameters for verification
                        const redirectUrl = `${window.location.origin}/student/cart?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${orderId}&razorpay_signature=${response.razorpay_signature}`;
                        window.location.href = redirectUrl;
                        
                    } catch (err: any) {
                        console.error('Razorpay Handler Error:', err);
                        setRazorpayStatus('Payment succeeded but verification failed: ' + (err?.message || 'Unknown error'));
                        set_error_message(err?.message || 'Payment verification failed');
                        setTimeout(() => set_error_message(null), 5000);
                    }
                },
                prefill: {
                    email: currentUser?.email,
                },
                theme: { color: "#3399cc" }
            };

            const RazorpayConstructor = (window as any).Razorpay;
            if (!RazorpayConstructor) {
                setRazorpayStatus("Razorpay SDK not loaded");
                set_is_loading(false);
                return;
            }
            const rzp = new RazorpayConstructor(options);
            rzp.open();
            setRazorpayStatus("Razorpay payment modal opened.");
        } catch (error: any) {
            set_error_message(error?.message || "Failed to initiate Razorpay checkout");
            setRazorpayStatus("Razorpay payment gateway is NOT working");
            setTimeout(() => set_error_message(null), 3000);
        } finally {
            set_is_loading(false);
        }
    };
    
    const increasePercentage = () => {
        if (donationPercentage < 100) {
          setDonationPercentage((prev: number) => prev + 1);
        }
      };
    
      const decreasePercentage = () => {
        if (donationPercentage > 0) {
          setDonationPercentage((prev: number) => prev - 1);
        }
      };

      // donationAmount is already calculated above

    // Enroll Now for free courses
    const handleEnrollNow = async () => {
        if (!currentUser?.user_id) {
            set_error_message("Please login to proceed with enrollment.");
            setTimeout(() => set_error_message(null), 3000);
            return;
        }
        
        if (!cart.length) {
            set_error_message("Cart is empty. Please add courses before proceeding to enrollment.");
            setTimeout(() => set_error_message(null), 3000);
            return;
        }
        
        set_is_loading(true);
        try {
            // Enroll user in all courses in the cart
            const enrollmentPromises = cart.map(async (cr) => {
                const formData = new FormData();
                formData.append("user_id", currentUser?.user_id);
                formData.append("course_id", cr.course_id);
                // No payment_id for free enrollment
                const resp = await axios.post(
                    `${baseUrl}/enrollment/enroll`,
                    formData,
                    authorizationObj
                );
                if (resp?.data?.status >= 200 && resp?.data?.status <= 299) {
                    return { success: true };
                } else {
                    throw new Error(resp?.data?.message || "Enrollment failed.");
                }
            });
            const results = await Promise.all(enrollmentPromises);
            const failed = results.filter((result) => !result?.success);
            if (failed.length) {
                set_error_message("Some courses failed to enroll. Please try again.");
                setTimeout(() => set_error_message(null), 3000);
            } else {
                set_success_message("Successfully enrolled in all courses!");
                setTimeout(() => set_success_message(null), 2000);
                await clear_cart();
                window.location.href = `${window.location.origin}/student/courses`;
            }
        } catch (error) {
            set_error_message("Enrollment failed. Please try again.");
            setTimeout(() => set_error_message(null), 3000);
        } finally {
            set_is_loading(false);
        }
    };

    return (
        <>
            {error_message && <AlertMUI text={error_message} status="error" />}
            {success_message && <AlertMUI text={success_message} status="success" />}

            {/* Remove CustomDialogue and BillingForm components */}

            <ConfirmAlertMUI
                open={isAlertOpen}
                setOpen={setIsAlertOpen}
                title={alertData?.title}
                description={alertData?.description}
                fun={alertData?.fun}
                isLoading={is_loading}
            />

            <div className="container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="mb-0 font-size-16 heading-style ">My Cart</h3>
                    {cart?.length > 0 && (
                        <button 
                            className="btn btn-outline-danger rounded-pill d-flex align-items-center gap-2"
                            onClick={clear_cart_confirmation}
                            disabled={is_loading}
                        >
                            <DeleteIcon sx={{ fontSize: "16px" }} />
                            <span>Clear Cart</span>
                        </button>
                    )}
                </div>

                {cart.length === 0 ? (
                    <div className="text-center py-5">
                        <h3 className="heading-style">Your cart is empty</h3>
                        <a href="/current-courses" 
                        className="btn rounded-pill btn-view px-4 py-2 me-2 mt-3" 
                        style={{backgroundColor: "#2196F3", color: "#fff"}}>
                            Browse Courses
                        </a>
                        <a href="/live-courses" 
                        className="btn rounded-pill btn-view px-4 py-2 me-2 mt-3" 
                        style={{backgroundColor: "#2196F3", color: "#fff"}}>
                            Browse live Courses
                        </a>
                    </div>
                ) : (

                    // cart courses details
                    <div className="row h-100">
                        <div className="col-lg-8 mb-4">
                            <div className="card border-0 shadow-none p-0 mb-3 h-100"> 
                                <div className="card-body p-0">
                                    <CartComponent 
                                        data={cart} 
                                        get_data={get_cart} 
                                        is_loading={is_loading} 
                                        set_is_loading={set_is_loading} 
                                        user_id={currentUser?.user_id}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}

                        <div className="col-lg-4">
                            <div className="card border-1 shadow-sm rounded-4 p-3 h-100">
                                <div className="card-body">
                                    <h3 className="card-title mb-4 heading-style">Order Summary</h3>

                                    {/* Coupon Code */}

                                        <label className="form-label fw-bold mb-2">Promo code / Coupon</label>
                                        <div className="d-flex flex-row align-items-center mb-2">
                                        <input
                                            type="text"
                                            className="form-control rounded-pill me-2"
                                            placeholder="Enter code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            style={{ maxWidth: '300px', borderRadius: '0.5rem' }}
                                        />
                                         <button
                                            className="btn btn-outline-dark rounded-pill btn-view px-4"
                                            style={{color: "#fff"}}
                                            onClick={handleApplyCoupon}
                                            disabled={is_loading} 
                                        >
                                            Apply
                                        </button>
                                        </div>

                                        {message && (
                                        <div className="d-flex align-items-center mt-2 mb-2">
                                            <span className={`${messageType === 404 ? 'text-danger' : 'text-success'}`}>{message}</span>
                                        </div>
                                        )}

                                        {/* Total Courses */}
                                        <div className="d-flex justify-content-between mb-1">
                                        <span>Total Courses:</span>
                                        <span className="fw-bold">{cart?.length || 0}</span>
                                        </div>

                                        {/* Total Courses Price */}
                                        <div className="d-flex justify-content-between mb-1">
                                        <span>Total Courses Price</span>
                                        <span>{cart[0]?.currency} {initialCartTotal.toLocaleString()}</span>
                                        </div>

                                        {/* Discount */}
                                        {discount > 0 && (
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>Discount ({discount}%)</span>
                                                <span className="text-success">
                                                    – {cart[0]?.currency} {discountAmountDisplay}
                                                </span>
                                            </div>
                                        )}

                                        {/* Donation Display */}
                                        <div>
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>Donation ({donationPercentage}%)</span>
                                                <span style={{ color: 'green' }}>
                                                    {cart[0]?.currency} {donationAmountDisplay}
                                                </span>
                                            </div>

                                            {/* Controls to Increase/Decrease */}
                                            <div className="d-flex align-items-center mb-2">
                                                <button 
                                                    onClick={decreasePercentage} 
                                                    disabled={donationPercentage <= 0}
                                                    style={{borderRadius: "50%", width: "30px", height: "30px", alignItems: "center"}}
                                                    className="btn btn-outline-secondary me-2 text-center">-</button>
                                                <span>{donationPercentage}%</span>
                                                <button 
                                                    onClick={increasePercentage} 
                                                    disabled={donationPercentage >= 100}
                                                    style={{borderRadius: "50%", width: "30px", height: "30px", alignItems: "center"}}
                                                    className="btn btn-outline-secondary ms-2 text-center">+</button>
                                            </div>
                                        </div>

                                    {/* Amount after discount */}

                                    {/* {initialCartTotal && (
                                        <div className="d-flex justify-content-between mb-3">
                                            <span>Amount after discount</span>
                                            <span>
                                                {cart[0]?.currency} {(initialCartTotal - (initialCartTotal * discount / 100)).toLocaleString()}
                                            </span>
                                        </div>
                                    )} */}

                                    {discount > 0 && initialCartTotal && (
                                        <div className="d-flex justify-content-between mb-3">
                                            <span>Amount after discount</span>
                                            <span>
                                                {cart[0]?.currency} {amountAfterDiscount.toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Total Amount */}
                                    <div className="d-flex justify-content-between border-top pt-4 mb-4 fw-bold">
                                        <span>Total Amount :</span>
                                        <span className="fw-bold">
                                            {cart[0]?.currency} {paybleAmount}
                                        </span>
                                    </div>


                                    {/* Proceed to Checkout */} 
                                    <div className="d-flex gap-2">
                                    {Number(paybleAmount) === 0 ? (
                                        <button
                                            className="btn btn-outline-dark rounded-pill btn-view w-100"
                                            style={{ color: "#fff" }}
                                            onClick={() => handleEnrollNow()}
                                        >
                                            Enroll Now
                                        </button>
                                    ) : (
                                        <>
                                        {/* <button
                                            className="btn btn-outline-dark rounded-pill btn-view w-100"
                                            style={{ color: "#fff" }}
                                            onClick={() => handleCheckout()}
                                            disabled={is_loading || !cart?.length}
                                        >
                                            Pay with
                                            <Image src="https://img.icons8.com/color/512/stripe.png" alt="stripe" width="20" height="20" />
                                        </button>
                                        <button
                                            className="btn btn-outline-dark rounded-pill btn-view w-100 mt-2"
                                            style={{ color: "#fff" }}
                                            onClick={handleCheckoutPhonePe}
                                            disabled={is_loading || !cart?.length}
                                        >
                                            Pay with
                                            <Image src="https://img.icons8.com/color/512/phone-pe.png" alt="phonepe" width="20" height="20" />
                                        </button> */}
                                        <button
                                            className="btn btn-outline-dark rounded-pill btn-view w-100 mt-2"
                                            style={{ color: "#fff" }}
                                            onClick={handleCheckoutRazorpay}
                                            disabled={is_loading || !cart?.length}
                                        >
                                            Pay with
                                            {/* <Image src="https://img.icons8.com/color/512/google-pay.png" alt="razorpay" width="20" height="20" /> */}
                                        </button>
                                        </>
                                    )}
                                    </div>
                                    {/* PhonePe status message */}
                                    {phonePeStatus && (
                                        <div className="mt-2">
                                            <span className={phonePeStatus.includes('NOT') ? 'text-danger' : 'text-success'}>{phonePeStatus}</span>
                                        </div>
                                    )}
                                    {/* Razorpay status message */}
                                    {razorpayStatus && (
                                        <div className="mt-2">
                                            <span className={razorpayStatus.includes('NOT') ? 'text-danger' : 'text-success'}>{razorpayStatus}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <RecommededCourse />               

                    </div>
                )}
            </div>
        </>
    )
}

export default Main;