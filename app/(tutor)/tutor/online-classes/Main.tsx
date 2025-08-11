"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import { useSelector } from "react-redux";
import { Button, Table, Pagination, Form, Alert, Spinner, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import CreateCourseModal from "./CreateCourseModal";
import Link from "next/link";

interface Course {
  course_id: string;
  course_title: string;
  course_description: string;
  course_price: string;
  course_status: string;
  course_level: string;
  is_published: string;
}

interface filters {
  global: string;
  level: string;
  status: string;
}

const Main = () => {
  const [isClient, setIsClient] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [filters, setFilters] = useState<filters>({ global: "", level: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: "course_title", direction: "asc" });
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentUser = useSelector((state: any) => state.user);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getAllCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const resp = await axios.get(`${baseUrl}/live-courses/live-courses-by-instructor/${currentUser?.user_id}`, authorizationObj);
      if (resp?.data?.status === 200) {
        setCourses(resp.data.data);
      } else {
        throw new Error(resp?.data?.message || "Failed to fetch courses");
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || "Failed to fetch courses");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && currentUser?.user_id) {
      getAllCourses();
    }
  }, [isClient, currentUser?.user_id]);

  const requestSort = (key: string) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.course_title.toLowerCase().includes(filters.global.toLowerCase()) ||
      course.course_description.toLowerCase().includes(filters.global.toLowerCase());
    const matchesLevel = !filters.level || course.course_level.toLowerCase() === filters.level.toLowerCase();
    const matchesStatus = !filters.status || course.is_published === filters.status;
    return matchesSearch && matchesLevel && matchesStatus;
  }).sort((a: any, b: any) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastCourse = currentPage * rowsPerPage;
  const indexOfFirstCourse = indexOfLastCourse - rowsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowModal(true);
  };

  const handleCreateCourse = async (formData: FormData) => {
    try {
      let response;
      if (editingCourse) {
        response = await axios.post(`${baseUrl}/courses/update/${editingCourse.course_id}`, formData, authorizationObj);
      } else {
        response = await axios.post(`${baseUrl}/courses/create`, formData, authorizationObj);
      }
      
      if (response.data.status === 200) {
        await getAllCourses();
        setShowModal(false);
        setEditingCourse(null);
      } else {
        setError(response.data.message || 'Failed to save course');
      }
    } catch (error: any) {
      setError(error.message || 'Error saving course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    try {
      setIsLoading(true);
      const response = await axios.delete(`${baseUrl}/courses/delete/${courseId}`, authorizationObj);
      if (response.data.status === 200) {
        await getAllCourses();
        setShowDeleteConfirm(false);
        setSelectedCourse(null);
      } else {
        throw new Error(response.data.message || 'Failed to delete course');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Error deleting course');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = async (courseId: string, currentStatus: string) => {
    try {
      setIsLoading(true);
      const newStatus = currentStatus === "1" ? "0" : "1";
      const response = await axios.patch(
        `${baseUrl}/courses/${courseId}/status`,
        { status: newStatus },
        authorizationObj
      );
      if (response.data.status === 200) {
        await getAllCourses();
      } else {
        throw new Error(response.data.message || 'Failed to update course status');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Error updating course status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h3 className="heading-style fw-bold mb-0">Online Courses</h3>
            <Button
             className="btn-view rounded-pill"
              onClick={() => setShowModal(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Creating...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Live Course
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <div className="row mb-4">
        <div className="col-md-4">
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Search courses..."
              name="global"
              value={filters.global}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(e)}
            />
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group>
            <Form.Select
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Form.Select>
          </Form.Group>
        </div>
        <div className="col-md-4">
          <Form.Group>
            <Form.Select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </Form.Select>
          </Form.Group>
        </div>
      </div>

      <CreateCourseModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCourse(null);
        }}
        onCreate={handleCreateCourse}
      />

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th onClick={() => requestSort("course_title")} style={{ cursor: 'pointer' }}>
                Course Title {sortConfig.key === "course_title" && (
                  <i className={`bi bi-arrow-${sortConfig.direction === "asc" ? "up" : "down"}`}></i>
                )}
              </th>
              <th onClick={() => requestSort("course_level")} style={{ cursor: 'pointer' }}>
                Level {sortConfig.key === "course_level" && (
                  <i className={`bi bi-arrow-${sortConfig.direction === "asc" ? "up" : "down"}`}></i>
                )}
              </th>
              <th onClick={() => requestSort("course_price")} style={{ cursor: 'pointer' }}>
                Price {sortConfig.key === "course_price" && (
                  <i className={`bi bi-arrow-${sortConfig.direction === "asc" ? "up" : "down"}`}></i>
                )}
              </th>
              <th onClick={() => requestSort("course_status")} style={{ cursor: 'pointer' }}>
                Status {sortConfig.key === "course_status" && (
                  <i className={`bi bi-arrow-${sortConfig.direction === "asc" ? "up" : "down"}`}></i>
                )}
              </th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </td>
              </tr>
            ) : currentCourses.length > 0 ? (
              currentCourses.map((course) => (
                <tr key={course.course_id}>
                  <td>
                    <Link href={`/tutor/online-classes/${course.course_id}`} className="text-decoration-none">
                      {course.course_title}
                    </Link>
                  </td>
                  <td className="text-capitalize">{course.course_level}</td>
                  <td>${course.course_price}</td>
                  <td>
                    <Form.Check
                      type="switch"
                      id={`status-switch-${course.course_id}`}
                      checked={course.is_published === "1"}
                      onChange={() => handleStatusToggle(course.course_id, course.is_published)}
                      label={course.is_published === "1" ? "Active" : "Inactive"}
                    />
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                         <Link
                        href={`/tutor/online-classes/${course.course_id}`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="bi bi-eye"></i>
                      </Link>
                      <Link
                        href={`/tutor/online-classes/${course.course_id}/edit`}
                        className="btn btn-sm btn-primary"
                      >
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {filteredCourses.length > rowsPerPage && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.Prev
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
            {Array.from({ length: Math.ceil(filteredCourses.length / rowsPerPage) }).map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              onClick={() => currentPage < Math.ceil(filteredCourses.length / rowsPerPage) && handlePageChange(currentPage + 1)}
              disabled={currentPage === Math.ceil(filteredCourses.length / rowsPerPage)}
            />
          </Pagination>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the course "{selectedCourse?.course_title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => selectedCourse && handleDeleteCourse(selectedCourse.course_id)}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Main;
