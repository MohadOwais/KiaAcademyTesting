
import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

import Markdown from "@/app/components/markdown/Markdown-1";
import { data } from 'jquery';

interface Quiz {
  quiz_id: string;
  course_id: string;
  section_id: string;
  instructor_id: string;
  title: string;
  description: string;
}

interface QuestionAnsProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent, data: any) => void;
  quizzes: any;
  sectionId: string;
  courseId: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  isSaving: boolean;
  title: string;
  description: string;
  options: Array<{ answer_text: string; is_correct: boolean }>;
  setOptions: (options: Array<{ answer_text: string; is_correct: boolean }>) => void;
  isEditing: boolean;
  // show: boolean;
  // onHide: () => void;
  // onSubmit: (
  //   e: React.FormEvent,
  //   data: {
  //     question_text: string;
  //     answers: { answer_text: string; is_correct: boolean }[];
  //   }
  // ) => void;
 
  // quizzes?: Quiz;
  // sectionId: string;
  // courseId: string;
  // onTitleChange: (value: string) => void;
  // onDescriptionChange: (value: string) => void;
  // isSaving: boolean;
  // title?: string;
  // description?: string;

}
 

const QuestionAns: React.FC<QuestionAnsProps> = ({
  show,
  onHide,
  onSubmit,
  quizzes,
  sectionId,
  courseId,
  onTitleChange,
  onDescriptionChange,
  isSaving,
  title = '',
  description = '',
  options,          // Add this
  setOptions,       // Add this
  // isEditing,
}) => {
  // const [options, setOptions] = React.useState([
  //   { answer_text: '', is_correct: false },
  // ]);
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].answer_text = value;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { answer_text: '', is_correct: false }]);
  };


  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const isEditing = !!quizzes;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Edit Quiz' : 'Add Question'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
  onSubmit={(e) => {
    e.preventDefault();
    const data = {
      question_text: title,
      answers: options,
    };
  
    onSubmit(e, data);
  }}
>


          <Form.Group className="mb-3">
            <Form.Label>Question Title</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Options</Form.Label>
            {options.map((option, index) => (
              <div key={index} className="d-flex align-items-center mb-2">
                <Form.Check
                  type="radio"
                  name="correctAnswer"
                  checked={option.is_correct}
                  onChange={() => handleCorrectChange(index)}
                  className="me-2"
                />
                <Form.Control
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option.answer_text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                />
                <Button
                  variant="danger"
                  size="sm"
                  className="ms-2"
                  onClick={() => removeOption(index)}
                  disabled={options.length <= 1}
                >
                  -
                </Button>
                {index === options.length - 1 && (
                  <Button
                    variant="success"
                    size="sm"
                    className="ms-2"
                    onClick={addOption}
                  >
                    +
                  </Button>
                )}
              </div>
            ))}
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

export default QuestionAns;

