import React, { useState, ChangeEvent, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authorizationObj, baseUrl, profilePicture, profilePictureSizeLimit } from "@/app/utils/core";
import axios from "axios";
import { login } from "@/app/redux/user";
import Image from "next/image";
import { HiPencil } from "react-icons/hi";
import "../Main.css"



  const ProfileSidebar = ({ user, setUser }: any) => {
    const currentUser = useSelector((state: any) => state?.user)
    const dispatch = useDispatch()

    const profileImageFileRef: any = useRef(null)

    const [selectedBase64, setSelectedBase64] = useState<null | string>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<null | string>(null)
    const [successMessage, setSuccessMessage] = useState<null | string>(null)
    const [activeTab, setActiveTab] = useState(0);



      const updateProfilePicture = async () => {
  
          setErrorMessage(null)
          setSuccessMessage(null)
  
          if (!profileImageFileRef || !profileImageFileRef?.current) return
          if (!profileImageFileRef?.current?.files || !profileImageFileRef?.current?.files?.length) return
          if (!profileImageFileRef?.current?.files[0]) return
  
          const profileImage = profileImageFileRef?.current?.files[0]
  
          if (!profileImage?.type?.startsWith("image")) {
              setErrorMessage("Profile picture must be an image")
              setTimeout(() => {
                  setErrorMessage(null)
              }, 3000);
              return
          }
  
          if (profileImage?.size > profilePictureSizeLimit) {
              setErrorMessage("Image too large must less than 2 mb")
              setTimeout(() => {
                  setErrorMessage(null)
              }, 3000);
              return
          }
  
          try {
  
              setIsLoading(true)
  
              const formData = new FormData()
              formData.append("profile_picture", profileImage)
              formData.append("first_name", currentUser?.first_name)
              formData.append("last_name", currentUser?.last_name)
  
              const resp = await axios.post(`${baseUrl}/users/update/${currentUser?.user_id}`, formData, authorizationObj)
              const user = await axios.get(`${baseUrl}/users/${currentUser?.user_id}`, authorizationObj)
              setUser({ ...currentUser, profile_picture: user?.data?.data?.profile_picture })
              dispatch(login({ ...currentUser, profile_picture: user?.data?.data?.profile_picture }))
              setIsLoading(false)
              setSuccessMessage("Profile picture updated successfully")
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
    <div className="profile-sidebar-container text-center py-md-4 mb-4 mb-lg-0 shadow col-md-12 position-relative border-0" style={{ borderRadius: 18, background: 'var(--color-bg, #f8f9fa)' }}>
      <div className="position-relative d-inline-block mx-auto mb-3 col">
        <label htmlFor="profilePictureInput"
          className="profile-sidebar-picture-label">
          {/* Decorative ring */}
          <span className="profile-sidebar-picture-ring"></span>
          {isLoading && (
            <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 2, background: 'rgba(255,255,255,0.6)', borderRadius: '50%' }}>
              <div className="spinner-border text-primary"></div>
            </div>
          )}
          <Image
            src={selectedBase64 || user?.profile_picture || profilePicture}
            alt="profile"
            width={116}
            height={116}
            onError={(e) => {
              e.currentTarget.src = profilePicture;
            }}
            className={`profile-sidebar-picture-img${isLoading ? ' opacity-60' : ''}`}
          />
          {/* Edit icon with glass effect */}
          <span className="profile-sidebar-edit-icon">
            <HiPencil className="text-white" style={{ width: '16px', height: '16px' }} />
          </span>
        </label>
        <input
          type="file"
          id="profilePictureInput"
          hidden
          ref={profileImageFileRef}
          accept="image/*"
          onChange={(e: any) => {
            if (currentUser?._id !== user?._id) return;
            const base64Url = URL?.createObjectURL(e?.target?.files[0]);
            setSelectedBase64(base64Url);
            updateProfilePicture();
          }}
        />
      </div>

      {/* Show first name and last name below the profile image */}
      <div className="mt-3 d-flex flex-column justify-content-center align-items-center gap-1">
        <div style={{ fontWeight: 700, fontSize: '1.15rem', color: '#222', letterSpacing: 0.2 }}>{user?.first_name || ''} {user?.last_name || ''}</div>
        {user?.email && <div style={{ fontSize: '0.95rem', color: '#6c757d', wordBreak: 'break-all' }}>{user.email}</div>}
      </div>
    </div>
  );
};

export default ProfileSidebar;
