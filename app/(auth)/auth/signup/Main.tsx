"use client";

import "./Main.css";
import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
// import FormControlLabel from '@mui/material/FormControlLabel';
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from '@mui/material/Typography';
import Container from "@mui/material/Container";
import {
  userNamePattern,
  emailPattern,
  passwordPattern,
  baseUrl,
  serverToken,
  profilePicture,
  webUrl,
} from "../../../utils/core";
import axios from "axios";
// import Radio from '@mui/material/Radio';
// import RadioGroup from '@mui/material/RadioGroup';
import FormControl from "@mui/material/FormControl";
// import FormLabel from '@mui/material/FormLabel';
import { useRouter } from "next/navigation";
import { CompanyAvatar, Copyright } from "../signin/Main";
import { Button, Autocomplete, CircularProgress } from "@mui/material";
import AlertMUI from "@/app/components/mui/AlertMUI";
import PasswordMUI from "@/app/components/mui/PasswordMUI";
import Image from "next/image";
import { SelectedFile } from "@/app/components/mui/CreateUserForm";
import { isSubdomain, subdomain } from "../../../utils/domain"; // adjust path if needed

// import "../../../styles/style.css";

export const TutorDocs = ({ file, setFile }: any) => {
  return <div>file</div>;
};

export const StudentOrTutor = ({
  state,
  setState,
}: {
  state: string;
  setState: (value: string) => void;
}) => {
  const handleUserTypeChange = (value: string) => {
    if (value === "institution") {
      window.location.href = "/institution/registration";
    } else {
      setState(value);
    }
  };

  const getButtonClasses = (value: string) => {
    const isActive = state === value;
    return `btn rounded-pill m-1 reg-btn px-4 py-2 w-100 btn-Active ${
      isActive ? "bg-dark-2 text-white " : "bg-white text-dark"
    } `;
  };

  return (
    <div className="d-flex justify-content-center  my-3 w-100">
      <button
        type="button"
        className={getButtonClasses("tutor")}
        onClick={() => handleUserTypeChange("tutor")}
      >
        Tutor
      </button>
      <button
        type="button"
        className={getButtonClasses("student")}
        onClick={() => handleUserTypeChange("student")}
      >
        Student
      </button>
      <button
        type="button"
        className={getButtonClasses("institution")}
        onClick={() => handleUserTypeChange("institution")}
      >
        Organisation
      </button>
    </div>
  );
};

