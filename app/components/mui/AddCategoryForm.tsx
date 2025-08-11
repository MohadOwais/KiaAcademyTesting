import React, { useState } from "react";
import axios from "axios";
import { baseUrl, authorizationObj } from "@/app/utils/core";
import AlertMUI from "@/app/components/mui/AlertMUI";

const AddCategoryForm = ({ onClose, setAlert }: any) => {
  const [form, setForm] = useState({ category_name: "", category_description: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category_name", form.category_name);
    formData.append("category_description", form.category_description);

    try {
      await axios.post(
        `${baseUrl}/course-categories/create`,
        formData,
        {
          headers: {
            ...authorizationObj.headers,
            "Content-Type": "multipart/form-data",
          },
        } 
      );

      setAlert && setAlert({ type: "success", message: "Category added successfully!" });
      onClose && onClose();
    } catch (error: any) {
      setError("Error adding category.");
      setAlert && setAlert({ type: "error", message: "Error adding category." });
      console.error("Error Response:", error?.response?.data || error);
    }
  };

  return (
    <>
      {error && <AlertMUI status="error" text={error} />}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Category Name</label>
          <input
            type="text"
            className="form-control"
            value={form.category_name}
            onChange={(e) => setForm({ ...form, category_name: e.target.value })}
            required
          />
        </div>
        <div className="mb-3">
          <label>Description</label>
          <textarea
            className="form-control"
            value={form.category_description}
            onChange={(e) => setForm({ ...form, category_description: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="btn btn-success w-100">Submit</button>
      </form>
    </>
  );
};

export default AddCategoryForm;
