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
import { BsBook, BsArrowRightCircle, BsArrowLeftCircle} from 'react-icons/bs';
import SidebarMobile from "./components/SidebarMobile";
import { Button } from 'react-bootstrap';
import ReviewIcon from "@/public/images/Review.svg";
import Image from "next/image";
import Review from "./components/Review";
import toast, { Toaster } from 'react-hot-toast';
import Quiz from './components/Quiz';
import QuizResults from './components/QuizResults';

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
    const [currentQuiz, setCurrentQuiz] = useState<any>(null);
    const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [isTakingQuiz, setIsTakingQuiz] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [resources, setResources] = useState<any[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);
    const [quizResults, setQuizResults] = useState<{
        questionId: string;
        selectedAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        questionText: string;
    }[]>([]);

    useEffect(() => {
        if (!currentUser?.user_id) {
            router.push('/auth/signin');
            return;
        }
        getCourse();
    }, [courseId, currentUser?.user_id]);

    useEffect(() => {
        if (courseId && currentUser?.user_id) {
            const fetchReviewStatus = async () => {
                try {
                    const response = await axios.get(`${baseUrl}/course-reviews/${courseId}`, {
                        ...authorizationObj,
                    });
                    const reviews = Array.isArray(response.data)
                        ? response.data
                        : Array.isArray(response.data.data)
                            ? response.data.data
                            : [];
                    const userReview = reviews.find((review: any) => String(review.student_id) === String(currentUser.user_id));
                    if (userReview) {
                        setHasReviewed(true);
                        setExistingReview(userReview);
                    } else {
                        setHasReviewed(false);
                        setExistingReview(null);
                    }
                } catch (error) {
                    setHasReviewed(false);
                    setExistingReview(null);
                }
            };
            fetchReviewStatus();
        }
    }, [courseId, currentUser?.user_id]);

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
                const hasAccess =
                    courseData.is_enrolled ||
                    courseData.instructor_id === currentUser?.user_id ||
                    currentUser?.role_id === "1" ||
                    (currentUser?.role_id === "4" && courseData.institute_id) ||
                    (currentUser?.role_id === "5" && courseData.institute_id);

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

        sections.forEach((section, sIndex) => {
            section.lectures?.forEach((lecture: any, lIndex: number) => {
                if (lecture.lecture_id === selectedLecture.lecture_id) {
                    currentSectionIndex = sIndex;
                    currentLectureIndex = lIndex;
                }
            });
        });

        if (currentSectionIndex !== -1 && currentLectureIndex !== -1) {
            const currentSection = sections[currentSectionIndex];

            if (currentLectureIndex < currentSection.lectures.length - 1) {
                nextLecture = currentSection.lectures[currentLectureIndex + 1];
            }
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
            if (resp.status === 200) {
                return resp?.data?.data;
            }
            return [];
        } catch (error) {
            console.error('Error fetching lectures:', error);
            return [];
        }
    };
    
    const getQuiz = async (section_id: string) => {
        if (!section_id || section_id?.trim() === "") {
            toast.error('Invalid section ID');
            return null;
        }
        try {
            console.log('Fetching quiz for section:', section_id);
            const resp = await axios.get(`${baseUrl}/quizzes/${section_id}`, authorizationObj);
            console.log('Quiz API response:', resp.data);
            
            if (!resp?.data?.data || !Array.isArray(resp.data.data) || resp.data.data.length === 0) {
                console.log('No quiz data found in response');
                return null;
            }

            // Get the first quiz from the array
            const quizData = resp.data.data[0];
            console.log('Selected quiz data:', quizData);
            setCurrentQuiz(quizData);
            return quizData;
        } catch (error: any) {
            console.error('Error fetching quiz:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                toast.error(error.response.data.message || 'Error fetching quiz');
            } else {
                toast.error('Error fetching quiz. Please try again.');
            }
            return null;
        }
    };

    // Add useEffect to fetch questions when currentQuiz changes
    useEffect(() => {
        const fetchQuizQuestions = async () => {
            if (currentQuiz?.quiz_id) {
                try {
                    console.log('Fetching questions for quiz:', currentQuiz.quiz_id);
                    const questions = await getQuizQuestions(currentQuiz.quiz_id);
                    if (questions) {
                        setQuizQuestions(questions);
                    }
                } catch (error) {
                    console.error('Error fetching quiz questions:', error);
                }
            }
        };

        fetchQuizQuestions();
    }, [currentQuiz]);

    const getQuizQuestions = async (quiz_id: string) => {
        if (!quiz_id || quiz_id?.trim() === "") {
            console.error('Invalid quiz ID:', quiz_id);
            toast.error('Invalid quiz ID');
            return null;
        }
        try {
            console.log('Fetching questions for quiz:', quiz_id);
            const resp = await axios.get(`${baseUrl}/questions/${quiz_id}`, authorizationObj);
            console.log('Questions API response:', resp.data);
            
            if (!resp?.data?.data) {
                console.log('No questions data found in response');
                return null;
            }
            
            return resp.data.data;
        } catch (error: any) {
            console.error('Error fetching questions:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                toast.error(error.response.data.message || 'Error fetching questions');
            } else {
                toast.error('Error fetching questions. Please try again.');
            }
            return null;
        }
    };

    const getCorrectAnswers = (questions: any) => {
        return questions.map((question: any) => {
            const parsedAnswers = JSON.parse(question.answers);
            const correctAnswers = parsedAnswers.filter((answer: any) => answer.isCorrect);
            return {
                question_id: question.question_id,
                correctAnswers: correctAnswers[0].text
            };
        });
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

    const toggleSidebar = () => {
        setIsSidebarCollapsed(prev => !prev);
    };

    // Take Quiz
    const handleTakeQuiz = async (sectionId: string) => {
        try {
            console.log('Starting quiz for section:', sectionId);
            setLoading(true);
            const quiz = await getQuiz(sectionId);
            console.log('Quiz data:', quiz);
            
            if (quiz) {
                const questions = await getQuizQuestions(quiz.quiz_id);
                console.log('Quiz questions:', questions);
                
                if (questions && questions.length > 0) {
                    setCurrentQuiz(quiz);
                    setQuizQuestions(questions);
                    setSelectedAnswers({});
                    setQuizScore(null);
                    setIsTakingQuiz(true);
                    setSelectedLecture(null);
                    console.log('Quiz state updated:', { isTakingQuiz: true, questionsCount: questions.length });
                } else {
                    console.log('No questions found for quiz');
                    toast.error('No questions available for this quiz.');
                }
            } else {
                console.log('No quiz found for section');
                toast.error('No quiz available for this section.');
            }
        } catch (error) {
            console.error('Error loading quiz:', error);
            toast.error('Error loading quiz. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmitQuiz = async (answers: { 
        questionId: string;
        questionText: string;
        selectedAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        allAnswers: any[];
    }[]) => {
        try {
            const totalAnswers = answers.length;
            const trueAnswers = answers.filter(answer => answer.isCorrect).length;
            const falseAnswers = totalAnswers - trueAnswers;
            const percentage = ((trueAnswers / totalAnswers) * 100).toFixed(2);

            const formData = new FormData();
            formData.append('course_id', course?.[0]?.course_id || '');
            formData.append('student_id', currentUser?.user_id || '');
            formData.append('quiz_id', currentQuiz?.quiz_id || '');
            formData.append('quiz_resources', JSON.stringify({
                total_answers: totalAnswers,
                true_answers: trueAnswers,
                false_answers: falseAnswers,
                percentage: percentage
            }));

            await axios.post(`${baseUrl}/quiz-results/create`, formData, {
                ...authorizationObj,
                headers: {
                    ...authorizationObj.headers,
                    'Content-Type': 'multipart/form-data',
                },
            });

            setQuizScore((trueAnswers / totalAnswers) * 100);
            setQuizResults(answers);
            toast.success('Quiz submitted successfully!');
        } catch (error: any) {
            console.error('Error submitting quiz:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                toast.error(error.response.data.message || 'Error submitting quiz');
            } else {
                toast.error('Error submitting quiz. Please try again.');
            }
            throw error;
        }
    };

    const handleExitQuiz = () => {
        setIsTakingQuiz(false);
        setCurrentQuiz(null);
        setQuizQuestions([]);
        setSelectedAnswers({});
        setQuizScore(null);
        setQuizResults([]);
    };

    // Get Resources
    const getResources = async (lectureId: string) => {
        try {
            const resp = await axios.get(`${baseUrl}/recorded-lecture-resources/${lectureId}`, authorizationObj);
            if (resp?.data?.data) {
                setResources(resp.data.data);
            } else {
                setResources([]);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
            setResources([]);
        }
    };

    useEffect(() => {
        if (selectedLecture?.lecture_id) {
            setLoadingResources(true);
            getResources(selectedLecture.lecture_id).finally(() => {
                setLoadingResources(false);
            });
        }
    }, [selectedLecture?.lecture_id]);

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
            <Toaster position="top-center" reverseOrder={false} />
            <div className="flex-grow-1 bg-light">
                <div className="container-fluid px-0 px-lg-3 mb-5">
                    <div className="row g-0">
                        <div className="col-2 col-lg-1 d-flex flex-column justify-content-between align-items-center shadow-sm rounded-3 position-relative" 
                            style={{ height: '90vh', minHeight: '80vh' }}>
                            <div className="d-flex flex-column gap-3 align-items-center">
                                <BsBook size={40} onClick={toggleSidebar} style={{ cursor: 'pointer', backgroundColor: 'white', padding: '10px', marginTop: '10px' }} />

                                {!hasReviewed ? (
                                    <Button
                                        className="btn"
                                        onClick={() => setShowReviewModal(true)}
                                    >
                                        <Image src={ReviewIcon} width="20" alt="Review-icon" />
                                    </Button>
                                ) : (
                                    <Button
                                        className="btn btn-success"
                                        onClick={() => setShowReviewModal(true)}
                                    >
                                        <Image src={ReviewIcon} width="20" alt="Review-icon" />
                                    </Button>
                                )}
                            </div>

                            <div className="d-flex justify-content-center align-items-center">
                                <button
                                    className="btn btn-link btn-primary p-0 mt-3 d-none d-lg-block"
                                    onClick={toggleSidebar}
                                    aria-label={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
                                    style={{ cursor: 'pointer', position: 'absolute', bottom: '10px'}}
                                >
                                    {isSidebarCollapsed ? (
                                        <BsArrowRightCircle size={30} />
                                    ) : (
                                        <BsArrowLeftCircle size={30} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className={`col-10 col-lg-3 ${isSidebarCollapsed ? 'd-none' : ''}`}>
                            <div className="course-sidebar d-none d-md-block">
                                <div className="h-100 border rounded-3">
                                    <div className="sidebar-content">
                                        <Sidebar
                                            course={course}
                                            sections={sections}
                                            onLectureSelect={setSelectedLecture}
                                            selectedLecture={selectedLecture}
                                            onTakeQuiz={handleTakeQuiz}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar Mobile */}
                            <div className="d-md-none">
                                <div className="h-100 border rounded-3">
                                    <SidebarMobile
                                        course={course}
                                        sections={sections}
                                        onLectureSelect={setSelectedLecture}
                                        selectedLecture={selectedLecture}
                                        onTakeQuiz={handleTakeQuiz}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className={`col-12 ${isSidebarCollapsed ? 'col-lg-11' : 'col-lg-8'}`}>
                            <div className="bg-white rounded-3 p-3 p-md-4" style={{ height: '90vh', minHeight: '80vh', overflow: 'auto' }}>
                                {loading ? (
                                    <div className="d-flex justify-content-center align-items-center h-100">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                ) : isTakingQuiz ? (
                                    <div className="quiz-container">
                                        {loading ? (
                                            <div className="d-flex justify-content-center align-items-center h-100">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading quiz...</span>
                                                </div>
                                            </div>
                                        ) : quizScore !== null ? (
                                            <QuizResults 
                                                results={quizResults}
                                                onClose={handleExitQuiz} 
                                            />
                                        ) : (
                                            <Quiz
                                                quiz={currentQuiz}
                                                questions={quizQuestions}
                                                onExit={handleExitQuiz}
                                                onSubmit={handleSubmitQuiz}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <ContentViewer
                                        lecture={selectedLecture}
                                        course={course}
                                        sections={sections}
                                        onNextLecture={handleNextLecture}
                                        onTakeQuiz={handleTakeQuiz}
                                        resources={resources}
                                        loadingResources={loadingResources}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Review Modal */}
            {showReviewModal && (
                <Review courseId={courseId} show={showReviewModal} onClose={() => setShowReviewModal(false)} existingReview={existingReview} />
            )}
        </div>
    );
};

export default Main;