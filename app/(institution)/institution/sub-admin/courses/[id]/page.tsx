"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import Main from './Main';
import { Container, Alert } from '@mui/material';

const Page = () => {
    const params = useParams();
    // console.log('Route params:', params); // Debug log

    // In Next.js 13+, the dynamic parameter is directly available in params
    const courseId = typeof params?.id === 'string' ? params.id : 
                    typeof params?.course_id === 'string' ? params.course_id : 
                    null;

    if (!courseId) {
        return (
            <Container className="mt-4">
                <Alert severity="error">Course ID not found</Alert>
            </Container>
        );
    }

    return (
        <div className="container-fluid mt-4">
            <Main courseId={courseId} />
        </div>
    );
};

export default Page; 