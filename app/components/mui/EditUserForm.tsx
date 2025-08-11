"use client";

import "./index.css";
import React, { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AlertMUI from "./AlertMUI";
import { useSelector } from "react-redux";
import { authorizationObj, baseUrl, emailPattern, user_status_options } from "@/app/utils/core";
import axios from "axios";
import { ProfileImageView } from "./CreateUserForm";
import moment from "moment";
import { Autocomplete } from "@mui/material";
import { capitalizeString, isValidFileObject } from "@/app/utils/functions";
import { FilePreview } from "@/app/(web)/profile/Docs";

const EditUserForm = ({ set_is_editing, get_users, title, data }: any) => {
    const currentUser = useSelector((state: any) => state?.user);
    const profileImageRef: any = useRef();

    const [success_message, set_success_message] = useState<null | string>(null);
    const [error_message, set_error_message] = useState<null | string>(null);
    const [is_loading, set_is_loading] = useState(false);

    const [first_name, set_first_name] = useState(data?.first_name);
    const [last_name, set_last_name] = useState(data?.last_name);
    const [email, set_email] = useState(data?.email);
    const [profile_picture, set_profile_picture] = useState<any>(null);
    const [profile_url, set_profile_url] = useState<any>(`${data?.profile_picture}`);
    const [created_at, set_created_at] = useState(data?.created_at);
    const [user_status, set_user_status] = useState(data?.user_status);
    const [id_document_type, set_id_document_type] = useState(data?.id_document_type);
    const [id_document_number, set_id_document_number] = useState(data?.id_document_number);
    const [document_image, set_document_image] = useState<File | any>(data?.document_image);
    const [proof_of_address, set_proof_of_address] = useState<File | any>(data?.proof_of_address);

    useEffect(() => {
        set_first_name(data?.first_name);
        set_last_name(data?.last_name);
        set_email(data?.email);
        set_profile_url(`${data?.profile_picture}`);
        set_created_at(data?.created_at);
        set_user_status(data?.user_status);
        set_id_document_type(data?.id_document_type);
        set_id_document_number(data?.id_document_number);
        set_document_image(data?.document_image);
        set_proof_of_address(data?.proof_of_address);
    }, [data]);

    const handleSubmit = async () => {
        if (!currentUser?.institute_id || !data?.user_id) return;

        if (!first_name || !last_name || !email || !emailPattern.test(email) || !user_status) {
            set_error_message("Please fill all required fields correctly.");
            setTimeout(() => set_error_message(""), 2000);
            return;
        }

        const formData = new FormData();
        formData.append("email", email);
        formData.append("first_name", first_name);
        formData.append("last_name", last_name);
        formData.append("user_status", user_status);
        if (profile_picture) formData.append("profile_picture", profile_picture);

        try {
            set_is_loading(true);
            const resp = await axios.post(`${baseUrl}/users/update/${data?.user_id}`, formData, authorizationObj);
            set_is_loading(false);
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message);
                setTimeout(() => set_error_message(""), 2000);
                return;
            }
            set_success_message("User updated successfully!");
            set_is_editing(false);
            set_document_image(null);
            set_proof_of_address(null);
            set_profile_picture(null);
            get_users();
        } catch (error) {
            set_is_loading(false);
            set_error_message("Something went wrong, please try later");
            setTimeout(() => set_error_message(""), 2000);
        }
    };

    return (
        <>
                    <div className="modal-body">
                        {error_message && <AlertMUI status="error" text={error_message} />}
                        {success_message && <AlertMUI status="success" text={success_message} />}
                        
                        <div className="p-3">
                            <div className=" d-flex justify-content-center align-items-center">
                            {/* Profile Image Centering */}
                            <div className=" mb-4">
                                <ProfileImageView file={profile_picture} set_file={set_profile_picture} fileRef={profileImageRef} />
                                <input type="file" accept="image/*" hidden ref={profileImageRef} onChange={(e: any) => set_profile_picture(e?.target?.files[0])} />
                            </div>
                            </div>

                            {/* Form with two fields per row */}
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <TextField label="First Name" value={first_name} onChange={(e: any) => set_first_name(e.target.value)} fullWidth margin="normal" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <TextField label="Last Name" value={last_name} onChange={(e: any) => set_last_name(e.target.value)} fullWidth margin="normal" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <TextField label="Email" type="email" value={email} onChange={(e: any) => set_email(e.target.value)} fullWidth margin="normal" />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <Autocomplete
                                        disablePortal
                                        options={user_status_options}
                                        getOptionLabel={(option) => option.label}
                                        isOptionEqualToValue={(option, value) => option.value === value.value}
                                        value={user_status_options.find((opt) => opt.value === user_status) || null}
                                        onChange={(e, val: any) => {
                                            set_user_status(val?.value || "");
                                        }}
                                        renderInput={(params) => <TextField {...params} label="Status" margin="normal" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer ">
                        <Button variant="contained" className="me-2 btn btn-sm" color="primary" onClick={handleSubmit} disabled={is_loading}>
                            {is_loading ? "Submitting..." : "Submit"}
                        </Button>
                        <Button variant="outlined" onClick={() => set_is_editing(false)}>
                            Cancel
                        </Button>
                    </div>
                    </>
                
    );
};

export default EditUserForm;
