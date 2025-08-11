import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { MuiMarkdown } from 'mui-markdown';
import { courseThumbnailPath } from '@/app/utils/core';
import Image from 'next/image';

const Section1 = ({ course }: any) => {
    const [_course, set_course] = useState<any>(null);
    
    useEffect(() => {
        if (course && Array.isArray(course) && course[0]) {
            set_course(course[0]);
        }
    }, [course]);

    if (!_course) return null;

    return (
        <div className="bg-light py-4">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <h1 className="display-6 mb-3">{_course.course_title}</h1>
                        <div className="text-secondary mb-3">
                            <MuiMarkdown>{_course.course_description}</MuiMarkdown>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <span className="badge bg-primary">{_course.course_level}</span>
                            <span className="text-secondary">
                                Instructor: {_course.instructor_first_name} {_course.instructor_last_name}
                            </span>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="position-relative" style={{ height: "200px" }}>
                            <Image
                                src={_course.course_thumbnail ? 
                                    `${courseThumbnailPath}/${_course.course_thumbnail}` : 
                                    '/images/default-course.png'}
                                alt={_course.course_title}
                                width={100}
                                height={100}
                                className="rounded object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Section1; 