export default function SignUp() {
  const router = useRouter();

  const [password, setPassword] = React.useState<string>("");
  const [repeatPassword, setRepeatPassword] = React.useState<string>("");
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");
  const [selectedCountryCode, setSelectedCountryCode] =
    React.useState<string>("+1");
  // const [countryCode, setCountryCode] = React.useState<string>("+1")
  const [clientErrorMessage, setClientErrorMessage] = React.useState<
    string | null
  >(null);
  const [clientSuccessMessage, setClientSuccessMessage] = React.useState<
    string | null
  >(null);
  const [role, setRole] = React.useState<string>("student");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [imageBase64, setImageBase64] = React.useState<any>(null);
  const [file, setFile] = React.useState<any>(null);
  const [viewImage, setViewImage] = React.useState<any>(null);

  const [document_number, set_document_number] = React.useState("");
  const [document_name, set_document_name] = React.useState("");
  const [proof_of_address, set_proof_of_address] = React.useState<File | null>(
    null
  );
  const [document_image, set_document_image] = React.useState<File | null>(
    null
  );

  // Update type to include iso2 for countryCodesList
  const [countryCodesList, setCountryCodesList] = React.useState<
    { code: string; flag: string; name: string; iso2?: string }[]
  >([]);
  const [isLoadingCountries, setIsLoadingCountries] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState<string>("");

  const filteredCountries = countryCodesList.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.includes(searchQuery)
  );

  // Fetch country codes from API (with fallback and user location detection, like contact page)
  React.useEffect(() => {
    const fetchCountryCodes = async () => {
      let userCountryIso2 = "US"; // Default to USA
      try {
        // Try to get user country code from IP
        const geoResp = await fetch("https://ipapi.co/json/");
        const geoData = await geoResp.json();
        if (geoData && geoData.country_code) {
          userCountryIso2 = geoData.country_code;
        }
      } catch (geoErr) {
        // Ignore geolocation errors, fallback to default
      }
      try {
        const resp = await fetch("https://restcountries.com/v3.1/all");
        const data = await resp.json();
        const codes = data
          .map((country: any) => {
            const code =
              country.idd?.root && country.idd?.suffixes?.length > 0
                ? country.idd.root + country.idd.suffixes[0]
                : null;
            return code
              ? {
                  code,
                  flag: country.flag,
                  name: country.name.common,
                  iso2: country.cca2, // ISO alpha-2 code
                }
              : null;
          })
          .filter(Boolean)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountryCodesList(codes);
        // Set default country code based on user location
        const found = codes.find((c: any) => c.iso2 === userCountryIso2);
        setSelectedCountryCode(found ? found.code : "+1");
        setIsLoadingCountries(false);
      } catch (err) {
        // Fallback to local file
        try {
          const resp = await fetch("/restcountries-all.json");
          const data = await resp.json();
          const codes = data
            .map((country: any) => {
              const code =
                country.idd?.root && country.idd?.suffixes?.length > 0
                  ? country.idd.root + country.idd.suffixes[0]
                  : null;
              return code
                ? {
                    code,
                    flag: country.flag,
                    name: country.name.common,
                    iso2: country.cca2,
                  }
                : null;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
          setCountryCodesList(codes);
          // Set default country code based on user location
          const found = codes.find((c: any) => c.iso2 === userCountryIso2);
          setSelectedCountryCode(found ? found.code : "+1");
        } catch (fallbackErr) {
          setCountryCodesList([
            { code: "+91", flag: "🇮🇳", name: "India", iso2: "IN" },
            { code: "+1", flag: "🇺🇸", name: "United States", iso2: "US" },
          ]);
          setSelectedCountryCode("+1");
        } finally {
          setIsLoadingCountries(false);
        }
      }
    };
    fetchCountryCodes();
  }, []);

  const handleSubmit = async (event: any) => {
    event?.preventDefault();
    const data = new FormData(event?.currentTarget);

    const firstName: any = data.get("firstName");
    const lastName: any = data.get("lastName");
    const email: any = data.get("email");

    if (!firstName || !userNamePattern.test(firstName)) {
      setClientErrorMessage("First Name must between 2 to 15 characters long");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!lastName || !userNamePattern.test(lastName)) {
      setClientErrorMessage("Last Name must between 2 to 15 characters long");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!email || !emailPattern.test(email)) {
      setClientErrorMessage("Email pattern is invalid");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!phoneNumber || phoneNumber?.trim() === "") {
      setClientErrorMessage("Phone number is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!passwordPattern.test(password)) {
      setClientErrorMessage(
        "Password must be alphanumeric and 8 to 24 characters long"
      );
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (password !== repeatPassword) {
      setClientErrorMessage("Passwords do not match");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    const roles = ["tutor", "student"];

    if (!role || !roles?.includes(role)) {
      setClientErrorMessage("Role must be a Tutor or Student");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    // if (!file) {
    //     setClientErrorMessage("Profile picture is required")
    //     setTimeout(() => {
    //         setClientErrorMessage(null)
    //     }, 2000)
    //     return
    // }

    // if (role === "tutor" && !document_name) {
    //     setClientErrorMessage("Document name is required")
    //     setTimeout(() => {
    //         setClientErrorMessage(null)
    //     }, 2000)
    //     return
    // }

    // if (role === "tutor" && !document_number) {
    //     setClientErrorMessage("Document number is required")
    //     setTimeout(() => {
    //         setClientErrorMessage(null)
    //     }, 2000)
    //     return
    // }

    // if (role === "tutor" && !document_image) {
    //     setClientErrorMessage("Document image is required")
    //     setTimeout(() => {
    //         setClientErrorMessage(null)
    //     }, 2000)
    //     return
    // }

    // if (role === "tutor" && !proof_of_address) {
    //     setClientErrorMessage("Proof of address is required")
    //     setTimeout(() => {
    //         setClientErrorMessage(null)
    //     }, 2000)
    //     return
    // }

    if (file) {
      const url: any = URL.createObjectURL(file);
      setImageBase64(url);
      setIsLoading(true);
    }

    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("phone_num", phoneNumber);
      formData.append("country_code", selectedCountryCode);
      formData.append("password", password);
      formData.append("role_id", role === "student" ? "3" : "2");
      if (file) formData.append("profile_picture", file);
      if (document_name && role === "tutor")
        formData.append("id_document_type", document_name);
      if (document_number && role === "tutor")
        formData.append("id_document_number", document_number);
      if (document_image && role === "tutor")
        formData.append("document_image", document_image);
      if (proof_of_address && role === "tutor")
        formData.append("proof_of_address", proof_of_address);
      setIsLoading(true);
      const resp = await axios.post(`${baseUrl}/users/create`, formData, {
        withCredentials: true,
        headers: { Authorization: serverToken },
      });

      setIsLoading(false);

      if (resp?.data?.status >= 200 && resp?.data?.status < 300) {
        setClientSuccessMessage(resp?.data?.message);
      } else {
        setClientErrorMessage(resp?.data?.message);
        setTimeout(() => {
          setClientErrorMessage(null);
        }, 2000);
        return;
      }

      setClientSuccessMessage(
        "We have sent a verification link to your email, please verify your account"
      );

      setTimeout(() => {
        setClientSuccessMessage(null);
        setClientErrorMessage(null);
        router.push("/auth/signin");
      }, 4000);
    } catch (error) {
      setIsLoading(false);
      setClientErrorMessage("Something went wrong, please try later");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }
  };

  return (
    <>
      {clientErrorMessage && (
        <AlertMUI status="error" text={clientErrorMessage} />
      )}
      {clientSuccessMessage && (
        <AlertMUI status="success" text={clientSuccessMessage} />
      )}
      <Container component="main" maxWidth="sm">
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
          <h3 className="heading-style mt-md-2">Sign up</h3>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" alignItems="center">
                  <input
                    accept="image/*"
                    type="file"
                    id="file-sts"
                    hidden
                    onChange={async (e: any) => {
                      setFile(e?.target?.files[0]);
                      setViewImage(URL.createObjectURL(e?.target?.files[0]));
                    }}
                  />
                  <label
                    htmlFor="file-sts"
                    className="ml-auto mr-auto flex justify-center"
                  >
                    <Image
                      src={viewImage || profilePicture}
                      alt="profile image"
                      width={100}
                      height={100}
                      className="w-[100px] h-[100px] object-cover object-center border-2 rounded-circle border-dark-2 cursor-pointer rounded-full"
                    />
                  </label>
                </Box>
                <StudentOrTutor state={role} setState={setRole} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordMUI
                  name="password"
                  label="Password * "
                  onChange={(value: any) => setPassword(value)}
                />
              </Grid>
              <Grid item xs={12}>
                <PasswordMUI
                  name="repeatPassword"
                  label="Confirm Password * "
                  onChange={(value: any) => setRepeatPassword(value)}
                />
              </Grid>

              {/* Country Code with Autocomplete */}
              <Grid item xs={12} sm={6}>
                <Box display="flex">
                  <FormControl fullWidth size="small">
                    <Autocomplete
                      options={filteredCountries}
                      getOptionLabel={(option) =>
                        `${option.code} ${option.name}`
                      }
                      loading={isLoadingCountries}
                      onChange={(event, newValue) =>
                        setSelectedCountryCode(newValue ? newValue.code : "")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Country Code"
                          variant="outlined"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingCountries ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          required
                        />
                      )}
                      style={{
                        width: "100%",
                        height: "100%",
                        cursor: "pointer",
                      }}
                    />
                  </FormControl>
                </Box>
              </Grid>

              {/* Phone Number Field */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Contact Number"
                  type="number"
                  variant="outlined"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </Grid>

              {role === "tutor" ? (
                <React.Fragment>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Document Name"
                      value={document_name}
                      onChange={(e) => set_document_name(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Document Number"
                      value={document_number}
                      onChange={(e) => set_document_number(e.target.value)}
                    />
                  </Grid>
                  <div className="d-flex justify-content-center align-items-center gap-5 mt-3 w-100">
                    <Grid container spacing={2} xs={12} justifyContent="center">
                      <Grid item xs={12} md={5}>
                        <Button
                          variant="outlined"
                          className="w-100 ms-2 me-5 border-2 border-dark-2 reg-btn " // Added left (ms-3) and right (me-3) margin
                          component="label"
                        >
                          Upload Document Image
                          <input
                            type="file"
                            hidden
                            onChange={(e: any) =>
                              set_document_image(e.target.files[0])
                            }
                            accept=".pdf,.docx,image/*"
                          />
                        </Button>
                        {document_image && (
                          <SelectedFile
                            file={document_image}
                            set_file={set_document_image}
                          />
                        )}
                      </Grid>

                      <Grid item xs={12} md={5}>
                        <Button
                          variant="outlined"
                          className="w-100 ms-2 me-5  border-2 border-dark-2 reg-btn" // Added left (ms-3) and right (me-3) margin
                          component="label"
                        >
                          Upload Proof of Address
                          <input
                            type="file"
                            hidden
                            onChange={(e: any) =>
                              set_proof_of_address(e.target.files[0])
                            }
                            accept=".pdf,.docx,image/*"
                          />
                        </Button>
                        {proof_of_address && (
                          <SelectedFile
                            file={proof_of_address}
                            set_file={set_proof_of_address}
                          />
                        )}
                      </Grid>
                    </Grid>
                  </div>
                </React.Fragment>
              ) : null}
            </Grid>
            <div className="d-flex justify-content-center align-items-center mt-3">
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{ mt: 3, mb: 2 }}
                className=" bg-dark-2 btn rounded-pill m-1 reg-btn px-4 py-2 w-25 fw-bold mt-2 d-flex justify-content-center align"
              >
                {isLoading ? <span className="buttonLoader"></span> : null}
                {isLoading ? "Processing" : "Sign Up"}
              </Button>
            </div>
            <Grid container justifyContent="center" sx={{ mt: 1 }}>
              <Grid item>
                <Link
                  href="/auth/signin"
                  variant="body2"
                  style={{
                    textDecoration: "none",
                    color: "var(--color-dark-2)",
                  }}
                >
                  <span className="btn-hover-pwd">
                    {" "}
                    Already have an account? Sign in
                  </span>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
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
          {typeof isSubdomain !== 'undefined' && isSubdomain && subdomain ? (
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
