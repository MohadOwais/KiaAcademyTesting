"use client"

import "./Main.css"
import axios from "axios"
import React, { useEffect, useState } from 'react'
import { authorizationObj, baseUrl } from "@/app/utils/core"
import { Button, Typography } from "@mui/material"
import Table from "./components/Table"
import ProtectedRoute from "@/app/components/ProtectedRoute";

const Main = () => {

const [institutions, set_institutions] = useState([])

const getAllInstitutions = async () => {
try {
const resp = await axios.get(`${baseUrl}/institutions`, authorizationObj)
set_institutions(resp?.data?.data ? resp?.data?.data : [])
} catch (error) {
// console.error(error)
}
}

useEffect(() => {
getAllInstitutions()
}, [])

return (
<>
    <ProtectedRoute allowedRoleIds={["1"]}>

        <div className="flex flex-col justify-start items-start gap-4 mt-4">
            <div className="w-full flex justify-between items-center">
                <h3 className="heading-style">Onboarding Institutions</h3>
            </div>
            <Table data={institutions} getAllInstitutions={getAllInstitutions} />
        </div>
    </ProtectedRoute>
</>
)
}

export default Main