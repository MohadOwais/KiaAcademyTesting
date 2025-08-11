"use client";

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { baseUrl, authorizationObj } from '@/app/utils/core';
import { toast, Toaster } from 'react-hot-toast';
import SentNotificationList from './components/notifications/SentNotificationList';
import ReceivedNotificationList from './components/notifications/ReceivedNotificationList'; // <-- You need this component
import SendNotificationModal from './components/notifications/SendNotificationModal';
import { useRouter } from 'next/navigation';
import { FaPaperPlane } from 'react-icons/fa';
import '../../../components/notifications/notificationButtons.css';

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...authorizationObj.headers
  }
});



const NotificationsPage = () => {
  const router = useRouter();
  const currentUser = useSelector((state: any) => state?.user);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');
  const [sentNotifications, setSentNotifications] = useState([]);
  const [receivedNotifications, setReceivedNotifications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Access control
  useEffect(() => {
    const allowedRoleIds = ["2"];
    if (!currentUser?.user_id || !allowedRoleIds.includes(String(currentUser.role_id))) {
      toast.error('You must be logged in with proper access to view this page.');
      router.replace('/auth/login');
    }
  }, [currentUser, router]);

  // Fetch Sent Notifications
  const fetchSentNotifications = async () => {
    try {
      setLoading(true);
      const resp = await api.get(`${baseUrl}/notifications/sent_notification/${currentUser?.user_id}`);
      // console.log(`${baseUrl}/notifications/sent_notification/${currentUser?.user_id}`);
      const sorted = (resp.data || []).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setSentNotifications(sorted);
    } catch {
      toast.error('Failed to load sent notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Received Notifications
  const fetchReceivedNotifications = async () => {
    try {
      setLoading(true);
      const resp = await api.get(`${baseUrl}/notifications/received_notification/${currentUser?.user_id}`);
      console.log("API response:", resp);
      // Check if response has data property and it's an array
      const notifications = Array.isArray(resp.data?.data) ? resp.data.data : (Array.isArray(resp.data) ? resp.data : []);
      const sorted = notifications.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setReceivedNotifications(sorted);
    } catch (err) {
      console.error('Failed to load received notifications', err);
      toast.error('Failed to load received notifications');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on user change or tab switch
  useEffect(() => {
    if (!currentUser?.user_id) return;

    if (activeTab === 'sent') {
      fetchSentNotifications();
    } else {
      fetchReceivedNotifications();
    }
  }, [currentUser, activeTab]);

  return (
    <div className="mt-4 container-fluid">
      <Toaster position="top-center" toastOptions={{ duration: 8000, style: { fontSize: '1.1rem', fontWeight: 500 } }} />
      
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Notifications</h3>
        {activeTab === 'sent' && (
          <button className="btn btn-view text-white rounded-pill" onClick={() => setShowModal(true)}>
            <FaPaperPlane className="text-white me-2" />
            Send
          </button>
        )}
      </div>

      <div className="mb-4 d-flex">
        <button
          className={`notification-pill-btn${activeTab === 'sent' ? ' active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Sent 
        </button>
        <button
          className={`notification-pill-btn${activeTab === 'received' ? ' active' : ''}`}
          onClick={() => setActiveTab('received')}
        >
          Received
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          {activeTab === 'sent' && <SentNotificationList notifications={sentNotifications} />}
          {activeTab === 'received' && <ReceivedNotificationList notifications={receivedNotifications} />}
        </>
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

export default NotificationsPage;
