"use client";

import { Container, Alert, CircularProgress, Box } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import CourseForm from '../../components/CourseForm';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { authorizationObj, baseUrl } from "@/app/utils/core";

const EditCoursePage = () => {
    const params = useParams();
    const router = useRouter();
    const courseId = params?.id as string;
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateCourse = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (!courseId) {
                    throw new Error('Course ID is required');
                }

                const response = await axios.get(`${baseUrl}/courses/${courseId}`, authorizationObj);
                
                if (!response?.data?.data?.length) {
                    throw new Error('Course not found');
                }
            } catch (err: any) {
                console.error('Error validating course:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load course');
            } finally {
                setLoading(false);
            }
        };

        validateCourse();
    }, [courseId]);

    if (loading) {
        return (
            <Container className="mt-4">
                <Box className="flex justify-center items-center min-h-[400px]">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="mt-4">
                <Alert 
                    severity="error" 
                    className="mb-4"
                    action={
                        <button
                            onClick={() => router.push('/institution/admin/courses')}
                            className="text-white hover:text-gray-200"
                        >
                            Back to Courses
                        </button>
                    }
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            <CourseForm mode="edit" courseId={courseId} />
        </Container>
    );
};

export default EditCoursePage; 