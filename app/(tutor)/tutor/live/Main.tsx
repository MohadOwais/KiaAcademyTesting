"use client"

import axios from 'axios';
import { authorizationObj, baseUrl } from '@/app/utils/core';
import { Autocomplete, Button, FormControlLabel, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import moment from 'moment';
import Switch from '@mui/material/Switch';
import AlertMUI from '@/app/components/mui/AlertMUI';

const Main = () => {

    const now = moment();  // Current time
    const currentUser = useSelector((state: any) => state?.user);

    const [courses, set_courses] = useState<any[]>([]);
    const [course_id, set_course_id] = useState("");
    const [title, set_title] = useState("");
    const [description, set_description] = useState("");
    const [is_recorded, set_is_recorded] = useState(false);
    const [duration, set_duration] = useState("");
    const [is_loading, set_is_loading] = useState(false);
    const [selected_course, set_selected_course] = useState("");
    const [errorMessage, setErrorMessage] = useState<null | string>(null);
    const [successMessage, setSuccessMessage] = useState<null | string>(null);
    const [startDateTime, setStartDateTime] = useState(moment());
    const [redirect_url, set_redirect_url] = useState("");

    const [date, set_date] = useState(moment());
    const [start_time, set_start_time] = useState("");
    const [end_time, set_end_time] = useState("");

    useEffect(() => {
        if (start_time && end_time) {
            const startTime = moment(start_time);
            const endTime = moment(end_time);

            const diffDuration = moment.duration(endTime.diff(startTime));
            const diffHrs = Math.floor(diffDuration.asHours());
            const diffMins = diffDuration.minutes();

            const difference = { hours: diffHrs, minutes: diffMins };
            set_duration(`${difference?.hours > 0 ? `${difference?.hours} ${difference?.hours == 1 ? "Hour" : "Hours"}` : ""} ${difference?.minutes > 0 ? `${difference?.minutes} ${difference?.minutes == 1 ? "Minute" : "Minutes"}` : ""}`);
        }
    }, [start_time, end_time]);

    useEffect(() => {
        getAllCourses();
    }, []);

    const getAllCourses = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/courses/by-instructor/${currentUser?.user_id}`, authorizationObj);
            const data = resp?.data?.data?.map((d: any, i: number) => {
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

    const join_live_class = async (meeting_id: string) => {

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

    const go_live = async (join: boolean) => {
        if (!course_id || course_id?.trim() === "") {
            setErrorMessage("Please select a course");
            setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
            return;
        }

        if (!title || title?.trim() === "") {
            setErrorMessage("Title is required");
            setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
            return;
        }

        if (!description || description?.trim() === "") {
            setErrorMessage("Description is required");
            setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
            return;
        }

        if (!date) {
            setErrorMessage("Date is required");
            setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
            return;
        }

        // const selectedDate = moment(date);
        // if (!selectedDate.isBetween(now, now.clone().add(24, 'hours'))) {
        //     setErrorMessage("Date must be within the next 24 hours");
        //     setTimeout(() => setErrorMessage(null), 3000);
        //     return;
        // }

        // if (!start_time || start_time?.trim() === "") {
        //     setErrorMessage("Start time is required");
        //     setTimeout(() => {
        //         setErrorMessage(null);
        //     }, 3000);
        //     return;
        // }

        // if (!end_time || end_time?.trim() === "") {
        //     setErrorMessage("End time is required");
        //     setTimeout(() => {
        //         setErrorMessage(null);
        //     }, 3000);
        //     return;
        // }

        const formattedDate = moment(date).format()
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("course_id", course_id);
        formData.append("instructor_id", currentUser?.user_id);
        formData.append("start_date", formattedDate);
        formData.append("end_date", "formattedDate");
        formData.append("is_recorded", is_recorded ? "true" : "false");
        formData.append("class_duration", duration);
        formData.append("class_time", `${moment(start_time)?.format("hh:mm:ss A Z")} to ${moment(end_time)?.format("hh:mm:ss A Z")}`);

        try {
            set_is_loading(true);
            const resp = await axios.post(`${baseUrl}/onlineclass/create`, formData, authorizationObj);
            set_is_loading(false);

            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                setErrorMessage(resp?.data?.message);
                setTimeout(() => {
                    setErrorMessage(null);
                }, 3000);
                return;
            }

            setSuccessMessage("Live Session Created");
            setTimeout(() => {
                setSuccessMessage(null);
            }, 3000);

            set_selected_course("");
            set_course_id("");
            set_title("");
            set_description("");
            set_date(moment());
            set_start_time("");
            set_end_time("");
            set_is_recorded(false);
            set_duration("");
            if (join) join_live_class(resp?.data?.meetingID)

        } catch (error) {
            // console.error(error);
            set_is_loading(false);
            setErrorMessage("Something went wrong please try later");
            setTimeout(() => {
                setErrorMessage(null);
            }, 3000);
        }
    };

    useEffect(() => {
        if (redirect_url) {
            window.open(redirect_url, "__blank");
            set_redirect_url("");
        }
    }, [redirect_url]);

    const handleDateChange = (selectedDate: any) => {
        set_date(selectedDate);
    };

    const minStartTime = moment();
    const maxEndTime = moment().add(24, 'hours');

    return (
        <>
            {errorMessage && <AlertMUI status="error" text={errorMessage} />}
            {successMessage && <AlertMUI status="success" text={successMessage} />}
            <div className='w-full flex flex-col justify-start items-start gap-4 mt-4'>
                <h3 className='w-full text-left text-2xl text-gray-800'>Live Session</h3>
                <p className='w-full text-left text-gray-700 mb-2'>Enter details to start a live sessions</p>
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
                <TextField id="outlined-basic-1" label="Title" variant="outlined" required fullWidth
                    value={title}
                    onChange={(e: any) => set_title(e?.target?.value)}
                />
                <TextField id="outlined-basic-1" label="Description" variant="outlined" required fullWidth
                    multiline rows={2} value={description}
                    onChange={(e: any) => set_description(e?.target?.value)}
                />
                <div className='w-full flex justify-start items-start gap-4 flex-wrap'>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <DatePicker
                            label="Date * "
                            onChange={handleDateChange}
                            value={moment(moment(date).format("DD/MM/YYYY"), "DD/MM/YYYY")}
                            minDate={moment()}
                            maxDate={moment().add(1, 'day')}
                        />
                    </LocalizationProvider>

                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <TimePicker
                            label="Start Time *"
                            value={moment(start_time) || moment()}
                            onChange={(e) => set_start_time(moment(e).format())}
                            minTime={moment()}
                        />
                    </LocalizationProvider>

                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <TimePicker
                            label="End Time *"
                            value={moment(end_time) || moment()}
                            onChange={(e) => set_end_time(moment(e).format())}
                            minTime={moment(start_time)}
                        />
                    </LocalizationProvider>

                    <div className='w-[232px] h-[56px] border border-[#bbb] rounded p-4 flex justify-between items-center'>
                        <p className="w-full text-left text-sm">
                            Duration: {duration}
                        </p>
                    </div>
                    <div className='w-[232px] h-[56px] flex items-center justify-center'>
                        <FormControlLabel control={<Switch
                            onChange={(e: any) => set_is_recorded(e?.target?.checked)}
                            checked={is_recorded}
                        />} label="Record Class" />
                    </div>
                </div>
                <div className="w-full flex justify-end items-center gap-4">
                    <Button color='secondary' variant="outlined" disabled={is_loading}
                        sx={{ width: "200px" }} onClick={() => go_live(false)}
                    >
                        {is_loading ? "Processing" : "Schedule Live Class"}
                    </Button>
                    <Button color='secondary' variant="contained" disabled={is_loading}
                        sx={{ width: "200px" }} onClick={() => go_live(true)}
                    >
                        {is_loading ? "Processing" : "Join Now"}
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Main;