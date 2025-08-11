import "./Accordion.css";
import "./Main.css";
import "@/app/globals.css";
import React, { useEffect, useRef, useState, useMemo } from "react";
import axios from "axios";
import { authorizationObj, baseUrl, lectureVideoPath } from "@/app/utils/core";
// import moment from "moment";
import { CompanyAvatar } from "@/app/(auth)/auth/signin/Main";
import { useSelector } from "react-redux";
// import { MdDownloadDone } from "react-icons/md";
import MuiMarkdown from "mui-markdown";
import { FaLock } from "react-icons/fa";
import { BsClock } from "react-icons/bs";

export const EnrollFirst = ({ medium }: any) => {
  return (
    <div className="w-100 d-flex align-items-start gap-2 px-4">
      <FaLock style={{ fontSize: "1.2em", marginTop: "3px" }} />
      <p className="w-100 text-start m-0">
        {medium} are locked, You have to enroll first
      </p>
    </div>
  );
};

export const Level3 = ({
  result,
  section,
  quiz,
  course,
  set_is_viewing,
}: any) => {
  const total_answers = result?.length;
  const true_answers = result?.filter((res: any) => res == true)?.length;
  const false_answers = result?.filter((res: any) => res == false)?.length;
  const percentage = (true_answers / total_answers) * 100;

  return (
    <div className="w-100 d-flex flex-column align-items-center gap-4 p-4">
      <div className="mt-4 pe-none">
        <CompanyAvatar />
      </div>
      <h2 className="fw-semibold fs-1 mt-2">KI Academy Quiz</h2>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <td className="py-2 px-4">
              <span className="fw-semibold">Total Questions: </span>
            </td>
            <td className="py-2 px-4">
              <span>{total_answers}</span>
            </td>
          </tr>
          <tr>
            <td className="py-2 px-4">
              <span className="fw-semibold">Right Answers: </span>
            </td>
            <td className="py-2 px-4">
              <span>{true_answers}</span>
            </td>
          </tr>
          <tr>
            <td className="py-2 px-4">
              <span className="fw-semibold">Wrong Answers: </span>
            </td>
            <td className="py-2 px-4">
              <span>{false_answers}</span>
            </td>
          </tr>
          <tr>
            <td className="py-2 px-4">
              <span className="fw-semibold">Percentage: </span>
            </td>
            <td className="py-2 px-4">
              <span>{`${percentage?.toFixed(2)}%`}</span>
            </td>
          </tr>
          <tr>
            <td className="py-2 px-4">
              <span className="fw-semibold">Result: </span>
            </td>
            <td className="py-2 px-4">
              <span>{percentage >= 70 ? "Passed" : "Failed"}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <button
        className="btn btn-outline-primary px-4 py-2 fs-5 mt-3"
        onClick={() => set_is_viewing(false)}
      >
        Back To Course
      </button>
    </div>
  );
};

