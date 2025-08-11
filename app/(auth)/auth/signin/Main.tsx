"use client";
import "./Main.css";
import * as React from "react";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {
  authorizationObj,
  baseUrl,
  emailPattern,
  passwordPattern,
  serverToken,
  webDomainName,
  webUrl,
} from "../../../utils/core";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { login } from "../../../redux/user";
import logo from "../../../../public/images/kiacademy-logo.svg";
import Image from "next/image";
import PasswordMUI from "@/app/components/mui/PasswordMUI";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { isSubdomain, subdomain } from "../../../utils/domain"; // adjust path if needed

export const CompanyAvatar = () => {
  const router = useRouter();

  return (
    <Image
      src={logo}
      width={100}
      height={100}
      alt="logo"
      className="object-cover object-center cursor-pointer"
      onClick={() => router.push("/")}
    />
  );
};

export function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      className="text-center text-light"
      sx={{
        position: "relative",
        bottom: 0,
        width: "100%",
        padding: "10px 0",
        backgroundColor: "transparent", // Optional
        ...props.sx,
      }}
      {...props}
    >
      {"Copyright © "}
      <Link
        color="inherit"
        className="text-light fw-semibold"
        target="_blank"
        href={webUrl}
        style={{ textDecoration: "none" }}
      >
        KI Academy
      </Link>{" "}
      {new Date().getFullYear()}
      {". "}
      {isSubdomain && subdomain ? (
        <>
          Powered by the <strong>{subdomain}</strong> community.
        </>
      ) : (
        <>Excellence in education for every learner.</>
      )}
    </Typography>
  );
}

