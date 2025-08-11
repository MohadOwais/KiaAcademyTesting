import './Main.css';
import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { BsArrowRight, BsCheckCircleFill } from 'react-icons/bs';
import { lectureVideoPath, baseUrl, authorizationObj } from '@/app/utils/core';
import axios from 'axios';
import 'plyr/dist/plyr.css';
import 'plyr/dist/plyr.js';

// Resources Section
import LectureResources from './LectureResources';

interface ContentViewerProps {
    lecture: any;
    course: any;
    sections: any[];
    onNextLecture: () => void;
    onTakeQuiz: (sectionId: string) => Promise<void>;
    resources: any[];
    loadingResources: boolean;
}


const ContentViewer: React.FC<ContentViewerProps> = ({ 
    lecture, 
    course, 
    sections, 
    onNextLecture, 
    onTakeQuiz,
    resources,
    loadingResources 
}) => {
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

     // Scroll to the top of the page when the lecture changes
     useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [lecture?.lecture_id]);

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

    // If no lecture is selected, show a message
    if (!lecture) {
        return (
            <div className="d-flex justify-content-center align-items-center h-100">
                <h5 className="text-muted">Select a lecture to begin</h5>
            </div>
        );
    }

    // Step 1: Add responsive classes into the figure and img tags
    const parser = new DOMParser();
    const doc = parser.parseFromString(lecture.content, 'text/html');

    // Add responsive classes to <figure> tags
    const figures = doc.querySelectorAll('figure');
    figures.forEach(figure => {
        figure.setAttribute('class', 'img-fluid w-100 responsive-figure');
    });

    // Add responsive classes to <img> tags
    const images = doc.querySelectorAll('img');
    images.forEach(img => {
        img.setAttribute('class', 'img-fluid w-100');
    });

    // Step 2: Get the modified HTML content
    const modifiedContent = doc.body.innerHTML;

    // Step 3: Sanitize the content with DOMPurify
    const content = DOMPurify.sanitize(modifiedContent);
    
    return (
        <div className="container-fluid py-4 content-viewer content-viewer-header" ref={containerRef}>
            {/* Title */}
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="mb-0" style={{ fontSize: '2.5rem', fontWeight: '700', lineHeight: 1.1 }}>{lecture.lecture_title}</h1>
                </div>
            </div>

            {/* Video Player */}
            <div className="row">
                <div className="col-12">
                    {lecture.lecture_video_url && (
                        <div className="video-container">
                            <video
                                ref={videoRef}
                                className="w-100 rounded shadow-sm" 
                                controls
                                controlsList="nodownload"
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleVideoEnd}
                                src={`${lectureVideoPath}/${lecture.lecture_video_url}`}
                                playsInline
                                preload="metadata"
                            >
                                Your browser does not support the video tag.
                            </video>
                            <div className="progress mt-3" style={{ height: '6px', backgroundColor: '#e9ecef' }}>
                                <div
                                    className="progress-bar bg-primary"
                                    role="progressbar"
                                    style={{ 
                                        width: `${progress}%`,
                                        transition: 'width 0.2s ease'
                                    }}
                                    aria-valuenow={progress}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                />
                            </div>
                        </div>
                    )}

                    <div className="mt-3">
                        <div dangerouslySetInnerHTML={{ __html: content }} />
                    </div>
                </div>
            </div>
            
            {/* Resources Section */}
            <LectureResources resources={resources} loading={loadingResources} />

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