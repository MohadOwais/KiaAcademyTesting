"use client"

import AlertMUI from '@/app/components/mui/AlertMUI';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import { Autocomplete, Button, CircularProgress, Divider, TextField } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { MdVideocamOff } from "react-icons/md";

export const SelectCourse = () => {
    return (
        <>
            <div className='w-full flex justify-center items-center mt-16'>
                <p className='w-full text-center text-xl'>Select a course</p>
            </div>
        </>
    )
}

export const NoRecordings = () => {
    return (
        <>
            <div className='w-full flex flex-col justify-start items-center gap-4 mt-16'>
                <MdVideocamOff
                    style={{ fontSize: "120px" }}
                />
                <p className='w-full text-center text-xl'>No Live Classes</p>
            </div>
        </>
    )
}

export const SingleSession = ({ session, join_live_class, getRecordings, is_loading }: any) => {

    const [recording, set_recording] = useState<any>(null)
    const [redirect_url, set_redirect_url] = useState("")

    useEffect(() => {
        recordingFun()
    }, [])

    const recordingFun = async () => {
        const _recording = await getRecordings(session?.meeting_id)
        set_recording(_recording)
    }

    useEffect(() => {
        if (redirect_url) {
            window.open(redirect_url, "__blank");
            set_redirect_url("");
        }
    }, [redirect_url])

    const handleSeeRecording = () => {
        if (!recording) return
        if (!recording?.playback?.format?.url) return
        set_redirect_url(recording?.playback?.format?.url)
    }

    return (
        <>
            <div className='w-full flex justify-between items-center gap-4 border-t pt-4 flex-wrap'>
                <span>{session?.title}</span>
                <div className='flex justify-end items-center gap-4'>
                    <Button
                        color="secondary" variant='outlined'
                        sx={{ width: "100px", height: "35px" }}
                        onClick={() => join_live_class(session?.meeting_id)}
                        disabled={is_loading}
                    >
                        Join
                    </Button>
                    <Button
                        color="secondary" variant='contained'
                        sx={{ width: "100px", height: "35px" }}
                        onClick={handleSeeRecording}
                        disabled={!recording || is_loading}
                    >
                        Recording
                    </Button>
                </div>
            </div>
        </>
    )
}

const Main = () => {

    const currentUser = useSelector((state: any) => state?.user)
    const [courses, set_courses] = useState<any[]>([]);
    const [course_id, set_course_id] = useState("");
    const [redirect_url, set_redirect_url] = useState("");
    const [is_loading, set_is_loading] = useState(false);
    const [selected_course, set_selected_course] = useState("");
    const [errorMessage, setErrorMessage] = useState<null | string>(null);
    const [successMessage, setSuccessMessage] = useState<null | string>(null);
    const [live_sessions, set_live_sessions] = useState<any[]>([])

    useEffect(() => {
        getAllCourses();
    }, []);

    useEffect(() => {
        if (redirect_url) {
            window.open(redirect_url, "__blank");
            set_redirect_url("");
        }
    }, [redirect_url]);

    const getAllCourses = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/courses/get-assigned-course/${currentUser?.institute_id}/${currentUser?.user_id}`, authorizationObj);
            const data = resp?.data?.data?.map((d: any, i: any) => {
                return {
                    label: `${i + 1}. ${d?.course_title}`,
                    value: d?.course_id
                };
            });
            set_courses(data);
        } catch (error) {
            // console.error(error);
        }
    };

    const get_live_sessions = async (courseId: string) => {

        if (!courseId || courseId?.trim() === "") return

        try {
            set_is_loading(true)
            const resp = await axios.get(`${baseUrl}/onlineclass/${courseId}`, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.data) {
                set_live_sessions(resp?.data?.data)
            } else {
                set_live_sessions([])
            }
        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            set_live_sessions([])
        }
    }

    const getRecordings = async (meetingId: string) => {
        if (!meetingId || meetingId?.trim() === "") return
        try {
            const resp = await axios.get(`${baseUrl}/onlineclass/getRecordings/${meetingId}`, authorizationObj)
            return resp?.data?.data?.recordings?.recording
        } catch (error) {
            // console.error(error)
            return null
        }
    }

    const join_live_class = async (meeting_id: string) => {
        if (!meeting_id || meeting_id?.trim() === "") return

        const formData = new FormData();
        formData.append("meeting_id", meeting_id);
        formData.append("full_name", `${currentUser?.first_name ? currentUser?.first_name : ""} ${currentUser?.last_name ? currentUser?.last_name : ""}`);
        formData.append("role", currentUser?.role_id === "3" ? "student" : currentUser?.role_id === "2" ? "instructor" : "");

        try {
            set_is_loading(true);
            const resp = await axios.post(`${baseUrl}/onlineclass/joinClass`, formData, authorizationObj);
            set_is_loading(false);
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                setErrorMessage(resp?.data?.message);
                setTimeout(() => {
                    setErrorMessage(null);
                }, 3000);
                return;
            }
            set_redirect_url(resp?.data?.data?.joinUrl);
        } catch (error) {
            // console.error(error);
            set_is_loading(false);
            setErrorMessage("Something went wrong, please try later");
            setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
        }
    };

    useEffect(() => {
        get_live_sessions(course_id)
    }, [course_id])

    return (
        <>
            {errorMessage && <AlertMUI status="error" text={errorMessage} />}
            {successMessage && <AlertMUI status="success" text={successMessage} />}
            <div className='w-full flex flex-col justify-start items-start gap-4 mt-4'>
                <h3 className='w-full text-left text-2xl text-gray-800'>Live Session Recordings</h3>
                <p className='w-full text-left text-gray-700 mb-2'>Select a course</p>
                <Autocomplete
                    disablePortal
                    value={selected_course}
                    options={courses}
                    renderInput={(params) => <TextField {...params} label="Course" required />}
                    fullWidth
                    onChange={(e: any, val: any) => {
                        set_course_id(val?.value);
                        set_selected_course(val?.label);
                    }}
                />
                {
                    is_loading ?
                        <CircularProgress sx={{ margin: "auto", marginTop: "6em" }} />
                        :
                        <>
                            {
                                course_id ?
                                    live_sessions?.length ?
                                        live_sessions?.map((session: any, i: number) => <SingleSession session={session} key={i} join_live_class={join_live_class} getRecordings={getRecordings} is_loading={is_loading} />)
                                        : <NoRecordings />
                                    : <SelectCourse />
                            }
                        </>
                }
            </div>
        </>
    )
}

export default Main