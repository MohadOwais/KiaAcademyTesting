"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Button, Card, Container, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { BsPlusCircle } from 'react-icons/bs';
import SectionList from './components/SectionList';
import AddSectionModal from './components/AddSectionModal';
import EditSectionModal from './components/EditSectionModal';
import LectureModal from './components/LectureModal';
import ConfirmationModal from './components/ConfirmationModal';
import { useSections } from './hooks/useSections';
import { Section, Lecture, LectureResource } from './types';
import LectureResourceModal from './components/LectureResourceModal';

const ManageCourse = () => {
  const params = useParams();
  const courseId = params.courseId as string;
  
  // Section states
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [newSection, setNewSection] = useState({ title: '', description: '' });
  const [isSavingSection, setIsSavingSection] = useState(false);

  // Lecture states
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [selectedSectionForLecture, setSelectedSectionForLecture] = useState<string | null>(null);
  const [isSavingLecture, setIsSavingLecture] = useState(false);
  const [lectureFormData, setLectureFormData] = useState({
    lecture_title: '',
    lecture_description: '',
    class_date: '',
    class_time: ''
  });

  // Resource states
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedLectureForResource, setSelectedLectureForResource] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<LectureResource | null>(null);

  // Confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'section' | 'lecture', id: string } | null>(null);

  const {
    sections,
    isLoading,
    error,
    addSection,
    updateSection,
    deleteSection,
    addLecture,
    updateLecture,
    deleteLecture,
    refreshSections,
    addLectureResource,
    updateLectureResource,
    deleteLectureResource,
    getResourceUrl
  } = useSections(courseId);

  // Section handlers
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingSection(true);
      await addSection(newSection.title, newSection.description);
      toast.success('Section added successfully');
      setShowAddSectionModal(false);
      setNewSection({ title: '', description: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleEditSection = (section: Section) => {
    setSelectedSection(section);
    setShowEditSectionModal(true);
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    try {
      setIsSavingSection(true);
      await updateSection(
        selectedSection.section_id,
        selectedSection.title,
        selectedSection.description
      );
      toast.success('Section updated successfully');
      setShowEditSectionModal(false);
      setSelectedSection(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSavingSection(false);
    }
  };

  const handleDeleteSection = (sectionId: string) => {
    setItemToDelete({ type: 'section', id: sectionId });
    setShowDeleteConfirm(true);
  };

  // Lecture handlers
  const handleAddLecture = (sectionId: string) => {
    setSelectedSectionForLecture(sectionId);
    setSelectedLecture(null);
    setLectureFormData({
      lecture_title: '',
      lecture_description: '',
      class_date: '',
      class_time: ''
    });
    setShowLectureModal(true);
  };

  const handleEditLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
    setSelectedSectionForLecture(lecture.section_id);
    setLectureFormData({
      lecture_title: lecture.title,
      lecture_description: lecture.description || '',
      class_date: lecture.class_date || '',
      class_time: lecture.class_time || ''
    });
    setShowLectureModal(true);
  };

  const handleSaveLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSectionForLecture) return;

    try {
      setIsSavingLecture(true);
      if (selectedLecture) {
        await updateLecture(
          selectedLecture.lecture_id,
          lectureFormData.lecture_title,
          lectureFormData.lecture_description,
          lectureFormData.class_date,
          lectureFormData.class_time
        );
        toast.success('Lecture updated successfully');
      } else {
        await addLecture(
          selectedSectionForLecture,
          lectureFormData.lecture_title,
          lectureFormData.lecture_description,
          lectureFormData.class_date,
          lectureFormData.class_time
        );
        toast.success('Lecture added successfully');
      }
      setShowLectureModal(false);
      setSelectedLecture(null);
      setSelectedSectionForLecture(null);
      setLectureFormData({
        lecture_title: '',
        lecture_description: '',
        class_date: '',
        class_time: ''
      });
      refreshSections();
    } catch (error: any) {
      console.error('Error saving lecture:', error);
      toast.error(error.message || 'Error saving lecture');
    } finally {
      setIsSavingLecture(false);
    }
  };

  const handleDeleteLecture = (lectureId: string) => {
    setItemToDelete({ type: 'lecture', id: lectureId });
    setShowDeleteConfirm(true);
  };

  // Resource handlers
  const handleAddResource = (lectureId: string) => {
    setSelectedLectureForResource(lectureId);
    setSelectedResource(null);
    setShowResourceModal(true);
  };

  const handleEditResource = (resource: LectureResource) => {
    setSelectedResource(resource);
    setSelectedLectureForResource(resource.lecture_id);
    setShowResourceModal(true);
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await deleteLectureResource(resourceId);
      toast.success('Resource deleted successfully');
      refreshSections();
    } catch (err: any) {
      console.error("Delete error:", err);
      toast.error(err.message || 'Failed to delete resource');
    }
  };

  // Confirmation handler
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'section') {
        await deleteSection(itemToDelete.id);
        toast.success('Section deleted successfully');
      } else {
        await deleteLecture(itemToDelete.id);
        toast.success('Lecture deleted successfully');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link href={`/institution/sub-admin/online-classes/${courseId}`} className="text-decoration-none">
          <Button className='btn-view rounded-pill'>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Course
          </Button>
        </Link>
        <Button className='btn-view rounded-pill' onClick={() => setShowAddSectionModal(true)}>
          <BsPlusCircle className="me-2" />
          Add Section
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">Course Sections</h2>
          
          <SectionList
            sections={sections}
            onDeleteSection={handleDeleteSection}
            onEditSection={handleEditSection}
            onDeleteLecture={handleDeleteLecture}
            onEditLecture={handleEditLecture}
            onAddLecture={handleAddLecture}
            onAddResource={handleAddResource}
            onEditResource={handleEditResource}
            onDeleteResource={handleDeleteResource}
          />
        </Card.Body>
      </Card>

      {/* Add Section Modal */}
      <AddSectionModal
        show={showAddSectionModal}
        onHide={() => setShowAddSectionModal(false)}
        onSubmit={handleAddSection}
        title={newSection.title}
        description={newSection.description}
        onTitleChange={(value: string) => setNewSection({ ...newSection, title: value })}
        onDescriptionChange={(value: string) => setNewSection({ ...newSection, description: value })}
        isSaving={isSavingSection}
      />

      {/* Edit Section Modal */}
      <EditSectionModal
        show={showEditSectionModal}
        onHide={() => setShowEditSectionModal(false)}
        onSubmit={handleUpdateSection}
        section={selectedSection}
        onTitleChange={(value: string) => setSelectedSection(prev => prev ? { ...prev, title: value } : null)}
        onDescriptionChange={(value: string) => setSelectedSection(prev => prev ? { ...prev, description: value } : null)}
        isSaving={isSavingSection}
      />

      {/* Lecture Modal */}
      <LectureModal
        show={showLectureModal}
        onHide={() => {
          setShowLectureModal(false);
          setSelectedLecture(null);
          setSelectedSectionForLecture(null);
          setLectureFormData({
            lecture_title: '',
            lecture_description: '',
            class_date: '',
            class_time: ''
          });
        }}
        onSubmit={handleSaveLecture}
        lecture={selectedLecture}
        sectionId={selectedSectionForLecture || ''}
        courseId={courseId}
        onTitleChange={(value: string) => setLectureFormData(prev => ({ ...prev, lecture_title: value }))}
        onDescriptionChange={(value: string) => setLectureFormData(prev => ({ ...prev, lecture_description: value }))}
        onClassDateChange={(value: string) => setLectureFormData(prev => ({ ...prev, class_date: value }))}
        onClassTimeChange={(value: string) => setLectureFormData(prev => ({ ...prev, class_time: value }))}
        isSaving={isSavingLecture}
      />

      {/* Resource Modal */}
      <LectureResourceModal
        show={showResourceModal}
        onClose={() => {
          setShowResourceModal(false);
          setSelectedLectureForResource(null);
          setSelectedResource(null);
        }}
        lectureId={selectedLectureForResource || ''}
        resourceToEdit={selectedResource}
        onResourceAdded={() => {
          setShowResourceModal(false);
          setSelectedLectureForResource(null);
          setSelectedResource(null);
          refreshSections();
        }}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showDeleteConfirm}
        onHide={() => {
          setShowDeleteConfirm(false);
          setItemToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${itemToDelete?.type === 'section' ? 'Section' : 'Lecture'}`}
        message={`Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.`}
      />
    </Container>
  );
};

export default ManageCourse; 