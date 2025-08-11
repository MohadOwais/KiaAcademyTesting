'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import { BsBell, BsCheckCircle, BsClock } from 'react-icons/bs';
import { format } from 'date-fns';
import { useSelector } from 'react-redux';

interface Notification {
    notification_id: string;
    title: string;
    message: string;
    is_read: string;
    sent_at: string | null;
    sender_name: string;
    sender_profile: string;
    type: string | null;
}

const Main: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUser = useSelector((state: any) => state?.user);

    const fetchNotifications = async (): Promise<void> => {
        if (!currentUser?.user_id) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const resp = await axios.get(
                `${baseUrl}/notifications/received_notification/${currentUser.user_id}`,
                authorizationObj
            );

            const notificationsData = resp?.data?.data || [];
            const uniqueNotifications = Array.isArray(notificationsData)
                ? notificationsData.filter((n, i, arr) =>
                      arr.findIndex(x => x.notification_id === n.notification_id) === i
                  )
                : [];

            setNotifications(uniqueNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.user_id) {
            fetchNotifications();
        }
    }, [currentUser?.user_id]);

    const getNotificationIcon = (type: string | null) => {
        switch (type?.toLowerCase()) {
            case 'success':
                return <BsCheckCircle className="text-success me-2" />;
            case 'reminder':
                return <BsClock className="text-warning me-2" />;
            default:
                return <BsBell className="text-primary me-2" />;
        }
    };

    const formatDate = (dateString: string | null) => {
        try {
            if (!dateString) return 'No date';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return format(date, 'MMM d, yyyy h:mm a');
        } catch {
            return 'Invalid date';
        }
    };

    if (!currentUser?.user_id) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <h5 className="text-muted">Please sign in to view notifications</h5>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-8">
                    <div className="mb-4">
                        <h3 className="heading-style">Notifications</h3>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="text-center py-5 bg-white shadow-sm rounded">
                            <BsBell size={48} className="text-muted mb-3" />
                            <h5 className="text-muted">No notifications yet</h5>
                            <p className="text-muted">We'll notify you when something important happens.</p>
                        </div>
                    ) : (
                        <div className="list-group shadow-sm rounded overflow-hidden">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.notification_id}
                                    className="list-group-item list-group-item-action border-0 py-3"
                                >
                                    <div className="d-flex align-items-start">
                                        <img
                                            src={notification.sender_profile}
                                            alt={notification.sender_name}
                                            className="rounded-circle me-3"
                                            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between">
                                                <h6 className="mb-1">{notification.title}</h6>
                                                <small className="text-muted">{formatDate(notification.sent_at)}</small>
                                            </div>
                                            <p className="mb-1 text-muted">{notification.message}</p>
                                            <small className="text-muted">
                                                {getNotificationIcon(notification.type)}
                                                From <strong>{notification.sender_name}</strong>
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Main;
