import React from 'react';
import Main from './Main';
import { SingleCourseCard } from '../components/courses-section/CourseCard';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    courseId?: string;
  }>;
}

const Page: React.FC<PageProps> = async ({ params }) => {
  const resolvedParams = await params;
  
  if (!resolvedParams.courseId) {
    notFound();
  }
  
  return <Main courseId={resolvedParams.courseId} />;
};

export default Page;