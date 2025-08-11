import { authorizationObj, baseUrl } from '@/app/utils/core';
import { capitalizeString } from '@/app/utils/functions';
import { Button, TextField } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import React, { use, useState } from 'react'
import { useSelector } from 'react-redux';
import { FilePreview } from '../Docs';

const MoreInfoAdmin = ({ setErrorMessage, setSuccessMessage, user, setUser, errorMessage }: any) => {

    const currentUser = useSelector((state: any) => state?.user)
    const userInfo = useSelector((state: any) => state?.user?.instituteData)

    const [isLoading, setIsLoading] = useState(false)
    const [address, set_address] = useState(userInfo?.address)
    const [contact, set_contact] = useState(userInfo?.contact_number)
    const [joining_date, Set_joining_date] = useState(userInfo?.created_at)
    const [email, set_email] = useState(userInfo?.email)
    const [inst_name, set_inst_name] = useState(userInfo?.name)
    const [reg_number, set_reg_number] = useState(userInfo?.registration_number)
    const [tin_number, set_tin_number] = useState(userInfo?.tin_number)
    const [status, set_status] = useState(userInfo?.status)
    const [subdomain_name, set_subdomain_name] = useState(userInfo?.subdomain_name)
    const [supporting_document, set_supporting_document] = useState(userInfo?.supporting_document)

    const updateInst = async () => {

        if (!address) {
            setErrorMessage("Address is required")
            setTimeout(() => setErrorMessage(""), 3000)
            return
        }

        if (!inst_name) {
            setErrorMessage("Institute name is required")
            setTimeout(() => setErrorMessage(""), 3000)
            return
        }

        if (!subdomain_name) {
            setErrorMessage("Subdomain name is required")
            setTimeout(() => setErrorMessage(""), 3000)
            return
        }

        const formData = new FormData()
        formData.append("address", address)
        formData.append("name", inst_name)
        // formData.append("subdomain_name", subdomain_name)

        try {
            setIsLoading(true)
            const resp = await axios.post(`${baseUrl}/institutions/update/${userInfo?.institute_id}`, formData, authorizationObj)
            setIsLoading(false)
            if (resp?.data?.status > 300 || resp?.data?.status < 200) {
                setErrorMessage(resp?.data?.message)
                setTimeout(() => setErrorMessage(""), 3000)
                return
            }
            setSuccessMessage("Institute info updated successfully")
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error) {
            // console.error(error)
            setIsLoading(false)
            setErrorMessage("Something went wrong, please try later")
            setTimeout(() => setErrorMessage(""), 3000)
        }
    }

    return (
        <div className='w-full flex flex-col justify-start items-center gap-4'>
            <div className='w-full flex justify-center items-start gap-4 max-w-[618px] flex-wrap'>
                <TextField
                    value={inst_name || ""} style={{ width: "300px" }}
                    label="Institute Name * " variant="outlined"
                    onChange={(e: any) => set_inst_name(e?.target?.value)}
                />
                <TextField
                    value={subdomain_name || "N/A"} style={{ width: "300px" }}
                    label="Subdomain Name * " variant="outlined"
                    // onChange={(e: any) => set_subdomain_name(e?.target?.value)}
                    InputProps={{ readOnly: true }}
                />
            </div>

            <div className='w-full flex justify-center items-start gap-4 max-w-[618px] flex-wrap'>
                <TextField
                    value={contact || ""} style={{ width: "300px" }}
                    label="Contact * " variant="outlined"
                    InputProps={{ readOnly: true }}
                />
                <TextField
                    value={email || ""} style={{ width: "300px" }}
                    label="Email * " variant="outlined"
                    InputProps={{ readOnly: true }}
                />
            </div>

            <div className='w-full flex justify-center items-start gap-4 max-w-[618px] flex-wrap'>
                <TextField
                    value={reg_number || ""} style={{ width: "300px" }}
                    label="Registration Number * " variant="outlined"
                    InputProps={{ readOnly: true }}
                />
                <TextField
                    value={tin_number || ""} style={{ width: "300px" }}
                    label="TIN Number * " variant="outlined"
                    InputProps={{ readOnly: true }}
                />
            </div>

            <div className='w-full flex justify-center items-start gap-4 max-w-[618px] flex-wrap'>
                <TextField
                    value={capitalizeString(status)  || "N/A"} style={{ width: "300px" }}
                    label="Status * " variant="outlined"
                    InputProps={{ readOnly: true }}
                />
                <TextField
                    value={moment(joining_date).format("DD-MM-YYYY")  || ""} style={{ width: "300px" }}
                    label="Joinining Date * " variant="outlined"
                    InputProps={{ readOnly: true }}
                />
            </div>

            <div className='w-full flex justify-center items-start gap-4 max-w-[618px] flex-wrap'>
                <TextField
                    value={address || ""} style={{ width: "300px" }}
                    label="Address * " variant="outlined" multiline rows={3}
                    onChange={(e: any) => set_address(e?.target?.value)}
                />
                <FilePreview fileName={supporting_document} label="No Supporting Document Available" />
            </div>

            <div className='w-[250px] mt-4'>
                <Button type='submit' variant="contained" color="primary" disabled={isLoading} fullWidth
                    onClick={updateInst}
                >
                    {isLoading ? <span className="buttonLoader"></span> : null}
                    {isLoading ? "Processing" : "Save Changes"}
                </Button>
            </div>
        </div>
    )
}

export default MoreInfoAdmin
