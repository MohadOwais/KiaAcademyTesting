"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import { useSelector } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import toast from "react-hot-toast";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";


const PayoutModal = () => {
  const currentUser = useSelector((state: any) => state.user);
  const userId = currentUser?.user_id;

  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [bankDetails, setBankDetails] = useState({
    account_type: "saving",
    account_holder_name: "",
    account_number: "",
    bank_name: "",
    ifsc_code: "",
    upi_id: "",
    user_id: userId,
  });

  // Fetch existing bank details
  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/bank-details/show/${userId}`,
        authorizationObj
      );

      if (response.data.status === 200 && response.data.data) {
        setBankDetails({ ...response.data.data, user_id: userId });
        setHasBankDetails(true);
      } else {
        setHasBankDetails(false);
        resetForm();
      }
    } catch (err) {
      setHasBankDetails(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBankDetails({
      account_type: "saving",
      account_holder_name: "",
      account_number: "",
      bank_name: "",
      ifsc_code: "",
      upi_id: "",
      user_id: userId,
    });
  };

  useEffect(() => {
    if (userId) {
      fetchBankDetails();
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankDetails.account_holder_name || !bankDetails.account_number) {
      toast.error("Please fill in all required fields.", { position: "top-center" });
      return;
    }

    const formData = new FormData();
    for (const key in bankDetails) {
      formData.append(key, bankDetails[key as keyof typeof bankDetails]);
    }

    try {
      const url = hasBankDetails
        ? `${baseUrl}/bank-details/update/${userId}`
        : `${baseUrl}/bank-details/create`;

      const response = await axios.post(url, formData, authorizationObj);

      if (response.data.status === 200 || response.data.status === 201) {
        toast.success("Bank details saved successfully.", { position: "top-center", duration: 5000 });
        setTimeout(() => {
          setIsOpen(false); // Close modal after toast is triggered
          fetchBankDetails();
        }, 200);
      } else {
        toast.error("Failed to save bank details.", { position: "top-center", duration: 5000 });
      }
    } catch (error) {
      toast.error("Something went wrong while saving bank details.", { position: "top-center" });
    }
  };

  const openModal = () => {
    fetchBankDetails();
    setIsOpen(true);
  };

  return (
    <div>
      <div className="text-end m-3">
        <button className="btn btn-view text-white rounded-pill" onClick={openModal}>
          {hasBankDetails ? "Update Bank Details" : "Add Bank Details"}
        </button>
      </div>

      {isOpen && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {bankDetails.account_holder_name ? "Update Bank Account" : "Add Bank Account"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsOpen(false)}
                ></button>
              </div>

              <div className="modal-body text-start">
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label">Account Type</label>
                      <select
                        name="account_type"
                        className="form-select"
                        value={bankDetails.account_type}
                        onChange={handleChange}
                      >
                        <option value="saving">Saving</option>
                        <option value="current">Current</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Account Holder Name</label>
                      <input
                        name="account_holder_name"
                        type="text"
                        className="form-control"
                        value={bankDetails.account_holder_name}
                        onChange={handleChange}
                      />
                      <input type="hidden" name="user_id" value={bankDetails.user_id} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Account Number</label>
                      <input
                        name="account_number"
                        type="text"
                        className="form-control"
                        value={bankDetails.account_number}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Bank Name</label>
                      <input
                        name="bank_name"
                        type="text"
                        className="form-control"
                        value={bankDetails.bank_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">IFSC Code</label>
                      <input
                        name="ifsc_code"
                        type="text"
                        className="form-control"
                        value={bankDetails.ifsc_code}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">UPI ID (optional)</label>
                      <input
                        name="upi_id"
                        type="text"
                        className="form-control"
                        value={bankDetails.upi_id}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="modal-footer">
                      <button type="submit" className="btn btn-primary">
                        Save Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setIsOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutModal;
