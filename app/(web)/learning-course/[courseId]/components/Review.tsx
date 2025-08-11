'use client';

import "./Main.css";
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import toast, { Toaster } from "react-hot-toast";
import { confirmAlert } from 'react-confirm-alert';

interface ReviewProps {
    courseId: string;
    show: boolean;
    onClose: () => void;
    existingReview?: any;
}
const Review: React.FC<ReviewProps> = ({ courseId, show, onClose, existingReview }) => {

    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [hover, setHover] = useState(0);
    const [review, setReview] = useState(existingReview?.comment || '');
    const [hasReviewed, setHasReviewed] = useState<boolean>(false);
    const [existingReviewState, setExistingReviewState] = useState(existingReview);

    const checkUserReview = async (courseId: string, studentId: string) => {
        try {
            const response = await axios.get(`${baseUrl}/course-reviews/${courseId}`, {
                ...authorizationObj,
            });
            const reviews = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data.data)
                    ? response.data.data
                    : [];
            const userReview = reviews.find((review: any) => String(review.student_id) === String(studentId));
            if (userReview) {
                setHasReviewed(true);
            } else {
                setHasReviewed(false);
                console.warn('No review found for this user after refresh. Reviews array:', reviews, 'studentId:', studentId);
            }
        } catch (error) {
        }
    };

    // Get currentUser from Redux store
     const currentUser = useSelector((state: any) => state?.user)
    // Get course from Redux store (if needed)
    const course = useSelector((state: any) => state.course?.courseData);
    // Call this function to check if the user has reviewed
    useEffect(() => {
        if (currentUser?.user_id && course?.[0]?.course_id) {
            checkUserReview(course[0].course_id, currentUser.user_id);
        }
    }, [currentUser?.user_id, course?.[0]?.course_id]);

    useEffect(() => {
        if (existingReview) {
            setExistingReviewState(existingReview);
            setRating(existingReview.rating || 0);
            setReview(existingReview.comment || '');
        }
    }, [existingReview]);

    const handleSubmitReview = async () => {
        try {
            // Try to get course_id from course[0].course_id, fallback to courseId prop
            const resolvedCourseId = course?.[0]?.course_id || courseId;
            if (!resolvedCourseId || !currentUser?.user_id) {
                toast.error('Course or user information is missing. Please reload the page or contact support.');
                return;
            }
            let reviewResponse;
            if (existingReviewState && existingReviewState.review_id) {
                // Update the review (POST request to /update) with FormData
                const reviewId = existingReviewState.review_id;
                const formData = new FormData();
                formData.append('course_id', resolvedCourseId);
                formData.append('student_id', currentUser.user_id);
                formData.append('rating', rating.toString());
                formData.append('comment', review);
                reviewResponse = await axios.post(
                    `${baseUrl}/course-reviews/update/${reviewId}`,
                    formData,
                    {
                        ...authorizationObj
                    }
                );
                if (reviewResponse.data && reviewResponse.data.data) {
                    setHasReviewed(true);
                    setRating(reviewResponse.data.data.rating || 0);
                    setReview(reviewResponse.data.data.comment || '');
                    setExistingReviewState(reviewResponse.data.data);
                    toast.success('Review updated successfully!');
                } else {
                    toast.error('Review not updated. Please try again.');
                    return;
                }
            } else {
                // Create a new review (POST request to /create) with FormData
                const formData = new FormData();
                formData.append('course_id', resolvedCourseId);
                formData.append('student_id', currentUser.user_id);
                formData.append('rating', rating.toString());
                formData.append('comment', review);
                reviewResponse = await axios.post(`${baseUrl}/course-reviews/create`, formData, {
                    ...authorizationObj
                });
                setHasReviewed(true);
                if (reviewResponse.data && reviewResponse.data.data) {
                    setExistingReviewState(reviewResponse.data.data);
                    toast.success('Review sent successfully!');
                } else {
                    toast.error('Review not sent. Please try again.');
                    return;
                }
            }
            setRating(0);
            setReview('');
            onClose();
            if (resolvedCourseId && currentUser?.user_id) {
                await checkUserReview(resolvedCourseId, currentUser.user_id);
            }
        } catch (error: any) {
            if (existingReviewState && existingReviewState.review_id) {
                toast.error('Review not updated. Please try again.');
            } else {
                toast.error('Review not sent. Please try again.');
            }
            if (error.response) {
                console.error('Error submitting review:', error.response.status, error.response.data);
            } else {
                console.error('Error submitting review:', error);
            }
            return;
        }
        window.location.reload();
    };

    return (
        <>
            {/* Fallback Toaster for local modal use, but recommend placing <Toaster /> in app/layout.tsx for global toasts */}
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 4000 }} />
            {show && (
                <div
                    className="modal show"
                    id="ratingModal"
                    tabIndex={-1}
                    aria-labelledby="ratingModalLabel"
                    aria-hidden="true"
                    style={{
                        zIndex: 9999,
                        display: 'block',
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.5)'
                    }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg" style={{ pointerEvents: 'auto' }}>
                        <div className="modal-content p-3">
                            <div className="modal-body">
                                <a
                                    href="#"
                                    className="text-decoration-none mb-2 d-inline-block"
                                    style={{ color: 'purple' }}
                                    onClick={e => { e.preventDefault(); onClose(); }}
                                >
                                    &larr; Back
                                </a>

                                <h4 className="text-center fw-bold">Why did you leave this rating?</h4>
                                <p className="fw-bold text-center">Amazing, above expectations!</p>

                                <div className="d-flex justify-content-center gap-2 mb-3">
                                    {[...Array(5)].map((_, i) => {
                                        const current = i + 1;
                                        return (
                                            <span
                                                key={i}
                                                style={{
                                                    fontSize: '2rem',
                                                    color: current <= (hover || rating) ? 'orange' : '#ccc',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setRating(current)}
                                                onMouseEnter={() => setHover(current)}
                                                onMouseLeave={() => setHover(0)}
                                            >
                                                &#9733;
                                            </span>
                                        );
                                    })}
                                </div>

                                <div className="mb-3">
                                    <textarea
                                        className="form-control"
                                        rows={4}
                                        placeholder="Tell us about your own personal experience taking this course. Was it a good match for you?"
                                        value={review}
                                        onChange={(e) => setReview(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="text-end">
                                    <button
                                        type="button"
                                        className="btn btn-dark"
                                        onClick={() => { handleSubmitReview(); }}
                                    >
                                        Save and Continue
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Review;