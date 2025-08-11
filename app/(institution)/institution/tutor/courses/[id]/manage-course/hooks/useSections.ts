import { useState, useEffect } from 'react';
import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import { Section, Lecture, Quiz } from '../types';
import { useSelector } from "react-redux";
import { message } from 'antd';


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
      const sectionsWithDetails = await Promise.all(
        response.data.data.map(async (section: Section) => {
          const lectures = await fetchLectures(section.section_id);
          let quizzes = await fetchQuiz(section.section_id);

          // Fetch all resources for all lectures in this section
          const resources = await Promise.all(
            lectures.map(async (lecture: any) => {
              const res = await fetchResouces(lecture.lecture_id);
              return res;
            })
          );

          // Optionally flatten if fetchResources returns arrays
          const flattenedResources = resources.flat();

          quizzes = await Promise.all(
            quizzes.map(async (quiz: any) => {
              const options = await fetchQuizQuestion(quiz.quiz_id);
              return { ...quiz, options };
            })
          );

          return {
            ...section,
            lectures,
            quizzes,
            resources: flattenedResources // Save all resources under section
          };
        })
      );

      setSections(sectionsWithDetails);
    }
  } catch (error: any) {
    setError(error.response?.data?.message || 'Error fetching sections');
  } finally {
    setIsLoading(false);
  }
};

  const fetchLectures = async (sectionId: string) => {

    try {
      const response = await axios.get(`${baseUrl}/lectures/by-section/${sectionId}`,
        authorizationObj
      );

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching lectures:', error);
      return [];
    }
  };
  const fetchQuiz = async (sectionId: string) => {


    try {
      const response = await axios.get(`${baseUrl}/quizzes/${sectionId}`,
        authorizationObj
      );

      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching lectures:', error);
      return [];
    }
  };

  const fetchQuizQuestion = async (quizid: string) => {
  try {
    const response = await axios.get(`${baseUrl}/questions/${quizid}`, authorizationObj);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching QuizQuestions:', error);
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


const addResources = async (
  lecture_id: string,
  resource_type: "url" | "video" | "document",
  resource_Url: string,
  resource_title: string,
  resource_file?: File
) => {
  try {
    const formData = new FormData();
    formData.append("lecture_id", lecture_id);
    formData.append("resource_type", resource_type);
    formData.append("resource_title", resource_title);

    if (resource_type === "url" && resource_Url) {
      formData.append("resource_url", resource_Url);
    } else if (resource_type === "video" && resource_file instanceof File) {
      formData.append("resource_url", resource_file);
      formData.append("is_video", "true"); // Optional: backend can use this flag
    } else if (resource_type === "document" && resource_file instanceof File) {
      formData.append("resource_url", resource_file);
      formData.append("is_document", "true"); // Optional: backend can use this flag
    } else {
      formData.append("resource_url", "");
    }

    // Optional: for debugging
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await axios.post(
      `${baseUrl}/recorded-lecture-resources/create`,
      formData,
      {
        ...authorizationObj,
        headers: {
          ...authorizationObj?.headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data.status === 201;
  } catch (error: any) {
    console.error("Error response:", error?.response);
    throw new Error(error?.response?.data?.message || "Error adding resource");
  }
};
const editResources = async (
  resource_id: string,
  lecture_id: string,
  resource_type: "url" | "video" | "document",
  resource_Url: string,
  resource_title: string,
  resource_file?: File
) => {
  try {
    const formData = new FormData();
    formData.append("lecture_id", lecture_id);
    formData.append("resource_type", resource_type);
    formData.append("resource_title", resource_title);

    if (resource_type === "url" && resource_Url) {
      formData.append("resource_url", resource_Url);
    } else if ((resource_type === "video" || resource_type === "document") && resource_file instanceof File) {
      formData.append("resource_url", resource_file);
    } else {
      formData.append("resource_url", "");
    }

    const response = await axios.post(
      `${baseUrl}/recorded-lecture-resources/update/${resource_id}`,
      formData,
      {
        ...authorizationObj,
        headers: {
          ...authorizationObj?.headers,
          "Content-Type": "multipart/form-data",
        },
      }
    );
       console.log("resources_id",resource_id);


    return response.data.status === 201;
  } catch (error: any) {
    console.error("Error response:", error?.response);
    throw new Error(error?.response?.data?.message || "Error updating resource");
  }
};


  const fetchResouces = async (quizid: string) => {
    // console.log("quizid",quizid);
  try {
    const response = await axios.get(`${baseUrl}/recorded-lecture-resources/${quizid}`, authorizationObj);
    if (response.data && response.data.data) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching QuizQuestions:', error);
    return [];
  }
};
  // const deleteResoources = async (resources_id: string) => {
  //   try {
  //     const response = await axios.delete(
  //       `${baseUrl}/recorded-lecture-resources/delete/${resources_id}`,
  //       authorizationObj
  //     );
  //     console.log("response",response);

  //     if (response.data.status === 200) {
  //       await fetchSections();
  //       window.location.reload();
  //       return true;
  //     }
  //     return false;
  //   } catch (error: any) {
  //     throw new Error(error.response?.data?.message || 'Error deleting section');
  //   }
  // };

  const deleteResoources = async (
  resources_id: string,
  lecture_id: string
) => {
  console.log("resources_id",resources_id);
  try {
    const response = await axios.delete(
      `${baseUrl}/recorded-lecture-resources/delete/${resources_id}`,
      authorizationObj
    );


    if (response.status === 200) {
      // Immediately update local state
      setSections((prevSections) =>
        prevSections.map((section) => ({
          ...section,
          lectures: section.lectures.map((lecture) =>
            lecture.lecture_id === lecture_id
              ? {
                  ...lecture,
                  resources: lecture.resources?.filter(
                    (res) => res.resource_id !== resources_id
                  ),
                }
              : lecture
          ),
        }))
      );

      return true;
    }
    return false;
  } catch (error: any) {
    console.error("Delete resource error:", error);
    throw new Error(error.response?.data?.message || "Error deleting resource");
  }
};


  const addLecture = async (
    sectionId: string,
    title: string,
    description: string,
    classDate: string,
    classTime: string,
     videoFile: File | string | undefined | null,
    duration: string
  ) => {
    try {
      const formData = new FormData();
      formData.append('section_id', sectionId);
      formData.append('course_id', courseId);
      formData.append('instructor_id', currentUser?.user_id);
      formData.append('lecture_title', title);         // Use 'lecture_title' if that's what backend expects
      formData.append('content', description);         // Use 'content' if that's what backend expects
      formData.append('class_date', classDate);
      formData.append('class_time', classTime);
      formData.append('lecture_duration', duration);   // Add the duration here

      if (videoFile) {
        formData.append('lecture_video', videoFile);
      }

      const response = await axios.post(
        `${baseUrl}/lectures/create`,
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
  const addQuiz = async (
    sectionId: string,
    title: string,
    description: string,

  ) => {
    try {

      const formData = new FormData();
      formData.append('section_id', sectionId);
      formData.append('title', title);         // Use 'lecture_title' if that's what backend expects
      formData.append('description', description);         // Use 'content' if that's what backend expects


      const response = await axios.post(
        `${baseUrl}/quizzes/create`,
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
  const EditQuiz = async (
    quiz_id:String,
    sectionId: string,
    title: string,
    description: string,

  ) => {
    try {

      const formData = new FormData();
      formData.append('section_id', sectionId);
      formData.append('title', title);         // Use 'lecture_title' if that's what backend expects
      formData.append('description', description);         // Use 'content' if that's what backend expects


      const response = await axios.post(
        `${baseUrl}/quizzes/update/${quiz_id}`,
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
    const DeleteQuiz = async (
    quiz_id:String,
   

  ) => {
    try {
      const response = await axios.delete(
        `${baseUrl}/quizzes/delete/${quiz_id}`,
    
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj?.headers,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === 201) {
        // await fetchSections();
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error adding lecture');
    }
  };
  const addQAns = async (
    quiz_id: string,
    question_text: string,
    answers: { answer_text: string; is_correct: boolean }[]
  ) => {
    try {
      const formData = new FormData();

      formData.append("quiz_id", quiz_id);
      formData.append("question_text", question_text);

      // Convert answers array to JSON string
      formData.append("answers", JSON.stringify(answers));

     
      const response = await axios.post(
        `${baseUrl}/questions/create`,
        formData,
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj?.headers,
            'Content-Type': 'multipart/form-data', // Must be explicitly set
          },
        }
      );

      if (response.status === 201 || response.data.success) {
        message.success("Question added successfully");

        return true;
      }

      return false;
    } catch (error: any) {
      console.error("Error saving question:", error);
      message.error(error.response?.data?.message || "Error adding question");
      return false;
    }
  };

  const updateQAns = async (
  questionId: string,
  sectionId: string,
  question_text: string,
  answers: { answer_text: string; is_correct: boolean }[]
) => {
  try {
    const formData = new FormData();

    formData.append("question_text", question_text);
    formData.append("answers", JSON.stringify(answers));

    const response = await axios.post( // Changed to PUT for update
      `${baseUrl}/questions/update/${questionId}`, // Updated endpoint
      formData,
      {
        ...authorizationObj,
        headers: {
          ...authorizationObj?.headers,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (response.status === 200 || response.data.success) { // Changed to 200 for update
      message.success("Question updated successfully");
      return true;
    }

    return false;
  } catch (error: any) {
    console.error("Error updating question:", error);
    message.error(error.response?.data?.message || "Error updating question");
    throw error; // Throw error to handle it in the component
  }
};

 const deleteAns = async (questionId: string) => {
  try {

    const response = await axios.delete(
      `${baseUrl}/questions/delete/${questionId}`,
      authorizationObj
    );

    if (response.data.status === 200) {
      await fetchSections();
      message.success('Question deleted successfully');
      return true;
    }
    return false;
  } catch (error: any) {
    message.error(error.response?.data?.message || 'Error deleting question');
    throw new Error(error.response?.data?.message || 'Error deleting question');
  }
};

  const updateLecture = async (
    lectureId: string,
    sectionId: string,
    title: string,
    description: string,
    classDate: string,
    classTime: string,
 videoFile: File | string | undefined | null,
    duration: string
  ) => {
    try {
      const formData = new FormData();
      formData.append('lecture_title', title);
      formData.append('content', description);
      formData.append('class_date', classDate);
      formData.append('class_time', classTime);
      formData.append('section_id', sectionId);
      formData.append('course_id', courseId);
      formData.append('instructor_id', currentUser?.user_id);
      formData.append('lecture_duration', duration);
      if (videoFile) {
        formData.append('video', videoFile);
      }

      const response = await axios.post(
        `${baseUrl}/lectures/update/${lectureId}`,
        formData,
        {
          ...authorizationObj,
          headers: {
            ...authorizationObj.headers,
            'Content-Type': 'multipart/form-data',
          },
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
        `${baseUrl}/lectures/delete/${lectureId}`,
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
    deleteResoources,
    addLecture,
    updateLecture,
    deleteLecture,
    refreshSections: fetchSections,
    addQuiz,
    EditQuiz,
    fetchQuiz,
    addQAns,
    DeleteQuiz,
    updateQAns,
    deleteAns,
    addResources,
    editResources,
    
  };
}; 