'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import 'bootstrap/dist/css/bootstrap.min.css'; // Static import
import 'bootstrap-icons/font/bootstrap-icons.css'; // Static import

export default function LearningCourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No need for useEffect anymore since CSS is imported statically
  return (
    <div className="learning-course-layout">
      {children}
    </div>
  );
}