"use client";
import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { toast } from "react-hot-toast";

interface AddResourceProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  resourceTitle?: string;
  videoFile?: File | string;
  sectionId?: string;
  courseId?: string;
  onTitleChange: (value: string) => void;
  onVideoFileChange?: (value: File | string) => void;
  onDurationChange: (duration: string) => void;
  isSaving: boolean;
  resourceType: "url" | "video" | "document";
  onResourceTypeChange: (type: "url" | "video" | "document") => void;
  resourceUrlOrFile: File | string;
  onResourceUrlOrFileChange: (value: File | string) => void;
  onFileNameChange?: (fileName: string) => void;
  isEditing: boolean;
  onSuccess?: () => void;
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
  isEditing,
  onSuccess,
}) => {
  const [localTitle, setLocalTitle] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setLocalTitle(resourceTitle);
    setErrors({}); // Clear errors when modal opens
  }, [resourceTitle, show]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Always validate title
    if (!localTitle.trim()) {
      newErrors.title = 'Resource title is required';
    }

    // Always validate resource type
    if (!resourceType) {
      newErrors.type = 'Resource type is required';
    }

    // Validate based on resource type
    if (resourceType === 'url') {
      if (!resourceUrlOrFile || (typeof resourceUrlOrFile === 'string' && !resourceUrlOrFile.trim())) {
        newErrors.url = 'URL is required';
      }
    } else if (resourceType === 'video' || resourceType === 'document') {
      if (!resourceUrlOrFile) {
        newErrors.file = `${resourceType === 'video' ? 'Video' : 'Document'} file is required`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await onSubmit(e);
        if (isEditing) {
          toast.success('Resource updated successfully');
        } else {
          toast.success('Resource added successfully');
        }
        if (onSuccess) {
          onSuccess();
        }
        onHide();
      } catch (error) {
        toast.error('Failed to save resource. Please try again.');
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalTitle(value);
    onTitleChange(value);
    if (errors.title) {
      setErrors(prev => ({ ...prev, title: '' }));
    }
  };

  const handleResourceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as "url" | "video" | "document";
    onResourceTypeChange(type);
    onResourceUrlOrFileChange(""); // Reset input on type change
    setErrors({}); // Clear errors when type changes
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onResourceUrlOrFileChange(url);
    onDurationChange("URL resource");
    if (errors.url) {
      setErrors(prev => ({ ...prev, url: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (resourceType === "video") {
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validVideoTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Please upload a valid video file (MP4, WebM, or OGG)' }));
        e.target.value = '';
        return;
      }

      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const duration = `${Math.floor(video.duration)} sec`;
        onDurationChange(duration);
        onResourceUrlOrFileChange(file);
        onVideoFileChange(file);
        onFileNameChange?.(file.name);
        setErrors(prev => ({ ...prev, file: '' }));
      };
      video.src = url;
    } else if (resourceType === "document") {
      const validDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      if (!validDocTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, file: 'Please upload a valid document file (PDF, DOC, DOCX, PPT, or PPTX)' }));
        e.target.value = '';
        return;
      }
      onResourceUrlOrFileChange(file);
      onFileNameChange?.(file.name);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <h3 className="heading-style">
          {isEditing ? "Edit Resource" : "Add New Resource"}
        </h3>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* Resource Title */}
          <Form.Group className="mb-3">
            <Form.Label>Resource Title <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              value={localTitle}
              onChange={handleTitleChange}
              required
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>

          {/* Resource Type Dropdown */}
          <Form.Group className="mb-3">
            <Form.Label>Resource Type <span className="text-danger">*</span></Form.Label>
            <Form.Select
              value={["url", "video", "document"].includes(resourceType) ? resourceType : "url"}
              onChange={handleResourceTypeChange}
              required
              isInvalid={!!errors.type}
            >
              <option value="">Select Resource Type</option>
              <option value="url">URL</option>
              <option value="video">Video File</option>
              <option value="document">Document File</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.type}
            </Form.Control.Feedback>
          </Form.Group>

          {/* URL Input */}
          {resourceType === "url" && (
            <Form.Group className="mb-3">
              <Form.Label>Enter URL <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="url"
                placeholder="https://example.com/resource"
                value={typeof resourceUrlOrFile === "string" ? resourceUrlOrFile : ""}
                onChange={handleUrlChange}
                required
                isInvalid={!!errors.url}
              />
              <Form.Control.Feedback type="invalid">
                {errors.url}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {/* Video Upload Input */}
          {resourceType === "video" && (
            <Form.Group className="mb-3">
              <Form.Label>Upload Video <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                required
                isInvalid={!!errors.file}
              />
              <Form.Control.Feedback type="invalid">
                {errors.file}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {/* Document Upload Input */}
          {resourceType === "document" && (
            <Form.Group className="mb-3">
              <Form.Label>Upload Document <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                required
                isInvalid={!!errors.file}
              />
              <Form.Control.Feedback type="invalid">
                {errors.file}
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {/* Submit/Cancel Buttons */}
          <div className="d-flex justify-content-end">
            <Button
              variant="secondary"
              className="me-2 rounded-pill"
              onClick={onHide}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-view rounded-pill"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Add Resource"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddResource;
