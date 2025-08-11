import React from 'react';
import { Button } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

interface QuizResult {
    questionId: string;
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    allAnswers?: { text: string; isCorrect: boolean }[];
}

interface QuizResultsProps {
    results: QuizResult[];
    onClose: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({ results, onClose }) => {
    if (!results || results.length === 0) {
        return (
            <div className="text-center p-4">
                <h3>No Results Available</h3>
                <p className="text-muted mb-4">There are no quiz results to display.</p>
                <Button 
                    variant="primary"
                    onClick={onClose}
                >
                    Close
                </Button>
            </div>
        );
    }

    const totalQuestions = results.length;
    const correctAnswers = results.filter(result => result.isCorrect).length;
    const score = (correctAnswers / totalQuestions) * 100;

    return (
        <div className="p-4">
            <div className="text-center mb-4">
                <h3 className="mb-3">Quiz Results</h3>
                <div className="d-flex justify-content-center align-items-center gap-3 mb-3">
                    <div className="p-3 rounded bg-light">
                        <h4 className="mb-0">{score.toFixed(1)}%</h4>
                        <small className="text-muted">Score</small>
                    </div>
                    <div className="p-3 rounded bg-light">
                        <h4 className="mb-0">{correctAnswers}/{totalQuestions}</h4>
                        <small className="text-muted">Correct Answers</small>
                    </div>
                </div>
            </div>

            <div className="results-list">
                {results.map((result, index) => (
                    <div 
                        key={result.questionId} 
                        className="p-3 mb-4 rounded border bg-white shadow-sm"
                    >
                        <div className="d-flex align-items-center mb-3">
                            <span className="me-2">
                                {result.isCorrect ? (
                                    <FaCheck className="text-success" size={20} />
                                ) : (
                                    <FaTimes className="text-danger" size={20} />
                                )}
                            </span>
                            <h5 className="mb-0">Question {index + 1}</h5>
                        </div>
                        <div className="ms-4">
                            <p className="mb-3 fw-bold">{result.questionText}</p>
                            
                            {/* All Options */}
                            <div className="options-list">
                                {result.allAnswers?.map((answer, ansIndex) => {
                                    const isSelected = answer.text === result.selectedAnswer;
                                    const isCorrect = answer.isCorrect;
                                    
                                    let optionClass = "p-2 mb-2 rounded border";
                                    if (isSelected && isCorrect) {
                                        optionClass += " bg-success bg-opacity-10 border-success";
                                    } else if (isSelected && !isCorrect) {
                                        optionClass += " bg-danger bg-opacity-10 border-danger";
                                    } else if (isCorrect) {
                                        optionClass += " bg-success bg-opacity-10 border-success";
                                    } else {
                                        optionClass += " bg-light";
                                    }

                                    return (
                                        <div key={ansIndex} className={optionClass}>
                                            <div className="d-flex align-items-center">
                                                {isSelected && (
                                                    <span className="me-2">
                                                        {isCorrect ? (
                                                            <FaCheck className="text-success" />
                                                        ) : (
                                                            <FaTimes className="text-danger" />
                                                        )}
                                                    </span>
                                                )}
                                                <span className={isCorrect ? "text-success" : isSelected ? "text-danger" : ""}>
                                                    {answer.text}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </div>
                ))}
            </div>

            <div className="text-center mt-4">
                <Button 
                    variant="primary"
                    onClick={onClose}
                >
                    Close
                </Button>
            </div>
        </div>
    );
};

export default QuizResults; 