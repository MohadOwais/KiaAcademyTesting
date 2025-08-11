'use client';
import { useEffect } from 'react';
import CourseNavigation from './components/CourseNavigation';
import CourseContent from './components/CourseContent';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


export default function LearningCoursePage() {
  useEffect(() => {
    // Bootstrap JS is now imported at the top level
  }, []);

  return (
    <div className="container-fluid p-0">
      <div className="row g-0">
        {/* Left Sidebar */}
        <div className="col-md-3 col-lg-2 bg-light border-end" style={{ minHeight: 'calc(100vh - 60px)' }}>
          <CourseNavigation />
        </div>
        
        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <CourseContent />
        </div>
      </div>
    </div>
  );
} 