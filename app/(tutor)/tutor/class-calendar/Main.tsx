"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Button, CircularProgress } from "@mui/material";
import { MdVideocamOff } from "react-icons/md";
import { format } from "date-fns";
import { BsCalendar4Event } from "react-icons/bs";
import toast, { Toaster } from "react-hot-toast";

import AlertMUI from "@/app/components/mui/AlertMUI";
import { authorizationObj, baseUrl } from "@/app/utils/core";

interface ClassSession {
  meeting_id: string;
  title: string;
  course_title: string;
  class_date: string;
  class_time: string;
}

const NoClasses = () => (
  <div className="w-full flex flex-col justify-center items-center gap-4 mt-16" style={{ minHeight: "40vh" }}>
    
    <p className="w-full text-center text-xl"> <MdVideocamOff style={{ fontSize: "120px" }} /> No Upcoming Classes Found</p>
  </div>
);

const ClassCard = ({
  session,
  joinLiveClass,
  isLoading,
}: {
  session: ClassSession;
  joinLiveClass: (meetingId: string) => void;
  isLoading: boolean;
}) => {
  const date = new Date(`${session.class_date}T${session.class_time}`);
  const day = format(date, "dd");
  const time = format(date, "hh:mm a");

  return (
    <div className="d-flex align-items-start gap-4 mb-4 bg-white rounded-3 shadow-sm p-3 position-relative hover:shadow-md transition-shadow">
      <div className="text-center" style={{ minWidth: '80px' }}>
        <div className="bg-dark-2 text-white p-2 rounded-top">
          <small className="text-uppercase fw-bold">{format(date, "MMM")}</small>
        </div>
        <div className="border border-top-0 p-2 rounded-bottom">
          <h4 className="mb-0">{day}</h4>
        </div>
      </div>

      <div className="flex-grow-1">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="mb-1">{session.title}</h5>
            <p className="text-muted mb-1">
              <BsCalendar4Event className="me-2" />
              <small>{time}</small>
            </p>
            <p className="text-muted mb-0">
              <small> <strong>Course Title:</strong> {session.course_title}</small>
            </p>
          </div>
          <div>
            <Button
              className="btn-view fw-bold"
              variant="contained"
              onClick={() => joinLiveClass(session.meeting_id)}
              disabled={isLoading}
              size="small"
            >
              Join Class
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Main = () => {
  const currentUser = useSelector((state: any) => state?.user);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/live-classes/upcoming-classes-for-instructor/${currentUser?.user_id}`,
        authorizationObj
      );
      
      const now = new Date();
      const upcomingSessions = response.data.data
        .filter((session: any) => {
          const sessionDate = new Date(`${session.class_date}T${session.class_time}`);
          return sessionDate > now;
        })
        .sort((a: ClassSession, b: ClassSession) => {
          const dateA = new Date(`${a.class_date}T${a.class_time}`);
          const dateB = new Date(`${b.class_date}T${b.class_time}`);
          return dateA.getTime() - dateB.getTime();
        });

      setSessions(upcomingSessions);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch sessions");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const joinLiveClass = async (meetingId: string) => {
    if (!meetingId?.trim()) return;

    const formData = new FormData();
    formData.append("meeting_id", meetingId);
    formData.append(
      "full_name",
      `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`
    );
    const role = currentUser?.role_id === "3"
      ? "student"
      : currentUser?.role_id === "2"
        ? "instructor"
        : "";
    formData.append("role", role);

    try {
      setIsLoading(true);
      const resp = await axios.post(
        `${baseUrl}/live-classes/joinClass`,
        formData,
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (resp?.data?.status >= 200 && resp?.data?.status < 300) {
        window.open(resp.data.data.joinUrl, "_blank");
      } else {
        throw new Error(resp?.data?.message || "Unable to join");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to join class");
      setTimeout(() => setErrorMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4">
      {errorMessage && <AlertMUI status="error" text={errorMessage} />}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 heading-style">My Upcomming Classes</h3>
      </div>

      {isLoading ? (
        <div className="text-center mt-5">
          <CircularProgress />
        </div>
      ) : sessions.length > 0 ? (
        <div className="row">
          {sessions.map((session) => (
            <div key={session.meeting_id} className="col-12">
              <ClassCard
                session={session}
                joinLiveClass={joinLiveClass}
                isLoading={isLoading}
              />
            </div>
          ))}
        </div>
      ) : (
        <NoClasses />
      )}
    </div>
  );
};

export default Main;
