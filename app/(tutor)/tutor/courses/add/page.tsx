"use client";

import { Container } from '@mui/material';
import CourseForm from '../components/CourseForm';

const AddCoursePage = () => {
    return (
        <Container className="mt-4">
            <CourseForm mode="add" />
        </Container>
    );
};

export default AddCoursePage; 