

"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
interface AddResourceProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  resourceTitle?: string;   // corrected: string instead of object
  videoFile?: File | string;
  sectionId?: string;
  courseId?: string;
  onTitleChange: (value: string) => void;
  onVideoFileChange?: (value: File | string) => void;
  onDurationChange: (duration: string) => void;
  isSaving: boolean;
  resourceType: "file" | "url";
  onResourceTypeChange: (type: "file" | "url") => void;
  resourceUrlOrFile: File | string;
  onResourceUrlOrFileChange: (value: File | string) => void;
  onFileNameChange?: (fileName: string) => void;
}

const AddResource: React.FC<AddResourceProps> = ({
  show,
  onHide,
  onSubmit,
  resourceTitle = "",
  onTitleChange,
  onVideoFileChange = () => {},
  onFileNameChange = () => {},
  onDurationChange,
  isSaving,
  resourceType,
  onResourceTypeChange,
  resourceUrlOrFile,
  onResourceUrlOrFileChange,
}) => {
  const [localTitle, setLocalTitle] = React.useState("");

  const isEditing = !!resourceTitle;

  React.useEffect(() => {
    setLocalTitle(resourceTitle);
  }, [resourceTitle, show]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalTitle(value);
    onTitleChange(value);
  };

  const handleResourceTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onResourceTypeChange(e.target.value as "file" | "url");
    onResourceUrlOrFileChange(""); // reset resource input on type change
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onResourceUrlOrFileChange(url);
    onDurationChange("URL resource");
  };

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files ? e.target.files[0] : null;
  if (!file) return;

  
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "metadata";

  video.onloadedmetadata = () => {
    URL.revokeObjectURL(url);
    const durationSec = video.duration;
    const durationFormatted = `${Math.floor(durationSec)} sec`;

    onDurationChange(durationFormatted);
    onResourceUrlOrFileChange(file);
    onVideoFileChange(file);
    onFileNameChange(file.name);  // <-- Pass file name here
  };

  video.src = url;
};

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? "Edit Resource" : "Add New Resource"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          {/* Title */}
          <Form.Group className="mb-3">
            <Form.Label>Resource Title</Form.Label>
            <Form.Control
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              required
            />
          </Form.Group>

          {/* Resource Type */}
          <Form.Group className="mb-3">
            <Form.Label>Resource Type</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="File"
                name="resourceType"
                value="file"
                checked={resourceType === "file"}
                onChange={handleResourceTypeChange}
              />
              <Form.Check
                inline
                type="radio"
                label="URL"
                name="resourceType"
                value="url"
                checked={resourceType === "url"}
                onChange={handleResourceTypeChange}
              />
            </div>
          </Form.Group>

          {/* File or URL input */}
          {resourceType === "file" ? (
            <Form.Group className="mb-3">
              <Form.Label>Upload File</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                required={!isEditing && !resourceUrlOrFile}
              />
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Video URL</Form.Label>
              <Form.Control
                type="url"
                placeholder="Enter video URL"
                value={typeof resourceUrlOrFile === "string" ? resourceUrlOrFile : ""}
                onChange={handleUrlChange}
                required={!isEditing && !resourceUrlOrFile}
              />
            </Form.Group>
          )}

          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Resource"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};



export default AddResource;
