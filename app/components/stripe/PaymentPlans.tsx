import React, { useEffect, useState } from 'react'
import axios from "axios"
import { baseUrl, authorizationObj } from "../../utils/core"
import { useSelector } from 'react-redux'
import { loadStripe } from "@stripe/stripe-js";
import { get_plan_medium } from '@/app/(admin)/admin/plans/Main'
import Image from 'next/image'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Razorpay script loader
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

const SinglePlan = ({ plan, handleSelect, handleRazorpaySelect, is_loading, donationPercentage, setDonationPercentage, showDonationOptions, setShowDonationOptions }: any) => {
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'razorpay' | null>(null);

    // Calculate donation amount
    const planPrice = Number(plan.plan_price);
    const donationAmount = (planPrice * donationPercentage) / 100;
    const totalAmount = planPrice + donationAmount;

    const handlePlanSelect = () => {
        setShowPaymentOptions(true);
    };

    const handlePaymentMethodSelect = (method: 'stripe' | 'razorpay') => {
        setSelectedPaymentMethod(method);
        if (method === 'stripe') {
            handleSelect(plan);
        } else if (method === 'razorpay') {
            handleRazorpaySelect(plan);
        }
        setShowPaymentOptions(false);
        setSelectedPaymentMethod(null);
    };

    return (
        <div className="col-12 col-sm-6 col-lg-4 mb-4 d-flex">
            <div className="card h-100 border-0 shadow-lg rounded-4 flex-fill position-relative overflow-hidden">
                {/* Popular Badge */}
                {plan?.plan_name?.toLowerCase().includes('premium') && (
                    <div className="position-absolute top-0 end-0 bg-warning text-dark px-3 py-1 rounded-bottom-start">
                        <small className="fw-bold">POPULAR</small>
                    </div>
                )}
                
                <div className="card-body d-flex flex-column p-4">
                    {/* Plan Header */}
                    <div className="text-center mb-4">
                        <h4 className="card-title fw-bold text-primary mb-2">{plan?.plan_name}</h4>
                        <div className="pricing-display">
                            <span className="display-6 fw-bold text-dark">
                                {plan?.plan_price ?
                                    plan?.plan_price === "0.00" ? "Free" :
                                        `$${plan?.plan_price}`
                                    : "Free"
                                }
                            </span>
                            {plan?.plan_price !== "0.00" && (
                                <span className="text-muted ms-2">
                                    / {plan?.plan_duration} {get_plan_medium(plan?.plan_medium, plan?.plan_duration)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Plan Description */}
                    <p className="card-text text-muted text-center mb-4">{plan?.plan_description}</p>

                    {/* Features List */}
                    <div className="flex-grow-1">
                        <ul className="list-unstyled mb-4">
                            <li className="d-flex align-items-center mb-3">
                                <div className="bg-success bg-opacity-10 rounded-circle p-1 me-3">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                                        <polyline points="20,6 9,17 4,12"></polyline>
                                    </svg>
                                </div>
                                <span className="text-dark">Courses Allowed: <strong>{plan?.courses_allowed}</strong></span>
                            </li>
                            <li className="d-flex align-items-center mb-3">
                                <div className="bg-success bg-opacity-10 rounded-circle p-1 me-3">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                                        <polyline points="20,6 9,17 4,12"></polyline>
                                    </svg>
                                </div>
                                <span className="text-dark">Tutors Allowed: <strong>{plan?.tutors_allowed}</strong></span>
                            </li>
                            <li className="d-flex align-items-center mb-3">
                                <div className="bg-success bg-opacity-10 rounded-circle p-1 me-3">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success">
                                        <polyline points="20,6 9,17 4,12"></polyline>
                                    </svg>
                                </div>
                                <span className="text-dark">Storage: <strong>{plan?.storage_allowed} GB</strong></span>
                            </li>
                        </ul>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto">
                        {!showPaymentOptions ? (
                            <>
                                {/* Donation Section */}
                                {showDonationOptions && (
                                    <div className="mb-3 p-3 bg-light rounded-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-muted">Donation ({donationPercentage}%)</span>
                                            <span className="text-success fw-bold">${donationAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="d-flex align-items-center justify-content-center mb-2">
                                            <button 
                                                onClick={() => setDonationPercentage(Math.max(0, donationPercentage - 1))} 
                                                disabled={donationPercentage <= 0}
                                                className="btn btn-outline-secondary btn-sm rounded-circle me-2"
                                                style={{width: "30px", height: "30px"}}
                                            >
                                                -
                                            </button>
                                            <span className="mx-3 fw-bold">{donationPercentage}%</span>
                                            <button 
                                                onClick={() => setDonationPercentage(Math.min(100, donationPercentage + 1))} 
                                                disabled={donationPercentage >= 100}
                                                className="btn btn-outline-secondary btn-sm rounded-circle ms-2"
                                                style={{width: "30px", height: "30px"}}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <div className="text-center">
                                            <small className="text-muted">Total: <strong>${totalAmount.toFixed(2)}</strong></small>
                                        </div>
                                    </div>
                                )}
                                
                                <button
                                    className={`btn w-100 py-3 fw-bold rounded-pill ${
                                        plan?.plan_name?.toLowerCase().includes('premium') 
                                            ? 'btn-warning text-dark' 
                                            : 'btn-primary'
                                    }`}
                                    disabled={is_loading}
                                    onClick={handlePlanSelect}
                                >
                                    {is_loading ? (
                                        <div className="d-flex align-items-center justify-content-center">
                                            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        'Select Plan'
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="payment-options">
                                <div className="mb-3">
                                    <h6 className="text-center mb-3">Choose Payment Method</h6>
                                </div>
                                <div className="d-grid gap-2">
                                    <button
                                        className="btn btn-outline-primary rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handlePaymentMethodSelect('stripe')}
                                        disabled={is_loading}
                                    >
                                        <Image src="https://img.icons8.com/color/512/stripe.png" alt="stripe" width="20" height="20" />
                                        Pay with Stripe
                                    </button>
                                    <button
                                        className="btn btn-outline-success rounded-pill py-2 d-flex align-items-center justify-content-center gap-2"
                                        onClick={() => handlePaymentMethodSelect('razorpay')}
                                        disabled={is_loading}
                                    >
                                        <Image src="https://img.icons8.com/color/512/google-pay.png" alt="razorpay" width="20" height="20" />
                                        Pay with Razorpay
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary rounded-pill py-2"
                                        onClick={() => setShowPaymentOptions(false)}
                                        disabled={is_loading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const PaymentPlans = ({ set_show_plans, set_is_subscription }: any) => {
    const currentUser = useSelector((state: any) => state?.user)
    const [plans, set_plans] = useState([])
    const [is_loading, set_is_loading] = useState(false)
    const [error_message, set_error_message] = useState("")
    const [success_message, set_success_message] = useState("")
    
    // Donation state
    const [donationPercentage, setDonationPercentage] = useState(3); // Default 3%
    const [showDonationOptions, setShowDonationOptions] = useState(false)

    useEffect(() => { get_plans() }, [])

    const get_plans = async () => {
        try {
            set_is_loading(true)
            const resp = await axios.get(`${baseUrl}/subscription-plans`, authorizationObj)
            set_is_loading(false)
            set_plans(resp?.data?.data)
        } catch (error) {
            set_plans([])
            set_is_loading(false)
        }
    }

    const handleStripeSelect = async (plan: any) => {
        set_is_loading(true);
        set_error_message("");
        try {
            const stripe = await stripePromise;
            
            // Calculate donation amount
            const planPrice = Number(plan.plan_price);
            const donationAmount = (planPrice * donationPercentage) / 100;
            const totalAmount = planPrice + donationAmount;
            
            const response = await axios.post("/api/create-checkout-session", {
                plan_id: plan.id,
                customer_email: currentUser?.email,
                success_url: window.location.origin + "/institution/admin/dashboard?success=true",
                cancel_url: window.location.origin + "/institution/admin/dashboard?canceled=true",
                amount: Math.round(totalAmount * 100),
                currency: "usd",
                metadata: {
                    plan_id: plan.id,
                    plan_name: plan.plan_name,
                    user_id: currentUser?.institute_id,
                    donation_amount: donationAmount,
                    donation_percentage: donationPercentage,
                    original_amount: planPrice,
                    total_amount: totalAmount
                },
            });
            const sessionId = response.data.sessionId;
            if (stripe && sessionId) {
                await stripe.redirectToCheckout({ sessionId });
            } else {
                set_error_message("Stripe session could not be created.");
            }
        } catch (err: any) {
            set_error_message(err?.response?.data?.error || "Something went wrong. Please try again.");
        } finally {
            set_is_loading(false);
        }
    };

    const handleRazorpaySelect = async (plan: any) => {
        set_is_loading(true);
        set_error_message("");
        try {
            const res = await loadRazorpayScript();
            if (!res) {
                set_error_message("Failed to load Razorpay SDK. Please check your internet connection.");
                set_is_loading(false);
                return;
            }

            // Calculate donation amount
            const planPrice = Number(plan.plan_price);
            const donationAmount = (planPrice * donationPercentage) / 100;
            const totalAmount = planPrice + donationAmount;
            const totalAmountINR = totalAmount * 83; // Convert USD to INR

            const response = await axios.post('/api/razorpay-subscription-payment', {
                customer_email: currentUser?.email,
                currency: 'INR',
                amount: Math.round(totalAmountINR * 100), // Convert to paise
                metadata: {
                    plan_id: plan.id,
                    plan_name: plan.plan_name,
                    user_id: currentUser?.institute_id,
                    payment_type: 'subscription_plan',
                    donation_amount: donationAmount,
                    donation_percentage: donationPercentage,
                    original_amount: planPrice,
                    total_amount: totalAmount
                }
            });

            const { orderId, key, amount, currency } = response.data;
            if (!orderId || !key) {
                set_error_message("Razorpay payment gateway is not working properly.");
                set_is_loading(false);
                return;
            }

            const options = {
                key,
                amount,
                currency,
                name: "KIAcademy",
                description: `Subscription Plan: ${plan.plan_name}`,
                order_id: orderId,
                handler: async function (response: any) {
                    try {
                        console.log('Razorpay subscription payment successful:', response);
                        
                        // Store payment details in localStorage for verification
                        const paymentDetails = {
                            paymentId: response.razorpay_payment_id,
                            orderId: orderId,
                            signature: response.razorpay_signature,
                            amount: amount,
                            currency: currency,
                            plan_id: plan.id,
                            plan_name: plan.plan_name,
                            user_id: currentUser?.institute_id
                        };
                        localStorage.setItem('razorpay_subscription_payment_details', JSON.stringify(paymentDetails));
                        
                        // Redirect to dashboard with payment parameters for verification
                        const redirectUrl = `${window.location.origin}/institution/admin/dashboard?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${orderId}&razorpay_signature=${response.razorpay_signature}&subscription_success=true`;
                        window.location.href = redirectUrl;
                        
                    } catch (err: any) {
                        console.error('Razorpay Handler Error:', err);
                        set_error_message('Payment succeeded but verification failed: ' + (err?.message || 'Unknown error'));
                    }
                },
                prefill: {
                    email: currentUser?.email,
                },
                theme: { color: "#3399cc" }
            };

            const RazorpayConstructor = (window as any).Razorpay;
            if (!RazorpayConstructor) {
                set_error_message("Razorpay SDK not loaded");
                set_is_loading(false);
                return;
            }
            const rzp = new RazorpayConstructor(options);
            rzp.open();
        } catch (error: any) {
            set_error_message(error?.message || "Failed to initiate Razorpay checkout");
        } finally {
            set_is_loading(false);
        }
    };

    return (
        <div className="container-fluid py-5">
            {/* Header Section */}
            <div className="row justify-content-center mb-5">
                <div className="col-lg-8 text-center">
                    <p className="lead text-muted">Select the perfect subscription plan for your institution</p>
                    
                    {/* Donation Toggle */}
                    <div className="mt-4">
                        <div className="form-check form-switch d-inline-block">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id="donationToggle"
                                checked={showDonationOptions}
                                onChange={(e) => setShowDonationOptions(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="donationToggle">
                                <strong>Add donation to support our platform</strong>
                            </label>
                        </div>
                        {showDonationOptions && (
                            <div className="mt-2">
                                <small className="text-muted">
                                    Your donation helps us maintain and improve our educational platform
                                </small>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Error and Success Messages */}
            {error_message && (
                <div className="row justify-content-center mb-4">
                    <div className="col-lg-8">
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>Error!</strong> {error_message}
                            <button type="button" className="btn-close" onClick={() => set_error_message("")}></button>
                        </div>
                    </div>
                </div>
            )}
            
            {success_message && (
                <div className="row justify-content-center mb-4">
                    <div className="col-lg-8">
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <strong>Success!</strong> {success_message}
                            <button type="button" className="btn-close" onClick={() => set_success_message("")}></button>
                        </div>
                    </div>
                </div>
            )}

            {/* Plans Grid */}
            <div className="row justify-content-center">
                {plans?.map((plan: any, i: number) => (
                    <SinglePlan
                        key={i}
                        plan={plan}
                        handleSelect={handleStripeSelect}
                        handleRazorpaySelect={handleRazorpaySelect}
                        is_loading={is_loading}
                        donationPercentage={donationPercentage}
                        setDonationPercentage={setDonationPercentage}
                        showDonationOptions={showDonationOptions}
                        setShowDonationOptions={setShowDonationOptions}
                    />
                ))}
            </div>            
        </div>
    )
}

export default PaymentPlans
