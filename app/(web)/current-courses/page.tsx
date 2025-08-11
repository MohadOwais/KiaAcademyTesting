import React from "react";
import Main from "./Main";
import { baseUrl } from "@/app/utils/core";

type Props = {
  params: { courseId: string };
};

// Dynamic metadata for Open Graph (WhatsApp, Facebook, Twitter previews)
export async function generateMetadata({ params }: Props) {
  try {
    const res = await fetch(`${baseUrl}/courses/${params.courseId}`, {
      cache: "no-store",
    });
    const data = await res.json();

    // Adjust this based on your API response structure
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
            url: `${process.env.NEXT_PUBLIC_COURSE_THUMBNAIL_PATH}/${course.course_thumbnail}`,
            width: 800,
            height: 600,
            alt: course.course_title,
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: course.course_title,
        description:
          course.course_description || "Learn from the best instructors.",
        images: [
          `${process.env.NEXT_PUBLIC_COURSE_THUMBNAIL_PATH}/${course.course_thumbnail}`,
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

export default function Page({ params }: Props) {
  return <Main courseId={params.courseId} />;
}
