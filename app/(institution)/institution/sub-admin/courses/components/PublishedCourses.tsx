"use client";

import "./Main.css";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Image from "next/image";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt"; // Make sure responsive feature is imported
// In _app.js or a global CSS file
import "bootstrap-icons/font/bootstrap-icons.css";

import defaultCourseImage from "../../../../../public/images/banner.jpg";

interface CourseData {
  course_id: string;
  course_thumbnail: string;
  course_title: string;
  instructor_first_name: string;
  instructor_last_name: string;
  [key: string]: any;
}

interface TableProps {
  data: CourseData[];
  getAllCourses: () => Promise<void>;
}

const Table: React.FC<TableProps> = ({ data, getAllCourses }) => {
  const router = useRouter();
  const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
  const tableRef2 = useRef<HTMLTableElement>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (data && data.length > 0) {
      setIsDataLoaded(true);
      // console.log("Loaded data:", data);
    }
  }, [data]);

  useEffect(() => {
    let tableInstance: any;

    if (isDataLoaded && tableRef2.current) {
      if ($.fn.DataTable.isDataTable(tableRef2.current)) {
        $(tableRef2.current).DataTable().destroy();
      }

      tableInstance = $(tableRef2.current).DataTable({
        paging: true,
        searching: true,
        ordering: true,
        responsive: true, // Ensure responsive feature is enabled
      });
    }

    return () => {
      if (tableInstance) {
        tableInstance.destroy();
      }
    };
  }, [isDataLoaded, data]);

  useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.view-course-btn') as HTMLButtonElement | null;
      if (btn && btn.dataset.id) {
        const id = btn.dataset.id;
        const url = `/current-courses/${id}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    };
    const table = tableRef2.current;
    if (table) table.addEventListener('click', handler);
    return () => {
      if (table) table.removeEventListener('click', handler);
    };
  }, [isDataLoaded, data]);

  const getBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      default:
        return "secondary";
    }
  };
    const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";

  return (
    <div
     className={`table-cont-sts ${sidebarClass}`}
    >
      {isDataLoaded ? (
        <table
          ref={tableRef2}
          className="display table table-striped responsive table-hover"
          style={{ width: "100%" }}
        >
          <thead>
            <tr>
              <th>Sr No.</th>
              <th>Photo</th>
              <th>Course Title</th>
              <th>Status</th>
              <th>Instructor Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.filter(course => course.is_published === '1').length > 0 ? (
              data.filter(course => course.is_published === '1').map((course: CourseData, index: number) => (
                <tr key={course.course_id || index}>
                  <td>{index + 1}</td>
                  <td>
                    <Image
                      src={`https://api.kiacademy.in/uploads/courses/image/${course.course_thumbnail}`}
                      alt="course"
                      width={70}
                      height={35}
                      onError={(e: any) => {
                        e.target.src = defaultCourseImage.src;
                      }}
                      style={{ objectFit: "cover" }}
                    />
                  </td>
                  <td>{course.course_title || "N/A"}</td>
                  <td>
                    <span
                      className={`badge rounded-pill p-2 text-white bg-${getBadgeClass(
                        course.course_status || ""
                      )}`}
                      style={{
                        textTransform: "capitalize",
                        width: "80px", // fixed width
                        display: "inline-block",
                        textAlign: "center", // center-align text inside
                      }}
                    >
                      {course.course_status || "N/A"}
                    </span>
                  </td>

                  <td>
                    {(course.instructor_first_name || "") +
                      " " +
                      (course.instructor_last_name || "")}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-view rounded-pill text-white view-course-btn"
                      data-id={course.course_id}
                      type="button"
                    >
                      <i className="bi bi-eye-fill"></i>View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No Courses Available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <div className="loading-text">Loading courses...</div>
      )}
    </div>
  );
};

export default Table;
