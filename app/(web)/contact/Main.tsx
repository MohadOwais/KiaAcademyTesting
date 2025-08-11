"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { authorizationObj, baseUrl, emailPattern } from "@/app/utils/core";
import AlertMUI from "@/app/components/mui/AlertMUI";
import { useSelector } from "react-redux";
import { BsTelephone, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Accordion } from "react-bootstrap";
import $ from "jquery";
// import 'select2/dist/css/select2.min.css';
// import 'select2';

// Add custom styles for Select2
// const select2Styles = `
//   .select2-container .select2-selection--single {
//     height: 42px !important;
//     min-height: 42px !important;
//   }
//   .select2-container--default .select2-selection--single .select2-selection__rendered {
//     line-height: 42px !important;
//   }
//   .select2-container--default .select2-selection--single .select2-selection__arrow {
//     height: 40px !important;
//   }
// `;

const GOOGLE_MAPS_API_KEY = "AIzaSyAryRO9Ng3KZ2XMJx8y-Ue_3ew5oZZ_cNo";

const officeLocations = [
  {
    title: "USA Head Office",
    address: "5900 Balcones Drive STE 13688 Austin, TX 78731 USA",
    lat: 30.2667,
    lng: -97.7333,
  },
  {
    title: "Australia Office",
    address: "Woodville Park SA 5011, Australia",
    lat: -34.887,
    lng: 138.5465,
  },
  {
    title: "Saudi Arabia Office",
    address: "2149 Talhat Ibn Malik, Al Malaz, Riyadh, KSA",
    lat: 24.6867,
    lng: 46.74,
  },
  {
    title: "Hyderabad Office",
    address: "16-2-747/40 Mumtaz Colony, Hyderabad, Telangana, India",
    lat: 17.3871,
    lng: 78.4917,
  },
  {
    title: "New Zealand Office",
    address: "93 Ferndale Road, Mount Wellington, Auckland, NZ",
    lat: -36.9048,
    lng: 174.8351,
  },
  {
    title: "Canada Office",
    address: "480 Dymott Ave, Milton, ON L9T 7V2 Canada",
    lat: 43.5266,
    lng: -79.8912,
  },
  {
    title: "Karachi Office",
    address: "EUS2 KDA Overseas Block 16 A Gulshan-EJohar, Karachi, Pakistan",
    lat: 24.9135,
    lng: 67.1156,
  },
];

