"use client";

import React, { useEffect, useState } from 'react';
import { educationArray, educationOptions, genderArray, genderOptions, userNamePattern, phoneNumberPattern, authorizationObj, baseUrl } from '@/app/utils/core';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { login, logout } from '@/app/redux/user';
import { capitalizeString } from '@/app/utils/functions';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

const PersonalInfo = ({ setErrorMessage, setSuccessMessage, user, setUser }: any) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const currentUser = useSelector((state: any) => state?.user);

  const [firstName, setFirstName] = useState<string>(user?.first_name || ''); // Default to empty string
  const [lastName, setLastName] = useState<string>(user?.last_name || ''); // Default to empty string
  const [email, setEmail] = useState<string>(user?.email || ''); // Default to empty string
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Ensure state gets updated if user props change
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setEmail(user?.email || '');
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("hart");
    signOut();
        router.push(`/auth/signin`);
  };

  const updateUser = async (e: any) => {
    e?.preventDefault();

    setErrorMessage(null);
    setSuccessMessage(null);

    // Validations
    if (!firstName.trim()) {
      setErrorMessage("Firstname is required");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage("Lastname is required");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }
    if (!email.trim()) {
      setErrorMessage("Email is required");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("email", email);

    try {
      setIsLoading(true);

      const resp = await axios.post(`${baseUrl}/users/update/${currentUser?.user_id}`, formData, authorizationObj);
      const userResp = await axios.get(`${baseUrl}/users/${currentUser?.user_id}`, authorizationObj);

      setIsLoading(false);
      setSuccessMessage("Profile updated successfully");
      dispatch(login({
        ...currentUser,
        first_name: userResp?.data?.data?.first_name,
        last_name: userResp?.data?.data?.last_name,
        email: userResp?.data?.data?.email,
      }));
      setUser({
        ...user,
        first_name: userResp?.data?.data?.first_name,
        last_name: userResp?.data?.data?.last_name,
        email: userResp?.data?.data?.email,
      });

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setIsLoading(false);
      setErrorMessage(error?.response?.data?.message);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  return (
    <form onSubmit={updateUser} className="profile-form p-4 rounded-4 shadow bg-white">
      <div className="row g-4">
        <div className="col-12">
          <label className="form-label fw-semibold">First Name</label>
          <input
            type="text"
            className="form-control rounded-3 profile-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Last Name</label>
          <input
            type="text"
            className="form-control rounded-3 profile-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Email</label>
          <input
            type="email"
            className="form-control rounded-3 profile-input bg-light"
            placeholder="Email"
            value={email}
            readOnly
            autoComplete="email"
          />
        </div>
      </div>

      {/* Action Buttons: Save & Logout */}
      <div className="row mt-5">
        <div className="col-12 d-flex flex-column flex-md-row gap-3 justify-content-center align-items-center">
          <button
            type="submit"
            className="btn btn-primary btn-lg rounded-pill flex-fill btn-view"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            type="button"
            className="btn btn-lg rounded-pill flex-fill btn-view text-danger"
            onClick={handleLogout}
            disabled={isLoading}
          >
            Log Out
          </button>
        </div>
      </div>
    </form>

  );
};

export default PersonalInfo;
