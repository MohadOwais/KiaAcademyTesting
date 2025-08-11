"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Alert, Button, Card, Container, Spinner, Modal } from 'react-bootstrap';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { BsPlusCircle } from 'react-icons/bs';
import SectionList from './components/SectionList';
import AddSectionModal from './components/AddSectionModal';
import EditSectionModal from './components/EditSectionModal';
import LectureModal from './components/LectureModal';
import ConfirmationModal from './components/ConfirmationModal';
import { useSections } from './hooks/useSections';
import { Section, Lecture, Resource, Quiz } from './types';
import EditLectureModal from './components/EditLectureModal';
import QuizModal from './components/QuizModal';
import QuestionAns from './components/QuestionAns';
import AddResourse from './components/AddResourse';
import AddResource from './components/AddResourse';

const ManageCourse = () => {
  const params = useParams();
  const courseId = params.id as string;
  
  // Section states
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showEditSectionModal, setShowEditSectionModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [newSection, setNewSection] = useState({ title: '', description: '' });
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [options, setOptions] = React.useState([
    { answer_text: '', is_correct: false },
  ]);
  // Lecture states
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
const [selectedSectionForLecture, setSelectedSectionForLecture] = useState<string>("");
  // const [isSavingLecture, setIsSavingLecture] = useState(false);
  const [isSavingLecture, setIsSavingLecture] = useState(false);
  // const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | string | undefined >();
    // const [videoFile, setVideoFile] = useState<File | null>(null);
const [sectionId, setSectionId] = useState('');

      // const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizSectionId, setQuizSectionId] = useState<string | null>(null);
  const [isSavingQuiz, setIsSavingQuiz] = useState(false);
const [quizTitle, setQuizTitle] = useState('');
const [quizDescription, setQuizDescription] = useState('');
const [selectedQuiz, setSelectedQuiz] = useState<Quiz | undefined>(undefined); // if editing
// const [isSavingQuiz, setIsSavingQuiz] = useState(false);
const [showQuizModal, setShowQuizModal] = useState(false);
const [showResourceModal, setResourceModal] = useState(false);
const [showQAnsModal, setshowQAnsModal] = useState(false);
const [getAnswers, setGetAnswers] = useState(false);
const [resourceTitle, setResourceTitle] = useState("");
const [resourceType, setResourceType] = useState<"document" | "url" | "video">("document");
const [resourceUrlOrFile, setResourceUrlOrFile] = useState<File | string>("");
const [resourceFileName, setResourceFileName] = useState("");
const [quizzesId,setQuizzesId]=useState("")


  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'section' | 'lecture', id: string } | null>(null);
const [resourceId,setReources]=useState("")
  const {
    sections,
    isLoading,
    error,
    addSection,
    updateSection,
    deleteSection,
    deleteResoources,
    addLecture,
    addQAns,
    updateLecture,
    deleteLecture,
    refreshSections,
    addQuiz,
    EditQuiz,
    DeleteQuiz,
    updateQAns,
    deleteAns,
    addResources,
    editResources,
    
     
  
  } = useSections(courseId);

  // Section handlers
  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("newSection",newSection);
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
    setShowLectureModal(true);
  };

  const handleEditLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture);
      setIsEditing(true); 
    setSelectedSectionForLecture(lecture.section_id);
    setShowLectureModal(true);
  };
