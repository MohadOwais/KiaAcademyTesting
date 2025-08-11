"use client";

import React, { useState, useEffect } from "react";
import {
  Typography,
  Tabs,
  Tab,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useTheme } from "@mui/material/styles";
import { useSelector } from "react-redux";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";

import Table from "./components/Table";
import { baseUrl, authorizationObj } from "@/app/utils/core";
import "./Main.css";

const Main: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentUser = useSelector((state: any) => state.user);
  const [tabValue, setTabValue] = useState<"all" | "live">("all");
  const [courses, setCourses] = useState<any[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Accordion states (Mobile)
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
  const [myCoursesExpanded, setMyCoursesExpanded] = useState(false);
  const [liveCoursesExpanded, setLiveCoursesExpanded] = useState(false);

  // Handle role switching reload
  useEffect(() => {
    const switchParam = searchParams.get('switch');
    if (switchParam === 'true') {
      // Reload the page
      window.location.href = `${window.location.origin}/student/courses`;
    }
  }, [searchParams, router]);

  const endpoint =
    tabValue === "live"
      ? `${baseUrl}/enrollments/student-live-courses/${currentUser?.user_id}`
      : `${baseUrl}/enrollments/student/${currentUser?.user_id}`;

  const fetchCourses = async () => {
    if (!currentUser?.user_id) return;
    setIsLoading(true);
    try {
      const resp = await axios.get(endpoint, authorizationObj);
      setCourses(resp.data?.data || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUpcomingClasses = async () => {
    if (!currentUser?.user_id) return;
    try {
      const resp = await axios.get(
        `${baseUrl}/live-classes/upcoming-classes-for-student/${currentUser?.user_id}`,
        authorizationObj
      );
      setUpcomingClasses(resp.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch upcoming classes", err);
      setUpcomingClasses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentUser?.user_id, tabValue]);

  useEffect(() => {
    fetchUpcomingClasses();
  }, [currentUser?.user_id]);

  const handleTabChange = (_: any, newValue: "all" | "live") => {
    setTabValue(newValue);
  };

  const toggleMyCourses = () => {
    const newState = !myCoursesExpanded;
    setMyCoursesExpanded(newState);
    if (newState) {
      setLiveCoursesExpanded(false);
      setTabValue("all");
    }
  };

  const toggleLiveCourses = () => {
    const newState = !liveCoursesExpanded;
    setLiveCoursesExpanded(newState);
    if (newState) {
      setMyCoursesExpanded(false);
      setTabValue("live");
    }
  };

  const pageTitle = tabValue === "live" ? "My Live Courses" : "My Courses";

  const renderUpcomingClassCard = (cls: any) => {
    const dateObj = new Date(cls.class_date);
    const timeObj = new Date(`${cls.class_date}T${cls.class_time}`);
    const month = dateObj.toLocaleString("en-US", { month: "long" });
    const day = dateObj.getDate().toString().padStart(2, "0");
    const formattedTime = timeObj.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const disabled = !cls.class_link;

    return (
      
      <Box
        key={cls.lecture_id}
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "center",
          mb: 2,
        }}
      >
        <div className="calendar-card">
          <div className="calendar-header">{month}</div>
          <div className="calendar-pin"></div>
          <div className="calendar-date">{day}</div>
        </div>

        <Box sx={{ flex: 1 }}>
          {/* Title */}
          <h3
            className="heading-style"
            style={{ fontWeight: 600, fontSize: "1rem" }}
          >
            {cls.title?.trim()}
          </h3>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 0.5,
            }}
          >
            {/* <Typography variant="body2" color="text.secondary">
              {formattedTime}
            </Typography> */}
            <h3 className="heading-style">
            {formattedTime}
            </h3>

            <Tooltip
              title={disabled ? "Class not started" : "Join Now"}
              arrow
              placement="bottom"
            >
              <span>
                <Button
                  className="btn btn-view rounded-pill"
                  disabled={disabled}
                  onClick={() => {
                    if (!disabled) window.open(cls.class_link, "_blank");
                  }}
                  sx={{
                    fontSize: "0.75rem",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    textTransform: "none",
                    backgroundColor: disabled ? "grey.400" : "primary.main",
                    color: "#fff",
                    boxShadow: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: disabled ? "grey.400" : "primary.dark",
                      boxShadow: 6,
                    },
                  }}
                >
                  🚀 Join Class
                </Button>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box className="flex flex-col gap-4 mt-4 flex-1 px-4">
      <h3 className="heading-style" style={{ fontWeight: 600 }}>
        {pageTitle}
      </h3>

      {isMobile ? (
        <>
          <Accordion
            expanded={upcomingExpanded}
            onChange={() => setUpcomingExpanded((prev) => !prev)}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <h3 className="heading-style">Upcoming Classes</h3>
            </AccordionSummary>
            <AccordionDetails>
              {upcomingClasses.map(renderUpcomingClassCard)}
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={myCoursesExpanded} onChange={toggleMyCourses}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <h3 className="heading-style">My Courses</h3>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                data={courses}
                getAllCourses={fetchCourses}
                is_loading={isLoading}
                set_is_loading={setIsLoading}
                
              />
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={liveCoursesExpanded}
            onChange={toggleLiveCourses}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <h3 className="heading-style">My Live Courses</h3>
            </AccordionSummary>
            <AccordionDetails>
              <Table
                data={courses}
                getAllCourses={fetchCourses}
                is_loading={isLoading}
                set_is_loading={setIsLoading}
                isLiveCourse={tabValue === "live"} // 🔥 Add this line
              />
            </AccordionDetails>
          </Accordion>
        </>
      ) : (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box sx={{ flex: "0 0 80%", pr: 1, borderRight: "1px solid #ddd" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="Course Tabs"
              indicatorColor="primary"
              textColor="primary"
              sx={{ borderBottom: "1px solid #e0e0e0", mb: 2 }}
            >
              <Tab value="all" label="My Courses" />
              <Tab value="live" label="My Live Courses" />
            </Tabs>
            <Table
              data={courses}
              getAllCourses={fetchCourses}
              is_loading={isLoading}
              set_is_loading={setIsLoading}
              isLiveCourse={tabValue === "live"} // 🔥 Add this line
            />
          </Box>

          <Box sx={{ flex: "0 0 20%", pl: 2 }}>
            <h3 className="heading-style" 
            style={{ marginBottom: "10px", fontWeight: "bold", color: "primary.main" }}>
              Upcoming Classes
            </h3>
            {upcomingClasses.map(renderUpcomingClassCard)}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Main;
