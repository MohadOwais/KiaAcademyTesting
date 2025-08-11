"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import { useSelector } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import toast from "react-hot-toast";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

interface Country {
  name: {
    common: string;
  };
  currencies: {
    [key: string]: {
      name: string;
      symbol: string;
    };
  };
}

const PayoutModal = () => {
  const currentUser = useSelector((state: any) => state.user);
  const userId = currentUser?.user_id;

  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const [bankDetails, setBankDetails] = useState({
    account_type: "saving",
    account_holder_name: "",
    account_number: "",
    bank_name: "",
    ifsc_code: "",
    upi_id: "",
    user_id: userId,
    country: "",
    base_currency: "",
  });

  // Fetch countries data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
        setCountries(response.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
        toast.error('Failed to load countries data');
      }
    };
    fetchCountries();
  }, []);

  // Get unique currencies from selected country
  const getCurrenciesForCountry = (countryName: string) => {
    const country = countries.find(c => c.name.common === countryName);
    if (!country) return [];
    return Object.entries(country.currencies).map(([code, currency]) => ({
      code,
      name: currency.name,
      symbol: currency.symbol
    }));
  };

  // Handle country change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryName = e.target.value;
    setSelectedCountry(countryName);
    setSelectedCurrency(""); // Reset currency when country changes
    setBankDetails(prev => ({ ...prev, country: countryName, base_currency: "" }));
  };

  // Handle currency change
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currency = e.target.value;
    setSelectedCurrency(currency);
    setBankDetails(prev => ({ ...prev, base_currency: currency }));
  };

  // Fetch existing bank details
  const fetchBankDetails = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${baseUrl}/bank-details/show/${userId}`,
        authorizationObj
      );

      if (response.data.status === 200 && response.data.data) {
        const data = response.data.data;
        setBankDetails({ ...data, user_id: userId });
        setSelectedCountry(data.country || "");
        setSelectedCurrency(data.base_currency || "");
        setHasBankDetails(true);
      } else {
        setHasBankDetails(false);
        resetForm();
      }
    } catch (err) {
      setHasBankDetails(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBankDetails({
      account_type: "saving",
      account_holder_name: "",
      account_number: "",
      bank_name: "",
      ifsc_code: "",
      upi_id: "",
      user_id: userId,
      country: "",
      base_currency: "",
    });
    setSelectedCountry("");
    setSelectedCurrency("");
  };

  useEffect(() => {
    if (userId) {
      fetchBankDetails();
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankDetails.account_holder_name || !bankDetails.account_number || !bankDetails.country || !bankDetails.base_currency) {
      toast.error("Please fill in all required fields.", { position: "top-center" });
      return;
    }

    const formData = new FormData();
    for (const key in bankDetails) {
      formData.append(key, bankDetails[key as keyof typeof bankDetails]);
    }

    try {
      const url = hasBankDetails
        ? `${baseUrl}/bank-details/update/${userId}`
        : `${baseUrl}/bank-details/create`;

      const response = await axios.post(url, formData, authorizationObj);

      if (response.data.status === 200 || response.data.status === 201) {
        toast.success("Bank details saved successfully.", { position: "top-center", duration: 5000 });
        setTimeout(() => {
          setIsOpen(false);
          fetchBankDetails();
        }, 200);
      } else {
        toast.error("Failed to save bank details.", { position: "top-center", duration: 5000 });
      }
    } catch (error) {
      toast.error("Something went wrong while saving bank details.", { position: "top-center" });
    }
  };

  const openModal = () => {
    fetchBankDetails();
    setIsOpen(true);
  };

  return (
    <div className="container-fluid">
      <div className="my-3">
        <button className="btn btn-view rounded-pill fw-bold" 
        onClick={openModal}
        style={{cursor:"pointer", color:"#fff"}}
        >
          {hasBankDetails ? "Update Bank Details" : "Add Bank Details"}
        </button>
      </div>

      {isOpen && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title heading-style">
                  {bankDetails.account_holder_name ? "Update Bank Account" : "Add Bank Account"}
                </h4>
                <button
                  type="button"
                  className="btn-close btn-close-style"
                  onClick={() => setIsOpen(false)}
                ></button>
              </div>

              <div className="modal-body text-start">
                {loading ? (
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    
                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label htmlFor="country" className="form-label">Country *</label>
                        <select
                          className="form-select"
                          id="country"
                          value={selectedCountry}
                          onChange={handleCountryChange}
                          style={{cursor:"pointer"}}
                          required
                        >
                          <option value="">Select Country</option>
                          {countries
                            .sort((a, b) => a.name.common.localeCompare(b.name.common))
                            .map((country) => (
                              <option key={country.name.common} value={country.name.common}>
                                {country.name.common}
                              </option>
                            ))}
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="currency" className="form-label">Base Currency *</label>
                        <select
                          className="form-select"
                          id="currency"
                          value={selectedCurrency}
                          onChange={handleCurrencyChange}
                          required
                          disabled={!selectedCountry}
                          style={{cursor:"pointer"}}
                        >
                          <option value="">Select Currency</option>
                          {selectedCountry && getCurrenciesForCountry(selectedCountry).map((currency) => (
                            <option key={currency.code} value={currency.code}>
                              {currency.name} ({currency.symbol})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label htmlFor="accountType" className="form-label">Account Type</label>
                        <select
                          name="account_type"
                          className="form-select"
                          id="accountType"
                          value={bankDetails.account_type}
                          onChange={handleChange}
                          style={{cursor:"pointer"}}
                        >
                          <option value="saving">Saving</option>
                          <option value="current">Current</option>
                        </select>
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="accountHolder" className="form-label">Account Holder Name</label>
                        <input
                          name="account_holder_name"
                          type="text"
                          className="form-control"
                          id="accountHolder"
                          value={bankDetails.account_holder_name}
                          onChange={handleChange}
                          required
                          placeholder="Enter account holder name"
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label htmlFor="accountNumber" className="form-label">Account Number</label>
                        <input
                          name="account_number"
                          type="text"
                          className="form-control"
                          id="accountNumber"
                          value={bankDetails.account_number}
                          onChange={handleChange}
                          required
                          placeholder="Enter account number"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="bankName" className="form-label">Bank Name</label>
                        <input
                          name="bank_name"
                          type="text"
                          className="form-control"
                          id="bankName"
                          value={bankDetails.bank_name}
                          onChange={handleChange}
                          required
                          placeholder="Enter bank name"
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-12 col-md-6">
                        <label htmlFor="ifscCode" className="form-label">IFSC Code</label>
                        <input
                          name="ifsc_code"
                          type="text"
                          className="form-control"
                          id="ifscCode"
                          value={bankDetails.ifsc_code}
                          onChange={handleChange}
                          required
                          placeholder="Enter IFSC code"
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label htmlFor="upiId" className="form-label">UPI ID (optional)</label>
                        <input
                          name="upi_id"
                          type="text"
                          className="form-control"
                          id="upiId"
                          value={bankDetails.upi_id}
                          onChange={handleChange}
                          placeholder="Enter UPI ID"
                        />
                      </div>
                    </div>

                    <input type="hidden" name="user_id" value={bankDetails.user_id} />

                    <div className="modal-footer border border-0 p-0">
                      <button type="button" className="btn btn-view rounded-pill" 
                      onClick={() => setIsOpen(false)}
                      style={{cursor:"pointer", color:"#fff"}}
                      >
                        Close
                      </button>
                      <button type="submit" className="btn btn-view rounded-pill"
                      style={{cursor:"pointer", color:"#fff"}}
                      >
                        Save Details
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutModal;
