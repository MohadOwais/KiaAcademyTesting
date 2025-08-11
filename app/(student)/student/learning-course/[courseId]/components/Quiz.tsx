import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';

interface QuizProps {
    quiz: any;
    onComplete: () => void;
}

const Quiz: React.FC<QuizProps> = ({ quiz, onComplete }) => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const resp = await axios.get(
                    `${baseUrl}/quiz-questions/by-quiz/${quiz.quiz_id}`,
                    authorizationObj
                );
                setQuestions(resp?.data?.data || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching quiz questions:', error);
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [quiz.quiz_id]);

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = () => {
        let correctAnswers = 0;
        questions.forEach(question => {
            if (answers[question.question_id] === question.correct_answer) {
                correctAnswers++;
            }
        });
        const finalScore = (correctAnswers / questions.length) * 100;
        setScore(finalScore);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (score !== null) {
        return (
            <div className="quiz-result p-4">
                <h3 className="mb-4">Quiz Results</h3>
                <div className="score-display mb-4">
                    <h4>Your Score: {score.toFixed(1)}%</h4>
                    <p className="text-muted">
                        {score >= 70 ? 'Congratulations! You passed!' : 'You need to score at least 70% to pass.'}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={onComplete}>
                    Return to Course
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="quiz-container p-4">
            <div className="progress mb-4">
                <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                        width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                    }}
                >
                    Question {currentQuestionIndex + 1} of {questions.length}
                </div>
            </div>

            <div className="question-container mb-4">
                <h4 className="mb-3">{currentQuestion?.question_text}</h4>
                <div className="options-list">
                    {currentQuestion?.options?.map((option: string, index: number) => (
                        <div
                            key={index}
                            className={`option-item p-3 mb-2 border rounded ${
                                answers[currentQuestion.question_id] === option
                                    ? 'bg-primary text-white'
                                    : 'bg-light'
                            }`}
                            onClick={() => handleAnswerSelect(currentQuestion.question_id, option)}
                            style={{ cursor: 'pointer' }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            </div>

            <div className="quiz-navigation d-flex justify-content-between">
                <button
                    className="btn btn-outline-primary"
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                >
                    Previous
                </button>
                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={!answers[currentQuestion.question_id]}
                    >
                        Submit Quiz
                    </button>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        disabled={!answers[currentQuestion.question_id]}
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
};

export default Quiz; 