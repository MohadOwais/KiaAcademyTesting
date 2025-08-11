"use client";

import "./Main.css";
import axios from "axios";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authorizationObj, baseUrl } from "@/app/utils/core";
import { Button, CircularProgress, Alert, Box } from "@mui/material";
import Link from "next/link";
import ViewSingleCourse from "./ViewSingleCourse";

interface Course {
    course_id: string;
    course_title: string;
    course_description: string;
    course_thumbnail: string;
    created_at: string;
    is_public: string;
    course_price: number;
    display_currency: string;
    course_status: string;
    course_category_id: string;
    course_language: string;
    course_level: string;
    start_date: string;
    end_date: string;
    class_timing: string;
}

interface MainProps {
    courseId: string;
}

const Main = ({ courseId }: MainProps) => {
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                setError(null);
                // console.log('Fetching course with ID:', courseId); // Debug log

                if (!courseId) {
                    throw new Error('Course ID is required');
                }

                const response = await axios.get(`${baseUrl}/courses/${courseId}`, authorizationObj);
                // console.log('API Response:', response.data); // Debug log

                if (!response?.data?.data) {
                    throw new Error('Invalid response format from server');
                }

                if (response.data.data.length === 0) {
                    throw new Error('Course not found');
                }

                const courseData = response.data.data[0];
                
                // Validate required fields
                if (!courseData.course_id || !courseData.course_title) {
                    throw new Error('Invalid course data received');
                }

                setCourse(courseData);
            } catch (err: any) {
                console.error('Error fetching course:', err);
                setError(
                    err.response?.data?.message || 
                    err.message || 
                    'Failed to fetch course data'
                );
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleRetry = () => {
        setError(null);
        setLoading(true);
        // The useEffect will trigger a new fetch
    };

    if (loading) {
        return (
            <Box className="d-flex justify-content-center align-items-center" >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="p-4">
                <Alert 
                    severity="error" 
                    className="mb-4"
                    action={
                        <Button 
                            color="inherit" 
                            size="small"
                            onClick={handleRetry}
                        >
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => router.push('/institution/tutor/courses')}
                    className="btn-view"
                >
                    Back to Courses
                </Button>
            </Box>
        );
    }

    if (!course) {
        return (
            <Box className="p-4">
                <Alert severity="warning" className="mb-4">
                    No course data available
                </Alert>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => router.push('/institution/tutor/courses')}
                >
                    Back to Courses
                </Button>
            </Box>
        );
    }

    return (
        <Box className="d-flex flex-column gap-4 justify-content-end align-items-end">  {/* Bootstrap classes for flexbox alignment */}
        <Box className="container-fluid">
  <div className="row align-items-center">
    {/* Left section */}
    <div className="col-12 col-md-6 mb-2 mb-md-0">
      <Link href="/institution/tutor/courses">
        <Button variant="outlined" className="btn-view text-white  w-md-auto">
          Back to Courses
        </Button>
      </Link>
    </div>

    {/* Right section */}
    <div className="col-12 col-md-6">
      <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
         <Link href={`/current-courses/${courseId}`}>
          <Button variant="contained" className="btn-view w-100 w-md-auto">
            Preview Course
          </Button>
        </Link>
        <Link href={`/institution/tutor/courses/${courseId}/manage-course`}>
          <Button variant="contained" className="btn-view w-100 w-md-auto">
            Manage Course
          </Button>
        </Link>
        <Link href={`/institution/tutor/courses/${courseId}/edit`}>
          <Button variant="contained" className="btn-view w-100 w-md-auto">
            Edit Course
          </Button>
        </Link>
      </div>
    </div>
  </div>
</Box>

    
        <ViewSingleCourse course={course} />

    </Box>
    
    )
};

export default Main;
