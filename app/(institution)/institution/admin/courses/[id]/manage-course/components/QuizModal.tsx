
import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

// import "../../../../../../../components/markdown/Markdown-1"
import Markdown from '@/app/components/markdown/Markdown';
import { Quiz } from '../types';

// interface Quiz {
//   quiz_id: string;
//   course_id: string;
//   section_id: string;
//   instructor_id: string;
//   title: string;
//   description: string;
// }

interface QuizModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  quiz?: Quiz;
  sectionId: string;
  courseId: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  isSaving: boolean;
  title?: string;
  description?: string;
}

const QuizModal: React.FC<QuizModalProps> = ({
  show,
  onHide,
  onSubmit,
  quiz,
  sectionId,
  courseId,
  onTitleChange,
  onDescriptionChange,
  isSaving,
  title = '',
  description = '',
}) => {
  const isEditing = !!quiz;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Edit Quiz' : 'Add New Quiz'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={e => {
            e.preventDefault();
            onSubmit(e);
          }}
        >
          <Form.Group className="mb-3">
            <Form.Label>Quiz Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={e => onTitleChange(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
           
                <Markdown
                          label="Description"
                          value={description}
                          onChange={(text: any) => onDescriptionChange(text)}
                        />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Quiz'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default QuizModal;
