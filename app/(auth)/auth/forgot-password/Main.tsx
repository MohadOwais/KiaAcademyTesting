"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { authorizationObj, baseUrl, emailPattern, webUrl } from "@/app/utils/core";
import axios from "axios";
import Link from "next/link";
import { CompanyAvatar, Copyright } from "../signin/Main";
import toast, { Toaster } from "react-hot-toast";
import { isSubdomain, subdomain } from "../../../utils/domain"; // adjust path if needed

export default function Main() {
  const router = useRouter();
  const [clientErrorMessage, setClientErrorMessage] = React.useState("");
  const [clientSuccessMessage, setClientSuccessMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (clientErrorMessage) toast.error(clientErrorMessage);
  }, [clientErrorMessage]);

  React.useEffect(() => {
    if (clientSuccessMessage) toast.success(clientSuccessMessage);
  }, [clientSuccessMessage]);

  const handleSubmit = async (e: any) => {
    e?.preventDefault();
    const data = new FormData(e?.currentTarget);
    const email: any = data.get("email");
    if (!email) {
      setClientErrorMessage("Email is required");
      setTimeout(() => {
        setClientErrorMessage("");
      }, 3000);
      return;
    }
    if (!emailPattern?.test(email?.toLowerCase())) {
      setClientErrorMessage("Invalid Email");
      setTimeout(() => {
        setClientErrorMessage("");
      }, 3000);
      return;
    }
    const formData = new FormData();
    formData.append("email", email);

    try {
      setIsLoading(true);
      const response: any = await axios.post(
        `${baseUrl}/auth/forgot-password`,
        formData,
        authorizationObj
      );
      setIsLoading(false);
      if (response?.data?.status > 299 || response?.data?.status < 200) {
        setClientErrorMessage(response?.data?.message);
        setTimeout(() => {
          setClientErrorMessage("");
        }, 3000);
        return;
      }
      router.push(`/auth/forgot-password-complete?email=${email}`);
      setClientSuccessMessage("OTP code has sent to your email");
      setTimeout(() => {
        setClientSuccessMessage("");
      }, 3000);
    } catch (error: any) {
      // console.error(error);
      setIsLoading(false);
      setClientErrorMessage("Something went wrong, please try later");
      setTimeout(() => {
        setClientErrorMessage("");
      }, 3000);
    }
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      {/* <Container component="main" maxWidth="xs"> */}
      <Container
        component="main"
        maxWidth="xs"
        className="d-flex flex-column"
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            flex: 1,
          }}
        >
          <CompanyAvatar />
          <Typography className="heading-style" component="h3" variant="h5">
            Forgot Password
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              type="email"
              style={{
                marginBottom: "16px",
              }}
            />
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button
                className="btn-view"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, width: "100px" }}
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                }}
                onClick={() => router.back()}
              >
                <ArrowBackIos
                  style={{
                    fontSize: "16px",
                    marginLeft: "4px",
                  }}
                />
                <span
                  style={{
                    width: "50%",
                    textAlign: "center",
                    paddingLeft: "4px",
                  }}
                >
                  Back
                </span>
              </Button>
              <Button
                type="submit"
                className="btn-view"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, width: isLoading ? "150px" : "100px" }}
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="text-white"
                      style={{
                        width: "50%",
                        textAlign: "center",
                        paddingRight: "4px",
                        marginRight: "16px",
                      }}
                    >
                      Processing
                    </span>
                    <span className="buttonLoader text-white"></span>
                  </>
                ) : (
                  <>
                    <span
                      style={{
                        width: "50%",
                        textAlign: "center",
                        paddingRight: "4px",
                      }}
                    >
                      Next
                    </span>
                    <ArrowForwardIos
                      style={{
                        fontSize: "16px",
                        marginRight: "4px",
                      }}
                    />
                  </>
                )}
              </Button>
            </Box>
          </Box>
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
    </>
  );
}
