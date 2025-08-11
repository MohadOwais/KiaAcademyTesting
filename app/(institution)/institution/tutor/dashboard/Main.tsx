"use client";

import "./Main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  MdPeople,
   MdSchool,
  MdPersonAdd,
  MdLibraryBooks,
  MdLiveTv,
  MdHourglassEmpty
} from "react-icons/md";

// To hide a card, just comment out its entry below
export const iconMapping: Record<string, React.ReactNode> = {
  total_courses: <MdLibraryBooks title="Total Courses" size={24} className="analytics-icon" />,
  total_live_courses: <MdLiveTv title="Total Live Courses" size={24} className="analytics-icon" />,
  total_requested_courses: <MdHourglassEmpty title="Total Requested Courses" size={24} className="analytics-icon" />,
  total_students: <MdSchool title="Total Students" size={24} className="analytics-icon" />,
  total_instructors: <MdPersonAdd title="Total Instructors" size={24} className="analytics-icon" />,
};

  const formatLabel = (key: string): string => {
  return key
    .replace(/^total_/, "") // Remove "total_" prefix
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize each word
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
       <ProtectedRoute allowedRoleIds={["2"]}>
            <div className="py-4">
              <h3
                className="mb-4 fw-bold"
                style={{
                  color: "var(--color-dark-2)",
                  fontWeight: 900,
                }}
              >
                Dashboard
              </h3>
              <div className="row g-4">
                {Object.entries(statistics)
                  .filter(([key]) => key in iconMapping)
                  .map(([key, value], idx) => {
                    return (
                      <div key={key} className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex mb-1">
                        <div className="card border rounded-4 h-100 analytics-card w-100">
                          <div className="card-body d-flex flex-column justify-content-between align-items-start p-4">
                            <div className="d-flex align-items-center mb-3 w-100 justify-content-between">
                              <div className="analytics-icon-bg d-flex align-items-center justify-content-center me-2">
                                {iconMapping[key] || (
                                  <MdPeople
                                    size={20}
                                    className="analytics-icon"
                                    style={{ color: "var(--color-dark-2)" }}
                                  />
                                )}
                              </div>
                              <span
                                className="badge fw-semibold rounded-pill fs-6 px-3 py-2 text-wrap"
                                style={{
                                  color: "var(--color-dark-2)",
                                  border: 0,
                                  backgroundColor: "#f8f9fa",
                                  fontWeight: 600,
                                  fontSize: "1rem",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                <span>{formatLabel(key)}</span>
                              </span>
                            </div>
                            <div className="w-100 text-end mt-auto">
                              <span
                                className="display-5 fw-bold"
                                style={{
                                  letterSpacing: 1,
                                  color: "var(--statistics-numbers)",
                                }}
                              >
                                {value !== null ? value.toLocaleString() : 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </ProtectedRoute>
 );
      };

      export default Main;