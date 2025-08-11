"use client"

import { authorizationObj, baseUrl } from '@/app/utils/core'
import { Typography } from '@mui/material'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const InstComp = ({ inst }: any) => {
    const router = useRouter()
    return (
        <div>institute</div>
    )
}

const Index = () => {
    const currentUser = useSelector((state: any) => state?.user)
    const [institutes, set_institutes] = useState<any[]>([])

    useEffect(() => {
        if (!currentUser?.user_id) return
        get_institutes(currentUser?.user_id)
    }, [currentUser])

    const get_institutes = async (userId: string) => {
        if (!userId || userId?.trim() === "") return
        try {
            const resp = await axios.get(`${baseUrl}/institutions/getInstitutesByUser/${userId}`, authorizationObj)
            if (resp?.data?.data) {
                set_institutes(resp?.data?.data)
            } else {
                set_institutes([])
            }
        } catch (error) {
            // console.error(error)
            set_institutes([])
        }
    }

    return (
        <div className="flex flex-col justify-start items-start gap-4 mt-4">
            <div className="w-full flex justify-between items-center">
                <Typography variant="h5">My Institutions</Typography>
            </div>
            <div className='w-full flex justify-start items-start gap-4'>
                {institutes?.map((inst: any, i: number) => <InstComp key={i} inst={inst} />)}
            </div>
        </div>
    )
}

export default Index