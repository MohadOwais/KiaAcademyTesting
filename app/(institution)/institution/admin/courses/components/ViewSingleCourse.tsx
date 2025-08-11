"use client";

import { Card, CardContent, Grid, Typography } from "@mui/material";
import moment from "moment";
import { AdditionalInfo } from "./AdditionalInfo";

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

interface ViewSingleCourseProps {
    course: Course;
}

const ViewSingleCourse = ({ course }: ViewSingleCourseProps) => {
    return (
        <Card className="w-full">
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {course.course_title}
                        </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Typography variant="body1" paragraph>
                            {course.course_description}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Course ID: {course.course_id}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Status: {course.course_status}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Price: {course.course_price} {course.display_currency}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Language: {course.course_language}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Level: {course.course_level}
                        </Typography>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Public: {course.is_public === '1' ? 'Yes' : 'No'}
                        </Typography>
                    </Grid>

                    {course.start_date && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" color="textSecondary">
                                Start Date: {moment(course.start_date).format('MMMM D, YYYY')}
                            </Typography>
                        </Grid>
                    )}

                    {course.end_date && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" color="textSecondary">
                                End Date: {moment(course.end_date).format('MMMM D, YYYY')}
                            </Typography>
                        </Grid>
                    )}

                    {course.class_timing && (
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" color="textSecondary">
                                Class Timing: {course.class_timing}
                            </Typography>
                        </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="textSecondary">
                            Created: {moment(course.created_at).format('MMMM D, YYYY')}
                        </Typography>
                    </Grid>
                </Grid>
                {/* singleCourse, is_loading, set_is_loading, set_error_message, set_success_message */}
                {/* <AdditionalInfo course={singleCourse}/> */}
            </CardContent>
        </Card>
    );
};

export default ViewSingleCourse; 