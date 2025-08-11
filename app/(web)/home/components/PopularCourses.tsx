"use client";

import "./main.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  authorizationObj,
  baseUrl,
  courseThumbnailPath,
} from "@/app/utils/core";
import defaultCourseImage from "../../../../public/images/banner.jpg";
import { shortenString } from "@/app/utils/functions";
import Image from "next/image";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Button } from "@mui/material";
import { isSubdomain, subdomain } from "../../../utils/domain"; // adjust path if needed

const PopularCourses = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(4);

  useEffect(() => {
    getCourses();
    // Responsive cards per page
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1200) setCardsPerPage(4); // xl
      else if (width >= 992) setCardsPerPage(3); // lg
      else if (width >= 576) setCardsPerPage(2); // sm
      else setCardsPerPage(1); // xs
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCourses = async () => {
    setIsLoading(true);
    try {
      // const resp = await axios.get(`${baseUrl}/courses/popular`, authorizationObj);
      const url =
        isSubdomain && subdomain
          ? `${baseUrl}/courses/popular1?academy=${encodeURIComponent(
              subdomain
            )}`
          : `${baseUrl}/courses/popular`;

      const resp = await axios.get(url, authorizationObj);
      if (resp?.data?.data) {
        const filteredCourses = resp.data.data
          .filter((c: any) => c?.course_status === "approved")
          .slice(0, 10); // Limit to the first 10 courses
        setCourses(filteredCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(courses.length / cardsPerPage);
  const canGoNext = (currentPage + 1) * cardsPerPage < courses.length;
  const canGoPrev = currentPage > 0;

  const handlePrevPage = () => {
    if (canGoPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (canGoNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Get current page's courses
  const currentCourses = courses.slice(
    currentPage * cardsPerPage,
    (currentPage + 1) * cardsPerPage
  );

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "beginner":
        return "success";
      case "intermediate":
        return "warning";
      case "advanced":
        return "danger";
      default:
        return "success";
    }
  };

  // Only render section if not loading and there are courses
  if (!isLoading && (!courses || courses.length === 0)) {
    return null;
  }

  return (
    <section className="py-5">
      <div className="container-fluid">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3 gap-md-0">
          <div className="d-flex align-items-center ms-md-4">
            <div
              style={{
                width: "5px",
                height: "38px",
                background: "var(--color-dark-2)",
                borderRadius: "4px",
                marginRight: "14px",
              }}
            ></div>
            <h2 className="mb-0 heading-style">Popular Courses</h2>
          </div>
          <div className="slider-controls d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-2 gap-sm-0 mt-3 mt-md-0">
            <div className="d-flex">
              <Button
                onClick={() => router.push("/current-courses")}
                className="btn rounded-pill px-4 py-2 btn-view text-white mb-2 mb-sm-0 me-0 me-sm-2"
                color="secondary"
                variant="contained"
              >
                Browse Courses
              </Button>
              <button
                className={`btn btn-light rounded-circle py-2 px-2 shadow-sm ${
                  !canGoPrev && "opacity-50"
                }`}
                onClick={handlePrevPage}
                disabled={!canGoPrev}
              >
                <IoIosArrowBack />
              </button>
              <button
                className={`btn btn-light rounded-circle py-2 px-2 shadow-sm ms-2 ${
                  !canGoNext && "opacity-50"
                }`}
                onClick={handleNextPage}
                disabled={!canGoNext}
              >
                <IoIosArrowForward />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="courses-container">
            <div className="row g-4">
              {currentCourses.map((course: any) => (
                <div
                  key={course.course_id}
                  className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12"
                >
                  <div
                    className="card h-100 course-card border-1 border-primary rounded-4 border-opacity-10 shadow-md d-flex flex-column p-3"
                    onClick={() =>
                      router.push(`/current-courses/${course.course_id}`)
                    }
                  >
                    <div
                      className={`level-indicator ${
                        course.course_level?.toLowerCase() === "beginner"
                          ? "beginner"
                          : course.course_level?.toLowerCase() ===
                            "intermediate"
                          ? "intermediate"
                          : course.course_level?.toLowerCase() === "advanced"
                          ? "advanced"
                          : "default"
                      }`}
                    ></div>

                    <div
                      className="position-relative"
                      style={{ height: "200px" }}
                    >
                      <Image
                        src={
                          course.course_thumbnail
                            ? `${courseThumbnailPath}/${course.course_thumbnail}`
                            : defaultCourseImage.src
                        }
                        alt={course.course_title}
                        fill
                        className="card-img-top rounded-4"
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority
                      />
                      {course.course_display_price == 0 && (
                        <span
                          className="badge bg-white position-absolute top-0 start-0 m-2 px-3 py-2 fs-6 rounded-pill text-dark-2 fw-semibold"
                          style={{ zIndex: 2 }}
                        >
                          Free
                        </span>
                      )}
                    </div>
                    <div className="card-body pt-3 pb-0 d-flex flex-column">
                      <h5 className="card-title">
                        {shortenString(course.course_title, 50)}
                      </h5>
                      {/* <div className="mt-auto">
                                                <span className="text-dark fw-bold">
                                                    {course.display_currency} {course.course_display_price}
                                                </span>
                                            </div> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularCourses;
