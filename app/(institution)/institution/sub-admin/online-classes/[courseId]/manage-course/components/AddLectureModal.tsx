import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

interface AddLectureModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  videoUrl: string;
  onTitleChange: (value: string) => void;
  onVideoUrlChange: (value: string) => void;
  isSaving: boolean;
}

const AddLectureModal: React.FC<AddLectureModalProps> = ({
  show,
  onHide,
  onSubmit,
  title,
  videoUrl,
  onTitleChange,
  onVideoUrlChange,
  isSaving,
}) => {
  return (
    <Modal show={show} onHide={onHide }  centered>
      <Modal.Header closeButton>
        <h3 className='heading-style'>Add New Lecture 1</h3>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Lecture Titl 00e</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Video URL</Form.Label>
            <Form.Control
              type="url"
              value={videoUrl}
              onChange={(e) => onVideoUrlChange(e.target.value)}
              required
              placeholder="https://example.com/video.mp4"
            />
            <Form.Text className="text-muted">
              Enter the URL of the video for this lecture
            </Form.Text>
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2 rounded-pill" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit" className='btn-view rounded-pill' disabled={isSaving}>
              {isSaving ? 'Adding...' : 'Add Lecture'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddLectureModal;