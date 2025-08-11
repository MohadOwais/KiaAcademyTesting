import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "@/app/utils/core";
import AlertMUI from "@/app/components/mui/AlertMUI";

const UpdateCategoryForm = ({ categoryId, onClose, setAlert }: any) => {
  const [form, setForm] = useState({ category_name: "", category_description: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await axios.get(
          `${baseUrl}/course-categories/${categoryId}`,
          {
            headers: {
              Authorization: "Bearer skca17503e8090629285ecbc75f309379799df12d",
            },
          }
        );
        setForm(res.data.data);
      } catch (error) { 
        console.error("Failed to fetch category:", error);
      }
    }; 

    if (categoryId) fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("category_name", form.category_name);
    formData.append("category_description", form.category_description);

    try {
      await axios.post(
        `${baseUrl}/course-categories/update/${categoryId}`,
        formData,
        {
          headers: {
            Authorization: "Bearer skca17503e8090629285ecbc75f309379799df12d",
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setAlert && setAlert({ type: "success", message: "Category updated successfully!" });
      onClose && onClose();
    } catch (error: any) {
      setError("Error updating category.");
      setAlert && setAlert({ type: "error", message: "Error updating category." });
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
        <button type="submit" className="btn btn-primary w-100">Update</button>
      </form>
    </>
  );
};

export default UpdateCategoryForm;
