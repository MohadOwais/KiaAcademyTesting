
"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { Lecture } from "../types";
import Markdown from "@/app/components/markdown/Markdown";

// interface LectureModalProps {
//   show: boolean;
//   onHide: () => void;
//   onSubmit: (e: React.FormEvent) => void;
//   lecture?: Lecture | null;
//   sectionId: string;
//   courseId: string;
//   videoFile: File | null;
//   onTitleChange: (value: string) => void;
//   onVideoFileChange: (file: File | null) => void;
//   onDescriptionChange: (value: string) => void;
//   onClassDateChange?: (value: string) => void;
//   onClassTimeChange?: (value: string) => void;
//   onDurationChange: (duration: string) => void;

//   isSaving: boolean;
// }
interface LectureModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  lecture: Lecture | null;
  sectionId: string;
  courseId: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClassDateChange: (value: string) => void;
  onClassTimeChange: (value: string) => void;
  onDurationChange: (duration: string) => void;
  isSaving: boolean;
  videoFile?: File | string;
  onVideoFileChange: (file: File | string | undefined) => void;
}

const LectureModal: React.FC<LectureModalProps> = ({
  show,
  onHide,
  onSubmit,
  lecture,
  videoFile,
  sectionId,
  courseId,
  onTitleChange,
  onDescriptionChange,
  onVideoFileChange = () => {},
  onDurationChange, 
  isSaving,
}) => {
  const isEditing = !!lecture;

  const [localVideoFile, setLocalVideoFile] = React.useState<{ name: string; duration: string } | null>(null);
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");

  // Sync local state with lecture prop when modal opens or lecture changes
  useEffect(() => {

    setLocalTitle(lecture?.title || "");
    setLocalDescription(lecture?.description || "");
  }, [lecture, show]);


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setLocalTitle(value);
  onTitleChange(value); // This calls the parent's handleTitleChange
};

  const handleDescriptionChange = (value: string) => {
    setLocalDescription(value);
    onDescriptionChange(value);
  };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files ? e.target.files[0] : null;
  //   onVideoFileChange(file);
  // };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const durationSec = video.duration;
      const durationFormatted = `${Math.floor(durationSec)} sec`;

      const fileWithDuration = {
        name: file.name,
        duration: durationFormatted,
      };

      setLocalVideoFile(fileWithDuration);
      onDurationChange(durationFormatted); // ✅ Correct usage

      onVideoFileChange(file); // notify parent
    };

    video.src = url;
  };


  
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <h3 className="heading-style">{isEditing ? "Edit Lecture" : "Add New Lecture"}</h3>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Lecture Title</Form.Label>
             <Form.Control
    type="text"
    value={lecture?.lecture_title || localTitle}
    onChange={handleTitleChange}
    required
    placeholder="Enter lecture title"
  />
            {/* <Form.Control
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              required
            /> */}
          </Form.Group>
          <Form.Group className="mb-3">
            <Markdown
              label="Description"
              value={localDescription}
              onChange={handleDescriptionChange}
            />
          </Form.Group>
        
       <Form.Group className="mb-3">
        <Form.Label>Video</Form.Label>
        <Form.Control
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          required={!isEditing && !localVideoFile}
        />
        <Form.Text className="text-muted">
          Upload a video file for this lecture
        </Form.Text>
        {localVideoFile && (
          <div className="mt-2">
            <strong>Selected File: </strong> {localVideoFile.name} <br />
            <strong>Duration: </strong> {localVideoFile.duration}
          </div>
        )}
      </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2 rounded-pill" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit" className="btn-view rounded-pill" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Lecture"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LectureModal;
