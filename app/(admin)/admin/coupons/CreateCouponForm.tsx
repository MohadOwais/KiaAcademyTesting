import React, { useState } from "react";
import axios from "axios";
import { baseUrl, authorizationObj } from "@/app/utils/core";
import toast from "react-hot-toast";

interface CreateCouponFormProps {
  onClose: () => void;
  getCoupons: () => void;
}

const CreateCouponForm: React.FC<CreateCouponFormProps> = ({ onClose, getCoupons }) => {
  const [formData, setFormData] = useState({
    coupon_code: "",
    coupon_discount: "",
    coupon_valid_from: "",
    coupon_valid_to: "",
    coupon_usage_limit: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append("coupon_code", formData.coupon_code);
    payload.append("coupon_discount", formData.coupon_discount);
    payload.append("coupon_valid_from", formData.coupon_valid_from);
    payload.append("coupon_valid_to", formData.coupon_valid_to);
    payload.append("coupon_usage_limit", formData.coupon_usage_limit); // Assuming a default usage limit of 1

    try {
      await axios.post(`${baseUrl}/coupons/create`, payload, authorizationObj);
      toast.success("Coupon created successfully");
      setFormData({
        coupon_code: "",
        coupon_discount: "",
        coupon_valid_from: "",
        coupon_valid_to: "",
        coupon_usage_limit: "",
      });
      onClose(); // Collapse/close the form/modal after successful submit
      getCoupons();
    } catch (error) {
      toast.error("Failed to create coupon");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body">
        <div className="mb-3">
          <label className="form-label">Coupon Code</label>
          <input
            type="text"
            className="form-control"
            name="coupon_code"
            value={formData.coupon_code}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Discount (%)</label>
          <input
            type="number"
            className="form-control"
            name="coupon_discount"
            value={formData.coupon_discount}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Valid From</label>
          <input
            type="date"
            className="form-control"
            name="coupon_valid_from"
            value={formData.coupon_valid_from}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Valid To</label>
          <input
            type="date"
            className="form-control"
            name="coupon_valid_to"
            value={formData.coupon_valid_to}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Usage Limit</label>
          <input
            type="number"
            placeholder=" 1"
            className="form-control"
            name="coupon_usage_limit"
            value={formData.coupon_usage_limit}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Create Coupon
        </button>
      </div>
    </form>
  );
};

export default CreateCouponForm;