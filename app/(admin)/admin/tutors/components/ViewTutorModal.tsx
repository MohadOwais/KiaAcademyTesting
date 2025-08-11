"use client";

import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import Image from "next/image";
import moment from "moment";
import axios from "axios";
import { authorizationObj, baseUrl, profilePicture } from "@/app/utils/core";
import { capitalizeString } from "@/app/utils/functions";
import { FilePreview } from "@/app/(web)/profile/Docs";
import CourseCardSkeleton from "@/app/components/mui/CourseCardSkeleton";
import { SingleCourseCard } from "@/app/(web)/current-courses/components/courses-section/CourseCard";

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

const ViewTutorModal = ({ show, onHide, tutor, getAllTutors }: any) => {
  const [rejected_reason, set_rejected_reason] = useState(
    tutor?.rejected_reason ? capitalizeString(tutor.rejected_reason) : "N/A"
  );
  const [user_status, set_user_status] = useState(tutor?.user_status);
  const [is_loading, set_is_loading] = useState(false);
  const [courses, set_courses] = useState<any[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  const user_statuses = [
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Suspended", value: "suspended" },
    { label: "Inactive", value: "inactive" },
  ];

  useEffect(() => {
    set_user_status(tutor?.user_status);
    set_rejected_reason(
      tutor?.rejected_reason ? capitalizeString(tutor.rejected_reason) : "N/A"
    );
    get_courses();
    // eslint-disable-next-line
  }, [tutor]);

  const get_courses = async () => {
    if (!tutor || !tutor?.user_id || tutor?.user_id?.trim() === "") return;
    set_is_loading(true);
    try {
      const resp = await axios.get(
        `${baseUrl}/courses/by-instructor/${tutor.user_id}`,
        authorizationObj
      );
      set_courses(resp?.data?.data ? resp.data.data : []);
    } catch (error) {
      set_courses([]);
    }
    set_is_loading(false);
  };

  const update_tutor = async () => {
    try {
      set_is_loading(true);
      setSuccessMessage("");
      const formData = new FormData();
      formData.append("status", user_status);
      await axios.post(
        `${baseUrl}/users/update-status/${tutor?.user_id}`,
        formData,
        authorizationObj
      );
      if (getAllTutors) await getAllTutors();
      setSuccessMessage("Status updated successfully!");
      setTimeout(() => {
        set_is_loading(false);
        setSuccessMessage("");
        onHide();
      }, 1200);
    } catch (error) {
      set_is_loading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      dialogClassName="custom-zindex-modal modal-fullscreen-sm-down"
      style={{ zIndex: 1050 }}
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="bi bi-person-badge me-2"></i>
          <strong>Tutor Details</strong>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Profile Section */}
        <div className="row mb-4 align-items-center">
          <div className="col-auto">
            <div className="position-relative">
              <Image
                alt={`${tutor.first_name} ${tutor.last_name}`}
                src={tutor?.profile_picture || profilePicture}
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
            <h4 className="mb-1">{`${tutor.first_name} ${tutor.last_name}`}</h4>
            <p className="text-muted mb-1">
              <i className="bi bi-envelope me-2"></i>
              {tutor.email}
            </p>
            {tutor.job_title && (
              <p className="text-muted mb-0">
                <i className="bi bi-briefcase me-2"></i>
                {capitalizeString(tutor.job_title)}
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
              <i className="bi bi-person-lines-fill me-2"></i>Personal Information
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Bio</label>
                <p className="form-control-plaintext">{tutor.bio || "N/A"}</p>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Rejected Reason</label>
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
                <label className="form-label fw-semibold">ID Document Type</label>
                <p className="form-control-plaintext">
                  {tutor.id_document_type
                    ? capitalizeString(tutor.id_document_type)
                    : "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">ID Document Number</label>
                <p className="form-control-plaintext">
                  {tutor.id_document_number || "N/A"}
                </p>
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">KYC ID</label>
                <p className="form-control-plaintext">{tutor.kyc_id || "N/A"}</p>
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
                <label className="form-label fw-semibold">Registered On</label>
                <p className="form-control-plaintext">
                  {tutor.created_at
                    ? moment(tutor.created_at).format("MMMM D, YYYY")
                    : "N/A"}
                </p>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Preview On</label>
                <p className="form-control-plaintext">
                  {tutor.updated_at
                    ? moment(tutor.updated_at).format("MMMM D, YYYY")
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
                  fileName={tutor.document_image}
                  label="No Document Image Available"
                />
              </div>
              <div className="col-md-6">
                <h6 className="mb-2 fw-semibold">Proof Of Address</h6>
                <FilePreview
                  fileName={tutor.proof_of_address}
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
                  <div className="col-md-6 mb-3 shadow-sm" key={i}>
                    <CourseCardSkeleton />
                  </div>
                ))}
              </div>
            ) : courses?.length ? (
              <div className="row">
                {courses.map((course: any, i: number) => (
                  <div className="col-md-6 mb-3 shadow-sm" key={i}>
                    <SingleCourseCard course={course} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-center">No Courses Available</p>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        {successMessage && (
          <div className="alert alert-success w-100 text-center mb-0">
            {successMessage}
          </div>
        )}
        <Button variant="secondary" onClick={onHide} disabled={is_loading}>
          <i className="bi bi-x-circle me-2"></i> Close
        </Button>
        <Button
          variant="primary"
          disabled={user_status === tutor.user_status || is_loading}
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
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewTutorModal;