"use client";

import "./Main.css";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import { Typography } from "@mui/material";
import Table from "./components/Table";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface StudentData {
student_id: string;
user_id: string;
date_of_birth: string | null;
bio: string | null;
student_mobile_number: string | null;
student_parent_mobile: string | null;
student_parent_email: string | null;
address: string | null;
created_at: string;
updated_at: string | null;
email: string;
first_name: string;
last_name: string;
user_status: string;
profile_picture?: string | null; // extra field from user endpoint
}

const Main = () => {
const [students, set_students] = useState<StudentData[]>([]);

  const getAllStudents = async () => {
  try {
  const resp = await axios.get(`${baseUrl}/students`, authorizationObj);
  const studentsData = resp?.data?.data || [];

  const enrichedStudents = await Promise.all(
  studentsData.map(async (student: StudentData) => {
  try {
  const userResp = await axios.get(
  `${baseUrl}/users/${student.user_id}`,
  authorizationObj
  );
  const profile_picture =
  userResp?.data?.data?.profile_picture || "/default-profile.png"; // Use default image if undefined
  return { ...student, profile_picture };
  } catch (err) {
  console.error(
  `Error fetching user data for user_id: ${student.user_id}`,
  err
  );
  return { ...student, profile_picture: "/default-profile.png" }; // Use default image on error
  }
  })
  );

  // console.log("Enriched Students:", enrichedStudents);
  set_students(enrichedStudents);
  } catch (error) {
  console.error("Error fetching students:", error);
  }
  };

  useEffect(() => {
  getAllStudents();
  }, []);

  return (
  <>
    <ProtectedRoute allowedRoleIds={["1"]}>
      <div className="flex flex-col justify-start items-start gap-4 mt-4">
        <h3 className="heading-style">Students</h3>
        <Table data={students} getAllStudents={getAllStudents} />
      </div>
    </ProtectedRoute>
  </>
  );
  };

  export default Main;