"use client";

import {
  authorizationObj,
  baseUrl,
  courseThumbnailPath,
} from "@/app/utils/core";
import axios from "axios";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { MdRemoveRedEye } from "react-icons/md";
import AssignCourseForm from "@/app/components/mui/AssignCourseForm"; 
import Image from "next/image";
// import $ from "jquery";
// import "datatables.net-bs5";
// import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import { Modal } from "react-bootstrap";
import { IoMdEye } from "react-icons/io";


const Main = () => {
  const currentUser = useSelector((state: any) => state?.user);
  const [courses, set_courses] = useState([]);
  const [is_loading, set_is_loading] = useState(false);
  const [data, set_data] = useState([]);
  const [all_tutors, set_all_tutors] = useState([]);
  const [assigned_tutors, set_assigned_tutors] = useState([]);
  const [is_viewing, set_is_viewing] = useState(false);
  const [courseId, set_courseId] = useState("");
  // const [course_status, set_course_status] = useState("");
  // const [course_created, set_course_created] = useState("");

  // Inside the Main component
  const tableRef = useRef(null);

  useEffect(() => {
    get_courses();
  }, [currentUser]);

  const get_courses = async () => {
    if (!currentUser?.institute_id) return;
    try {
      set_is_loading(true);
      const resp = await axios.get(
        `${baseUrl}/courses/by-institute/${currentUser?.institute_id}`,
        authorizationObj
      );
      set_is_loading(false);
      // console.log(resp?.data?.data);
      set_courses(resp?.data?.data);
    } catch (error) {
      // console.error(error);
      set_is_loading(false);
    }
  };

  useEffect(() => {
    if (data?.length === 0) return;

    const table = $("#courseTable").DataTable({
      destroy: true,
      paging: true,
      searching: true,
      ordering: true,
      responsive: true,
      info: true,
      pageLength: 10,
      lengthMenu: [10, 20, 30, 40, 50],
      columnDefs: [
        { orderable: false, targets: [1, 4] }, // Disable ordering for thumbnail and actions
      ],
    });

    return () => {
      table.destroy();
    };
  }, [data]);

  const handleViewClick = async (courseId: string) => {
    const instituteId = currentUser?.institute_id;
    if (!courseId || !instituteId) return;
    set_courseId(courseId);
    try {
      set_is_loading(true);
      const all_tutors_resp: any = await axios.get(
        `${baseUrl}/institutions/getUsersByInstitutes/${instituteId}`,
        authorizationObj
      );
      const _all_tutors = all_tutors_resp?.data?.filter(
        (at: any) => at?.role_id === "2"
      );
      set_all_tutors(_all_tutors);
      const assigned_tutors_resp: any = await axios.get(
        `${baseUrl}/courses/get-instructors-assigned-to-course/${instituteId}/${courseId}`,
        authorizationObj
      );
      set_assigned_tutors(assigned_tutors_resp?.data?.data);
      set_is_loading(false);
      set_is_viewing(true);
    } catch (error) {
      // console.error(error)
      set_is_loading(false);
    }
  };

  useEffect(() => {
    const processed_data: any = courses?.map((c: any, i: number) => {
      return {
        id: i,
        s_no: i + 1,
        course_title: c?.course_title,
        course_thumbnail: `${courseThumbnailPath}/${c?.course_thumbnail}`,
        course_language: c?.course_language,
        course_id: c?.course_id,
        course_created: c?.created_at
          ? moment(c?.created_at).format("MMMM D, YYYY")
          : "",
        course_status: c?.course_status,
      };
    });
    set_data(processed_data);
  }, [courses]);

  const columns = [
    { field: "s_no", headerName: "S. No", width: 75 },
    {
      field: "course_thumbnail",
      headerName: "Thumbnail",
      width: 80,
      renderCell: (params: any) => (
        <div className="w-full h-full fex justify-center items-center">
          <Image
            src={params?.row?.course_thumbnail}
            alt="thumbnail"
            width={60}
            height={40}
            className="w-[60px] h-[40px] object-cover object-center mt-[5px]"
          />
        </div>
      ),
    },
    { field: "course_title", headerName: "Title", flex: 1 },
    { field: "course_language", headerName: "Language", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params: any) => (
        <div
          className="w-full flex justify-center items-center cursor-pointer"
          onClick={() => handleViewClick(params?.row?.course_id)}
        >
          <MdRemoveRedEye
            style={{
              marginRight: "0.5em",
              fontSize: "1.2em",
              marginTop: "-2px",
            }}
          />
          View
        </div>
      ),
    },
  ];

  const assign_course = async (tutorId: string) => {
    const course_id = courseId;
    const institute_id = currentUser?.institute_id;
    const assigned_to = tutorId;
    const assigned_by = currentUser?.user_id;
    if (!course_id || !institute_id || !assigned_to || !assigned_by) return;

    const formData = new FormData();
    formData.append("course_id", course_id);
    formData.append("institute_id", institute_id);
    formData.append("assigned_to", assigned_to);
    formData.append("assigned_by", assigned_by);

    try {
      set_is_loading(true);
      const resp = await axios.post(
        `${baseUrl}/courses/assign-course`,
        formData,
        authorizationObj
      );
      handleViewClick(course_id);
      set_is_loading(true);
    } catch (error) {
      // console.error(error)
    }
  };

  const unAssign_course = async (tutorId: string) => {
    const course_id = courseId;
    const institute_id = currentUser?.institute_id;
    const assigned_to = tutorId;
    if (!course_id || !institute_id || !assigned_to) return;

    const formData = new FormData();
    formData.append("course_id", course_id);
    formData.append("institute_id", institute_id);
    formData.append("assigned_to", assigned_to);

    try {
      set_is_loading(true);
      const resp = await axios.post(
        `${baseUrl}/courses/unassign-course`,
        formData,
        authorizationObj
      );
      handleViewClick(course_id);
      set_is_loading(true);
    } catch (error) {
      // console.error(error)
    }
  };
    const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
  
  const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";

  return (
    <>
      <Modal
        show={is_viewing}
        onHide={() => set_is_viewing(false)}
        size="lg"
        className="w-full h-full flex justify-start items-start"
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-5">Assign Course to Tutor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <small>You can assign course to multiple tutors</small>

          <AssignCourseForm
            all_tutors={all_tutors}
            assigned_tutors={assigned_tutors}
            assign_course={assign_course}
            unAssign_course={unAssign_course}
          />
        </Modal.Body>
      </Modal>

      <div className="flex flex-col justify-start items-start gap-4 mt-4 flex-1 overflow-x-auto">
        <div className="w-full flex justify-between items-center">
          <h3 className="heading-style">
            Assign Course
          </h3>
        </div>
          <div className={`table-cont-sts ${sidebarClass}`}>
            <table
              id="courseTable"
              className="table table-striped table-bordered"
            >
              <thead>
                <tr>
                  <th>S. No</th> 
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Language</th>
                  <th>Course Status</th>
                  <th>Course Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.map((row: any) => (
                  <tr key={row.id}>
                    <td>{row.s_no}</td>
                    <td>
                      <img
                        src={row.course_thumbnail}
                        alt="thumbnail"
                        width={60}
                        height={40}
                        style={{ objectFit: "cover", objectPosition: "center" }}
                      />
                    </td>
                    <td>{row.course_title}</td>
                    <td>{row.course_language}</td>
                    <td>{row.course_status}</td>
                    <td>{row.course_created}</td>
                    <td>
                      <div
                        className="btn btn-view text-white rounded-pill"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleViewClick(row.course_id)}
                      >
                        <IoMdEye style={{ marginRight: "0.5em" }} />
                                              View
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
