"use client"

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { authorizationObj, baseUrl, emailPattern } from "@/app/utils/core";
import AlertMUI from "@/app/components/mui/AlertMUI";
import { useSelector } from "react-redux";
import { BsTelephone, BsEnvelope, BsGeoAlt } from "react-icons/bs";
import { Accordion } from "react-bootstrap";
import $ from 'jquery';
import 'select2/dist/css/select2.min.css';
import 'select2';

import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';


const select2Styles = `
  .select2-container .select2-selection--single {
    height: 42px !important;
    min-height: 42px !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__rendered {
    line-height: 42px !important;
  }
  .select2-container--default .select2-selection--single .select2-selection__arrow {
    height: 40px !important;
  }
`;

const Main = () => {
    const currentUser = useSelector((state: any) => state?.user);
    const [c_name, set_c_name] = React.useState("");
    const [email, set_email] = React.useState("");
    const [message, set_message] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [selectedCountryCode, setSelectedCountryCode] = React.useState("+1");
    const [is_loading, set_is_loading] = React.useState(false);
    const [error_message, set_error_message] = React.useState<string | null>(null);
    const [success_message, set_success_message] = React.useState<string | null>(null);
    const [countryCodesList, setCountryCodesList] = React.useState<{code: string, flag: string, name: string}[]>([]);
    const [isLoadingCountries, setIsLoadingCountries] = React.useState(true);
    const selectRef = React.useRef<HTMLSelectElement>(null);
    const [showModal, setShowModal] = React.useState(true);

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);
    const [who_am_i, set_who_am_i] = useState(""); // who am i
   
    useEffect(() => {
      const fetchCountryCodes = async () => {
        try {
          const response = await fetch('https://restcountries.com/v3.1/all');
          const data = await response.json();
  
          const uniqueCountryCodes = new Map();
  
          const formattedCountries = data
            .filter((country: any) => country.idd?.root && country.idd?.suffixes?.[0])
            .map((country: any) => {
              const code = country.idd.root + (country.idd.suffixes[0] || '');
              if (!uniqueCountryCodes.has(code)) {
                uniqueCountryCodes.set(code, true);
                return {
                  code,
                  flag: country.flag,
                  name: country.name.common
                };
              }
              return null;
            })
            .filter(Boolean)
            .sort((a: any, b: any) => a.name.localeCompare(b.name));
  
          setCountryCodesList(formattedCountries);
        } catch (error) {
          console.error('Error fetching country codes:', error);
          setCountryCodesList([
            { code: "+1", flag: "🇺🇸", name: "United States" },
            { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
            { code: "+61", flag: "🇦🇺", name: "Australia" },
            { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
            { code: "+91", flag: "🇮🇳", name: "India" },
            { code: "+64", flag: "🇳🇿", name: "New Zealand" },
            { code: "+92", flag: "🇵🇰", name: "Pakistan" },
          ]);
        } finally {
          setIsLoadingCountries(false);
        }
      };
  
      fetchCountryCodes();
    }, []);
  
    // Set current user name and email
    useEffect(() => {
      set_c_name(`${currentUser?.first_name || ""} ${currentUser?.last_name || ""}`);
      set_email(currentUser?.email || "");
    }, [currentUser]);
  
    // Initialize select2 with custom formatting
    useEffect(() => {
      if (selectRef.current && countryCodesList.length > 0) {
        
      }
    }, [countryCodesList]);
    

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
              contact: fullPhoneNumber // Send full phone number with country code
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
          set_success_message("Message sent successfully")

          // download pdf
          const pdfUrl = "http://api.kiacademy.in/company/download-profile";
          if (pdfUrl) {
            window.open(pdfUrl, '_blank');
          }
          handleClose();
          resetSuccess();
        } catch (error) {
          console.error('Error submitting form:', error);
          set_is_loading(false);
          set_error_message("Something went wrong, please try later");
          resetError();
        }
        window.location.href = '/';   // redirect to home page
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

        {/* Remove Footer component since its type is not valid for JSX */}

        <Modal show={showModal} onHide={handleClose} size="lg">
          <Modal.Header closeButton onHide={() => window.location.href = '/'}>     {/* redirect to home page */}
            <Modal.Title style={{ fontSize: '1rem' }}>To Download Company Profile please provide below details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="shadow rounded p-4 bg-white">
              <div className="mb-3">
                <label className="form-label">Your Name*</label>
                <input
                  type="text"
                  className="form-control" 
                  placeholder="Enter your full name (e.g. John Smith)" // placeholder
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
                  placeholder="Your Email (e.g. example@gmail.com)"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  required
                />
              </div>
              
                <div className="mb-3">
                <label className="form-label">Phone Number*</label>
                <div className="input-group">
                  <input
                    ref={selectRef as any}
                    className="form-control" 
                    style={{maxWidth: '120px', minHeight: '42px'}}
                    value={selectedCountryCode}
                    onChange={(e) => {
                      setSelectedCountryCode(e.target.value);
                      // console.log(e.target.value)
                    }}
                    list="country-codes"
                  />
                  <datalist id="country-codes">
                    {isLoadingCountries ? (
                      <option value="">Loading...</option>
                    ) : (
                      countryCodesList?.map((code) => (
                        <option key={code.code} value={code.code}>
                          {code.flag} {code.code}
                        </option>
                      ))
                    )}
                  </datalist>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number (e.g. +1234567890)"
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
                  <option disabled value="">I am a ...</option>
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
                  placeholder="Your Message"
                  rows={4}
                  value={message}
                  onChange={(e) => set_message(e.target.value)}
                  required
                />
              </div>

              <button
                className="btn btn-primary w-100"
                style={{ backgroundColor: "#2691d7", fontSize: "1rem" }}
                onClick={(e) => handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)}
                disabled={is_loading}
              >
                {is_loading ? "Processing..." : "Download Company Profile"}

              </button>
            </div>
          </Modal.Body>
        </Modal>
        </>
    )
}

export default Main
