import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import Markdown from "@/app/components/markdown/Markdown-1";
interface AddSectionModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  isSaving: boolean;
}

const AddSectionModal: React.FC<AddSectionModalProps> = ({
  show,
  onHide,
  onSubmit,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  isSaving,
}) => {
  const handleDescriptionChange = (value: string) => {
    
    onDescriptionChange(value); 
  }
  return (
   <Modal 
      show={show} 
      onHide={onHide}
      centered
      size="lg"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Modal.Header closeButton>
        <Modal.Title>Add New Section</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Section Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            {/* <Form.Label>Description</Form.Label> */}
            <Markdown
              label="Description"
              value={description}
              onChange={handleDescriptionChange}
        
            />
            {/* <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              required
            /> */}
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? 'Adding...' : 'Add Section'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddSectionModal;