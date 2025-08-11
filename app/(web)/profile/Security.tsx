"use client";

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';

const Security = ({ setErrorMessage, setSuccessMessage, user, setUser }: any) => {
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

        setErrorMessage(null);
        setSuccessMessage(null);

        if (!oldPassword?.trim()) {
            setErrorMessage("Old password is required");
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        if (!newPassword?.trim()) {
            setErrorMessage("New password is required");
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        if (!repeatPassword?.trim()) {
            setErrorMessage("Please repeat new password");
            setTimeout(() => setErrorMessage(null), 3000);
            return;
        }

        if (newPassword !== repeatPassword) {
            setErrorMessage("New & repeat passwords must be same");
            setTimeout(() => setErrorMessage(null), 3000);
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
                setErrorMessage(resp?.data?.message);
                setTimeout(() => setErrorMessage(null), 3000);
                return;
            }

            setOldPassword("");
            setNewPassword("");
            setRepeatPassword("");
            setSuccessMessage("Password updated successfully");
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (error: any) {
            setErrorMessage(error?.response?.data?.message);
            setTimeout(() => setErrorMessage(null), 3000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={updatePassword} className="mt-4">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="mb-3">
                        <div className="input-group">
                            <input 
                                type={showOldPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="Old Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                            >
                                {showOldPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="input-group">
                            <input 
                                type={showNewPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                            >
                                {showNewPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div className="mb-3">
                        <div className="input-group">
                            <input 
                                type={showRepeatPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="Repeat New Password"
                                value={repeatPassword}
                                onChange={(e) => setRepeatPassword(e.target.value)}
                            />
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button"
                                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                            >
                                {showRepeatPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4">
                        <button 
                            type="submit" 
                            className="btn btn-primary w-100"
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