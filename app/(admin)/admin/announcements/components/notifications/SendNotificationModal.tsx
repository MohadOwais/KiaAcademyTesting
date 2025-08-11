import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { baseUrl, authorizationObj } from '@/app/utils/core';


const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    ...authorizationObj.headers,
    'Content-Type': 'application/json',
  },
});

const SendNotificationModal = ({ show, onClose, onSuccess, senderId }: any) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipientType, setRecipientType] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const recipientOptions = [
    { id: 'students', value: '3', label: 'Students' },
    { id: 'tutors', value: '2', label: 'Tutors' },
    { id: 'institutes', value: '4', label: 'Institutes' },
  ];

  const handleCheckbox = (value: string) => {
    if (value === 'all') {
      if (recipientType.includes('all')) {
        // Uncheck all
        setRecipientType([]);
      } else {
        // Select all except 'all' itself
        setRecipientType(['all', ...recipientOptions.map(opt => opt.value)]);
      }
    } else {
      let updated: string[];
      if (recipientType.includes(value)) {
        updated = recipientType.filter((r) => r !== value && r !== 'all');
      } else {
        updated = [...recipientType.filter(r => r !== 'all'), value];
      }
      // If all options are selected, also select 'all'
      if (recipientOptions.every(opt => updated.includes(opt.value))) {
        updated = ['all', ...recipientOptions.map(opt => opt.value)];
      }
      setRecipientType(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message || recipientType.length === 0) {
      toast.error('Fill all fields');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('message', message);
      formData.append('type', 'announcement');
      formData.append('sender_id', senderId);
      // Only send the specific roles, not 'all'
      const roles = recipientType.filter(r => r !== 'all').join(',');
      formData.append('roles', roles);

      const resp = await api.post('/notifications/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (resp.data?.status === 200 || resp.data?.status === 201) {
        toast.success("Notification sent successfully!", { duration: 5000, position: "top-center", id: "notif-success" });
        // Move onClose/onSuccess after a longer delay to ensure toast is visible
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 2000);
      } else {
        throw new Error(resp.data.message || 'Error sending');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show fade d-block send-notification-modal" tabIndex={-1}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 animate__animated animate__fadeInDown">
          <form onSubmit={handleSubmit}>
            <div className="modal-header bg-primary text-white rounded-top-4">
              <h5 className="modal-title fw-bold">
                <i className="bi bi-megaphone-fill me-2"></i>Send Notification
              </h5>
              <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
            </div>
            <div className="modal-body bg-light rounded-bottom-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">Subject</label>
                <input className="form-control form-control-lg rounded-3" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Enter subject..." />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Message</label>
                <textarea className="form-control rounded-3" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} required placeholder="Type your message..." />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Recipients</label>
                <div className="d-flex flex-wrap gap-3">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="all" value="all" onChange={() => handleCheckbox('all')} checked={recipientType.includes('all')} />
                    <label className="form-check-label" htmlFor="all">All</label>
                  </div>
                  {recipientOptions.map(opt => (
                    <div className="form-check" key={opt.id}>
                      <input type="checkbox" className="form-check-input" id={opt.id} value={opt.value} onChange={() => handleCheckbox(opt.value)} checked={recipientType.includes(opt.value)} />
                      <label className="form-check-label" htmlFor={opt.id}>{opt.label}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer bg-white rounded-bottom-4 border-0">
              <button type="button" className="btn btn-outline-secondary px-4" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="bi bi-send me-2"></i>Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendNotificationModal;
