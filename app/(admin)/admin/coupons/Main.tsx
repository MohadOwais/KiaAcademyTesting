"use client";

import "./Main.css";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import CreateCouponModal from "./CreateCouponForm";
import EditCouponForm from "./EditCouponForm";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import CreateCouponForm from "./CreateCouponForm";
// import ProtectedRoute from "@/app/components/ProtectedRoute";

// Utility function to fetch coupons
const fetchCoupons = async () => {
  try {
    const response = await axios.get(`${baseUrl}/coupons`, authorizationObj);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return [];
  }
};

// Utility function to delete a coupon
const deleteCoupon = async (couponId: string) => {
  console.log("Deleting coupon with ID:", couponId);
  try {
    const response = await axios.delete(`${baseUrl}/coupons/delete/${couponId}`, authorizationObj);
    console.log("Coupon deleted successfully:",response, response.data);
    return response.data;
  } catch (error) {
    console.error("Error deleting coupon:", error);
    throw error;
  }
};

const Main = () => {
  const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [singleCoupon, setSingleCoupon] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const tableRef = useRef<HTMLDivElement | null>(null);
  const dataTableInitialized = useRef(false);

  // Fetch coupons from API
  const getCoupons = async () => {
    try {
      setIsLoading(true);
      // Destroy DataTable before updating data
      if (tableRef.current) {
        const $table = $(tableRef.current).find("table");
        if ($.fn.DataTable.isDataTable($table)) {
          $table.DataTable().destroy();
        }
      }
      const fetchedCoupons = await fetchCoupons();
      setCoupons(fetchedCoupons);
      dataTableInitialized.current = false; // Allow re-init of DataTable
    } catch (error) {
      toast.error("Failed to load coupons.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCoupons(); // Initial fetch
  }, []);

  // Initialize DataTable only once per fetch
  useEffect(() => {
    if (!isLoading && coupons.length > 0 && tableRef.current) {
      const $table = $(tableRef.current).find("table");

      if (!dataTableInitialized.current && !$table.hasClass("dataTable")) {
        $table.DataTable({
          responsive: true,
          destroy: true,
        });
        dataTableInitialized.current = true;
      }
    }

    // Cleanup
    return () => {
      if (tableRef.current) {
        const $table = $(tableRef.current).find("table");
        if ($.fn.DataTable.isDataTable($table)) {
          $table.DataTable().destroy();
        }
      }
    };
  }, [isLoading, coupons]);

  const handleEditCoupon = (couponId: string) => {
    const selectedCoupon = coupons.find((c) => c.coupon_id === couponId);
    if (selectedCoupon) {
      setSingleCoupon(selectedCoupon);
      setIsEditing(true);
    }
  };

  const handleDeleteCoupon = (couponId: string) => {
    toast(
      (t) => (
        <span>
          Are you sure you want to delete this coupon?
          <button
            className="btn btn-danger btn-sm ms-2"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteCoupon(couponId);
                await getCoupons();
                toast.success("Coupon deleted successfully");
              } catch (error) {
                toast.error("Error deleting coupon");
              }
            }}
          >
            Yes
          </button>
          <button
            className="btn btn-secondary btn-sm ms-2"
            onClick={() => toast.dismiss(t.id)}
          >
            No
          </button>
        </span>
      ),
      { duration: 5000 }
    );
  };

  const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";

  return (
    // <ProtectedRoute allowedRoleIds={["1"]}>
    <div className="container-fluid py-4">
      <Toaster position="top-center" />
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <h3 className="mb-2 mb-md-0 heading-style">Coupons</h3>
        <button
          className="btn btn-view text-white rounded-pill px-md-4 py-md-2"
          onClick={() => setShowCreateModal(true)}
        >
          <IoMdAdd className="me-2" />
          Add New Coupon
        </button>
      </div>
      {/* 
      {isLoading ? (
        <div className="text-center py-5">Loading coupons...</div>
      ) : ( */}
      <div ref={tableRef} className={`table-cont-sts ${sidebarClass}`}>
        <table
          className="table table-striped responsive table-hover"
          style={{ width: "100%" }}
        >
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Coupon Code</th>
              <th>Discount</th>
              <th>Valid From</th>
              <th>Valid To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>

            {coupons.map((coupon, index) => (
              <tr key={coupon.coupon_id}>
                <td>{index + 1}</td>
                <td>{coupon.coupon_code}</td>
                <td>{coupon.coupon_discount}%</td>
                <td>
                  {moment(coupon.coupon_valid_from).format("MMMM D, YYYY")}
                </td>
                <td>
                  {moment(coupon.coupon_valid_to).format("MMMM D, YYYY")}
                </td>
                <td className="text-nowrap">
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <button
                      className="btn btn-outline-primary rounded-pill btn-sm d-flex align-items-center justify-content-center"
                      onClick={() => handleEditCoupon(coupon.coupon_id)}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      <span className="d-sm-inline">Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger rounded-pill btn-sm d-flex align-items-center justify-content-center"
                      onClick={() => handleDeleteCoupon(coupon.coupon_id)}
                    >
                      <IoMdTrash className="me-1" />
                      <span className="d-sm-inline">Delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* )} */}
      {/* Coupon creation modal using Bootstrap, rendered in Main.tsx */}
      {showCreateModal && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
          aria-labelledby="createCouponModalLabel"
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="createCouponModalLabel">
                  Create New Coupon
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <CreateCouponForm onClose={() => setShowCreateModal(false)} getCoupons={getCoupons} />
            </div>
          </div>
        </div>
      )}


      {isEditing && singleCoupon && (
        <div
          className="modal fade show"
          style={{ display: "block", background: "rgba(0,0,0,0.5)" }}
          tabIndex={-1}
          aria-labelledby="editCouponModalLabel"
          aria-modal="true"
          role="dialog"
        >
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editCouponModalLabel">
                  Edit Coupon
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsEditing(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <EditCouponForm
                  coupon={singleCoupon}
                  onClose={() => setIsEditing(false)}
                  getCoupons={getCoupons}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    // </ProtectedRoute>
  );
};

export default Main;
