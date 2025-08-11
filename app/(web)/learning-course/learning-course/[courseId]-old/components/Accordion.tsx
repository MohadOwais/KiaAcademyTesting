import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import { useSelector } from "react-redux";
import { MuiMarkdown } from 'mui-markdown';
import { BsClock } from "react-icons/bs";
import { FaLock } from "react-icons/fa";

export const SingleLecture = ({ lecture, show, isLast, index }: any) => {
    return (
        <div className="timeline-item ps-4 mt-3 position-relative">
            {!isLast && <div className="timeline-line position-absolute" style={{ left: "33px", top: "20px", bottom: "-35px", width: "2px", background: "#d5d2d2", zIndex: 0 }} />}
            <div className="d-flex align-items-center gap-3">
                <div className="timeline-dot rounded-circle d-flex align-items-center justify-content-center position-relative" 
                     style={{ width: "20px", height: "20px", background: "#ece8e8", border: "2px solid #d5d2d2", zIndex: 1, flexShrink: 0 }}>
                </div>
                <div className="timeline-content bg-white rounded-3 p-3 d-flex align-items-center" 
                     style={{ transition: "all 0.3s ease", cursor: "pointer" }}>
                    <div className="d-flex align-items-center w-100">
                        <div className="d-flex align-items-center gap-2">
                            {!show && <FaLock className="text-danger" style={{ fontSize: "0.9em" }} />}
                            <p className="mb-0 fw-semibold">{lecture?.lecture_title}</p>
                            {lecture?.duration && (
                                <div className="ms-3 d-flex align-items-center gap-2 text-muted small">
                                    <BsClock />
                                    <span>{lecture.duration}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Lecture = ({ singleCourse, section_id }: any) => {
    const currentUser = useSelector((state: any) => state?.user);
    const [lectures, setLectures] = useState<any[]>([]);

    useEffect(() => {
        getLectures();
    }, [singleCourse[0]?.course_id]);

    const getLectures = async () => {
        if (!section_id || section_id?.trim() === "") return;
        try {
            const resp = await axios.get(`${baseUrl}/lectures/by-section/${section_id}`, authorizationObj);
            if (resp?.data?.data?.length) {
                setLectures(resp.data.data);
            }
        } catch (error) {
            setLectures([]);
        }
    };

    return (
        <div className="timeline-container mt-4">
            {lectures?.map((lecture: any, i: number) => (
                <SingleLecture
                    key={lecture.lecture_id || i}
                    lecture={lecture}
                    show={true} // Always show in learning view
                    isLast={i === lectures.length - 1}
                    index={i}
                />
            ))}
        </div>
    );
};

const AccordionComponent = ({ course }: any) => {
    const [_course, set_course] = useState<any>(null)
    const [course_sections, set_course_sections] = useState<any[]>([])

    useEffect(() => {
        if (course && Array.isArray(course) && course[0]) {
            set_course(course[0])
        }
    }, [course])

    useEffect(() => {
        if (_course?.course_id) {
            get_course_sections(_course.course_id)
        }
    }, [_course])

    const get_course_sections = async (courseId: string) => {
        if (!courseId?.trim()) return
        try {
            const resp = await axios.get(`${baseUrl}/course-sections/by-course/${courseId}`, authorizationObj)
            if (resp?.data?.data?.length) {
                set_course_sections(resp.data.data)
            }
        } catch (error) {
            console.error("Error fetching course sections:", error)
            set_course_sections([])
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                const accordionBodies = document.querySelectorAll('.accordion-collapse');
                const accordionContents = document.querySelectorAll('.accordion-body');
    
                accordionBodies.forEach((body) => {
                    body.classList.remove('collapse');
                    body.classList.add('collapse', 'show');
                });
    
                accordionContents.forEach((content) => {
                    // Type assertion to HTMLElement
                    (content as HTMLElement).style.visibility = 'visible';
                    (content as HTMLElement).style.display = 'block';
                });
            }, 100);
        }
    }, [course_sections]);

    if (!course || !Array.isArray(course)) {
        return <div>Loading...</div>
    }

    return (
        <div className="container-fluid py-4">
            
            <div className="accordion" id="courseAccordion">
                {course_sections?.map((section, i) => (
                    <div className="accordion-item mb-3 shadow-sm" key={i}>
                        <h2 className="accordion-header">
                            <button
                                className="accordion-button"
                                type="button"
                                data-bs-toggle="collapse"
                                data-bs-target={`#section${i}`}
                                aria-expanded="true"
                                aria-controls={`section${i}`}
                            >
                                <span className="text-secondary me-2">UNIT </span>
                                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                    style={{ width: "24px", height: "24px" }}>
                                    <span className="text-secondary">{i + 1}</span>
                                </div>
                                <h3 className="mb-0 ms-3 text-dark">{section?.title}</h3>
                            </button>
                        </h2>

                        <div
                            id={`section${i}`}
                            className="accordion-collapse collapse show"
                            data-bs-parent="#courseAccordion"
                        >
                            <div className="accordion-body" style={{ borderLeft: "4px solid #40b024", borderRadius: "0.25rem" }}>
                                <div className="mt-3">
                                    <div className="row">
                                        <div className="col-12 col-md-6 mb-3 mb-md-0">
                                            <h6 className="mb-3 fw-semibold">Learning Objectives</h6>
                                            <p className="mb-2">After completing this unit, you will be able to:</p>
                                            <MuiMarkdown>{section?.description}</MuiMarkdown>
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <h6 className="mb-3 fw-semibold">Content</h6>
                                            <Lecture
                                                section_id={section?.section_id}
                                                singleCourse={course}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AccordionComponent; 