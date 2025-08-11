"use client";

import { authorizationObj, baseUrl, otpPattern } from "@/app/utils/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
// import { confirmAlert } from "react-confirm-alert";

const MoreInfo = ({
  setErrorMessage,
  setSuccessMessage,
  user,
  setUser,
  errorMessage,
  successMessage,
}: any) => {
  const currentUser = useSelector((state: any) => state?.user);

  const [is_loading, set_is_loading] = useState(false);
  const [personal_phone_number, set_personal_phone_number] = useState("");
  const [parents_phone_number, set_parents_phone_number] = useState("");
  const [parents_email, set_parents_email] = useState("");
  const [address, set_address] = useState("");
  const [dob, set_dob] = useState("");
  const [is_old, set_is_old] = useState(false);
  const [_student, set_student] = useState<any>(null);
  const [bio, set_bio] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("+91"); // Default to India
  const [parentCountryCode, setParentCountryCode] = useState("+91"); // Default to India for parent
  const [countryCodes, setCountryCodes] = useState<
    { code: string; name: string }[]
  >([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCountryIso, setSelectedCountryIso] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedStateIso, setSelectedStateIso] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [countryList, setCountryList] = useState<any[]>([]);
  const [statesList, setStatesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  React.useEffect(() => {
    if (errorMessage) toast.error(errorMessage);
  }, [errorMessage]);

  React.useEffect(() => {
    if (successMessage) toast.success(successMessage);
  }, [successMessage]);

  useEffect(() => {
    get_student_details();
  }, [currentUser, currentUser?.user_id]);

  useEffect(() => {
    const fetchCountryCodes = async () => {
      try {
        const resp = await fetch("https://restcountries.com/v3.1/all");
        const data = await resp.json();
        const codes = data
          .map((country: any) => {
            const code =
              country.idd?.root && country.idd?.suffixes?.length > 0
                ? country.idd.root + country.idd.suffixes[0]
                : null;
            return code ? { code, name: country.name.common } : null;
          })
          .filter(Boolean)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountryCodes(codes);
      } catch (err) {
        // Fallback to local JSON file
        try {
          const resp = await fetch("/restcountries-all.json"); // From public folder
          const data = await resp.json();
          const codes = data
            .map((country: any) => {
              const code =
                country.idd?.root && country.idd?.suffixes?.length > 0
                  ? country.idd.root + country.idd.suffixes[0]
                  : null;
              return code ? { code, name: country.name.common } : null;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
          setCountryCodes(codes);
        } catch (fallbackErr) {
          console.error(
            "Failed to load country codes from fallback JSON.",
            fallbackErr
          );
          // Optional: Set hardcoded minimal fallback
          setCountryCodes([
            { code: "+91", name: "India" },
            { code: "+1", name: "United States" },
          ]);
        }  
      }
    };

    fetchCountryCodes();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const response = await fetch(
          "https://api.countrystatecity.in/v1/countries",
          {
            headers: {
              "X-CSCAPI-KEY":
                process.env.NEXT_PUBLIC_COUNTRYSTATECITY_API_KEY || "",
            },
          }
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setCountryList(data);
        } else {
          setCountryList([]);
        }
      } catch (error) {
        setCountryList([]);
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (!selectedCountryIso) {
      setStatesList([]);
      return;
    }
    const fetchStates = async () => {
      setIsLoadingStates(true);
      try {
        const response = await fetch(
          `https://api.countrystatecity.in/v1/countries/${selectedCountryIso}/states`,
          {
            headers: {
              "X-CSCAPI-KEY":
                process.env.NEXT_PUBLIC_COUNTRYSTATECITY_API_KEY || "",
            },
          }
        );
        const data = await response.json();
        setStatesList(data);
      } catch (error) {
        setStatesList([]);
      } finally {
        setIsLoadingStates(false);
      }
    };
    fetchStates();
  }, [selectedCountryIso]);

  useEffect(() => {
    if (!selectedCountryIso || !selectedStateIso) {
      setCitiesList([]);
      return;
    }
    const fetchCities = async () => {
      setIsLoadingCities(true);
      try {
        const response = await fetch(
          `https://api.countrystatecity.in/v1/countries/${selectedCountryIso}/states/${selectedStateIso}/cities`,
          {
            headers: {
              "X-CSCAPI-KEY":
                process.env.NEXT_PUBLIC_COUNTRYSTATECITY_API_KEY || "",
            },
          }
        );
        const data = await response.json();
        setCitiesList(data);
      } catch (error) {
        setCitiesList([]);
      } finally {
        setIsLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedCountryIso, selectedStateIso]);

  useEffect(() => {
    if (_student && countryList.length > 0) {
      let countryIso = _student.country_iso;
      let countryName = _student.country;
      if (!countryIso && countryName) {
        const found = countryList.find((c) => c.name === countryName);
        if (found) countryIso = found.iso2;
      }
      if (!countryName && countryIso) {
        const found = countryList.find((c) => c.iso2 === countryIso);
        if (found) countryName = found.name;
      }
      setSelectedCountryIso(countryIso || "");
      setSelectedCountry(countryName || "");
    }
  }, [countryList, _student]);

  useEffect(() => {
    if (_student && statesList.length > 0) {
      let stateIso = _student.state_iso;
      let stateName = _student.state;
      if (!stateIso && stateName) {
        const found = statesList.find((s) => s.name === stateName);
        if (found) stateIso = found.iso2;
      }
      if (!stateName && stateIso) {
        const found = statesList.find((s) => s.iso2 === stateIso);
        if (found) stateName = found.name;
      }
      setSelectedStateIso(stateIso || "");
      setSelectedState(stateName || "");
    }
  }, [statesList, _student]);

  useEffect(() => {
    if (_student && citiesList.length > 0 && _student.city) {
      const found = citiesList.find((c) => c.name === _student.city);
      if (found) setSelectedCity(found.name);
    }
  }, [citiesList, _student]);

  const get_student_details = async () => {
    if (!currentUser?.user_id) return;
    try {
      const resp = await axios.get(
        `${baseUrl}/students/${currentUser?.student_id}`,
        authorizationObj
      );
      // console.log(resp);

      if (resp?.data?.data) {
        const student = resp?.data?.data;
        if (student) {
          set_student(student);
          set_personal_phone_number(student?.student_mobile_number);
          set_parents_phone_number(student?.student_parent_mobile);
          set_parents_email(student?.student_parent_email);
          set_address(student?.address);
          set_dob(student?.date_of_birth);
          set_bio(student?.bio);
          set_is_old(true);
          setCountryCode(student?.student_country_code || "+91");
          setParentCountryCode(student?.parent_country_code || "+91");
          // Set country name and ISO
          let countryIso = student?.country_iso;
          let countryName = student?.country;
          if (!countryIso && countryName && countryList.length > 0) {
            const found = countryList.find((c) => c.name === countryName);
            if (found) countryIso = found.iso2;
          }
          if (!countryName && countryIso && countryList.length > 0) {
            const found = countryList.find((c) => c.iso2 === countryIso);
            if (found) countryName = found.name;
          }
          setSelectedCountryIso(countryIso || "");
          setSelectedCountry(countryName || "");
          // Set state name and ISO
          let stateIso = student?.state_iso;
          let stateName = student?.state;
          if (!stateIso && stateName && statesList.length > 0) {
            const found = statesList.find((s) => s.name === stateName);
            if (found) stateIso = found.iso2;
          }
          if (!stateName && stateIso && statesList.length > 0) {
            const found = statesList.find((s) => s.iso2 === stateIso);
            if (found) stateName = found.name;
          }
          setSelectedStateIso(stateIso || "");
          setSelectedState(stateName || "");
          setSelectedCity(student?.city || "");
          setPincode(student?.zip || "");
        }
      }
    } catch (error) {
      // console.error(error)
    }
  };

  const handleSubmit = async () => {
    if (!personal_phone_number || personal_phone_number?.trim() === "") {
      setErrorMessage("Personal phone number is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (!parents_phone_number || parents_phone_number?.trim() === "") {
      setErrorMessage("Parents phone number is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (!parents_email || parents_email?.trim() === "") {
      setErrorMessage("Personal email is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (!address || address?.trim() === "") {
      setErrorMessage("Address is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (!dob || dob?.trim() === "") {
      setErrorMessage("Date of birth is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    const formData = new FormData();

    const fullPersonalPhone =
      countryCode + personal_phone_number.replace(/^[+]?\d{1,4}/, "");
    const fullParentPhone =
      parentCountryCode + parents_phone_number.replace(/^[+]?\d{1,4}/, "");

    if (is_old && _student?.student_id) {
      formData.append("student_id", _student.student_id);
    }
    formData.append("user_id", currentUser?.user_id || "");
    formData.append("date_of_birth", dob || "");
    if (bio) formData.append("bio", bio);
    formData.append("student_mobile_number", fullPersonalPhone);
    formData.append("student_country_code", countryCode);
    formData.append("student_parent_mobile", fullParentPhone);
    formData.append("parent_country_code", parentCountryCode);
    formData.append("student_parent_email", parents_email || "");
    formData.append("address", address || "");
    formData.append("country", selectedCountry || "");
    formData.append("state", selectedState || "");
    formData.append("city", selectedCity || "");
    formData.append("zip", pincode || "");
    if (currentUser?.email) formData.append("email", currentUser.email);
    if (currentUser?.first_name)
      formData.append("first_name", currentUser.first_name);
    if (currentUser?.last_name)
      formData.append("last_name", currentUser.last_name);
    if (currentUser?.user_status)
      formData.append("user_status", currentUser.user_status);

    try {
      set_is_loading(true);
      const resp = await axios.post(
        `${baseUrl}/students/create`,
        formData,
        authorizationObj
      );
      set_is_loading(false);

      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        setErrorMessage(resp?.data?.message);
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        return;
      }

      get_student_details();
      setSuccessMessage("Information updated successfully");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      // console.error(error)
      set_is_loading(false);
      setErrorMessage("Something went wrong please try later");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };

  const handleUpdate = async () => {
    if (!personal_phone_number || personal_phone_number?.trim() === "") {
      setErrorMessage("Personal phone number is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (!parents_phone_number || parents_phone_number?.trim() === "") {
      setErrorMessage("Parents phone number is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (!parents_email || parents_email?.trim() === "") {
      setErrorMessage("Personal email is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (!address || address?.trim() === "") {
      setErrorMessage("Address is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }
    if (!dob || dob?.trim() === "") {
      setErrorMessage("Date of birth is required");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    const formData = new FormData();

    const fullPersonalPhone = personal_phone_number;
    const fullParentPhone = parents_phone_number;

    if (is_old && _student?.student_id) {
      formData.append("student_id", _student.student_id);
    }
    formData.append("user_id", currentUser?.user_id || "");
    formData.append("date_of_birth", dob || "");
    if (bio) formData.append("bio", bio);
    formData.append("student_mobile_number", fullPersonalPhone);
    formData.append("student_country_code", countryCode);
    formData.append("student_parent_mobile", fullParentPhone);
    formData.append("parent_country_code", parentCountryCode);
    formData.append("student_parent_email", parents_email || "");
    formData.append("address", address || "");
    formData.append("country", selectedCountry || "");
    formData.append("state", selectedState || "");
    formData.append("city", selectedCity || "");
    formData.append("zip", pincode || "");
    if (currentUser?.email) formData.append("email", currentUser.email);
    if (currentUser?.first_name)
      formData.append("first_name", currentUser.first_name);
    if (currentUser?.last_name)
      formData.append("last_name", currentUser.last_name);
    if (currentUser?.user_status)
      formData.append("user_status", currentUser.user_status);

    const phonePattern = /^\d{6,14}$/; // Only digits, 6 to 14 digits long

    if (!phonePattern.test(fullPersonalPhone)) {
      setErrorMessage(
        "Personal phone number must be 6 to 14 digits (without country code)"
      );
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    if (!phonePattern.test(fullParentPhone)) {
      setErrorMessage(
        "Parent's phone number must be 6 to 14 digits (without country code)"
      );
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return;
    }

    try {
      set_is_loading(true);
      const resp = await axios.post(
        `${baseUrl}/students/update/${_student?.student_id}`,
        formData,
        authorizationObj
      );
      set_is_loading(false);

      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        setErrorMessage(resp?.data?.message);
        setTimeout(() => {
          setErrorMessage(null);
        }, 3000);
        return;
      }
      // console.log("update:", resp);

      get_student_details();
      setSuccessMessage("Information updated successfully");
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      // console.error(error)
      set_is_loading(false);
      setErrorMessage("Something went wrong please try later");
      setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
    }
  };

  return (
    <div className="container mt-5 p-4 shadow rounded bg-white">
      <div className="row g-4">
        <div className="col-12">
          <label className="form-label fw-bold">About me *</label>
          <textarea
            className="form-control"
            placeholder="Tell us something about yourself"
            value={bio || ""}
            onChange={(e) => set_bio(e.target.value)}
            rows={3}
          /> 
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold">Personal Phone Number *</label>
          <div className="input-group">
            <select
              className="form-select dropdown-menu-end"
              style={{
                width: "120px",
                minWidth: "70px",
                maxWidth: "140px",
                padding: "2px 8px",
              }}
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              data-bs-display="static"
            >
              {countryCodes.map((c) => (
                <option key={`${c.code}-${c.name}`} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            <input
              type="tel"
              className="form-control"
              placeholder="e.g. XXXXXXXXXX"
              value={personal_phone_number || ""}
              onChange={(e) => set_personal_phone_number(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold">Parent's Phone Number *</label>
          <div className="input-group">
       
            <select
              className="form-select dropdown-menu-end"
              style={{
                width: "120px",
                minWidth: "70px",
                maxWidth: "140px",
                padding: "2px 8px",
              }}
              value={parentCountryCode}
              onChange={(e) => setParentCountryCode(e.target.value)}
              data-bs-display="static"
            >
              {countryCodes.map((c) => (
                <option key={`${c.code}-${c.name}`} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>

            <input
              type="tel"
              className="form-control"
              placeholder="e.g. XXXXXXXXXX"
              value={parents_phone_number || ""}
              onChange={(e) => set_parents_phone_number(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold">Parent's Email *</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter parent's email"
            value={parents_email || ""}
            onChange={(e) => set_parents_email(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label fw-bold">Date of Birth *</label>
          <input
            type="date"
            className="form-control"
            value={dob ? moment(dob).format("YYYY-MM-DD") : ""}
            onChange={(e) => set_dob(moment(e.target.value).format())}
            max={moment().format("YYYY-MM-DD")}
          />
        </div>

        <div className="col-md-6 col-lg-12">
          <div className="row g-2">
            <div className="col-6">
              <label className="form-label fw-bold">Country *</label>
              <select
                className="form-select"
                value={selectedCountryIso}
                onChange={(e) => {
                  const iso = e.target.value;
                  setSelectedCountryIso(iso);
                  const countryObj = countryList.find(
                    (c: any) => c.iso2 === iso
                  );
                  setSelectedCountry(countryObj ? countryObj.name : "");
                  setSelectedState("");
                  setSelectedStateIso("");
                  setSelectedCity("");
                }}
                disabled={isLoadingCountries}
              >
                <option value="">Select Country</option>
                {Array.isArray(countryList) &&
                  countryList.map((c: any) => (
                    <option key={c.iso2} value={c.iso2}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label fw-bold">State *</label>
              <select
                className="form-select"
                value={selectedStateIso}
                onChange={(e) => {
                  const iso = e.target.value;
                  setSelectedStateIso(iso);
                  const stateObj = statesList.find((s: any) => s.iso2 === iso);
                  setSelectedState(stateObj ? stateObj.name : "");
                  setSelectedCity("");
                }}
                disabled={!selectedCountryIso || isLoadingStates}
              >
                <option value="">Select State</option>
                {statesList.map((s: any) => (
                  <option key={s.iso2} value={s.iso2}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label fw-bold">City *</label>
              <select
                className="form-select"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={!selectedStateIso || isLoadingCities}
              >
                <option value="">Select City</option>
                {citiesList.map((city: any) => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-6">
              <label className="form-label fw-bold">Pincode *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
            </div>
          </div>
          <label className="form-label fw-bold mt-2">Address *</label>
          <textarea
            className="form-control"
            placeholder="Enter your full address"
            value={address || ""}
            onChange={(e) => set_address(e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="row justify-content-center mt-4">
        <div className="col-md-4">
          <button
            className="btn btn-view w-75 py-2 rounded-pill text-white"
            disabled={is_loading}
            onClick={is_old ? handleUpdate : handleSubmit}
          >
            {is_loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Processing...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoreInfo;
