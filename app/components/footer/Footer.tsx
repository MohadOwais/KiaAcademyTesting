"use client";

import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { FaFacebook, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";  
import { RiTwitterXFill } from "react-icons/ri";
import { isSubdomain, subdomain, domain } from "../../utils/domain";


import {
  facebookUrl,
  instagramUrl,
  linkedinUrl,
  twitterUrl,
  youtubeUrl,
} from "@/app/utils/data";
import { Copyright } from "@/app/(auth)/auth/signin/Main";
import logo from "../../../public/images/logo-white.png";
import { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { baseUrl, authorizationObj } from "@/app/utils/core"; 

// Add missing data
const topCategories = [
  "Business & Finance",
  "Technology & IT",
  "Health & Wellness",
  "Education & Teaching",
  "Marketing & Sales",
  "Design & Creative"
];

const topSkills = [
  "Web Development",
  "Data Science",
  "Digital Marketing",
  "Project Management",
  "UI/UX Design",
  "Business Analytics"
];

interface FooterListProps {
  title: string;
  options: Array<{
    label: string;
    path: string;
  }>;
  onCompanyProfileClick?: () => void;
}


const FooterList = ({ title, options, onCompanyProfileClick }: FooterListProps) => {
  return (
    <>
      <h5 className="text-white mb-3 fw-semibold text-start">{title}</h5>
      <ul className="list-unstyled">
        {options?.map((option, i) => (
          <li className="mb-2" key={i}>
            {option.label === "Company Profile" ? (
              <a
                href="#"
                className="text-light text-decoration-none hover-opacity"
                onClick={(e) => {
                  e.preventDefault();
                  onCompanyProfileClick?.();
                }}
              >
                {option.label}
              </a>
            ) : (
              <Link
                href={option.path}
                className="text-light text-decoration-none hover-opacity"
              >
                {option.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};

const Footer = () => {
  const currentUser = useSelector((state: any) => state?.user);
  const [showModal, setShowModal] = useState(false);
  const [c_name, set_c_name] = useState("");
  const [email, set_email] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+1");
  const [is_loading, set_is_loading] = useState(false);
  const [message, set_message] = useState("");
  const [who_am_i, set_who_am_i] = useState("");
  const [error_message, set_error_message] = useState<string | null>(null);
  const [success_message, set_success_message] = useState<string | null>(null);

  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  const [countryCodesList, setCountryCodesList] = useState<{code: string, flag: string, name: string, iso2?: string}[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);

useEffect(() => {
  const fetchCountryCodes = async () => {
    let userCountryCode = "+1"; // Default to USA (dial code)
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
      let found = codes.find((c: any) => c.iso2 === userCountryCode);
      if (!found) {
        found = codes.find((c: any) => c.code === userCountryCode);
      }
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
        let found = codes.find((c: any) => c.iso2 === userCountryCode);
        if (!found) {
          found = codes.find((c: any) => c.code === userCountryCode);
        }
        setSelectedCountryCode(found ? found.code : "+1");
      } catch (fallbackErr) {
        setCountryCodesList([
          { code: "+1", flag: "🇺🇸", name: "United States", iso2: "US" },
          { code: "+44", flag: "🇬🇧", name: "United Kingdom", iso2: "GB" },
          { code: "+61", flag: "🇦🇺", name: "Australia", iso2: "AU" },
          { code: "+966", flag: "🇸🇦", name: "Saudi Arabia", iso2: "SA" },
          { code: "+91", flag: "🇮🇳", name: "India", iso2: "IN" },
          { code: "+64", flag: "🇳🇿", name: "New Zealand", iso2: "NZ" },
          { code: "+92", flag: "🇵🇰", name: "Pakistan", iso2: "PK" },
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
    set_c_name(`${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`);
    set_email(currentUser?.email || "");
  }, [currentUser]);

  const footerOptions = [
    { 
      title: "About",
      options: [
        { label: "FAQ", path: "/frequently-asked-questions" },
        { label: "Contact Us", path: "/contact" },
        { label: "About Us", path: "/about" },
        { label: "Company Profile", path: "#" },
      ],
    },
    {
      title: "More Information",
      options: [
        { label: "Terms & Conditions", path: "/terms-and-conditions" },
        { label: "Privacy Policy", path: "/privacy-policy" },
        { label: "Refund Policy", path: "/refund-policy" },
        { label: "User Data Deletion", path: "/data-deletion" },
      ],
    },
  ];
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!c_name.trim()) return setError("Name is required");
    if (!email.trim()) return setError("Email is required");
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email.toLowerCase()))
      return setError("Invalid email format");
    if (!phone.trim()) return setError("Phone number is required");
    if (!message.trim()) return setError("Message is required");

    try {
      set_is_loading(true);
      const fullPhoneNumber = `${selectedCountryCode}${phone}`;
      
      const resp = await axios.post(
        `${baseUrl}/contact_us/create`,
        { 
          c_name, 
          email, 
          message,
          selectedCountryCode,
          contact: fullPhoneNumber,
          who_am_i,
          query_from: "profile-download"
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

      // Download PDF
      const pdfUrl = 'https://api.kiacademy.in/company/download-profile/';
      window.open(pdfUrl, '_blank');
      
      handleClose();
      resetSuccess();
      window.location.href = '/';
    } catch (error) {
      console.error('Error submitting form:', error);
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
    <footer className="pt-5 py-4 bg-gradient1 text-white">
      <div className="container-fluid px-4">
        {!isSubdomain && !currentUser?.institute_id && (
          <div className="row g-0 flex-lg-nowrap">
            {/* Brand */}
            <div className="col-12 col-md-3 col-lg-2 d-flex flex-column align-items-center text-center text-md-start mb-4 mb-lg-0">
              <Image
                src={logo}
                alt="logo"
                width={100}
                height={100}
                className="rounded-circle border border-white p-1"
              />
              <p className="text-white mt-3 fs-6">
                Empowering Learning, <br /> Anytime Anywhere
              </p>
            </div>

            {/* Top Categories */}
            <div className="col-6 col-md-3 col-lg-2 mb-4 d-flex align-md-items-center flex-column">
              <h5 className="text-white mb-3 fw-semibold">Top Categories</h5>
              <ul className="list-unstyled">
                {topCategories.map((cat, idx) => (
                  <li key={idx} className="mb-2">
                    <Link 
                      href={`/categories/${cat.toLowerCase().replace(/ & | /g, "-")}`} 
                      className="text-light text-decoration-none hover-opacity"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Skills */}
            <div className="col-6 col-md-3 col-lg-2 mb-4 d-flex align-md-items-center flex-column">
              <h5 className="text-white mb-3 fw-semibold">Top Skills</h5>
              <ul className="list-unstyled">
                {topSkills.map((skill, idx) => (
                  <li key={idx} className="mb-2">
                    <Link 
                      href={`/skills/${skill.toLowerCase().replace(/ /g, "-")}`} 
                      className="text-light text-decoration-none hover-opacity"
                    >
                      {skill}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div className="col-6 col-md-3 col-lg-2 mb-4 d-flex align-md-items-center flex-column">
              <FooterList
                title={footerOptions[0].title}
                options={footerOptions[0].options}
                onCompanyProfileClick={handleShow}
              />
            </div>

            {/* More Information */}
            <div className="col-6 col-md-3 col-lg-2 mb-4 d-flex align-md-items-center flex-column">
              <FooterList
                title={footerOptions[1].title}
                options={footerOptions[1].options}
              />
            </div>

            {/* Social Icons and App Badges (Follow Us) */}
              
            <div className="col-12 col-md-3 col-lg-2 mb-4 d-flex align-items-center flex-column"> 
              <h5 className="text-white mb-3 fw-semibold">Follow Us</h5>
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link href={twitterUrl} target="_blank" aria-label="Twitter" className="text-light fs-5 hover-opacity">
                  <RiTwitterXFill />
                </Link>
                <Link href={facebookUrl} target="_blank" aria-label="Facebook" className="text-light fs-5 hover-opacity">
                  <FaFacebook />
                </Link>
                <Link href={linkedinUrl} target="_blank" aria-label="LinkedIn" className="text-light fs-5 hover-opacity">
                  <FaLinkedin />
                </Link>
                <Link href={instagramUrl} target="_blank" aria-label="Instagram" className="text-light fs-5 hover-opacity">
                  <FaInstagram />
                </Link>
                <Link href={youtubeUrl} target="_blank" aria-label="YouTube" className="text-light fs-5 hover-opacity">
                  <FaYoutube />
                </Link>
              </div>
              <div className="d-flex flex-row gap-2 align-items-center text-center text-md-start">
                <a href="https://play.google.com/store/apps/details?id=com.kenzinnovation.kiacademy" target="_blank" rel="noopener noreferrer" className="hover-opacity">
                  <img
                    src="/images/google-play.svg"
                    alt="Get it on Google Play"
                    className="img-fluid"
                    style={{
                      height: "40px",
                      width: "auto",
                      maxWidth: "150px",
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                </a>
                <a href="#" rel="noopener noreferrer" className="hover-opacity">
                  <img
                    src="/images/app_store.svg"
                    alt="Download on the App Store"
                    className="img-fluid"
                     style={{
                      height: "40px",
                      width: "auto",
                      maxWidth: "150px",
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                </a>
              </div>
              </div>
          </div>
        )}

        {/* Company Profile Modal */}
        <Modal show={showModal} onHide={handleClose} size="lg" centered>
          {/* <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title style={{ fontSize: "1.1rem", fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: 'var(--color-dark-2)', fontSize: '1.3em' }}>📄</span>
              Download Company Profile
            </Modal.Title>
          </Modal.Header> */}
          <Modal.Body className="pt-0">
            <div className="shadow-sm rounded p-4 bg-white" style={{ boxShadow: '0 2px 16px 0 rgba(38,145,215,0.08)' }}>
              <div className="mb-3 text-center">
                <div className="fw-bold fs-5 mb-1" style={{ color: 'var(--color-dark-2)' }}>Get Our Company Profile</div>
                <div className="text-muted small mb-2">Fill in your details to instantly download our company profile PDF.</div>
                <hr className="my-3" />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-semibold">Your Name*</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your full name (e.g. John Smith)"
                      value={c_name}
                      onChange={(e) => set_c_name(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label fw-semibold">Email Address*</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Your Email (e.g. example@gmail.com)"
                      value={email}
                      onChange={(e) => set_email(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone Number*</label>
                  <div className="row">
                    <div className="col-12 col-md-6 mb-3 mb-md-0">
                      <select
                        className="form-select"
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        disabled={isLoadingCountries}
                      >
                        {countryCodesList.map((c: any) => (
                          <option key={c.code} value={c.code}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
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
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">What describes you best?</label>
                  <select
                    className="form-select"
                    value={who_am_i}
                    onChange={(e) => set_who_am_i(e.target.value)}
                  >
                    <option disabled value="">
                      I am a ...
                    </option>
                    <option value="student">Student</option>
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Your Message*</label>
                  <textarea
                    className="form-control"
                    placeholder="Your Message"
                    rows={4}
                    value={message}
                    onChange={(e) => set_message(e.target.value)}
                    required
                  />
                </div>
                <div className="d-flex justify-content-center mb-2">
                  <button
                    type="submit"
                    className="btn btn-view w-50 rounded-pill text-white fw-semibold shadow-sm"
                    style={{ backgroundColor: "#2691d7", fontSize: "1rem", letterSpacing: 0.5 }}
                    disabled={is_loading}
                  >
                    {is_loading ? "Processing..." : "Download Profile"}
                  </button>
                </div>
                <div className="text-center text-muted small">
                  <span style={{ fontSize: '0.95em' }}>We respect your privacy. Your information will not be shared.</span>
                </div>
              </form>
            </div>
          </Modal.Body>
        </Modal>

        <hr className="border-light opacity-25 mt-5" />
        <div className="text-center pt-3 small text-white-50">
       {/* <div>
      {isSubdomain ? (
        <div>
          <p>isSubdomain: <strong>{isSubdomain ? "true" : "false"}</strong></p>

          <p>Subdomain: <strong>{subdomain}</strong></p>
          <p>Main Domain: <strong>{domain}</strong></p>
        </div>
      ) : (
        <div>
        <p>Subdomain: <strong>{subdomain}</strong></p>
          <p>isSubdomain: <strong>{isSubdomain ? "true" : "false"}</strong></p>


          <p>Main Domain: <strong>{domain}</strong></p>
        <p>No subdomain detected</p>
         </div>
      )}
    </div> */}
          <Copyright />
        </div>

        


      </div>
    </footer>
  );
};

export default Footer;
