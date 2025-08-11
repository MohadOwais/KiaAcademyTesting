"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { authorizationObj, baseUrl, courseVideoPath, courseThumbnailPath } from '@/app/utils/core';
import { Alert, Button, Card, Container, Row, Col, Spinner, Modal } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface Category {
  category_id: string;
  category_name: string;
}

interface Price {
  tier_price: string;
  currency: string;
}

interface Course {
  course_id: string;
  course_title: string;
  course_description: string;
  instructor_id: string;
  course_category_id: string;
  course_language: string;
  currency: string;
  display_currency: string;
  course_price: string | null;
  course_level: string;
  course_thumbnail: string;
  course_intro_video?: string;
  course_status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  start_date: string;
  end_date: string;
  class_timing: string;
}

const CourseDetails = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [price, setPrice] = useState<Price | null>(null);
  const currentUser = useSelector((state: any) => state.user);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${baseUrl}/courses/${courseId}`, authorizationObj);

        if (response.data.status === 200) {
          setCourse(response.data.data[0]); // Set the course state as an object
        } else {
          throw new Error(response.data.message || 'Failed to fetch course details');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || error.message || 'Error fetching course details');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategory = async () => {
      if (course?.course_category_id) {
        const response = await axios.get(
          `${baseUrl}/course-categories/${course.course_category_id}`,
          authorizationObj
        );
        setCategory(response.data.data);
      }
    };
    const fetchPrice = async () => {
      if (course?.course_category_id) {
        const response = await axios.get(
          `${baseUrl}/payment/get-priceMatrix/${course?.display_currency}`,
          authorizationObj
        );
        setPrice(response.data.data);
      }
    };
    fetchCourseDetails();
    fetchCategory();
    fetchPrice();
  }, [courseId, currentUser?.user_id, course?.course_category_id]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await axios.delete(
        `${baseUrl}/courses/delete/${courseId}`,
        authorizationObj
      );

      if (response.data.status === 200) {
        toast.success('Course deleted successfully');
        router.push('/institution/sub-admin/online-classes');
      } else {
        throw new Error(response.data.message || 'Failed to delete course');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error deleting course');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatTime = (timeString: string) => {
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Course not found</Alert>
      </Container>
    );
  }

  // Convert HTML to plain text by removing HTML tags
  const formatHtmlToText = (htmlString: string): string => {
    return htmlString
      .replace(/<strong>|<b>/g, '**')
      .replace(/<\/strong>|<\/b>/g, '**')
      .replace(/<em>|<i>/g, '*')
      .replace(/<\/em>|<\/i>/g, '*')
      .replace(/<[^>]+>/g, '') // Remove all other tags
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  };
  
  // Usage
  const course_description = formatHtmlToText(course.course_description);
  
  return (
    <>
      <Container fluid className="mt-4 px-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link href="/institution/sub-admin/online-classes" className="text-decoration-none">
            <Button  className="d-flex align-items-center btn-view rounded-pill">
              <i className="bi bi-arrow-left me-2"></i>
              Back to Courses
            </Button>
          </Link>
          <div className="d-flex gap-2">
            <Link href={`/institution/sub-admin/online-classes/${courseId}/manage-course`}>
              <Button  className="d-flex align-items-center btn-view rounded-pill">
                <i className="bi bi-list me-2"></i>
                Manage Course
              </Button>
            </Link>
            <Link href={`/institution/sub-admin/online-classes/${courseId}/edit`}>
              <Button  className="d-flex align-items-center btn-view rounded-pill">
                <i className="bi bi-pencil me-2"></i>
                Edit Course
              </Button>
            </Link>
            <Button 
              variant="danger" 
              onClick={() => setShowDeleteModal(true)}
              disabled={isDeleting}
              className="d-flex align-items-center rounded-pill "
            >
              <i className="bi bi-trash me-2"></i>
              {isDeleting ? 'Deleting...' : 'Delete Course'}
            </Button>
          </div>
        </div>

        <Card className="shadow-sm border-0">
          <Card.Body className="p-4">
            <Row>
              <Col lg={4}>
                <div className="sticky-top" style={{ top: '20px' }}>
                  {course.course_thumbnail && (
                    <div className="position-relative rounded-3 overflow-hidden mb-4" style={{ height: '240px' }}>
                      <Image
                        src={`${courseThumbnailPath}/${course.course_thumbnail}`}
                        alt={course.course_title}
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-3"
                      />
                    </div>
                  )}
                  {course.course_intro_video && (
                    <div className="mt-4">
                      <h5 className="fw-bold mb-3">
                        <i className="bi bi-play-circle me-2"></i>
                        Course Introduction
                      </h5>
                      <div className="ratio ratio-16x9 rounded-3 overflow-hidden shadow-sm">
                        <video controls className="rounded-3">
                          <source
                            src={`${courseVideoPath}/${course.course_intro_video}`}
                            type="video/mp4"
                          />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </div>
                  )}
                </div>
              </Col>
              <Col lg={8}>
                <div className="ps-lg-4">
                  <h1 className="display-6 fw-bold mb-3">{course.course_title}</h1>
                  <p className="lead text-muted mb-4">{course_description}</p>

                  <Row className="g-4">
                    <Col md={6}>
                      <Card className="h-100 border-0 bg-light">
                        <Card.Body className="p-4">
                          <h5 className="card-title fw-bold mb-4">
                            <i className="bi bi-info-circle me-2"></i>
                            Course Details
                          </h5>
                          <ul className="list-unstyled">
                            <li className="mb-3 d-flex align-items-center">
                              <i className="bi bi-bar-chart me-2 text-primary"></i>
                              <strong className="me-2">Level:</strong>
                              <span className="badge bg-info">{course.course_level}</span>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                              <i className="bi bi-translate me-2 text-primary"></i>
                              <strong className="me-2">Language:</strong>
                              <span className="badge bg-secondary">{course.course_language}</span>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                              <i className="bi bi-currency-dollar me-2 text-primary"></i>
                              <strong className="me-2">Price:</strong>
                              <span className="badge bg-primary">
                                {course.display_currency}
                                {/* {price.tier_price
                                  ? `${course.display_currency} ${price.tier_price}`
                                  : 'Free'} */}
                              </span>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                              <i className="bi bi-circle me-2 text-primary"></i>
                              <strong className="me-2">Status:</strong>
                              <span
                                className={`badge ${
                                  course.course_status === '1' ? 'bg-success' : 'bg-danger'
                                }`}
                              >
                                {course.course_status === '1' ? 'Active' : 'Inactive'}
                              </span>
                            </li>
                          </ul>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="h-100 border-0 bg-light">
                        <Card.Body className="p-4">
                          <h5 className="card-title fw-bold mb-4">
                            <i className="bi bi-calendar-check me-2"></i>
                            Schedule Information
                          </h5>
                          <ul className="list-unstyled">
                            <li className="mb-3 d-flex align-items-center">
                              <i className="bi bi-calendar-event me-2 text-primary"></i>
                              <strong className="me-2">Start Date:</strong>
                              <span>{formatDate(course.start_date)}</span>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                              <i className="bi bi-calendar-event-fill me-2 text-primary"></i>
                              <strong className="me-2">End Date:</strong>
                              <span>{formatDate(course.end_date)}</span>
                            </li>
                            <li className="mb-3 d-flex align-items-center">
                              <i className="bi bi-clock me-2 text-primary"></i>
                              <strong className="me-2">Class Time:</strong>
                              <span>{formatTime(course.class_timing)}</span>
                            </li>
                          </ul>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={12}>
                      <Card className="border-0 bg-light">
                        <Card.Body className="p-4">
                          <h5 className="card-title fw-bold mb-4">
                            <i className="bi bi-info-square me-2"></i>
                            Additional Information
                          </h5>
                          <Row>
                            <Col md={6}>
                              <ul className="list-unstyled">
                                <li className="mb-3 d-flex align-items-center">
                                  <i className="bi bi-calendar-plus me-2 text-primary"></i>
                                  <strong className="me-2">Created:</strong>
                                  <span>{formatDate(course.created_at)}</span>
                                </li>
                                <li className="mb-3 d-flex align-items-center">
                                  <i className="bi bi-calendar-check me-2 text-primary"></i>
                                  <strong className="me-2">Last Updated:</strong>
                                  <span>{formatDate(course.updated_at)}</span>
                                </li>
                              </ul>
                            </Col>
                            <Col md={6}>
                              <ul className="list-unstyled">
                                <li className="mb-3 d-flex align-items-center">
                                  <i className="bi bi-folder me-2 text-primary"></i>
                                  <strong className="me-2">Category:</strong>
                                  <span>{category?.category_name || 'Unknown Category'}</span>
                                </li>
                                <li className="mb-3 d-flex align-items-center">
                                  <i className="bi bi-person me-2 text-primary"></i>
                                  <strong className="me-2">Instructor ID:</strong>
                                  <span>{course.instructor_id}</span>
                                </li>
                              </ul>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">Are you sure you want to delete <strong>{course.course_title}</strong>?</p>
          <p className="text-muted small mb-0">This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete} 
            disabled={isDeleting}
            className="d-flex align-items-center"
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash me-2"></i>
                Delete Course
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CourseDetails;
