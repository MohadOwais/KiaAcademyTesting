'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import AlertMUI from '@/app/components/mui/AlertMUI';
import { baseUrl, authorizationObj } from '@/app/utils/core';
import { useSelector } from 'react-redux';

interface EnrolledCourse {
    course_id: string;
}

export default function PhonePeStatus() {
    const router = useRouter();
    const params = useParams();
    const { transactionId } = params;
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state: any) => state?.user);
    const [successfulEnrollments, setSuccessfulEnrollments] = useState<string[]>([]);
    const [failedEnrollments, setFailedEnrollments] = useState<string[]>([]);

    const get_user_courses = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/enrollments/student/${currentUser?.user_id}`, authorizationObj);
            return resp?.data?.data || [];
        } catch (error) {
            console.error('Error fetching user courses:', error);
            return [];
        }
    };

    const create_payment = async (price: any, currency: any, title: any, transactionId: string) => {
        if (!price || !currency || !title) return "";

        const formData = new FormData();
        formData.append("amount", price);
        formData.append("currency", currency);
        formData.append("description", `Payment for ${title}`);
        formData.append("user_id", currentUser?.user_id);
        formData.append("payment_method", 'phonepe');
        formData.append("transaction_id", transactionId);

        try {
            const resp = await axios.post(`${baseUrl}/payment/process`, formData, authorizationObj);
            return resp?.data?.payment_id || "";
        } catch (error) {
            console.error('Error creating payment:', error);
            return "";
        }
    };

    const removeFromCart = async (courseId: string) => {
        try {
            await axios.delete(`${baseUrl}/cart/remove/${currentUser?.user_id}/${courseId}`, authorizationObj);
        } catch (error) {
            console.error('Error removing course from cart:', error);
        }
    };

    useEffect(() => {
        const verifyPayment = async () => {
            try {
                const storedTransaction = localStorage.getItem('phonepe_transaction');
                if (!storedTransaction) {
                    throw new Error('Transaction details not found');
                }

                const parsedTransaction = JSON.parse(storedTransaction);
                const courses = parsedTransaction.courses;
                const enrolledCourses = await get_user_courses();

                for (const course of courses) {
                    try {
                        // Check if already enrolled
                        const isEnrolled = enrolledCourses.some((enrolled: EnrolledCourse) => enrolled.course_id === course.id);
                        if (isEnrolled) {
                            await removeFromCart(course.id);
                            setSuccessfulEnrollments(prev => [...prev, course.title]);
                            continue;
                        }

                        // Create payment record
                        const paymentId = await create_payment(
                            course.price,
                            'INR',
                            course.title,
                            transactionId as string
                        );

                        if (!paymentId) {
                            setFailedEnrollments(prev => [...prev, course.title]);
                            continue;
                        }

                        // Create enrollment
                        const enrollFormData = new FormData();
                        enrollFormData.append("user_id", currentUser?.user_id);
                        enrollFormData.append("course_id", course.id);
                        enrollFormData.append("payment_id", paymentId);

                        const resp = await axios.post(
                            `${baseUrl}/enrollment/enroll`,
                            enrollFormData,
                            authorizationObj
                        );

                        if (resp?.data?.status >= 200 && resp?.data?.status <= 299) {
                            await removeFromCart(course.id);
                            setSuccessfulEnrollments(prev => [...prev, course.title]);
                        } else {
                            setFailedEnrollments(prev => [...prev, course.title]);
                        }
                    } catch (error) {
                        console.error('Error processing course:', course.title, error);
                        setFailedEnrollments(prev => [...prev, course.title]);
                    }
                }

                // Redirect based on enrollment results
                if (failedEnrollments.length === 0) {
                    router.push('/student/courses');
                } else {
                    setError('Some enrollments failed. Please contact support.');
                    setTimeout(() => router.push('/student/payment'), 3000);
                }
            } catch (error: any) {
                console.error('Payment verification error:', error);
                setError(error.message || 'Payment verification failed');
                setTimeout(() => router.push('/student/payment?error=payment-failed'), 3000);
            } finally {
                setLoading(false);
                localStorage.removeItem('phonepe_transaction');
            }
        };

        verifyPayment();
    }, [transactionId, router, currentUser]);

    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
                {loading ? (
                    <>
                        <h1 className="text-2xl font-bold mb-4">Verifying Payment...</h1>
                        <p>Please wait while we confirm your payment.</p>
                    </>
                ) : error ? (
                    <div>
                        <AlertMUI text={error} status="error" />
                        {successfulEnrollments.length > 0 && (
                            <div className="mt-3">
                                <h3>Successfully enrolled in:</h3>
                                <ul>
                                    {successfulEnrollments.map((course, index) => (
                                        <li key={index}>{course}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {failedEnrollments.length > 0 && (
                            <div className="mt-3">
                                <h3>Failed to enroll in:</h3>
                                <ul>
                                    {failedEnrollments.map((course, index) => (
                                        <li key={index}>{course}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
} 