const ContactPage = () => {
  const currentUser = useSelector((state: any) => state?.user);
  const [c_name, set_c_name] = useState("");
  const [email, set_email] = useState("");
  const [message, set_message] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+93");
  const [is_loading, set_is_loading] = useState(false);
  const [error_message, set_error_message] = useState<string | null>(null);
  const [success_message, set_success_message] = useState<string | null>(null);
  const [countryCodesList, setCountryCodesList] = useState<
    { code: string; flag?: string; name: string; iso2?: string }[]
  >([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const selectRef = useRef<HTMLSelectElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [who_am_i, set_who_am_i] = useState("");

  useEffect(() => {
    const fetchCountryCodes = async () => {
      let userCountryCode = "+1"; // Default to USA
      try {
        // Try to get user country code from IP
        const geoResp = await fetch("https://ipapi.co/json/");
        const geoData = await geoResp.json();
        if (geoData && geoData.country_code) {
          userCountryCode = geoData.country_code;
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
                  name: country.name.common,
                  iso2: country.cca2, // ISO alpha-2 code
                }
              : null;
          })
          .filter(Boolean)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setCountryCodesList(codes);
        // Set default country code based on user location
        const found = codes.find((c: any) => c.iso2 === userCountryCode);
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
                    name: country.name.common,
                    iso2: country.cca2,
                  }
                : null;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
          setCountryCodesList(codes);
          // Set default country code based on user location
          const found = codes.find((c: any) => c.iso2 === userCountryCode);
          setSelectedCountryCode(found ? found.code : "+1");
        } catch (fallbackErr) {
          console.error("Failed to load fallback JSON:", fallbackErr);
          setCountryCodesList([
            { code: "+91", name: "India", iso2: "IN" },
            { code: "+1", name: "United States", iso2: "US" },
          ]);
          setSelectedCountryCode("+1");
        } finally {
          setIsLoadingCountries(false);
        }
      }
    };

    fetchCountryCodes();
  }, []);

  useEffect(() => {
    set_c_name(
      `${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`
    );
    set_email(currentUser?.email || "");
  }, [currentUser]);

  useEffect(() => {
    if (selectRef.current && countryCodesList.length > 0) {
    }
  }, [countryCodesList]);

  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google && window.google.maps) {
      setIsScriptLoaded(true);
    }
  }, []);

  const formatCountry = (country: any) => {
    if (!country.id) return country.text;
    const countryData = countryCodesList.find((c) => c.code === country.id);
    if (!countryData) return country.text;
    return $(`<span>${countryData.flag} ${countryData.code}</span>`);
  };

  const handleSubmit = async () => {
    if (!c_name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    if (!emailPattern.test(email.toLowerCase()))
      return setError("Invalid email format");
    if (!phone.trim()) return setError("Phone number is required");
    if (!message.trim()) return setError("Message is required");
    if (!who_am_i.trim()) return setError("Who are you is required");

    try {
      set_is_loading(true);
      // const fullPhoneNumber = `${selectedCountryCode}${phone}`;
      console.log({
        c_name,
        email,
        message,
        country_code: selectedCountryCode,
        phone,
        who_am_i,
      });
      const resp = await axios.post(
        `${baseUrl}/contact_us/create`,
        {
          c_name,
          email,
          message,
          selectedCountryCode,
          contact: phone,
          who_am_i,
        },
        authorizationObj
      );
      set_is_loading(false);
      if (resp?.data?.status < 199 || resp?.data?.status > 299) {
        set_error_message(resp?.data?.message);
        return resetError();
      }
      set_c_name("");
      set_email("");
      set_message("");
      setPhone("");
      set_success_message("Message sent successfully");
      resetSuccess();
    } catch {
      set_is_loading(false);
      set_error_message("Something went wrong, please try later");
      resetError();
    }
  };

  const setError = (msg: string) => {
    set_error_message(msg);
    setTimeout(() => set_error_message(null), 3000);
  };

  const resetError = () => {
    setTimeout(() => set_error_message(null), 3000);
  };

  const resetSuccess = () => {
    setTimeout(() => set_success_message(null), 3000);
  };

  return (
    <>
      {error_message && <AlertMUI status="error" text={error_message} />}
      {success_message && <AlertMUI status="success" text={success_message} />}

      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-dark mb-3">Contact Us</h1>
          <p
            className="lead text-secondary mx-auto"
            style={{ maxWidth: "700px" }}
          >
            Have questions or need assistance? We'd love to hear from you!
          </p>
        </div>

        <div className="row justify-content-center g-4">
          {/* Left - Contact Form */}
          <div className="col-lg-6">
            <div className="shadow rounded p-4 bg-white border">
              <h4 className="mb-4 fw-bold">Send us a Message</h4>

              <div className="mb-3">
                <label className="form-label">Your Name*</label>
                <input
                  type="text"
                  className="form-control"
                  value={c_name}
                  onChange={(e) => set_c_name(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email Address*</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number*</label>
                <div className="input-group">
                  <select
                    className="form-select"
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    disabled={isLoadingCountries}
                    style={{ maxWidth: "160px" }}
                  >
                    {countryCodesList.map((c: any) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    required
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">What describes you best?</label>
                <select
                  className="form-select"
                  value={who_am_i}
                  onChange={(e) => set_who_am_i(e.target.value)}
                >
                  <option disabled value="">
                    I am a ...
                  </option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Your Message*</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={message}
                  onChange={(e) => set_message(e.target.value)}
                  required
                />
              </div>

              <button
                className="btn btn-primary w-100"
                style={{ backgroundColor: "#2691d7" }}
                onClick={handleSubmit}
                disabled={is_loading}
              >
                {is_loading ? "Processing..." : "Send Message"}
              </button>
            </div>
          </div>

          {/* Right - Map + Accordion */}
          <div className="col-lg-6">
            <div className="shadow rounded bg-white border mb-4">
              {!isScriptLoaded ? (
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={{
                      width: "100%",
                      height: "640px",
                      borderRadius: "0.5rem",
                    }}
                    center={{ lat: 20, lng: 0 }}
                    zoom={1}
                    options={{
                      minZoom: 1,
                      maxZoom: 15,
                      gestureHandling: "greedy",
                    }}
                  >
                    {officeLocations.map((office, index) => (
                      <Marker
                        key={index}
                        position={{ lat: office.lat, lng: office.lng }}
                      />
                    ))}
                  </GoogleMap>
                </LoadScript>
              ) : (
                <GoogleMap
                  mapContainerStyle={{
                    width: "100%",
                    height: "560px",
                    borderRadius: "0.5rem",
                  }}
                  center={{ lat: 20, lng: 0 }}
                  zoom={1}
                  options={{
                    minZoom: 1,
                    maxZoom: 15,
                    gestureHandling: "greedy",
                  }}
                >
                  {officeLocations.map((office, index) => (
                    <Marker
                      key={index}
                      position={{ lat: office.lat, lng: office.lng }}
                    />
                  ))}
                </GoogleMap>
              )}
            </div>
          </div>
          <hr className="my-0 border-3" />
          <div className="col-lg-12 bg-white p-3">
            <h5 className="mb-3 fw-bold text-dark">Our Global Offices</h5>
            <Accordion className="border-0" alwaysOpen defaultActiveKey="0">
              {officeLocations.map((office, index) => (
                <Accordion.Item
                  eventKey={String(index)}
                  key={index}
                  className="border rounded mb-2 shadow-sm"
                >
                  <Accordion.Header className="bg-light text-dark fw-semibold">
                    <BsGeoAlt className="me-2 text-primary" />
                    {office.title}
                  </Accordion.Header>
                  <Accordion.Body className="bg-white text-secondary">
                    {office.address}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;
