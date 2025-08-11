

import "./Main.css";
import * as React from "react";
import {
    Grid, Typography, Divider,
    Button, Box, Modal

} from "@mui/material";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import 'react-markdown-editor-lite/lib/index.css';
import Markdown from "@/app/components/markdown/Markdown-1";
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';

//, is_loading, set_is_loading, set_error_message, set_success_message

export const AdditionalInfo = ({ singleCourse }: any) => {

    const [course_additional_information, set_course_additional_information] = React.useState<any>(null)
    const [old_info, set_old_info] = React.useState(false)
    const [modalOpen, setModalOpen] = React.useState(false);
    const [error_message, set_error_message] = React.useState<string | null>(null);
    const[is_loading, set_is_loading] = React.useState(false);
    const [success_message, set_success_message] = React.useState<string | null>(null);
console.log("singleCourse", singleCourse);
    React.useEffect(() => {
        set_old_info(
            course_additional_information?.requirements &&
            course_additional_information?.what_you_will_learn &&
            course_additional_information?.who_is_for
        )
    }, [course_additional_information])

    React.useEffect(() => {
        set_requirements(course_additional_information?.requirements)
        set_what_you_will_learn(course_additional_information?.what_you_will_learn)
        set_who_is_for(course_additional_information?.who_is_for)
    }, [course_additional_information])

    React.useEffect(() => {
        get_course_additional_information()
    }, [singleCourse?.course_id])

    const [requirements, set_requirements] = React.useState(course_additional_information?.requirements)
    const [what_you_will_learn, set_what_you_will_learn] = React.useState(course_additional_information?.what_you_will_learn)
    const [who_is_for, set_who_is_for] = React.useState(course_additional_information?.who_is_for)

    const get_course_additional_information = async () => {
        if (!singleCourse?.course_id || singleCourse?.course_id.trim() === "") return
        try {
            const resp = await axios.get(`${baseUrl}/courses/${singleCourse?.course_id}/additional`, authorizationObj)
            if (resp?.data?.data && resp?.data?.data?.length && resp?.data?.data[0]) {
                set_course_additional_information(resp?.data?.data[0])
            }
        } catch (error) {
            // console.error(error)
            set_course_additional_information(null)
        }
    }

    const create_course_additional_information = async () => {
        console.log("create_course_additional_information")
        console.log(singleCourse)
        if (!singleCourse?.course_id || singleCourse?.course_id.trim() === "") return

        if (!requirements || requirements.trim() === "") {
            set_error_message("Course requirements are required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!what_you_will_learn || what_you_will_learn.trim() === "") {
            set_error_message("Course results are required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!who_is_for || who_is_for.trim() === "") {
            set_error_message("Please specify who the course is for.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData()

        formData.append("who_is_for", who_is_for)
        formData.append("requirements", requirements)
        formData.append("what_you_will_learn", what_you_will_learn)

        try {
            set_is_loading(true)
            const resp = await axios.post(`${baseUrl}/courses/${singleCourse?.course_id}/additional/create`, formData, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
                return
            }
            set_success_message("Course Information added Sucessfully")
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
            set_old_info(true)
            get_course_additional_information()
        } catch (error) {
            // console.error(error);

            const resp = await axios.post(`${baseUrl}/courses/${singleCourse?.course_id}/additional/create`, formData, authorizationObj)
            console.log("resp", resp)
            // set_is_loading(false)
            set_error_message("Failed to add the course information");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    }

    const update_additional_info = async () => {

        if (!singleCourse?.course_id || singleCourse?.course_id.trim() === "") return
        if (!course_additional_information?.course_additional_id || course_additional_information?.course_additional_id.trim() === "") return

        if (!requirements || requirements.trim() === "") {
            set_error_message("Course requirements are required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!what_you_will_learn || what_you_will_learn.trim() === "") {
            set_error_message("Course results are required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!who_is_for || who_is_for.trim() === "") {
            set_error_message("Please specify who the course is for.");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData()

        formData.append("who_is_for", who_is_for)
        formData.append("requirements", requirements)
        formData.append("what_you_will_learn", what_you_will_learn)

        try {
            set_is_loading(true)
            const resp = await axios.post(`${baseUrl}/courses/${singleCourse?.course_id}/additional/update/${course_additional_information?.course_additional_id}`, formData, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
                return
            }
            set_success_message("Course Information Updated Sucessfully")
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
            get_course_additional_information()
        } catch (error) {
            // console.error(error);
            set_is_loading(false)
            set_error_message("Failed to update the course information");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    }
    const handleOpenModal = () => {
        // Clear modal fields
        set_requirements("");
        set_what_you_will_learn("");
        set_who_is_for("");
        setModalOpen(true);
    };
    

    return (
        <>
            <div className="mt-4 border-top"></div>
            <h6 className="fw-semibold mt-2 p-3">More Info</h6>

            {old_info ? (
                <div className="p-3">
                    <Typography variant="subtitle1"><strong>Requirements:</strong></Typography>
                    <Typography variant="body2" className="mb-2">
                        <span dangerouslySetInnerHTML={{ __html: requirements }} />
                    </Typography>

                    <Typography variant="subtitle1"><strong>What You Will Learn:</strong></Typography>
                    <Typography variant="body2" className="mb-2"><span dangerouslySetInnerHTML={{ __html: requirements }} /></Typography>

                    <Typography variant="subtitle1"><strong>Who Is This For:</strong></Typography>
                    <Typography variant="body2"><span dangerouslySetInnerHTML={{ __html: requirements }} /></Typography>

                    <div className="d-flex justify-content-end mt-3 ">
                        <Button variant="contained" className="btn-view" onClick={() => setModalOpen(true)}>Edit Additional Info</Button>
                    </div>
                </div>
            ) : (
                <div className="p-3">
                    <Typography variant="body1">No additional information available. Please add.</Typography>
                    <div className="d-flex justify-content-end mt-2">
                        <Button variant="contained" className="btn-view" onClick={() => setModalOpen(true)}>Add Additional Info</Button>
                    </div>
                </div>
            )}

           {/* Modal for the form */}
           <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
    <Box
        sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
        }}
    >
        {/* Sticky Header */}
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                // backgroundColor: '#0f4b76',
                color: 'white',
                padding: '16px 24px',
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
                zIndex: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <h3 className="heading-style">Edit Additional Info</h3>
              <Button
              className="ms-auto btn-view text-white"
                onClick={() => setModalOpen(false)}
                variant="text"
                // sx={{ color: 'white', minWidth: 0 }}
            >
                ✕
            </Button>
        </Box>

        {/* Scrollable Body */}
        <Box
            sx={{
                overflowY: 'auto',
                flexGrow: 1,
                padding: '24px',
            }}
        >
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Markdown
                        label="Requirements"
                        value={requirements}
                        onChange={(text) => set_requirements(text)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Markdown
                        label="What You Will Learn?"
                        value={what_you_will_learn}
                        onChange={(text) => set_what_you_will_learn(text)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Markdown
                        label="Who Is This For?"
                        value={who_is_for}
                        onChange={(text) => set_who_is_for(text)}
                    />
                </Grid>
            </Grid>
        </Box>

        {/* Sticky Footer */}
        <Box
            sx={{
                position: 'sticky',
                bottom: -400,
                // backgroundColor: '#0f4b76',
                padding: '16px 24px',
                borderBottomLeftRadius: 8,
                borderBottomRightRadius: 8,
                zIndex: 2,
            }}
        >
            <div className="d-flex justify-content-center align-content-center">
            <Button
                variant="contained"
                className="btn-view"
                disabled={is_loading}
                onClick={() => {
                    if (old_info) {
                        update_additional_info();
                    } else {
                        create_course_additional_information();
                    }
                    setModalOpen(false);
                }}
            >
                {is_loading ? "Saving..." : "Save Changes"}
            </Button>
            </div>
        </Box>
    </Box>
</Modal>
</>
    );

}
