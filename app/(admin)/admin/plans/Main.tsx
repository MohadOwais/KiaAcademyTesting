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
import CreatePlanForm from "@/app/components/forms/CreatePlanForm";
import EditPlanForm from "@/app/components/forms/EditPlanForm";
import moment from "moment";
import toast, { Toaster } from "react-hot-toast";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import ProtectedRoute from "@/app/components/ProtectedRoute";

export const get_plan_medium = (medium: string, duration: number) => {
  switch (medium) {
    case "year":
      return duration == 1 ? "year" : "years";
      break;
    case "month":
      return duration == 1 ? "month" : "months";
      break;
    case "day":
      return duration == 1 ? "day" : "days";
      break;
    default:
      return "";
      break;
  }
};

const capitalizeString = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const CreatePlanModal = ({ show, onClose, getPlans, showToast }: any) => {
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
  const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);

  useEffect(() => {
    return () => {
      if (modalInstance) {
        modalInstance.dispose();
      }
    };
  }, [modalInstance]);
  const [is_editing, set_is_editing] = useState(false); // Correctly initialized state

  return (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="createPlanModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="createPlanModalLabel">
              Create New Plan
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <CreatePlanForm
              set_show_plan_modal={onClose}
              get_plans={getPlans}
              showToast={showToast}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Component: Main
const Main = () => {
  const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  //   const [alert_data, set_alert_data] = useState<any>(null);
  //   const [is_alert_open, set_is_alert_open] = useState(false);
  //   const [error_message, set_error_message] = useState("");
  //   const [success_message, set_success_message] = useState("");
  const [single_plan, set_single_plan] = useState<any>(null);
  const [is_editing, set_is_editing] = useState(false);
  //   const [showEditModal, setShowEditModal] = useState(false);
  const tableRef = useRef<HTMLDivElement | null>(null); // Adjust type if needed

  const getPlans = async () => {
    try {
      setIsLoading(true);
      const resp = await axios.get(
        `${baseUrl}/subscription-plans`,
        authorizationObj
      );
      if (resp?.data?.data) {
        setPlans(resp.data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getPlans();
  }, []);

  useEffect(() => {
    if (!isLoading && plans.length > 0 && tableRef.current) {
      const $table = $(tableRef.current).find("table");

      // Destroy existing DataTable before reinitializing
      if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
      }

      // Initialize new DataTable
      $table.DataTable({
        responsive: true,
        destroy: true,
      });
    }

    // Cleanup to destroy DataTable when the component unmounts or dependencies change
    return () => {
      if (tableRef.current) {
        const $table = $(tableRef.current).find("table");
        if ($.fn.DataTable.isDataTable($table)) {
          $table.DataTable().destroy();
        }
      }
    };
  }, [isLoading, plans]);

  useEffect(() => {
    const tableElem = tableRef.current?.querySelector("table");
    if (!tableElem) return;
    const handleAction = (e: Event) => {
      const target = e.target as HTMLElement;
      const editBtn = target.closest(".edit-plan-btn") as HTMLElement | null;
      const deleteBtn = target.closest(
        ".delete-plan-btn"
      ) as HTMLElement | null;
      if (editBtn) {
        const id = editBtn.getAttribute("data-id");
        if (id) handleEditPlan(id);
      } else if (deleteBtn) {
        const id = deleteBtn.getAttribute("data-id");
        if (id) handleDeletePlan(id);
      }
    };
    tableElem.addEventListener("click", handleAction);
    return () => {
      tableElem.removeEventListener("click", handleAction);
    };
  }, [plans]);

  const handleDeletePlan = async (planId: string) => {
    toast(
      (t) => (
        <span>
          Are you sure you want to delete this plan?
          <button
            className="btn btn-danger btn-sm ms-2"
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const resp = await axios.delete(
                  `${baseUrl}/subscription-plans/delete/${planId}`,
                  authorizationObj
                );
                if (resp?.data?.status === 200) {
                  await getPlans();
                  toast.success("Plan deleted successfully");
                } else {
                  toast.error(resp?.data?.message || "Failed to delete plan");
                }
              } catch (error) {
                toast.error("Error deleting plan");
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

  const handleEditPlan = (planId: string) => {
    const selectedPlan = plans.find((p) => p.id === planId);
    if (selectedPlan) {
      set_single_plan(selectedPlan);
      set_is_editing(true);
    }
  };

  const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";

  return (
    <ProtectedRoute allowedRoleIds={["1"]}>
      <div className="container-fluid py-4">
        <Toaster position="top-center" />
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h3 className="mb-2 mb-md-0 heading-style">Subscription Plans</h3>
          <button
            className="btn btn-view text-white rounded-pill px-md-4 py-md-2"
            onClick={() => setShowCreateModal(true)}
          >
            <IoMdAdd className="me-2" />
            Add New Plan
          </button>
        </div>

        <div ref={tableRef} className={`table-cont-sts ${sidebarClass}`}>
          <table
            className="table table-striped responsive table-hover"
            style={{ width: "100%" }}
          >
            <thead>
              <tr>
                <th>Sr. No</th>
                <th>Plan Name</th>
                <th>Description</th>
                <th>Price (USD)</th>
                <th>Duration</th>
                <th>Created On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, index) => (
                <tr key={plan.id}>
                  <td>{index + 1}</td>
                  <td>{plan.plan_name}</td>
                  <td>{plan.plan_description}</td>
                  <td>${plan.plan_price}</td>
                  <td>
                    {plan.plan_duration}{" "}
                    {get_plan_medium(plan.plan_medium, plan.plan_duration)}
                  </td>
                  <td>
                    {plan.created_at
                      ? moment(plan.created_at).format("MMMM D, YYYY")
                      : "N/A"}
                  </td>
                  <td className="text-nowrap">
                    <div className="d-flex flex-column flex-sm-row gap-2">
                      <button
                        className="btn btn-outline-primary rounded-pill btn-sm d-flex align-items-center justify-content-center edit-plan-btn"
                        data-id={plan.id}
                        type="button"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        <span className="d-sm-inline">Edit</span>
                      </button>
                      <button
                        className="btn btn-outline-danger rounded-pill btn-sm d-flex align-items-center justify-content-center delete-plan-btn"
                        data-id={plan.id}
                        type="button"
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

        <CreatePlanModal
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          getPlans={getPlans}
          showToast={toast}
        />

        {is_editing && (
          <div className="my-4">
            {/* Pass the plan data to the EditPlanForm */}
            <EditPlanForm
              set_is_editing={set_is_editing}
              is_editing={is_editing}
              data={single_plan} // Send selected plan data to the form
              get_plans={getPlans}
              set_data={set_single_plan}
              showToast={toast}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default Main;
