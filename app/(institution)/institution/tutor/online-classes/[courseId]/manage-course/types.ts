export interface Section {
  section_id: string;
  course_id: string;
  title: string;
  description: string;
  lectures: Lecture[];
}

export interface Lecture {
  lecture_id: string;
  section_id: string;
  course_id: string;
  instructor_id: string;
  title: string;
  description: string;
  duration: string;
  order: string;
  class_date: string;
  class_time: string;
  is_recorded: boolean;
  recording_link?: string;
  created_at: string;
  updated_at: string;
  resources?: LectureResource[];
}

export interface LectureResource {
  resource_id: string;
  lecture_id: string;
  resource_type: 'video' | 'document' | 'url';
  resource_title: string;
  resource_url: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceFormData {
  resource_type: 'video' | 'document' | 'url';
  resource_title: string;
  resource_url?: string;
  resource_file?: File;
}

export interface SectionFormData {
  title: string;
  description: string;
}

export interface LectureFormData {
  lecture_title: string;
  lecture_description: string;
  lecture_duration: string;
  lecture_order: string;
  class_date: string;
  class_time: string;
}
