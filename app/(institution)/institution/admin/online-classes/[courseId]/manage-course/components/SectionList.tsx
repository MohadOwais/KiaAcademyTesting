import React, { useState } from 'react';
import { Accordion, Button, ListGroup, Badge, Modal } from 'react-bootstrap';
import { BsTrash, BsPencil, BsPlusCircle, BsFileEarmark, BsFilePlay, BsLink45Deg, BsEye } from 'react-icons/bs';
import { Section, Lecture, LectureResource } from '../types';

interface SectionListProps {
  sections: Section[];
  onDeleteSection: (sectionId: string) => void;
  onEditSection: (section: Section) => void;
  onDeleteLecture: (lectureId: string) => void;
  onEditLecture: (lecture: Lecture) => void;
  onAddLecture: (sectionId: string) => void;
  onAddResource: (lectureId: string) => void;
  onEditResource: (resource: LectureResource) => void;
  onDeleteResource: (resourceId: string) => void;
}

const SectionList: React.FC<SectionListProps> = ({
  sections,
  onDeleteSection,
  onEditSection,
  onDeleteLecture,
  onEditLecture,
  onAddLecture,
  onAddResource,
  onEditResource,
  onDeleteResource,
}) => {
  const [selectedResource, setSelectedResource] = useState<LectureResource | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <BsFilePlay className="me-1" />;
      case 'document':
        return <BsFileEarmark className="me-1" />;
      case 'url':
        return <BsLink45Deg className="me-1" />;
      default:
        return <BsFileEarmark className="me-1" />;
    }
  };

 

  const handleViewResource = (resource: LectureResource) => {
    setSelectedResource(resource);
    setShowViewModal(true);
  };

  return (
    <Accordion>
      {sections.map((section, index) => (
        <Accordion.Item eventKey={index.toString()} key={section.section_id} className="rounded-0 border-1 border-top border-dark-subtle mb-3 shadow-sm">
          <Accordion.Header>
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>{section.title}</span>
              <div className="me-3">
                <span
                  role="button" 
                  className="btn btn-outline-danger btn-sm me-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSection(section.section_id);
                  }}
                >
                  <BsTrash />
                </span>
                <span
                  role="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditSection(section);
                  }}
                >
                  <BsPencil />
                </span>
              </div>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <div className="mb-3">
              <h6>Description</h6>
              <p>{section.description}</p>
            </div>
            
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Lectures</h6>
                <Button
                  className='btn-view rounded-pill'
                  size="sm"
                  onClick={() => onAddLecture(section.section_id)}
                >
                  <BsPlusCircle className="me-1" />
                  Add Lecture
                </Button>
              </div>
              {section.lectures?.length ? (
                <ListGroup>
                  {section.lectures.map((lecture) => (
                    <ListGroup.Item key={lecture.lecture_id} className="d-flex flex-column rounded-2 border-1 border-dark-subtle mb-2">
                      <div className="d-flex justify-content-between align-items-start w-100 mb-2">
                        <div>
                          <h6 className="mb-1">{lecture.title}</h6>
                          <small className="text-muted">
                            {lecture.class_date && (
                              <>
                                Date: {new Date(lecture.class_date).toLocaleDateString()}
                                {lecture.class_time && ` at ${lecture.class_time}`}
                              </>
                            )}
                          </small>
                          {lecture.description && (
                            <p className="mb-1 small text-muted">{lecture.description}</p>
                          )}
                          {lecture.recording_link && (
                            <small className="d-block text-success">
                              <a href={lecture.recording_link} target="_blank" rel="noreferrer">
                                <button className='btn btn-sm btn-outline-success'>
                                  <i className="bi bi-arrow-up-right-square me-1"></i>
                                  Watch Recording
                                </button>
                              </a>
                            </small>
                          )}
                        </div>
                        <div>
                          <Button
                            
                            size="sm"
                            className="me-2 btn-view rounded-pill"
                            onClick={() => onAddResource(lecture.lecture_id)}
                          >
                            <BsPlusCircle className="me-1" />
                            Add Resource
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="me-2"
                            onClick={() => onDeleteLecture(lecture.lecture_id)}
                          >
                            <BsTrash />
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onEditLecture(lecture)}
                          >
                            <BsPencil />
                          </Button>
                        </div>
                      </div>

                      {/* Resources Section */}
                      {lecture.resources && lecture.resources.length > 0 && (
                        <div className="mt-2 pt-2 border-top">
                          <h6 className="mb-2">Resources</h6>
                          <ListGroup variant="flush">
                            {lecture.resources.map((resource: LectureResource) => (
                              <ListGroup.Item 
                                key={resource.resource_id}
                                className="d-flex justify-content-between align-items-center py-2"
                              >
                                <div className="d-flex align-items-center">
                                  {getResourceIcon(resource.resource_type)}
                                  <span>{resource.resource_title}</span>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleViewResource(resource)}
                                  >
                                    <BsEye />
                                  </Button>
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
                                    onClick={() => onDeleteResource(resource.resource_id)}
                                  >
                                    <BsTrash />
                                  </Button>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                        </div>
                      )}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <p className="text-muted">No lectures in this section</p>
              )}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      ))}

      {/* View Resource Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)}  size="lg">
        <Modal.Header closeButton>
          <Modal.Title>View Resource</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResource && (
            <div>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h5 className="mb-2">{selectedResource.resource_title}</h5>
                  <Badge bg={selectedResource.resource_type === 'video' ? 'primary' : selectedResource.resource_type === 'document' ? 'success' : 'info'}>
                    {selectedResource.resource_type.charAt(0).toUpperCase() + selectedResource.resource_type.slice(1)}
                  </Badge>
                </div>
                <small className="text-muted">
                  Added: {new Date(selectedResource.created_at).toLocaleDateString()}
                </small>
              </div>

              <div className="resource-preview border rounded p-3 bg-light">
                {selectedResource.resource_type === 'video' && (
                  <div>
                    <div className="ratio ratio-16x9 mb-3">
                      <iframe 
                        src={`${selectedResource.resource_url}`} 
                        title={selectedResource.resource_title}
                        allowFullScreen
                        className="rounded"
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <a 
                        href={selectedResource.resource_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        <BsFilePlay className="me-1" />
                        Open in New Tab
                      </a>
                    </div>
                  </div>
                )}

                {selectedResource.resource_type === 'document' && (
                  <div>
                    <div className="text-center mb-3">
                      <BsFileEarmark size={48} className="text-primary mb-2" />
                      <h6>Document Preview</h6>
                      <p className="text-muted small mb-3">
                        {selectedResource.resource_title}
                      </p>
                    </div>
                    <div className="d-flex justify-content-center">
                      <a 
                        href={selectedResource.resource_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        <BsFileEarmark className="me-2" />
                        View Document
                      </a>
                    </div>
                  </div>
                )}

                {selectedResource.resource_type === 'url' && (
                  <div>
                    <div className="text-center mb-3">
                      <BsLink45Deg size={48} className="text-info mb-2" />
                      <h6>External Link</h6>
                      <p className="text-muted small mb-3">
                        {selectedResource.resource_url}
                      </p>
                    </div>
                    <div className="d-flex justify-content-center">
                      <a 
                        href={selectedResource.resource_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                      >
                        <BsLink45Deg className="me-2" />
                        Open Link
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Accordion>
  );
};

export default SectionList; 