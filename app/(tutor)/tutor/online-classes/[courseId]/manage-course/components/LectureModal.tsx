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
  const [localLecture, setLocalLecture] = useState<Lecture>({
    lecture_id: '',         // This could be a string, you can keep it empty initially
    section_id: sectionId,  // Assuming sectionId is defined earlier in your code
    course_id: courseId,    // Assuming courseId is defined earlier in your code
    instructor_id: '',      // This could be empty or a default value
    title: '',              // Empty string initially
    description: '',        // Empty string initially
    duration: '',           // Empty string initially
    order: '',              // Empty string initially
    class_date: '',         // Empty string initially
    class_time: '',         // Empty string initially
    is_recorded: false,     // Defaulting to false if not provided
    created_at: '',         // Empty string or current date (if needed)
    updated_at: '',         // Empty string or current date (if needed)
    resources: [],          // Defaulting to an empty array
  });
  
  

  useEffect(() => {
    if (lecture) {
      setLocalLecture(lecture); // If lecture exists, set it directly
    } else {
      setLocalLecture({
        lecture_id: '',         // Default empty string for lecture_id
        section_id: sectionId,  // Keep sectionId from the hook's scope
        course_id: courseId,    // Keep courseId from the hook's scope
        instructor_id: '',      // Default empty string for instructor_id
        title: '',              // Empty title initially
        description: '',        // Empty description initially
        duration: '',           // Empty duration initially
        order: '',              // Empty order initially
        class_date: '',         // Empty class_date initially
        class_time: '',         // Empty class_time initially
        is_recorded: false,     // Default to false
        created_at: '',         // Empty created_at initially
        updated_at: '',         // Empty updated_at initially
        resources: [],          // Empty array for resources initially
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
