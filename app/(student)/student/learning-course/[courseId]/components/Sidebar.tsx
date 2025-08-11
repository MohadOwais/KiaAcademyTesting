import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import { BsClock, BsCheckCircleFill, BsSearch, BsQuestionCircle } from "react-icons/bs";
import { Accordion, Spinner } from 'react-bootstrap';

interface SidebarProps {
    course: any;
    sections: any[];
    onLectureSelect: (lecture: any) => void;
    selectedLecture: any;
    quizzes: Record<string, any>;
    onQuizClick: (sectionId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    course,
    sections,
    onLectureSelect,
    selectedLecture,
    quizzes,
    onQuizClick
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (sections) {
            setLoading(false);
        }
    }, [sections]);

    const filteredSections = sections.map(section => ({
        ...section,
        lectures: section.lectures.filter((lecture: any) => 
            lecture.lecture_title.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }));

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <p className="text-danger">{error}</p>
            </div>
        );
    }

    return (
        <div className="course-sidebar-content h-100 d-flex flex-column">
            {/* Search Box */}
            <div className="p-3 border-bottom">
                <h5 className="mb-3">{course?.[0]?.course_title}</h5>
                <div className="input-group">
                    <span className="input-group-text border-end-0">
                        <BsSearch />
                    </span>
                    <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search lectures..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            {/* Course Content */}
            <div className="flex-grow-1 overflow-auto">
                <div className="accordion accordion-flush" id="accordionPanelsStayOpenExample">
                    {filteredSections.map((section, index) => (
                        <div className="accordion-item border-0" key={section.section_id}>
                            <h2 className="accordion-header">
                                <button 
                                    className="accordion-button fw-semibold"
                                    type="button"
                                    data-bs-toggle="collapse"
                                    data-bs-target={`#panelsStayOpen-${section.section_id}`}
                                    aria-expanded="true"
                                    aria-controls={`panelsStayOpen-${section.section_id}`}
                                >
                                    <span className="me-2">{index + 1}.</span>
                                    {section.title}
                                    {quizzes[section.section_id] && (
                                        <button
                                            className="btn btn-sm btn-outline-primary ms-2"
                                            onClick={() => onQuizClick(section.section_id)}
                                        >
                                            <BsQuestionCircle className="me-1" />
                                            Take Quiz
                                        </button>
                                    )}
                                </button>
                            </h2>
                            <div 
                                id={`panelsStayOpen-${section.section_id}`}
                                className="accordion-collapse collapse show"
                            >
                                <div className="accordion-body p-0">
                                    {section.lectures.map((lecture: any) => (
                                        <div 
                                            key={lecture.lecture_id}
                                            className={`d-flex align-items-center p-3 border-bottom lecture-item ${
                                                selectedLecture?.lecture_id === lecture.lecture_id ? 'active' : ''
                                            }`}
                                            onClick={() => onLectureSelect(lecture)}
                                        >
                                            <div className="flex-grow-1">
                                                <p className="mb-1">{lecture.lecture_title}</p>
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
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;