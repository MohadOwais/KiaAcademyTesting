import "./Main.css";
import React from 'react';
import { IoCart } from "react-icons/io5";
import axios from 'axios';
import { authorizationObj, baseUrl, courseThumbnailPath } from '@/app/utils/core';
import Image from "next/image";
import DeleteIcon from '@mui/icons-material/Delete';
import placeholderImage from '@/public/images/placeholder.png';

export const EmptyCart = () => {
    return (
        <div className="d-flex flex-column justify-content-end align-items-center h-100 py-5">
            <IoCart style={{ fontSize: "120px", color: "#6c757d" }} />
            <p className="text-center text-secondary fs-4 fw-bold mb-0">No Items</p>
        </div>
    );
};

interface CartComponentProps {
    data: any[];
    get_data: () => void;
    is_loading: boolean;
    set_is_loading: (loading: boolean) => void;
    user_id: string;
}

const CartComponent: React.FC<CartComponentProps> = ({ data, get_data, is_loading, set_is_loading, user_id }) => {
    const remove_from_cart = async (courseId: string) => {
        if (!courseId) return;
        
        try {
            set_is_loading(true);
            const response = await axios.delete(`${baseUrl}/cart/remove/${user_id}/${courseId}`, authorizationObj)

            console.log('Response:', response);
            if (response?.data?.status >= 200 && response?.data?.status < 300) {
                await get_data();
            }
        } catch (error: any) {
            console.error('Error removing from cart:', error?.message || 'Unknown error occurred');
        } finally {
            set_is_loading(false);
        }
    };

    if (is_loading) {
        return (
            <div className="d-flex justify-content-center align-items-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!data?.length) {
        return <EmptyCart />;
    }

    return (
        <div className="container-fluid px-0">
            {/* Desktop View */}
            <div className="d-none d-md-block">
                <div className="table-responsive rounded-2 overflow-hidden shadow-sm border">
                    <table className="table table-borderless align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="text-center py-3 px-4">Course Details</th>
                                <th className="text-center py-3 px-4">Price</th>
                                <th className="text-center py-3 px-4">Remove</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item: any) => {
                                const imageUrl = item?.course_thumbnail
                                    ? `${courseThumbnailPath}/${item.course_thumbnail}`
                                    : placeholderImage.src;

                                return (
                                    <tr key={item.course_id}>
                                        <td>
                                            <div className="d-flex align-items-start gap-3">
                                                <div className="position-relative" style={{ width: 48, height: 48 }}>
                                                    <Image
                                                        src={imageUrl}
                                                        alt={item.course_title || 'Course Image'}
                                                        fill
                                                        sizes="48px"
                                                        className="rounded-2 object-fit-cover border p-1"
                                                        priority
                                                    />
                                                </div>
                                                <div>
                                                    <div className="fw-semibold">{item.course_title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <strong>{item.currency}</strong> {item.display_price}
                                        </td>
                                        <td className="text-center">
                                            <button
                                                className="btn btn-link p-0" style={{color: "#AEAEAE"}}
                                                onClick={() => remove_from_cart(item.course_id)}
                                                disabled={is_loading}
                                                aria-label="Remove from cart"
                                            >
                                                <DeleteIcon sx={{ fontSize: "20px" }} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="d-md-none">
                {data.map((item: any) => {
                    const imageUrl = item?.course_thumbnail
                        ? `${courseThumbnailPath}/${item.course_thumbnail}`
                        : placeholderImage.src;

                    return (
                        <div key={item.course_id} className="card mb-3 shadow-sm">
                            <div className="card-body">
                                <div className="d-flex align-items-start gap-3 mb-3">
                                    <div className="position-relative" style={{ width: 64, height: 64 }}>
                                        <Image
                                            src={imageUrl}
                                            alt={item.course_title || 'Course Image'}
                                            fill
                                            sizes="64px"
                                            className="rounded-2 object-fit-cover border p-1"
                                            priority
                                        />
                                    </div>
                                    <div className="flex-grow-1">
                                        <h6 className="fw-semibold mb-2">{item.course_title}</h6>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="fs-6">
                                                <strong>{item.currency}</strong> {item.display_price}
                                            </div>
                                            <button
                                                className="btn btn-link p-0 " style={{color: "#AEAEAE"}}
                                                onClick={() => remove_from_cart(item.course_id)}
                                                disabled={is_loading}
                                                aria-label="Remove from cart"
                                            >
                                                <DeleteIcon sx={{ fontSize: "24px" }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CartComponent;