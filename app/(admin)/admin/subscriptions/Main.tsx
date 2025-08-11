"use client"

import "./Main.css";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { IoMdEye } from "react-icons/io";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import ViewSubscription from "@/app/components/forms/ViewSubscription";
import moment from "moment";
import { capitalizeString } from "@/app/utils/functions";
import { get_plan_medium } from "@/app/(admin)/admin/plans/Main";
import ProtectedRoute from "@/app/components/ProtectedRoute";


const ViewSubscriptionModal = ({ show, onClose, subscription }: any) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [modalInstance, setModalInstance] = useState<any>(null);

    useEffect(() => {
        if (modalRef.current && !modalInstance) {
            const modal = new window.bootstrap.Modal(modalRef.current);
            setModalInstance(modal);
        }
    }, [modalInstance]);

    useEffect(() => {
        if (modalInstance) {
            if (show) {
                modalInstance.show();
            } else {
                modalInstance.hide();
            }
        }
    }, [show, modalInstance]);

    useEffect(() => {
        return () => {
            if (modalInstance) {
                modalInstance.dispose();
            }
        };
    }, [modalInstance]);

    return (
        <div className="modal fade" ref={modalRef} tabIndex={-1} aria-labelledby="viewSubscriptionModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="viewSubscriptionModalLabel">
                            <i className="bi bi-eye me-2"></i>
                            Subscription Details
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <ViewSubscription data={subscription} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const Main = () => {
    const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const tableRef = useRef<HTMLTableElement>(null);
    const [dataTable, setDataTable] = useState<any>(null);

    const getSubscriptions = async () => {
        try {
            setIsLoading(true);
            const resp = await axios.get(`${baseUrl}/subscriptions`, authorizationObj);
            if (resp?.data?.data) {
                setSubscriptions(resp.data.data);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getSubscriptions();
    }, []);

    useEffect(() => {
        if (tableRef.current && subscriptions.length > 0) {
            if (dataTable) {
                dataTable.destroy();
            }
            const newDataTable = $(tableRef.current).DataTable({
                responsive: true,
                order: [[0, 'asc']],
                pageLength: 10,
                language: {
                    search: "Search subscriptions:",
                    lengthMenu: "Show _MENU_ subscriptions per page",
                    info: "Showing _START_ to _END_ of _TOTAL_ subscriptions",
                    infoEmpty: "No subscriptions found",
                    infoFiltered: "(filtered from _MAX_ total subscriptions)"
                }
            });
            setDataTable(newDataTable);
        }

        return () => {
            if (dataTable) {
                dataTable.destroy();
            }
        };
    }, [subscriptions]);

    useEffect(() => {
        const tableElem = tableRef.current;
        if (!tableElem) return;
        const handleAction = (e: Event) => {
            const target = e.target as HTMLElement;
            const viewBtn = target.closest(".view-subscription-btn") as HTMLElement | null;
            if (viewBtn) {
                const id = viewBtn.getAttribute("data-id");
                if (id) {
                    const found = subscriptions.find((s) => s.id.toString() === id);
                    if (found) handleViewSubscription(found);
                }
            }
        };
        tableElem.addEventListener("click", handleAction);
        return () => {
            tableElem.removeEventListener("click", handleAction);
        };
    }, [subscriptions]);

    const handleViewSubscription = (subscription: any) => {
        setSelectedSubscription(subscription);
        setShowViewModal(true);
    };

    const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed"; 


    return (
                <ProtectedRoute allowedRoleIds={["1"]}>
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0 heading-style">Subscriptions</h3>
            </div>

            {isLoading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : (
                <div  className={`table-cont-sts ${sidebarClass}`}>
                    <table ref={tableRef} className="table table-striped responsive table-hover" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>Sr. No</th>
                                <th>Plan Name</th>
                                <th>Subscriber</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptions.map((subscription, index) => (
                                <tr key={subscription.id}>
                                    <td>{index + 1}</td>
                                    <td>{subscription.plan_name}</td>
                                    <td>{subscription.name}</td>
                                    <td>{subscription.plan_duration} {get_plan_medium(subscription.plan_medium, subscription.plan_duration)}</td>
                                    <td>
                                        <span className={`badge rounded-pill text-white p-2 bg-${subscription.status === 'active' ? 'success' : 'danger'}`}
                                        style={{
                                            width: "80px",
                                            display: "inline-block",
                                            textAlign: "center",
                                            textTransform: "capitalize",
                                          }}>
                                            {capitalizeString(subscription.status)}
                                        </span>
                                    </td>
                                    <td>{moment(subscription.start_date).format('MMMM D, YYYY')}</td>
                                    <td>{moment(subscription.end_date).format('MMMM D, YYYY')}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-view rounded-pill text-white view-subscription-btn"
                                            data-id={subscription.id}
                                            type="button"
                                        >
                                           <i className="bi bi-eye-fill"></i>
                      View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ViewSubscriptionModal 
                show={showViewModal} 
                onClose={() => setShowViewModal(false)} 
                subscription={selectedSubscription} 
            />
        </div>
        </ProtectedRoute>
    );
};

export default Main;