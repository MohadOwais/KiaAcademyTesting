"use client";

// import AntdDrawer from '@/app/components/antd/AntdDrawer'
import CreateUserForm from "@/app/components/mui/CreateUserForm";
import { authorizationObj, baseUrl, profilePicture } from "@/app/utils/core";
import { capitalizeString } from "@/app/utils/functions";
import { Button, Typography } from "@mui/material";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { useSelector } from "react-redux";
import { IoMdEye } from "react-icons/io";
// import { MdRemoveRedEye } from "react-icons/md";
import ConfirmAlertMUI from "@/app/components/mui/ConfirmAlertMUI";
import EditUserForm from "@/app/components/mui/EditUserForm";
// import Image from 'next/image'
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap-icons/font/bootstrap-icons.css';
import { Modal } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

const Main = () => {
  const currentUser = useSelector((state: any) => state?.user);

  const [students, set_students] = useState([]);
  const [show_user_modal, set_show_user_modal] = useState(false);
  const [processed_data, set_processed_data] = useState<any>([]);
  const [alert_data, set_alert_data] = useState<any>(null);
  const [is_alert_open, set_is_alert_open] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState("");
  const [single_user, set_single_user] = useState<any>(null);
  const [is_editing, set_is_editing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    get_students();
  }, [currentUser]);

  const get_students: () => Promise<void> = async () => {
    const instituteId = currentUser?.institute_id;
    if (!instituteId) return;
    try {
      const resp = await axios.get(
        `${baseUrl}/institutions/getUsersByInstitutes/${instituteId}`,
        authorizationObj
      );
      console.log("students", resp);
      const filtered_data = resp?.data?.filter((d: any) => d?.role_id === "3");
      set_students(filtered_data);
    } catch (error) {}
  };

  useEffect(() => {
    const data = students.map((d: any, i: number) => ({
      id: i,
      s_no: i + 1,
      user_id: d?.user_id,
      full_name: d?.first_name + " " + d?.last_name,
      email_id: d?.email,
      profile_picture: `${d?.profile_picture}`,
      user_status: d?.user_status,
      created_at: moment(d?.created_at).format("DD/MM/YYYY"),
    }));
    set_processed_data(data);
  }, [students]);
  useEffect(() => {
    if (processed_data.length === 0) return;

    // Destroy existing instance before reinitializing
    const table = $("#studentTable").DataTable({
      destroy: true,
      paging: true,
      searching: true,
      ordering: true,
      responsive: true,
      info: true,
      pageLength: 10,
      lengthMenu: [10, 20, 30, 40, 50],
      columnDefs: [{ orderable: false, targets: [1, 5] }],
    });

    return () => {
      table.destroy(); // Clean up
    };
  }, [processed_data]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig?.key === key && sortConfig.direction === "asc")
      direction = "desc";
    setSortConfig({ key, direction });

    const sortedData = [...processed_data].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    set_processed_data(sortedData);
  };

  const totalPages = Math.ceil(processed_data.length / itemsPerPage);
  const paginatedData = processed_data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const view_student = async (userId: string) => {
    if (!userId) return;
    try {
      const resp = await axios.get(
        `${baseUrl}/users/${userId}`,
        authorizationObj
      );
      if (resp?.data?.status >= 200 && resp?.data?.status < 300) {
        set_single_user(resp?.data?.data);
        set_is_editing(true);
      }
    } catch (error) {
      setTimeout(() => set_error_message(""), 2500);
    }
  };

  const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
  const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";

  return (
    <>
      <ConfirmAlertMUI
        isLoading={is_loading}
        open={is_alert_open}
        setOpen={set_is_alert_open}
        title={alert_data?.title}
        description={alert_data?.description}
        fun={alert_data?.fun}
      />

      <Modal
        show={is_editing}
        onHide={() => set_is_editing(false)}
        backdrop="static"
        size="lg"
        centered
        aria-labelledby="addStudentModalTitle"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditUserForm
            set_is_editing={set_is_editing}
            get_users={get_students}
            data={single_user}
          />
        </Modal.Body>
      </Modal>

      <Modal
        show={show_user_modal}
        onHide={() => set_show_user_modal(false)}
        backdrop="static"
        size="lg"
        centered
        aria-labelledby="addStudentModalTitle"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Student</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateUserForm
            set_show_user_modal={set_show_user_modal}
            get_users={get_students}
            role_id="3"
          />
        </Modal.Body>
      </Modal>

      <div className="flex flex-col justify-start items-start gap-4 mt-4 flex-1 overflow-x-auto">
        <div className="w-full flex justify-between items-center">
          <h3 className="heading-style">Students</h3>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => set_show_user_modal(true)}
            className="ms-auto d-flex btn-view"
          >
            <IoMdAddCircle className="me-2" /> Add Student
          </Button>
        </div>

        <div className={`table-cont-sts ${sidebarClass}`}>
          {/* <div className="mb-3 d-flex">
                        <input
                            type="text"
                            className="form-control w-25 ms-auto"
                            placeholder="Search by full name"
                            onChange={(e) => {
                                const keyword = e.target.value.toLowerCase();
                                const filtered = students.filter((student: any) =>
                                    (student?.first_name + " " + student?.last_name).toLowerCase().includes(keyword)
                                )
                                const data = filtered.map((d: any, i: number) => ({
                                    id: i,
                                    s_no: i + 1,
                                    user_id: d?.user_id,
                                    full_name: d?.first_name + " " + d?.last_name,
                                    email_id: d?.email,
                                    profile_picture: `${d?.profile_picture}`,
                                    user_status:(d?.user_status),
                                    created_at: moment(d?.created_at).format("DD/MM/YYYY"),
                                }))
                                set_processed_data(data)
                            }}
                        />
                    </div> */}

          <table
            id="studentTable"
            className="table table-striped table-bordered align-middle"
          >
            <thead>
              <tr>
                <th>S. No</th>
                <th>Picture</th>
                <th
                  onClick={() => handleSort("full_name")}
                  style={{ cursor: "pointer" }}
                >
                  Full Name{" "}
                  {/* <i className={`bi bi-arrow-${sortConfig?.direction === 'asc' ? 'down' : 'up'}`}></i> */}
                </th>

                <th>Email ID</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row: any) => (
                <tr key={row.id}>
                  <td>{row.s_no}</td>
                  <td>
                    <img
                      src={row.profile_picture}
                      onError={(e: any) => (e.target.src = profilePicture)}
                      className="rounded-circle object-fit-cover"
                      width="30"
                      height="30"
                      alt="profile"
                    />
                  </td>
                  <td>{row.full_name}</td>
                  <td>{row.email_id}</td>
                  <td>{row.created_at}</td>
                  <td>{capitalizeString(row.user_status)}</td>
                  <td>
                    <div
                      className="btn btn-view text-white rounded-pill"
                      onClick={() => view_student(row.user_id)}
                    >
                      <IoMdEye style={{ marginRight: "0.5em" }} />
                      View
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* <nav className="d-flex justify-content-end">
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Previous</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                                    <button className="page-link" onClick={() => handlePageChange(page)}>{page}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Next</button>
                            </li>
                        </ul>
                    </nav> */}
        </div>
      </div>
    </>
  );
};

export default Main;