export default function Main() {
  const [password, setPassword] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [data, setData] = React.useState<any>(null);
  const [subdomain, set_subdomain] = React.useState<any>("");
  const [user, set_user] = React.useState<any>(null);
  const [is_institute, setIsInstitute] = React.useState(false);
  const { data: session } = useSession();
  const dispatch = useDispatch();

  const router = useRouter();

  React.useEffect(() => {
    if (!data) return;
    localStorage.setItem("hart", JSON.stringify(data));
  }, [data]);

  React.useEffect(() => {
    if (subdomain && subdomain?.subdomain && subdomain?.data) {
      const website_domain = window.location.host.replace("www.", "");
      const protocol = window.location.protocol;
      let redirect_domain: string;
      if (
        website_domain
          ?.toLowerCase()
          ?.includes(`${subdomain?.subdomain?.toLowerCase()}.`)
      ) {
        setData(subdomain?.data);
        dispatch(login({ ...user, instituteData: subdomain?.instituteData }));
        switch (user?.role_id) {
          case "4":
            router.push("/institution/admin/dashboard");
            break;
          case "2":
            router.push("/institution/tutor/courses");
            break;
          case "3":
            router.push("/current-courses");
            break;
          case "5":
            router.push("/institution/sub-admin/dashboard");
            break;
          default:
            router.push("/auth/signin");
            break;
        }
      } else {
        redirect_domain = `${protocol}//${subdomain?.subdomain}.${website_domain}/auth`;
        window.location.href = redirect_domain;
        if (website_domain.startsWith(webDomainName)) {
          redirect_domain = `${protocol}//${subdomain?.subdomain}.${website_domain}/auth`;
          window.location.href = redirect_domain;
        } else {
          redirect_domain = `${protocol}//${subdomain?.subdomain}.${
            website_domain?.split(".")[1]
          }/auth`;
          window.location.href = redirect_domain;
        }
      }
    }
  }, [subdomain]);

  React.useEffect(() => {
    if (errorMessage) toast.error(errorMessage);
  }, [errorMessage]);

  React.useEffect(() => {
    if (successMessage) toast.success(successMessage);
  }, [successMessage]);

  const dashboardRouteMap: { [key: string]: string } = {
    "1": "/admin/dashboard",
    "2": "/tutor/dashboard",
    "3": "/student/courses",
    "4": "/institution/admin/dashboard",
    "5": "/institution/sub-admin/dashboard",
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const data = new FormData(e?.currentTarget);
    const email: any = data.get("email");

    if (
      !email ||
      !password ||
      !emailPattern?.test(email) ||
      !passwordPattern?.test(password)
    ) {
      setErrorMessage("Email or Password incorrect");
      setTimeout(() => {
        setErrorMessage(null);
      }, 2000);
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const response = await axios.post(`${baseUrl}/auth/login`, formData, {
        withCredentials: true,
        headers: {
          Authorization: serverToken,
          "Content-Type": "multipart/form-data",
        },
      });

      setIsLoading(false);
      if (response?.data?.status >= 200 && response?.data?.status < 300) {
        setSuccessMessage(response?.data?.message);
      } else {
        setErrorMessage(response?.data?.message);
        setTimeout(() => {
          setErrorMessage(null);
        }, 2000);
        return;
      }
      const userId = response?.data?.data?.user_id;

      const resp = await axios.get(
        `${baseUrl}/users/${userId}`,
        authorizationObj
      );
      set_user(resp?.data?.data);
      if (resp?.data?.data?.role_id === "4" || resp?.data?.data?.institute_id) {
        const instituteId = resp?.data?.data?.institute_id;
        const instResp = await axios.get(
          `${baseUrl}/institutions/${instituteId}`,
          authorizationObj
        );
        set_subdomain({
          subdomain: instResp?.data?.data?.subdomain_name,
          instituteData: instResp?.data?.data,
          data: {
            user_id: response?.data?.data?.user_id,
            email: response?.data?.data?.email,
          },
        });
      } else {
        setData(response?.data?.data);
        dispatch(login(resp?.data?.data));
        router.push("/");
      }

      // 👇 Redirect user based on role_id
      const route = dashboardRouteMap[resp?.data?.data?.role_id];
      if (route) {
        router.push(route);
      } else {
        router.push("/"); // default fallback
      }

      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 2000);
    } catch (error: any) {
      // console.error(error);
      setIsLoading(false);
      setErrorMessage("Something went wrong, please try later");
      setTimeout(() => {
        setErrorMessage(null);
      }, 2000);
    }
  };

  const completeGoogleLogin = async () => {
    if (user?.user_id) return;
    try {
      const formData = new FormData();
      formData.append("email", session?.user?.email || "");
      formData.append("name", session?.user?.name || "");
      formData.append("picture", session?.user?.image || "");
      setIsLoading(true);
      const response = await axios.post(
        `${baseUrl}/auth/login/google`,
        formData,
        authorizationObj
      );
      if (response?.data?.status > 299 || response?.data?.status < 200) {
        setErrorMessage(response?.data?.message);
        setTimeout(() => setErrorMessage(null), 3000);
        setIsLoading(false);
        return;
      }
      const resp = await axios.get(
        `${baseUrl}/users/${response?.data?.user_id}`,
        authorizationObj
      );
      setIsLoading(false);
      dispatch(login(resp?.data?.data));
      router.push("/");
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Something went wrong");
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const completeFacebookLogin = async () => {
    // console.log("facebook login")
  };

  React.useEffect(() => {
    if (session && session?.user && !user?.user_id) {
      if (
        session?.user?.image?.startsWith("https://lh3.googleusercontent.com")
      ) {
        completeGoogleLogin();
      } else {
        completeFacebookLogin();
      }
    }
  }, [session]);

  const googleLogin = async () => {
    if (user?.user_id) return;
    signIn("google", { callbackUrl: "https://kiacademy.in/auth/signin" });
  };

  const facebookLogin = async () => {
    signIn("facebook");
  };

  React.useEffect(() => {
    if (
      window?.location?.hostname?.split(".")[0]?.toLowerCase() !== webDomainName
    ) {
      setIsInstitute(true);
    }
  }, []);

  return (
    <>
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
          <Typography
            className="heading-style fw-bold"
            component="h3"
            variant="h5"
            sx={{ mb: 3 }}
          >
            Sign in
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              autoFocus
              type="email"
              name="email"
              sx={{ mb: 2 }}
            />
            <PasswordMUI
              label="Password"
              required
              onChange={(value: any) => setPassword(value)}
              name="password"
            />
            {/* forget password */}
            <Link
              href="/auth/forgot-password"
              passHref
              style={{ textDecoration: "none", color: "var(--color-dark-2)" }}
            >
              <Typography
                className="fw-bold btn-hover-pwd"
                sx={{ textAlign: "right", mt: 1 }}
              >
                Forgot password?
              </Typography>
              {/* <p className="fw-bold" style={{textDecoration:"none"}}>Forgot password?</p> */}
            </Link>
            <div className="d-flex justify-content-center align-items-center">
              <Button
                type="submit"
                className="btn-view w-50 fw-bold text-white"
                variant="contained"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2, py: 1.5 }}
              >
                {isLoading ? (
                  <>
                    <span className="buttonLoader text-white" />
                    Processing
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </div>
            {!isLoading && (
              <>
                <p className="text-center">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-decoration-none"
                    passHref
                  >
                    <span className="text-dark-2 fw-bold ">Register</span>
                  </Link>
                </p>
                <h6 className="text-center">Signup or login with</h6>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    justifyContent: "center",
                    mt: 2,
                  }}
                >
                  <Button
                    variant="outlined"
                    // className="btn-view text-white"
                    onClick={googleLogin}
                    sx={{
                      minWidth: "unset",
                      p: 1.5,
                      color: "var(--color-dark-2)", // Using the CSS variable here
                      border: "2px solid var(--color-dark-2)", // Use the same variable for the border
                      "&:hover": {
                        border: "2px solid var(--color-dark-2)",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <FaGoogle style={{ fontSize: "1.3em" }} />
                  </Button>

                  <Button
                    variant="outlined"
                    // className="btn-view text-white"
                    onClick={facebookLogin}
                    sx={{
                      minWidth: "unset",
                      p: 1.5,
                      color: "var(--color-dark-2)",
                      border: "2px solid var(--color-dark-2)",
                      "&:hover": {
                        border: "2px solid #000",
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                  >
                    <FaFacebook style={{ fontSize: "1.3em" }} />
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Box>
        {/* Sticky footer always at the bottom */}
        <Typography
          variant="body2"
          className="text-center text-dark-2"
          sx={{
            position: "relative",
            bottom: 0,
            width: "100%",
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
          {typeof isSubdomain !== "undefined" && isSubdomain && (
            typeof subdomain === "string" ? (
              <>
                Powered by the <strong>{subdomain}</strong> community.
              </>
            ) : (typeof subdomain === "object" && subdomain !== null && "subdomain" in subdomain) ? (
              <>
                Powered by the <strong>{(subdomain as any).subdomain || JSON.stringify(subdomain)}</strong> community.
              </>
            ) : (
              <>Excellence in education for every learner.</>
            )
          ) || <>Excellence in education for every learner.</>}
        </Typography>
      </Container>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
