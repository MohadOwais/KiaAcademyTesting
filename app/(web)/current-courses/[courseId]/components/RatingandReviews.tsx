import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from "react-redux";
import { serverToken, baseUrl, authorizationObj } from "@/app/utils/core";
import moment from 'moment';
import { capitalizeString } from '@/app/utils/functions';
import Image from 'next/image'

const RatingandReviews = ({ courseId }: any) => {
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const currentUser = useSelector((state: any) => state?.user);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${baseUrl}/course-reviews/${courseId}`, authorizationObj); // Adjust the API endpoint as needed
            setReviews(response?.data?.data ? response?.data?.data : []);
        } catch (error) {
            // console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!currentUser?.role_id || currentUser?.role_id !== "3") return;

        const formData = new FormData();
        formData.append('rating', rating.toString());
        formData.append('comment', review);
        formData.append('course_id', courseId);
        formData.append('student_id', currentUser?.user_id);

        setLoading(true);
        try {
            const resp = await axios.post(`${baseUrl}/course-reviews/create`, formData, {
                withCredentials: true,
                headers: { Authorization: serverToken },
            });
            setRating(0);
            setReview('');
            fetchReviews();
        } catch (error) {
            // console.error('Error submitting review:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card m-3 shadow border-0">
            <div className="card-body">
                <h5 className="card-title mb-4">Student Reviews</h5>

                {loading && (
                    <div className="d-flex justify-content-center mb-4">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}

                {!loading && reviews.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-muted mb-0">No student reviews for this course</p>
                    </div>
                ) : (
                    <div className="row">
                        {reviews?.map((rev: any, index: number) => (
                            <div className="col-12 col-md-4 mb-3" key={index}>
                                <div className="card border-0 shadow">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center gap-3">
                                            <Image 
                                                src={rev?.profile_picture || '/default-avatar.png'} 
                                                className="rounded-circle"
                                                alt="Student review"
                                                width={40}
                                                height={40}
                                            />
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0">
                                                        {rev?.first_name} {rev?.last_name}
                                                    </h6>
                                                    <small className="text-muted">
                                                        {capitalizeString(moment(rev?.created_at).fromNow())}
                                                    </small>
                                                </div>
                                                <div className="rating mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} 
                                                           className={`bi ${i < rev.rating ? 'bi-star-fill' : 'bi-star'} 
                                                                      text-warning`}
                                                        ></i>
                                                    ))}
                                                </div>
                                                <p className="card-text text-secondary mb-0">
                                                    {rev.comment}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RatingandReviews;
