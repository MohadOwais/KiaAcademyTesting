'use client';

import React, { useState, useRef } from 'react';
import { BsPlayCircle, BsArrowRight, BsCheckCircleFill } from 'react-icons/bs';
import { courseVideoPath, baseUrl, authorizationObj } from '@/app/utils/core';
import axios from 'axios';

interface ContentViewerProps {
    lecture: any;
    course: any;
    sections: any[];
    onNextLecture?: () => void;
}

const ContentViewer: React.FC<ContentViewerProps> = ({ lecture, course, sections, onNextLecture }) => {
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const percentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
            setProgress(Math.round(percentage));
        }
    };

    const handleVideoEnd = async () => {
        try {
            await axios.post(
                `${baseUrl}/lectures/complete/${lecture.lecture_id}`, 
                {}, 
                authorizationObj
            );
        } catch (error) {
            console.error('Error marking lecture as complete:', error);
        }
    };

    if (!lecture) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <h5 className="text-muted">Select a lecture to begin</h5>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            {/* Title */}
            <div className="row mb-4">
                <div className="col-12">
                    <h4>{lecture.lecture_title}</h4>
                </div>
            </div>

            {/* Video Player */}
            <div className="row">
                <div className="col-12">
                    {lecture.lecture_video_url && (
                        <div className="video-container">
                            <video
                                ref={videoRef}
                                className="w-100 rounded"
                                controls
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleVideoEnd}
                                src={`${courseVideoPath}/${lecture.lecture_video_url}`}
                            >
                                Your browser does not support the video tag.
                            </video>
                            <div className="progress mt-3" style={{ height: '4px' }}>
                                <div 
                                    className="progress-bar" 
                                    role="progressbar" 
                                    style={{ width: `${progress}%` }}
                                    aria-valuenow={progress} 
                                    aria-valuemin={0} 
                                    aria-valuemax={100}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-3">
                     
                        <p>{lecture.content}</p>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="row mt-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            {lecture.completed && (
                                <span className="text-success">
                                    <BsCheckCircleFill className="me-2" />
                                    Completed
                                </span>
                            )}
                        </div>
                        <div className="d-flex gap-3">
                            {!lecture.completed && (
                                <button
                                    className="btn btn-success"
                                    onClick={handleVideoEnd}
                                >
                                    Mark Complete
                                </button>
                            )}
                            {onNextLecture && (
                                <button 
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={onNextLecture}
                                >
                                    Next Lecture
                                    <BsArrowRight />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentViewer; 