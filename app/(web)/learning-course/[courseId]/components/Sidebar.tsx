import React, { useState, useEffect } from 'react';
import { BsClock, BsCheckCircleFill } from "react-icons/bs";
import { Spinner } from 'react-bootstrap';

interface SidebarProps {
    course: any;
    sections: any[];
    onLectureSelect: (lecture: any) => void;
    selectedLecture: any;
    onTakeQuiz: (sectionId: string) => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ course, sections, onLectureSelect, selectedLecture, onTakeQuiz }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // if sections is not empty, set loading to false
    useEffect(() => {
        if (sections && sections.length > 0) {
            setLoading(false);
        }
    }, [sections]);

    const handleQuizClick = async (sectionId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        try {
            await onTakeQuiz(sectionId);
        } catch (error) {
            console.error('Error taking quiz:', error);
        }
    };

    return (
        <div className="course-sidebar-content h-100 d-flex flex-column" style={{ height: '90vh', minHeight: '80vh' }}>
            {/* Course Content */}
            <div className="flex-grow-1 overflow-auto px-3 py-2">
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center h-100">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : error ? (
                    <div className="text-center p-4">
                        <p className="text-danger">{error}</p>
                    </div>
                ) : (
                    <div className="accordion accordion-flush">
                        {sections.map((section, index) => (
                            <div className="accordion-item border-0" key={section.section_id}>
                                <h2 className="accordion-header" style={{fontSize: '1.125rem'}}>
                                    <button
                                        className="accordion-button fw-semibold"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#panelsStayOpen-${section.section_id}`}
                                        aria-expanded="true"
                                        aria-controls={`panelsStayOpen-${section.section_id}`}
                                    >
                                        {section.title}
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
                                                className={`d-flex align-items-center p-3 lecture-item position-relative ${selectedLecture?.lecture_id === lecture.lecture_id ? 'active' : ''}`}
                                                style={{
                                                    backgroundColor: selectedLecture?.lecture_id === lecture.lecture_id ? 'rgba(191, 243, 255, 0.3)' : 'transparent',
                                                    color: '#0070f2',
                                                    cursor: 'pointer',
                                                    transition: 'background-color 0.2s ease'
                                                }}
                                                onClick={() => onLectureSelect(lecture)}
                                            >
                                                <div
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: 0, 
                                                        left: '10%', 
                                                        width: '80%', 
                                                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                                                    }}
                                                />

                                                <div className="flex-grow-1 border-0">
                                                    <p className="mb-1 ms-2" style={{fontSize: '1rem'}}>{lecture.lecture_title}</p>
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
                                        <div className="p-3">
                                            <button
                                                className="btn btn-primary w-100"
                                                onClick={(e) => handleQuizClick(section.section_id, e)}
                                            >
                                                Take Quiz
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;