import React, { useState, useEffect } from 'react';
import { Card, Button, ListGroup, Alert, Badge, Modal } from 'react-bootstrap';
import axios from 'axios';
import { baseUrl, authorizationObj } from '@/app/utils/core';
import { toast } from 'react-hot-toast';
import LectureResourceModal from './LectureResourceModal';
import ConfirmationModal from './ConfirmationModal';
import { LectureResource } from '../types';

interface LectureResourcesProps {
  lectureId: string;
}

const LectureResources: React.FC<LectureResourcesProps> = ({ lectureId }) => {
  const [resources, setResources] = useState<LectureResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<LectureResource | null>(null);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${baseUrl}/lecture-resources/${lectureId}`,
        authorizationObj
      );
      if (response.data.status === 200) {
        setResources(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching resources:', error);
      setError(error.response?.data?.message || 'Error loading resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lectureId) {
      fetchResources();
    }
  }, [lectureId]);

  const handleDelete = async () => {
    if (!selectedResource) return;

    try {
      const response = await axios.delete(
        `${baseUrl}/lecture-resources/delete/${selectedResource.resource_id}`,
        authorizationObj
      );

      if (response.data.status === 200) {
        toast.success('Resource deleted successfully');
        fetchResources();
      } else {
        throw new Error(response.data.message || 'Failed to delete resource');
      }
    } catch (error: any) {
      console.error('Error deleting resource:', error);
      toast.error(error.response?.data?.message || 'Error deleting resource');
    } finally {
      setShowDeleteModal(false);
      setSelectedResource(null);
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'document':
        return '📄';
      case 'url':
        return '🔗';
      default:
        return '📎';
    }
  };

  const getResourceBadge = (type: string) => {
    const variant = type === 'video' ? 'primary' : type === 'document' ? 'success' : 'info';
    return (
      <Badge bg={variant} className="ms-2">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const handlePreview = (resource: LectureResource) => {
    if (resource.resource_type === 'url') {
      window.open(resource.resource_url, '_blank');
    } else {
      setShowPreview(`${baseUrl}/lecture-resources/file/${resource.resource_id}`);
    }
  };

  if (loading) {
    return <div className="text-center p-3">Loading resources...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card className="mt-3">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Lecture Resources</h5>
        <Button 
          variant="primary" 
          size="sm"
          onClick={() => setShowAddModal(true)}
        >
          Add Resource
        </Button>
      </Card.Header>
      <Card.Body>
        {resources.length === 0 ? (
          <p className="text-muted text-center">No resources added yet.</p>
        ) : (
          <ListGroup>
            {resources.map((resource) => (
              <ListGroup.Item 
                key={resource.resource_id}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  <span className="me-2 fs-4">{getResourceIcon(resource.resource_type)}</span>
                  <div>
                    <div className="d-flex align-items-center">
                      <span className="fw-bold">{resource.resource_title}</span>
                      {getResourceBadge(resource.resource_type)}
                    </div>
                    <small className="text-muted">
                      Added: {new Date(resource.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </div>
                <div>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => handlePreview(resource)}
                  >
                    Preview
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => {
                      setSelectedResource(resource);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setSelectedResource(resource);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>

      {/* Add Resource Modal */}
      <LectureResourceModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        lectureId={lectureId}
        onResourceAdded={fetchResources}
      />

      {/* Edit Resource Modal */}
      {selectedResource && (
        <LectureResourceModal
          show={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedResource(null);
          }}
          lectureId={lectureId}
          resourceToEdit={selectedResource}
          onResourceAdded={fetchResources}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedResource(null);
        }}
        onConfirm={handleDelete}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
      />

      {/* Preview Modal */}
      <Modal
        show={!!showPreview}
        onHide={() => setShowPreview(null)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Resource Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showPreview && (
            <div className="ratio ratio-16x9">
              <iframe
                src={showPreview}
                title="Resource Preview"
                allowFullScreen
              />
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default LectureResources; 