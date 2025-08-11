"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import { Alert, Button, Card, Container, Row, Col, Spinner, Form } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import Markdown from "@/app/components/markdown/Markdown";
import TimezoneSelect from "@/app/components/TimezoneSelect";

interface Course {
  course_id: string;
  course_title: string;
  course_description: string;
  course_price: string;
  is_published: string;
  course_level: string;
  course_language: string;
  start_date: string;
  end_date: string;
  class_timing: string;
  course_thumbnail: string;
  course_intro_video?: string;
  course_category_id: string;
  course_currency: string;
  time_zone: string;
  display_currency: string;
}

interface Category {
  category_id: string;
  category_name: string;
}

interface Currency {
  value: string;
  label: string;
}

interface PriceMatrix {
  ID: string;
  tier_price: string;
  value: string;
  label: string;
}



const COURSE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "hindi", label: "Hindi" },
];

const EditCourse = () => {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const currentUser = useSelector((state: any) => state.user);
  const currentInstitute = useSelector((state: any) => state.institute);

  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [priceMatrix, setPriceMatrix] = useState<PriceMatrix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [courseIntroVideo, setCourseIntroVideo] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    course_title: '',
    course_description: '',
    course_category_id: '',
    course_currency: '',
    course_price: '',
    course_language: '',
    course_level: '',
    start_date: '',
    end_date: '',
    class_timing: '',
    is_published: '',
    time_zone: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch course data
        const courseRes = await axios.get(`${baseUrl}/courses/${courseId}`, {
          ...authorizationObj,
          headers: {
            ...authorizationObj.headers,
            'Accept': 'application/json',
          }
        });
        if (courseRes.data.status === 200 && courseRes.data.data) {
          const courseData = courseRes.data.data[0]; // Access first item in array
          setCourse(courseData);
          setFormData({
            course_title: courseData.course_title || '',
            course_description: courseData.course_description || '',
            course_category_id: courseData.course_category_id || '',
            course_currency: courseData.display_currency || '',
            course_price: courseData.course_price || '',
            course_language: courseData.course_language || '',
            course_level: courseData.course_level?.toLowerCase() || '',
            start_date: courseData.start_date ? courseData.start_date.split(' ')[0] : '',
            end_date: courseData.end_date ? courseData.end_date.split(' ')[0] : '',
            class_timing: courseData.class_timing || '',
            is_published: courseData.is_published || '0',
            time_zone: courseData.time_zone || '',
          });

          // Set thumbnail preview if exists
          if (courseData.course_thumbnail) {
            setThumbnailPreview(`${baseUrl}/uploads/courses/${courseData.course_thumbnail}`);
          }

          // Fetch price matrix if currency exists
          if (courseData.display_currency) {
            await fetchPriceMatrix(courseData.display_currency);
          }
        }

        // Fetch categories
        const categoriesRes = await axios.get(`${baseUrl}/course-categories`, authorizationObj);
        if (categoriesRes.data.status === 200) {
          setCategories(categoriesRes.data.data);
        }

        // Fetch currencies
        const currenciesRes = await axios.get(`${baseUrl}/payment/get-currency`, authorizationObj);
        if (currenciesRes.data.status === 200) {
          const formattedCurrencies: Currency[] = currenciesRes.data.currency.map((curr: string) => ({
            value: curr,
            label: curr
          }));
          setCurrencies(formattedCurrencies);
        }

      } catch (error: any) {
        console.error('Error in fetchData:', error);
        setError(error.response?.data?.message || 'Error loading course data');
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && currentUser?.user_id) {
      fetchData();
    }
  }, [courseId, currentUser?.user_id]);

  const fetchPriceMatrix = async (currency: string) => {
    try {
      const resp = await axios.get(`${baseUrl}/payment/get-priceMatrix/${currency}`, authorizationObj);
      if (resp?.data?.data) {
        const processedData = resp.data.data.map((item: any) => ({
          ID: item.ID || `price-${Math.random()}`,
          tier_price: item.tier_price,
          value: item.ID || `price-${Math.random()}`,
          label: item.tier_price
        }));
        setPriceMatrix(processedData);
      }
    } catch (error) {
      console.error('Price matrix fetch error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "course_currency" && value) {
      fetchPriceMatrix(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'thumbnail') {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file for the thumbnail');
        return;
      }
      setCourseThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      if (!file.type.startsWith('video/')) {
        setError('Please upload a video file for the intro');
        return;
      }
      setCourseIntroVideo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError(null);

      const submitFormData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        submitFormData.append(key, value);
      });

      // Add files only if they've been changed
      if (courseThumbnail) submitFormData.append("course_thumbnail", courseThumbnail);
      if (courseIntroVideo) submitFormData.append("course_intro_video", courseIntroVideo);

      // Add additional required fields
      submitFormData.append("course_type", "1");
      submitFormData.append("is_public", "1");
      submitFormData.append("institute_id", currentInstitute?.institute_id || "0");
      submitFormData.append("instructor_id", currentUser?.user_id || "");

      console.log('Submitting form data:', {
        courseId,
        formData: Object.fromEntries(submitFormData),
        headers: {
          ...authorizationObj.headers,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        }
      });
      console.log('submitFormData', submitFormData);
      console.log('authorizationObj', authorizationObj);
      console.log('baseUrl', baseUrl);
      console.log('courseId', courseId);

      const response = await axios.post(`${baseUrl}/courses/update/${courseId}`, submitFormData, authorizationObj);
      console.log('response', response.data);

      if (response.data.status === 200) {
        toast.success('Course updated successfully');
        router.push(`/tutor/online-classes/${courseId}`);
      } else {
        throw new Error(response.data.message || 'Failed to update course');
      }
    } catch (error: any) {
      console.error('Error updating course:', error);
      
      let errorMessage = 'Error updating course';
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please try again.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'Error setting up request';
      }
      
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
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
        <Alert variant="danger">
          <Alert.Heading>Error Loading Course</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Link href="/tutor/online-classes">
              <Button variant="outline-danger">Back to Courses</Button>
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link href={`/tutor/online-classes/${courseId}`} className="text-decoration-none">
          <Button variant="outline-primary">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Course
          </Button>
        </Link>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">Edit Course</h2>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="course_title"
                    value={formData.course_title}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="course_category_id"
                    value={formData.course_category_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Markdown
                    label="Course Description"
                    value={formData.course_description}
                    onChange={(text: string) => setFormData(prev => ({ ...prev, course_description: text }))}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Select
                    name="course_language"
                    value={formData.course_language}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Language</option>
                    {LANGUAGES.map(lang => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Level</Form.Label>
                  <Form.Select
                    name="course_level"
                    value={formData.course_level}
                    onChange={handleInputChange}
                    required
                  >
                    {COURSE_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Currency</Form.Label>
                  <Form.Select
                    name="course_currency"
                    value={formData.course_currency}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Currency</option>
                    {currencies.map((currency, index) => (
                      <option key={index} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price</Form.Label>
                  <Form.Select
                    name="course_price"
                    value={formData.course_price}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.course_currency}
                  >
                    <option value="">Select Price</option>
                    {priceMatrix.map((tier, idx) => (
                      <option key={tier.ID || `tier-${idx}`} value={tier.ID}>
                        {tier.tier_price}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Class Timing</Form.Label>
                  <Form.Control
                    type="time"
                    name="class_timing"
                    value={formData.class_timing}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <TimezoneSelect
                  value={formData.time_zone}
                  onChange={(value) => setFormData(prev => ({ ...prev, time_zone: value }))}
                  label="Timezone"
                  required
                />
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Course Thumbnail</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e as any, 'thumbnail')}
                  />
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="mt-2"
                      style={{ maxWidth: '100px', height: 'auto' }}
                    />
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Intro Video (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e as any, 'video')}
                  />
                  <small className="text-muted">A 1–2 min video of the course goals and benefits.</small>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Link href={`/tutor/online-classes/${courseId}`} className="me-2">
                <Button variant="secondary">Cancel</Button>
              </Link>
              <Button 
                type="submit" 
                variant="primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditCourse; 