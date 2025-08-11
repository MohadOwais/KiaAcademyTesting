import React from "react";
import { courseThumbnailPath } from "@/app/utils/core";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CourseProps {
  course_id: string;
  course_title: string;
  course_description?: string;
  display_price: number;
  currency?: string;
  course_thumbnail?: string;
  course_level?: string;
}

interface CourseCardProps {
  course: CourseProps;
  options?: {
    is_cart?: boolean;
    is_favourite?: boolean;
    noCartAndFav?: boolean;
    isLiveCourse?: boolean;  // <-- Add this line
    onCartUpdate?: () => void;
    onFavouriteUpdate?: () => void;
    onRefresh?: () => void;
  };
}

const CourseCard: React.FC<CourseCardProps> = ({ course, options }) => {
  const router = useRouter();
  const defaultImage = "/images/default-course.png";

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (options?.is_cart && options.onCartUpdate) {
      options.onCartUpdate();
    } else if (options?.is_favourite && options.onFavouriteUpdate) {
      options.onFavouriteUpdate();
    } else if (options?.onRefresh) {
      options.onRefresh();
    }
  };

  // const handleCardClick = () => {
  //   router.push(`/learning-course/${course.course_id}`);
  // };

  const handleCardClick = () => {
    const path = options?.isLiveCourse
      ? `/live-course-learning/${course.course_id}`
      : `/learning-course/${course.course_id}`;
    router.push(path);
  };
  

  return (
    <div
      className="col mb-4" // Bootstrap column class for responsive layout 
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <div className="card h-100 shadow border border-1 border-secondary border-opacity-10">
        <div className="position-relative" style={{ height: "200px" }}>
          <Image
            src={
              course.course_thumbnail
                ? `${courseThumbnailPath}/${course.course_thumbnail}`
                : defaultImage
            }
            alt={course.course_title || "Course Thumbnail"}
            width={400}
            height={200}
            className="card-img-top h-100 w-100 object-fit-cover"
            onError={(e: any) => {
              e.target.src = defaultImage;
            }}
          />
          {/* {course.course_level && (
                        <span className="position-absolute top-0 end-0 m-2 badge bg-primary">
                            {course.course_level}
                        </span>
                    )} */}
        </div>

        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-truncate mb-2 fs-6 fs-md-5">
            {course.course_title}
          </h5>

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            {/*
{course.display_price > 0 ? (
    <span className="fs-6 fs-md-5 fw-bold">
        {course.currency || '$'}{course.display_price}
    </span>
) : (
    <span className="fs-6 fs-md-5 fw-bold">
        Free
    </span>
)}
*/}

            {!options?.noCartAndFav && (
              <button
                className={`btn btn-sm rounded-pill ${
                  options?.is_cart || options?.is_favourite
                    ? "btn-outline-danger"
                    : "btn-primary"
                }`}
                onClick={handleAction}
              >
                {options?.is_cart
                  ? "Remove from Cart"
                  : options?.is_favourite
                  ? "Remove from Favourites"
                  : "View Course"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
