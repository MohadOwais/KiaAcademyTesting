"use client";

import "./Main.css";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

const Main = () => {
const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
const currentUser = useSelector((state: any) => state?.user);
const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement | null>(null);

    const getPayouts = async () => {
    if (!currentUser?.user_id) return;
    try {
    setIsLoading(true);
    const resp = await axios.get(
    `${baseUrl}/payouts/${currentUser.user_id}`,
    authorizationObj
    );
    if (resp?.data && Array.isArray(resp.data)) {
    setPayouts(resp.data);
    } else if (resp?.data?.data && Array.isArray(resp.data.data)) {
    setPayouts(resp.data.data);
    } else {
    setPayouts([]);
    }
    } catch (error) {
    setPayouts([]);
    toast.error("Error fetching payouts");
    } finally {
    setIsLoading(false);
    }
    };

    useEffect(() => {
    getPayouts();
    }, [currentUser?.user_id]);

    useEffect(() => {
    if (!isLoading && payouts.length > 0 && tableRef.current) {
    const $table = $(tableRef.current).find("table");
    if ($.fn.DataTable.isDataTable($table)) {
    $table.DataTable().destroy();
    }
    $table.DataTable({
    responsive: true,
    destroy: true,
    });
    }
    return () => {
    if (tableRef.current) {
    const $table = $(tableRef.current).find("table");
    if ($.fn.DataTable.isDataTable($table)) {
    $table.DataTable().destroy();
    }
    }
    };
    }, [isLoading, payouts]);

const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";  
    return (
    <div className="container-fluid py-4">
      <Toaster position="top-center" />
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Payouts</h2>
      </div> */}
      <div ref={tableRef} className={`table-cont-sts ${sidebarClass}`}>
        <table className="table table-striped responsive table-hover my-3" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Name</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Method</th>
              <th>Transaction Ref</th>
              <th>From</th>
              <th>To</th>
              <th>Paid At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
            <tr>
              <td colSpan={10} className="text-center">
                Loading...
              </td>
            </tr>
            ) : payouts.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center text-muted">
                No payouts found.
              </td>
            </tr>
            ) : (
            payouts.map((payout, index) => (
            <tr key={payout.id}>
              <td>{index + 1}</td>
              <td>
                {payout.first_name} {payout.last_name}
              </td>
              <td>{payout.amount}</td>
              <td>
                <span className={`badge rounded-pill text-white p-2 ${ payout.status==="paid" ? "bg-success" :
                  payout.status==="failed" ? "bg-danger" : "bg-warning text-dark" }`} style={{
                    width: "80px",
                    display: "inline-block",
                    textAlign: "center",
                    textTransform: "capitalize",
                  }}>
                  {payout.status}
                </span>
              </td>
              <td>{payout.payment_method}</td>
              <td>{payout.transaction_ref}</td>
              <td>{moment(payout.from_date).format('MMM D, YYYY')}</td>
              <td>{moment(payout.to_date).format('MMM D, YYYY')}</td>
              <td>
                {payout.paid_at
                ? moment(payout.paid_at).format("MMM D, YYYY hh:mm A")
                : "-"}
              </td>
              <td>
                <button className="btn btn-sm btn-view rounded-pill text-white view-btn" data-id={payout.id || index}>
                  <i className="bi bi-eye-fill"></i>
                  View
                </button>
              </td>
            </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    );
    };

    export default Main;