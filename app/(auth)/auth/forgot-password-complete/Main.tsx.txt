"use client"

import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { useRouter } from 'next/navigation';
import { MuiOtpInput } from 'mui-one-time-password-input'
import { authorizationObj, baseUrl, emailPattern, otpPattern, passwordPattern } from '../../../utils/core';
import axios from "axios"
import { CompanyAvatar, Copyright } from '../signin/Main';
import { theme } from "../../../utils/mui-theme"
import { useSelector } from 'react-redux';
import AlertMUI from '@/app/components/mui/AlertMUI';
import PasswordMUI from '@/app/components/mui/PasswordMUI';

export default function ForgotPasswordComplete({ searchParams }: any) {
    const router = useRouter()
    const currentUser = useSelector((state: any) => state?.user)
    const [otp, setOtp] = React.useState<string>('')
    const [clientErrorMessage, setClientErrorMessage] = React.useState<string | null>(null)
    const [clientSuccessMessage, setClientSuccessMessage] = React.useState<string | null>(null)
    const [password, setPassword] = React.useState<string | null>("")
    const [repeatPassword, setRepeatPassword] = React.useState<string | null>("")
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    const handleChange = async (newValue: any) => {
        setOtp(newValue)
    }

    const resendOtp = async () => {
        const email: any = searchParams?.email
        if (!email) {
            setClientErrorMessage("Email is required")
            setTimeout(() => { setClientErrorMessage("") }, 3000)
            return;
        }
        if (!emailPattern?.test(email?.toLowerCase())) {
            setClientErrorMessage("Invalid Email")
            setTimeout(() => { setClientErrorMessage("") }, 3000)
            return;
        }
        const formData = new FormData()
        formData.append("email", email)

        try {
            setIsLoading(true)
            const response: any = await axios.post(`${baseUrl}/auth/forgot-password`, formData, authorizationObj)
            setIsLoading(false)
            if (response?.data?.status > 299 || response?.data?.status < 200) {
                setClientErrorMessage(response?.data?.message)
                setTimeout(() => { setClientErrorMessage("") }, 3000)
                return
            }
            setClientSuccessMessage("OTP code has sent to your email")
            setTimeout(() => { setClientSuccessMessage("") }, 3000)

        } catch (error: any) {
            // console.error(error);
            setIsLoading(false)
            setClientErrorMessage("Something went wrong, please try later")
            setTimeout(() => { setClientErrorMessage("") }, 3000)

        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e?.preventDefault()
        const email = searchParams?.email
        if (!email) {
            setClientErrorMessage("Email is required")
            setTimeout(() => { setClientErrorMessage("") }, 3000)
            return;
        }
        if (!emailPattern?.test(email?.toLowerCase())) {
            setClientErrorMessage("Invalid email")
            setTimeout(() => { setClientErrorMessage("") }, 3000)
            return;
        }
        if (!otp) {
            setClientErrorMessage("OTP code is required")
            setTimeout(() => { setClientErrorMessage("") }, 3000)
            return;
        }
        if (!otpPattern?.test(otp)) {
            setClientErrorMessage("Invalid otp code")
            setTimeout(() => { setClientErrorMessage("") }, 3000)
            return;
        }
        if (!password) {
            setClientErrorMessage("Password is required")
            setTimeout(() => { setClientErrorMessage("") }, 3000)
            return;
        }
        if (!passwordPattern?.test(password)) {
            setClientErrorMessage("Password must be alphanumeric and 8 to 24 characters long")
            setTimeout(() => { setClientErrorMessage("") }, 3000)
            return
        }
        if (!repeatPassword || password !== repeatPassword) {
            setClientErrorMessage("Passwords do not match")
            setTimeout(() => { setClientErrorMessage("") }, 3000)
            return
        }
        const formData = new FormData()
        formData.append("email", email)
        formData.append("otp", otp)
        try {
            setIsLoading(true)
            const response = await axios.post(`${baseUrl}/auth/verify-otp`, formData, authorizationObj)
            if (response?.data?.status > 299 || response?.data?.status < 200) {
                setClientErrorMessage(response?.data?.message)
                setTimeout(() => { setClientErrorMessage("") }, 3000)
                return
            }
            if (response?.data?.message?.trim()?.toUpperCase() !== "OTP VERIFIED") {
                setClientErrorMessage("Invalid OTP")
                setTimeout(() => { setClientErrorMessage("") }, 3000)
                return
            }
            const passFormData = new FormData()
            passFormData.append("email", email?.toLowerCase())
            passFormData.append("password", password)

            const passwordResp = await axios.post(`${baseUrl}/auth/reset-password`, passFormData, authorizationObj)
            setIsLoading(false)
            if (passwordResp?.data?.status > 299 || passwordResp?.data?.status < 200) {
                setClientErrorMessage(response?.data?.message)
                setTimeout(() => { setClientErrorMessage("") }, 3000)
                return
            }
            setClientSuccessMessage("Password reset successfully")
            setTimeout(() => { setClientSuccessMessage("") }, 3000)
            router.push("/auth/signin")
        } catch (error: any) {
            // console.error(error);
            setIsLoading(false)
            setClientErrorMessage(error?.response?.data?.message)
            setTimeout(() => {
                setClientErrorMessage(null)
            }, 3000)
        }
    }

    return (
        <>
            {clientErrorMessage && <AlertMUI status="error" text={clientErrorMessage} />}
            {clientSuccessMessage && <AlertMUI status="success" text={clientSuccessMessage} />}
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <Box
                    sx={{
                        marginTop: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <CompanyAvatar />
                    <Typography component="h1" variant="h5">
                        Forgot Password
                    </Typography>
                    <Typography component="p" style={{
                        textAlign: "center",
                        marginTop: "16px",
                    }}>
                        Enter 6 digit code sent to: <b>{searchParams?.email}</b>
                    </Typography>
                    <form style={{ marginTop: "16px", width: "100%" }}
                        onSubmit={handleSubmit}
                    >
                        <MuiOtpInput length={6} value={otp} onChange={handleChange}
                            style={{
                                margin: "32px 0",
                            }}
                            gap="12px"
                        />
                        <PasswordMUI
                            label="New Password * "
                            onChange={(value: any) => setPassword(value)}
                            name="password"
                        />
                        <div className='p-[8px]'></div>
                        <PasswordMUI
                            label="Repeat New Password * "
                            onChange={(value: any) => setRepeatPassword(value)}
                            name="password-rep"
                        />
                        <Typography component="p"
                            style={{
                                color: theme.palette.text.primary,
                                textDecoration: "underline",
                                textDecorationColor: theme.palette.text.primary,
                                cursor: "pointer",
                                marginTop: "16px",
                                textAlign: "right",
                            }}
                            onClick={resendOtp}
                        >Resend OTP</Typography>
                        <Box style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, width: "100%" }}
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                                disabled={isLoading}
                            >
                                {
                                    isLoading ?
                                        <>
                                            <span className="buttonLoader"></span>
                                            <span style={{
                                                textAlign: "center",
                                                paddingLeft: "4px"
                                            }}
                                            >Processing</span>
                                        </>
                                        :
                                        <>
                                            <span style={{
                                                width: "100%",
                                                textAlign: "center",
                                                paddingLeft: "4px"
                                            }}
                                            >Update Password</span>
                                        </>
                                }
                            </Button>
                        </Box>
                    </form>
                </Box>
                <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
        </>
    );
}