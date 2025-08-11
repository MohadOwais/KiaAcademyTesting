"use client";
import "./Main.css";
import React, { useState, useRef, useEffect } from "react";
import DOMPurify from "dompurify";
import { BsCheckCircleFill } from "react-icons/bs";
import {baseUrl, authorizationObj} from "@/app/utils/core";
import axios from "axios";
import "plyr/dist/plyr.css";
import "plyr/dist/plyr.js";

// Resources Section
import LectureResources from "./LectureResources";

interface ContentViewerProps {
  lecture: any;
  course: any;
  sections: any[];
  onNextLecture?: () => void;
  resources: any[];
  loadingResources: boolean;
}

const ContentViewer: React.FC<ContentViewerProps> = ({
  lecture,
  course,
  sections,
  onNextLecture,
  resources,
  loadingResources,
}) => {
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  console.log("content view-resources", resources);
  // Scroll to the top of the page when the lecture changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [lecture?.lecture_id]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percentage =
        (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(Math.round(percentage));
    }
  };

  const handleVideoEnd = async () => {
    try {
      await axios.post(
        `${baseUrl}/lectures/complete/${lecture.lecture_id}`,
        {},
        authorizationObj
      );
    } catch (error) {
      console.error("Error marking lecture as complete:", error);
    }
  };
  const [showModal, setShowModal] = useState(false);

  if (!lecture) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <h5 className="text-muted">Select a lecture to begin</h5>
      </div>
    );
  }

  // Step 1: Add responsive classes into the figure and img tags
  const parser = new DOMParser();
  const doc = parser.parseFromString(lecture.description, "text/html");

  // Add responsive classes to <figure> tags
  const figures = doc.querySelectorAll("figure");
  figures.forEach((figure) => {
    figure.setAttribute("class", "img-fluid w-100 responsive-figure");
  });

  // Add responsive classes to <img> tags
  const images = doc.querySelectorAll("img");
  images.forEach((img) => {
    img.setAttribute("class", "img-fluid w-100");
  });

  // Step 2: Get the modified HTML content
  const modifiedContent = doc.body.innerHTML;

  // Step 3: Sanitize the content with DOMPurify
  const content = DOMPurify.sanitize(modifiedContent);

  return (
    <div className="container-fluid py-4 content-viewer content-viewer-header" ref={containerRef}>
      {/* Title */}
      <div className="row mb-4">
        <div className="col-12">
          <h1
            className="mb-0"
            style={{ fontSize: "2.5rem", fontWeight: "700", lineHeight: 1.1 }}
          >
            {lecture.title}
          </h1>
        </div>
      </div>

      {/* Video Player */}
      <div className="row">
        <div className="col-12">
          <div className="mt-3">
            {/* {content} */}
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <LectureResources resources={resources} loading={loadingResources} />

      {/* Navigation Buttons */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div className="w-100">
              {lecture.completed && (
                <span className="text-success d-inline-flex align-items-center mb-2">
                  <BsCheckCircleFill className="me-2" />
                  Completed
                </span>
              )}
              <div>
                <strong>Class Time:</strong>{" "}
                {new Date(
                  `${lecture.class_date}T${lecture.class_time}`
                ).toLocaleString()}
              </div>
            </div>

            <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
              {lecture.class_link ? (
                <a
                  href={lecture.class_link}  
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-75 w-md-auto text-decoration-none"
                >
                  <button className="btn btn-dark rounded-pill w-100">
                    Join Now
                  </button>
                </a>
              ) : (
                <span
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Class not started"
                  className="w-100 w-md-auto"
                >
                  <button
                    className="btn btn-secondary rounded-pill w-75 w-md-auto"
                    disabled
                  >
                    Join Now
                  </button>
                </span>
              )}

              {lecture.is_recorded === "1" && lecture.recording_link && (
                <button
                  className="btn btn-outline-secondary rounded-pill w-75 w-md-auto"
                  onClick={() => setShowModal(true)}
                >
                  Watch Recording
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal for Video Recording */}
      {lecture.recording_link && (
        <div
          className={`modal fade ${showModal ? "show d-block" : ""}`}
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Lecture Recording</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <video
                  controls
                  controlsList="nodownload"
                  className="w-100"
                  src={lecture.recording_link}
                  style={{ borderRadius: "8px" }}
                  onContextMenu={(e) => e.preventDefault()} // prevent right-click download
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentViewer;
