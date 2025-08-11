// app/current-courses/[courseId]/page.tsx
import React from "react";
import Main from "./Main";
import { baseUrl, authorizationObj, courseThumbnailPath } from "@/app/utils/core";

type Props = {
  params: { courseId: string };
};

export async function generateMetadata({ params }: Props) {
  try {
    const res = await fetch(`${baseUrl}/courses/${params.courseId}`, {
      method: "GET",
      headers: {
        ...authorizationObj.headers,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch course metadata: ${res.status}`);
    }

    const data = await res.json();
    const course = data?.data?.[0];

    if (!course) {
      return {
        title: "Course Not Found",
        description: "The course you are looking for does not exist.",
      };
    }

    return {
      title: course.course_title,
      description:
        course.course_description || "Learn from the best instructors.",
      openGraph: {
        title: course.course_title,
        description:
          course.course_description || "Learn from the best instructors.",
        images: [
          {
              url: `${courseThumbnailPath}/${course.course_thumbnail}`,
            // url: `${process.env.NEXT_PUBLIC_COURSE_THUMBNAIL_PATH}/${course.course_thumbnail}`,
            width: 800,
            height: 600,
            alt: course.course_title,
          },
        ],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "Unable to load course metadata.",
    };
  }
}

export default async function Page({ params }: Props) {
  console.log("Page params:", params);

  if (!params || !params.courseId) {
    throw new Error("Course ID is required");
  }

  console.log("Fetching course data for:", params.courseId);

  const res = await fetch(`${baseUrl}/courses/${params.courseId}`, {
    method: "GET",
    headers: {
      ...authorizationObj.headers,
    },
    cache: "no-store",
  });

  console.log("Fetch response status:", res.status);

  if (!res.ok) {
    throw new Error(`Failed to fetch course: ${res.status}`);
  }

  const data = await res.json();
  console.log("Fetched course data:", data);

  const course = data?.data?.[0];

  return <Main courseId={params.courseId} course={course} />;
}

