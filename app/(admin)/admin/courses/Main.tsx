"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import Table from "./components/Table";
import RequestedCourses from "./components/RequestedCourses";
import PublishedCourses from "./components/PublishedCourses"; // Capitalized component name
import LiveCourses from "./components/LiveCourses"; // Capitalized component name
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import "../../../components/notifications/notificationButtons.css";

const Main = () => {
  type CourseData = {
    course_id: string;
    course_thumbnail: string;
    course_title: string;
    instructor_first_name: string;
    instructor_last_name: string;
    status: string;
    [key: string]: any;
  };

  const [courses, setCourses] = useState<CourseData[]>([]);
  const [activeTab, setActiveTab] = useState<'allCourses' | 'requestedCourses' | 'publishedCourses' | 'liveCourses'>('allCourses');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const getAllCourses = async () => {
    try {
      const resp = await axios.get(`${baseUrl}/courses`, authorizationObj);
      setCourses(resp?.data?.data);
      setIsDataLoaded(true); // Mark data as loaded
    } catch (error) {
      console.error("Error fetching courses:", error);
      // Handle error (display a message, retry, etc.)
    }
  };

  useEffect(() => {
    getAllCourses();
  }, []); // Only run once on mount

  return (
    <ProtectedRoute allowedRoleIds={["1"]}>
      <div className="container-fluid">
        <div className="mb-4 d-flex notification-tabs-responsive">
          <button
            className={`notification-pill-btn${activeTab === 'allCourses' ? ' active' : ''}`}
            onClick={() => setActiveTab('allCourses')}
            type="button"
          >
            All Courses
          </button>
          <button
            className={`notification-pill-btn${activeTab === 'requestedCourses' ? ' active' : ''}`}
            onClick={() => setActiveTab('requestedCourses')}
            type="button"
          >
            Requested Courses
          </button>
          <button
            className={`notification-pill-btn${activeTab === 'publishedCourses' ? ' active' : ''}`}
            onClick={() => setActiveTab('publishedCourses')}
            type="button"
          >
            Published Courses
          </button>
          <button
            className={`notification-pill-btn${activeTab === 'liveCourses' ? ' active' : ''}`}
            onClick={() => setActiveTab('liveCourses')}
            type="button"
          >
            Live Courses
          </button>
        </div>

        <div>
          {isDataLoaded ? (
            <>
              {activeTab === 'allCourses' && <Table data={courses} getAllCourses={getAllCourses} />}
              {activeTab === 'requestedCourses' && <RequestedCourses data={courses} getAllCourses={getAllCourses} />}
              {activeTab === 'publishedCourses' && <PublishedCourses data={courses} getAllCourses={getAllCourses}/>} 
              {activeTab === 'liveCourses' && <LiveCourses data={courses} getAllCourses={getAllCourses}/>} 
            </>
          ) : (
            <div className="loading-text">Loading courses...</div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Main;
