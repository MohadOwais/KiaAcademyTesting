"use client";

import "./Main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  MdPeople,
   MdSchool,
  MdPersonAdd,
  MdLibraryBooks,
  MdLiveTv,
  MdHourglassEmpty
} from "react-icons/md";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

// To hide a card, just comment out its entry below
export const iconMapping: Record<string, React.ReactNode> = {
  total_courses: <MdLibraryBooks title="Total Courses" size={24} className="analytics-icon" />,
  total_live_courses: <MdLiveTv title="Total Live Courses" size={24} className="analytics-icon" />,
  total_requested_courses: <MdHourglassEmpty title="Total Requested Courses" size={24} className="analytics-icon" />,
  total_students: <MdSchool title="Total Students" size={24} className="analytics-icon" />,
  total_instructors: <MdPersonAdd title="Total Instructors" size={24} className="analytics-icon" />,
};

const formatLabel = (key: string): string => {
  return key
    .replace(/^total_/, "") // Remove "total_" prefix
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize each word
};

const Main: React.FC = () => {
  const [statistics, setStatistics] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState<boolean>(true);
  const currentUser = useSelector((state: any) => state.user);

  // Payment-related state
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  const [success_message, set_success_message] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const processedSessionId = useRef<string | null>(null);
  const processedRazorpayPayment = useRef<string | null>(null);

  const getAllStatistics = async (userId: string) => {
    try {
      const response = await axios.get(
        `${baseUrl}/dashboard/institute/${userId}`,
        authorizationObj
      );
      // console.log("Response from API:", response.data);
      console.log("URL:", `${baseUrl}/dashboard/institute/${userId}`);
      // Accept both {status: 200, data: {...}} and direct object
      if (response.data && typeof response.data === 'object' && 'status' in response.data && response.data.status === 200) {
        setStatistics(response.data.data);
      } else if (response.data && typeof response.data === 'object' && !('status' in response.data)) {
        setStatistics(response.data);
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  // Payment: verify Stripe session
  const verifyStripeSession = async (sessionId: string) => {
    try {
      const response = await axios.post('/api/verify-stripe-session', {
        sessionId,
        institute_id: currentUser?.institute_id
      });
      const session = response?.data;
      const payment_method_type = session.payment_intent.payment_method_types[0];
      
      console.log('Stripe session data:', session);
      
      if (session.status === "complete" || session.payment_status === "paid") {
        try {
          // Create payment record with subscription data
          const paymentId = await create_payment(
            (session.amount / 100).toString(), // Convert from cents to dollars
            session.currency || "usd",
            payment_method_type,
            session.payment_intent.id,
            session.payment_intent.status,
            {
              plan_id: session.metadata?.plan_id,
              plan_name: session.metadata?.plan_name,
              user_id: session.metadata?.user_id,
              payment_type: 'subscription_plan',
              donation_amount: session.metadata?.donation_amount || 0,
              donation_percentage: session.metadata?.donation_percentage || 0
            }
          );
          
          console.log('Payment created with ID:', paymentId);
          
          // Create subscription record
          const formData = new FormData();
          formData.append("payment_id", paymentId); // Use our payment ID, not Stripe's
          formData.append("plan_id", session.metadata?.plan_id ?? '');
          formData.append("is_trial", "false");
          formData.append("institute_id", currentUser?.institute_id ?? '');
          
          const subscriptionResponse = await axios.post(
            `${baseUrl}/subscriptions/create`,
            formData,
            authorizationObj
          );
          
          console.log('Subscription created:', subscriptionResponse.data);
          
          setPaymentStatus({
            status: 'success',
            message: `Payment of $${(session.amount / 100).toFixed(2)} completed and subscription activated!`,
            data: session
          });
          set_success_message("Plan subscribed successfully");
          setTimeout(() => {
            set_success_message("");
          }, 3000);
          return true;
        } catch (error: any) {
          console.error('Error creating payment or subscription:', error);
          setPaymentStatus({
            status: 'error',
            message: error.message || 'Failed to activate subscription',
            data: session
          });
          return false;
        }
      } else {
        setPaymentStatus({
          status: 'error',
          message: 'Payment verification failed',
          data: session
        });
        return false;
      }
    } catch (error: any) {
      console.error('Stripe verification error:', error);
      setPaymentStatus({
        status: 'error',
        message: error.message || 'Failed to verify payment'
      });
      return false;
    }
  };

  // Payment: verify Razorpay subscription
  const verifyRazorpaySubscription = async (paymentId: string, orderId: string, signature: string) => {
    try {
      const response = await axios.post('/api/verify-razorpay-subscription', {
        paymentId,
        orderId,
        signature,
        institute_id: currentUser?.institute_id
      });
      
      const session = response?.data;
      console.log('Razorpay subscription session data:', session);
      
      if (session.payment_status === "paid" || session.status === "captured") {
        try {
          // Create payment record with subscription data
          const paymentRecordId = await create_payment(
            (session.amount / 100).toString(), // Convert from paise to rupees
            session.currency || "inr",
            'Razorpay',
            session.payment_id,
            session.payment_status,
            {
              plan_id: session.subscription_data?.plan_id,
              plan_name: session.subscription_data?.plan_name,
              user_id: session.subscription_data?.user_id,
              payment_type: 'subscription_plan',
              donation_amount: session.metadata?.donation_amount || 0,
              donation_percentage: session.metadata?.donation_percentage || 0
            }
          );
          
          console.log('Razorpay payment created with ID:', paymentRecordId);
          
          // Create subscription record
          const formData = new FormData();
          formData.append("payment_id", paymentRecordId); // Use our payment ID
          formData.append("plan_id", session.subscription_data?.plan_id ?? '');
          formData.append("is_trial", "false");
          formData.append("institute_id", currentUser?.institute_id ?? '');
          
          const subscriptionResponse = await axios.post(
            `${baseUrl}/subscriptions/create`,
            formData,
            authorizationObj
          );
          
          console.log('Razorpay subscription created:', subscriptionResponse.data);
          
          setPaymentStatus({
            status: 'success',
            message: `Payment of ₹${(session.amount / 100).toFixed(2)} completed and subscription activated!`,
            data: session
          });
          set_success_message("Plan subscribed successfully");
          setTimeout(() => {
            set_success_message("");
          }, 3000);
          return true;
        } catch (error: any) {
          console.error('Error creating Razorpay payment or subscription:', error);
          setPaymentStatus({
            status: 'error',
            message: error.message || 'Failed to activate subscription',
            data: session
          });
          return false;
        }
      } else {
        setPaymentStatus({
          status: 'error',
          message: 'Razorpay payment verification failed',
          data: session
        });
        return false;
      }
    } catch (error: any) {
      console.error('Razorpay verification error:', error);
      setPaymentStatus({
        status: 'error',
        message: error.message || 'Failed to verify Razorpay payment'
      });
      return false;
    }
  };

  // Payment: create payment helper
  const create_payment = async (amount: string, currency: string, payment_method: string, transactionId: string, paymentStatus: string, additionalData?: any) => {
    try {
      const formData = new FormData();
      formData.append("amount", amount);
      formData.append("user_id", currentUser?.institute_id);
      formData.append("currency", currency);
      formData.append("payment_method", payment_method);
      formData.append("transaction_id", transactionId);
      formData.append("payment_status", paymentStatus);
      
      // Add subscription-specific data
      if (additionalData) {
        console.log('Adding additional payment data:', additionalData);
        if (additionalData.plan_id) {
          formData.append("plan_id", additionalData.plan_id);
        }
        if (additionalData.plan_name) {
          formData.append("plan_name", additionalData.plan_name);
        }
        if (additionalData.payment_type) {
          formData.append("payment_type", additionalData.payment_type);
        }
        if (additionalData.donation_amount) {
          formData.append("donation", additionalData.donation_amount.toString());
        }
        if (additionalData.donation_percentage) {
          formData.append("donation_percentage", additionalData.donation_percentage.toString());
        }
      }
      
      console.log('Payment FormData:');
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      
      const response = await axios.post(`${baseUrl}/payment/process`, formData, authorizationObj);
      if (response?.data?.status > 299 || response?.data?.status < 199) {
        throw new Error(response?.data?.message || 'Payment creation failed');
      }
      
      console.log('Payment created successfully:', response.data);
      return response.data.id;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  };

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");
    
    // Razorpay subscription payment parameters
    const razorpayPaymentId = searchParams.get("razorpay_payment_id");
    const razorpayOrderId = searchParams.get("razorpay_order_id");
    const razorpaySignature = searchParams.get("razorpay_signature");
    const subscriptionSuccess = searchParams.get("subscription_success");

    console.log("URL Parameters:", {
      sessionId, success, canceled,
      razorpayPaymentId, razorpayOrderId, razorpaySignature, subscriptionSuccess
    });

    // Process Stripe payment
    if (sessionId && processedSessionId.current !== sessionId) {
      processedSessionId.current = sessionId;
      verifyStripeSession(sessionId).then((result) => {
        if (result === true) {
          toast.success("Payment completed and subscription activated!");
        } else {
          toast.error("Payment verification failed or subscription not activated.");
        }
        router.replace("/institution/admin/dashboard");
      });
    }
    
    // Process Razorpay subscription payment
    else if (razorpayPaymentId && razorpayOrderId && razorpaySignature && subscriptionSuccess === "true") {
      const paymentKey = `${razorpayPaymentId}_${razorpayOrderId}`;
      if (processedRazorpayPayment.current !== paymentKey) {
        processedRazorpayPayment.current = paymentKey;
        verifyRazorpaySubscription(razorpayPaymentId, razorpayOrderId, razorpaySignature).then((result) => {
          if (result === true) {
            toast.success("Razorpay payment completed and subscription activated!");
          } else {
            toast.error("Razorpay payment verification failed or subscription not activated.");
          }
          router.replace("/institution/admin/dashboard");
        });
      }
    }
    
    // Check localStorage for Razorpay subscription payment details
    else if (!razorpayPaymentId && !razorpayOrderId && !razorpaySignature) {
      const storedPaymentDetails = localStorage.getItem('razorpay_subscription_payment_details');
      if (storedPaymentDetails) {
        try {
          const details = JSON.parse(storedPaymentDetails);
          if (details.paymentId && details.orderId && details.signature) {
            const paymentKey = `${details.paymentId}_${details.orderId}`;
            if (processedRazorpayPayment.current !== paymentKey) {
              processedRazorpayPayment.current = paymentKey;
              verifyRazorpaySubscription(details.paymentId, details.orderId, details.signature).then((result) => {
                if (result === true) {
                  toast.success("Razorpay payment completed and subscription activated!");
                } else {
                  toast.error("Razorpay payment verification failed or subscription not activated.");
                }
                localStorage.removeItem('razorpay_subscription_payment_details');
                router.replace("/institution/admin/dashboard");
              });
            }
          }
        } catch (error) {
          console.error('Error parsing stored payment details:', error);
          localStorage.removeItem('razorpay_subscription_payment_details');
        }
      }
    }
    
    // Handle success/cancel messages
    else if (success === "true" || canceled === "true") {
      if (success === "true") {
        toast.success("Payment completed successfully!");
      } else {
        toast.error("Payment was canceled.");
      }
      setTimeout(() => {
        router.replace("/institution/admin/dashboard");
      }, 2000);
    }
  }, [searchParams, currentUser, router]);

  useEffect(() => {
    if (currentUser?.user_id) {
      getAllStatistics(currentUser.user_id);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoleIds={["4"]}>
      <div className="py-4">
        <h3
          className="mb-4 fw-bold"
          style={{
            color: "var(--color-dark-2)",
            fontWeight: 900,
          }}
        >
          Dashboard
        </h3>
        <div className="row g-4">
          {Object.entries(statistics)
            .filter(([key]) => key in iconMapping)
            .map(([key, value], idx) => {
              return (
                <div key={key} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex mb-1">
                  <div className="card border rounded-4 h-100 analytics-card w-100">
                    <div className="card-body d-flex flex-column justify-content-between align-items-start p-4">
                      <div className="d-flex align-items-center mb-3 w-100 justify-content-between">
                        <div className="analytics-icon-bg d-flex align-items-center justify-content-center me-2">
                          {iconMapping[key] || (
                            <MdPeople
                              size={20}
                              className="analytics-icon"
                              style={{ color: "var(--color-dark-2)" }}
                            />
                          )}
                        </div>
                        <span
                          className="badge fw-semibold rounded-pill fs-6 px-3 py-2 text-wrap"
                          style={{
                            color: "var(--color-dark-2)",
                            border: 0,
                            backgroundColor: "#f8f9fa",
                            fontWeight: 600,
                            fontSize: "1rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          <span>{formatLabel(key)}</span>
                        </span>
                      </div>
                      <div className="w-100 text-end mt-auto">
                        <span
                          className="display-5 fw-bold"
                          style={{
                            letterSpacing: 1,
                            color: "var(--statistics-numbers)",
                          }}
                        >
                          {value !== null ? value.toLocaleString() : 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Main;