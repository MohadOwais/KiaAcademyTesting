"use client";

import "./CourseCard.css";
import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { courseThumbnailPath } from "@/app/utils/core";
import { shortenDescription } from "@/app/utils/functions";
import defaultCourseImage from "../../../../../public/images/banner.jpg";
import { BsMortarboard, BsClock } from "react-icons/bs";

interface CourseProps {
  course_id: string;
  course_title: string;
  course_description: string;
  course_thumbnail: string;
  display_currency: string;
  course_display_price: number;
  course_category_id: string;
  course_category_name: string;
  course_level: string;
  duration?: string;
  is_free?: boolean;
  course_status?: string;
  topic?: string;
  start_date: Date | string;
}

export const NoCourse: React.FC = () => (
  <div className="text-center py-5">
    <BsMortarboard style={{ fontSize: "64px" }} className="text-muted mb-3" />
    <h3 className="text-muted">No Courses Found</h3>
  </div>
);

export const SingleCourseCard: React.FC<{ course: CourseProps }> = ({
  course,
}) => {
  const router = useRouter();
  const imageUrl = course?.course_thumbnail
    ? `${courseThumbnailPath}/${course.course_thumbnail}`
    : defaultCourseImage.src;

  const handleCardClick = () => {
    console.log(`${course.course_id}`);
    router.push(`/live-courses/${course.course_id}`);
  };
  function shortenDescription(description: string, length: number): string {
    if (!description) return "";
    return description.length > length
      ? description.substring(0, length) + "..."
      : description;
  }

  return (
    <div className="card-container">
      <div
        className="course-card rounded-4 p-3 bg-white border-1 border-secondary border-opacity-10 h-100"
        onClick={handleCardClick}
      >
        {/* Course Level Indicator */}
        <div
          className={`type-indicator ${
            course.course_level?.toLowerCase() === "beginner"
              ? "beginner"
              : course.course_level?.toLowerCase() === "intermediate"
              ? "intermediate"
              : course.course_level?.toLowerCase() === "advanced"
              ? "advanced"
              : "default"
          }`}
        ></div>

        {/* Card Content */}
        <div className="card-content">
          {/* Course Image */}
          <div className="course-image mb-3">
            <Image
              src={imageUrl}
              alt={course.course_title}
              width={400}
              height={200}
              className="card-img-top rounded-2 lazy-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = defaultCourseImage.src;
              }}
            />
          </div>
          {/* Course Title */}
          <h3 className="course-title">
            {course.course_title || "Untitled Course"}
          </h3>
          <div className="d-flex justify-content-between align-items-center">
            {/* Start Date Section */}
            <div className="course-date ">
              {new Date(course.start_date) > new Date() ? (
                <span className="amount text-primary fw-semibold">
                  From{" "}
                  {new Date(course.start_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ) : (
                <span className="amount text-success fw-semibold">
                  Join the class
                </span>
              )}
            </div>
            {/* console.log({new Date(course.start_date).toDateString()}) */}
            {/* Price Section */}
            <div className="course-price ">
              <span className="currency">{course.display_currency}</span>
              <span className="amount ms-1">{course.course_display_price}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CourseListProps {
  courses: CourseProps[];
}

export const CourseList: React.FC<CourseListProps> = ({ courses }) => (
  <div className="container">
    <div className="row g-4">
      {courses.length > 0 ? (
        courses.map((course) => (
          <div className="col-12 col-md-6 col-lg-4" key={course.course_id}>
            <SingleCourseCard course={course} />
          </div>
        ))
      ) : (
        <div className="col-12">
          <NoCourse />
        </div>
      )}
    </div>
  </div>
);

export default CourseList;