export const SingleQuestion = ({
  question,
  result,
  set_result,
  index,
}: any) => {
  const handleChange = (e: any) => {
    const val = JSON.parse(e.target.value)?.text;
    const answers = JSON.parse(question?.answers);
    const answer = answers?.find((ans: any) => ans?.text === val);
    const is_correct = answer?.isCorrect;

    set_result((prevResult: any) => {
      const updatedResult = [...(prevResult || [])];
      updatedResult[index - 1] = is_correct;
      return updatedResult;
    });
  };

  return (
    <div className="w-100 d-flex flex-column align-items-start ps-2 gap-2">
      <p className="w-100 text-start text-secondary fs-4 mb-0">
        {`${index}) `} {question?.question_text}
      </p>
      <p className="w-100 text-start text-secondary fs-5 ps-4 mt-2 mb-2">
        {question?.description}
      </p>
      <div className="ms-4">
        {JSON.parse(question?.answers)?.map((ans: any, i: number) => (
          <div className="form-check" key={i}>
            <input
              className="form-check-input"
              type="radio"
              name={`question${index}`}
              value={JSON.stringify({ text: ans?.text, index: i })}
              onChange={handleChange}
            />
            <label className="form-check-label">{ans?.text}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Level2 = ({
  questions,
  result,
  set_result,
  set_quiz_level,
  quiz,
  course,
}: any) => {
  const currentUser = useSelector((state: any) => state?.user);
  const [is_loading, set_is_loading] = useState(false);
  const [all_answered, set_all_answered] = useState(false);
  const [error_message, set_error_message] = useState<null | string>(null);
  const [success_message, set_success_message] = useState<null | string>(null);

  useEffect(() => {
    const allAnswered =
      !result.includes(undefined) && result?.length == questions?.length;
    set_all_answered(allAnswered);
  }, [result]);

  const handleSubmit = async () => {
    if (!all_answered) return;

    const total_answers = result?.length;
    const true_answers = result?.filter((res: any) => res == true)?.length;
    const false_answers = result?.filter((res: any) => res == false)?.length;
    const percentage = ((true_answers / total_answers) * 100).toFixed(2);

    const quiz_resources = {
      total_answers,
      true_answers,
      false_answers,
      percentage,
    };

    const formData = new FormData();
    formData.append("quiz_id", quiz?.quiz_id);
    formData.append("course_id", course[0]?.course_id);
    formData.append("student_id", currentUser?.user_id);
    formData.append("quiz_resources", JSON.stringify(quiz_resources));

    try {
      set_is_loading(true);
      const resp = await axios.post(
        `${baseUrl}/quiz-results/create`,
        formData,
        authorizationObj
      );
      set_is_loading(false);
      if (resp?.data?.status < 200 || resp?.data?.status > 299) {
        set_error_message(resp?.data?.message);
        setTimeout(() => set_error_message(null), 3000);
        return;
      }
      set_success_message("Quiz submitted");
      setTimeout(() => set_success_message(null), 3000);
      set_quiz_level("3");
    } catch (error) {
      set_is_loading(false);
      set_error_message("Something went wrong, please try later");
      setTimeout(() => set_error_message(null), 3000);
    }
  };

  return (
    <>
      {error_message && (
        <div className="alert alert-danger" role="alert">
          {error_message}
        </div>
      )}
      {success_message && (
        <div className="alert alert-success" role="alert">
          {success_message}
        </div>
      )}
      <div className="w-100 d-flex flex-column align-items-start gap-4 p-4 overflow-auto">
        <div className="pe-none mb-2">
          <CompanyAvatar />
        </div>
        {questions?.map((question: any, i: number) => (
          <SingleQuestion
            key={i}
            question={question}
            result={result}
            set_result={set_result}
            index={i + 1}
          />
        ))}
        <div className="w-100 d-flex justify-content-end">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={!all_answered || is_loading}
            style={{ width: "200px" }}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export const Level1 = ({
  course,
  section,
  questions,
  set_quiz_level,
  quiz,
}: any) => {
  const currentUser = useSelector((state: any) => state?.user);

  return (
    <>
      <div className="w-100 d-flex flex-column align-items-center gap-4 p-4 mt-4">
        <div className="pe-none">
          <CompanyAvatar />
        </div>
        <h2 className="fw-semibold fs-1 mt-2">KI Academy Quiz</h2>
        <div className="align-self-start w-100 d-flex flex-column gap-4">
          <div className="ps-2">
            <MuiMarkdown>{quiz?.description}</MuiMarkdown>
          </div>
          <table className="table table-bordered">
            <tbody>
              <tr>
                <td className="py-2 px-4">
                  <span className="fw-semibold">Course: </span>
                </td>
                <td className="py-2 px-4">
                  <span>{course?.title || "Course"}</span>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4">
                  <span className="fw-semibold">Unit: </span>
                </td>
                <td className="py-2 px-4">
                  <span>{section?.title || "Course"}</span>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4">
                  <span className="fw-semibold">Total Questions: </span>
                </td>
                <td className="py-2 px-4">
                  <span>{questions?.length || "No Questions"}</span>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4">
                  <span className="fw-semibold">Passing Marks: </span>
                </td>
                <td className="py-2 px-4">
                  <span>{`70%`}</span>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4">
                  <span className="fw-semibold">Student Name: </span>
                </td>
                <td className="py-2 px-4">
                  <span>
                    {currentUser?.first_name} {currentUser?.last_name}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4">
                  <span className="fw-semibold">Instructor Name: </span>
                </td>
                <td className="py-2 px-4">
                  <span>
                    {course?.instructor_first_name}{" "}
                    {course?.instructor_last_name}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          className="btn btn-outline-primary px-4 py-2 fs-5 mt-3"
          onClick={() => set_quiz_level("2")}
        >
          Start Quiz
        </button>
      </div>
    </>
  );
};

export const QuizSection = ({
  questions,
  quiz,
  course,
  section,
  set_is_viewing,
}: any) => {
  const [quiz_level, set_quiz_level] = useState("1");
  const [result, set_result] = useState<any[]>([]);

  return quiz_level === "1" ? (
    <Level1
      course={course[0]}
      quiz={quiz}
      section={section}
      questions={questions}
      set_quiz_level={set_quiz_level}
    />
  ) : quiz_level === "2" ? (
    <Level2
      questions={questions}
      result={result}
      set_result={set_result}
      set_quiz_level={set_quiz_level}
      quiz={quiz}
      course={course}
    />
  ) : quiz_level === "3" ? (
    <Level3
      result={result}
      section={section}
      quiz={quiz}
      course={course}
      set_is_viewing={set_is_viewing}
    />
  ) : null;
};

export const QuestionAnswers = ({
  quiz,
  singleCourse,
  section_id,
  section,
}: any) => {
  return (
    <div className="timeline-item ps-4 mt-3 position-relative">
      <div
        className="timeline-line position-absolute"
        style={{
          left: "31px",
          top: "20px",
          bottom: "-35px",
          width: "1px",
          background: "#8C8A8A",
          zIndex: 0,
        }}
      />
      0000
      <div className="d-flex align-items-center gap-3">
        <div
          className="timeline-dot rounded-circle d-flex align-items-center justify-content-center position-relative"
          style={{
            width: "20px",
            height: "20px",
            background: "#ece8e8",
            border: "2px solid #d5d2d2",
            zIndex: 1,
            flexShrink: 0,
          }}
        ></div>
        <div
          className="timeline-content bg-white rounded-3 p-3 d-flex align-items-center"
          style={{ transition: "all 0.3s ease", cursor: "pointer" }}
        >
          <div className="d-flex align-items-center w-100">
            <div className="d-flex align-items-center gap-2">
              <p className="mb-0 fw-semibold">{"Quiz"}</p>
              <div className="ms-3 d-flex align-items-center gap-2 text-muted small">
                <span>📝</span>
                <span>Quiz Assessment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SingleLecture = ({ lecture, isLast, index }: any) => {
  return (
    <div className="timeline-item ps-4 mt-3 position-relative custom-line">
      {!isLast && <div className="timeline-line position-absolute" />}
      <div className="d-flex align-items-center gap-3">
        <div className="rounded-circle timeline-dot d-flex align-items-center justify-content-center position-relative"></div>
        <div
          className="timeline-content bg-white rounded-3 p-3 d-flex align-items-center"
          style={{ transition: "all 0.3s ease", cursor: "pointer" }}
        >
          <div className="d-flex align-items-center w-100">
            <div className="d-flex align-items-center gap-2">
              <p className="mb-0 fw-semibold">{lecture?.lecture_title}</p>
              {lecture?.duration && (
                <div className="ms-3 d-flex align-items-center gap-2 text-muted small">
                  <BsClock />
                  <span>{lecture.duration}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Lecture = ({ section_id, singleCourse }: any) => {
  const [lectures, setLectures] = React.useState<any[]>([]);
  const [quiz, setQuiz] = React.useState<any>(null);

  React.useEffect(() => {
    getLectures();
    getQuiz();
  }, [section_id]);

  const getLectures = async () => {
    if (!section_id || section_id?.trim() === "") return;
    try {
      const resp = await axios.get(
        `${baseUrl}/lectures/by-section/${section_id}`,
        authorizationObj
      );
      if (resp?.data?.data?.length) {
        setLectures(resp.data.data);
      }
    } catch (error) {
      setLectures([]);
    }
  };

  const getQuiz = async () => {
    if (!section_id || section_id?.trim() === "") return;
    try {
      const resp = await axios.get(
        `${baseUrl}/quizzes/${section_id}`,
        authorizationObj
      );
      if (resp?.data?.data) {
        setQuiz(resp.data.data);
      }
    } catch (error) {
      setQuiz(null);
    }
  };

  // Combine lectures and quiz into a single timeline
  const timelineItems = [
    ...lectures.map((lecture, index) => ({
      type: "lecture",
      data: lecture,
      isLast: index === lectures.length - 1 && !quiz,
    })),
    ...(quiz
      ? [
          {
            type: "quiz",
            data: quiz,
            isLast: true,
          },
        ]
      : []),
  ];

  return (
    <div className="timeline-container mt-4">
      {timelineItems.map((item, index) =>
        item.type === "lecture" ? (
          <SingleLecture
            key={`lecture-${item.data.lecture_id || index}`}
            lecture={item.data}
            isLast={item.isLast}
            index={index}
          />
        ) : (
          <div
            key={`quiz-${item.data.quiz_id}`}
            className="timeline-item ps-4 mt-3 position-relative"
          >
            {!item.isLast && (
              <div
                className="timeline-line position-absolute"
                style={{
                  left: "33px",
                  top: "20px",
                  bottom: "-35px",
                  width: "2px",
                  background: "#d5d2d2",
                  zIndex: 0,
                }}
              />
            )}
            <div className="d-flex align-items-center gap-3">
              <div
                className="timeline-dot rounded-circle d-flex align-items-center justify-content-center position-relative"
                style={{
                  width: "20px",
                  height: "20px",
                  background: "#ece8e8",
                  border: "2px solid #d5d2d2",
                  zIndex: 1,
                  flexShrink: 0,
                }}
              />
              <div
                className="timeline-content bg-white rounded-3 p-3 d-flex align-items-center"
                style={{
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                <div className="d-flex align-items-center w-100">
                  <div className="d-flex align-items-center gap-2">
                    <p className="mb-0 fw-semibold">
                      {item.data.title || "Quiz"}
                    </p>
                    <div className="ms-3 d-flex align-items-center gap-2 text-muted small">
                      <span>📝</span>
                      <span>Quiz Assessment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export const ContentReview = ({ content, singleCourse, sectionIndex }: any) => {
  const currentUser = useSelector((state: any) => state?.user);

  const show =
    singleCourse[0]?.is_enrolled ||
    singleCourse[0]?.instructor_id === currentUser?.user_id ||
    currentUser?.role_id === "1" ||
    (currentUser?.role_id === "4" && singleCourse[0]?.institute_id) ||
    (currentUser?.role_id === "5" && singleCourse[0]?.institute_id);

  return (
    <div className="accordion mt-4" id={`reviewAccordion${sectionIndex}`}>
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button
            className="accordion-button"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#reviewCollapse${sectionIndex}`}
          >
            <h5 className="fw-semibold">Content Review</h5>
          </button>
        </h2>
        <div
          id={`reviewCollapse${sectionIndex}`}
          className="accordion-collapse collapse show"
          data-bs-parent={`#reviewAccordion${sectionIndex}`}
        >
          <div className="accordion-body">
            <div className="container-fluid mt-2">
              {show ? (
                <MuiMarkdown>{content}</MuiMarkdown>
              ) : (
                <EnrollFirst medium="Reviews" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UnitContent = ({ content, singleCourse, show }: any) => {
  return (
    <div className="ps-4 mt-3">
      <div className="d-flex align-items-center gap-2">
        <div
          className="rounded-circle bg-light"
          style={{ width: "8px", height: "8px" }}
        ></div>
        <div className="d-flex align-items-center gap-2">
          <span className="text-primary">{content?.title}</span>
          {!show && <FaLock style={{ fontSize: "0.8em" }} />}
        </div>
      </div>
    </div>
  );
};

const AccordionComponent = ({ course }: any) => {
  const currentUser = useSelector((state: any) => state?.user);
  const [_course, set_course] = useState<any>(null);
  const [course_sections, set_course_sections] = useState<any[]>([]);

  useEffect(() => {
    if (course && Array.isArray(course) && course[0]) {
      set_course(course[0]);
    }
  }, [course]);

  useEffect(() => {
    if (_course?.course_id) {
      get_course_sections(_course.course_id);
    }
  }, [_course]);

  // Add this effect to handle accordion visibility
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Wait for DOM to be ready
      setTimeout(() => {
        const accordionBodies = document.querySelectorAll(
          ".accordion-collapse"
        );
        const accordionContents = document.querySelectorAll(".accordion-body");

        accordionBodies.forEach((body) => {
          if (body instanceof HTMLElement) {
            body.classList.remove("collapse");
            body.classList.add("collapse", "show");
          }
        });

        accordionContents.forEach((content) => {
          if (content instanceof HTMLElement) {
            content.style.visibility = "visible";
            content.style.display = "block";
          }
        });
      }, 100);
    }
  }, [course_sections]); // Run when sections are loaded

  const get_course_sections = async (courseId: string) => {
    if (!courseId?.trim()) return;
    try {
      const resp = await axios.get(
        `${baseUrl}/course-sections/by-course/${courseId}`,
        authorizationObj
      );
      if (resp?.data?.data?.length) {
        // Fetch lectures count for each section in parallel
        const sections = resp.data.data;
        const lectureCountPromises = sections.map(async (section: any) => {
          try {
            const lecturesResp = await axios.get(
              `${baseUrl}/lectures/by-section/${section.section_id}`,
              authorizationObj
            );
            const lectures = lecturesResp?.data?.data || [];
            const lecturesCount = lectures.length;
            // Sum up lecture_duration for all lectures in this section (convert seconds to minutes)
            const totalSeconds = lectures.reduce((acc: number, lecture: any) => {
              const duration = parseInt(lecture?.lecture_duration || "0", 10);
              return acc + (isNaN(duration) ? 0 : duration);
            }, 0);
            const totalMinutes = Math.ceil(totalSeconds / 60); // round up to nearest minute
            return {
              ...section,
              lecturesCount,
              duration: totalMinutes, // duration in minutes
            };
          } catch {
            return { ...section, lecturesCount: 0, duration: 0 };
          }
        });
        const sectionsWithCounts = await Promise.all(lectureCountPromises);
        set_course_sections(sectionsWithCounts);
      }
    } catch (error) {
      console.error("Error fetching course sections:", error);
      set_course_sections([]);
    }
  };

  const show = useMemo(() => {
    if (!course || !Array.isArray(course) || !course[0]) return false;

    return Boolean(
      course[0].is_enrolled ||
        course[0].instructor_id === currentUser?.user_id ||
        currentUser?.role_id === "1" ||
        (currentUser?.role_id === "4" && course[0].institute_id) ||
        (currentUser?.role_id === "5" && course[0].institute_id)
    );
  }, [course, currentUser]);

  if (!course || !Array.isArray(course)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container-fluid py-4">
      <div className="accordion" id="courseAccordion">
        {course_sections?.map((section, i) => (
          <div
            className="accordion-item mb-4 position-relative border-top-0 border-bottom-0 accordion-border border-right-0"
            key={i}
          >
            {/* Timeline connector line */}
            {i < course_sections.length - 1 && (
              <div
                className="position-absolute"
                style={{
                  left: "50px",
                  top: "100%",
                  width: "1px",
                  height: "3.7rem",
                  background: "#535252",
                  zIndex: 1,
                }}
              />
            )}

            {/* Unit Header with Timeline Dot */}
            <div className="accordion-header border-0" id={`heading${i}`}>
              <button
                className="accordion-button px-3 bg-transparent"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#section${i}`}
                aria-expanded="true"
                aria-controls={`section${i}`}
                style={{ boxShadow: "none" }}
              >
                <div className="d-flex flex-column w-100">
                  <div className="d-flex align-items-center gap-3 ps-4 py-3">
                    <div
                      className="rounded-circle bg-white d-flex align-items-center justify-content-center position-relative"
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "rgb(104, 100, 100) !important",
                        border: "2px solid rgb(136, 133, 133)",
                        zIndex: 2,
                      }}
                    ></div>
                    <span className="text-secondary">UNIT {i + 1}</span>
                  </div>

                  <div className="d-flex flex-column align-items-start ms-4">
                    <h3
                      className="mb-0 fs-4 fw-semibold"
                      style={{ color: "#475e75" }}
                    > 
                      {section?.title}
                    </h3>
                    <div className="d-flex align-items-center gap-2 text-secondary">
                      <span>{section?.lecturesCount ?? 0} Lessons</span>
                      <span>🎓</span>
                      <span>Unit {i + 1}</span>
                      <span>🕒</span>
                      <span>
                        {section?.duration >= 60
                          ? `${Math.floor(section.duration / 60)} hr${Math.floor(section.duration / 60) > 1 ? 's' : ''} ${section.duration % 60 ? (section.duration % 60) + ' min' : ''}`.trim()
                          : `${section?.duration ?? 0} min`}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
            {/* Collapsible Content */}
            <div
              id={`section${i}`}
              className="accordion-collapse collapse show"
              data-bs-parent="#courseAccordion"
            >
              <div className="accordion-body ms-4">
                <div className="mt-3">
                  <div className="row">
                    <div className="col-12 col-md-6 mb-3 mb-md-0">
                      <h6 className="mb-3 fw-semibold">Learning Objectives</h6>
                      {/* <p className="mb-2">
                        After completing this unit, you will be able to:
                      </p> */}
                      <MuiMarkdown>{section?.description}</MuiMarkdown>
                    </div>
                    <div className="col-12 col-md-6">
                      <h6 className="mb-3 fw-semibold">Content</h6>
                      <Lecture
                        section_id={section?.section_id}
                        singleCourse={course}
                        lecturesCount={section?.lecturesCount ?? 0}
                      />
                    </div>
                  </div>
                  {section?.content_review && (
                    <div className="mt-4">
                      <ContentReview
                        content={section?.content_review}
                        singleCourse={course}
                        sectionIndex={i}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccordionComponent;
