import { useState, useEffect } from 'react';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import { Section, Lecture, LectureResource } from '../types';
import { useSelector } from "react-redux";

export const useSections = (courseId: string) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useSelector((state: any) => state.user);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${baseUrl}/course-sections/by-course/${courseId}`,
        authorizationObj
      );

      if (response.data.status === 200) {
        const sectionsWithLectures = await Promise.all(
          response.data.data.map(async (section: Section) => {
            const lectures = await fetchLectures(section.section_id);
            return { ...section, lectures };
          })
        );
        setSections(sectionsWithLectures);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error fetching sections');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLectures = async (sectionId: string) => {
    try {
      const response = await axios.get(
        `${baseUrl}/live-classes/by-section/${sectionId}`,
        authorizationObj
      );
      
      if (response.data && response.data.data) {
        const lectures = response.data.data;
        // Fetch resources for each lecture
        const lecturesWithResources = await Promise.all(
          lectures.map(async (lecture: Lecture) => {
            const resources = await fetchLectureResources(lecture.lecture_id);
            return { ...lecture, resources };
          })
        );
        return lecturesWithResources;
      }
      return [];
    } catch (error) {
      console.error('Error fetching lectures:', error);
      return [];
    }
  };

  const fetchLectureResources = async (lectureId: string) => {
    try {
      const response = await axios.get(
        `${baseUrl}/lecture-resources/${lectureId}`,
        authorizationObj
      );
      
      if (response.data.status === 200) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching lecture resources:', error);
      return [];
    }
  };

  const addSection = async (title: string, description: string) => {
    try {
      const formData = new FormData();
      formData.append('course_id', courseId);
      formData.append('title', title);
      formData.append('description', description);

      const response = await axios.post(
        `${baseUrl}/course-sections/create`,
        formData,
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj?.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 201) {
        await fetchSections();
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error adding section');
    }
  };

  const updateSection = async (sectionId: string, title: string, description: string) => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('course_id', courseId);

      const response = await axios.post(
        `${baseUrl}/course-sections/update/${sectionId}`,
        formData,
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj?.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 200) {
        await fetchSections();
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error updating section');
    }
  };

  const deleteSection = async (sectionId: string) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/course-sections/delete/${sectionId}`,
        authorizationObj
      );

      if (response.data.status === 200) {
        await fetchSections();
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting section');
    }
  };

  const addLecture = async (
    sectionId: string,
    title: string,
    description: string,
    classDate: string,
    classTime: string
  ) => {
    try {
      const formData = new FormData();
      formData.append('section_id', sectionId);
      formData.append('course_id', courseId);
      formData.append('instructor_id', currentUser?.user_id);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('class_date', classDate);
      formData.append('class_time', classTime);
      formData.append('is_recorded', 'true');

      const response = await axios.post(
        `${baseUrl}/live-classes/create`,
        formData,
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj?.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      if (response.data.status === 201) {
        await fetchSections();
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error adding lecture');
    }
  };

  const updateLecture = async (
    lectureId: string,
    title: string,
    description: string,
    classDate: string,
    classTime: string
  ) => {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('class_date', classDate);
      formData.append('class_time', classTime);

      const response = await axios.post(
        `${baseUrl}live-classes/update/${lectureId}`,
        formData,
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj?.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 200) {
        await fetchSections();
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error updating lecture');
    }
  };

  const deleteLecture = async (lectureId: string) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/live-classes/delete/${lectureId}`,
        authorizationObj
      );

      if (response.data.status === 200) {
        await fetchSections();
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting lecture');
    }
  };

  const addLectureResource = async (
    lectureId: string,
    resourceData: {
      resource_type: string;
      resource_title: string;
      resource_url?: string;
      resource_file?: File;
    }
  ) => {
    try {
      const formData = new FormData();
      formData.append('lecture_id', lectureId);
      formData.append('resource_type', resourceData.resource_type);
      formData.append('resource_title', resourceData.resource_title);

      if (resourceData.resource_type === 'url' && resourceData.resource_url) {
        formData.append('resource_url', resourceData.resource_url);
      } else if (resourceData.resource_file) {
        formData.append('resource_file', resourceData.resource_file);
      }

      const response = await axios.post(
        `${baseUrl}/lecture-resources/create`,
        formData,
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj?.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 201) {
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error adding resource');
    }
  };

  const updateLectureResource = async (
    resourceId: string,
    resourceData: {
      resource_type: string;
      resource_title: string;
      resource_url?: string;
      resource_file?: File;
    }
  ) => {
    try {
      const formData = new FormData();
      formData.append('resource_type', resourceData.resource_type);
      formData.append('resource_title', resourceData.resource_title);

      if (resourceData.resource_type === 'url' && resourceData.resource_url) {
        formData.append('resource_url', resourceData.resource_url);
      } else if (resourceData.resource_file) {
        formData.append('resource_file', resourceData.resource_file);
      }

      const response = await axios.post(
        `${baseUrl}/lecture-resources/update/${resourceId}`,
        formData,
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj?.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 200) {
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error updating resource');
    }
  };

  const deleteLectureResource = async (resourceId: string) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/lecture-resources/delete/${resourceId}`,
        authorizationObj
      );

      if (response.data.status === 200) {
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error deleting resource');
    }
  };

  const validateResourceFile = (file: File, resourceType: string) => {
    if (resourceType === 'video') {
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (!validVideoTypes.includes(file.type)) {
        throw new Error('Invalid video file type. Please upload MP4, WebM, or OGG video files.');
      }
      if (file.size > 500 * 1024 * 1024) { // 500MB limit
        throw new Error('Video file size should not exceed 500MB.');
      }
    } else if (resourceType === 'document') {
      const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validDocTypes.includes(file.type)) {
        throw new Error('Invalid document type. Please upload PDF or Word documents.');
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('Document file size should not exceed 50MB.');
      }
    }
    return true;
  };

  const getResourceUrl = (resource: LectureResource) => {
    if (resource.resource_type === 'url') {
      return resource.resource_url;
    }
    return `${baseUrl}/lecture-resources/file/${resource.resource_id}`;
  };

  useEffect(() => {
    if (courseId) {
      fetchSections();
    }
  }, [courseId]);

  return {
    sections,
    isLoading,
    error,
    addSection,
    updateSection,
    deleteSection,
    addLecture,
    updateLecture,
    deleteLecture,
    refreshSections: fetchSections,
    fetchLectureResources,
    addLectureResource,
    updateLectureResource,
    deleteLectureResource,
    validateResourceFile,
    getResourceUrl
  };
}; 