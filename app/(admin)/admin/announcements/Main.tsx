"use client"

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { baseUrl, authorizationObj } from '@/app/utils/core';
import { toast, Toaster } from 'react-hot-toast';
import SentNotificationList from './components/notifications/SentNotificationList';
import SendNotificationModal from './components/notifications/SendNotificationModal';
import { FaPaperPlane } from 'react-icons/fa';
import { useRouter } from 'next/navigation';



const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...authorizationObj.headers
  }
});



const Main = () => {
  const router = useRouter();
  const currentUser = useSelector((state: any) => state?.user);
  const [sentNotifications, setSentNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restrict access: must be logged in and have a specific role_id (e.g., '1' for admin)
  useEffect(() => {
    const allowedRoleIds = ["1"]; // Add allowed role_id(s) here, e.g., ["1", "2"]
    if (!currentUser?.user_id || !currentUser?.role_id || !allowedRoleIds.includes(String(currentUser.role_id))) {
      toast.error('You must be logged in with proper access to view this page.');
      router.replace('/auth/login');
    }
  }, [currentUser, router]);

  const fetchSentNotifications = async () => {
    try {
      setLoading(true);
      const resp = await api.get(`/notifications/sent_notification/${currentUser?.user_id}`);
      // Sort notifications by created_at descending (most recent first)
      const notifications = (resp.data || []).slice().sort((a: any, b: any) => {
        if (!a.created_at || !b.created_at) return 0;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      setSentNotifications(notifications);
    } catch (err: any) {
      toast.error('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.user_id) fetchSentNotifications();
  }, [currentUser]);

  return (
    <div className="mt-4">
      <Toaster position="top-center" toastOptions={{ duration: 10000, style: { fontSize: '1.1rem', fontWeight: 500 } }} />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className='heading-style'>Sent Notifications</h3>

        <button className="btn btn-view text-white rounded-pill" onClick={() => setShowModal(true)}>
        <FaPaperPlane className=" text-white me-2" />
          Send</button>
      </div>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <SentNotificationList notifications={sentNotifications} />
      )}
      <SendNotificationModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchSentNotifications}
        senderId={currentUser?.user_id}
      />
    </div>
  );
};

export default Main;
