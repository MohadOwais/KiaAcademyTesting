"use client";

import "./Main.css";
import "./Table.css";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "bootstrap-icons/font/bootstrap-icons.css";
import moment from "moment";
import axios from "axios";
import { authorizationObj, baseUrl, profilePicture } from "@/app/utils/core";
import { capitalizeString } from "@/app/utils/functions";
import EditBankDetailsModal from "./EditBankDetailsModal";
import ViewTutorModal from "./ViewTutorModal";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

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
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankTutor, setBankTutor] = useState<TutorData | null>(null);
  const [bankDetailsList, setBankDetailsList] = useState<any[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTutor, setViewTutor] = useState<TutorData | null>(null);

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
    // Fetch all bank details once
    const fetchBankDetails = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/bank-details/showAll`,
          authorizationObj
        );
        // console.log("Raw bank details API response:", response.data);
        let list = response?.data;
        // If the API returns an object with a data property, use that
        if (list && !Array.isArray(list) && Array.isArray(list.data)) {
          list = list.data;
        }
        if (!Array.isArray(list)) list = [];
        setBankDetailsList(list);
        // console.log("Processed bankDetailsList:", list);
      } catch (e) {
        setBankDetailsList([]);
        // console.log("Failed to fetch bank details", e);
      }
    };
    fetchBankDetails();
  }, []);

  const handleEditBankDetails = (tutor: TutorData) => {
    setBankTutor(tutor);
    setShowBankModal(true);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      const viewBtn = target.closest('.view-tutor-btn') as HTMLButtonElement | null;
      if (viewBtn && viewBtn.dataset.id) {
        const tutor = data.find((t: any) => t.user_id === viewBtn.dataset.id);
        if (tutor) {
          setViewTutor(tutor);
          setShowViewModal(true);
        }
        return;
      }
      const bankBtn = target.closest('.bank-details-btn') as HTMLButtonElement | null;
      if (bankBtn && bankBtn.dataset.id) {
        const tutor = data.find((t: any) => t.user_id === bankBtn.dataset.id);
        if (tutor) {
          handleEditBankDetails(tutor);
        }
      }
    };
    const table = tableRef.current;
    if (table) table.addEventListener('click', handler);
    return () => {
      if (table) table.removeEventListener('click', handler);
    };
  }, [isDataLoaded, data, bankDetailsList]);

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
              {data.filter((tutor) => tutor.user_status === "active").length >
              0 ? (
                data
                  .filter((tutor) => tutor.user_status === "active")
                  .map((tutor: TutorData, index: number) => {
                    const bank_details = bankDetailsList.find(
                      (b) => b.user_id === tutor.user_id
                    );
                    return (
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
                        <td>
                          {tutor.email}
                          {tutor.user_id}
                        </td>
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

                        <td className="">
                          <button
                            className="btn btn-sm btn-view rounded-pill text-white me-2 view-tutor-btn"
                            data-id={tutor.user_id}
                            type="button"
                          >
                            <i className="bi bi-eye-fill"></i>View
                          </button>
                          {bank_details &&
                          tutor.user_id === bank_details.user_id ? (
                            <button
                              className="btn btn-sm btn-view rounded-pill text-white bank-details-btn"
                              data-id={tutor.user_id}
                              type="button"
                            >
                              <i className="bi bi-bank2"></i> Bank Details
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-secondary rounded-pill text-white"
                              title="No bank details available"
                              disabled
                              style={{
                                opacity: 0.7,
                                cursor: "not-allowed",
                              }}
                            >
                              <i className="bi bi-bank2"></i> Bank Details
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center" }}>
                    No Active Tutors Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <ViewTutorModal
            show={showViewModal}
            onHide={() => setShowViewModal(false)}
            tutor={viewTutor || {}} // fallback to empty object
            getAllTutors={getAllTutors}
            key={viewTutor?.user_id || "empty"} // force remount for fresh state
          />
          <EditBankDetailsModal
            show={showBankModal}
            onHide={() => setShowBankModal(false)}
            tutor={bankTutor}
            onUpdated={getAllTutors}
          />
        </>
      ) : (
        <div className="loading-text">Loading tutors...</div>
      )}
    </div>
  );
};

export default TTable;
