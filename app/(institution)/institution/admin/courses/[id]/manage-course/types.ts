export interface Section {
  section_id: string;
  course_id: string;
  title: string;
  description: string;
  lectures: Lecture[];
  quizzes?: Quiz[];
  resources?: Resource[]; 
}

// export interface Lecture {
//   lecture_id: string;
//   lecture_title: string;
//   lecture_video_url: string;
//   course_id: string;
//   section_id: string;
//   instructor_id: string;
//   title: string;
//   description: string;
//   class_link: string;
//   class_date: string;
//   class_time: string;
//   meeting_id: string;
//   is_recorded: boolean;
//   recording_link: string;
//   created_at: string;
//   updated_at: string;
//   content: string;
//   quiz?: Quiz; // Optional quiz associated with the lecture
// }
export interface Lecture {
  lecture_id: string;
  lecture_title: string;
  lecture_video_url: string | File | undefined; 
  course_id: string;
  section_id: string;
  instructor_id: string;
  title: string;
  description: string;
  class_link: string;
  class_date: string;
  class_time: string;
  meeting_id: string;
  is_recorded: boolean;
  recording_link: string;
  created_at: string;
  updated_at: string;
  content: string;
  lecture_duration: string;
  duration: string;
  quiz?: Quiz; // Optional quiz associated with the lecture
}
export interface Quiz {
  quiz_id: string;
  question_id: string;
  course_id: string;
  section_id: string;
  instructor_id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  options:options[]; // <-- Add this line
}
export interface LecturesResources {
  resources_id: string;
  lecture_id: string;
  resource_type: string;
  resource_url: string;
  resource_title: string;

}
export interface Resource {
  resource_id: string;
  lecture_id: string;
  resource_type: string;
  resource_url: string;
  resource_title: string;
}
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
  EditQuizzes: (quiz: Quiz) => void; // Changed to accept Quiz object
  DeleteQuizzes: (quizId: string) => void;
  onEditQA: (quizId: string, question: string) => void;
  onDeleteQA: (quizId: string, question: string) => void;
   onEditResource: (resource: Resource) => void;
  onDeleteResource: (resource: Resource) => void;
}

export interface options {
  question_text: string;
  answer_text: string;
  is_correct: boolean;
}