"use client";

import { useState } from "react";
import moment from "moment";
import { Button } from "react-bootstrap";
import defaultCourseImage from "@/public/images/banner.jpg";
import { courseThumbnailPath, courseVideoPath } from "@/app/utils/core";
import { AdditionalInfo } from "../components/AdditionalInfo";

interface Course {
  course_id: string;
  course_title: string;
  course_description: string;
  course_thumbnail: string;
  created_at: string;
  is_public: string;
  course_price: number;
  display_currency: string;
  course_status: string;
  course_category_id: string;
  course_language: string;
  course_level: string;
  start_date: string;
  end_date: string;
  class_timing: string;
  course_display_price?: string;
  course_intro_video?: string;
  average_rating?: number;
  updated_at?: string;
}

interface ViewSingleCourseProps {
  course: Course;
}

const ViewSingleCourse = ({ course }: ViewSingleCourseProps) => {
  // console.log(course);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  if (!course) return null;

  return (
    <div className="container-fluid w-100 ">
    <div className="card shadow-lg border-0 rounded-4 overflow-hidden w-full" style={{ maxWidth: '100%', minHeight: '80vh' }}>
      <div className="card-body px-5 py-5">
        <h1 className="display-5 fw-bold text-dark mb-5">
          {course.course_title || "No Title"}
        </h1>
  
        <div className="row g-5">
          {/* LEFT COLUMN: IMAGE + VIDEO */}
          <div className="col-12 col-md-6">
            <div className="d-flex flex-column gap-4">
              <div className="ratio ratio-16x9 rounded-4 overflow-hidden border" style={{ minHeight: '200px' }}>
                <img
                  src={
                    course.course_thumbnail
                      ? `${courseThumbnailPath}/${course.course_thumbnail}`
                      : defaultCourseImage.src
                  }
                  alt={course.course_title || "Course thumbnail"}
                  className="w-100 h-100 object-fit-cover"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = defaultCourseImage.src;
                  }}
                />
              </div>
  
              {course.course_intro_video && (
                <div className="ratio ratio-16x9 rounded-4 overflow-hidden border" style={{ minHeight: '200px' }}>
                  <video
                    src={`${courseVideoPath}/${course.course_intro_video}`}
                    controls
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
              )}
            </div>
          </div>
  
          {/* RIGHT COLUMN: COURSE INFO */}
          <div className="col-12 col-md-6">
            <p className="fs-5 text-muted mb-4">
                {course.course_description ? (
                <span dangerouslySetInnerHTML={{ __html: course.course_description }} />
                ) : (
                "No Description"
                )}
            </p>
  
            <div className="row gy-3">
              <div className="col-sm-6"><strong>Course ID:</strong> <span className="text-muted">{course.course_id}</span></div>
              <div className="col-sm-6"><strong>Status:</strong> <span className="text-muted">{course.course_status}</span></div>
              <div className="col-sm-6"><strong>Price:</strong> <span className="text-muted">{course.course_price} {course.display_currency}</span></div>
              <div className="col-sm-6"><strong>Language:</strong> <span className="text-muted">{course.course_language}</span></div>
              <div className="col-sm-6"><strong>Level:</strong> <span className="text-muted">{course.course_level}</span></div>
              <div className="col-sm-6"><strong>Public:</strong> <span className="text-muted">{course.is_public === '1' ? "Yes" : "No"}</span></div>
              {course.start_date && (
                <div className="col-sm-6"><strong>Start Date:</strong> <span className="text-muted">{moment(course.start_date).format("MMMM D, YYYY")}</span></div>
              )}
              {course.end_date && (
                <div className="col-sm-6"><strong>End Date:</strong> <span className="text-muted">{moment(course.end_date).format("MMMM D, YYYY")}</span></div>
              )}
              {course.class_timing && (
                <div className="col-sm-6"><strong>Class Timing:</strong> <span className="text-muted">{course.class_timing}</span></div>
              )}
              <div className="col-sm-6"><strong>Created:</strong> <span className="text-muted">{moment(course.created_at).format("MMMM D, YYYY")}</span></div>
              {course.updated_at && (
                <div className="col-sm-6"><strong>Last Updated:</strong> <span className="text-muted">{moment(course.updated_at).format("MMMM D, YYYY")}</span></div>
              )}
              {course.average_rating && (
                <div className="col-sm-6"><strong>Rating:</strong> <span className="text-muted">{Number(course.average_rating).toFixed(1)} / 5.0</span></div>
              )}
            </div>
  
            <div className="mt-5 text-end">
              <Button
                className="rounded-pill px-4 py-2 fw-semibold btn-view"
                onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              >
                {showAdditionalInfo ? "Hide Info" : "More Info"}
              </Button>
            </div>
            {showAdditionalInfo && (
        <div className="px-5 pb-5">
          <AdditionalInfo singleCourse={course} />
        </div>
      )}
          </div>
        </div>
      </div>
  
      
    </div>
  </div>
  
  );
};

export default ViewSingleCourse;
