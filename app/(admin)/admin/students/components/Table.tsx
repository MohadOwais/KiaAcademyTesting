"use client";

import "./Main.css";
import "./Table.css";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux"; 
import Image from "next/image";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import moment from "moment"; 
import axios from "axios";
import { authorizationObj, baseUrl, profilePicture } from "@/app/utils/core";
import { capitalizeString } from "@/app/utils/functions";
import { Modal } from "bootstrap";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";



interface StudentData {
  student_id: string;
  user_id: string;
  date_of_birth: string | null;
  bio: string | null; // Use the same type here
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
  profile_picture?: string | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "success";
    case "pending":
      return "warning";
    case "suspended":
      return "danger";
    default:
      return "secondary";
  }
};

const ViewStudent = ({
selectedStudent,
setSelectedStudent,
getAllStudents,
}: any) => {
const [user_status, set_user_status] = useState(selectedStudent?.user_status);
const [is_loading, set_is_loading] = useState(false);

useEffect(() => {
set_user_status(selectedStudent?.user_status);
}, [selectedStudent]);

const user_statuses = [
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
  { label: "Inactive", value: "inactive" },
];

const update_student = async () => {
  try {
    set_is_loading(true);
    const formData = new FormData();
    formData.append("status", user_status);

    const resp = await axios.post(
      `${baseUrl}/users/update-status/${selectedStudent?.user_id}`,
      formData,
      authorizationObj
    );

    // Update the selected student's status
    setSelectedStudent((prev: StudentData) => ({
      ...prev,
      user_status: user_status,
    }));

    // Refresh the students list
    await getAllStudents();


// Close the modal
const modalElement = document.getElementById("viewStudentModal");
if (modalElement) {
const modal = Modal.getInstance(modalElement);
if (modal) modal.hide();
}
} catch (error) {
console.error("Error updating institute status:", error);
} finally {
set_is_loading(false);
}
};
return (
<div className="modal fade student-modal" id="viewStudentModal" tabIndex={-1} aria-labelledby="viewStudentModalLabel"
  aria-hidden="true">
  <div className="modal-dialog modal-dialog-centered modal-lg">
    <div className="modal-content">
      <div className="modal-header bg-primary text-white">
        <h5 className="modal-title" id="viewStudentModalLabel">
          <i className="bi bi-person-badge me-2"></i>
          Student Details
        </h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div className="modal-body">
        <div className="row align-items-center mb-4">
          <div className="col-auto position-relative">
            <Image alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
              src={selectedStudent?.profile_picture || profilePicture} width={80} height={80}
              className="rounded-circle border border-3 border-primary" onError={(e: any)=> (e.target.src =
              profilePicture)}
              />
              <span className={`position-absolute bottom-0 end-0 badge rounded-pill bg-${getStatusColor( user_status
                )}`}>
                {user_status ? capitalizeString(user_status) : "N/A"}
              </span>
          </div>

          <div className="col">
            <h4 className="mb-1">{`${selectedStudent.first_name} ${selectedStudent.last_name}`}</h4>
            <p className="text-muted mb-1">
              <i className="bi bi-envelope me-2"></i>
              {selectedStudent.email}
            </p>
            {selectedStudent.student_mobile_number && (
            <p className="text-muted mb-0">
              <i className="bi bi-telephone me-2"></i>
              {selectedStudent.student_mobile_number}
            </p>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label fw-bold">Status</label>
            <select className="form-select" value={user_status} onChange={(e)=> set_user_status(e.target.value)}
              >
              {user_statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row g-3">
          {/* Personal Information */}
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <i className="bi bi-person-lines-fill me-2"></i> Personal
                  Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Bio</label>
                    <p>{selectedStudent.bio || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <i className="bi bi-house me-2"></i> Contact Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Address</label>
                    <p>
                      {selectedStudent.address
                      ? capitalizeString(selectedStudent.address)
                      : "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Date of Birth
                    </label>
                    <p>
                      {selectedStudent.date_of_birth
                      ? moment(selectedStudent.date_of_birth).format(
                      "MMMM D, YYYY"
                      )
                      : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <i className="bi bi-people me-2"></i> Parent Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Parent Email
                    </label>
                    <p>{selectedStudent.student_parent_email || "N/A"}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Parent Mobile
                    </label>
                    <p>{selectedStudent.student_parent_mobile || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">
                  <i className="bi bi-calendar me-2"></i> Timeline
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      Registered On
                    </label>
                    <p>
                      {selectedStudent.created_at
                      ? moment(selectedStudent.created_at).format(
                      "MMMM D, YYYY"
                      )
                      : "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Updated At</label>
                    <p>
                      {selectedStudent.updated_at
                      ? moment(selectedStudent.updated_at).format(
                      "MMMM D, YYYY"
                      )
                      : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
            <i className="bi bi-x-circle me-2"></i> Close
          </button>
          <button type="button" className="btn btn-primary" disabled={ user_status===selectedStudent.user_status ||
            is_loading } onClick={update_student}>
            {is_loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Saving...
            </>
            ) : (
            <>
              <i className="bi bi-check-circle me-2"></i> Save Changes
            </>
            )}
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
);
};

const TTable = ({
data,
getAllStudents,
}: {
data: StudentData[];
getAllStudents: () => void;
}) => {
const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
const tableRef = useRef<HTMLTableElement>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null
    );

    useEffect(() => {
    if (data && data.length > 0) {
    setIsDataLoaded(true);
    // console.log("All Students Data:", data); 
    }
    }, [data]); 

    useEffect(() => {
    let tableInstance: any;

    if (isDataLoaded && tableRef.current) {
    if ($.fn.DataTable.isDataTable(tableRef.current)) {
    $(tableRef.current).DataTable().destroy();
    }

    tableInstance = $(tableRef.current).DataTable({
    paging: true,
    searching: true,
    ordering: true,
    responsive: true,
    });
    }

    return () => {
    if (tableInstance) {
    tableInstance.destroy();
    }
    };
    }, [isDataLoaded, data]);


     useEffect(() => {
                const handler = async (event: any) => {
                    const btn = event.target.closest(".view-btn");
                    if (!btn) return;
            
                    const id = btn.getAttribute("data-id");
                    const selected = data.find((d) => d.user_id === id);
                    if (selected) await handleViewStudent(selected);
                };
            
                const tableEl = tableRef.current;
                if (tableEl) {
                    tableEl.addEventListener("click", handler);
                }
            
                return () => {
                    if (tableEl) tableEl.removeEventListener("click", handler);
                };
            }, [data]);

    const handleViewStudent = async (row: StudentData) => {
      const userId = row?.user_id;
      if (!userId) {
        console.error("No Student ID provided");
        return;
      }
      try {
        const resp = await axios.get(
          `${baseUrl}/users/${userId}`,
          authorizationObj
        );
        if (resp?.data?.data) {
          setSelectedStudent(resp?.data?.data);
          setTimeout(() => {
            const modalEl = document.getElementById("viewStudentModal");
            if (modalEl) {
              // @ts-ignore
              const modal = new bootstrap.Modal(modalEl);
              modal.show();
            }
          }, 100);
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      }
    }; 
    

    // Dynamically set sidebar state class for responsive width
    const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";
    return (
    <div className={`table-cont-sts ${sidebarClass}`}>
      {isDataLoaded ? (
      <>
        <table ref={tableRef} className="display table table-striped responsive table-hover">
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
              <th>Registered On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
            data.map((student: StudentData, index: number) => (
            <tr key={student.user_id || index}>
              <td>{index + 1}</td>
              <td>
                <div className="d-flex align-items-center">
                  <Image src={ student.profile_picture ? student.profile_picture : profilePicture }
                    alt={`${student.first_name} ${student.last_name}`} width={35} height={35} className="rounded-circle"
                    />
                </div>
              </td>
              <td>{`${student.first_name} ${student.last_name}`}</td>
              <td>{student.email}</td>
              <td>{student.student_mobile_number || "N/A"}</td>
              <td>
                <span className={`badge rounded-pill text-white p-2 bg-${getStatusColor( student.user_status || "" )}`}
                  style={{
                          width: "80px",
                          display: "inline-block",
                          textAlign: "center",
                          textTransform: "capitalize",
                        }}>
                  {student.user_status
                  ? capitalizeString(student.user_status)
                  : "N/A"}
                </span>
              </td>
              <td>
                {student.created_at
                ? moment(student.created_at).format("MMMM D, YYYY")
                : "N/A"}
              </td>
              <td>
                <button className="btn btn-sm btn-view rounded-pill text-white view-btn" data-id={student.user_id}
                  >
                  <i className="bi bi-eye-fill"></i>View
                </button>
              </td>
            </tr>
            ))
            ) : (
            <tr>
              <td colSpan={8} style={{ textAlign: "center" }}>
                No Students Available
              </td>
            </tr>
            )}
          </tbody>
        </table>
        {selectedStudent && (
        <ViewStudent selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent}
          getAllStudents={getAllStudents} />
        )}
      </>
      ) : (
      <div className="loading-text">Loading students...</div>
      )}
    </div>
    );
    };

    export default TTable;