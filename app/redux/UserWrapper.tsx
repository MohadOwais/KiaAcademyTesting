import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { login, logout } from "./user"
import { redirect } from 'next/navigation'
import { isDynamicCoursePath, isVerificationEmailPath } from '../utils/functions'
import { baseUrl, serverToken, webDomainName } from '../utils/core'

const UserWrapper = ({ children }: any) => {

   const dispatch = useDispatch()
    const currentUser = useSelector((state: any) => state.user);
    const isLogin = useSelector((state: any) => state.user?.isLogin);

    // Use refs for values that shouldn't trigger re-renders
    const dispatchRef = useRef(dispatch)

    const [is_institute, set_is_institute] = useState(false)
    const [pathName, setPathName] = useState<string | null>(null)

    useEffect(() => {
        if (
            window?.location?.hostname?.split(".")[0]?.toLowerCase() !== webDomainName
        ) set_is_institute(true)
    }, [pathName])

    useEffect(() => {
        setPathName(window?.location?.pathname)
    }, [])

    const getUserData = useCallback(async (userId: string) => {
        if (!userId || userId?.trim() === "") return

        try {
            const resp = await axios.get(`${baseUrl}/users/${userId}`, { withCredentials: true, headers: { Authorization: serverToken } })
            if (resp?.data?.data?.institute_id) {
                const instResp = await axios.get(`${baseUrl}/institutions/${resp?.data?.data?.institute_id}`, { withCredentials: true, headers: { Authorization: serverToken } })
                dispatchRef.current(login({ ...resp?.data?.data, instituteData: instResp?.data?.data }))
            } else {
                dispatchRef.current(login(resp?.data?.data))
            }
        } catch (error) {
            dispatchRef.current(logout())
        }

    }, [])

    // Initial data load
    useEffect(() => {
        const data = localStorage.getItem("hart")
        if (!data || data?.trim() === "") {
            dispatchRef.current(logout())
            return
        }
        const userData = JSON.parse(data)
        if (!userData) {
            dispatchRef.current(logout())
        } else {
            getUserData(userData?.user_id)
        }
    }, [getUserData])

    const authGuard = useCallback(() => {
        // Move all the route definitions outside the callback
        const publicRoutes = [
            "/",
            "/current-courses",
            "/live-courses",
            "/contact",
            "/about",
            "/privacy-policy",
            "/frequently-asked-questions",
            "/terms-and-conditions",
            "/refund-policy",
            "/data-deletion",
        ]

        const authRoutes = [
            "/auth",
            "/auth/signin",
            "/auth/signup",
            "/auth/forgot-password",
            "/auth/forgot-password-complete",
            "/institution/registration",
            "/verify-email"
        ]

        const unAuthRoutes = [
            ...authRoutes,
            ...publicRoutes,
        ]

        const adminRoutes = [
            ...publicRoutes,
            "/admin/dashboard",
            "/admin/announcements",
            "/admin/contact-us",
            "/admin/course-categories",
            "/admin/courses",
            "/admin/institutions",
            "/admin/onboarding-institutions",
            "/admin/my-institutes",
            "/admin/onboarding-tutors",
            "/admin/students",
            "/admin/payments",
            "/admin/tutors",
            "/admin/plans",
            "/admin/subscriptions",
            "/admin/profile",
        ]

        const tutorRoutes = [
            ...publicRoutes,
            "/tutor/announcements",
            "/tutor/courses",
            "/tutor/live",
            "/tutor/live-recordings",
            "/tutor/class-calendar",
            "/tutor/online-classes",
            "/tutor/students",
            "/profile",
        ]

        const studentRoutes = [
            ...publicRoutes,
            "/student/cart",
            `/student/courses`,
            "/student/favourites",
            "/student/payment",
            // "/student/my-institutes",
            "/student/notifications",
            "/profile",
        ]

        const instituteAdminRoutes = [
            "/institution/admin/dashboard",
            "/institution/admin/announcements",
            "/institution/admin/assign-course",
            "/institution/admin/courses",
            "/institution/admin/students",
            "/institution/admin/sub-admins",
            "/institution/admin/transactions",
            "/institution/admin/tutors",
            "/profile",
        ]

        const instituteSubAdminRoutes = [
            "/institution/sub-admin/dashboard",
            "/institution/sub-admin/announcements",
            "/institution/sub-admin/assign-course",
            "/institution/sub-admin/courses",
            "/institution/sub-admin/students",
            "/institution/sub-admin/transactions",
            "/institution/sub-admin/tutors",
            "/profile",
        ]

        const instituteTutorRoutes = [
            "/institution/tutor/courses",
            "/institution/tutor/live",
            "/institution/tutor/live-recordings",
            "/institution/tutor/notifications",
            "/profile",
        ]

        const instituteStudentRoutes = [
            "/current-courses",
            "/institution/student/cart",
            "/institution/student/courses",
            "/institution/student/facourites",
            "/institution/student/notifications",
            "/profile",
        ]

        // Rest of the authGuard logic
        if (!pathName) return

        const isUnAuthRoute = unAuthRoutes?.includes(pathName) || isDynamicCoursePath(pathName) || isVerificationEmailPath(pathName)
        const isPublicPath = publicRoutes?.includes(pathName) || isDynamicCoursePath(pathName)
        const isAdminPath = adminRoutes?.includes(pathName) || isDynamicCoursePath(pathName)
        const isTutorPath = tutorRoutes?.includes(pathName) || isDynamicCoursePath(pathName)
        const isStudentPath = studentRoutes?.includes(pathName) || isDynamicCoursePath(pathName)
        const isInstituteAdminPath = instituteAdminRoutes?.includes(pathName)
        const isInstituteSubAdminPath = instituteSubAdminRoutes?.includes(pathName)
        const isInstituteTutorPath = instituteTutorRoutes?.includes(pathName)
        const isInstituteStudentPath = instituteStudentRoutes?.includes(pathName) || isDynamicCoursePath(pathName)

        if (isLogin == true && currentUser) {
            if (isUnAuthRoute) {
                if (!isPublicPath) {
                    if (currentUser?.user?.role_id === "1") {
                        redirect("/admin/dashboard")
                    } else if (currentUser?.user?.role_id === "2" && !currentUser?.user?.institute_id) {
                        redirect(`/tutor/courses`)
                    } else if (currentUser?.user?.role_id === "2" && currentUser?.user?.institute_id) {
                        redirect(`/institution/tutor/courses`)
                    } else if (currentUser?.user?.role_id === "3" && !currentUser?.user?.institute_id) {
                        redirect(`/student/courses`)
                    } else if (currentUser?.user?.role_id === "3" && currentUser?.user?.institute_id) {
                        redirect(`/institution/student/courses`)
                    } else if (currentUser?.user?.role_id === "4") {
                        redirect(`/institution/admin/dashboard`)
                    } else if (currentUser?.user?.role_id === "5") {
                        redirect(`/institution/sub-admin/dashboard`)
                    }
                } else if (isPublicPath && is_institute) {
                    if (currentUser?.user?.role_id === "2" && currentUser?.user?.institute_id) {
                        redirect(`/institution/tutor/courses`)
                    } else if (currentUser?.user?.role_id === "3" && currentUser?.user?.institute_id) {
                        if (pathName === "/current-courses" || isDynamicCoursePath(pathName)) return
                        redirect(`/institution/student/courses`)
                    } else if (currentUser?.user?.role_id === "4") {
                        redirect(`/institution/admin/dashboard`)
                    } else if (currentUser?.user?.role_id === "5") {
                        redirect(`/institution/sub-admin/dashboard`)
                    }
                }

            } else {
                if (pathName === "/" && is_institute) redirect("/auth")
                if (currentUser?.user?.role_id === "1" && !isAdminPath) {
                    redirect("/admin/dashboard")
                } else if (currentUser?.user?.role_id === "2" && !currentUser?.user?.institute_id && !isTutorPath) {
                    redirect(`/tutor/courses`)
                } else if (currentUser?.user?.role_id === "2" && currentUser?.user?.institute_id && !isInstituteTutorPath) {
                    redirect(`/institution/tutor/courses`)
                } else if (currentUser?.user?.role_id === "3" && !currentUser?.user?.institute_id && !isStudentPath) {
                    redirect(`/student/courses`)
                } else if (currentUser?.user?.role_id === "3" && currentUser?.user?.institute_id && !isInstituteStudentPath) {
                    redirect(`/institution/student/courses`)
                } else if (currentUser?.user?.role_id === "4" && !isInstituteAdminPath) {
                    redirect(`/institution/admin/dashboard`)
                } else if (currentUser?.user?.role_id === "5" && !isInstituteSubAdminPath) {
                    redirect(`/institution/sub-admin/dashboard`)
                }

            }

        } else if (isPublicPath && isLogin == false && is_institute) {
            // Only redirect to auth if it's not a public route
            if (!publicRoutes.includes(pathName) && !isDynamicCoursePath(pathName)) {
                redirect("/auth")
            }
        } else if (isLogin == false && !isUnAuthRoute) {
            if(pathName === "/") return
            if (isDynamicCoursePath(pathName)) return
            if (isVerificationEmailPath(pathName)) return
            redirect("/auth")
        }

    }, [currentUser, pathName, isLogin, is_institute])

    useEffect(() => {
        authGuard()
    }, [authGuard])

    return <>{children}</>
}

export default UserWrapper

// verify email dynamic route