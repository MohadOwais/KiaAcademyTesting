import React, { useState, useEffect, ChangeEvent } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import { baseUrl, authorizationObj } from '@/app/utils/core';
import { toast } from 'react-hot-toast';
import { LectureResource, ResourceFormData } from '../types';

interface LectureResourceModalProps {
  show: boolean;
  onClose: () => void;
  lectureId: string;
  onResourceAdded?: () => void;
  resourceToEdit?: LectureResource | null;
}

const RESOURCE_TYPES = [
  { value: 'video', label: 'Video' },
  { value: 'document', label: 'Document' },
  { value: 'url', label: 'URL' }
] as const;

const LectureResourceModal: React.FC<LectureResourceModalProps> = ({
  show,
  onClose,
  lectureId,
  onResourceAdded,
  resourceToEdit
}) => {
  const [formData, setFormData] = useState<ResourceFormData>({
    resource_type: 'video',
    resource_title: '',
    resource_url: '',
  });
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resourceToEdit) {
      setFormData({
        resource_type: resourceToEdit.resource_type,
        resource_title: resourceToEdit.resource_title,
        resource_url: resourceToEdit.resource_url,
      });
    } else {
      setFormData({
        resource_type: 'video',
        resource_title: '',
        resource_url: '',
      });
    }
  }, [resourceToEdit]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateFile = (file: File) => {
    if (formData.resource_type === 'video') {
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validVideoTypes.includes(file.type)) {
        throw new Error('Please upload a video file (MP4, WebM, or OGG)');
      }
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        throw new Error('Video file size should not exceed 500MB');
      }
    } else if (formData.resource_type === 'document') {
      const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validDocTypes.includes(file.type)) {
        throw new Error('Please upload a PDF or Word document');
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('Document file size should not exceed 50MB');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateFile(file);
      setResourceFile(file);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      e.target.value = ''; // Reset file input
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const submitFormData = new FormData();
      submitFormData.append('lecture_id', lectureId);
      submitFormData.append('resource_type', formData.resource_type);
      submitFormData.append('resource_title', formData.resource_title);

      if (formData.resource_type === 'url') {
        if (!formData.resource_url) {
          throw new Error('Please provide a URL');
        }
        submitFormData.append('resource_url', formData.resource_url);
      } else if (resourceFile) {
        submitFormData.append('resource_url', resourceFile);
      } else if (!resourceToEdit) {
        throw new Error('Please upload a file');
      }

      let response;
      if (resourceToEdit) {
        // Update existing resource
        submitFormData.append('resource_id', resourceToEdit.resource_id);
        response = await axios.post(`${baseUrl}/lecture-resources/update/${resourceToEdit.resource_id}`, submitFormData, authorizationObj);
      } else {
        // Create new resource
        response = await axios.post(`${baseUrl}/lecture-resources/create`, submitFormData, authorizationObj);
      }

      if (response.data.status === 200 || response.data.status === 201) {
        toast.success(resourceToEdit ? 'Resource updated successfully' : 'Resource added successfully');
        if (onResourceAdded) {
          onResourceAdded();
        }
        handleClose();
      } else {
        throw new Error(response.data.message || 'Failed to save resource');
      }
    } catch (error: any) {
      console.error('Error saving resource:', error);
      setError(error.message || 'Error saving resource');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      resource_type: 'video',
      resource_title: '',
      resource_url: '',
    });
    setResourceFile(null);
    setError(null);
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          {resourceToEdit ? 'Edit Resource' : 'Add Resource'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Resource Type</Form.Label>
            <Form.Select
              name="resource_type"
              value={formData.resource_type}
              onChange={handleInputChange}
              required
            >
              {RESOURCE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Resource Title</Form.Label>
            <Form.Control
              type="text"
              name="resource_title"
              value={formData.resource_title}
              onChange={handleInputChange}
              required
              placeholder="Enter resource title"
            />
          </Form.Group>

          {formData.resource_type === 'url' ? (
            <Form.Group className="mb-3">
              <Form.Label>Resource URL</Form.Label>
              <Form.Control
                type="url"
                name="resource_url"
                value={formData.resource_url}
                onChange={handleInputChange}
                required
                placeholder="Enter resource URL"
              />
            </Form.Group>
          ) : (
            <Form.Group className="mb-3">
              <Form.Label>Resource File</Form.Label>
              <Form.Control
                type="file"
                name="resource_url"
                onChange={handleFileChange}
                accept={formData.resource_type === 'video' ? 'video/*' : '.pdf,.doc,.docx'}
                required={!resourceToEdit}
              />
              <Form.Text className="text-muted">
                {formData.resource_type === 'video' 
                  ? 'Upload a video file (MP4, WebM, OGG) - Max 500MB'
                  : 'Upload a document file (PDF, DOC, DOCX) - Max 50MB'}
              </Form.Text>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Saving...' : resourceToEdit ? 'Update Resource' : 'Add Resource'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LectureResourceModal; 