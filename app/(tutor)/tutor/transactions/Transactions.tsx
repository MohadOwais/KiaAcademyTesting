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
import "react-confirm-alert/src/react-confirm-alert.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

const Main = () => {
const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
const currentUser = useSelector((state: any) => state?.user);
const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tableRef = useRef<HTMLDivElement | null>(null);

    const getTransactions = async () => {
    if (!currentUser?.user_id) return;
    try {
    setIsLoading(true);
    const resp = await axios.get(
    `${baseUrl}/transactions/${currentUser.user_id}`,
    authorizationObj
    );
    if (resp?.data && Array.isArray(resp.data)) {
    setTransactions(resp.data);
    } else if (resp?.data?.data && Array.isArray(resp.data.data)) {
    setTransactions(resp.data.data);
    } else {
    setTransactions([]);
    }
    } catch (error) {
    setTransactions([]);
    toast.error("Error fetching transactions");
    } finally {
    setIsLoading(false);
    }
    };

    useEffect(() => {
    getTransactions();
    }, [currentUser?.user_id]);

    useEffect(() => {
    if (!isLoading && transactions.length > 0 && tableRef.current) {
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
    }, [isLoading, transactions]);

    
  // Dynamically set sidebar state class for responsive width
  const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";

    return (
    <div className="container-fluid py-4">
      <Toaster position="top-center"/>
      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Payouts</h2>
      </div> */}
      <div ref={tableRef} className={`table-cont-sts ${sidebarClass}`}>
        <table className="table table-striped responsive table-hover my-3" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Transaction ID</th>
              <th>Course Name</th>
              <th>Amount</th>
              {/* <th>Currency</th> */}
              <th>Enrollment Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
            <tr>
              <td colSpan={5} className="text-center">
                Loading...
              </td>
            </tr>
            ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted">
                No transactions found.
              </td>
            </tr>
            ) : (
            transactions.map((tx, index) => {
            // Compose a unique key using all available fields and index to guarantee uniqueness
            const key = [
            tx.payment_id ?? '',
            tx.transaction_id ?? '',
            tx.course_id ?? '',
            tx.enrollment_date ?? '',
            index
            ].join('-');
            return (
            <tr key={key}>
              <td>{index + 1}</td>
              <td>{tx.transaction_id}</td>
              <td>{tx.course_title}</td>
              <td>{tx.currency} {parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td>{tx.enrollment_date ? moment(tx.enrollment_date).format("MMM D, YYYY") : '-'}</td>
            </tr>
            );
            })
            )}
          </tbody>
        </table>
      </div>
    </div>
    );
    };

    export default Main;