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
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "bootstrap-icons/font/bootstrap-icons.css";
// import "bootstrap/dist/js/bootstrap.bundle.min.js";
import moment from "moment";
import axios from "axios";
import { authorizationObj, baseUrl, profilePicture } from "@/app/utils/core";
import { capitalizeString } from "@/app/utils/functions";
import { FilePreview } from "@/app/(web)/profile/Docs";
import { Modal } from "bootstrap";
interface InstituteData {
institute_id: string;
name: string;
email: string;
profile_image?: string;
status?: string;
address?: string;
contact_number?: string;
registration_number?: string;
tin_number?: string;
supporting_document?: string;
created_at?: string;
updated_at?: string;
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

const ViewInstitute = ({
selectedInstitute,
getAllInstitutions,
setSelectedInstitute,
}: any) => {
const [user_status, set_user_status] = useState(selectedInstitute?.status);
const [is_loading, set_is_loading] = useState(false);

// Update local state when selectedInstitute changes
useEffect(() => {
set_user_status(selectedInstitute?.status);
}, [selectedInstitute]);

const user_statuses = [
{ label: "Active", value: "active" },
{ label: "Pending", value: "pending" },
{ label: "Suspended", value: "suspended" },
{ label: "Rejected", value: "rejected" },
];

const update_institute = async () => {
if (!selectedInstitute?.institute_id) return;

try {
set_is_loading(true);

const formData = new FormData();
formData.append("status", user_status);

const resp = await axios.post(
`${baseUrl}/institutions/update/${selectedInstitute?.institute_id}`,
formData,
authorizationObj
);

// Update the selected institute's status
setSelectedInstitute((prev: InstituteData) => ({
...prev,
status: user_status,
}));

// Refresh the institutions list
await getAllInstitutions();

// Close the modal
const modalElement = document.getElementById("viewInstituteModal");
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
<div className="modal fade institution-modal" id="viewInstituteModal" tabIndex={-1}
  aria-labelledby="viewInstituteModalLabel" aria-hidden="true">
  <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-fullscreen-sm-down modal-lg">
    <div className="modal-content">
      <div className="modal-header bg-primary text-white">
        <h5 className="modal-title" id="viewInstituteModalLabel">
          <i className="bi bi-building me-2"></i>
          Institution Details
        </h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div className="modal-body">
        <div className="row align-items-center mb-4">
          <div className="d-flex flex-column flex-sm-row align-items-center gap-3">
            <div className="position-relative">
              <Image
                alt={selectedInstitute.name}
                src={selectedInstitute.profile_image ? `${baseUrl}/${selectedInstitute.profile_image}` : profilePicture}
                width={80}
                height={80}
                className="rounded-circle border border-3 border-primary"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = profilePicture;
                  target.onerror = null;
                }}
              />
              <span className={`position-absolute bottom-0 end-0 badge rounded-pill bg-${getStatusColor(user_status)}`}>
                {user_status ? capitalizeString(user_status) : "N/A"}
              </span>
            </div>

            <div className="flex-grow-1">
              <h5 className="mb-1">{selectedInstitute.name}</h5>
              <p className="text-muted mb-1">
                <i className="bi bi-envelope me-2"></i>{selectedInstitute.email}
              </p>
              {selectedInstitute.contact_number && (
                <p className="text-muted mb-0">
                  <i className="bi bi-telephone me-2"></i>{selectedInstitute.contact_number}
                </p>
              )}
            </div>

            <div className="w-100 w-sm-50">
              <label className="form-label fw-bold">Status</label>
              <select className="form-select" value={user_status} onChange={(e) => set_user_status(e.target.value)}>
                {user_statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Institution Info */}
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title fw-bold mb-3">
              <i className="bi bi-building me-2"></i>Institution Information
            </h6>
            <div>
              <label className="form-label fw-bold">Address</label>
              <p className="text-break mb-0">{selectedInstitute.address || "N/A"}</p>
            </div>
          </div>
        </div>

        {/* Registration Info */}
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title fw-bold mb-3">
              <i className="bi bi-file-text me-2"></i>Registration Information
            </h6>
            <div className="row">
              <div className="col-sm-6 mb-2">
                <label className="form-label fw-bold">Registration Number</label>
                <p className="text-break mb-0">{selectedInstitute.registration_number || "N/A"}</p>
              </div>
              <div className="col-sm-6 mb-2">
                <label className="form-label fw-bold">TIN Number</label>
                <p className="text-break mb-0">{selectedInstitute.tin_number || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title fw-bold mb-3">
              <i className="bi bi-calendar me-2"></i>Timeline
            </h6>
            <div className="row">
              <div className="col-sm-6 mb-2">
                <label className="form-label fw-bold">Registered On</label>
                <p className="mb-0">
                  {selectedInstitute.created_at
                    ? moment(selectedInstitute.created_at).format("MMMM D, YYYY")
                    : "N/A"}
                </p>
              </div>
              <div className="col-sm-6 mb-2">
                <label className="form-label fw-bold">Updated At</label>
                <p className="mb-0">
                  {selectedInstitute.updated_at
                    ? moment(selectedInstitute.updated_at).format("MMMM D, YYYY")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Supporting Document */}
        <div className="card mb-3">
          <div className="card-body">
            <h6 className="card-title fw-bold mb-3">
              <i className="bi bi-file-earmark me-2"></i>Supporting Document
            </h6>
            {selectedInstitute?.supporting_document ? (
              <FilePreview
                fileName={selectedInstitute.supporting_document}
                label="No Supporting Document Available"
              />
            ) : (
              <p className="text-muted mb-0">No Supporting Document Available</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
          <i className="bi bi-x-circle me-2"></i> Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={user_status === selectedInstitute.status || is_loading}
          onClick={update_institute}
        >
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

);
};

const TTable = ({
data,
getAllInstitutions,
}: {
data: InstituteData[];
getAllInstitutions: () => void;
}) => {
const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
const tableRef = useRef<HTMLTableElement>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [selectedInstitute, setSelectedInstitute] =
    useState<InstituteData | null>(null);

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
            const handler = async (event: any) => {
                const btn = event.target.closest(".view-btn");
                if (!btn) return;
        
                const id = btn.getAttribute("data-id");
                const selected = data.find((d) => d.institute_id === id);
                if (selected) await handleViewInstitute(selected);
            };
        
            const tableEl = tableRef.current;
            if (tableEl) {
                tableEl.addEventListener("click", handler);
            }
        
            return () => {
                if (tableEl) tableEl.removeEventListener("click", handler);
            };
        }, [data]);
        

        const handleViewInstitute = async (row: InstituteData) => {
        const instituteId = row?.institute_id;
        if (!instituteId) {
        console.error("No institute ID provided");
        return;
        }

        try {
        const resp = await axios.get(`${baseUrl}/institutions/${instituteId}`, {
        headers: {
        ...authorizationObj.headers,
        "Content-Type": "application/json",
        },
        });

        if (resp?.data) {
        // Transform the response data to match our InstituteData interface
        const transformedData: InstituteData = {
        institute_id: resp.data.id || instituteId,
        name: resp.data.name || row.name,
        email: resp.data.email || row.email,
        profile_image: resp.data.profile_image || row.profile_image,
        status: row.status, // Keep the existing status
        address: resp.data.address || row.address,
        contact_number: resp.data.contact_number || row.contact_number,
        registration_number:
        resp.data.registration_number || row.registration_number,
        tin_number: resp.data.tin_number || row.tin_number,
        supporting_document:
        resp.data.supporting_document || row.supporting_document,
        created_at: resp.data.created_at || row.created_at,
        updated_at: resp.data.updated_at || row.updated_at,
        };

        setSelectedInstitute(transformedData);

        // Delay modal showing until after DOM update
        setTimeout(() => {
        const modalEl = document.getElementById("viewInstituteModal");
        if (modalEl) {
        // @ts-ignore
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        } else {
        console.error("Modal element not found");
        }
        }, 100); // Adjust delay if needed
        } else {
        // If no data is returned, use the existing row data
        setSelectedInstitute(row);
        // @ts-ignore
        new bootstrap.Modal(document.getElementById("viewInstituteModal")
        ).show();
        }
        } catch (error: any) {
        console.error("Error fetching institute details:", error);
        if (error.response) {
        console.error("Error response status:", error.response.status);
        console.error("Error response data:", error.response.data);
        }
        // If there's an error, still show the modal with existing data
        setSelectedInstitute(row);
        setTimeout(() => {
        const modalEl = document.getElementById("viewInstituteModal");
        if (modalEl) {
        // @ts-ignore
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
        } else {
        console.error("Modal element not found");
        }
        }, 100);
        }
        };

        return (
        <div className="table-cont-sts" style={{ width: `calc(100vw - ${isDrawerOpen ? "300px" : "120px"})` }}>
            {isDataLoaded ? (
            <>
                <table ref={tableRef} className="display table table-striped responsive table-hover"
                    style={{ width: "100%" }}>
                    <thead>
                        <tr>
                            <th>Sr No.</th>
                            <th>Photo</th>
                            <th>Institute Name</th>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length > 0 ? (
                        data
                        .filter((institute) => institute.status === "active")
                        .map((institute: InstituteData, index: number) => (
                        <tr key={institute.institute_id || index}>
                            <td>{index + 1}</td>
                            <td>
                                <div className="d-flex align-items-center">
                                    <Image src={ institute.profile_image ? `${baseUrl}/${institute.profile_image}` :
                                        profilePicture } alt={institute.name} width={35} height={35}
                                        className="rounded-circle" onError={( e: React.SyntheticEvent<HTMLImageElement>
                                        ) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = profilePicture;
                                        target.onerror = null;
                                        }}
                                        />
                                </div>
                            </td>
                            <td>{institute.name}</td>
                            <td>{institute.email}</td>
                            <td>
                                {institute.institute_type
                                ? institute.institute_type.charAt(0).toUpperCase() +
                                institute.institute_type.slice(1)
                                : "N/W"}
                            </td>

                            <td>
                                {institute.contact_number
                                ? `${institute.country_code || ""} ${
                                institute.contact_number
                                }`
                                : "N/A"}
                            </td>

                            <td>
                                <span className={`badge rounded-pill text-white p-2 bg-${getStatusColor(
                                    institute.status || "" )}`} style={{
                            width: "80px",
                            display: "inline-block",
                            textAlign: "center",
                            textTransform: "capitalize",
                          }}>
                                    {institute.status
                                    ? capitalizeString(institute.status)
                                    : "N/A"}
                                </span>
                            </td>

                            <td>
                                {institute.created_at
                                ? moment(institute.created_at).format("MMMM D, YYYY")
                                : "N/A"}
                            </td>
                            <td>
                                <button className="btn btn-sm btn-view rounded-pill text-white view-btn"
                                    data-id={institute.institute_id}>
                                    <i className="bi bi-eye-fill"></i>View
                                </button>
                            </td>
                        </tr>
                        ))
                        ) : (
                        <tr>
                            <td colSpan={8} style={{ textAlign: "center" }}>
                                No Institutions Available
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
                {selectedInstitute && (
                <ViewInstitute selectedInstitute={selectedInstitute} setSelectedInstitute={setSelectedInstitute}
                    getAllInstitutions={getAllInstitutions} />
                )}
            </>
            ) : (
            <div className="loading-text">Loading institutions...</div>
            )}
        </div>
        );
        };

        export default TTable;