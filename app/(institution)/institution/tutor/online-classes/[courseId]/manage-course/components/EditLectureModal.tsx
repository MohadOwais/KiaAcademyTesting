import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import { baseUrl, authorizationObj } from '@/app/utils/core';
import { toast } from 'react-hot-toast';
import LectureResources from './LectureResources';

interface EditLectureModalProps {
  show: boolean;
  onClose: () => void;
  lectureId: string;
  onLectureUpdated?: () => void;
}

const EditLectureModal: React.FC<EditLectureModalProps> = ({
  show,
  onClose,
  lectureId,
  onLectureUpdated
}) => {
  const [formData, setFormData] = useState({
    lecture_title: '',
    lecture_description: '',
    lecture_duration: '',
    lecture_order: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'resources'>('details');

  useEffect(() => {
    if (show && lectureId) {
      fetchLectureData();
    }
  }, [show, lectureId]);

  const fetchLectureData = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/lectures/${lectureId}`,
        authorizationObj
      );
      if (response.data.status === 200) {
        const lectureData = response.data.data;
        setFormData({
          lecture_title: lectureData.lecture_title || '',
          lecture_description: lectureData.lecture_description || '',
          lecture_duration: lectureData.lecture_duration || '',
          lecture_order: lectureData.lecture_order || '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching lecture:', error);
      setError(error.response?.data?.message || 'Error loading lecture data');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await axios.put(
        `${baseUrl}/lectures/${lectureId}`,
        formData,
        authorizationObj
      );

      if (response.data.status === 200) {
        toast.success('Lecture updated successfully');
        if (onLectureUpdated) {
          onLectureUpdated();
        }
        handleClose();
      } else {
        throw new Error(response.data.message || 'Failed to update lecture');
      }
    } catch (error: any) {
      console.error('Error updating lecture:', error);
      setError(error.response?.data?.message || 'Error updating lecture');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      lecture_title: '',
      lecture_description: '',
      lecture_duration: '',
      lecture_order: '',
    });
    setError(null);
    setActiveTab('details');
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <h3 className='heading-style'>Edit Lecture</h3>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        <div className="mb-3">
          <Button
            variant={activeTab === 'details' ? 'primary' : 'outline-primary'}
            className="me-2"
            onClick={() => setActiveTab('details')}
          >
            Lecture Details
          </Button>
          <Button
            variant={activeTab === 'resources' ? 'primary' : 'outline-primary'}
            onClick={() => setActiveTab('resources')}
          >
            Resources
          </Button>
        </div>

        {activeTab === 'details' ? (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Lecture Title</Form.Label>
              <Form.Control
                type="text"
                name="lecture_title"
                value={formData.lecture_title}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="lecture_description"
                value={formData.lecture_description}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duration (in minutes)</Form.Label>
              <Form.Control
                type="number"
                name="lecture_duration"
                value={formData.lecture_duration}
                onChange={handleInputChange}
                required
                min="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Order</Form.Label>
              <Form.Control
                type="number"
                name="lecture_order"
                value={formData.lecture_order}
                onChange={handleInputChange}
                required
                min="1"
              />
            </Form.Group>

            <Button 
              type="submit" 
             className='btn-view rounded-pill'
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Form>
        ) : (
          <Card>
            <Card.Body>
              <LectureResources lectureId={lectureId} />
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className='rounded-pill' onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditLectureModal; 