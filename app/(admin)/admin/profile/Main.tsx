"use client"

import "./Main.css"
import { authorizationObj, baseUrl, profilePicture, profilePicturePath, profilePictureSizeLimit } from '@/app/utils/core'
// import AlertMUI from '@/app/components/mui/AlertMUI'
// import { login } from '@/app/redux/user'
import { Box, CircularProgress, Tab, Tabs } from '@mui/material'
import axios from 'axios'
// import { useRouter } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// import { HiPencil } from "react-icons/hi2";
// import { primaryColor } from '@/app/utils/data'
import PropTypes from 'prop-types';
import PersonalInfo from './Components/PersonalInfo'
import Security from './Components/Security'
import Docs from './Docs'
import MoreInfo from "./Components/MoreInfo"
import MoreInfoAdmin from "./Components/MoreInfoAdmin"
// import Image from 'next/image'
import ProfileSidebar from "./Components/ProfileSideBar"
import CertificateCard from "./Components/CertificateCard";
import CertificateViewer from "./Components/CertificateViewer";

function CustomTabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const ProfileSection = ({ user, setUser }: any) => {
  const currentUser = useSelector((state: any) => state?.user)
  const dispatch = useDispatch()
  console.log(user)
  // const profileImageFileRef: any = useRef(null)

  // const [selectedBase64, setSelectedBase64] = useState<null | string>(null)
  // const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<null | string>(null)
  const [successMessage, setSuccessMessage] = useState<null | string>(null)
  const [activeTab, setActiveTab] = useState(0);




  {
    errorMessage && (
      <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {errorMessage}
        <button type="button" className="btn-close" onClick={() => setErrorMessage(null)}></button>
      </div>
    )
  }

  {
    successMessage && (
      <div className="alert alert-success alert-dismissible fade show" role="alert">
        {successMessage}
        <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
      </div>
    )
  }

  return (
    <div className="container-fluid p-3 mt-5">
      <div className="row d-flex justify-content-center align-content-center ">
        {/* Sidebar */}
        <div className="col-12 col-lg-2 mt-4">
          <ProfileSidebar user={user} />
        </div>

        {/* Main Content */}
        <div className="col-12 col-lg-8">
          <div className="container-fluid py-4">
            <div className="mb-4 d-flex gap-2 flex-wrap">
              <button
                className={`notification-pill-btn${activeTab === 0 ? ' active' : ''}`}
                onClick={() => setActiveTab(0)}
                type="button"
              >
                Personal
              </button>
              <button
                className={`notification-pill-btn${activeTab === 1 ? ' active' : ''}`}
                onClick={() => setActiveTab(1)}
                type="button"
              >
                Security
              </button>
              {(currentUser?.role_id !== "1" && currentUser?.role_id !== "5") && (
                <button
                  className={`notification-pill-btn${activeTab === 2 ? ' active' : ''}`}
                  onClick={() => setActiveTab(2)}
                  type="button"
                >
                  {currentUser?.role_id === "2" ? "Docs" :
                    currentUser?.role_id === "3" || currentUser?.role_id === "4" ? "More Info" : ""}
                </button>
              )}
              {/* Certificates button for students only */}
              {currentUser?.role_id === "3" && (
                <button
                  className={`notification-pill-btn${activeTab === 3 ? ' active' : ''}`}
                  onClick={() => setActiveTab(3)}
                  type="button"
                >
                  Certificates
                </button>
              )}
            </div>

            <div className="tab-content">
              <div className={`tab-pane fade ${activeTab === 0 ? 'show active' : ''}`}>
                <PersonalInfo
                  setErrorMessage={setErrorMessage}
                  setSuccessMessage={setSuccessMessage}
                  user={user}
                  setUser={setUser}
                />
              </div>
              <div className={`tab-pane fade ${activeTab === 1 ? 'show active' : ''}`}>
                <Security
                  setErrorMessage={setErrorMessage}
                  setSuccessMessage={setSuccessMessage}
                  user={user}
                  setUser={setUser}
                />
              </div>
              {currentUser?.role_id !== "1" && (
                <div className={`tab-pane fade ${activeTab === 2 ? 'show active' : ''}`}>
                  {currentUser?.role_id === "2" ? (
                    <Docs
                      setErrorMessage={setErrorMessage}
                      setSuccessMessage={setSuccessMessage}
                      user={user}
                      setUser={setUser}
                      errorMessage={errorMessage}
                    />
                  ) : currentUser?.role_id === "3" ? (
                    <MoreInfo
                      setErrorMessage={setErrorMessage}
                      setSuccessMessage={setSuccessMessage}
                      user={user}
                      setUser={setUser}
                      errorMessage={errorMessage}
                    />
                  ) : currentUser?.role_id === "4" ? (
                    <MoreInfoAdmin
                      setErrorMessage={setErrorMessage}
                      setSuccessMessage={setSuccessMessage}
                      user={user}
                      setUser={setUser}
                      errorMessage={errorMessage}
                    />
                  ) : null}
                </div>
              )}
              {/* Certificates tab for students only */}
              {currentUser?.role_id === "3" && (
                <div className={`tab-pane fade ${activeTab === 3 ? 'show active' : ''}`}>
                  {/* Certificates content */}
                  <CertificatesTab userId={user?.user_id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>


  )
}

const Main = () => {
  const currentUser = useSelector((state: any) => state?.user)
  const [user, set_user] = useState<any>(currentUser)
  useEffect(() => { get_user(currentUser?.user_id) }, [currentUser])

  const get_user = async (userId: string) => {
    if (!userId) return
    try {
      const resp = await axios.get(`${baseUrl}/users/${userId}`, authorizationObj)
      set_user(resp?.data?.data)
    } catch (error) {
      // console.error(error)
    }
  }

  return <ProfileSection user={user} setUser={set_user} />

}

const CertificatesTab = ({ userId }: { userId: string }) => {
  // Static certificate data for now
  const certificates = [
    {
      id: '1',
      title: 'React Mastery',
      issueDate: '2024-05-10',
      imageUrl: 'https://www.tatvasoft.com/blog/wp-content/uploads/2022/07/Why-Use-React-1280x720.jpg',
      description: 'Awarded for completing the React Mastery course.'
    },
    {
      id: '2',
      title: 'Next.js',
      issueDate: '2024-06-15',
      imageUrl: 'https://flatirons.com/static/0a79ca63e3ace4bfd802a70a2d7427ae/537f5/What-is-Drupal-An-Overview-in-2025.webp',
      description: 'Awarded for completing the Next.js Pro Bootcamp.'
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      issueDate: '2024-07-01',
      imageUrl: 'https://codemithra.com/wp-content/uploads/2024/07/What-is-a-Full-Stack-Developer-jpg.webp',
      description: 'Awarded for completing the Full Stack Developer program.'
    },
    {
      id: '4',
      title: 'Full Stack Developer',
      issueDate: '2024-07-01',
      imageUrl: 'https://codemithra.com/wp-content/uploads/2024/07/What-is-a-Full-Stack-Developer-jpg.webp',
      description: 'Awarded for completing the Full Stack Developer program.'
    }
  ];
  const [selectedCert, setSelectedCert] = useState<any>(null);

  if (selectedCert) {
    return <CertificateViewer cert={selectedCert} onClose={() => setSelectedCert(null)} />;
  }
  return (
    <div className="row g-3">
      {certificates.map(cert => (
        <div className="col-12 col-md-6 col-lg-4" key={cert.id}>
          <CertificateCard cert={cert} onView={setSelectedCert} />
        </div>
      ))}
    </div>
  );
};

export default Main