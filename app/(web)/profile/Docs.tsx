import { authorizationObj, baseUrl, documentsPath, otpPattern } from '@/app/utils/core';
import ConfirmAlertMUI from '@/app/components/mui/ConfirmAlertMUI';
import OtpModal from '@/app/components/mui/OtpModal';
import { Button, FormControlLabel, IconButton, InputAdornment, Switch, TextField, Tooltip } from '@mui/material'
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react'
import { IoCloseCircleSharp } from "react-icons/io5";
import { MdVerified } from "react-icons/md";
import { useSelector } from 'react-redux';
import { downloadFile, formatFilename } from '@/app/utils/functions';
import { MdOutlineFileDownload } from "react-icons/md";

export const FilePreview = ({ file, setFile, fileName, setFileName, label }: any) => {
  const fileRef: any = useRef()

  return (
    <div
      className='w-[300px] h-[56px] py-2 px-4 bg-gray-200 border-b-2 border-b-black flex justify-between items-center gap-2 cursor-pointer mt-2'
    // onClick={() => {
    //   if (fileName) return
    //   fileRef?.current?.click()
    // }}
    >
      {formatFilename(fileName) || formatFilename(file?.name) || label}
      {
        fileName ? <IconButton
          onClick={() => downloadFile(`${documentsPath}/${fileName}`)}
        >
          <MdOutlineFileDownload />
        </IconButton> : null
      }
      <input type="file" hidden
        ref={fileRef}
        accept='image/*, .pdf'
        onChange={(e: any) => {
          setFile(e?.target?.files[0])
        }}
      />
    </div>
  )
}

const Docs = ({ setErrorMessage, setSuccessMessage, user, setUser, errorMessage }: any) => {

  const currentUser = useSelector((state: any) => state?.user)

  const [document_type, set_document_type] = useState(user?.id_document_type)
  const [document_number, set_document_number] = useState(user?.id_document_number)

  const [document_image, set_document_image] = useState<any>(null)
  const [document_image_name, set_document_image_name] = useState(user?.document_image)

  const [address, set_address] = useState<any>(null)
  const [address_name, set_address_name] = useState(user?.proof_of_address)

  const [is_loading, set_is_loading] = useState(false)

  const handleSubmit = async () => {
    if (!document_type || !document_number) return
    if (!document_type && !document_number && !address && !document_image) return
    const formData = new FormData()

    if (document_type) formData.append("id_document_type", document_type)
    if (document_number) formData.append("id_document_number", document_number)
    if (document_image) formData.append("document_image", document_image)
    if (address) formData.append("proof_of_address", address)

    try {
      set_is_loading(true)
      const resp = await axios.post(`${baseUrl}/users/update/${currentUser?.user_id}`, formData, authorizationObj)
      set_is_loading(false)
      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        setErrorMessage(resp?.data?.message)
        setTimeout(() => {
          setErrorMessage(null)
        }, 3000)
        return
      }
      setSuccessMessage("Changes Saved")
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (error) {
      // console.error(error)
      set_is_loading(false)
      setErrorMessage("Something went wrong, please try later")
      setTimeout(() => {
        setErrorMessage(null)
      }, 3000)
    }

  }

  return (
    <form className="profile-form p-4 rounded-4 shadow bg-white" style={{maxWidth: 600}} onSubmit={e => {e.preventDefault(); handleSubmit();}}>
      <div className="row g-4">
        <div className="col-12">
          <label htmlFor="document_type" className="form-label fw-semibold">Document Type</label>
          <input
            type="text"
            className="form-control rounded-3 profile-input"
            id="document_type"
            value={document_type || ""}
            onChange={e => set_document_type(e.target.value)}
            readOnly={user?.id_document_type}
            required
            placeholder="e.g. Passport, Aadhar, etc."
            autoComplete="off"
          />
        </div>
        <div className="col-12">
          <label htmlFor="document_number" className="form-label fw-semibold">Document Number</label>
          <input
            type="text"
            className="form-control rounded-3 profile-input"
            id="document_number"
            value={document_number || ""}
            onChange={e => set_document_number(e.target.value)}
            readOnly={user?.id_document_number}
            required
            placeholder="Enter Document Number"
            autoComplete="off"
          />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Proof of Address</label>
          <FilePreview file={address} setFile={set_address} fileName={address_name} setFileName={set_address_name} label="No Proof Of Address" />
        </div>
        <div className="col-12">
          <label className="form-label fw-semibold">Document Image</label>
          <FilePreview file={document_image} setFile={set_document_image} fileName={document_image_name} setFileName={set_document_image_name} label="No Document Image" />
        </div>
        {/* <div className="col-12 d-flex justify-content-center mt-3">
          <button type="submit" className="btn btn-view btn-lg text-white rounded-pill profile-btn px-4" style={{minWidth:180}} disabled={is_loading}>
            {is_loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : 'Submit'}
          </button>
        </div> */}
      </div>
    </form>

  )
}

export default Docs