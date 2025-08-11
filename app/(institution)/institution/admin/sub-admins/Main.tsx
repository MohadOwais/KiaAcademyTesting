"use client";

// import AntdDrawer from '@/app/components/antd/AntdDrawer'
import CreateUserForm from "@/app/components/mui/CreateUserForm";
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
import ConfirmAlertMUI from "@/app/components/mui/ConfirmAlertMUI";
import EditUserForm from "@/app/components/mui/EditUserForm";
// import Image from 'next/image'
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import { Modal } from "react-bootstrap";
import { IoMdEye } from "react-icons/io";

const Main = () => {
  const currentUser = useSelector((state: any) => state?.user);

  const [sub_admins, set_sub_admins] = useState([]);
  const [show_user_modal, set_show_user_modal] = useState<boolean>(false);
  const [processed_data, set_processed_data] = useState<any>([]);
  const [alert_data, set_alert_data] = useState<any>(null);
  const [is_alert_open, set_is_alert_open] = useState(false);
  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState("");
  const [success_message, set_success_message] = useState("");
  const [single_user, set_single_user] = useState<any>(null);
  const [is_editing, set_is_editing] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    get_sub_admins();
  }, [currentUser]);

  const get_sub_admins = async () => {
    const instituteId = currentUser?.institute_id;
    if (!instituteId) return;
    try {
      const resp = await axios.get(
        `${baseUrl}/institutions/getUsersByInstitutes/${instituteId}`,
        authorizationObj
      );
      const data = resp?.data;
      const filtered_data = data?.filter((d: any) => d?.role_id === "5");
      set_sub_admins(filtered_data);
    } catch (error) {
      // console.error(error)
    }
  };

  useEffect(() => {
    if (!sub_admins?.length) return;
    const data = sub_admins?.map((d: any, i: number) => {
      return {
        id: i,
        s_no: i + 1,
        user_id: d?.user_id,
        full_name: d?.first_name + " " + d?.last_name,
        profile_picture: `${d?.profile_picture}`,
        user_status: capitalizeString(d?.user_status),
        created_at: moment(d?.created_at).format("DD/MM/YYYY"),
      };
    });
    set_processed_data(data);
  }, [sub_admins]);
  useEffect(() => {
    if (processed_data.length === 0) return;

    // Destroy existing instance before reinitializing
    const table = $("#studentTable").DataTable({
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
      table.destroy(); // Clean up on unmount
    };
  }, [processed_data]);

  const view_sub_admin = async (userId: string) => {
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

  const filteredData = processed_data.filter((row: any) =>
    row.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const paginateData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

      {/* <AntdDrawer
                open={is_editing}
                setOpen={set_is_editing}
                title="Edit Sub Admin"
                placement="right"
            >
                <EditUserForm set_is_editing={set_is_editing} get_users={get_sub_admins} data={single_user} />
            </AntdDrawer>

            <AntdDrawer
                open={show_user_modal}
                setOpen={set_show_user_modal}
                title="Add Sub Admin"
                placement="right"
            >
                <CreateUserForm set_show_user_modal={set_show_user_modal} get_users={get_sub_admins} role_id="5" />
            </AntdDrawer> */}
      <Modal
        show={is_editing}
        onHide={() => set_is_editing(false)}
        backdrop="static"
        size="lg"
        centered
        aria-labelledby="addStudentModalTitle"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Sub Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <EditUserForm
            set_is_editing={set_is_editing}
            get_users={get_sub_admins}
            data={single_user}
          />
        </Modal.Body>
      </Modal>

      <Modal
        show={show_user_modal}
        onHide={() => {
          console.log("Closing Add Sub Admin Modal");
          set_show_user_modal(false);
        }}
        backdrop="static"
        size="lg"
        centered
        aria-labelledby="addStudentModalTitle"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Sub Admin</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CreateUserForm
            set_show_user_modal={set_show_user_modal}
            get_users={get_sub_admins}
            role_id="5"
          />
        </Modal.Body>
      </Modal>

      <div className="flex flex-col justify-start items-start gap-4 mt-4 flex-1 overflow-x-auto">
        <div className="w-full flex justify-between items-center">
          <h3 className="heading-style">
            Sub Admins
          </h3>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              console.log("Opening Add Sub Admin Modal");
              set_show_user_modal(true);
            }}
            className="ms-auto d-flex btn-view text-white rounded-pill"
          >
            <IoMdAddCircle style={{ marginRight: "0.5em" }} /> Add Sub Admin
          </Button>
        </div>

        <div className={`table-cont-sts ${sidebarClass}`}>
          <table
            id="studentTable"
            className="table table-bordered table-striped"
          >
            <thead>
              <tr>
                <th>S. No</th>
                <th>Picture</th>
                <th>Full Name</th>
                <th>Created At</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {processed_data.map((row: any, index: number) => (
                <tr key={row.id || index}>
                  <td>{row.s_no}</td>
                  <td>
                    <img
                      src={row.profile_picture}
                      alt="Profile"
                      className="rounded-circle"
                      style={{ width: "30px", height: "30px" }}
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) =>
                        (e.currentTarget.src = profilePicture)
                      }
                    />
                  </td>
                  <td>{row.full_name}</td>
                  <td>{row.created_at}</td>
                  <td>{row.user_status}</td>
                  <td>
                    <button
                      className="btn btn-view text-white rounded-pill view-sub-admin-btn"
                      onClick={() => view_sub_admin(row.user_id)}
                    >
                   <IoMdEye style={{ marginRight: "0.5em" }} />
                                                                View
                    </button>
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
