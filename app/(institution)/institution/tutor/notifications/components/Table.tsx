"use client"

import "./Main.css";
import * as React from 'react';
import { authorizationObj, baseUrl } from "@/app/utils/core";
import axios from "axios";
import { useSelector } from "react-redux";
import { ListNotifications } from "@/app/(tutor)/tutor/announcements/components/Table";

const ViewNotifications = () => {

    const currentUser = useSelector((state: any) => state?.user)

    const [recieved_notifications, set_recieved_notifications] = React.useState<any[]>([])

    React.useEffect(() => {
        get_recieved_notifications()
    }, [])

    const get_recieved_notifications = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/notifications/received_notification/${currentUser?.user_id}`, authorizationObj)
            if (resp?.data) {
                set_recieved_notifications(resp?.data)
            } else {
                set_recieved_notifications([])
            }
        } catch (error) {
            // console.error(error)
            set_recieved_notifications([])
        }
    }

    return (
        <div className="p-8 flex flex-col gap-4">
            <p className="w-full text-left text-2xl">Notifications</p>
            <ListNotifications notifications={recieved_notifications} is_sent={false} />
        </div>
    )
}

export default ViewNotifications;