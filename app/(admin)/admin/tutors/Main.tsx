"use client";

import React, { useState } from "react";
import TutorsTable from "./components/TutorsTable";
import OnboardingTutorsTable from "./components/OnboardingTutorsTable";
import { Typography, Tabs, Tab, Box } from "@mui/material";
import ProtectedRoute from "@/app/components/ProtectedRoute";

const Main = () => {
const [activeTab, setActiveTab] = useState("tutors");

const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
setActiveTab(newValue);
};

return (
<ProtectedRoute allowedRoleIds={["1"]}>
  <div className="flex flex-col justify-start items-start gap-4 mt-4 w-full">
  <div className="mb-4 d-flex notification-tabs-responsive">
    <button
      className={`notification-pill-btn${activeTab === 'tutors' ? ' active' : ''}`}
      onClick={() => setActiveTab('tutors')}
      type="button"
    >
      Active Tutors
    </button> 
    <button
      className={`notification-pill-btn${activeTab === 'onboarding' ? ' active' : ''}`}
      onClick={() => setActiveTab('onboarding')}
      type="button"
    >
      Onboarding Tutors
    </button>
  </div>

  <Box className="mt-3 w-full">
    {activeTab === "tutors" && <TutorsTable />}
    {activeTab === "onboarding" && <OnboardingTutorsTable />}
  </Box>
</div>
</ProtectedRoute>

);
};

export default Main;