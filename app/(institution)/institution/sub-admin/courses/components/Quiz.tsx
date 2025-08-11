import "./Main.css";
import * as React from "react";
import {
     Grid, TextField, Typography,
    Button,
} from "@mui/material";
import ConfirmAlertMUI from "@/app/components/mui/ConfirmAlertMUI";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import AccordionMUI from "@/app/components/mui/AccordionMUI";
import 'react-markdown-editor-lite/lib/index.css';
import Markdown from "@/app/components/markdown/Markdown";
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import { QuestionAnswers } from "./QuestionAnswers";
export const Quiz = ({ singleCourse, is_loading, set_is_loading, set_error_message, set_success_message, section_id }: any) => {

    const [quiz, set_quiz] = React.useState<any>(null)
    const [quiz_title, set_quiz_title] = React.useState("")
    const [quiz_description, set_quiz_description] = React.useState("")

    const [alertData, setAlertdata] = React.useState<any>(null)
    const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false)

    React.useEffect(() => {
        get_quiz()
    }, [singleCourse?.course_id])

    const get_quiz = async () => {
        if (!section_id || section_id?.trim() === "") return
        try {
            const resp = await axios.get(`${baseUrl}/quizzes/${section_id}`, authorizationObj)
            if (resp?.data?.data) {
                set_quiz(resp?.data?.data)
                set_quiz_title(resp?.data?.data?.title)
                set_quiz_description(resp?.data?.data?.description)
            }
        } catch (error) {
            // console.error(error)
            set_quiz(null)
        }
    }

    const create_quiz = async () => {
        if (!section_id || section_id?.trim() === "") return

        if (!quiz_title || quiz_title.trim() === "") {
            set_error_message("Quiz title is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!quiz_description || quiz_description.trim() === "") {
            set_error_message("Quiz description is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData()

        formData.append("title", quiz_title)
        formData.append("description", quiz_description)
        formData.append("section_id", section_id)

        try {
            set_is_loading(true)
            const resp = await axios.post(`${baseUrl}/quizzes/create`, formData, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
            }
            set_quiz_title("")
            get_quiz()
            set_success_message("Quiz added Sucessfully")
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
        } catch (error) {
            // console.error(error);
            set_is_loading(false)
            set_error_message("Failed to add the quiz");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    }

    const update_quiz = async () => {
        if (!quiz) return
        if (!quiz?.quiz_id || quiz?.quiz_id?.trim() === "") return

        if (!quiz_title || quiz_title.trim() === "") {
            set_error_message("Quiz title is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!quiz_description || quiz_description.trim() === "") {
            set_error_message("Quiz description is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData()

        formData.append("title", quiz_title)
        formData.append("description", quiz_description)
        formData.append("section_id", section_id)

        try {
            set_is_loading(true)
            const resp = await axios.post(`${baseUrl}/quizzes/update/${quiz?.quiz_id}`, formData, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
            }
            set_quiz_title("")
            get_quiz()
            set_success_message("Quiz updated Sucessfully")
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
        } catch (error) {
            // console.error(error);
            set_is_loading(false)
            set_error_message("Failed to update the quiz");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }

    }

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
            <AccordionMUI
                title={<Typography variant="h6" sx={{ fontWeight: "semi-bold" }}>Quiz</Typography>}
                summary={
                    <Grid container spacing={2} sx={{ marginTop: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: "semi-bold", marginLeft: "16px", marginBottom: "16px", marginTop: "8px" }}>Create or update a quiz</Typography>
                        <Grid item xs={12}>
                            <TextField
                                label="Quiz Title"
                                value={quiz_title || ""}
                                variant="outlined"
                                sx={{ marginBottom: 1, width: "100%" }}
                                onChange={(e: any) => set_quiz_title(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Markdown
                                label="Quiz Description"
                                value={quiz_description}
                                onChange={(text: any) => set_quiz_description(text)}
                            />
                        </Grid>
                        <Grid item xs={12}
                            sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "8px" }}
                        >
                            <Button
                                color="secondary" variant="contained" disabled={is_loading}
                                sx={{ width: "200px" }}
                                onClick={quiz ? update_quiz : create_quiz}
                            >{
                                    quiz ?
                                        is_loading ? "Updating..." : "Save Changes"
                                        :
                                        is_loading ? "Adding..." : "Add Quiz"
                                }</Button>
                        </Grid>
                        <QuestionAnswers
                            section_id={section_id}
                            singleCourse={singleCourse}
                            is_loading={is_loading}
                            set_is_loading={set_is_loading}
                            set_error_message={set_error_message}
                            set_success_message={set_success_message}
                            quiz={quiz}
                        />
                    </Grid>
                }
            />
        </>
    )
}