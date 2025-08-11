import React, { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Lecture } from '../types';

interface LectureModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  lecture?: Lecture | null;
  sectionId: string;
  courseId: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClassDateChange: (value: string) => void;
  onClassTimeChange: (value: string) => void;
  isSaving: boolean;
}

const LectureModal: React.FC<LectureModalProps> = ({
  show,
  onHide,
  onSubmit,
  lecture,
  sectionId,
  courseId,
  onTitleChange,
  onDescriptionChange,
  onClassDateChange,
  onClassTimeChange,
  isSaving,
}) => {
  const isEditing = !!lecture;

  // Set initial values when lecture changes
  const [localLecture, setLocalLecture] = useState<Partial<Lecture>>({
    title: '',
    description: '',
    class_date: '',
    class_time: '',
    section_id: sectionId,
    course_id: courseId,
  });

  useEffect(() => {
    if (lecture) {
      setLocalLecture(lecture);
    } else {
      setLocalLecture({
        title: '',
        description: '',
        class_date: '',
        class_time: '',
        section_id: sectionId,
        course_id: courseId,
        lecture_id: '',
        instructor_id: '',
        duration: '',
        order: '',
        is_recorded: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  }, [lecture, sectionId, courseId]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Edit Lecture' : 'Add New Lecture'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Lecture Title</Form.Label>
            <Form.Control
              type="text"
              value={localLecture.title}
              onChange={(e) => {
                onTitleChange(e.target.value);
                setLocalLecture(prev => ({ ...prev, title: e.target.value }));
              }}
              required
              placeholder="Enter lecture title"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={localLecture.description}
              onChange={(e) => {
                onDescriptionChange(e.target.value);
                setLocalLecture(prev => ({ ...prev, description: e.target.value }));
              }}
              required
              placeholder="Enter lecture description"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Class Date</Form.Label>
            <Form.Control
              type="date"
              value={localLecture.class_date}
              onChange={(e) => {
                onClassDateChange(e.target.value);
                setLocalLecture(prev => ({ ...prev, class_date: e.target.value }));
              }}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Class Time</Form.Label>
            <Form.Control
              type="time"
              value={localLecture.class_time}
              onChange={(e) => {
                onClassTimeChange(e.target.value);
                setLocalLecture(prev => ({ ...prev, class_time: e.target.value }));
              }}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Lecture'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default LectureModal;
