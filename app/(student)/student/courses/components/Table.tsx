import "./Main.css";
import React from 'react';
import CourseCard from '@/app/components/CourseCard';
import CourseCardSkeleton from '@/app/components/mui/CourseCardSkeleton';
import { FaBook } from "react-icons/fa";

export const EmptyCourses = () => {
    return (
        <div className="container-fluid">
            <div className="d-flex flex-column justify-content-end align-items-center gap-4" style={{height: "40vh"}}>
                <FaBook
                    style={{ fontSize: "120px" }}
                />
                <p className="text-center fs-1 fw-bold w-100">No Courses</p>
            </div>
        </div>
    )
}

interface TableProps {
    data: any[];
    getAllCourses: () => void;
    is_loading: boolean;
    set_is_loading: (loading: boolean) => void;
    isLiveCourse?: boolean; // 👈 Add this line
}

const Table: React.FC<TableProps> = ({ 
    data, 
    getAllCourses, 
    is_loading, 
    set_is_loading,
    isLiveCourse 
}) => {
    if (is_loading) {
        return (
            <div className="container-fluid">
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                    {[1, 2, 3].map((i) => (
                        <div className="col" key={i}>
                            <CourseCardSkeleton />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data?.length) {
        return (
            <div className="container-fluid">
                <div className="text-center py-4">
                    <p className="mb-0">No courses found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid">
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                {data.map((course, index) => (
                    <div className="col" key={course.course_id || index}>
                        <CourseCard
                            course={{
                                ...course,
                                display_price: course.display_price || course.course_price,
                                currency: course.currency || course.display_currency
                            }}
                            options={{
                                noCartAndFav: true,
                                isLiveCourse: isLiveCourse, // 👈 Pass down to CourseCard
                                onRefresh: getAllCourses
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Table;
