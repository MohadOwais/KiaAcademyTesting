import React, { useState, useRef } from 'react';
import { Accordion, Button, ListGroup, Collapse, Card, Badge, Modal } from 'react-bootstrap';
import { BsTrash, BsPencil, BsPlusCircle, BsEnvelopeFill, BsBoxArrowUpRight } from 'react-icons/bs';
import { Section, Lecture,Resource, Quiz, options } from '../types';
import "./SectionList.css";
import { baseUrl, RecordedResourcesPath } from '@/app/utils/core';
import { toast } from 'react-hot-toast';

interface SectionListProps {
  sections: Section[];
  onDeleteSection: (sectionId: string) => void;
  onEditSection: (section: Section) => void;
  onDeleteLecture: (lectureId: string) => void;
  onEditLecture: (lecture: Lecture) => void;
  onAddLecture: (sectionId: string) => void;
  onAddResouce: (sectionId: string) => void;
  onAddQuiz: (sectionId: string) => void;
  onAddQ$A: (quizId: string) => void;
 EditQuizzes: (quizId: string, quizData: Quiz) => void;
  DeleteQuizzes: (quizId: string) => void;
  onEditQA: (quizId: string,question:options) => void;
  onDeleteQA: (quizId: string,question:options) => void;
  // onEditResource: (quizId: string,question:String) => void;
  // onDeleteResource: (quizId: string,question:String) => void;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (resource: Resource) => void;
  onRefresh?: () => Promise<void>;
}

