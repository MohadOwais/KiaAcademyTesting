"use client";

import "./main.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { authorizationObj, baseUrl, courseThumbnailPath } from "@/app/utils/core";
import defaultCourseImage from "../../../../public/images/banner.jpg";
import { shortenString } from "@/app/utils/functions";
import Image from 'next/image'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Button } from "@mui/material";

const BestCourses = () => {
    const router = useRouter();
    const [courses, setCourses] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        getCourses();
    }, []);

    const getCourses = async () => {
        setIsLoading(true);
        try {
            const resp = await axios.get(`${baseUrl}/courses/popular`, authorizationObj);
            if (resp?.data?.data) {
                const filteredCourses = resp.data.data
                    .filter((c: any) => c?.course_status === "approved");
                setCourses(filteredCourses);
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(courses.length / 3);
    const canGoNext = currentPage < totalPages - 1;
    const canGoPrev = currentPage > 0;

    const handlePrevPage = () => {
        if (canGoPrev) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (canGoNext) {
            setCurrentPage(prev => prev + 1);
        }
    };

    // Get current page's courses
    const currentCourses = courses.slice(currentPage * 3, (currentPage + 1) * 3);

    const getLevelColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case "beginner": return "success";
            case "intermediate": return "warning";
            case "advanced": return "danger";
            default: return "success";
        }
    };

    return (
        <section className="py-5">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="mb-0">Most Popular Courses</h2>
                    <div className="slider-controls">
                    <Button
    onClick={() => router.push("/current-courses")}
    className="btn rounded-pill px-4 py-2"
    color="secondary"
    variant="contained"
>
                            Browse Courses
                        </Button>

                        <button
                            className={`btn btn-light rounded-circle py-2 px-2 shadow-sm ${!canGoPrev && 'opacity-50'}`}
                            onClick={handlePrevPage}
                            disabled={!canGoPrev}
                        >
                            <IoIosArrowBack />
                        </button>
                        <button
                            className={`btn btn-light rounded-circle py-2 px-2 shadow-sm ms-2 ${!canGoNext && 'opacity-50'}`}
                            onClick={handleNextPage}
                            disabled={!canGoNext}
                        >
                            <IoIosArrowForward />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="courses-container">
                        <div className="row g-4">
                            {currentCourses.map((course: any) => (
                                <div key={course.course_id} className="col-md-4">
                                    <div
                                        className="card h-100 course-card border-1 border-primary border-opacity-10 shadow-sm d-flex flex-column"
                                        onClick={() => router.push(`/current-courses/${course.course_id}`)}
                                    >
                                        <div
                                            className="level-indicator"
                                            style={{
                                                backgroundColor:
                                                    course.course_level?.toLowerCase() === 'beginner'
                                                        ? '#ffb300'
                                                        : course.course_level?.toLowerCase() === 'intermediate'
                                                            ? '#62c824'
                                                            : course.course_level?.toLowerCase() === 'advanced'
                                                                ? '#df1278'
                                                                : '#02e962',
                                            }}
                                        ></div>
                                        <div className="position-relative" style={{ height: '200px' }}>
                                            <Image
                                                src={course.course_thumbnail
                                                    ? `${courseThumbnailPath}/${course.course_thumbnail}`
                                                    : defaultCourseImage.src
                                                }
                                                alt={course.course_title}
                                                fill
                                                className="card-img-top"
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                priority
                                            />
                                        </div>

                                        <div className="card-body pt-3 pb-0 d-flex flex-column">
                                            <h5 className="card-title">
                                                {shortenString(course.course_title, 50)}
                                            </h5>
                                            <div className="mt-auto">
                                                <span className="text-dark fw-bold">
                                                    {course.display_currency} {course.course_display_price}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                
            </div>
        </section>
    );
};

export default BestCourses;
