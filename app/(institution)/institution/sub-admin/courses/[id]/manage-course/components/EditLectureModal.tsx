  import React, { useEffect, useState } from 'react';
  import { Modal, Form, Button } from 'react-bootstrap';
  // import { Lecture } from '../types';
  import Markdown from "@/app/components/markdown/Markdown";
import { Lecture } from '../types';


// interface EditLectureModalProps {
//   show: boolean;
//   onHide: () => void;
//   onSubmit: (e: React.FormEvent) => void;
//   onTitleChange: (value: string) => void;
//   onVideoUrlChange: (file: File | null) => void;
//   onDurationChange: (duration: string) => void;
//   onDescriptionChange: (value: string) => void;
//   isSaving: boolean;

//   // ✅ Add this:
//   lecture: Lecture | null;
// }
interface EditLectureModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onTitleChange: (value: string) => void;
  onVideoUrlChange: (file: File | string | undefined) => void; // Updated type
  onDurationChange: (duration: string) => void;
  onDescriptionChange: (value: string) => void;
  isSaving: boolean;
  lecture: Lecture | null;
}
const EditLectureModal: React.FC<EditLectureModalProps> = ({
    show,
    onHide,
    onSubmit,
    lecture,
    onTitleChange,
    onVideoUrlChange,
    onDurationChange,
    onDescriptionChange,
    isSaving,
  }) => {
    const [localDescription, setLocalDescription] = useState<string>('');
    const [localFile, setLocalFile] = useState<File | null>(null);
    const [hasMounted, setHasMounted] = useState(false);

    // Initialize local description on lecture change
    useEffect(() => {
      if (lecture) {
        setLocalDescription(lecture.content || '');
        setLocalFile(null);
      }
    }, [lecture]);

    useEffect(() => {
      setHasMounted(true);
    }, []);

    const handleDescriptionChange = (value: string) => {
      setLocalDescription(value);
      onDescriptionChange(value);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      if (!file) return;

      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        const durationSec = video.duration;
        const durationFormatted = `${Math.floor(durationSec)} sec`;

        setLocalFile(file);
        onVideoUrlChange(file);
        onDurationChange(durationFormatted);
      };

      video.src = url;
    };

    if (!hasMounted || !lecture) return null;

    return (
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Lecture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={onSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Lecture Title</Form.Label>
              <Form.Control
                type="text"
                value={lecture.lecture_title}
                onChange={(e) => onTitleChange(e.target.value)}
                required
              />
            </Form.Group>

            <Markdown
              label="Description"
              value={localDescription}
              onChange={handleDescriptionChange}
            />

            <Form.Group className="mb-3">
              <Form.Label>Video</Form.Label>
              <Form.Control
                key={hasMounted ? 'hydrated' : 'not-hydrated'}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                required={hasMounted && !lecture.lecture_video_url}
              />
              <Form.Text className="text-muted">
                {localFile
                  ? `Selected file: ${localFile.name}`
                  : `Current video: ${typeof lecture.lecture_video_url === 'string' ? lecture.lecture_video_url : ''}`}
              </Form.Text>
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={onHide}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
};


  export default EditLectureModal; 
  