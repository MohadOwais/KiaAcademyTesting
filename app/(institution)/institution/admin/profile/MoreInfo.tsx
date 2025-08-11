"use client";

import { authorizationObj, baseUrl, otpPattern } from '@/app/utils/core';
// import ConfirmAlertMUI from '@/app/components/mui/ConfirmAlertMUI';
// import OtpModal from '@/app/components/mui/OtpModal';
// import { Button, FormControlLabel, InputAdornment, Switch, TextField, Tooltip } from '@mui/material'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
// import { IoCloseCircleSharp } from "react-icons/io5";
// import { MdVerified } from "react-icons/md";
import { useSelector } from 'react-redux';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
// import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from "moment"

const MoreInfo = ({ setErrorMessage, setSuccessMessage, user, setUser, errorMessage }: any) => {

  const currentUser = useSelector((state: any) => state?.user)

  const [is_loading, set_is_loading] = useState(false)
  const [personal_phone_number, set_personal_phone_number] = useState("")
  const [parents_phone_number, set_parents_phone_number] = useState("")
  const [parents_email, set_parents_email] = useState("")
  const [address, set_address] = useState("")
  const [dob, set_dob] = useState("")
  const [is_old, set_is_old] = useState(false)
  const [_student, set_student] = useState<any>(null)
  const [bio, set_bio] = useState<string | null>(null)

  useEffect(() => {
    get_student_details()
  }, [currentUser, currentUser?.user_id])

  const get_student_details = async () => {
    if (!currentUser?.user_id) return
    try {
      const resp = await axios.get(`${baseUrl}/students/${currentUser?.student_id}`, authorizationObj)
      if (resp?.data?.data) {
        const student = resp?.data?.data
        if (student) {
          set_student(student)
          set_personal_phone_number(student?.student_mobile_number)
          set_parents_phone_number(student?.student_parent_mobile)
          set_parents_email(student?.student_parent_email)
          set_address(student?.address)
          set_dob(student?.date_of_birth)
          set_bio(student?.bio)
          set_is_old(true)
        }
      }
    } catch (error) {
      // console.error(error)
    }
  }

  const handleSubmit = async () => {
    if (!personal_phone_number || personal_phone_number?.trim() === "") {
      setErrorMessage("Personal phone number is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }
    if (!parents_phone_number || parents_phone_number?.trim() === "") {
      setErrorMessage("Parents phone number is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }
    if (!parents_email || parents_email?.trim() === "") {
      setErrorMessage("Personal email is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }
    if (!address || address?.trim() === "") {
      setErrorMessage("Address is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }
    if (!dob || dob?.trim() === "") {
      setErrorMessage("Date of birth is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }

    const formData = new FormData()

    formData.append("student_mobile_number", personal_phone_number)
    formData.append("student_parent_mobile", parents_phone_number)
    formData.append("student_parent_email", parents_email)
    formData.append("address", address)
    formData.append("date_of_birth", dob)
    formData.append("user_id", currentUser?.user_id)
    if (bio) {
      formData.append("bio", bio)
    }

    try {
      set_is_loading(true)
      const resp = await axios.post(`${baseUrl}/students/create`, formData, authorizationObj)
      set_is_loading(false)

      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        setErrorMessage(resp?.data?.message)
        setTimeout(() => {
          setErrorMessage(null)
        }, 3000)
        return
      }

      get_student_details()
      setSuccessMessage("Information updated successfully")
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

    } catch (error) {
      // console.error(error)
      set_is_loading(false)
      setErrorMessage("Something went wrong please try later")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    }

  }

  const handleUpdate = async () => {
    if (!personal_phone_number || personal_phone_number?.trim() === "") {
      setErrorMessage("Personal phone number is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }
    if (!parents_phone_number || parents_phone_number?.trim() === "") {
      setErrorMessage("Parents phone number is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }
    if (!parents_email || parents_email?.trim() === "") {
      setErrorMessage("Personal email is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }
    if (!address || address?.trim() === "") {
      setErrorMessage("Address is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }
    if (!dob || dob?.trim() === "") {
      setErrorMessage("Date of birth is required")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
      return
    }

    const formData = new FormData()

    formData.append("student_mobile_number", personal_phone_number)
    formData.append("student_parent_mobile", parents_phone_number)
    formData.append("student_parent_email", parents_email)
    formData.append("address", address)
    formData.append("date_of_birth", dob)
    formData.append("user_id", currentUser?.user_id)
    if (bio) {
      formData.append("bio", bio)
    }

    try {
      set_is_loading(true)
      const resp = await axios.post(`${baseUrl}/students/update/${_student?.student_id}`, formData, authorizationObj)
      set_is_loading(false)

      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        setErrorMessage(resp?.data?.message)
        setTimeout(() => {
          setErrorMessage(null)
        }, 3000)
        return
      }

      get_student_details()
      setSuccessMessage("Information updated successfully")
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)

    } catch (error) {
      // console.error(error)
      set_is_loading(false)
      setErrorMessage("Something went wrong please try later")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    }

  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 mb-4">
          <textarea
            className="form-control"
            placeholder="Bio *"
            value={bio || ""}
            onChange={(e) => set_bio(e.target.value)}
            rows={3}
          />
        </div>

        <div className="col-md-6 col-lg-4 mb-3">
          <input
            type="tel"
            className="form-control"
            placeholder="Personal Phone Number *"
            value={personal_phone_number || ""}
            onChange={(e) => set_personal_phone_number(e.target.value)}
          />
        </div>

        <div className="col-md-6 col-lg-4 mb-3">
          <input
            type="tel"
            className="form-control"
            placeholder="Parents Phone Number *"
            value={parents_phone_number || ""}
            onChange={(e) => set_parents_phone_number(e.target.value)}
          />
        </div>

        <div className="col-md-6 col-lg-4 mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Parents Email *"
            value={parents_email || ""}
            onChange={(e) => set_parents_email(e.target.value)}
          />
        </div>

        <div className="col-md-6 col-lg-4 mb-3">
          <input
            type="date"
            className="form-control"
            value={dob ? moment(dob).format('YYYY-MM-DD') : ''}
            onChange={(e) => set_dob(moment(e.target.value).format())}
            max={moment().format('YYYY-MM-DD')}
          />
        </div>

        <div className="col-md-6 col-lg-4 mb-3">
          <textarea
            className="form-control"
            placeholder="Address *"
            value={address || ""}
            onChange={(e) => set_address(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="row justify-content-center mt-3">
        <div className="col-md-4">
          <button
            className="btn btn-primary w-100"
            disabled={is_loading}
            onClick={is_old ? handleUpdate : handleSubmit}
          >
            {is_loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MoreInfo