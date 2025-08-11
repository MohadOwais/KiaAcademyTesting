import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import toast from 'react-hot-toast';

interface Answer {
    text: string;
    isCorrect: boolean;
}

interface Question {
    question_id: string;
    quiz_id: string;
    question_text: string;
    answers: string; // JSON string of Answer[]
    description: string;
}

interface QuizProps {
    quiz: any;
    questions: Question[];
    onExit: () => void;
    onSubmit: (answers: { 
        questionId: string;
        questionText: string;
        selectedAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        allAnswers: Answer[];
    }[]) => Promise<void>;
}

const Quiz: React.FC<QuizProps> = ({ quiz, questions, onExit, onSubmit }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAnswerSelect = (questionId: string, answer: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            
            // Prepare detailed answers with correct/incorrect information
            const detailedAnswers = questions.map(question => {
                const selectedAnswer = selectedAnswers[question.question_id] || '';
                const answers = JSON.parse(question.answers) as Answer[];
                const correctAnswer = answers.find(ans => ans.isCorrect)?.text || '';
                
                return {
                    questionId: question.question_id,
                    questionText: question.question_text,
                    selectedAnswer: selectedAnswer,
                    correctAnswer: correctAnswer,
                    isCorrect: selectedAnswer === correctAnswer,
                    allAnswers: answers // Include all answers in the results
                };
            });

            await onSubmit(detailedAnswers);
        } catch (error: any) {
            console.error('Error submitting quiz:', error);
            toast.error('Error submitting quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!questions || questions.length === 0) {
        return (
            <div className="text-center p-4">
                <p>No questions available for this quiz.</p>
                <Button 
                    variant="primary"
                    onClick={onExit}
                >
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <div className="quiz-container">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>{quiz?.quiz_title || 'Quiz'}</h3>
                <Button 
                    variant="outline-danger"
                    onClick={onExit}
                >
                    Exit Quiz
                </Button>
            </div>

            <div>
                {questions.map((question, questionIndex) => {
                    try {
                        const answers = JSON.parse(question.answers) as Answer[];
                        return (
                            <div key={questionIndex} className="mb-4 p-3 shadow-sm rounded border bg-white">
                                <p className="h5 mb-3">{question.question_text}</p>
                                {question.description && (
                                    <p className="text-muted mb-3"><small>{question.description}</small></p>
                                )}
                                <div className="form-group">
                                    {answers.map((answer, index) => (
                                        <div key={index} className="border border-1 border-opacity-100 rounded mb-3 p-2">                              
                                            <div className="form-check">
                                                <input
                                                    type="radio"
                                                    id={`answer-${questionIndex}-${index}`}
                                                    name={`answer-${questionIndex}`}
                                                    className="form-check-input"
                                                    checked={selectedAnswers[question.question_id] === answer.text}
                                                    onChange={() => handleAnswerSelect(question.question_id, answer.text)}
                                                />
                                                <label
                                                    className="form-check-label ms-2"
                                                    htmlFor={`answer-${questionIndex}-${index}`}
                                                >
                                                    {answer.text}
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    } catch (error) {
                        console.error('Error parsing answers for question:', questionIndex, error);
                        return (
                            <div key={questionIndex} className="mb-4 p-3 shadow-sm rounded border bg-white">
                                <p className="h5 mb-3 text-danger">Error loading question {questionIndex + 1}</p>
                            </div>
                        );
                    }
                })}
                <div className="text-center mt-4">
                    <Button 
                        variant="success"
                        size="lg"
                        onClick={handleSubmit}
                        disabled={Object.keys(selectedAnswers).length !== questions.length || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                    <p className="text-muted mt-2">
                        {Object.keys(selectedAnswers).length} of {questions.length} questions answered
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Quiz; 