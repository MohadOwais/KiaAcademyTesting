"use client"

import { authorizationObj, baseUrl } from '@/app/utils/core'
import { Button, Typography } from '@mui/material'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import FavouriteComponent from './components/FavouriteComponent'
import AlertMUI from '@/app/components/mui/AlertMUI'
import ConfirmAlertMUI from '@/app/components/mui/ConfirmAlertMUI'
import DeleteIcon from '@mui/icons-material/Delete'

const Main = () => {

    const currentUser = useSelector((state: any) => state?.user)

    const [favourite_courses, set_favourite_courses] = useState<any[]>([])
    const [is_loading, set_is_loading] = useState(false)
    const [alertData, setAlertdata] = React.useState<any>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
    const [error_message, set_error_message] = useState<null | string>(null)
    const [success_message, set_success_message] = useState<null | string>(null)
    const [totalPrice, setTotalPrice] = useState(0);

    useEffect(() => {
        get_favourite_courses()
    }, [currentUser, currentUser?.user_id])

    const get_user_courses = async () => {
        try {
            set_is_loading(true)
            const resp = await axios.get(`${baseUrl}/enrollments/student/${currentUser?.user_id}`, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.data) {
                return resp?.data?.data
            } else {
                return []
            }
        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            return []
        }
    }

    const get_favourite_courses = async () => {
        try {
            set_is_loading(true)
            const resp = await axios.get(`${baseUrl}/wishlist/view/${currentUser?.user_id}`, authorizationObj)
            if (resp?.data?.data) {
                const enrolledCourses: any = await get_user_courses()
                const final_courses = resp?.data?.data?.filter((course: any) => {
                    const isEnrolled = enrolledCourses.some((enrolled: any) => enrolled.course_id === course.course_id);
                    return !isEnrolled;
                });
                set_favourite_courses(final_courses)
            } else {
                set_favourite_courses([])
            }
            set_is_loading(false)
        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            set_favourite_courses([])
        }
    }

    const clear_favourites = async () => {
        try {
            set_is_loading(true)
            const resp = await axios.delete(`${baseUrl}/wishlist/clear/${currentUser?.user_id}`, authorizationObj)
            set_is_loading(false)
            setAlertdata(null)
            setIsAlertOpen(false)
            if (resp?.data?.status > 199 && resp?.data?.status < 300) {
                set_success_message("Favourites cleared")
                get_favourite_courses()
                setTimeout(() => {
                    set_success_message(null)
                }, 3000);
            } else {
                set_error_message(resp?.data?.message)
                setTimeout(() => {
                    set_error_message(null)
                }, 3000);
            }
        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            setAlertdata(null)
            setIsAlertOpen(false)
            set_error_message("Something went wrong please try later")
            setTimeout(() => {
                set_error_message(null)
            }, 3000);
        }
    }

    const clear_favourites_confirmation = () => {
        setAlertdata({
            title: "Clear Favourites?",
            description: "Are you sure you want to clear your favourite items?. The action cannot be undone",
            fun: clear_favourites,
        })
        setIsAlertOpen(true)
    }

    return (
        <>
            {error_message && <AlertMUI text={error_message} status="error" />}
            {success_message && <AlertMUI text={success_message} status="success" />}
            <ConfirmAlertMUI
                open={isAlertOpen}
                setOpen={setIsAlertOpen}
                title={alertData?.title}
                description={alertData?.description}
                fun={alertData?.fun}
                isLoading={is_loading}
            />
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12 d-flex justify-content-between align-items-center">
                        <h3 className="heading-style">Favourites</h3>
                        {favourite_courses?.length > 0 && (
                            <Button
                                className="d-flex align-items-center btn-view"
                                onClick={clear_favourites_confirmation}
                                color="secondary"
                                variant="contained"
                                disabled={is_loading}
                            >
                                <DeleteIcon sx={{ fontSize: "16px", marginRight: "8px" }} />
                                Clear Favourites
                            </Button>
                        )}
                    </div>
                </div>
                <FavouriteComponent 
                    data={favourite_courses} 
                    get_data={get_favourite_courses} 
                    is_loading={is_loading} 
                    set_is_loading={set_is_loading} 
                />
            </div>
        </>
    )
}

export default Main