const handleSaveLecture = async (e: React.FormEvent) => {
  e.preventDefault();

  

  if (!selectedSectionForLecture || !selectedLecture) return;

  try {
    setIsSavingLecture(true);

    if (selectedLecture.lecture_id) {
await updateLecture(
  selectedLecture?.lecture_id,
  selectedLecture?.section_id,
  selectedLecture?.lecture_title,
  selectedLecture?.content, // ✅ Corrected
  selectedLecture?.class_date,
  selectedLecture?.class_time,
  videoFile,
  selectedLecture?.lecture_duration
);

      toast.success('Lecture updated successfully');
    } else {
      await addLecture(
        selectedSectionForLecture,
        selectedLecture.title,
        selectedLecture.description,
        selectedLecture.class_date,
        selectedLecture.class_time,
        videoFile,
        selectedLecture.duration
      );
      toast.success('Lecture added successfully');
    }

    setShowLectureModal(false);
    setSelectedLecture(null);
    setSelectedSectionForLecture("");
    setVideoFile(undefined); // Clear after save
  } catch (error: any) {
    console.error("Error saving lecture:", error);
    toast.error(error.message || 'An error occurred');
  } finally {
    setIsSavingLecture(false);
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
  const handleDeleteLecture = (lectureId: string) => {
    setItemToDelete({ type: 'lecture', id: lectureId });
    setShowDeleteConfirm(true);
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


const handleQuiz = (sectionId: string) => {

  setSectionId(sectionId); // ✅ Set the current section ID
  setShowQuizModal(true);      // ✅ Open the modal
};

const handleSaveQuiz = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSavingQuiz(true);

  try {
    if (isEditing && selectedQuiz && quizzesId) {
      // Editing mode
      await EditQuiz(quizzesId, sectionId, quizTitle, quizDescription);
      toast.success('Quiz updated successfully');
    } else {
      // Adding mode
      await addQuiz(sectionId, quizTitle, quizDescription);
      toast.success('Quiz added successfully');
    }
// await fetchQuizzes();
// Optionally, you can refresh sections if quizzes are part of sections:
await refreshSections();
    // Reset form and modal
    setShowQuizModal(false);
    setSelectedQuiz(undefined);
    setQuizTitle('');
    setQuizDescription('');
    setIsEditing(false);
  } catch (error: any) {
    console.error("Error saving quiz:", error);
    toast.error(error.message || 'An error occurred while saving the quiz');
  } finally {
    setIsSavingQuiz(false);
  }
};

const handleQandAns = (sectionId: string) => {

  setSectionId(sectionId); // ✅ Set the current section ID
  setshowQAnsModal(true);      // ✅ Open the modal
};

  // const handleAddReource = (lectureId: string) => {
    
 
  //   setSelectedSectionForLecture(lectureId);
  //   setSelectedLecture(null);
  //   setResourceModal(true);
  // };
  const handleAddReource = (lectureId: string) => {
  setSelectedSectionForLecture(lectureId);
  setSelectedLecture(null);
  setResourceTitle("");
  setResourceType("url"); // or your default
  setResourceUrlOrFile("");
  setResourceFileName("");
  setReources(""); // clear resource_id
  setIsEditing(false); // ✅ very important!
  setResourceModal(true);
};

const handleResources = (resource:any) => {
  // console.log("edit data",resource);
setIsEditing(true);
setReources(resource.resource_id)
  setResourceTitle(resource.resource_title);
  setResourceFileName(resource.fileName || '');  // if you have fileName, otherwise you can skip or handle

  // Correct check based on resource_type
  if (resource.resource_type === 'document') {
    // For file, you probably don't have actual File object here,
    // so you might just keep file name or URL to download the file.
    // You can store the resource_url (which might be a file path/url)
    setResourceUrlOrFile(resource.resource_url); 
  } else {
    // It's a URL type
    setResourceUrlOrFile(resource.resource_url);
  }

  setResourceType(resource.resource_type);
  setSelectedSectionForLecture(resource.lecture_id); // or actual section id if available
  setResourceModal(true);
};


const handleResourceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const isFile = resourceUrlOrFile instanceof File;
  let resource_type = resourceType;
  const resource_Url = isFile ? '' : resourceUrlOrFile;

  // Validate required fields
  if (!resourceTitle.trim()) {
    toast.error('Please enter a resource title');
    return;
  }

  if (resource_type === 'url' && !resource_Url.trim()) {
    toast.error('Please enter a resource URL');
    return;
  }

  if (resource_type !== 'url' && !isFile && !isEditing) {
    toast.error('Please upload a file');
    return;
  }

  // Validate file type matches selected resource type
  if (isFile) {
    const file = resourceUrlOrFile as File;
    if (resource_type === 'video') {
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validVideoTypes.includes(file.type)) {
        toast.error('Please upload a valid video file (MP4, WebM, or OGG)');
        return;
      }
    } else if (resource_type === 'document') {
      const validDocTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      if (!validDocTypes.includes(file.type)) {
        toast.error('Please upload a valid document file (PDF, DOC, DOCX, PPT, or PPTX)');
        return;
      }
    }
  }

  setIsSavingLecture(true);

  try {
    let success = false;

    if (isEditing) {
      success = await editResources(
        resourceId,
        selectedSectionForLecture,
        resource_type,
        resource_Url,
        resourceTitle,
        isFile ? resourceUrlOrFile : undefined
      );
    } else {
      success = await addResources(
        selectedSectionForLecture,
        resource_type,
        resource_Url,
        resourceTitle,
        isFile ? resourceUrlOrFile : undefined
      );
    }

    if (success) {
      setResourceModal(false);
      setIsEditing(false);
      await refreshSections();
    }
  } catch (error) {
    console.error('Error submitting resource:', error);
    throw error;
  } finally {
    setIsSavingLecture(false);
  }
};






