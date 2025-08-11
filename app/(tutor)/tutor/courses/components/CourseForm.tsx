"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {    Button, CircularProgress, Box} from '@mui/material';
import { authorizationObj, baseUrl } from "@/app/utils/core";
import Markdown from '@/app/components/markdown/Markdown-1';

interface CourseFormProps {
    courseId?: string;
    mode: 'add' | 'edit';
}

interface CourseFormData {
    course_title: string;
    course_description: string;
    course_thumbnail: string;
    course_price: number;
    display_currency: string;
    course_status: string;
    course_category_id: string;
    course_language: string;
    course_level: string;
    start_date: string;
    end_date: string;
    class_timing: string;
    is_public: boolean;
}

interface FormErrors {
    [key: string]: string;
}

const initialFormData: CourseFormData = {
    course_title: '',
    course_description: '',
    course_thumbnail: '',
    course_price: 0,
    display_currency: 'USD',
    course_status: 'draft',
    course_category_id: '',
    course_language: 'English',
    course_level: 'Beginner',
    start_date: '',
    end_date: '',
    class_timing: '',
    is_public: false
};

const CourseForm = ({ courseId, mode }: CourseFormProps) => {
    const router = useRouter();
    const [formData, setFormData] = useState<CourseFormData>(initialFormData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (mode === 'edit' && courseId) {
            fetchCourseData();
        }
    }, [courseId, mode]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.course_title.trim()) {
            newErrors.course_title = 'Course title is required';
        }

        if (!formData.course_description.trim()) {
            newErrors.course_description = 'Course description is required';
        }

        if (formData.course_price < 0) {
            newErrors.course_price = 'Price cannot be negative';
        }

        if (formData.start_date && formData.end_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);

            if (endDate < startDate) {
                newErrors.end_date = 'End date must be after start date';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`${baseUrl}/courses/${courseId}`, authorizationObj);

            if (response?.data?.data?.length > 0) {
                const courseData = response.data.data[0];
                setFormData({
                    ...courseData,
                    is_public: courseData.is_public === '1',
                    start_date: courseData.start_date ? new Date(courseData.start_date).toISOString().split('T')[0] : '',
                    end_date: courseData.end_date ? new Date(courseData.end_date).toISOString().split('T')[0] : ''
                });
            } else {
                throw new Error('Course not found');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch course data');
            console.error('Error fetching course:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value, checked } = e.target as HTMLInputElement;
        setFormData(prev => ({
            ...prev,
            [name as string]: name === 'is_public' ? checked : value
        }));
        // Clear error for the field being changed
        if (errors[name as string]) {
            setErrors(prev => ({
                ...prev,
                [name as string]: ''
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const submitData = {
                ...formData,
                is_public: formData.is_public ? '1' : '0',
                course_price: Number(formData.course_price)
            };

            if (mode === 'add') {
                await axios.post(`${baseUrl}/courses`, submitData, authorizationObj);
                setSuccess('Course created successfully!');
            } else {
                await axios.post(`${baseUrl}/courses/update/${courseId}`, submitData, authorizationObj);
                setSuccess('Course updated successfully!');
            }

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/tutor/courses');
            }, 2000);
        } catch (err: any) {
            console.error('Error saving course:', err);
            setError(err.response?.data?.message || 'Failed to save course');
        } finally {
            setLoading(false);
        }
    };

    if (loading && mode === 'edit') {
        return (
            <Box className="d-flex justify-content-center align-items-center min-h-[400px]">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
         <Button
                variant="contained"
                className="btn-view text-white mb-4 "
                onClick={() => router.push('/tutor/courses/')}

            >
                Back to Courses
            </Button>
        
         <div className="card p-4 shadow-sm">
            
      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
        <h2 className="mb-4">{mode === 'add' ? 'Add New Course' : 'Edit Course'}</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="row g-3">

          {/* Course Title */}
          <div className="col-12">
            <label htmlFor="courseTitle" className="form-label">Course Title</label>
            <input
              type="text"
              className={`form-control ${errors.course_title ? 'is-invalid' : ''}`}
              id="courseTitle"
              name="course_title"
              value={formData.course_title}
              onChange={handleInputChange}
              required
            />
            <div className="invalid-feedback">{errors.course_title}</div>
          </div>

          {/* Course Description */}
          <div className="col-12">
           <Markdown
              label="Course Description"
              value={formData.course_description}
              onChange={(value: string) => {
                setFormData(prev => ({ ...prev, course_description: value }));
                if (errors.course_description) {
                  setErrors(prev => ({ ...prev, course_description: '' }));
                }
              }}
            />
            <div className="invalid-feedback">{errors.course_description}</div>
          </div>

          {/* Currency */}
          <div className="col-md-6">
            <label htmlFor="displayCurrency" className="form-label">Currency</label>
            <select
              className="form-select"
              id="displayCurrency"
              name="display_currency"
              value={formData.display_currency}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="INR">INR</option>
            </select>
          </div>
          {/* Course Price */}
          <div className="col-md-6">
            <label htmlFor="coursePrice" className="form-label">Course Price</label>
            <input
              type="number"
              className={`form-control ${errors.course_price ? 'is-invalid' : ''}`}
              id="coursePrice"
              name="course_price"
              min="0"
              value={formData.course_price}
              onChange={handleInputChange}
              required
            />
            <div className="invalid-feedback">{errors.course_price}</div>
          </div>


          {/* Course Level */}
          <div className="col-md-6">
            <label htmlFor="courseLevel" className="form-label">Course Level</label>
            <select
              className="form-select"
              id="courseLevel"
              name="course_level"
              value={formData.course_level}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Course Language */}
          <div className="col-md-6">
            <label htmlFor="courseLanguage" className="form-label">Course Language</label>
            <select
              className="form-select"
              id="courseLanguage"
              name="course_language"
              value={formData.course_language}
              onChange={handleInputChange}
            >
              <option value="">Select</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* Public Course Switch */}
          <div className="col-md-6 d-flex align-items-center">
            <div className="form-check form-switch mt-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="isPublic"
                name="is_public"
                checked={formData.is_public}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="isPublic">
                Public Course
              </label>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-pill"
            onClick={() => router.push('/institution/admin/courses')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-view text-white rounded-pill"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              mode === 'add' ? 'Create Course' : 'Update Course'
            )}
          </button>
        </div>
      </form>
    </div>
    </>
    );
};

export default CourseForm; 