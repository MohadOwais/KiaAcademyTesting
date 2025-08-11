"use client";

import "./Main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
   MdSchool,
  MdPersonAdd,
  MdLibraryBooks,
  MdLiveTv,
  MdHourglassEmpty
} from "react-icons/md";

// To hide a card, just comment out its entry below
export const iconMapping: Record<string, React.ReactNode> = {
  total_courses: <MdLibraryBooks title="Total Courses" size={36} className="analytics-icon" />,
  total_live_courses: <MdLiveTv title="Total Live Courses" size={36} className="analytics-icon" />,
  total_requested_courses: <MdHourglassEmpty title="Total Requested Courses" size={36} className="analytics-icon" />,
  total_students: <MdSchool title="Total Students" size={36} className="analytics-icon" />,
  total_instructors: <MdPersonAdd title="Total Instructors" size={36} className="analytics-icon" />,
};

  const formatLabel = (key: string): string => {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const Main: React.FC = () => {

  const [statistics, setStatistics] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState<boolean>(true);
  const currentUser = useSelector((state: any) => state.user);

  const getAllStatistics = async (userId: string) => {
    try {
      const response = await axios.get(
        `${baseUrl}/dashboard/individual-tutor/${userId}`,
        authorizationObj
      );
      // console.log("Response from API:", response.data);
      console.log("URL:", `${baseUrl}/dashboard/individual-tutor/${userId}`);
      // Accept both {status: 200, data: {...}} and direct object
      if (response.data && typeof response.data === 'object' && 'status' in response.data && response.data.status === 200) {
        setStatistics(response.data.data);
      } else if (response.data && typeof response.data === 'object' && !('status' in response.data)) {
        setStatistics(response.data);
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.user_id) {
      getAllStatistics(currentUser.user_id);
    }
  }, [currentUser]);

      if (loading) {
      return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
      );
      }

      return (
      // <ProtectedRoute allowedRoleIds={["2,3"]}> 
   <div className="py-4">
     <h3 className="mb-4 fw-bold" style={{
        color: "var(--color-dark-2)",
          fontWeight: 900,
          // background: "linear-gradient(135deg, #2691d7 0%, #00c6fb 100%)",
          // WebkitBackgroundClip: "text",
          // WebkitTextFillColor: "transparent",
          // backgroundClip: "text"
        }}>
       Dashboard
     </h3>
     <div className="row g-4">
       {Object.entries(statistics)
       .filter(([key]) => key in iconMapping)
       .map(([key, value], idx) => {
       const gradients = [
         "linear-gradient(135deg, var(--color-dark-2) 0%, var(--color-primary) 100%)",
                "linear-gradient(135deg, #2691d7 0%, #00c6fb 100%)",
                "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
                "linear-gradient(135deg, #b8860b 0%, #ffd700 100%)",
                "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
                "linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)",
                "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
                "linear-gradient(135deg, #00c3ff 0%, #ffff1c 100%)"
       ];
       const badgeGradient = gradients[idx % gradients.length];
       return (
       <div className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex mb-4" key={key}>
         <div className="card border-0 shadow h-100 analytics-card position-relative overflow-hidden w-100">
           <div className="card-body d-flex flex-column justify-content-between align-items-start p-4">
             <div className="d-flex align-items-center mb-3 w-100 justify-content-between">
               <div className="rounded-circle analytics-icon-bg d-flex align-items-center justify-content-center me-2">
                 {iconMapping[key]}
               </div>
               <span
                 className="badge fw-semibold rounded-pill fs-6 px-3 py-2 shadow-sm analytics-badge-animate text-wrap"
                 style={{
                       background: badgeGradient,
                       color: "#fff",
                       border: 0,
                       boxShadow: "0 2px 8px rgba(38,145,215,0.10)",
                       fontWeight: 600,
                       fontSize: "1rem",
                       letterSpacing: "0.5px"
                     }}>
                 <span className="analytics-badge-text-highlight">{formatLabel(key)}</span>
               </span>
             </div>
             <div className="w-100 text-end mt-auto">
               <span className="display-5 fw-bold text-dark" style={{ letterSpacing: 1 }}>
                 {value !== null ? value.toLocaleString() : 0}
               </span>
             </div>
           </div>
           <div className="analytics-card-bg position-absolute top-0 end-0 w-100 h-100" style={{
                   pointerEvents: "none",
                   opacity: 0.07,
                   background: badgeGradient,
                 }}></div>
         </div>
       </div>
       );
       })}
     </div>
   </div>
//  </ProtectedRoute>
 );
      };

      export default Main;