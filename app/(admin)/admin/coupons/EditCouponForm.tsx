// EditCouponForm.tsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";// Make sure the utility functions are imported

interface EditCouponFormProps {
  coupon: any;
  onClose: () => void;
  getCoupons: () => void;
}

const EditCouponForm: React.FC<EditCouponFormProps> = ({
  coupon,
  onClose,
  getCoupons,
}) => {
  const [formData, setFormData] = useState({
    coupon_code: coupon?.coupon_code || "",
    coupon_discount: coupon?.coupon_discount || "",
    coupon_discount_type: "percentage",
    coupon_valid_from: coupon?.coupon_valid_from ? coupon.coupon_valid_from.split(" ")[0] : "",
    coupon_valid_to: coupon?.coupon_valid_to ? coupon.coupon_valid_to.split(" ")[0] : "",
    coupon_usage_limit: coupon?.coupon_usage_limit || ""
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        coupon_code: coupon.coupon_code || "",
        coupon_discount: coupon.coupon_discount || "",
        coupon_discount_type: "percentage",
        coupon_valid_from: coupon.coupon_valid_from ? coupon.coupon_valid_from.split(" ")[0] : "",
        coupon_valid_to: coupon.coupon_valid_to ? coupon.coupon_valid_to.split(" ")[0] : "",
        coupon_usage_limit: coupon.coupon_usage_limit || ""
      });
    }
  }, [coupon]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
  payload.append("coupon_discount_type", "percentage");
  payload.append("coupon_valid_from", formData.coupon_valid_from ? formData.coupon_valid_from + " 00:00:00" : "");
  payload.append("coupon_valid_to", formData.coupon_valid_to ? formData.coupon_valid_to + " 23:59:59" : "");
  payload.append("coupon_usage_limit", formData.coupon_usage_limit);

  

  try {
    await axios.post(`${baseUrl}/coupons/update/${coupon.coupon_id}`, payload, authorizationObj);
    toast.success("Coupon updated successfully");
    await getCoupons();
    onClose();
  } catch (error: any) {
    if (error.response) {
   
      toast.error("Failed to update coupon: " + (error.response.data?.message || "Unknown error"));
    } else {
      
      toast.error("Failed to update coupon");
    }
  }
};

  return (
    <div
      className={`modal fade ${coupon ? "show" : ""}`}
      style={{ display: coupon ? "block" : "none" }}
      tabIndex={-1}
      aria-labelledby="editCouponModalLabel"
      aria-hidden={!coupon}
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
  <div className="modal-content">
    <div className="modal-header">
      <h5 className="modal-title" id="editCouponModalLabel">Edit Coupon</h5>
      <button
        type="button"
        className="btn-close"
        onClick={onClose}
        aria-label="Close"
      ></button>
    </div>
    <div className="modal-body">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="couponCode" className="form-label">Coupon Code</label>
          <input
            type="text"
            className="form-control"
            id="couponCode"
            name="coupon_code"
            value={formData.coupon_code}
            onChange={handleChange}
            required
            placeholder="Enter coupon code"
          />
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="discount" className="form-label">Discount (%)</label>
            <input
              type="number"
              className="form-control"
              id="discount"
              name="coupon_discount"
              value={formData.coupon_discount}
              onChange={handleChange}
              required
              placeholder="e.g., 20"
              min="0"
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="usageLimit" className="form-label">Usage Limit</label>
            <input
              type="number"
              className="form-control"
              id="usageLimit"
              name="coupon_usage_limit"
              value={formData.coupon_usage_limit}
              onChange={handleChange}
              required
              placeholder="e.g., 100"
              min="1"
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="validFrom" className="form-label">Valid From</label>
            <input
              type="date"
              className="form-control"
              id="validFrom"
              name="coupon_valid_from"
              value={formData.coupon_valid_from}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="validTo" className="form-label">Valid To</label>
            <input
              type="date"
              className="form-control"
              id="validTo"
              name="coupon_valid_to"
              value={formData.coupon_valid_to}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="text-end">
          <button type="submit" className="btn btn-primary">Update Coupon</button>
        </div>
      </form>
    </div>
  </div>
</div>
    </div>
  );
};

export default EditCouponForm;
