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
        <div className="sidebar-mobile">
            <div className="course-info p-3">
                <h5 className="mb-3">{course?.[0]?.course_title}</h5>
            </div>
            <div className="sections">
                {sections.map((section, index) => (
                    <div key={section.section_id} className="section mb-3">
                        <div className="section-header p-3 bg-light">
                            <h6 className="mb-0">Section {index + 1}: {section.title}</h6>
                        </div>
                        <div className="lectures">
                            {section.lectures?.map((lecture: any) => (
                                <div
                                    key={lecture.lecture_id}
                                    className={`lecture p-3 ${selectedLecture?.lecture_id === lecture.lecture_id ? 'active' : ''}`}
                                    onClick={() => onLectureSelect(lecture)}
                                >
                                    {lecture.lecture_title}
                                </div>
                            ))}
                        </div>
                        {/* Add Quiz Button at the end of each section */}
                        <div className="p-3">
                            <button
                                className="btn btn-primary w-100"
                                onClick={() => onTakeQuiz(section.section_id)}
                            >
                                Take Quiz
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SidebarMobile;