"use client"

import "./Main.css"
import axios from "axios"
import React, { useEffect, useState } from 'react'
import { authorizationObj, baseUrl } from "@/app/utils/core"
import { Button, Typography } from "@mui/material"
import Table from "./components/Table"
import { IoMdAddCircle } from "react-icons/io";

const Main = () => {

    const [tutors, set_tutors] = useState([])

    const getAllTutors = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/tutor`, authorizationObj)
            set_tutors(resp?.data?.data)
        } catch (error) {
            // console.error(error)
        }
    }

    useEffect(() => {
        getAllTutors()
    }, [])

    return (
        <>
            <div className="flex flex-col justify-start items-start gap-4 mt-4">
                <div className="w-full flex justify-between items-center">
                    <Typography variant="h5">Onboarding Tutors</Typography>
                </div>
                <Table data={tutors} getAllTutors={getAllTutors} />
            </div>
        </>
    )
}

export default Main