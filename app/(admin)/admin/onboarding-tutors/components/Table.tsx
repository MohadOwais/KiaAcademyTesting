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
import moment from "moment";
import axios from "axios";
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { authorizationObj, baseUrl, profilePicture } from "@/app/utils/core";
import { capitalizeString } from "@/app/utils/functions";
import { SingleCourseCard } from "@/app/(web)/current-courses/components/courses-section/CourseCard";
import CourseCardSkeleton from "@/app/components/mui/CourseCardSkeleton";
import { FilePreview } from "@/app/(web)/profile/Docs";

interface TutorData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_picture?: string;
  status?: string;
  user_status?: string;
  job_title?: string;
  bio?: string;
  id_document_type?: string;
  id_document_number?: string;
  proof_of_address?: string;
  kyc_id?: string;
  created_at?: string;
  updated_at?: string;
  verified_at?: string;
  rejected_reason?: string;
  document_image?: string;
  [key: string]: any;
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

const ViewTutor = ({ selectedTutor, setSelectedTutor, getAllTutors }: any) => {
  const [rejected_reason, set_rejected_reason] = useState(
    selectedTutor.rejected_reason
      ? capitalizeString(selectedTutor.rejected_reason)
      : "N/A"
  );
  const [user_status, set_user_status] = useState(selectedTutor?.user_status);
  const [is_loading, set_is_loading] = useState(false);
  const [courses, set_courses] = useState<any[]>([]);

  const user_statuses = [
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Suspended", value: "suspended" },
    { label: "Inactive", value: "inactive" },
 
  ];


  const update_tutor = async () => {
    try {
      set_is_loading(true);
      const formData = new FormData();
      formData.append("status", user_status);
      const resp = await axios.post(
        `${baseUrl}/users/update-status/${selectedTutor?.user_id}`,
        formData,
        authorizationObj
      );
      setSelectedTutor({ ...selectedTutor, user_status: user_status });
      getAllTutors();
      set_is_loading(false);
    } catch (error) {
      set_is_loading(false);
    }
  };

  useEffect(() => {
    get_courses();
  }, [selectedTutor, selectedTutor?.user_id]);

  const get_courses = async () => {
    if (
      !selectedTutor ||
      !selectedTutor?.user_id ||
      selectedTutor?.user_id?.trim() === ""
    )
      return;
    try {
      const resp = await axios.get(
        `${baseUrl}/courses/by-instructor/${selectedTutor?.user_id}`,
        authorizationObj
      );
      set_courses(resp?.data?.data ? resp?.data?.data : []);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div
      className="modal fade tutor-modal"
      id="viewTutorModal"
      tabIndex={-1}
      aria-labelledby="viewTutorModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          {/* Modal Header */}
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="viewTutorModalLabel">
              <i className="bi bi-person-badge me-2"></i>
              <strong>Tutor Details</strong>
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            {/* Profile Section */}
            <div className="row mb-4 align-items-center">
              <div className="col-auto">
                <div className="position-relative">
                  <Image
                    alt={`${selectedTutor.first_name} ${selectedTutor.last_name}`}
                    src={selectedTutor?.profile_picture || profilePicture}
                    width={80}
                    height={80}
                    className="rounded-circle border border-3 border-primary"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = profilePicture;
                      target.onerror = null;
                    }}
                  />
                  <span
                    className={`position-absolute bottom-0 end-0 badge rounded-pill bg-${getStatusColor(
                      user_status
                    )}`}
                  >
                    {user_status ? capitalizeString(user_status) : "N/A"}
                  </span>
                </div>
              </div>
              <div className="col">
                <h4 className="mb-1">{`${selectedTutor.first_name} ${selectedTutor.last_name}`}</h4>
                <p className="text-muted mb-1">
                  <i className="bi bi-envelope me-2"></i>
                  {selectedTutor.email}
                </p>
                {selectedTutor.job_title && (
                  <p className="text-muted mb-0">
                    <i className="bi bi-briefcase me-2"></i>
                    {capitalizeString(selectedTutor.job_title)}
                  </p>
                )}
              </div>
              <div className="col-md-5">
                <label className="form-label fw-bold">Status</label>
                <select
                  className="form-select"
                  value={user_status}
                  onChange={(e) => set_user_status(e.target.value)}
                >
                  {user_statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Personal Info */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-person-lines-fill me-2"></i>Personal
                  Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Bio</label>
                    <p className="form-control-plaintext">
                      {selectedTutor.bio || "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Rejected Reason
                    </label>
                    <p className="form-control-plaintext">
                      {user_status === "rejected" ? rejected_reason : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Info */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-file-text me-2"></i>Document Information
                </h6>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      ID Document Type
                    </label>
                    <p className="form-control-plaintext">
                      {selectedTutor.id_document_type
                        ? capitalizeString(selectedTutor.id_document_type)
                        : "N/A"}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">
                      ID Document Number
                    </label>
                    <p className="form-control-plaintext">
                      {selectedTutor.id_document_number || "N/A"}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">KYC ID</label>
                    <p className="form-control-plaintext">
                      {selectedTutor.kyc_id || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-calendar me-2"></i>Timeline
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Registered on
                    </label>
                    <p className="form-control-plaintext">
                      {selectedTutor.created_at
                        ? moment(selectedTutor.created_at).format(
                            "MMMM D, YYYY"
                          )
                        : "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Preview On</label>
                    <p className="form-control-plaintext">
                      {selectedTutor.updated_at
                        ? moment(selectedTutor.updated_at).format(
                            "MMMM D, YYYY"
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-file-earmark me-2"></i>Documents
                </h6>
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="mb-2 fw-semibold">Document Image</h6>
                    <FilePreview
                      fileName={selectedTutor.document_image}
                      label="No Document Image Available"
                    />
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-2 fw-semibold">Proof Of Address</h6>
                    <FilePreview
                      fileName={selectedTutor.proof_of_address}
                      label="No Proof Of Address Available"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Courses */}
            <div className="card mb-3">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <i className="bi bi-book me-2"></i>Tutor's Courses
                </h6>
                {is_loading ? (
                  <div className="row">
                    {[1, 2, 3].map((i) => (
                      <div className="col-md-4 mb-3" key={i}>
                        <CourseCardSkeleton />
                      </div>
                    ))}
                  </div>
                ) : courses?.length ? (
                  <div className="row">
                    {courses.map((course: any, i: number) => (
                      <div className="col-md-4 mb-3" key={i}>
                        <SingleCourseCard course={course} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted text-center">No Courses Available</p>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              <i className="bi bi-x-circle me-2"></i> Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={user_status === selectedTutor.user_status || is_loading}
              onClick={update_tutor}
            >
              {is_loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
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
  );
};

const TTable = ({
  data,
  getAllTutors,
}: {
  data: TutorData[];
  getAllTutors: () => void;
}) => {
  const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
  const tableRef = useRef<HTMLTableElement>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorData | null>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setIsDataLoaded(true);
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
    const handler = async (e: Event) => {
      const target = e.target as HTMLElement;
      const viewBtn = target.closest('.view-tutor-btn') as HTMLButtonElement | null;
      if (viewBtn && viewBtn.dataset.id) {
        const userId = viewBtn.dataset.id;
        try {
          const resp = await axios.get(
            `${baseUrl}/users/${userId}`,
            authorizationObj
          );
          if (resp?.data?.data) {
            setSelectedTutor(resp?.data?.data);
            const modalElem = document.getElementById("viewTutorModal");
            if (modalElem) {
              new bootstrap.Modal(modalElem).show();
            }
          }
        } catch (error) {
          // Handle error
        }
      } 
    };
    const table = tableRef.current;
    if (table) table.addEventListener('click', handler);
    return () => {
      if (table) table.removeEventListener('click', handler);
    };
  }, [isDataLoaded, data]);


      const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";

  return (
    <div
    className={`table-cont-sts ${sidebarClass}`}
    >
      {isDataLoaded ? (
        <>
          <table
            ref={tableRef}
            className="display table table-striped responsive table-hover"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Job Title</th>
                <th>Status</th>
                <th>Registered On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.filter((tutor) => tutor.user_status !== "active").length >
              0 ? (
                data
                  .filter((tutor) => tutor.user_status !== "active")
                  .map((tutor: TutorData, index: number) => (
                    <tr key={tutor.user_id || index}>
                      <td>{index + 1}</td>
                      <td>
                        <img
                          src={tutor.profile_picture || profilePicture}
                          alt={`${tutor.first_name} ${tutor.last_name}`}
                          width={35}
                          height={35}
                          className="rounded-circle"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (img.src !== profilePicture) {
                              img.src = profilePicture;
                            }
                          }}
                        />
                      </td>
                      <td>{`${tutor.first_name} ${tutor.last_name}`}</td>
                      <td>{tutor.email}{tutor.user_id}</td>
                      <td>
                        {tutor.job_title
                          ? capitalizeString(tutor.job_title)
                          : "N/A"}
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill text-white p-2 bg-${getStatusColor(
                            tutor.user_status || ""
                          )}`}
                          style={{
                            width: "80px",
                            display: "inline-block",
                            textAlign: "center",
                            textTransform: "capitalize",
                          }}
                        >
                          {tutor.user_status
                            ? capitalizeString(tutor.user_status)
                            : "N/A"}
                        </span>
                      </td>

                      <td>
                        {tutor.created_at
                          ? moment(tutor.created_at).format("MMMM D, YYYY")
                          : "N/A"}
                      </td>

                      <td>
                        <button
                          className="btn btn-sm btn-view rounded-pill text-white view-tutor-btn"
                          data-id={tutor.user_id}
                          type="button"
                        >
                          <i className="bi bi-eye-fill"></i>View
                        </button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    No Active Tutors Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {selectedTutor && (
            <ViewTutor
              selectedTutor={selectedTutor}
              setSelectedTutor={setSelectedTutor}
              getAllTutors={getAllTutors}
            />
          )}
        </>
      ) : (
        <div className="loading-text">Loading tutors...</div>
      )}
    </div>
  );
};

export default TTable;
