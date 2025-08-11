import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Section } from '../types';

interface EditSectionModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  section: Section | null;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  isSaving: boolean;
}

const EditSectionModal: React.FC<EditSectionModalProps> = ({
  show,
  onHide,
  onSubmit,
  section,
  onTitleChange,
  onDescriptionChange,
  isSaving,
}) => {
  if (!section) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <h3 className='heading-style'>Edit Section</h3>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Section Title</Form.Label>
            <Form.Control
              type="text"
              value={section.title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={section.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              required
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2 rounded-pill" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit" className='btn-view rounded-pill' disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditSectionModal; 