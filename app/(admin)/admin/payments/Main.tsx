"use client"

import "./Main.css"
import axios from "axios"
import React, { useEffect, useState } from 'react'
import { authorizationObj, baseUrl } from "@/app/utils/core"
import { Button, Typography } from "@mui/material"
import Table from "./components/Table"
import Donations from "./components/Donations"
import ProtectedRoute from "@/app/components/ProtectedRoute"

const Main = () => {

    const [payments, set_payments] = useState([])
    const [activeTab, setActiveTab] = useState<'payments' | 'donations'>('payments')

    const getAllTutors = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/payments`, authorizationObj)
            set_payments(resp?.data?.data)
        } catch (error) {
            // console.error(error)
        }
    }

    useEffect(() => { 
        getAllTutors()
    }, [])

    return (
        <>
            <ProtectedRoute allowedRoleIds={["1"]}>
                <div className="flex flex-col justify-start items-start gap-4 mt-4 w-100">
                    {/* <h3 className="heading-style mb-3">Payments</h3> */}
                    <div className="mb-4 d-flex gap-2">
                        <button
                            className={`notification-pill-btn ${activeTab === 'payments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('payments')}
                        >
                            Payments
                        </button>
                        <button
                            className={`notification-pill-btn ${activeTab === 'donations' ? 'active' : ''}`}
                            onClick={() => setActiveTab('donations')}
                        >
                            Donations
                        </button>
                    </div>
                    {activeTab === 'payments' && <Table data={payments} />}
                    {activeTab === 'donations' && <Donations data={payments} />}
                </div>
            </ProtectedRoute>
        </>
    )
}

export default Main