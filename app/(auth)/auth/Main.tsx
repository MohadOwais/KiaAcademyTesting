"use client";

import "./Main.css";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { MdOutlineEmail } from "react-icons/md";
import { useRouter } from "next/navigation";
import { CompanyAvatar, Copyright } from "./signin/Main";
import { Button } from "@mui/material";
import AlertMUI from "@/app/components/mui/AlertMUI";
import { useSession, signIn } from "next-auth/react";
import { authorizationObj, webDomainName, webUrl } from "@/app/utils/core";
import axios from "axios";
import { baseUrl } from "../../utils/core";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/app/redux/user";
import Link from "next/link";
import { isSubdomain, subdomain } from "../../utils/domain";

export default function Main() {
  const router = useRouter();
  const { data: session } = useSession();
  const currentUser = useSelector((state: any) => state?.user);
  const dispatch = useDispatch();

  const [clientErrorMessage, setClientErrorMessage] = React.useState<string | null>(null);
  const [clientSuccessMessage, setClientSuccessMessage] = React.useState<string | null>(null);
  const [is_institute, set_is_institute] = React.useState(false);
  const [is_loading, set_is_loading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  React.useEffect(() => {
    if (!data || !data?.email || !data?.user_id) return;
    const session_data = { user_id: data.user_id, email: data.email };
    localStorage.setItem("hart", JSON.stringify(session_data));
    router.push("/");
  }, [data, router]);

  React.useEffect(() => {
    const currentSubdomain = window?.location?.hostname?.split(".")[0]?.toLowerCase();
    if (currentSubdomain !== webDomainName) {
      set_is_institute(true);
      router.push("/auth/signin");
    }
  }, [router]);

  const completeGoogleLogin = async () => {
    if (currentUser?.user_id) return;
    try {
      const formData = new FormData();
      formData.append("email", session?.user?.email || "");
      formData.append("name", session?.user?.name || "");
      formData.append("picture", session?.user?.image || "");

      set_is_loading(true);

      const response = await axios.post(`${baseUrl}/auth/login/google`, formData, authorizationObj);

      if (response?.data?.status < 200 || response?.data?.status > 299) {
        setClientErrorMessage(response?.data?.message);
        setTimeout(() => setClientErrorMessage(null), 3000);
        set_is_loading(false);
        return;
      }

      const userResp = await axios.get(`${baseUrl}/users/${response?.data?.user_id}`, authorizationObj);
      set_is_loading(false);
      setData(userResp?.data?.data);
      dispatch(login(userResp?.data?.data));
      router.push("/");
    } catch (error) {
      console.error("Google login failed:", error);
      setClientErrorMessage("Something went wrong during login.");
      set_is_loading(false);
    }
  };

  const completeFacebookLogin = async () => {
    // Facebook login logic here
  };

  React.useEffect(() => {
    if (session && session.user && !currentUser?.user_id) {
      const isGoogle = session?.user?.image?.startsWith("https://lh3.googleusercontent.com");
      isGoogle ? completeGoogleLogin() : completeFacebookLogin();
    }
  }, [session]);

  const googleLogin = () => {
    if (currentUser?.user_id) return;
    signIn("google", { callbackUrl: "https://kiacademy.in/auth" });
  };

  const facebookLogin = () => {
    signIn("facebook");
  };

  return (
    <>
      {clientErrorMessage && <AlertMUI status="error" text={clientErrorMessage} />}
      {clientSuccessMessage && <AlertMUI status="success" text={clientSuccessMessage} />}

      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <CompanyAvatar />
          <Typography component="h1" variant="h5" sx={{ marginTop: "0.8em" }}>
            KI Academy
          </Typography>
        </Box>

        <div className="authentication-buttons">
          <Button
            style={{ color: "#fff", width: "100%" }}
            onClick={() => router.push("/auth/signin")}
            color="primary"
            variant="contained"
            disabled={is_loading}
          >
            <MdOutlineEmail
              style={{ fontSize: "1.3em", marginRight: "0.5em", marginTop: "-0.2em" }}
            />
            Continue With Email
          </Button>
        </div>

        <Typography
          variant="body2"
          className="text-center text-dark-2"
          sx={{
            position: "relative",
            bottom: 0,
            width: "100%",
            padding: "10px 0",
            backgroundColor: "transparent",
            marginTop: "10%",
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
          {typeof isSubdomain !== "undefined" && isSubdomain && typeof subdomain === "string" ? (
            <>
              Powered by the <strong>{subdomain}</strong> community.
            </>
          ) : (typeof subdomain === "object" && subdomain !== null && "subdomain" in subdomain) ? (
            <>Powered by the <strong>{(subdomain as any).subdomain || JSON.stringify(subdomain)}</strong> community.</>
          ) : (
            <>Excellence in education for every learner.</>
          )}
        </Typography>
      </Container>
    </>
  );
}
