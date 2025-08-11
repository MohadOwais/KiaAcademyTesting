"use client";

import "./Main.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import {
  MdPeople,
  MdSchool,
  MdPersonAdd,
  MdGroup,
  MdLibraryBooks,
  MdBusiness,
  MdPendingActions,
  MdCheckCircle,
  MdAttachMoney,
  MdPayment,
  MdLiveTv,
} from "react-icons/md";

// To hide a card, just comment out its entry below
export const iconMapping: Record<string, React.ReactNode> = {
  total_users: <MdPeople title="Users" size={24} className="analytics-icon" />,
  // total_admins: <MdAdminPanelSettings title="Admins" size={24} className="analytics-icon" />,
  total_students: (
    <MdSchool title="Students" size={24} className="analytics-icon" />
  ),
  total_instructors: (
    <MdPersonAdd title="Instructors" size={24} className="analytics-icon" />
  ),
  total_guests: <MdGroup title="Guests" size={24} className="analytics-icon" />,
  total_courses: (
    <MdLibraryBooks title="Courses" size={24} className="analytics-icon" />
  ),
  total_institutes: (
    <MdBusiness title="Institutes" size={24} className="analytics-icon" />
  ),
  // total_pending_tutors: <MdPendingActions title="Pending Tutors" size={24} className="analytics-icon" />,
  total_active_users: (
    <MdCheckCircle title="Active Users" size={24} className="analytics-icon" />
  ),
  total_published_courses: (
    <MdCheckCircle
      title="Published Courses"
      size={24}
      className="analytics-icon"
    />
  ),
  total_pending_courses: (
    <MdPendingActions
      title="Pending Courses"
      size={24}
      className="analytics-icon"
    />
  ),
  // total_course_categories: <MdCategory title="Course Categories" size={24} className="analytics-icon" />,
  total_payments: (
    <MdAttachMoney title="Payments" size={24} className="analytics-icon" />
  ),
  total_payouts: (
    <MdPayment title="Payouts" size={24} className="analytics-icon" />
  ),
  total_live_courses: (
    <MdLiveTv title="Live Courses" size={24} className="analytics-icon" />
  ),
  // To hide a card, just comment out the line above for that key
};

const formatLabel = (key: string): string => {
  return key
    .replace(/^total_/, "") // Remove "total_" prefix
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize each word
};

const Main: React.FC = () => {
  const [statistics, setStatistics] = React.useState<
    Record<string, number | null>
  >({});
  const [loading, setLoading] = React.useState<boolean>(true);

  const getAllStatistics = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/dashboard`,
        authorizationObj
      );
      if (response.data.status === 200) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      // handle error
    } finally {
      setLoading(false); 
    }
  };

  React.useEffect(() => {
    getAllStatistics();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoleIds={["1"]}>
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
