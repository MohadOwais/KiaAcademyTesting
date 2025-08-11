"use client";

import React, { useEffect, useState } from 'react'
// import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
// import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// import moment from 'moment';
import { educationArray, educationOptions, genderArray, genderOptions, userNamePattern, phoneNumberPattern, authorizationObj, baseUrl } from '@/app/utils/core';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/app/redux/user';
import { capitalizeString } from '@/app/utils/functions';

const Personal = ({ setErrorMessage, setSuccessMessage, user, setUser }: any) => {

  const dispatch = useDispatch()
  const currentUser = useSelector((state: any) => state?.user)

  const [firstName, setFirstName] = useState<string | null>(null)
  const [lastName, setLastName] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setFirstName(user?.first_name)
    setLastName(user?.last_name)

  }, [user])

  const updateUser = async (e: any) => {

    e?.preventDefault()

    setErrorMessage(null)
    setSuccessMessage(null)

    if (!firstName || firstName.trim() === "") {
      setErrorMessage("Firstname is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }

    if (!lastName || lastName.trim() === "") {
      setErrorMessage("Lastname is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }

    const formData = new FormData()

    formData.append("first_name", firstName)
    formData.append("last_name", lastName)

    try {

      setIsLoading(true)

      // const resp = await axios.post(`${baseUrl}/users/update/${currentUser?.user_id}`, formData, authorizationObj)
      const userResp = await axios.get(`${baseUrl}/users/${currentUser?.user_id}`, authorizationObj)

      setIsLoading(false)
      setSuccessMessage("Profile updated successfully")
      dispatch(login({
        ...currentUser,
        first_name: userResp?.data?.data?.first_name,
        last_name: userResp?.data?.data?.last_name
      }))
      setUser({
        ...user,
        first_name: userResp?.data?.data?.first_name,
        last_name: userResp?.data?.data?.last_name
      })

      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000);

    } catch (error: any) {
      // console.error(error)
      setIsLoading(false)
      setErrorMessage(error?.response?.data?.message)
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000);
    }

  }

  return (
    <form onSubmit={updateUser} className="mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="mb-3">
            <input 
              type="text"
              className="form-control"
              placeholder="First Name"
              defaultValue={user?.first_name || ""}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <input 
              type="text"
              className="form-control"
              placeholder="Last Name"
              defaultValue={user?.last_name || ""}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 col-lg-4">
          <div className="mb-3">
            <input 
              type="text"
              className="form-control"
              placeholder="Account Status"
              value={capitalizeString(user?.user_status) || "N/A"}
              readOnly
            />
          </div>
          <div className="mb-3">
            <input 
              type="email"
              className="form-control"
              placeholder="Email"
              value={user?.email || ""}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="row justify-content-center mt-4">
        <div className="col-md-4">
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
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default Personal