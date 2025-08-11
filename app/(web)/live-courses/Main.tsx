"use client";

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { authorizationObj, baseUrl } from "../../utils/core";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import SearchFilter from "./components/search-and-filter/SearchFilter";
import CourseList from "./components/courses-section/CourseCard";
import { useSelector } from "react-redux";

// Define the Course interface to give a clear structure to the course data
interface Course {
  course_id: string;
  course_title: string;
  course_description: string;
  course_status: string;
  is_free: boolean;
  course_level: string;
  course_category_id: string;
  course_category_name: string;
  topic: string;
  course_thumbnail: string;
  display_currency: string;
  course_display_price: number;
  start_date: string;
}

// Define Filters interface to structure the filter options
interface Filters {
  course_level: string;
  course_category_ids: string[];
}

// Main component that handles course fetching, filtering, and searching
interface MainProps {
  searchParams?: { q?: string };
}

const Main: React.FC<MainProps> = ({ searchParams }) => {
  const currentUser = useSelector((state: any) => state?.user);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState(searchParams?.q || "");
  const [filters, setFilters] = useState<Filters>({
    course_level: "",
    course_category_ids: [],
  });
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  // Fetch courses whenever search params or search text changes
  useEffect(() => {
    if (searchParams?.q) {
      setSearchText(searchParams.q);
      searchCourses(searchParams.q);
    } else {
      getCourses();
    }
  }, [searchParams?.q]);

  // Fetch courses whenever categories or search text change
  useEffect(() => {
    if (selectedCategories.length === 0 && !searchText) {
      getCourses();
      return;
    }

    if (selectedCategories.length > 0) {
      getCoursesByCategories(selectedCategories);
    } else if (searchText) {
      searchCourses(searchText);
    }
  }, [selectedCategories, searchText]);

  // Get courses the user is already enrolled in
  const getUserCourses = async () => {
    // Return empty array if no user or no user ID
    if (!currentUser?.user_id) {
      return [];
    }

    try {
      const resp = await axios.get(
        `${baseUrl}/enrollments/student/${currentUser.user_id}`,
        authorizationObj
      );
      return resp?.data?.data || [];
    } catch (error) {
      console.error("Error fetching user courses:", error);
      // Return empty array on error to prevent further issues
      return [];
    }
  };

  // Get courses by selected categories
  const getCoursesByCategories = async (categoryIds: string[]) => {
    setIsLoading(true);
    try {
      const promises = categoryIds.map((id) =>
        axios.get(
          currentUser?.institute_id
            ? `${baseUrl}/courses/courseBycategoryInstitute/${currentUser.institute_id}/${id}`
            : `${baseUrl}/course-categories/category-by-course/${id}`,
          authorizationObj
        )
      );

      const responses = await Promise.all(promises);
      let allCourses = responses
        .flatMap((resp) => resp.data?.data || [])
        .filter((c: any) => c?.course_status === "approved");

      if (searchText) {
        allCourses = allCourses.filter(
          (course) =>
            course.course_title
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            course.course_description
              .toLowerCase()
              .includes(searchText.toLowerCase())
        );
      }

      // Only fetch enrolled courses if user is logged in
      const enrolledCourses = currentUser?.user_id
        ? await getUserCourses()
        : [];
      const finalCourses = allCourses.filter(
        (course: any) =>
          !enrolledCourses.some(
            (enrolled: any) => enrolled.course_id === course.course_id
          )
      );

      setCourses(finalCourses);
      setAllCourses(finalCourses);
    } catch (error) {
      console.error("Error fetching courses by categories:", error);
      setCourses([]);
      setAllCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all courses (without any filters)
  const getCourses = async () => {
    setIsLoading(true);
    try {
      const url = currentUser?.institute_id
        ? `live-courses/by-institute/${currentUser.institute_id}`
        : "live-courses";

      const resp = await axios.get(`${baseUrl}/${url}`, authorizationObj);
      // console.log(resp?.data?.data);
      if (resp?.data?.data) {
        const filteredCourses = resp.data.data
          .filter((c: any) => c?.course_status === "approved")
          .map((course: any) => ({
            ...course,
            course_category_name: course.course_category_name || "Course",
            display_currency: course.display_currency || "$",
            course_display_price: course.course_display_price || 0,
            course_thumbnail: course.course_thumbnail || "",
          }));

        // Only fetch enrolled courses if user is logged in
        const enrolledCourses = currentUser?.user_id
          ? await getUserCourses()
          : [];
        const finalCourses = filteredCourses.filter(
          (course: any) =>
            !enrolledCourses.some(
              (enrolled: any) => enrolled.course_id === course.course_id
            )
        );

        setCourses(finalCourses);
        setAllCourses(finalCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
      setAllCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Search for courses based on search text
  const searchCourses = async (text: string) => {
    if (!text.trim()) {
      setCourses(allCourses);
      return;
    }

    setIsLoading(true);
    try {
      const url = currentUser?.institute_id
        ? `courses/search-course-institute/${currentUser.institute_id}/${text}`
        : `courses/search-course/${text}`;

      const resp = await axios.get(`${baseUrl}/${url}`, authorizationObj);

      if (resp?.data?.data) {
        const filteredCourses = resp.data.data.filter(
          (c: any) => c?.course_status === "approved"
        );

        // Only fetch enrolled courses if user is logged in
        const enrolledCourses = currentUser?.user_id
          ? await getUserCourses()
          : [];
        const finalCourses = filteredCourses.filter(
          (course: any) =>
            !enrolledCourses.some(
              (enrolled: any) => enrolled.course_id === course.course_id
            )
        );

        setCourses(finalCourses);
        setAllCourses(finalCourses);
      }
    } catch (error) {
      console.error("Error searching courses:", error);
      setCourses([]);
      setAllCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to courses
  const applyFilters = useCallback(
    (courses: Course[], currentFilters: Filters) => {
      return courses.filter((course) => {
        const matchesLevel =
          !currentFilters.course_level ||
          course.course_level?.toLowerCase() ===
            currentFilters.course_level?.toLowerCase();

        const matchesCategory =
          currentFilters.course_category_ids.length === 0 ||
          currentFilters.course_category_ids.includes(
            course.course_category_id
          );

        if (searchText) {
          return (
            matchesLevel &&
            matchesCategory &&
            (course.course_title
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
              course.course_description
                .toLowerCase()
                .includes(searchText.toLowerCase()))
          );
        }

        return matchesLevel && matchesCategory;
      });
    },
    [searchText]
  );

  // Handle filter changes
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    const filtered = applyFilters(courses, newFilters);
    setFilteredCourses(filtered);
  };

  // Add effect to handle search text changes
  useEffect(() => {
    const filtered = applyFilters(courses, filters);
    setFilteredCourses(filtered);
  }, [searchText, courses, filters, applyFilters]);

  return (
    <>
      <Header />
      <main>
        <SearchFilter
          searchText={searchText}
          set_searchText={setSearchText}
          onFilterChange={handleFilterChange}
        />

        <div className="bg-light py-4">
          <div className="container" style={{ minHeight: "50vh" }}>
            {isLoading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-5 h-100">
                No courses available. for this search.
              </div>
            ) : (
              <CourseList
                courses={filteredCourses.length > 0 ? filteredCourses : courses}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Main;
