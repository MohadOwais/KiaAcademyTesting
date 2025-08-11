"use client";

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import toast from "react-hot-toast";

const Security = ({ user }: any) => {
    const currentUser = useSelector((state: any) => state?.user);

    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [repeatPassword, setRepeatPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showRepeatPassword, setShowRepeatPassword] = useState(false);

    const updatePassword = async (e: any) => {
        e?.preventDefault();

        if (!oldPassword?.trim()) {
            toast.error("Old password is required");
            return;
        }

        if (!newPassword?.trim()) {
            toast.error("New password is required");
            return;
        }

        if (!repeatPassword?.trim()) {
            toast.error("Please repeat new password");
            return;
        }

        if (newPassword !== repeatPassword) {
            toast.error("New & repeat passwords must be same");
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("new_password", newPassword);
            formData.append("old_password", oldPassword);
            formData.append("user_id", currentUser?.user_id);

            const resp = await axios.post(`${baseUrl}/users/changePassword`, formData, authorizationObj);
            
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                toast.error(resp?.data?.message);
                return;
            }

            setOldPassword("");
            setNewPassword("");
            setRepeatPassword("");
            toast.success("Password updated successfully");

        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <form onSubmit={updatePassword} className="profile-form p-4 rounded-4 shadow bg-white">
          <div className="row g-4">
            <div className="col-12 mx-auto">
              {/* Old Password */}
              <div className="form-group mb-4">
                <label className="form-label fw-semibold">Old Password</label>
                <div className="input-group profile-input-group">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    className="form-control profile-input"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    className="btn btn-outline-secondary profile-input-btn"
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                  >
                    {showOldPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="form-group mb-4">
                <label className="form-label fw-semibold">New Password</label>
                <div className="input-group profile-input-group">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="form-control profile-input"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    className="btn btn-outline-secondary profile-input-btn"
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group mb-4">
                <label className="form-label fw-semibold">Confirm Password</label>
                <div className="input-group profile-input-group">
                  <input
                    type={showRepeatPassword ? "text" : "password"}
                    className="form-control profile-input"
                    placeholder="Confirm Password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    className="btn btn-outline-secondary profile-input-btn"
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  >
                    {showRepeatPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="d-flex justify-content-center mt-4">
                <button
                  type="submit"
                  className="btn btn-lg rounded-pill px-4 btn-view text-white"
                  style={{ minWidth: 180 }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : 'Update Password'}
                </button>
              </div>
            </div>
          </div>
        </form>

    );
};

export default Security;