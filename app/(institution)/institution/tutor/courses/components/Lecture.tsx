
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
import Image from 'next/image'
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import { SingleLecture } from "./SingleLecture";
export const Lecture = ({ singleCourse, is_loading, set_is_loading, set_error_message, set_success_message, section_id }: any) => {

    const lectureMediaRef: any = React.useRef()
    const [lectures, set_lectures] = React.useState<any[]>([])
    const [lecture_title, set_lecture_title] = React.useState("")
    const [lecture_video, set_lecture_video] = React.useState<any>("")
    const [lecture_video_url, set_lecture_video_url] = React.useState<string | null>(null);
    const [lecture_media_type, set_lecture_media_type] = React.useState("")

    const [alertData, setAlertdata] = React.useState<any>(null)
    const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false)
    const [lecture_description, set_lecture_description] = React.useState("")

    React.useEffect(() => {
        get_lectures()
    }, [singleCourse?.course_id])

    React.useEffect(() => {
        return () => {
            if (lecture_video_url) {
                URL.revokeObjectURL(lecture_video_url);
            }
        }
    })

    const get_lectures = async () => {
        if (!section_id || section_id?.trim() === "") return
        try {
            const resp = await axios.get(`${baseUrl}/lectures/by-section/${section_id}`, authorizationObj)
            if (resp?.data?.data && resp?.data?.data?.length && resp?.data?.data[0]) {
                set_lectures(resp?.data?.data)
            }
        } catch (error) {
            // console.error(error)
            set_lectures([])
        }
    }

    const create_lecture = async () => {
        if (!section_id || section_id?.trim() === "") return
        if (!lecture_media_type) return

        if (!lecture_title || lecture_title.trim() === "") {
            set_error_message("Lecture title is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!lecture_description || lecture_description.trim() === "") {
            set_error_message("Lecture description is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        if (!lecture_video) {
            set_error_message("Lecture media is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData()

        formData.append("lecture_title", lecture_title)
        formData.append("section_id", section_id)
        formData.append("lecture_video", lecture_video)
        formData.append("file_type", lecture_media_type)
        formData.append("content", lecture_description)

        try {
            set_is_loading(true)
            const resp = await axios.post(`${baseUrl}/lectures/create`, formData, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
            }
            set_lecture_title("")
            set_lecture_description("")
            set_lecture_video(null)
            get_lectures()
            set_success_message("Lecture added Sucessfully")
            set_lecture_video_url(null)
            set_lecture_media_type("")
            lectureMediaRef.current = ""
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
        } catch (error) {
            // console.error(error);
            set_is_loading(false)
            set_error_message("Failed to add the lecture");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file: any = e.target.files[0];
            set_lecture_video(file);
            set_lecture_media_type(file.type);
            if (lecture_video_url) {
                URL.revokeObjectURL(lecture_video_url);
            }
            set_lecture_video_url(null);
            setTimeout(() => {
                set_lecture_video_url(URL.createObjectURL(file));
            }, 0);
        }
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
            <AccordionMUI
                title={
                    <Typography variant="h6" sx={{ fontWeight: "semi-bold" }}>Lectures</Typography>
                }
                summary={
                    <Grid container spacing={2} sx={{ marginTop: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: "semi-bold", marginLeft: "16px" }}>Create a lecture</Typography>
                        <Grid item xs={12}>
                            <TextField
                                label="Lecture Title"
                                value={lecture_title || ""}
                                variant="outlined"
                                sx={{ marginBottom: 1, width: "100%" }}
                                onChange={(e: any) => set_lecture_title(e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Markdown
                                label="Lecture Description"
                                value={lecture_description}
                                onChange={(text: any) => set_lecture_description(text)}
                            />
                        </Grid>
                        <Grid item xs={12}
                            sx={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
                        >
                            <input type="file" id="lecture-create-video" hidden={lecture_video}
                                accept="video/*, image/*" multiple={false}
                                onChange={handleVideoChange}
                                className="cursor-pointer"
                                ref={lectureMediaRef}
                            />
                            <label htmlFor="lecture-create-video">
                                {
                                    lecture_video_url ?
                                        (
                                            lecture_media_type?.startsWith("image") ?
                                                <><Image src={lecture_video_url} alt="lecture media"
                                                    className="h-[300px] object-cover object-center cursor-pointer border"
                                                /></>
                                                :
                                                lecture_media_type?.startsWith("video") ?
                                                    <><video src={lecture_video_url} controls
                                                        className="h-[300px] bg-black cursor-pointer border"
                                                        onClick={() => document.getElementById("lecture-create-video")?.click()}
                                                    /></>
                                                    : null
                                        )
                                        : null
                                }
                            </label>
                        </Grid>
                        <Grid item xs={12}
                            sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "8px" }}
                        >
                            <Button
                                color="secondary" variant="contained" disabled={is_loading}
                                sx={{ width: "200px" }}
                                onClick={create_lecture}
                            >{is_loading ? "Adding..." : "Add Lecture"}</Button>
                        </Grid>
                        <Typography variant="h6" sx={{ fontWeight: "semi-bold", marginLeft: "16px", marginTop: "16px" }}>All lectures</Typography>
                        {
                            lectures?.map((lecture: any, i: number) => (
                                <Grid item xs={12} key={i}>
                                    <SingleLecture
                                        lecture={lecture}
                                        section_id={section_id}
                                        singleCourse={singleCourse}
                                        is_loading={is_loading}
                                        set_is_loading={set_is_loading}
                                        set_error_message={set_error_message}
                                        set_success_message={set_success_message}
                                        get_lectures={get_lectures}
                                    />
                                </Grid>
                            ))
                        }
                    </Grid>
                }
            />
        </>
    )
}