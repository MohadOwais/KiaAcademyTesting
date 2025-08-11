import "./Main.css"
import React from 'react'
import { IoCartOutline } from "react-icons/io5";
import CourseCard from '@/app/components/CourseCard';
import CourseCardSkeleton from '@/app/components/mui/CourseCardSkeleton'
import { Typography } from '@mui/material';
import PaymentOptions from './PaymentOptions';

export const EmptyCart = () => {
    return (
        <div className="container-fluid py-5">
            <div className="row justify-content-center">
                <div className="col-12 text-center">
                    <IoCartOutline style={{ fontSize: "120px" }} className="mb-4" />
                    <Typography variant="h4" component="h2" className="fw-bold">
                        Your Cart is Empty
                    </Typography>
                </div>
            </div>
        </div>
    );
};

interface CartComponentProps {
    data: any[];
    get_data: () => void;
    is_loading: boolean;
    set_is_loading: (loading: boolean) => void;
    onStripePayment: () => void;
    onPhonePePayment: () => void;
    totalAmount: number;
}

const CartComponent: React.FC<CartComponentProps> = ({
    data,
    get_data,
    is_loading,
    set_is_loading,
    onStripePayment,
    onPhonePePayment,
    totalAmount
}) => {
    if (is_loading) {
        return (
            <div className="row g-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="col-12 col-sm-6 col-lg-3">
                        <CourseCardSkeleton />
                    </div>
                ))}
            </div>
        );
    }

    if (!data?.length) {
        return <EmptyCart />;
    }

    return (
        <div className="row">
            {/* Course Cards */}
            <div className="col-12 col-lg-8">
                <div className="row g-4">
                    {data.map((course, index) => (
                        <div key={course.course_id || index} className="col-12 col-sm-6">
                            <CourseCard
                                course={{
                                    ...course,
                                    display_price: course.display_price || course.course_price,
                                    currency: course.currency || course.display_currency
                                }}
                                options={{
                                    is_cart: true,
                                    onRefresh: get_data
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Options */}
            <div className="col-12 col-lg-4">
                <PaymentOptions
                    onStripeClick={onStripePayment}
                    onPhonePeClick={onPhonePePayment}
                    isLoading={is_loading}
                    totalAmount={totalAmount}
                    currency={data[0]?.currency || 'USD'}
                />
            </div>
        </div>
    );
};

export default CartComponent
