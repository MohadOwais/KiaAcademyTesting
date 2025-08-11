import Table from "./Table";
import { useEffect, useState } from "react";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import axios from "axios";

// Define the TutorData type properly
type TutorData = {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  // ➕ Add more fields as needed
};

const TutorsTable = () => {
  const [data, setData] = useState<TutorData[]>([]);

  const getAllTutors = async () => {
    try {
      const res = await axios.get(`${baseUrl}/tutor`, authorizationObj);
      setData(res?.data?.data || []); // same structure as in Main.tsx
    } catch (err) {
      console.error("Error fetching tutors", err);
    }
  };

  useEffect(() => {
    getAllTutors();
  }, []);

  return <Table data={data} getAllTutors={getAllTutors} />;
};

export default TutorsTable;
