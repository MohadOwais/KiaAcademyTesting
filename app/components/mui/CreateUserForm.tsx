"use client"

import "./index.css";
import React, { useEffect, useRef, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import AlertMUI from "./AlertMUI";
import { useSelector } from "react-redux";
import PasswordMUI from "./PasswordMUI";
import { IconButton } from "@mui/material";
import { RxCross2 } from "react-icons/rx";
import { formatFilename, formatFileSize } from "@/app/utils/functions";
import { authorizationObj, baseUrl, emailPattern, passwordPattern, profilePicture } from "@/app/utils/core";
import axios from "axios";
import Image from 'next/image'

export const SelectedFile = ({ file, set_file }: any) => {
    const handleClick = () => {
        set_file(null)
    }

    return (
        <div className='w-full flex justify-end items-start mt-4 col-6'>
            <div className='w-full flex justify-between items-start gap-4 py-2 px-4 pr-2 bg-gray-200 border-b-2 border-black'>
                <div className='w-full flex flex-col justify-start items-start'>
                    <p className='text-md'>{formatFilename(file?.name || file)}</p>
                    <p className='text-[12px] mt-[4px]'>{formatFileSize(file?.size)}</p>
                </div>
                <IconButton
                    onClick={handleClick}
                    size='small'
                >
                    <RxCross2 style={{ fontSize: "0.8em" }} />
                </IconButton>
            </div>
        </div>
    )
}

export const ProfileImageView = ({ file, set_file, fileRef, profile_url }: any) => {
    const [url, set_url] = useState<any>(profile_url ? profile_url : null)

    useEffect(() => {
        if (!file) return
        set_url(URL.createObjectURL(file))
    }, [file])

    useEffect(() => {
        if (profile_url) set_url(profile_url)
    }, [profile_url])

    const handleClick = () => {
        set_file(null)
    }

    return (
        <div className='w-full flex justify-center items-start col-12 mb-4'>
            <Image
                src={url ? url : profilePicture}
                alt="profile-picture"
                width={120}
                height={120}
                className="cursor-pointer w-[120px] h-[120px] object-center object-cover bg-[#ededed] rounded-full"
                onClick={() => fileRef.current.click()}
            />
        </div>
    )
}

const CreateUserForm = ({ set_show_user_modal, get_users, title, role_id }: any) => {
    const currentUser = useSelector((state: any) => state?.user);
    const profileImageRef: any = useRef()

    const [success_message, set_success_message] = useState<null | string>(null);
    const [error_message, set_error_message] = useState<null | string>(null);
    const [is_loading, set_is_loading] = useState(false);

    const [first_name, set_first_name] = useState("");
    const [last_name, set_last_name] = useState("");
    const [email, set_email] = useState("");
    const [password, set_password] = useState("");
    const [confirm_password, set_confirm_password] = useState("")

    const [profile_picture, set_profile_picture] = useState<File | null>(null)
    const [id_document_type, set_id_document_type] = useState("");
    const [id_document_number, set_id_document_number] = useState("");
    const [document_image, set_document_image] = useState<File | null>(null);
    const [proof_of_address, set_proof_of_address] = useState<File | null>(null);

    const handleSubmit = async () => {

        if (!currentUser?.institute_id) return

        if (!first_name) {
            set_error_message("Firstname is required")
            setTimeout(() => set_error_message(""), 2000)
            return
        }
        if (!last_name) {
            set_error_message("Lastname is required")
            setTimeout(() => set_error_message(""), 2000)
            return
        }
        if (!email) {
            set_error_message("Email is required")
            setTimeout(() => set_error_message(""), 2000)
            return
        }
        if (!password) {
            set_error_message("Password is required")
            setTimeout(() => set_error_message(""), 2000)
            return
        }
        if (!emailPattern.test(email)) {
            set_error_message("Email pattern is invalid")
            setTimeout(() => set_error_message(""), 2000)
            return
        }
        if (!passwordPattern.test(password)) {
            set_error_message("Password must be alphanumeric and 8 to 24 characters long")
            setTimeout(() => set_error_message(""), 2000)
            return
        }
        if (password !== confirm_password) {
            set_error_message("Password do not match")
            setTimeout(() => set_error_message(""), 2000)
            return
        }

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);
        formData.append("first_name", first_name);
        formData.append("last_name", last_name);
        formData.append("role_id", role_id);
        formData.append("institute_id", currentUser?.institute_id)

        if (id_document_type) { formData.append("id_document_type", id_document_type) }
        if (id_document_number) { formData.append("id_document_number", id_document_number) }
        if (document_image) formData.append("document_image", document_image);
        if (proof_of_address) formData.append("proof_of_address", proof_of_address);
        if (profile_picture) formData.append("profile_picture", profile_picture);

        try {
            set_is_loading(true);
            const resp = await axios.post(`${baseUrl}/users/create`, formData, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => set_error_message(""), 2000)
                return
            }
            set_success_message("User created successfully!");
            set_first_name("")
            set_last_name("")
            set_email("")
            set_password("")
            set_confirm_password("")
            set_profile_picture(null)
            set_document_image(null)
            set_proof_of_address(null)
            set_id_document_type("")
            set_id_document_number("")
            set_show_user_modal(false);
            get_users();

        } catch (error) {
            set_is_loading(false)
            set_error_message("Something went wrong, please try later")
            setTimeout(() => set_error_message(""), 2000)
        }

    };

    return (
        <>
            {error_message && <AlertMUI status="error" text={error_message} />}
            {success_message && <AlertMUI status="success" text={success_message} />}

            <div className="container">
                <div className="row">
                    <p className="col-12 text-center text-xl">{title}</p>
                </div>

                {/* Profile Image */}
                <div className="row d-flex justify-content-center align-center">
                    <div className="col-2 ">
                        <ProfileImageView file={profile_picture} set_file={set_profile_picture} fileRef={profileImageRef} />
                        <input type="file" accept="image/*" hidden ref={profileImageRef} onChange={(e: any) => set_profile_picture(e?.target?.files[0])} />
                    </div>
                </div>

                {/* First Row: First Name & Last Name */}
                <div className="row">
                    <div className="col-6">
                        <TextField
                            label="First Name"
                            value={first_name}
                            onChange={(e: any) => set_first_name(e.target.value)}
                            fullWidth
                        />
                    </div>

                    <div className="col-6">
                        <TextField
                            label="Last Name"
                            value={last_name}
                            onChange={(e: any) => set_last_name(e.target.value)}
                            fullWidth
                        />
                    </div>
                </div>

                {/* Second Row: Email & Password */}
                <div className="row mt-3">
                    <div className="col-12">
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e: any) => set_email(e.target.value)}
                            fullWidth
                        />
                    </div>

                </div>

                {/* Third Row: Confirm Password */}
                <div className="row mt-3">
                    <div className="col-6">
                        <PasswordMUI
                            label="Password"
                            value={password}
                            onChange={(val: string) => set_password(val)}
                            style={{ width: "100%" }}
                            name="pass-1"
                        />
                    </div>
                    <div className="col-6 ">
                        <PasswordMUI
                            label="Confirm Password"
                            value={confirm_password}
                            onChange={(val: string) => set_confirm_password(val)}
                            style={{ width: "100%" }}
                            name="pass-2"
                        />
                    </div>
                </div>

                {/* Optional Fields for Role "2" */}
                {role_id === "2" && (
                    <>
                        <div className="row mt-3">
                            <div className="col-6">
                                <TextField
                                    label="ID Document Type"
                                    value={id_document_type}
                                    onChange={(e: any) => set_id_document_type(e.target.value)}
                                    fullWidth
                                />
                            </div>

                            <div className="col-6">
                                <TextField
                                    label="ID Document Number"
                                    value={id_document_number}
                                    onChange={(e: any) => set_id_document_number(e.target.value)}
                                    fullWidth
                                />
                            </div>
                        </div>

                        <div className="row mt-3">
                            <div className="col-6">
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                >
                                    Upload Document Image
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e: any) => set_document_image(e.target.files[0])}
                                        accept=".pdf,.docx,image/*"
                                    />
                                </Button>
                                {document_image && <SelectedFile file={document_image} set_file={set_document_image} />}
                            </div>

                            <div className="col-6">
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                >
                                    Upload Proof of Address
                                    <input
                                        type="file"
                                        hidden
                                        onChange={(e: any) => set_proof_of_address(e.target.files[0])}
                                        accept=".pdf,.docx,image/*"
                                    />
                                </Button>
                                {proof_of_address && <SelectedFile file={proof_of_address} set_file={set_proof_of_address} />}
                            </div>
                        </div>
                    </>
                )}

                {/* Submit Button */}
                <div className="row mt-3 d-flex justify-content-center align-content-center">
                    <div className="col-6">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={is_loading}
                            fullWidth
                        >
                            {is_loading ? "Submitting..." : "Submit"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreateUserForm;
