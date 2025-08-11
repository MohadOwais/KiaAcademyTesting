"use client";

import { Container, Alert, CircularProgress, Box, Button, Typography } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import CourseForm from '../../components/CourseForm';
import { use, useEffect, useState } from 'react';
import axios from 'axios';
import { authorizationObj, baseUrl } from "@/app/utils/core";
import { Lecture } from '../../components/Lecture';
import { Sections } from '../../components/Sections';
import { IoMdAddCircle } from 'react-icons/io';

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

const EditLecturePage = () => {
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSections, setShowSections] = useState(false); // <-- added state
    const params = useParams();
    const courseId = params.id;
    console.log('Course ID:', courseId);
    console.log('Course:', course);
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                setLoading(true);
                setError(null);

                if (!courseId) {
                    throw new Error('Course ID is required');
                }

                const response = await axios.get(`${baseUrl}/courses/${courseId}`, authorizationObj);

                if (!response?.data?.data) {
                    throw new Error('Invalid response format from server');
                }

                if (response.data.data.length === 0) {
                    throw new Error('Course not found');
                }

                const courseData = response.data.data[0];
                 console.log('Course Data:', courseData);
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

    return (
        <>
            {/* <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setShowSections(true)} // <-- toggle section display
                    className="ms-auto d-flex align-items-center"
                >
                    <IoMdAddCircle style={{ marginRight: "0.5em", verticalAlign: "middle" }} />
                    <span style={{ verticalAlign: "middle" }}>Add Section</span>
                </Button>
            </Box> */}

              <Sections singleCourse={course} /> {/* <-- conditional render */}
        </>
    );
};

export default EditLecturePage;
