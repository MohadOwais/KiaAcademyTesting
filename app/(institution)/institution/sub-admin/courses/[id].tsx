"use client";

import "./Main.css";
import axios from "axios";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authorizationObj, baseUrl } from "@/app/utils/core";
import { Typography, Card, CardContent, Grid, Button } from "@mui/material";
import moment from "moment";
import Link from "next/link";

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
                if (!courseId) {
                    setError('Course ID not found');
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${baseUrl}/courses/${courseId}`, authorizationObj);
                if (response?.data?.data?.length > 0) {
                    setCourse(response.data.data[0]);
                } else {
                    setError('Course not found');
                }
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch course data');
                console.error('Error fetching course:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

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

    if (loading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;
    if (!course) return <div className="p-4">No course data available</div>;

    return (
        <div>Hello</div>
        // <div className="flex flex-col gap-4 p-4">
        //     <div className="flex justify-between items-center">
        //         <Link href="/institution/admin/courses">
        //             <Button variant="outlined" color="primary">
        //                 Back to Courses
        //             </Button>
        //         </Link>
        //         <Button variant="contained" color="primary">
        //             Edit Course
        //         </Button>
        //     </div>

        //     <Typography variant="h4" className="mt-4">{course.course_title}</Typography>
            
        //     <Card>
        //         <CardContent>
        //             <Grid container spacing={3}>
        //                 <Grid item xs={12} md={4}>
        //                     <img 
        //                         src={`https://api.kiacademy.in/uploads/courses/image/${course.course_thumbnail}`}
        //                         alt={course.course_title}
        //                         className="w-full rounded-lg"
        //                     />
        //                 </Grid>
        //                 <Grid item xs={12} md={8}>
        //                     <Typography variant="h6" gutterBottom>Course Details</Typography>
        //                     <Typography variant="body1" paragraph>
        //                         {course.course_description}
        //                     </Typography>
        //                     <div className="grid grid-cols-2 gap-4 mt-4">
        //                         <div>
        //                             <Typography variant="subtitle2">Created At</Typography>
        //                             <Typography variant="body2">
        //                                 {formatDate(course.created_at)}
        //                             </Typography>
        //                         </div>
        //                         <div>
        //                             <Typography variant="subtitle2">Status</Typography>
        //                             <Typography variant="body2">
        //                                 {course.is_public === "0" ? "Private" : "Public"}
        //                             </Typography>
        //                         </div>
        //                         <div>
        //                             <Typography variant="subtitle2">Price</Typography>
        //                             <Typography variant="body2">
        //                                 {course.course_price} {course.display_currency || 'USD'}
        //                             </Typography>
        //                         </div>
        //                         <div>
        //                             <Typography variant="subtitle2">Language</Typography>
        //                             <Typography variant="body2">
        //                                 {course.course_language}
        //                             </Typography>
        //                         </div>
        //                         <div>
        //                             <Typography variant="subtitle2">Level</Typography>
        //                             <Typography variant="body2">
        //                                 {course.course_level}
        //                             </Typography>
        //                         </div>
        //                         <div>
        //                             <Typography variant="subtitle2">Class Timing</Typography>
        //                             <Typography variant="body2">
        //                                 {formatTime(course.class_timing)}
        //                             </Typography>
        //                         </div>
        //                         <div>
        //                             <Typography variant="subtitle2">Start Date</Typography>
        //                             <Typography variant="body2">
        //                                 {formatDate(course.start_date)}
        //                             </Typography>
        //                         </div>
        //                         <div>
        //                             <Typography variant="subtitle2">End Date</Typography>
        //                             <Typography variant="body2">
        //                                 {formatDate(course.end_date)}
        //                             </Typography>
        //                         </div>
        //                     </div>
        //                 </Grid>
        //             </Grid>
        //         </CardContent>
        //     </Card>
        // </div>
    );
};

export default Main;
