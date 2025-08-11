"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";

interface BankDetails {
  id: string;
  user_id: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  ifsc_code: string;
  account_type: string;
  upi_id?: string | null;
  payout_share: string;
  payout_days: string;
  [key: string]: any;
}

interface EditBankDetailsModalProps {
  show: boolean;
  onHide: () => void;
  tutor: any;
  onUpdated?: () => void;
}

const EditBankDetailsModal: React.FC<EditBankDetailsModalProps> = ({ show, onHide, tutor, onUpdated }) => {
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [payoutShare, setPayoutShare] = useState("");
  const [payoutDays, setPayoutDays] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (show && tutor?.user_id) {
      fetchBankDetails();
    }
    // eslint-disable-next-line
  }, [show, tutor?.user_id]);

  const fetchBankDetails = async () => {
    setIsLoading(true);
    setError("");
    try {
      const resp = await axios.get(
        `${baseUrl}/bank-details/showAll`,
        authorizationObj
      );
      // API response is {status, data: Array}
      let list = resp?.data?.data;
      if (!Array.isArray(list)) list = [];
      const details = list.find((b: BankDetails) => b.user_id === tutor.user_id);
    //   console.log("Bank Details:", details);
      if (details) {
        setBankDetails(details);
        setPayoutShare(details.payout_share || "");
        setPayoutDays(details.payout_days || "");
      } else {
        setBankDetails(null);
        setError("No bank details found for this tutor.");
      }
    } catch (err) {
      setError("Failed to fetch bank details.");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!bankDetails) return;
    setError("");
    setSuccess("");
    // Validation
    const payoutShareNum = parseFloat(payoutShare);
    const payoutDaysNum = parseInt(payoutDays, 10);
    if (
      isNaN(payoutShareNum) ||
      payoutShareNum < 0 ||
      payoutShareNum > 80
    ) {
      setError("Payout share must be a number between 0 and 80.");
      return;
    }
    if (
      isNaN(payoutDaysNum) ||
      payoutDaysNum < 15 ||
      payoutDaysNum > 45 ||
      !/^[0-9]+$/.test(payoutDays)
    ) {
      setError("Payout days must be a positive integer between 15 and 45.");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("payout_share", payoutShareNum.toString());
      formData.append("payout_days", payoutDaysNum.toString());
      await axios.post(
        `${baseUrl}/bank-details/updatePayout/${bankDetails.user_id}`,
        formData,
        authorizationObj
      );
      setSuccess("Bank details updated successfully.");
      if (onUpdated) onUpdated();
      setTimeout(() => {
        setSuccess("");
        onHide();
      }, 1000);
    } catch (err) {
      setError("Failed to update bank details.");
    }
    setIsLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered dialogClassName="modal-dialog-centered modal-dialog-scrollable">
      <Modal.Header closeButton>
        <Modal.Title>Edit Bank Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading && <div>Loading...</div>}
        {error && (
          <div className="alert alert-warning alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError("")} aria-label="Close"></button>
          </div>
        )}
        {success && <div className="alert alert-success">{success}</div>}
        {bankDetails && !isLoading && !error && (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Account Holder Name</Form.Label>
              <Form.Control value={bankDetails.account_holder_name} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Account Number</Form.Label>
              <Form.Control value={bankDetails.account_number} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Bank Name</Form.Label>
              <Form.Control value={bankDetails.bank_name} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>IFSC Code</Form.Label>
              <Form.Control value={bankDetails.ifsc_code} disabled />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payout Share</Form.Label>
              <Form.Control
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={payoutShare}
                onChange={e => setPayoutShare(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Payout Days</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={payoutDays}
                onChange={e => setPayoutDays(e.target.value)}
              />
            </Form.Group>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isLoading || !bankDetails}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditBankDetailsModal;
