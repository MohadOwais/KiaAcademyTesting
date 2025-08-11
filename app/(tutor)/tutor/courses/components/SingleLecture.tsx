
import "./Main.css";
import * as React from "react";
import moment from "moment";
import defaultCourseImage from "../../../../../../public/images/banner.jpg"
import { IoMdEye } from "react-icons/io";
import {
     Grid, TextField, Typography, Divider,
    Button,
} from "@mui/material";
import ConfirmAlertMUI from "@/app/components/mui/ConfirmAlertMUI";
import axios from "axios";
import { authorizationObj, baseUrl, lectureVideoPath } from "@/app/utils/core";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import 'react-markdown-editor-lite/lib/index.css';
import Markdown from "@/app/components/markdown/Markdown";
import Image from 'next/image'
import 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
export const SingleLecture = ({ lecture, get_lectures, section_id, singleCourse, is_loading, set_is_loading, set_error_message, set_success_message }: any) => {

    const videoInputRef: any = React.useRef()

    const [isAlertOpen, setIsAlertOpen] = React.useState(false)
    const [alertData, setAlertdata] = React.useState<any>(null)
    const [lecture_title, set_lecture_title] = React.useState(lecture?.lecture_title)
    const [lecture_video, set_lecture_video] = React.useState<any>(null)
    const [lecture_video_url, set_lecture_video_url] = React.useState<any>(`${lectureVideoPath}/${lecture?.lecture_video_url}`)
    const [lecture_description, set_lecture_description] = React.useState(lecture?.content)
    const [media_type, set_media_type] = React.useState(lecture?.file_type)

    const update_lecture = async () => {

        if (!lecture?.lecture_id || lecture?.lecture_id?.trim() === "") return
        if (!section_id || section_id?.trim() === "") return

        if (!lecture_title || lecture_title?.trim() === "") {
            set_error_message("Lecture title is required");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
            return;
        }

        const formData = new FormData()

        formData.append("lecture_title", lecture_title)
        formData.append("section_id", section_id)
        if (lecture_video) {
            formData.append("lecture_video", lecture_video)
        }

        try {
            set_is_loading(true)
            const resp = await axios.post(`${baseUrl}/lectures/update/${lecture?.lecture_id}`, formData, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
            }
            set_success_message("Lecture Updated Sucessfully")
            get_lectures()
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
        } catch (error) {
            // console.error(error);
            set_is_loading(false)
            set_error_message("Failed to update the lecture");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    }

    const delete_lecture = async (lectureId: string) => {

        if (!lectureId || lectureId?.trim() === "") return

        try {
            set_is_loading(true)
            const resp = await axios.delete(`${baseUrl}/lectures/delete/${lectureId}`, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null);
                }, 3000);
            }
            setIsAlertOpen(false)
            set_success_message("Lecture Deleted Sucessfully")
            get_lectures()
            setTimeout(() => {
                set_success_message(null);
            }, 3000);
        } catch (error) {
            // console.error(error);
            setIsAlertOpen(false)
            set_is_loading(false)
            set_error_message("Failed to delete the lecture");
            setTimeout(() => {
                set_error_message(null);
            }, 3000);
        }
    }

    const delete_lecture_confirmation = () => {

        if (!lecture?.lecture_id || lecture?.lecture_id?.trim() === "") return

        setAlertdata({
            title: "Delete Lecture?",
            description: "Are you sure you want to delete this lecture?. The action cannot be undone",
            fun: () => delete_lecture(lecture?.lecture_id),
        })
        setIsAlertOpen(true)

    }

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file: any = e.target.files[0];
            set_lecture_video(file);
            set_media_type(file.type);
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
            <Divider sx={{ marginBottom: 2, marginLeft: "8px" }} />
            <Typography className="pl-2">{moment(lecture?.created_at).format("DD/MM/YYYY hh:mm A")}</Typography>
            <Grid container spacing={2} sx={{ marginTop: 1 }}>
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
                    sx={{ display: "flex", alignItems: "center" }}
                >
                    <input type="file" ref={videoInputRef} id="lecture-create-video" accept="video/*, image/*" hidden multiple={false}
                        onChange={handleVideoChange}
                        className="cursor-pointer"
                    />
                    {
                        media_type?.startsWith("video") ?
                            <div className="w-full h-[300px]" onClick={() => videoInputRef.current?.click()}>
                                <video src={lecture_video_url} controls
                                    className="border-2 w-full h-full object-cover object-center rounded-[4px] cursor-pointer bg-black"
                                /></div> : media_type?.startsWith("image") ?
                                <div className="w-full h-full" onClick={() => videoInputRef.current?.click()}>
                                    <Image src={lecture_video_url}
                                        alt="lecture media"
                                        className="border-2 w-full h-full object-contain object-center rounded-[4px] cursor-pointer"
                                    /> </div> : null
                    }
                </Grid>
                <Grid item xs={12}
                    sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: "8px", gap: "16px" }}
                >
                    <Button
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40px" }}
                        onClick={update_lecture} color="secondary" variant="contained"
                    > <EditIcon sx={{ fontSize: "16px", marginRight: "8px" }} /> <span className='mt-[3px]'>Save Lecture</span></Button>
                    <Button
                        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40px" }}
                        onClick={delete_lecture_confirmation} color="secondary" variant="contained"
                    > <DeleteIcon sx={{ fontSize: "16px", marginRight: "8px" }} /> <span className='mt-[3px]'>Delete Lecture</span></Button>
                </Grid>
            </Grid>
        </>
    )
}