const SectionList: React.FC<SectionListProps> = ({
  sections,
  onDeleteSection,
  onEditSection,
  onDeleteLecture,
  onEditLecture,
  onAddLecture,
  onAddQuiz,
  onAddQ$A,
  onAddResouce,
  EditQuizzes,
  DeleteQuizzes,
  onEditQA,
  onDeleteQA,
  onEditResource,
  onDeleteResource,
  onRefresh
}) => {

  const [openQuizId, setOpenQuizId] = useState<string | null>(null); // Track open quiz for Q&A
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<any>(null);
  const [quizToDelete, setQuizToDelete] = useState<Quiz | null>(null);

const showQuizDeleteConfirmRef = useRef<HTMLDivElement | null>(null);
const [showQuizDeleteConfirm, setShowQuizDeleteConfirm] = useState(false);


  const toggleQnA = (quizId: string) => {
   
    setOpenQuizId(openQuizId === quizId ? null : quizId);
  };

const handleQuizDeleteClick = (quiz: Quiz) => {
  setQuizToDelete(quiz);
  setShowQuizDeleteConfirm(true);
  // Focus the modal or perform any ref-based logic
  setTimeout(() => {
    if (showQuizDeleteConfirmRef.current) {
      showQuizDeleteConfirmRef.current.focus();
    }
  }, 100);
};

const handleConfirmQuizDelete = async () => {
  if (!quizToDelete) return;

  setShowQuizDeleteConfirm(false);

  try {
    await DeleteQuizzes(quizToDelete.quiz_id);
    toast.success('Quiz deleted successfully');
    if (onRefresh) {
      await onRefresh();
    }
  } catch (err: any) {
    toast.error(err.message || 'Failed to delete quiz');
  } finally {
    setQuizToDelete(null);
  }
};


  const handleDeleteClick = (resource: any) => {
    setResourceToDelete(resource);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await onDeleteResource(resourceToDelete);
      toast.success('Resource deleted successfully');
      setShowDeleteConfirm(false);
      setResourceToDelete(null);
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      toast.error('Failed to delete resource');
    }
  };

  return (
    <>
      <Accordion>
        {sections.map((section, index) => (
          <Accordion.Item eventKey={index.toString()} key={section.section_id} className="rounded-3 border-1 border  border-dark-2 mb-3 shadow-sm">
            
            <Accordion.Header>
              <div className="d-flex justify-content-between align-items-center w-100">
                <span>{section.title}</span>
                <div className="me-3">
                  <span
                    role="button"
                    className="btn btn-outline-danger btn-sm me-2 bg-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSection(section.section_id);
                    }}
                  >
                    <BsTrash className='text-white' />
                  </span>
                  <span
                    role="button"
                    className="btn btn-outline-primary btn-sm bg-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditSection(section);
                    }}
                  >
                    <BsPencil className='text-white' />
                  </span>
                </div>
              </div>
            </Accordion.Header>

            <Accordion.Body>
              <div className="mb-3">
                <h6>Description</h6>
                <div dangerouslySetInnerHTML={{ __html: section.description }} />
              </div>

              {/* Lectures Section */}
              <div className="mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Lectures</h6>
                  <Button
                    className='btn-view'
                    size="sm"
                    onClick={() => onAddLecture(section.section_id)}
                  >
                    <BsPlusCircle className="me-1" />
                    Add Lecture
                  </Button>
                </div>

               {section.lectures.map((lecture) => (
 <ListGroup.Item
   key={lecture.lecture_id}
   className="d-flex justify-content-between align-items-start rounded-2 border-1 border-dark-subtle mb-2 flex-column flex-md-row"
 >
   <div className="flex-grow-1 w-100 me-md-3">
     <h6 className="mb-1">
       {lecture.lecture_title}{' '}
       <small className="text-muted"> {/* This is lecture */} </small>
     </h6>


    

{/* // Inside your render/return: */}
{lecture.content && (
  <Accordion className="mb-3">
    <Accordion.Item eventKey="0">
      <Accordion.Header>Lecture Content</Accordion.Header>
      <Accordion.Body>
        <div
          className="small text-muted"
          dangerouslySetInnerHTML={{ __html: lecture.content }}
        />
      </Accordion.Body>
    </Accordion.Item>
  </Accordion>
)}

      
  <div className="row">

    {(section.resources || [])
      .filter((res) => {
       
        return res.lecture_id === lecture.lecture_id;
      })
      .map((resource) => {
      
        return (
          <div 
            key={resource.resource_id} 
            className="col-12 col-md-6 col-lg-3 mb-3"
          >
            <div className="border rounded p-2 h-100">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center me-2">
                  <span className="me-2">{resource.resource_title}</span>
                {resource.resource_url && resource.resource_type === 'url' && (
  <a
    href={resource.resource_url}
    target="_blank"
    rel="noopener noreferrer"
    className="text-truncate small"
    style={{ maxWidth: '70%' }}
  >
    Open Link <BsBoxArrowUpRight />
  </a>
)}
{resource.resource_url && resource.resource_type === 'video' && (
  <a
    href={`${RecordedResourcesPath}/${resource.resource_url}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-truncate small d-flex align-items-center gap-1"
    style={{ maxWidth: '70%' }}
  >
    Watch Video <BsBoxArrowUpRight size={14} />
  </a>
)}

{resource.resource_url && resource.resource_type === 'document' && (
  <a
    href={`${RecordedResourcesPath}/${resource.resource_url}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-truncate small"
    style={{ maxWidth: '70%' }}
  >
    View Document <BsBoxArrowUpRight />
  </a>
)}



                </div>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onEditResource(resource)}
                  >
                    <BsPencil />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteClick(resource)}
                  >
                    <BsTrash />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
  </div>

  </div>

  {/* Lecture actions */}
  <div className="action-buttons d-flex gap-2 mt-3 mt-md-0">
    <Button
      variant="danger"
      size="sm"
      onClick={() => onDeleteLecture(lecture.lecture_id)}
    >
      <BsTrash />
    </Button>
    <Button
      variant="primary"
      size="sm"
      onClick={() => onEditLecture(lecture)}
    >
      <BsPencil />
    </Button>
    <Button
      className='btn-view'
      size="sm"
      onClick={() => onAddResouce(lecture.lecture_id)}
    >
      <div className="d-flex justify-content-between align-items-center  ">
        <BsPlusCircle className="me-1 " />
        Resource
      </div>
    </Button>
  </div>
</ListGroup.Item>
))}


              {/* Quizzes Section */}
              <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                <h6 className="mb-0">Quizzes</h6>
                <Button
                  className='btn-view'
                  size="sm"
                  onClick={() => onAddQuiz(section.section_id)}
                >
                  <BsPlusCircle className="me-1" />
                  Add Quiz
                </Button>
              </div>

              {section.quizzes?.length ? (
                <ListGroup>
                  {section.quizzes.map((quiz) => (
                    <ListGroup.Item key={quiz.quiz_id} className="rounded-2 border-1 border-dark-subtle mb-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">
                            {quiz.title}{' '}
                            <small className="text-muted">{/* quiz metadata */}</small>
                          </h6>
                          {quiz.description && (
                              <div
                                className="mb-1 small text-muted"
                                dangerouslySetInnerHTML={{ __html:quiz.description }}
                              />
                            // <p className="mb-1 small text-muted">{quiz.description}</p>
                          )}
                        </div>
                        <div className=' action-buttons d-flex gap-2'>
                          
                          {/* <Button variant="danger" size="sm" className="me-2">
                            <BsTrash
                             onClick={() => 
                              DeleteQuizzes(quiz.quiz_id)}
                            />
                          </Button> */}

                          <Button variant="danger" size="sm" className="me-2" onClick={() => handleQuizDeleteClick(quiz)}>
  <BsTrash />
</Button>

                          <Button variant="primary" size="sm">
                          <BsPencil
  onClick={() => EditQuizzes(quiz.quiz_id, quiz)}
/>
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => toggleQnA(quiz.quiz_id)}
                          >
                            <span className='d-flex justify-content-center align-items-center'>
                              <i className="bi bi-chevron-down"></i>
                            </span>
                          </Button>
                        </div>
                      </div>

                      <Collapse in={openQuizId === quiz.quiz_id}>
  <div className="mt-3 border-top pt-2">
    {quiz.options && quiz.options.length > 0 && (
      <div className="mb-1 small">

        {quiz.options.map((question, qIdx) => (
  <div key={qIdx} style={{ marginBottom: "1rem" }} className="d-flex justify-content-between align-items-start">
    <div>
      <strong>Q{qIdx + 1}:</strong> <span>{question.question_text}?</span>
    </div>
    <div className="action-buttons-container">
      <BsPencil
        className="action-buttons me-2"
        onClick={() => onEditQA(quiz.quiz_id, question)}
      />
      <BsTrash
        className="action-buttons"
        onClick={() => onDeleteQA(quiz.quiz_id, question)}
      />
    </div>
  </div>
))}
      </div>
    )}

    <div className="d-flex justify-content-end align-items-end">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onAddQ$A(quiz.quiz_id)}
      >
        Add Q&A
      </Button>
    </div>
  </div>
</Collapse>

                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No quizzes in this section</p>
              )}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>

    {/* Delete Confirmation Modal */}
    <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to delete this resource? This action cannot be undone.
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirmDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Quiz Delete Confirmation Modal */}
<Modal show={showQuizDeleteConfirm} onHide={() => setShowQuizDeleteConfirm(false)} centered>
  <div ref={showQuizDeleteConfirmRef} tabIndex={-1} />
  <Modal.Header closeButton>
    <Modal.Title>Confirm Quiz Deletion</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    Are you sure you want to delete the quiz "<strong>{quizToDelete?.title}</strong>"? This action cannot be undone.
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowQuizDeleteConfirm(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleConfirmQuizDelete}>
      Delete
    </Button>
  </Modal.Footer>
</Modal>

    </>
  );
};

export default SectionList;

