'use client';
import "./Main.css";
import * as React from "react";
import Link from "next/link";
import moment from "moment";
import defaultCourseImage from "../../../../../../public/images/banner.jpg"
import { IoMdEye } from "react-icons/io";
import {
    Card, CardContent, Grid, TextField, Typography, Divider,
    Autocomplete, Rating,
    Button,
    FormControlLabel,
    Checkbox,
    Switch
} from "@mui/material";
import { useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import ConfirmAlertMUI from "@/app/components/mui/ConfirmAlertMUI";
import axios from "axios";
import { authorizationObj, baseUrl, course_language_options, courseThumbnailPath, courseVideoPath, lectureVideoPath } from "@/app/utils/core";
import AlertMUI from "@/app/components/mui/AlertMUI";
import 'react-markdown-editor-lite/lib/index.css';
import Markdown from "@/app/components/markdown/Markdown";
import Image from 'next/image'
import $ from 'jquery';
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import CourseDetails from "./CourseDetails";
// import {courses} from "../../Pages/app/courses";
import { log } from "console";
import { useRouter } from 'next/navigation';
import UserWrapper from "@/app/redux/UserWrapper";
import { Form } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';


// import { useNavigate } from 'react-router-dom';



interface CourseData {
    course_id: string;
    course_thumbnail: string;
    course_title: string;
    instructor_first_name: string;
    instructor_last_name: string;
    course_price: number;
    display_currency?: string;
    sr_no: number;
}


const TTable = ({ data, getAllCourses }: any) => {

    const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen)

    const [rows, setRows] = React.useState<CourseData[]>([]);
    const [example_obj, set_example_obj] = React.useState<string[]>([]);
    const [singleCourse, setSingleCourse] = React.useState<any>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
    const router = useRouter(); // Inside component


    React.useEffect(() => {
        if (data?.length) {
            const example_data = Object.keys(data[0]);
            const stringsToRemove = [
                "course_description",
                "course_intro_video",
                "course_price",
                "updated_at",
                "deleted_at",
                "instructor_id",
                "course_category_id",
                "instructor_first_name",
                "instructor_last_name",
                "course_id",
                "display_currency",
                "institute_id",
            ];
            const updatedStrs = example_data.filter(item => !stringsToRemove.includes(item));
            set_example_obj(updatedStrs);
        }
    }, [data]);
    React.useEffect(() => {
        if (rows.length === 0) return;

        const table = $('#courseTable').DataTable({
            destroy: true,
            paging: true,
            searching: true,
            ordering: true,
            info: true,
            pageLength: 10,
            lengthMenu: [10, 20, 30, 40, 50],
            columnDefs: [
                { orderable: false, targets: [1, 4] }, // You can update targets based on actual non-sortable columns
            ],
        });

        return () => {
            table.destroy();
        };
    }, [rows]);


    React.useEffect(() => {
        if (data?.length) {
            const formattedData = data.map((item: any, index: any) => ({
                ...item,
                // instituteName: `${item.instructor_first_name} ${item.instructor_last_name}`,
                sr_no: index + 1,
            }));
            setRows(formattedData);
        }
    }, [data]);

    const handleStatusToggle = async (courseId: string, currentStatus: string) => {
        try {
            setIsLoading(true);

            let response;

            // Determine whether to publish or unpublish based on current status
            if (currentStatus === "1") {
                // Unpublish the course
                response = await axios.post(
                    `${baseUrl}/courses/unpublish/${courseId}`,
                    {},  // You can pass any required payload here (empty object if not needed)
                    authorizationObj
                );
            } else {
                // Publish the course
                response = await axios.post(
                    `${baseUrl}/courses/publish/${courseId}`,
                    {},  // Same as above, pass payload if necessary
                    authorizationObj
                );
            }

            // Check if response is successful
            if (response.status === 200) {
                await getAllCourses(); // Reload courses after update
            } else {
                throw new Error(response.data.message || 'Failed to update course status');
            }
        } catch (error: any) {
            set_error_message(error?.response?.data?.message || error.message || 'Error updating course status');
        } finally {
            setIsLoading(false);
        }
    };


    const formatString = (str: string) => str.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    const handleViewCourse = async (row: any) => {
        const id = row?.course_id;
        if (!id || id.trim() === "") return;

        const url = `/institution/tutor/courses/${id}`;
        router.push(url);
        console.log(`Navigating to: ${url}`);
    };
    const handleViewEdit = async (row: any) => {
        const id = row?.course_id;
        if (!id || id.trim() === "") return;

        const url = `/institution/tutor/courses/${id}/edit`; ///tutor/courses/132/edit
        router.push(url);
        console.log(`Navigating to: ${url}`);
    };



    const fixedColumns = [
        {
            field: "sr_no",
            headerName: "Sr No.",
            width: 70,
        },
        {
            field: "course_thumbnail",
            headerName: "Photo",
            width: 100,
            renderCell: (params: any) => (
                <Image
                    src={`https://api.kiacademy.in/uploads/courses/image/${params?.value}`}
                    alt="course"
                    width={80}
                    height={35}
                    onError={(e: any) => { e.target.src = defaultCourseImage.src; }}
                    style={{ marginTop: "8px", marginBottom: "8px" }}
                />
            ),
        },
        {
            field: "course_title",
            headerName: "Course Title",
            width: 250,
        },
    ];

    const dynamicColumns = [
        ...example_obj
            .filter(item => !fixedColumns.some(col => col.field === item))
            .map(item => ({
                field: item,
                headerName: item === "is_public" ? "Visibility Status" : formatString(item),
                width: 150,
                renderCell: (params: any) => {
                    const value = params.value;
                    if (item === "average_rating") {
                        return params.row.average_rating ? parseFloat(params.row.average_rating).toFixed(1) : "N/A"
                    } else if (item.endsWith("at")) {
                        return value ? moment(value).format("DD/MM/YYYY") : "";
                    }
                    else if (item === "is_public") {
                        return value === "0" ? "Private" : "Public"
                    } else {
                        return <p style={{ textTransform: "capitalize" }
                        } > {value || ""
                            }</p >
                    }
                },
            })),
        {
            field: "actions",
            headerName: "Actions",
            width: 250,
            renderCell: (params: any) => (
                <div className="flex h-full justify-start items-center gap-8">
                    <div style={{ display: "flex", alignItems: "center", height: "100%", cursor: "pointer", marginLeft: 2 }}>
                        <Link href={`/institution/admin/courses/${params?.row?.course_id}`} className="text-decoration-none">
                            <div className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                <IoMdEye className="me-1" />
                                <span>View</span>
                            </div>
                        </Link>
                    </div>
                    <div
                        style={{

                            display: "flex", alignItems: "center", height: "100%",
                            cursor: params?.row?.course_status === "active" ? "not-allowed" : "pointer",
                        }}>
                        <FaTrash style={{ marginRight: "0.5em", fontSize: "0.9em" }} />
                        <Typography
                            onClick={() => deleteCourseConfirmation(params?.row)}
                            sx={{
                                fontSize: "0.9em",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: "4px",
                            }}
                        >
                            Delete Course
                        </Typography>

                    </div>
                </div>
            ),
        }
    ]

    const coursePriceIndex = dynamicColumns.findIndex(column => column.field === "course_price");

    if (coursePriceIndex !== -1) {
        dynamicColumns.splice(coursePriceIndex + 1, 0, {
            field: "currency",
            headerName: "Currency",
            width: 100,
            renderCell: (params: any) => (
                <p style={{ textTransform: "uppercase" }}>{params.row.display_currency || "USD"}</p>
            ),
        });
    }

    const columns = [...fixedColumns, ...dynamicColumns];

    const [isAlertOpen, setIsAlertOpen] = React.useState(false)
    const [alertData, setAlertData] = React.useState<any>(null)
    const [isLoading, setIsLoading] = React.useState(false)
    const [error_message, set_error_message] = React.useState<null | string>(null)
    const [success_message, set_success_message] = React.useState<null | string>(null)

    const deleteCourseConfirmation = (course: any) => {
        if (course?.course_status === "active") return
        if (!course || !course?.course_id || course?.course_id?.trim() === "") return
        setAlertData({
            title: "Delete Course?",
            description: "Are you sure you want to delete this course?. The action cannot be undone",
            fun: () => delete_course(course?.course_id),
        })
        setIsAlertOpen(true)
    }

    const delete_course = async (course_id: any) => {
        if (!course_id || course_id?.trim() === "") return
        try {
            setIsLoading(true)
            const resp = await axios.delete(`${baseUrl}/courses/delete/${course_id}`, authorizationObj)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null)
                }, 3000);
            }
            setIsLoading(false)
            getAllCourses()
            setAlertData(null)
            setIsAlertOpen(false)
            set_success_message("Course deleted successfully")
            setTimeout(() => {
                set_success_message(null)
            }, 3000);
        } catch (error: any) {
            // console.error(error)
            setIsLoading(false)
            setAlertData(null)
            setIsAlertOpen(false)
            set_error_message(error?.response.data.message)
            setTimeout(() => {
                set_error_message(null)
            }, 3000);
        }
    }


    return (
        <>
            {error_message && <AlertMUI status="error" text={error_message} />}
            {success_message && <AlertMUI status="success" text={success_message} />}
            <ConfirmAlertMUI
                open={isAlertOpen}
                setOpen={setIsAlertOpen}
                title={alertData?.title}
                description={alertData?.description}
                fun={alertData?.fun}
                isLoading={isLoading}
            />

        {rows.length === 0 ? (
  <div className="text-center mt-5 p-4  rounded  text-muted shadow-sm">
  <h5 className="mb-2">No Courses Assigned</h5>
  <p className="mb-0">You currently have no courses assigned to you.</p>
</div>

) : (
            <div className=" table-cont-sts" style={{ width: `calc(100vw - ${isDrawerOpen ? "300px" : "120px"})` }}>
                <table id="courseTable" className=" display table table-striped responsive table-hover">
                    <thead>
                        <tr>
                            <th>Sr No.</th>
                            <th>Photo</th>
                            <th>Course Title</th>
                            <th>Created At</th>
                            <th>Course Status</th>
                            <th>Publish</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row: any, index: number) => (
                            <tr key={row.course_id || index}>
                                <td className="text-start">{row.sr_no}</td>
                                <td>
                                    <img
                                        src={`https://api.kiacademy.in/uploads/courses/image/${row.course_thumbnail}`}
                                        alt="course"
                                        width="80"
                                        height="35"
                                        onError={(e: any) => { e.target.src = defaultCourseImage.src }}
                                        style={{ marginTop: "8px", marginBottom: "8px" }}
                                    />
                                </td>
                                <td style={{ textTransform: "capitalize" }}>{row.course_title}</td>
                                <td>{row.created_at ? moment(row.created_at).format("DD/MM/YYYY") : ""}</td>
                                <td>{row.is_public === "0" ? "Private" : "Public"}</td>
                                <td>
                                    <div className="d-flex align-items-center gap-2">
                                        {/* Switch */}
                                        <Form.Check
                                            type="switch"
                                            id={`status-switch-${row.course_id}`}
                                            checked={row.is_published === "1"}
                                            disabled={row.course_status !== "approved"}
                                            onChange={() => {
                                                const newStatus = row.is_published === "1" ? "0" : "1";
                                                // Optimistic UI update
                                                setRows((prevRows) =>
                                                    prevRows.map((r) =>
                                                        r.course_id === row.course_id ? { ...r, is_published: newStatus } : r
                                                    )
                                                );
                                                console.log('handleStatusToggle called with:', row.course_id, row.is_published);
                                                handleStatusToggle(row.course_id, row.is_published); // Pass current status
                                            }}
                                        />

                                        {/* Status Label */}
                                        <span>{row.is_published === "1" ? "Active" : "Inactive"}</span>

                                        {/* Tooltip Icon (only show if not approved) */}
                                        {row.course_status !== "approved" && (
                                            
                                            <span
                                                className="text-secondary"
                                                data-bs-toggle="tooltip"
                                                data-bs-placement="top"
                                                title="This course needs admin approval before publishing."
                                                style={{ cursor: "pointer" }}
                                            >
                                                <i className="bi bi-info-circle"></i>
                                            </span>
                                        )}
                                    </div>

                                </td>
                                <td>
                                    <div className="d-flex justify-content-center gap-2">
                                        <p
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleViewCourse(row)}
                                        >
                                            <i className="bi bi-eye"></i>
                                        </p>
                                        <p
                                            onClick={() => handleViewEdit(row)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            <i className="bi bi-pencil"></i>
                                        </p>
                                        <p
                                            // variant="danger"
                                            // size="sm"
                                            className="btn btn-sm btn-danger"
                                            onClick={() => {
                                                deleteCourseConfirmation(row)

                                            }}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </p>
                                    </div>
                                </td>

                                {/* <td>
                                    <div className="d-flex align-items-center gap-3">
                                        <Link href={`/institution/admin/courses/${row.course_id}`} className="text-decoration-none">
                                            <div className="d-flex align-items-center" style={{ cursor: 'pointer' }}>
                                                <IoMdEye className="me-1" />
                                                <span>View</span>
                                            </div>
                                        </Link>
                                        <div className="text-danger"
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                cursor: row?.course_status === "active" ? "not-allowed" : "pointer",
                                            }}
                                            onClick={() => {
                                                if (row?.course_status !== "active") {
                                                    const confirmed = window.confirm("Are you sure you want to delete?");
                                                    if (confirmed) {
                                                        deleteCourseConfirmation(row);
                                                    }
                                                }
                                            }}
                                        >
                                            <FaTrash className="me-1 text-danger" />
                                            <span style={{ fontSize: "0.9em" }}>Delete</span>
                                        </div>
                                    </div>
                                </td> */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
)}

            {/* </div> */}
        </>
    );
};

export default TTable;
