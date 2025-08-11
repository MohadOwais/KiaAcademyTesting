"use client";
import "../../../(auth)/auth/signup/Main.css"; // Import the CSS file for styling
import * as React from "react";
import { useState } from "react";
// import CssBaseline from '@mui/material/CssBaseline';
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
// import Grid from '@mui/material/Grid';
// import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
// import Container from '@mui/material/Container';
import {
  emailPattern,
  passwordPattern,
  baseUrl,
  authorizationObj,
  webUrl,
} from "../../../utils/core";
import axios from "axios";
import { useRouter } from "next/navigation";
import { CompanyAvatar, Copyright } from "../../../(auth)/auth/signin/Main";
import {
  Button,
  FormControl,
  Autocomplete,
  CircularProgress,
} from "@mui/material"; // formcontrol, select, autocomplete, and CircularProgress are imported from @mui/material
import AlertMUI from "@/app/components/mui/AlertMUI";
import PasswordMUI from "@/app/components/mui/PasswordMUI";
import { UploadOutlined } from "@ant-design/icons";
import { Button as AntdButton, Upload } from "antd";
import { isSubdomain, subdomain } from "../../../utils/domain"; // adjust path if needed


export default function SignUp() {
  const router = useRouter();

  const [password, setPassword] = React.useState<string>("");
  const [repeatPassword, setRepeatPassword] = React.useState<string>("");
  const [clientErrorMessage, setClientErrorMessage] = React.useState<
    string | null
  >(null);
  const [clientSuccessMessage, setClientSuccessMessage] = React.useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [imageBase64, setImageBase64] = React.useState<any>(null);
  const [file, setFile] = React.useState<any>(null);
  const [fileListReg, setFileListReg] = React.useState<any>(); // file list for registration document
  const [fileListLogo, setFileListLogo] = React.useState<any>(null); // file list for logo
  const [selectedCountryCode, setSelectedCountryCode] =
    React.useState<string>("+1");
  const [fileListTin, setFileListTin] = React.useState<any>(null); // Added state for FileListTin
  const [subdomain, setSubdomain] = React.useState<string>(""); // subdomain state
  const [phone, setPhone] = React.useState<string>(""); // phone number state

  const [instituteName, setInstituteName] = React.useState<string>(""); // institute name state
  const [tinNumber, setTinNumber] = React.useState<string>(""); // tin number state
  const [country, setCountry] = React.useState<string>(""); // country state
  const [state, setState] = React.useState<string>(""); // state state
  const [selectedCountry, setSelectedCountry] = React.useState<string>(""); // selected country state
  const [city, setCity] = React.useState<string>(""); // city state
  const [selectedState, setSelectedState] = React.useState<string>(""); // selected state
  const [selectedCity, setSelectedCity] = React.useState<string>(""); // selected city
  const [pinCode, setPinCode] = React.useState<string>(""); // pin code state
  const [address, setAddress] = React.useState<string>(""); // address state
  const [regNumber, setRegNumber] = React.useState<string>(""); // registration number state

  const [countryCodesList, setCountryCodesList] = React.useState<
    { code: string; flag: string; name: string; iso2?: string }[]
  >([]);
  const [isLoadingCountries, setIsLoadingCountries] = React.useState(true);
  const [isLoadingStates, setIsLoadingStates] = React.useState<boolean>(false);
  const [statesList, setStatesList] = React.useState<{ name: string }[]>([]);
  const [citiesList, setCitiesList] = React.useState<{ name: string }[]>([]);
  const [isLoadingCities, setIsLoadingCities] = React.useState<boolean>(false);
  const [email, setEmail] = React.useState<string>(""); // email state

  const [countryList, setCountryList] = React.useState<any[]>([]);
  const [selectedCountryIso, setSelectedCountryIso] =
    React.useState<string>("");
  const [selectedStateIso, setSelectedStateIso] = React.useState<string>("");
  const [selectedInstituteType, setSelectedInstituteType] =
    useState("university");

  const headers = {
    "X-CSCAPI-KEY": process.env.NEXT_PUBLIC_COUNTRYSTATECITY_API_KEY || "",
  };

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

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://api.countrystatecity.in/v1/countries",
          {
            headers,
          }
        );
        const data = await response.json();
        setCountryList(data);
        setIsLoadingCountries(false);
      } catch (error) {
        console.error("Error fetching countries:", error);
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  React.useEffect(() => {
    const fetchStates = async () => {
      if (!selectedCountryIso) {
        setStatesList([]);
        return;
      }
      setIsLoadingStates(true);
      try {
        const response = await fetch(
          `https://api.countrystatecity.in/v1/countries/${selectedCountryIso}/states`,
          { headers }
        );
        const data = await response.json();
        setStatesList(data);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setIsLoadingStates(false);
      }
    };
    fetchStates();
  }, [selectedCountryIso]);

  React.useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountryIso || !selectedStateIso) {
        setCitiesList([]);
        return;
      }
      setIsLoadingCities(true);
      try {
        const response = await fetch(
          `https://api.countrystatecity.in/v1/countries/${selectedCountryIso}/states/${selectedStateIso}/cities`,
          { headers }
        );
        const data = await response.json();
        setCitiesList(data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedCountryIso, selectedStateIso]);

  const handleCountryChange = (_: any, newValue: any) => {
    if (newValue) {
      setSelectedCountry(newValue.name);
      setSelectedCountryIso(newValue.iso2);
      setCountry(newValue.name);
    } else {
      setSelectedCountry("");
      setSelectedCountryIso("");
      setCountry("");
    }
    // Reset state and city when country changes
    setSelectedState("");
    setSelectedStateIso("");
    setState("");
    setSelectedCity("");
    setCity("");
  };

  const handleStateChange = (_: any, newValue: any) => {
    if (newValue) {
      setSelectedState(newValue.name);
      setSelectedStateIso(newValue.iso2);
      setState(newValue.name);
    } else {
      setSelectedState("");
      setSelectedStateIso("");
      setState("");
    }
    // Reset city when state changes
    setSelectedCity("");
    setCity("");
  };

  const handleCityChange = (_: any, newValue: any) => {
    if (newValue) {
      setSelectedCity(newValue.name);
      setCity(newValue.name);
    } else {
      setSelectedCity("");
      setCity("");
    }
  };

  const instituteOptions = [
    // Options for institute type
    { label: "University", value: "university" },
    { label: "College", value: "college" },
    { label: "Institute", value: "institute" },
    { label: "Company", value: "company" },
    { label: "Other", value: "other" },
  ];

  const handleSubmit = async (event: any) => {
    event?.preventDefault();
    const data = new FormData(event?.currentTarget);

    if (!instituteName) {
      setClientErrorMessage("Institute name is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!phone) {
      setClientErrorMessage("Contact number is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!email) {
      setClientErrorMessage("Email is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }
    if (!selectedInstituteType) {
      setClientErrorMessage("Institute type is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!emailPattern.test(email)) {
      setClientErrorMessage("Email is invalid");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }
    if (!country) {
      setClientErrorMessage("Country is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }
    if (!state) {
      setClientErrorMessage("State is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }
    if (!city) {
      setClientErrorMessage("City is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }
    if (!pinCode) {
      setClientErrorMessage("Pin code is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!regNumber) {
      setClientErrorMessage("Registration number is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!tinNumber) {
      setClientErrorMessage("TIN number is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!subdomain) {
      setClientErrorMessage("Subdomain name is required");
      setTimeout(() => {
        setClientErrorMessage(null);
      }, 2000);
      return;
    }

    if (!address) {
      setClientErrorMessage("Address is required");
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

    if (file) {
      const url: any = URL.createObjectURL(file);
      setImageBase64(url);
      setIsLoading(true);
    }
    if (fileListTin?.length && fileListTin[0]?.originFileObj) {
      const url: any = URL.createObjectURL(fileListTin[0]?.originFileObj);
      setImageBase64(url);
      setIsLoading(true);
    }

    const formData = new FormData();
    formData.append("name", instituteName);
    if (address) formData.append("address", address); // optional
    formData.append("contact_number", phone);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role_id", "4");
    formData.append("country_code", selectedCountryCode);
    formData.append("address", address);
    formData.append("country", country);
    formData.append("state", state);
    formData.append("city", city);
    formData.append("pin_code", pinCode);
    formData.append("institute_type", selectedInstituteType);
    if (regNumber) formData.append("registration_number", regNumber); // optional
    if (tinNumber) formData.append("tin_number", tinNumber); // optional

    formData.append("subdomain_name", subdomain?.toString()?.toLowerCase());
    if (fileListLogo?.length && fileListLogo[0]?.originFileObj)
      formData.append("logo", fileListLogo[0]?.originFileObj); // optional
    if (fileListReg?.length && fileListReg[0]?.originFileObj)
      formData.append("supporting_document", fileListReg[0]?.originFileObj); // optional
    if (fileListTin?.length && fileListTin[0]?.originFileObj)
      formData.append("tax_document", fileListTin[0]?.originFileObj); // optional
    if (file) formData.append("profile_picture", file); // optional

    try {
      setIsLoading(true);
      const resp = await axios.post(
        `${baseUrl}/institutions/create`,
        formData,
        authorizationObj
      );
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
        "Your KYC verification is in progress, keep connected for further updates"
      );
      setTimeout(() => {
        setClientSuccessMessage(null);
        setClientErrorMessage(null);
        router.push("/auth/signin");
      }, 4000);
    } catch (error) {
      setIsLoading(false);
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

      <div className="container py-4">
        <div className="row d-flex justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="text-center mb-4">
              <CompanyAvatar />
              <h3 className="mt-3 mb-4 heading-style">Organisation</h3>
            </div>

            <form
              onSubmit={handleSubmit}
              className="needs-validation"
              noValidate
            >
              <div className="row g-3">
                {/* Institute changes */}

                <div className="col-12 col-md-6">
                  <FormControl fullWidth size="small">
                    <Autocomplete
                      options={instituteOptions}
                      getOptionLabel={(option) => option.label}
                      value={
                        instituteOptions.find(
                          (opt) => opt.value === selectedInstituteType
                        ) || null
                      }
                      onChange={(_, newValue) => {
                        setSelectedInstituteType(newValue?.value || "");
                        // Set the name field to the selected label if not already set or always update
                        if (newValue?.label) setInstituteName(newValue.label);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Organization"
                          placeholder={
                            selectedInstituteType
                              ? instituteOptions.find(
                                  (opt) => opt.value === selectedInstituteType
                                )?.label
                              : "Select organization"
                          }
                          variant="outlined"
                          required
                          InputLabelProps={{ shrink: true }}
                        />
                      )}
                    />
                  </FormControl>
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    required
                    fullWidth
                    label="Organisation"
                    name="instituteName"
                    placeholder={instituteName}
                    autoComplete="select"
                    onChange={(e) => setInstituteName(e.target.value)}
                    className="form-control"
                  />
                </div>

                {/* Country Code and Phone */}

                <div className="col-12 col-md-6">
                  <FormControl fullWidth size="small">
                    <Autocomplete
                      options={countryCodesList}
                      getOptionLabel={(option) =>
                        `${option.code} ${option.name}`
                      }
                      loading={isLoadingCountries}
                      onChange={(_, newValue) =>
                        setSelectedCountryCode(newValue ? newValue.code : "+1")
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params} // pass the params to the text field
                          label="Country Code"
                          variant="outlined"
                          required
                          className="form-control"
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
                        />
                      )}
                    />
                  </FormControl>
                </div>
                <div className="  col-12 col-md-6">
                  <TextField
                    required
                    fullWidth
                    type="number"
                    id="phone-number"
                    label="Contact Number"
                    name="phone-number"
                    autoComplete="phone-number"
                    onChange={(e) => setPhone(e.target.value)}
                    value={phone}
                    className="form-control"
                  />
                </div>

                {/* Email and Subdomain */}
                <div className="col-12 col-md-6">
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="form-control"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    required
                    fullWidth
                    id="subdomain"
                    label="Sub domain"
                    name="subdomain"
                    autoComplete="subdomain"
                    onChange={(e) => setSubdomain(e.target.value)}
                    helperText={`This will be used to create your URL: https://${subdomain}.kiacademy.com`}
                    className="form-control"
                  />
                </div>

                {/* Password Fields */}
                <div className="col-12 col-md-6">
                  <PasswordMUI
                    name="password"
                    label="Password * "
                    onChange={(value: any) => setPassword(value)}
                    className="form-control"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <PasswordMUI
                    name="repeatPassword"
                    label="Confirm Password * "
                    onChange={(value: any) => setRepeatPassword(value)}
                    className="form-control"
                  />
                </div>
                <div className="col-12">
                  <TextField
                    required
                    fullWidth
                    id="address"
                    label="Address"
                    name="address"
                    autoComplete="address"
                    multiline
                    rows={4}
                    onChange={(e) => setAddress(e.target.value)}
                    variant="outlined"
                    className="mb-3"
                  />
                </div>

                {/* Registration and Tax Number */}
                <div className="col-12 col-md-6">
                  <TextField
                    required
                    fullWidth
                    id="reg-number"
                    label="Registration Number"
                    name="reg-number"
                    autoComplete="reg-number"
                    onChange={(e) => setRegNumber(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="col-12 col-md-6">
                  <TextField
                    required
                    fullWidth
                    id="tin-number"
                    label="Tax Number"
                    name="tin-number"
                    autoComplete="tin-number"
                    onChange={(e) => setTinNumber(e.target.value)}
                    className="form-control"
                  />
                </div>

                {/* Country */}
                <div className="col-12 col-md-6">
                  <FormControl fullWidth size="small">
                    <Autocomplete
                      options={countryList}
                      getOptionLabel={(option) => option.name}
                      loading={isLoadingCountries}
                      value={
                        countryList.find(
                          (country) => country.name === selectedCountry
                        ) || null
                      }
                      onChange={handleCountryChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Country"
                          variant="outlined"
                          required
                          className="form-control"
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
                        />
                      )}
                    />
                  </FormControl>
                </div>

                {/* State */}
                <div className="col-12 col-md-6">
                  <FormControl fullWidth size="small">
                    <Autocomplete
                      options={statesList}
                      getOptionLabel={(option) => option.name}
                      loading={isLoadingStates}
                      value={
                        statesList.find(
                          (state) => state.name === selectedState
                        ) || null
                      }
                      onChange={handleStateChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="State"
                          variant="outlined"
                          required
                          className="form-control"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingStates ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </div>

                {/* City */}
                <div className="col-12 col-md-6">
                  <FormControl fullWidth size="small">
                    <Autocomplete
                      options={citiesList}
                      getOptionLabel={(option) => option.name}
                      loading={isLoadingCities}
                      value={
                        citiesList.find((city) => city.name === selectedCity) ||
                        null
                      }
                      onChange={handleCityChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="City"
                          variant="outlined"
                          required
                          className="form-control"
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {isLoadingCities ? (
                                  <CircularProgress color="inherit" size={20} />
                                ) : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }}
                        />
                      )}
                    />
                  </FormControl>
                </div>

                {/* Pin Code */}
                <div className="col-12 col-md-6">
                  <TextField
                    required
                    fullWidth
                    id="pin code"
                    label="Pin code"
                    name="pincode"
                    autoComplete="pin code"
                    onChange={(e) => setPinCode(e.target.value)}
                    className="form-control"
                  />
                </div>

                {/* Document Uploads */}
                <div className="col-12">
                  <div className="d-flex flex-column align-items-center gap-3">
                    <div className="container">
                      <div className="row justify-content-center text-center g-3">
                        <div className="col-12 col-sm-6 col-md-4">
                          <Upload
                            className="w-100"
                            onChange={(e: any) =>
                              setFileListLogo(e.fileList?.slice(-1))
                            }
                            fileList={
                              fileListLogo ? fileListLogo.slice(-1) : []
                            }
                            accept="image/*"
                            multiple={false}
                            beforeUpload={() => true}
                            showUploadList={false} // Optional: hide file name for cleaner look
                          >
                            <AntdButton
                              className="w-100 py-3"
                              icon={<UploadOutlined />}
                              style={{
                                borderRadius: "8px",
                                fontWeight: 500,
                                fontSize: "16px",
                              }}
                            >
                              Upload Logo
                            </AntdButton>
                          </Upload>
                        </div>

                        <div className="col-12 col-sm-6 col-md-4">
                          <Upload
                            className="w-100 "
                            onChange={(e: any) =>
                              setFileListReg(e.fileList?.slice(-1))
                            }
                            fileList={fileListReg ? fileListReg.slice(-1) : []}
                            accept=".pdf,.docx,image/*"
                            multiple={false}
                            beforeUpload={() => true}
                          >
                            <AntdButton
                              className="w-100 py-3"
                              style={{
                                borderRadius: "8px",
                                fontWeight: 500,
                                fontSize: "16px",
                              }}
                            >
                              <UploadOutlined />
                              Registration Document
                            </AntdButton>
                          </Upload>
                        </div>

                        <div className="col-12 col-sm-6 col-md-4">
                          <Upload
                            className="w-100"
                            onChange={(e: any) =>
                              setFileListTin(e.fileList?.slice(-1))
                            }
                            fileList={fileListTin ? fileListTin.slice(-1) : []}
                            accept=".pdf,.docx,image/*"
                            multiple={false}
                            beforeUpload={() => true}
                          >
                            <AntdButton
                              className="w-100 py-3"
                              style={{
                                borderRadius: "8px",
                                fontWeight: 500,
                                fontSize: "16px",
                              }}
                            >
                              <UploadOutlined /> Tax Document
                            </AntdButton>
                          </Upload>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted small m-0 text-center">
                      Supported document type PDF, DOCX or Image only
                    </p>
                  </div>
                </div>

                <div className="col-12 text-center mt-4">
                  {/* <div className="d-grid mx-auto my-3" style={{ width: '100%', maxWidth: '250px' }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isLoading}
                                            sx={{
                                                width: '100%',
                                                height: '48px',
                                                fontSize: '16px',
                                                padding: '0 20px',
                                                borderRadius: '24px',
                                            }}
                                        >
                                            {isLoading ? <span className="buttonLoader"></span> : null}
                                            {isLoading ? "Processing" : "Register"}
                                        </Button>
                                    </div> */}
                  <div className="d-flex justify-content-center align-items-center  mx-auto flex-column w-75 ">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      // sx={{ mt: 3, mb: 2 }}
                      className="btn btn-view text-white rounded-pill submit-btn mt-3 px-2 py-2 w-50 mb-2 btn-Active"
                    >
                      {isLoading ? (
                        <span className="buttonLoader"></span>
                      ) : null}
                      {isLoading ? "Processing" : "Register"}
                    </Button>
                  </div>
                </div>

                <div className="col-12 text-center mt-3">
                  <Link href="/auth/signin" className="text-decoration-none">
                    Already have an account? Sign in
                  </Link>
                </div>
              </div>
            </form>
          </div>
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
              marginTop: "5%",
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
      </div>
    </>
  );
}
