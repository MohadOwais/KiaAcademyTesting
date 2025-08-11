"use client";
import "./Main.css";
import * as React from "react";
import { useEffect } from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useRouter } from "next/navigation";
import { MuiOtpInput } from "mui-one-time-password-input";
import axios from "axios";
import { useSelector } from "react-redux";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { isSubdomain, subdomain } from "../../../utils/domain"; // adjust path if needed


// Imports for utility and UI components
import {
  authorizationObj,
  baseUrl,
  emailPattern,
  otpPattern,
  passwordPattern,
  webUrl
} from "../../../utils/core";
import { CompanyAvatar, Copyright } from "../signin/Main";
import { theme } from "../../../utils/mui-theme";
import PasswordMUI from "@/app/components/mui/PasswordMUI";

export default function ForgotPasswordComplete({ searchParams }: any) {
  const router = useRouter();
  const currentUser = useSelector((state: any) => state?.user);

  const [email, setEmail] = React.useState<string>(searchParams?.email || "");
  const [otp, setOtp] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [confirmPassword, setConfirmPassword] = React.useState<string>("");
  const [clientErrorMessage, setClientErrorMessage] = React.useState<string | null>(null);
  const [clientSuccessMessage, setClientSuccessMessage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = React.useState<number>(30);
  const [showPasswordFields, setShowPasswordFields] = React.useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = React.useState<boolean>(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Initial setup with email
  useEffect(() => {
    if (searchParams) {
      const sanitizedEmail = JSON.parse(searchParams.value).email;
      if (!emailPattern.test(sanitizedEmail)) {
        setClientErrorMessage("Invalid email format");
        setTimeout(() => setClientErrorMessage(null), 3000);
        return;
      }
      setEmail(sanitizedEmail);
    }
  }, [searchParams]);

  // Cooldown logic for resend button
  useEffect(() => {
    if (resendCooldown === 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  React.useEffect(() => {
    if (clientErrorMessage) toast.error(clientErrorMessage);
  }, [clientErrorMessage]);

  React.useEffect(() => {
    if (clientSuccessMessage) toast.success(clientSuccessMessage);
  }, [clientSuccessMessage]);

  // Resend OTP function
  const resendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("email", email);

      const response = await axios.post(
        `${baseUrl}/auth/forgot-password`,
        formData,
        authorizationObj
      );

      if (!response.data || response.data.status !== 200) {
        throw new Error(response.data?.message || "Failed to send OTP");
      }

      setClientSuccessMessage("New OTP sent to your email.");
      setResendCooldown(30);
      setOtp("");
      setTimeout(() => setClientSuccessMessage(null), 3000);
    } catch (error: any) {
      setClientErrorMessage(error.message || "Something went wrong, please try again later");
      setTimeout(() => setClientErrorMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isOtpVerified) {
      // Handle OTP verification
      if (!otp || !otpPattern.test(otp) || otp.length !== 6) {
        setClientErrorMessage("Please enter a valid 6-digit OTP");
        setTimeout(() => setClientErrorMessage(null), 3000);
        return;
      }

      try {
        setIsLoading(true);
        const formData = new FormData();
        formData.append("email", email);
        formData.append("otp", otp);
        const response = await axios.post(
          `${baseUrl}/auth/verify-otp`,
          formData,
          authorizationObj
        );

        if (!response.data || response.data.status !== 200) {
          throw new Error(response.data?.message || "Failed to verify OTP");
        }

        setShowPasswordFields(true);
        setIsOtpVerified(true);
        setClientSuccessMessage("OTP verified successfully");
        setTimeout(() => setClientSuccessMessage(null), 3000);
      } catch (error: any) {
        setClientErrorMessage(error.message || "Failed to verify OTP");
        setTimeout(() => setClientErrorMessage(null), 3000);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Handle password reset
    if (!password || !passwordPattern.test(password)) {
      setClientErrorMessage("Password must be alphanumeric and 8-24 characters");
      setTimeout(() => setClientErrorMessage(null), 3000);
      return;
    }

    if (password !== confirmPassword) {
      setClientErrorMessage("Passwords do not match");
      setTimeout(() => setClientErrorMessage(null), 3000);
      return;
    }

    try {
      setIsLoading(true);
      const passFormData = new FormData();
      passFormData.append("email", email);
      passFormData.append("password", password);

      const passwordResp = await axios.post(
        `${baseUrl}/auth/reset-password`,
        passFormData,
        authorizationObj
      );

      if (passwordResp?.data?.status > 299 || passwordResp?.data?.status < 200) {
        throw new Error(passwordResp.data?.message || "Failed to reset password");
      }

      setClientSuccessMessage("Password reset successful");
      setTimeout(() => {
        setClientSuccessMessage(null);
        router.push("/auth/signin");
      }, 2000);
    } catch (error: any) {
      setClientErrorMessage(error.message || "An error occurred");
      setTimeout(() => setClientErrorMessage(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setOtp(numericValue);
  };

  return (
    <>
      <Container component="main" maxWidth="xs" sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <CssBaseline />
        <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
          <CompanyAvatar />
          <Typography className="heading-style fw-bold" component="h3" variant="h5">Forgot Password</Typography>
          <Typography sx={{ textAlign: "center", marginTop: 2 }}>
            {!showPasswordFields ? (
              <>Enter 6-digit code sent to: <b>{email}</b></>
            ) : (
              <>Set your new password</>
            )}
          </Typography>

          <form onSubmit={handleSubmit} style={{ marginTop: "16px", width: "100%" }}>
            {!showPasswordFields ? (
              <>
                <MuiOtpInput 
                  length={6} 
                  value={otp} 
                  onChange={handleChange}
                  style={{ margin: "32px 0" }} 
                  gap="12px"
                  TextFieldsProps={{
                    inputProps: { 
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                      maxLength: 1
                    }
                  }}
                />

                {(!otp || resendCooldown === 0) && (
                  <Typography className="btn-hover-pwd"
                    sx={{
                      color: resendCooldown ? "gray" : theme.palette.text.primary,
                      cursor: resendCooldown ? "not-allowed" : "pointer",
                      marginBottom: "16px",
                      textAlign: "right",
                    }}
                    onClick={resendOtp}
                  >
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                  </Typography>
                )}
              </>
            ) : (
              <>
                <PasswordMUI 
                  label="New Password *" 
                  onChange={(value: string) => setPassword(value)} 
                  name="password" 
                  style={{ marginBottom: "16px" }} 
                />
                <PasswordMUI 
                  label="Confirm New Password *" 
                  onChange={(value: string) => setConfirmPassword(value)} 
                  name="password-confirm" 
                />
              </>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
              
              <Button
                type="submit"
                
                className="btn-view w-50 text-white"
                variant="contained"
                sx={{ mt: 3, mb: 2, width: "100%" }}
                disabled={isLoading || (!showPasswordFields && (!otp || otp.length !== 6))}
              >
                {isLoading ? (
                  <>
                    <span className="buttonLoader"></span>
                    <span style={{ paddingLeft: "4px" }}>Processing</span>
                  </>
                ) : (
                  <span style={{ width: "100%", textAlign: "center" }}>
                    {showPasswordFields ? "Update Password" : "Verify OTP"}
                  </span>
                )}
              </Button>
              
            </Box>
          </form>
        </Box>
         {/* Sticky footer always at the bottom */}
        <Typography
          variant="body2"
          className="text-center text-dark-2"
          sx={{
            position: "relative",
            bottom: 0,
            width: "100vw",
            left: "50%",
            right: 0,
            transform: "translateX(-50%)",
            padding: "10px 0",
            backgroundColor: "transparent",
          }}
        >
          {"Copyright © "}
          <Link
            color="inherit"
            className="text-dark-2 fw-semibold"
            target="_blank"
            href={webUrl}
            style={{ textDecoration: "none" }}
          >
            KI Academy
          </Link>{" "}
          {new Date().getFullYear()}
          {". "}
          {typeof isSubdomain !== "undefined" && isSubdomain && subdomain ? (
            <>
              Powered by the <strong>{subdomain}</strong> community.
            </>
          ) : (
            <>Excellence in education for every learner.</>
          )}
        </Typography>
      </Container>
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
