import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import { BsClock, BsCheckCircleFill, BsSearch } from "react-icons/bs";
import { Accordion, Spinner } from 'react-bootstrap';

interface SidebarMobileProps {
    course: any;
    sections: any[];
    onLectureSelect: (lecture: any) => void;
    selectedLecture: any;
    onTakeQuiz: (sectionId: string) => Promise<void>;
}

const SidebarMobile: React.FC<SidebarMobileProps> = ({ course, sections, onLectureSelect, selectedLecture, onTakeQuiz }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (sections) {
            setLoading(false);
        }
    }, [sections]);

    return (
        <div className="sidebar-mobile" style={{ height: '90vh', minHeight: '80vh' }}>
            <div className="course-info p-3 border-bottom">
                <h5 className="mb-3">{course?.[0]?.course_title}</h5>
            </div>
            <div className="sections overflow-auto" style={{ height: 'calc(90vh - 80px)' }}>
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : error ? (
                    <div className="text-center p-4">
                        <p className="text-danger">{error}</p>
                    </div>
                ) : (
                    sections.map((section, index) => (
                        <div key={section.section_id} className="section mb-3">
                            <div className="section-header p-3 bg-light">
                                <h6 className="mb-0">Section {index + 1}: {section.title}</h6>
                            </div>
                            <div className="lectures">
                                {section.lectures?.map((lecture: any) => (
                                    <div
                                        key={lecture.lecture_id}
                                        className={`lecture p-3 ${selectedLecture?.lecture_id === lecture.lecture_id ? 'active' : ''}`}
                                        style={{
                                            backgroundColor: selectedLecture?.lecture_id === lecture.lecture_id ? 'rgba(191, 243, 255, 0.3)' : 'transparent',
                                            color: '#0070f2',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s ease',
                                            borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
                                        }}
                                        onClick={() => onLectureSelect(lecture)}
                                    >
                                        <div className="d-flex align-items-center">
                                            <div className="flex-grow-1">
                                                <p className="mb-1" style={{fontSize: '1rem'}}>{lecture.lecture_title}</p>
                                                {lecture.duration && (
                                                    <small className="text-muted d-flex align-items-center">
                                                        <BsClock className="me-1" />
                                                        {lecture.duration}
                                                    </small>
                                                )}
                                            </div>
                                            {lecture.completed && (
                                                <BsCheckCircleFill className="text-success ms-2" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={() => onTakeQuiz(section.section_id)}
                                >
                                    Take Quiz
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SidebarMobile;