const handleEDitQuizzes=(sectionId: string,quizData:any)=>{
// console.log("session",sectionId);
  setIsEditing(true);
  setSelectedQuiz(quizData); // set the quiz to be edited
  setQuizTitle(quizData.title); // set title if needed
  setQuizDescription(quizData.description); 
  setQuizzesId(quizData.quiz_id)
  setShowQuizModal(true);
}
const handleDeleteQuizzes = async (sectionId: string) => {
  try {
    const success = await DeleteQuiz(sectionId);
    if (success) {
      toast.success("Quiz deleted successfully");
      setShowDeleteConfirm(false);
      setSelectedQuiz(undefined);
      // await fetchSections(); // refresh the UI if needed
    } else {
      // toast.error("Failed to delete quiz");
    }
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    toast.error(error.message || "An error occurred while deleting the quiz");
  } finally {
    // setIsDeleting(false); // Optional
  }
};

const handleEditQAns = (sectionId: string, question: any) => {
  let parsedAnswers = [];

  if (question.answers) {
    try {
      parsedAnswers = typeof question.answers === 'string' 
        ? JSON.parse(question.answers) 
        : question.answers;
    } catch (error) {
      console.error("Invalid JSON in quizData.answers", error);
      parsedAnswers = question.answers;
    }
  }

  setSectionId(sectionId);
  setSelectedQuiz({
    ...question,
    question_id: question.id || question.question_id // Make sure this ID is set
  });
  setQuizTitle(question.question_text || '');
  setQuizDescription(question.description || '');
  setOptions(parsedAnswers);
  setIsEditing(true);
  setshowQAnsModal(true);
};
const handleQuizANS = async (
  e: React.FormEvent,
  data: {
    question_text: string;
    answers: { answer_text: string; is_correct: boolean }[];
  }
) => {
  e.preventDefault();

  try {
    setIsSavingQuiz(true);

    if (isEditing && selectedQuiz) {
      // Handle update using both question_id and quiz_id
      const success = await updateQAns(
        selectedQuiz.question_id,
        selectedQuiz.quiz_id,
        data.question_text,
        data.answers
      );
      
      if (success) {
        toast.success('Question updated successfully');
        // Reset form state
        setshowQAnsModal(false);
        setQuizTitle("");
        setQuizDescription("");
        setOptions([{ answer_text: '', is_correct: false }]);
        setIsEditing(false);
        setSelectedQuiz(undefined);
        
        // Refresh the sections to show updated data
        await refreshSections();
      }
    } else {
      // Handle create
      const success = await addQAns(sectionId, data.question_text, data.answers);
      
      if (success) {
        toast.success('Question added successfully');
        // Reset form state
        setshowQAnsModal(false);
        setQuizTitle("");
        setQuizDescription("");
        setOptions([{ answer_text: '', is_correct: false }]);
        setIsEditing(false);
        setSelectedQuiz(undefined);
        
        // Refresh the sections to show updated data
        await refreshSections();
      }
    }
  } catch (error: any) {
    console.error("Error saving question:", error);
    toast.error(error.message || "Failed to save question");
  } finally {
    setIsSavingQuiz(false);
  }
};
const handleDeleteQAns = async (question: any,questionId:any) => {
  try {
    
    const success = await deleteAns(questionId.question_id);
    
  } catch (error: any) {
    console.error("Error deleting question:", error);
    toast.error(error.message || "Failed to delete question");
  }
};

