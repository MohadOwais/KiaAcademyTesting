"use client";

import CreateUserForm from "@/app/components/mui/CreateUserForm";
import "./Main.css";
import {
  authorizationObj,
  baseUrl,
  profilePicture,
  profilePicturePath,
} from "@/app/utils/core";
import { capitalizeString } from "@/app/utils/functions";
import { Button, Typography } from "@mui/material";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { useSelector } from "react-redux";
// import { IoMdTrash } from "react-icons/io";
import { MdRemoveRedEye } from "react-icons/md";
import { IoMdEye } from "react-icons/io";
// import { DataGrid } from '@mui/x-data-grid'
import ConfirmAlertMUI from "@/app/components/mui/ConfirmAlertMUI";
import EditUserForm from "@/app/components/mui/EditUserForm";
import Image from "next/image";
// import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap-icons/font/bootstrap-icons.css'
import { Modal } from "react-bootstrap";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

const Main = () => {
  const currentUser = useSelector((state: any) => state?.user);

  const [tutors, set_tutors] = useState([]);
  const [show_user_modal, set_show_user_modal] = useState<boolean>(false);
  const [processed_data, set_processed_data] = useState<any>([]);
  const [alert_data, set_alert_data] = useState<any>(null);
  const [is_alert_open, set_is_alert_open] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState("");
  // const [success_message, set_success_message] = useState("")
  const [single_user, set_single_user] = useState<any>(null);
  const [is_editing, set_is_editing] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });

  // Filtering and sorting
  const filteredData = processed_data?.filter((row: any) =>
    row.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  useEffect(() => {
    get_tutors();
  }, [currentUser]);

  const get_tutors = async () => {
    const instituteId = currentUser?.institute_id;
    if (!instituteId) return;
    try {
      const resp = await axios.get(
        `${baseUrl}/institutions/getUsersByInstitutes/${instituteId}`,
        authorizationObj
      );
      const data = resp?.data;
      const filtered_data = data?.filter((d: any) => d?.role_id === "2");
      set_tutors(filtered_data);
    } catch (error) {
      // console.error(error)
    }
  };

  useEffect(() => {
    if (!tutors?.length) return;
    const data = tutors?.map((d: any, i: number) => {
      return {
        id: i,
        s_no: i + 1,
        user_id: d?.user_id,
        full_name: d?.first_name + " " + d?.last_name,
        profile_picture: `${d?.profile_picture}`,
        user_status: capitalizeString(d?.user_status),
        email: d?.email,
        created_at: moment(d?.created_at).format("DD/MM/YYYY"),
      };
    });
    set_processed_data(data);
  }, [tutors]);
  useEffect(() => {
    if (processed_data.length === 0) return;

    // Destroy existing instance before reinitializing
    const table = $("#tutorTable").DataTable({
      destroy: true,
      paging: true,
      searching: true,
      responsive: true,
      ordering: true,
      info: true,
      pageLength: 10,
      lengthMenu: [10, 20, 30, 40, 50],
      columnDefs: [{ orderable: false, targets: [1, 5] }],
    });

    return () => {
      table.destroy(); // Clean up
    };
  }, [processed_data]);

  const columns = [
    { field: "s_no", headerName: "S. No", width: 75 },
    {
      field: "profile_picture",
      headerName: "Picture",
      width: 80,
      renderCell: (params: any) => (
        <div className="w-full h-full flex justify-center items-center pr-2">
          <Image
            src={params?.row?.profile_picture}
            alt="profile photo"
            width={30}
            height={30}
            onError={(e: any) => (e.target.src = profilePicture)}
            className="w-[30px] h-[30px] rounded-full object-cover object-center"
          />
        </div>
      ),
    },
    { field: "full_name", headerName: "Full Name", flex: 1 },
    { field: "email", headerName: "Email ID", flex: 1 },
    { field: "created_at", headerName: "Created At", flex: 1 },
    { field: "user_status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: any) => (
        <div className="w-full flex justify-center items-center px-2 h-fit">
          {/* <div className='flex justify-start items-center gap-[4px] cursor-pointer h-fit'
                        onClick={() => delete_sub_admin_confirmation(params?.row?.user_id)}
                    >
                        <IoMdTrash style={{ marginTop: "-4px" }} />
                        <p>Delete</p>
                    </div> */}
          <div
            className="flex justify-start items-center gap-[4px] cursor-pointer h-fit"
            onClick={() => view_tutor(params?.row?.user_id)}
          >
            <MdRemoveRedEye style={{ marginTop: "-4px" }} />
            <p>View</p>
          </div>
        </div>
      ),
    },
  ];

  // const delete_tutor_confirmation = (userId: string) => {
  //   if (!userId) return
  //   set_alert_data({
  //     title: "Delete Tutorin?",
  //     description: "Are you sure you want to delete this tutor?. The action cannot be undone",
  //     fun: () => delete_user(userId)
  //   })
  //   set_is_alert_open(true)
  // }

  const delete_user = async (userId: string) => {
    if (!userId) return;
    try {
      set_is_loading(true);
      const resp = await axios.delete(
        `${baseUrl}/users/${userId}`,
        authorizationObj
      );
      set_is_loading(false);
    } catch (error) {
      // console.error(error)
      set_is_loading(false);
      set_error_message("Something went wrong, please try later");
      setTimeout(() => set_error_message(""), 3000);
    }
  };

  const view_tutor = async (userId: string) => {
    if (!userId) return;
    try {
      const resp = await axios.get(
        `${baseUrl}/users/${userId}`,
        authorizationObj
      );
      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        set_error_message(resp?.data?.message);
        setTimeout(() => set_error_message(""), 2500);
        return;
      }
      if (resp?.data?.data) {
        set_single_user(resp?.data?.data);
        set_is_editing(true);
      }
    } catch (error) {
      // console.error(error)
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
        className="mt-4"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditUserForm
            set_is_editing={set_is_editing}
            get_users={get_tutors}
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
        className="mt-4"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Instructor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateUserForm
            set_show_user_modal={set_show_user_modal}
            get_users={get_tutors}
            role_id="2"
          />
        </Modal.Body>
      </Modal>
      <div className="flex flex-col justify-start items-start gap-4 mt-4 flex-1 overflow-x-auto">
        <div className="w-full flex justify-between items-center">
          <h3 className="heading-style">Instructors</h3>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => set_show_user_modal(true)}
            className="ms-auto d-flex btn-view"
          >
            <IoMdAddCircle style={{ marginRight: "0.5em" }} /> Add Instructor
          </Button>
        </div>

        <div className={`table-cont-sts ${sidebarClass}`}>
          <table
            id="tutorTable"
            className="table table-striped table-bordered align-middle"
          >
            <thead className="">
              <tr>
                <th style={{ width: "75px" }}>S. No</th>
                <th style={{ width: "80px" }}>Picture</th>
                <th
                  onClick={() => toggleSort("full_name")}
                  style={{ cursor: "pointer" }}
                >
                  Full Name
                </th>
                <th
                  onClick={() => toggleSort("email")}
                  style={{ cursor: "pointer" }}
                >
                  Email
                </th>
                <th
                  onClick={() => toggleSort("created_at")}
                  style={{ cursor: "pointer" }}
                >
                  Created At
                </th>
                <th
                  onClick={() => toggleSort("user_status")}
                  style={{ cursor: "pointer" }}
                >
                  Status
                </th>
                <th style={{ width: "150px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData?.map((row: any) => (
                <tr key={row?.user_id}>
                  <td>{row?.s_no}</td>
                  <td>
                    <Image
                      src={row?.profile_picture}
                      alt="profile"
                      width={30}
                      height={30}
                      onError={(e: any) => (e.target.src = profilePicture)}
                      className="rounded-circle object-cover"
                    />
                  </td>
                  <td>{row?.full_name}</td>
                  <td>{row?.email}</td>
                  <td>{row?.created_at}</td>
                  <td>{row?.user_status}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-view text-white rounded-pill"
                        onClick={() => view_tutor(row?.user_id)}
                      >
                        <IoMdEye style={{ marginRight: "0.5em" }} />
                        View
                      </button>

                      {/* Optional delete */}
                      {/* <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                onClick={() => delete_tutor_confirmation(row?.user_id)}>
                <IoMdTrash /> Delete
              </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Main;
