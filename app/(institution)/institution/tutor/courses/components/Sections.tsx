import "./Main.css";
import * as React from "react";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import ConfirmAlertMUI from "@/app/components/mui/ConfirmAlertMUI";
import MainEditableAccordionMUI from "@/app/components/mui/EditableAccordionMUI";
import 'react-markdown-editor-lite/lib/index.css';
import Markdown from "@/app/components/markdown/Markdown";
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import { Quiz } from "./Quiz";
import { Lecture } from "./Lecture";
import { Button } from "react-bootstrap";

export const Sections = ({ singleCourse }: any) => {
    console.log("singleCourse", singleCourse);
    const [course_sections, set_course_sections] = React.useState<any[]>([]);
    const [section_title, set_section_title] = React.useState("");
    const [section_description, set_section_description] = React.useState("");
    const [alertData, setAlertdata] = React.useState<any>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
    const [openModal, setOpenModal] = React.useState<boolean>(false);
    const [is_loading,set_is_loading] =React.useState<boolean>(false);
    const[is_set_error_message,set_error_message] =React.useState<string | null>(null);
    const [is_success_message, set_success_message] = React.useState<string | null>(null); // State for success message

    React.useEffect(() => {
        get_course_sections();
    }, [singleCourse?.course_id]);

    const get_course_sections = async () => {
        if (!singleCourse?.course_id || singleCourse?.course_id.trim() === "") return;
        try {
            const resp = await axios.get(`${baseUrl}/course-sections/by-course/${singleCourse?.course_id}`, authorizationObj);
            if (resp?.data?.data && resp?.data?.data?.length && resp?.data?.data[0]) {
                set_course_sections(resp?.data?.data);
            }
        } catch (error) {
            set_course_sections([]);
        }
    };

    const create_course_section = async () => {
        console.log("Here again", singleCourse?.course_id);
        if (!singleCourse?.course_id || singleCourse?.course_id.trim() === "") return;

        if (!section_title || section_title.trim() === "") {
            set_error_message("Unit title is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!section_description || section_description.trim() === "") {
            set_error_message("Unit description is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData();

        formData.append("title", section_title);
        formData.append("description", section_description);
        formData.append("course_id", singleCourse?.course_id);

        try {
            set_is_loading(true);
            const resp = await axios.post(`${baseUrl}/course-sections/create`, formData, authorizationObj);
            set_is_loading(false);
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message);
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
            }
            set_section_title("");
            get_course_sections();
            set_success_message("Course unit created Successfully");
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
            setOpenModal(false); // Close the modal after creation
        } catch (error) {
            set_is_loading(false);
            set_error_message("Failed to add the course unit");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    };

    const update_course_section = async (title: string, description: string, sectionId: string) => {
        if (!singleCourse?.course_id || singleCourse?.course_id.trim() === "") return;
        if (!sectionId || sectionId?.trim() === "") return;

        if (!title || title.trim() === "") {
            set_error_message("Unit title is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!description || description.trim() === "") {
            set_error_message("Unit description is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData();

        formData.append("title", title);
        formData.append("description", description);
        formData.append("course_id", singleCourse?.course_id);

        try {
            set_is_loading(true);
            const resp = await axios.post(`${baseUrl}/course-sections/update/${sectionId}`, formData, authorizationObj);
            console.log("resp", resp);
            set_is_loading(false);
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message);
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
            }
            set_success_message("Unit Updated Successfully");
            get_course_sections();
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
        } catch (error) {
            set_is_loading(false);
            set_error_message("Failed to update the Unit");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    };

    const delete_course_section = async (sectionId: string) => {
        if (!singleCourse?.course_id || singleCourse?.course_id.trim() === "") return;
        if (!sectionId || sectionId?.trim() === "") return;

        try {
            set_is_loading(true);
            const resp = await axios.delete(`${baseUrl}/course-sections/delete/${sectionId}`, authorizationObj);
            set_is_loading(false);
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message);
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
            }
            setIsAlertOpen(false);
            set_success_message("Unit Deleted Successfully");
            get_course_sections();
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
        } catch (error) {
            setIsAlertOpen(false);
            set_is_loading(false);
            set_error_message("Failed to delete the unit");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    };

    const delete_section_confirmation = (sectionId: string) => {
        setAlertdata({
            title: "Delete Unit?",
            description: "Are you sure you want to delete this unit? This action cannot be undone.",
            fun: () => delete_course_section(sectionId),
        });
        setIsAlertOpen(true);
    };

    return (
        <>
            <ConfirmAlertMUI
                open={isAlertOpen}
                setOpen={setIsAlertOpen}
                title={alertData?.title}
                description={alertData?.description}
                fun={alertData?.fun}
                isLoading={is_loading}
            />

            {/* Bootstrap Modal */}
            <div className={`modal fade ${openModal ? 'show' : ''}`} style={{ display: openModal ? 'block' : 'none' }} tabIndex={-1} aria-labelledby="createCourseUnitModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="createCourseUnitModalLabel">Create Course Unit</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setOpenModal(false)}></button>
                        </div>
                        <div className="modal-body">
                            <hr />
                            <div className="mb-3">
                                <label htmlFor="unitTitle" className="form-label">New Unit Title</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="unitTitle"
                                    value={section_title || ""}
                                    
                                    onChange={(e) => set_section_title(e.target.value)}
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="unitDescription" className="form-label">Unit Description</label>
                                <textarea
                                    id="unitDescription"
                                    className="form-control"
                                    rows={3}
                                    value={section_description || ""}
                                    onChange={(e) => set_section_description(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button variant="contained" type="button"  className="btn btn-primary rounded-pill px-2 py-2" onClick={() => setOpenModal(false)}>Cancel</Button>
                            <Button
                                variant="contained" type="button"  className="btn btn-primary rounded-pill px-2 py-2"
                                onClick={create_course_section}
                                disabled={is_loading}
                            >
                                {is_loading ? "Creating..." : "Create Unit"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add New Unit Button */}
            <div className="d-flex justify-content-end">
                <Button
                    variant="contained" type="button"  className="btn btn-primary rounded-pill px-3 py-3"
                    onClick={() => setOpenModal(true)}
                >
                    Add New Unit
                </Button>
            </div>

            {/* Course Sections */}
            <div className="row mt-3">
                {course_sections?.map((sec: any, i: number) => (
                    <div className="col-12 mb-3" key={i}>
                        <MainEditableAccordionMUI
                            onEdit={(title: any, description: any) => update_course_section(title, description, sec?.section_id)}
                            onDelete={() => delete_section_confirmation(sec?.section_id)}
                            time={sec?.created_at}
                            title={sec?.title}
                            description={sec?.description}
                            summary={
                                <>
                                    <Lecture
                                        section_id={sec?.section_id}
                                        singleCourse={singleCourse}
                                        is_loading={is_loading}
                                        set_is_loading={set_is_loading}
                                        set_error_message={set_error_message}
                                        set_success_message={set_success_message}
                                    />
                                    <Quiz
                                        section_id={sec?.section_id}
                                        singleCourse={singleCourse}
                                        is_loading={is_loading}
                                        set_is_loading={set_is_loading}
                                        set_error_message={set_error_message}
                                        set_success_message={set_success_message}
                                    />
                                </>
                            }
                        />
                    </div>
                ))}
            </div>
        </>
    );
};
