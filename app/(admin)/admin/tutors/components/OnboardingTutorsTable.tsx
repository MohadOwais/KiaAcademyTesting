"use client";
import React, { useEffect, useState } from "react";
import Table from "../../onboarding-tutors/components/Table";
import axios from "axios";
import { baseUrl, authorizationObj } from "@/app/utils/core";

// Define the type based on expected onboarding tutor fields
type OnboardingTutorData = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  // ➕ Add more fields based on actual API structure
};

const OnboardingTutorsTable = () => {
  const [data, setData] = useState<OnboardingTutorData[]>([]);

  const getAllOnboardingTutors = async () => {
    try {
      const res = await axios.get(`${baseUrl}/tutor`, authorizationObj);
      setData(res?.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch onboarding tutors", error);
    }
  };

  useEffect(() => {
    getAllOnboardingTutors();
  }, []);

  return (
    
      <Table data={data} getAllTutors={getAllOnboardingTutors} />
    
  );
};

export default OnboardingTutorsTable;
