import { authorizationObj, baseUrl } from "@/app/utils/core";
import { capitalizeString } from "@/app/utils/functions";
// import { Button, TextField } from '@mui/material';
import axios from "axios";
import moment from "moment";
import React, { use, useState } from "react";
import { useSelector } from "react-redux";
import { FilePreview } from "../Docs";

const MoreInfoAdmin = ({
  setErrorMessage,
  setSuccessMessage,
  user,
  setUser,
  errorMessage,
}: any) => {
  const currentUser = useSelector((state: any) => state?.user);
  const userInfo = useSelector((state: any) => state?.user?.instituteData);

  const [isLoading, setIsLoading] = useState(false);
  const [address, set_address] = useState(userInfo?.address);
  const [contact, set_contact] = useState(userInfo?.contact_number);
  const [joining_date, Set_joining_date] = useState(userInfo?.created_at);
  const [email, set_email] = useState(userInfo?.email);
  const [inst_name, set_inst_name] = useState(userInfo?.name);
  const [reg_number, set_reg_number] = useState(userInfo?.registration_number);
  const [tin_number, set_tin_number] = useState(userInfo?.tin_number);
  const [status, set_status] = useState(userInfo?.status);
  const [subdomain_name, set_subdomain_name] = useState(
    userInfo?.subdomain_name
  );
  const [supporting_document, set_supporting_document] = useState(
    userInfo?.supporting_document
  );

  const updateInst = async () => {
    if (!address) {
      setErrorMessage("Address is required");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (!inst_name) {
      setErrorMessage("Institute name is required");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    if (!subdomain_name) {
      setErrorMessage("Subdomain name is required");
      setTimeout(() => setErrorMessage(""), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("address", address);
    formData.append("name", inst_name);
    // formData.append("subdomain_name", subdomain_name)

    try {
      setIsLoading(true);
      const resp = await axios.post(
        `${baseUrl}/institutions/update/${userInfo?.institute_id}`,
        formData,
        authorizationObj
      );
      setIsLoading(false);
      if (resp?.data?.status > 300 || resp?.data?.status < 200) {
        setErrorMessage(resp?.data?.message);
        setTimeout(() => setErrorMessage(""), 3000);
        return;
      }
      setSuccessMessage("Institute info updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      // console.error(error)
      setIsLoading(false);
      setErrorMessage("Something went wrong, please try later");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };
  return (
    <div className="container py-4">
      <div className="row justify-content-start">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card p-4 rounded-4 shadow bg-white">
            <div className="card-body">
              <h3 className="mb-4 heading-style fw-bold text-center text-md-start">
                Institute Information
              </h3>
              <form>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Institute Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={inst_name || ""}
                      onChange={(e) => set_inst_name(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Subdomain Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={subdomain_name || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Contact *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={contact || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Registration Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={reg_number || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">TIN Number *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={tin_number || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Status *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={capitalizeString(status) || "N/A"}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Joining Date *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={moment(joining_date).format("DD-MM-YYYY") || ""}
                      readOnly
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Address *</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={address || ""}
                      onChange={(e) => set_address(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12 col-md-6 d-flex align-items-end">
                    <div className="w-100">
                      <div
                        className="card border-0 bg-light shadow-sm p-3 h-100 d-flex flex-column align-items-center justify-content-center"
                        style={{ minHeight: 120 }}
                      >
                        <div className="mb-2 text-secondary small fw-semibold text-center text-md-start">
                          Supporting Document
                        </div>
                        <FilePreview
                          fileName={supporting_document}
                          label="No Supporting Document Available"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    className="btn px-4 px-md-5 py-2 btn-view rounded-pill text-white w-md-auto"
                    disabled={isLoading}
                    onClick={updateInst}
                  >
                    {isLoading && (
                      <span className="spinner-border spinner-border-sm me-2 text-white"></span>
                    )}
                    {isLoading ? "Processing" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreInfoAdmin;
