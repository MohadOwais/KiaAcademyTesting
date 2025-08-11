import * as React from 'react';
import Dialog from '@mui/material/Dialog';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import PasswordMUI from '@/app/components/mui/PasswordMUI';
import { MuiOtpInput } from 'mui-one-time-password-input'
import { theme } from "../../utils/mui-theme"
import logo from "../../../public/images/logo-black.png"
import Image from "next/image"
import { Copyright } from '@/app/(auth)/auth/signin/Main';

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & {
        children: React.ReactElement;
    },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function OtpModal({ open, setOpen, otp, setOtp, data, resendOtp, isLoading, completeOtpVerification, errorMessage }: any) {

    const handleClose = () => {
        setOpen(false);
    };

    const handleChange = async (newValue: any) => {
        setOtp(newValue)
    }

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <>
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Toolbar>
            </>
            <>
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
                        <Avatar sx={{ m: 1, bgcolor: '#00000000' }}>
                            <Image src={logo} width={50} height={50} objectFit='cover' alt="logo" />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Verify Email
                        </Typography>
                        <Typography component="p" style={{
                            textAlign: "center",
                            marginTop: "16px",
                        }}>
                            Enter 6 digit code sent to: <b>{data}</b>
                        </Typography>
                        <Box sx={{ mt: 1, width: "100%" }}>
                            <MuiOtpInput length={6} value={otp} onChange={handleChange}
                                style={{
                                    margin: "32px 0",
                                }}
                                gap="12px"
                            />
                            <>
                                {
                                    errorMessage ?
                                        <>
                                            <p className="w-full text-center text-[#EC4646]">{errorMessage}</p>
                                        </> : null
                                }
                            </>
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
                                    disabled={isLoading || otp?.length != 6}
                                    onClick={completeOtpVerification}
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
                                                >Verify</span>
                                            </>
                                    }
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                    <Copyright sx={{ mt: 8, mb: 4 }} />
                </Container>
            </>
        </Dialog>
    );
}
