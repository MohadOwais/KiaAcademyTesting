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
import { BsBook, BsArrowRightCircle, BsArrowLeftCircle } from 'react-icons/bs';
import SidebarMobile from "./components/SidebarMobile";
import { Modal, Button, Form } from 'react-bootstrap';

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
    const [selectedAnswers, setSelectedAnswers] = useState<{[key: string]: string}>({});
    const [quizScore, setQuizScore] = useState<number | null>(null);
    const [isTakingQuiz, setIsTakingQuiz] = useState(false);

    useEffect(() => {
        if (!currentUser?.user_id) {
            router.push('/auth/signin');
            return;
        }
        getCourse();
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
            // console.log("sectionId", sectionId);
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
        if (!section_id || section_id?.trim() === "") return;
        try {
            const resp = await axios.get(`${baseUrl}/quizzes/${section_id}`, authorizationObj);
            if (resp?.data?.data) {
                return resp.data.data;
            }
        } catch (error) {
            return null;
        }
    };
    const getQuizQuestions = async (quiz_id: string) => {
        if (!quiz_id || quiz_id?.trim() === "") return;
        try {
            const resp = await axios.get(`${baseUrl}/questions/${quiz_id}`, authorizationObj);
            if (resp?.data?.data) {
                return resp.data.data;
            }
        } catch (error) {
            return null;
        }
    }
    const getCorrectAnswers = (questions:any) => {
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

    const handleTakeQuiz = async (sectionId: string) => {
        try {
            const quiz = await getQuiz(sectionId);
            if (quiz) {
                const questions = await getQuizQuestions(quiz.quiz_id);
                setCurrentQuiz(quiz);
                setQuizQuestions(questions);
                setSelectedAnswers({});
                setQuizScore(null);
                setIsTakingQuiz(true);
                setSelectedLecture(null);
            }
        } catch (error) {
            console.error('Error loading quiz:', error);
        }
    };

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const calculateScore = async () => {
        let correctAnswers = 0;
        const correctAnswersArray = getCorrectAnswers(quizQuestions);
        quizQuestions.forEach(question => {
            // const correctAnswer = JSON.parse(question.answers).find((a: any) => a.is_correct);
            if (selectedAnswers[question.question_id] === correctAnswersArray.find((q: any) => q.question_id === question.question_id)?.correctAnswers) {
                correctAnswers++;
            }
        });
        const totalAnswers = quizQuestions.length;
        const trueAnswers = correctAnswers;
        const falseAnswers = totalAnswers - trueAnswers;
        const percentage = ((trueAnswers / totalAnswers) * 100).toFixed(2);

        // Prepare the quiz result data
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

        try {
            // Save the quiz result to the database
            await axios.post(`${baseUrl}/quiz-results/create`, formData, {
            ...authorizationObj,
            headers: {
                ...authorizationObj.headers,
                'Content-Type': 'multipart/form-data',
            },
            });
            console.log("Quiz result saved successfully.");
        } catch (error) {
            console.error("Error saving quiz result:", error);
        }
        // console.log(quizResult);
        
        // console.log(correctAnswersArray);
        const score = (correctAnswers / quizQuestions.length) * 100;
        setQuizScore(score);
    };

    const handleSubmitQuiz = async () => {
        calculateScore();
        // Calculate quiz result details
    };

    const handleExitQuiz = () => {
        setIsTakingQuiz(false);
        setCurrentQuiz(null);
        setQuizQuestions([]);
        setSelectedAnswers({});
        setQuizScore(null);
    };

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
                    <div className="row">
                        <div className="col-2 col-lg-1 d-flex flex-column justify-content-between align-items-center shadow-sm rounded-3" style={{ position: 'relative', zIndex: 1000, maxHeight: '80vh' }}>
                            <BsBook size={40} onClick={toggleSidebar} style={{ cursor: 'pointer', backgroundColor: 'white', padding: '10px', marginTop: '10px' }} />
                            <div className="d-flex justify-content-center align-items-center">
                                <button
                                    className="btn btn-link btn-primary p-0 mt-3 d-none d-lg-block"
                                    onClick={toggleSidebar}
                                    aria-label={isSidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
                                    style={{ position: 'absolute', bottom: '10px', right: '40px' }}
                                >
                                    {isSidebarCollapsed ? (
                                        <BsArrowRightCircle size={30} />
                                    ) : (
                                        <BsArrowLeftCircle size={30} />
                                    )}
                                </button>
                            </div>
                        </div>

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

                        <div className={`col-12 ${isSidebarCollapsed ? 'col-lg-11' : 'col-lg-8'}`}>
                            <div className="bg-white rounded-3 p-3 p-md-4">
                                {isTakingQuiz ? (
                                    <div className="quiz-container">
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            
                                        </div>
                                        {quizScore !== null ? (
                                            <div className="text-center">
                                                <h3>Quiz Results</h3>
                                                <p>Your score: {quizScore.toFixed(1)}%</p>
                                                <button className="btn btn-primary" onClick={() => {
                                                    handleExitQuiz();
                                                    // handleNextLecture();
                                                }}>
                                                    Close
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {quizQuestions && quizQuestions.length > 0 && (
                                                    <div>
                                                        <h3>{currentQuiz?.title || 'Quiz'}</h3>
                                                        {quizQuestions.map((question, questionIndex) => (
                                                            <div key={questionIndex} className="mb-4 p-3 shadow-sm rounded border bg-white">
                                                                <p>{question.question_text}</p>
                                                                <div className="form-group">
                                                                    {JSON.parse(question.answers).map((answer: any, index: number) => (
                                                                        <div key={index} className="form-check mb-2">
                                                                            <input
                                                                                className="form-check-input"
                                                                                type="radio"
                                                                                id={`answer-${questionIndex}-${index}`}
                                                                                name={`answer-${questionIndex}`}
                                                                                checked={selectedAnswers[question.question_id] === answer.text}
                                                                                onChange={() => handleAnswerSelect(question.question_id, answer.text)}
                                                                            />
                                                                            <label className="form-check-label" htmlFor={`answer-${questionIndex}-${index}`}>
                                                                                {answer.text}
                                                                            </label>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="text-center mt-4">
                                                            <button className="btn btn-success" onClick={handleSubmitQuiz}>
                                                                Submit Quiz
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <ContentViewer
                                        lecture={selectedLecture}
                                        course={course}
                                        sections={sections}
                                        onNextLecture={handleNextLecture}
                                        onTakeQuiz={handleTakeQuiz}
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