// const hadnleDeleteResources=async(resource:String)=>{
//   try {
//       await deleteResoources(resource.resource_id);
//     } catch (err) {
//       console.error("Delete error:", err);
//     }
// }
const hadnleDeleteResources = async (resource: Resource) => {
  try {
    await deleteResoources(resource.resource_id, resource.lecture_id);
  } catch (err) {
    console.error("Delete error:", err);
  }
}
const handleTitleChange = (value: string): void => {
  console.log("Title input:", value);
  setSelectedLecture(prev => 
    prev 
      ? { ...prev, lecture_title: value, title: value }
      : createNewLecture({ title: value, description: '' })
  );
};

const handleDescriptionChange = (value: string): void => {

  setSelectedLecture(prev =>
    prev
      ? { ...prev, content: value, description: value }
      : createNewLecture({ title: '', description: value })
  );
};

const createNewLecture = ({ title, description }: { title: string; description: string }): Lecture => {
  return {
    lecture_id: '',
    section_id: selectedSectionForLecture || '',
    course_id: courseId,
    instructor_id: '',
    lecture_title: title,
    title: title,
    description: description,
    content: description,
    lecture_video_url: '',
    class_link: '',
    class_date: '',
    class_time: '',
    meeting_id: '',
    is_recorded: false,
    recording_link: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    lecture_duration: '',
    quiz: undefined
  } as Lecture;
};

  return (
    <div className=" container-fluid mt-4 ">
      <div className="d-flex justify-content-between align-items-center mb-4 mt-2  ">
        <Link href={`/institution/tutor/courses/${courseId}`} className="text-decoration-none">
          <Button  className='btn-view rounded-pill px-4 py-2 '>
            <i className="bi bi-arrow-left me-2 "></i>
            Back to Course
          </Button>
        </Link>
        <Button variant="primary" className='btn-view rounded-pill
        ' onClick={() => setShowAddSectionModal(true)}>
          <BsPlusCircle className="me-2" />
          Add Section
        </Button>
      </div>

      <Card className="shadow-sm ">
        <Card.Body className='border-dark-2'>
          <h3 className="mb-4 heading-style">Course Sections</h3>
          
          <SectionList
            sections={sections}
            onDeleteSection={handleDeleteSection}
            onEditSection={handleEditSection}
            onDeleteLecture={handleDeleteLecture}
            onEditLecture={handleEditLecture}
            onAddLecture={handleAddLecture}
             onAddQuiz={handleQuiz}
             onAddQ$A={handleQandAns}
             onAddResouce={handleAddReource}
             EditQuizzes={handleEDitQuizzes}
             DeleteQuizzes={handleDeleteQuizzes}
             onEditQA={handleEditQAns}
             onDeleteQA={handleDeleteQAns}
             onEditResource={handleResources}
             onDeleteResource={hadnleDeleteResources}
             onRefresh={refreshSections}
          />
        </Card.Body>
      </Card>
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
{isEditing ? (
<EditLectureModal
  show={showLectureModal}
  onHide={() => setShowLectureModal(false)}
  onSubmit={handleSaveLecture}
  lecture={selectedLecture}
  onTitleChange={(value) =>
    setSelectedLecture((prev) =>
      prev ? { ...prev, lecture_title: value } : null
    )
  }
  onDescriptionChange={(value) =>
    setSelectedLecture((prev) =>
      prev ? { ...prev, content: value } : null
    )
  }
  onVideoUrlChange={(file: File | string | undefined) =>
    setSelectedLecture((prev) =>
      prev ? { ...prev, lecture_video_url: file } : null
    )
  }
  onDurationChange={(duration) =>
    setSelectedLecture((prev) =>
      prev ? { ...prev, lecture_duration: duration } : null
    )
  }
  isSaving={isSavingLecture}
/>


) : (
<LectureModal
  show={showLectureModal}
  onHide={() => setShowLectureModal(false)}
  onSubmit={handleSaveLecture}
  lecture={selectedLecture}
  sectionId={selectedSectionForLecture || ''}
  courseId={courseId}
   onTitleChange={handleTitleChange}
  onDescriptionChange={handleDescriptionChange}
  onClassDateChange={(value: string) => {
    setSelectedLecture(prev =>
      prev ? { ...prev, class_date: value } : null
    );
  }}
  onClassTimeChange={(value: string) => {
    setSelectedLecture(prev =>
      prev ? { ...prev, class_time: value } : null
    );
  }}
  onDurationChange={(duration: string) => {
    setSelectedLecture(prev =>
      prev ? { ...prev, lecture_duration: duration } : null
    );
  }}
  isSaving={isSavingLecture}
  videoFile={videoFile}
  onVideoFileChange={(file) => setVideoFile(file)}
/>
)} 

<AddResource
  show={showResourceModal}
  onHide={() => {
    setResourceModal(false);
    setIsEditing(false);
    setResourceTitle("");
    setResourceUrlOrFile("");
    setResourceType("url");
  }}
  onSubmit={handleResourceSubmit}
  resourceTitle={resourceTitle}
  onTitleChange={setResourceTitle}
  onVideoFileChange={setVideoFile}
  onDurationChange={(duration) => {
    // you can save duration if needed, for example:
   
  }}
  isSaving={isSavingLecture}
  resourceType={resourceType}
  onResourceTypeChange={setResourceType}
  resourceUrlOrFile={resourceUrlOrFile}
  onResourceUrlOrFileChange={setResourceUrlOrFile}
  onFileNameChange={setResourceFileName}
  isEditing={isEditing}
  onSuccess={refreshSections}
/>



<QuizModal
  show={showQuizModal}
  onHide={() => setShowQuizModal(false)}
  onSubmit={handleSaveQuiz}
  quiz={selectedQuiz}
   sectionId={quizSectionId || ''}
    courseId={courseId}
  onTitleChange={setQuizTitle}
  onDescriptionChange={setQuizDescription}
  isSaving={isSavingQuiz}
  title={quizTitle}
  description={quizDescription}
/>


<QuestionAns
  show={showQAnsModal}
  onHide={() => {
    setshowQAnsModal(false);
    setIsEditing(false);
    setOptions([{ answer_text: '', is_correct: false }]);
    setQuizTitle('');
    setQuizDescription('');
  }}
  onSubmit={handleQuizANS}
  quizzes={selectedQuiz}
  sectionId={sectionId}
  courseId={courseId}
  onTitleChange={setQuizTitle}
  onDescriptionChange={setQuizDescription}
  isSaving={isSavingQuiz}
  title={quizTitle}
  description={quizDescription}
  options={options}
  setOptions={setOptions}
  isEditing={isEditing}
/>
      <ConfirmationModal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete"
        message={`Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );  
};

export default ManageCourse; 