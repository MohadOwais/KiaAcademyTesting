import "./Main.css";
// import { Modal, Button, Card } from 'react-bootstrap'; // Import necessary components from Bootstrap
import * as React from "react";
import moment from "moment";
import {
  Typography,
  CardContent,
  Grid,
  Divider,
  TextField,
} from "@mui/material";
import { IoMdEye } from "react-icons/io";
import {
  authorizationObj,
  baseUrl,
  profilePicture,
} from "@/app/utils/core";
import { capitalizeString } from "@/app/utils/functions";
import axios from "axios";
import { useSelector } from "react-redux";
import Image from "next/image";
import "bootstrap/dist/css/bootstrap.min.css";
import { Alert, Button, Form, Modal, Pagination } from "react-bootstrap";
import { Card } from "@mui/material";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";


export const ViewStudent = ({
  selectedStudent,
  setSelectedStudent,
  getAllStudents,
}: any) => {
  return (
    <>
      {selectedStudent && (
        <div className="overflow-y-auto">
          <Card sx={{ width: "100%", borderRadius: 0, boxShadow: 0 }}>
            <CardContent sx={{ padding: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Image
                    alt={`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                    src={`${selectedStudent?.profile_picture}`}
                    className="w-[55px] h-[55px] border-1 bg-[#ededed]"
                    onError={(e: any) => (e.target.src = profilePicture)}
                    width={35}
                    height={35}
                  />
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                    {`${selectedStudent.first_name} ${selectedStudent.last_name}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedStudent.email}
                  </Typography>
                </Grid>
              </Grid>
              <Divider sx={{ margin: "20px 0" }} />
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Details
              </Typography>
              <Grid container spacing={2} sx={{ marginTop: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    label="Bio"
                    value={selectedStudent.bio || "N/A"}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    multiline
                    sx={{ marginBottom: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    value={
                      selectedStudent?.address
                        ? capitalizeString(selectedStudent?.address)
                        : "N/A"
                    }
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Status"
                    value={
                      capitalizeString(selectedStudent.user_status) || "N/A"
                    }
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Mobile Number"
                    value={selectedStudent.student_mobile_number || "N/A"}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Parents Email"
                    value={selectedStudent.student_parent_email || "N/A"}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Parents Mobile Number"
                    value={selectedStudent.student_parent_mobile || "N/A"}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Date Of Birth"
                    value={
                      selectedStudent.date_of_birth
                        ? moment(selectedStudent.date_of_birth).format(
                            "DD/MM/YYYY"
                          )
                        : "N/A"
                    }
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Created At"
                    value={
                      selectedStudent.created_at
                        ? moment(selectedStudent.created_at).format(
                            "DD/MM/YYYY"
                          )
                        : "N/A"
                    }
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Updated At"
                    value={
                      selectedStudent.updated_at
                        ? moment(selectedStudent.updated_at).format(
                            "DD/MM/YYYY"
                          )
                        : "N/A"
                    }
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                    sx={{ marginBottom: 1 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};
const TTable = ({ data }: any) => {
  const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);

  const [alertData, setAlertdata] = React.useState<any>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
  const [clientErrorMessage, setClientErrorMessage] = React.useState<
    string | null
  >(null);
  const [clientSuccessMessage, setClientSuccessMessage] = React.useState<
    string | null
  >(null);
  const [isViewing, setIsViewing] = React.useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);
  const [rows, setRows] = React.useState<any>([]);
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [itemsPerPage] = React.useState<number>(12);

  // Sorting state
  const [sortConfig, setSortConfig] = React.useState({
    key: "",
    direction: "asc",
  });

  React.useEffect(() => {
    if (data?.length) {
      const formattedData = data.map((item: any) => ({
        id: item?.id,
        student_name: `${item?.first_name} ${item?.last_name}`,
        email: item?.email,
        user_id: item?.user_id,
        course_title: item?.course_title,
        enrollment_date: item?.enrollment_date,
        profile_picture: item?.profile_picture,
      }));
      setRows(formattedData);
    }
  }, [data]);

  const formatString = (str: string) =>
    str
      ?.split("_")
      .map((word) => word.charAt(0)?.toUpperCase() + word.slice(1))
      .join(" ");

  const handleViewStudent = async (student: any) => {
    const studentId = student?.user_id;
    if (!studentId || studentId?.trim() === "") return;
    try {
      const resp = await axios.get(
        `${baseUrl}/users/${studentId}`,
        authorizationObj
      );
      setSelectedStudent(resp?.data?.data);
      setIsViewing(true);
    } catch (error) {
      setIsViewing(false);
    }
  };

  React.useEffect(() => {
    if (rows.length === 0) return;

    const table = $("#courseStudents").DataTable({
      destroy: true,
      paging: true,
      searching: true,
      ordering: true,
      responsive: true,
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

  // Search filter
  const filteredRows = rows.filter(
    (row: any) =>
      row.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      row.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting function
  const sortedRows = React.useMemo(() => {
    let sortedData = [...filteredRows];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedData;
  }, [filteredRows, sortConfig]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRows = sortedRows.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);
  const pageNumbers = [...Array(totalPages)].map((_, index) => index + 1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Dynamically set sidebar state class for responsive width
  const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";

  return (
    <>
      {clientErrorMessage && (
        <Alert variant="danger">{clientErrorMessage}</Alert>
      )}
      {clientSuccessMessage && (
        <Alert variant="success">{clientSuccessMessage}</Alert>
      )}

      {/* Student Modal */}
      <Modal
        show={isViewing}
        onHide={() => setIsViewing(false)}
        size="lg"
        centered
        contentClassName="border-0 p-4"
      >
        <Modal.Body>
          {selectedStudent && (
            <div className="d-flex justify-content-center">
              <div className="w-100">
                <div className="text-center mb-4">
                  <h5 className="fw-bold">Student Details</h5>
                </div>

                <div className="mb-3 d-flex">
                  <div className="fw-semibold me-2 w-25">Name:</div>
                  <div>{`${selectedStudent?.first_name} ${selectedStudent?.last_name}`}</div>
                </div>
                <div className="mb-3 d-flex">
                  <div className="fw-semibold me-2 w-25">Email:</div>
                  <div>{selectedStudent?.email || "N/A"}</div>
                </div>
                <div className="mb-3 d-flex">
                  <div className="fw-semibold me-2 w-25">Bio:</div>
                  <div>{selectedStudent?.bio || "N/A"}</div>
                </div>
                <div className="mb-3 d-flex">
                  <div className="fw-semibold me-2 w-25">Course:</div>
                  <div>{selectedStudent?.course_title || "N/A"}</div>
                </div>

                <div className="text-center mt-4 mb-4">
                  <h5 className="fw-bold">Payment Details</h5>
                </div>

                <div className="mb-3 d-flex">
                  <div className="fw-semibold me-2 w-25">Transaction ID:</div>
                  <div>
                    {selectedStudent?.payment_details?.transaction_id || "N/A"}
                  </div>
                </div>
                <div className="mb-3 d-flex">
                  <div className="fw-semibold me-2 w-25">Amount:</div>
                  <div>{selectedStudent?.payment_details?.amount || "N/A"}</div>
                </div>
                <div className="mb-3 d-flex">
                  <div className="fw-semibold me-2 w-25">Enrollment Date:</div>
                  <div>
                    {selectedStudent?.enrollment_date
                      ? formatString(
                          moment(selectedStudent?.enrollment_date).format(
                            "DD/MM/YYYY"
                          )
                        )
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-end border-0">
          <Button variant="danger" onClick={() => setIsViewing(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Data Table */}
      <div className={`table-cont-sts ${sidebarClass}`}>
        <table
          className="table table-striped table-bordered"
          id="courseStudents"
        >
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Picture</th>
              <th>Student Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Enrollment Date</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((item: any, index: number) => (
                <tr key={item.id || index}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>
                    <Image
                      src={item.profile_picture || profilePicture}
                      alt="profile"
                      className="rounded-circle"
                      width={35}
                      height={35}
                      onError={(e: any) => (e.target.src = profilePicture)}
                    />
                  </td>
                  <td>{item.student_name}</td>
                  <td>{item.email}</td>
                  <td>{item.course_title || "N/A"}</td>
                  <td>
                    {item.enrollment_date
                      ? formatString(
                          moment(item.enrollment_date).format("D MMMM, YYYY")
                        )
                      : "N/A"}
                  </td>

                  <td>
                    <Button
                      className=" btn-view rounded-pill text-white"
                      onClick={() => handleViewStudent(item)}
                    >
                      <IoMdEye style={{ marginRight: "0.5em" }} />
                      View
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TTable;
