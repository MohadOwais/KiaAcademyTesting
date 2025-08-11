"use client"

import { authorizationObj, baseUrl} from '@/app/utils/core'
import axios from 'axios'
import React, {useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import CartComponent from './components/CartComponent'
import DeleteIcon from '@mui/icons-material/Delete'
import ConfirmAlertMUI from '@/app/components/mui/ConfirmAlertMUI'
import AlertMUI from '@/app/components/mui/AlertMUI'
import { loadStripe } from "@stripe/stripe-js";
import RecommededCourse from '@/app/(web)/home/components/RecommededCourse'
import { useSearchParams } from 'next/navigation';
import Image from 'next/image'


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
    const searchParams = useSearchParams();

    
    // Coupon Code
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState<number>(0);
    const [message, setMessage] = useState(''); 
    const [messageType, setMessageType] = useState<200 | 404>(200);

    

    const initialCartTotal = totalPrice || 0;
    const discountAmount = (initialCartTotal * discount) / 100;
    const amountAfterDiscount = initialCartTotal - discountAmount;
    const taxRate = 0.12;
    const totalAmount = amountAfterDiscount + (amountAfterDiscount * taxRate);
    const [donationPercentage, setDonationPercentage] = useState(cart[0]?.percentage || 3);


  

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
    
        // Check for Stripe payment status
        const sessionId = searchParams.get("session_id");
        const success = searchParams.get("success");
        const canceled = searchParams.get("canceled");
    console.log("sessionId",sessionId)
    console.log("success",success)
    console.log("canceled",canceled)
        // Check if there's a session ID
        if (sessionId) {
          verifyStripeSession(sessionId);
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
        try {
            set_is_loading(true);
            
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
                    
                    // Process enrollments for each course
                    const enrollmentPromises = cartItems.map(async (cr: any) => {
                        const courseId = cr?.course_id;
                        if (!courseId) return Promise.resolve();
    
                        try {
                            const paymentId = await create_payment(
                                cr?.price,
                                session.currency || "usd",
                                cr?.course_title,
                                session.payment_intent.id,
                                session.payment_status
                            );
    
                            const formData = new FormData();
                            formData.append("user_id", currentUser?.user_id);
                            formData.append("course_id", courseId);
                            formData.append("payment_id", paymentId);
    
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
    
    // Helper function to create payment
    const create_payment = async (amount: string, currency: string, payment_method: string, transactionId: string, paymentStatus: string) => {
        try {
            const formData = new FormData();
            formData.append("amount", amount);
            formData.append("user_id", currentUser?.institute_id);
            formData.append("currency", currency);
            formData.append("payment_method", payment_method);
            formData.append("transaction_id", transactionId);
            formData.append("payment_status", paymentStatus);
            console.log('Payment Data (FormData):');
            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
            });
            const response = await axios.post(`${baseUrl}/payment/process`, formData,authorizationObj );
            if (response?.data?.status > 299 || response?.data?.status < 199) {
                throw new Error(response?.data?.message || 'Payment creation failed');
            }
            // Return the ID of the created payment or any other relevant data you want to use later
            console.log('Payment created successfully:', response.data);
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


    const handleCheckout = async () => {
        try {
            set_is_loading(true);
            
            const response = await axios.post('/api/course-checkout-session', {
                customer_email: currentUser?.email,
                currency: cart[0]?.currency?.toLowerCase() || 'usd',
                amount: Math.round(totalAmount * 100),
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
                    })))
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

    const handleCheckoutPhonepay = async () => {
        try {
            set_is_loading(true);
    
            const response = await axios.post('/api/phonepe-initiate-payment', {
                customer_email: currentUser?.email,
                currency: cart[0]?.currency?.toLowerCase() || 'inr',
                amount: Math.round(totalAmount * 100),
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
                    }))
                }
            });
    
            const { redirectUrl } = response.data;
    
            if (!redirectUrl) {
                throw new Error("Invalid response: Missing redirect URL from PhonePe");
            }
    
            // Redirect to PhonePe payment page
            window.location.href = redirectUrl;
    
        } catch (error: any) {
            console.error('PhonePe Checkout Error:', error);
            set_error_message(error.message || "Failed to initiate PhonePe checkout");
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

      const donationAmount = (initialCartTotal * donationPercentage) / 100;

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
                    <h2 className="mb-0 font-size-16 ">My Cart</h2>
                    {cart?.length > 0 && (
                        <button 
                            className="btn btn-outline-danger d-flex align-items-center gap-2"
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
                        <h3>Your cart is empty</h3>
                        <a href="/current-courses" 
                        className="btn btn-view rounded-pill px-4 py-2 me-2 mt-3" 
                        style={{ color: "#fff"}}>
                            Browse Courses
                        </a>
                        <a href="/live-courses" 
                        className="btn btn-view rounded-pill px-4 py-2 me-2 mt-3" 
                        style={{ color: "#fff"}}>
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
                                    <h4 className="card-title mb-4">Order Summary</h4>

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
                                            className="btn btn-outline-dark rounded-pill px-4"
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
                                                    – {cart[0]?.currency} {(initialCartTotal * discount / 100).toLocaleString()}
                                                </span>
                                            </div>
                                        )}

                                        {/* Donation Display */}
                                        <div>
                                            <div className="d-flex justify-content-between mb-1">
                                                <span>Donation ({donationPercentage}%)</span>
                                                <span style={{ color: 'green' }}>
                                                    {cart[0]?.currency} {donationAmount.toLocaleString()}
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
                                                {cart[0]?.currency} {(initialCartTotal - (initialCartTotal * discount / 100)).toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Total Amount */}
                                    <div className="d-flex justify-content-between border-top pt-4 mb-4 fw-bold">
                                        <span>Total Amount :</span>
                                        <span className="fw-bold">
                                            {cart[0]?.currency} {(
                                                (initialCartTotal - (initialCartTotal * discount / 100)) + donationAmount
                                            ).toLocaleString()}
                                        </span>
                                    </div>


                                    {/* Proceed to Checkout */} 
                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-outline-dark rounded-pill w-50"
                                            onClick={() => handleCheckout()}
                                            disabled={is_loading || !cart?.length}
                                        >
                                            Pay with 
                                            <Image src="https://img.icons8.com/color/512/stripe.png" alt="phonepay" width="20" height="20" />

                                        </button>
                                        <button 
                                            className="btn btn-outline-dark rounded-pill w-50"
                                            onClick={() => handleCheckoutPhonepay()}
                                            disabled={is_loading || !cart?.length}
                                        >
                                           Pay with
                                            <Image src="https://img.icons8.com/?size=100&id=OYtBxIlJwMGA&format=png&color=000000" alt="phonepay" width="20" height="20" />
                                        </button>
                                    </div>
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