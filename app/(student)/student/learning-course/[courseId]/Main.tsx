'use client';

import "./Main.css";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import Header from '@/app/components/header/Header';
import Footer from '@/app/components/footer/Footer';
import Sidebar from './components/Sidebar';
import ContentViewer from './components/ContentViewer';
import { BsArrowLeftCircle, BsArrowRightCircle, BsQuestionCircle } from 'react-icons/bs';
import Quiz from './components/Quiz';

interface MainProps {
    courseId: string;
}

const Main: React.FC<MainProps> = ({ courseId }) => {
    const router = useRouter();
    const currentUser = useSelector((state: any) => state?.user);
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedLecture, setSelectedLecture] = useState<any>(null);
    const [sections, setSections] = useState<any[]>([]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [quizzes, setQuizzes] = useState<Record<string, any>>({});
    const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
    const [showQuiz, setShowQuiz] = useState(false);

    useEffect(() => {
        // Check if we have user data in Redux store
        if (!currentUser?.user_id) {
            router.push('/auth/signin');
            return;
        }
        getCourse();
    }, [courseId, currentUser?.user_id]); // Changed dependency to user_id

    const getCourse = async () => {
        if (!courseId) return;

        try {
            setLoading(true);
            const resp = await axios.get(
                `${baseUrl}/courses/${courseId}/${currentUser?.user_id}`,
                authorizationObj
            );

            if (resp?.data?.data?.[0]) {
                const courseData = resp.data.data[0];
                // Check if user is enrolled or has special access
                const hasAccess =
                    courseData.is_enrolled ||
                    courseData.instructor_id === currentUser?.user_id ||
                    currentUser?.role_id === "1" || // Admin
                    (currentUser?.role_id === "4" && courseData.institute_id) || // Institute role
                    (currentUser?.role_id === "5" && courseData.institute_id); // Institute role

                if (!hasAccess) {
                    router.push(`/current-courses/${courseId}`);
                    return;
                }
                setCourse(resp.data.data);
            } else {
                router.push('/current-courses');
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            router.push('/current-courses');
        } finally {
            setLoading(false);
        }
    };

    const handleNextLecture = () => {
        if (!selectedLecture || !sections.length) return;

        let nextLecture = null;
        let currentSectionIndex = -1;
        let currentLectureIndex = -1;

        // Find current section and lecture indices
        sections.forEach((section, sIndex) => {
            section.lectures?.forEach((lecture: any, lIndex: number) => {
                if (lecture.lecture_id === selectedLecture.lecture_id) {
                    currentSectionIndex = sIndex;
                    currentLectureIndex = lIndex;
                }
            });
        });

        // Find next lecture
        if (currentSectionIndex !== -1 && currentLectureIndex !== -1) {
            const currentSection = sections[currentSectionIndex];

            // Check if there's a next lecture in current section
            if (currentLectureIndex < currentSection.lectures.length - 1) {
                nextLecture = currentSection.lectures[currentLectureIndex + 1];
            }
            // Check next section if exists
            else if (currentSectionIndex < sections.length - 1) {
                const nextSection = sections[currentSectionIndex + 1];
                if (nextSection.lectures?.length > 0) {
                    nextLecture = nextSection.lectures[0];
                }
            }
        }

        if (nextLecture) {
            setSelectedLecture(nextLecture);
        }
    };

    useEffect(() => {
        if (course?.[0]?.course_id) {
            getSections(course[0].course_id);
        }
    }, [course]);

    const getSections = async (courseId: string) => {
        try {
            const resp = await axios.get(
                `${baseUrl}/course-sections/by-course/${courseId}`,
                authorizationObj
            );
            if (resp?.data?.data) {
                const sectionsWithLectures = await Promise.all(
                    resp.data.data.map(async (section: any) => {
                        const lectures = await getLectures(section.section_id);
                        return { ...section, lectures };
                    })
                );
                setSections(sectionsWithLectures);
                // Auto-select first lecture if none selected
                if (!selectedLecture && sectionsWithLectures[0]?.lectures?.[0]) {
                    setSelectedLecture(sectionsWithLectures[0].lectures[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching sections:', error);
        }
    };

    const getLectures = async (sectionId: string) => {
        try {
            const resp = await axios.get(
                `${baseUrl}/lectures/by-section/${sectionId}`,
                authorizationObj
            );
            return resp?.data?.data || [];
        } catch (error) {
            console.error('Error fetching lectures:', error);
            return [];
        }
    };

    const getQuiz = async (sectionId: string) => {
        try {
            const resp = await axios.get(`${baseUrl}/quizzes/by-section/${sectionId}`, authorizationObj);
            if (resp?.data?.data?.[0]) {
                setQuizzes(prev => ({
                    ...prev,
                    [sectionId]: resp.data.data[0]
                }));
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
        }
    };

    const handleQuizClick = (sectionId: string) => {
        const quiz = quizzes[sectionId];
        if (quiz) {
            setSelectedQuiz(quiz);
            setShowQuiz(true);
        }
    };

    useEffect(() => {
        if (sections.length > 0) {
            sections.forEach(section => {
                getQuiz(section.section_id);
            });
        }
    }, [sections]);

    const getQuizQuestions = async (quizId: string) => {
        try {
            const resp = await axios.get(`${baseUrl}/quiz-questions/by-quiz/${quizId}`, authorizationObj);
            return resp?.data?.data || [];
        } catch (error) {
            console.error('Error fetching quiz questions:', error);
            return [];
        }
    };
    

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!isSidebarCollapsed && window.innerWidth < 992) {
                document.body.classList.add('sidebar-open');
            } else {
                document.body.classList.remove('sidebar-open');
            }
        }

        return () => {
            document.body.classList.remove('sidebar-open');
        };
    }, [isSidebarCollapsed]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }
    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <div className="flex-grow-1 bg-light">
                <div className="container px-0 px-lg-3 mb-5">
                    <div className="d-flex position-relative h-100">
                        {/* Sidebar */}
                        <div className={`course-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                            <div className="bg-white h-100 border rounded-3">
                                <div className="sidebar-content">
                                    <Sidebar 
                                        course={course} 
                                        sections={sections}
                                        onLectureSelect={setSelectedLecture}
                                        selectedLecture={selectedLecture}
                                        quizzes={quizzes}
                                        onQuizClick={handleQuizClick}
                                    />
                                </div>
                            </div>
                        </div>
                        {/* Main Content */}
                        <div className="course-main">
                            {/* Sidebar Toggle Button */}
                            <button 
                                className="sidebar-toggle-btn d-flex align-items-center"
                                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                            >
                                {isSidebarCollapsed ? (
                                    <div className="d-flex align-items-center">
                                        <BsArrowRightCircle className="me-2" />
                                        <span className="d-none d-sm-inline">Show Menu</span>
                                    </div>
                                ) : (
                                    <div className="d-flex align-items-center">
                                        <BsArrowLeftCircle className="me-2" />
                                        <span className="d-none d-sm-inline">Hide Menu</span>
                                    </div>
                                )}
                            </button>

                            <div className="bg-white rounded-3 p-3 p-md-4">
                                {showQuiz ? (
                                    <div className="quiz-container">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <h3>Quiz: {selectedQuiz?.title}</h3>
                                            <button 
                                                className="btn btn-outline-primary"
                                                onClick={() => setShowQuiz(false)}
                                            >
                                                Back to Content
                                            </button>
                                        </div>
                                        <Quiz 
                                            quiz={selectedQuiz}
                                            onComplete={() => setShowQuiz(false)}
                                        />
                                    </div>
                                ) : (
                                    <ContentViewer 
                                        lecture={selectedLecture}
                                        course={course}
                                        sections={sections}
                                        onNextLecture={handleNextLecture}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Main; 