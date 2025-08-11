import React, { useState, useEffect, FormEvent } from 'react';
// import { IoMdTrash } from 'react-icons/io';
import axios from 'axios';
import AlertMUI from "./mui/AlertMUI";
import { baseUrl, authorizationObj } from "@/app/utils/core";

interface EditPlanFormProps {
    set_is_editing: React.Dispatch<React.SetStateAction<boolean>>;
    is_editing: boolean;  // Ensure the type is correct
    data: any;
    get_plans: () => void;
    set_data: React.Dispatch<React.SetStateAction<any>>;
    onClose: () => void; // Added onClose prop
}

const EditPlanForm = ({ set_is_editing, data, get_plans, set_data, is_editing }: EditPlanFormProps) => {

  const [plan_name, set_plan_name] = useState(data?.plan_name);
  const [plan_description, set_plan_description] = useState(data?.plan_description);
  const [plan_price, set_plan_price] = useState(+data?.plan_price);
  const [plan_medium, set_plan_medium] = useState(data?.plan_medium);
  const [plan_duration, set_plan_duration] = useState(+data?.plan_duration);
  const [tutors_allowed, set_tutors_allowed] = useState(+data?.tutors_allowed);
  const [courses_allowed, set_courses_allowed] = useState(+data?.courses_allowed);
  const [storage_allowed, set_storage_allowed] = useState(+data?.storage_allowed);
  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState("");
  const [success_message, set_success_message] = useState("");

  useEffect(() => {
    if (data) {
        set_plan_name(data?.plan_name);
        set_plan_description(data?.plan_description);
        set_plan_price(+data?.plan_price);
        set_plan_medium(data?.plan_medium);
        set_plan_duration(+data?.plan_duration);
        set_tutors_allowed(+data?.tutors_allowed);
        set_courses_allowed(+data?.courses_allowed);
        set_storage_allowed(+data?.storage_allowed);
    }

    return () => {
        set_plan_name('');
        set_plan_description('');
        set_plan_price(0);
        set_plan_medium('');
        set_plan_duration(0);
        set_tutors_allowed(0);
        set_courses_allowed(0);
        set_storage_allowed(0);
    };
}, [data]);


  const update_plan = async (e: FormEvent) => {
    e.preventDefault();
    if (!data?.id) return;
    console.log('Updating plan with data:', {
      plan_name, plan_description, plan_price, plan_medium, plan_duration, tutors_allowed, courses_allowed, storage_allowed
    });
  
    if (!plan_name || !plan_description || !plan_duration || !plan_medium || !tutors_allowed || !courses_allowed || !storage_allowed) {
      set_error_message("All fields are required");
      setTimeout(() => set_error_message(""), 3000);
      return;
    }
  
    const formData = new FormData();
    formData.append("plan_name", plan_name);
    formData.append("plan_description", plan_description);
    formData.append("plan_price", plan_price.toString());
    formData.append("plan_medium", plan_medium);
    formData.append("plan_duration", plan_duration.toString());
    formData.append("tutors_allowed", tutors_allowed.toString());
    formData.append("courses_allowed", courses_allowed.toString());
    formData.append("storage_allowed", storage_allowed.toString());
  
    console.log("Form data being sent:", formData);  // Add logging here
  
    try {
      set_is_loading(true);
      const resp = await axios.post(
        `${baseUrl}/subscription-plans/update/${data?.id}`,
        formData,
        authorizationObj
      );
      set_is_loading(false);
  
      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        set_error_message(resp?.data?.message);
        setTimeout(() => set_error_message(""), 3000);
        return;
      }
  
      set_success_message("Plan updated successfully");
      setTimeout(() => set_success_message(""), 3000);
      get_plans();
      set_data(null);  // Clear form data after success
      set_is_editing(false);  // Close the modal after successful update
    } catch (error) {
      console.error("Error updating plan", error);
      set_is_loading(false);
      set_error_message("Something went wrong, please try again later.");
      setTimeout(() => set_error_message(""), 3000);
    }
  };
  


  return (
    <div>
         {is_editing  && (
    <div className="modal fade show" style={{ display: 'block' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit Plan</h5>
            <button type="button" className="btn-close" onClick={() => set_is_editing(false)} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            {error_message && <AlertMUI text={error_message} status="error" />}
            {success_message && <AlertMUI text={success_message} status="success" />}
            <form onSubmit={update_plan}>
              {/* Plan Name */}
              <div className="mb-3">
                <label htmlFor="plan_name" className="form-label">Plan Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="plan_name"
                  value={plan_name || ""}
                  onChange={(e) => set_plan_name(e.target.value)}
                />
              </div>
  
              {/* Plan Description */}
              <div className="mb-3">
                <label htmlFor="plan_description" className="form-label">Plan Description</label>
                <textarea
                  className="form-control"
                  id="plan_description"
                  rows={3}
                  value={plan_description || ""}
                  onChange={(e) => set_plan_description(e.target.value)}
                />
              </div>
  
              {/* Grid for Price, Duration, Plan Medium, Tutors Allowed, Courses Allowed, Storage Allowed */}
              <div className="row">
                {/* Plan Price */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="plan_price" className="form-label">Plan Price (USD)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="plan_price"
                    value={plan_price || 0}
                    onChange={(e) => set_plan_price(Number(e.target.value))}
                  />
                </div>
  
                {/* Plan Duration */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="plan_duration" className="form-label">Duration (Months/Days/Years)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="plan_duration"
                    value={plan_duration || 0}
                    onChange={(e) => set_plan_duration(Number(e.target.value))}
                  />
                </div>
  
                {/* Plan Medium */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="plan_medium" className="form-label">Plan Medium</label>
                  <select
                    className="form-select"
                    id="plan_medium"
                    value={plan_medium || ""}
                    onChange={(e) => set_plan_medium(e.target.value)}
                  >
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                    <option value="day">Day</option>
                  </select>
                </div>
  
                {/* Tutors Allowed */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="tutors_allowed" className="form-label">Tutors Allowed</label>
                  <input
                    type="number"
                    className="form-control"
                    id="tutors_allowed"
                    value={tutors_allowed || 0}
                    onChange={(e) => set_tutors_allowed(Number(e.target.value))}
                  />
                </div>
  
                {/* Courses Allowed */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="courses_allowed" className="form-label">Courses Allowed</label>
                  <input
                    type="number"
                    className="form-control"
                    id="courses_allowed"
                    value={courses_allowed || 0}
                    onChange={(e) => set_courses_allowed(Number(e.target.value))}
                  />
                </div>
  
                {/* Storage Allowed */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="storage_allowed" className="form-label">Storage Allowed (MB)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="storage_allowed"
                    value={storage_allowed || 0}
                    onChange={(e) => set_storage_allowed(Number(e.target.value))}
                  />
                </div>
              </div>
  
              {/* Submit Button */}
              <div className="d-grid gap-2">
                <button type="submit" className="btn btn-primary" disabled={is_loading}>
                  {is_loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    )}
  </div>
  
  );
};

export default EditPlanForm;
