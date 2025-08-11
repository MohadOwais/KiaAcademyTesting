"use client";

import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import moment from "moment";
import axios from "axios";
import { Modal } from "bootstrap";
import "./Main.css";
import { useSelector } from "react-redux";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import AddCategoryForm from "@/app/components/mui/AddCategoryForm";
import UpdateCategoryForm from "@/app/components/mui/UpdateCategoryForm";
import toast, { Toaster } from "react-hot-toast";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface Category {
category_id: string;
category_name: string;
category_description: string;
created_at: string;
}

const Main = () => {
const [categories, setCategories] = useState<Category[]>([]);
  const [modalDescription, setModalDescription] = useState("");
  const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
  const [editingId, setEditingId] = useState<string | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);
      const dataTableInstance = useRef<any>(null);

        useEffect(() => {
        fetchData();
        }, []);

        useEffect(() => {
        if (!categories.length || !tableRef.current) return;
        if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
        }
        dataTableInstance.current = $(tableRef.current).DataTable({
        paging: true,
        searching: true,
        ordering: true,
        responsive: true,
        autoWidth: true,
        });
        return () => {
        if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
        }
        };
        }, [categories]);

        const fetchData = async () => {
        try {
        const res = await axios.get(
        `${baseUrl}/course-categories`,
        authorizationObj
        );
        setCategories(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (error) {
        setCategories([]);
        console.error("Error fetching categories:", error);
        }
        };

        const handleDelete = async (id: string) => {
        toast(
        (t) => (
        <span>
          Are you sure you want to delete this category?
          <button className="btn btn-danger btn-sm ms-2" onClick={async ()=> {
            toast.dismiss(t.id);
            try {
            if (dataTableInstance.current) {
            dataTableInstance.current.destroy();
            dataTableInstance.current = null;
            }
            await axios.delete(
            `${baseUrl}/course-categories/delete/${id}`,
            authorizationObj
            );
            toast.success("Category deleted successfully!");
            await fetchData();
            } catch (error) {
            toast.error("Error deleting category.");
            console.error("Error deleting category:", error);
            }
            }}
            >
            Yes
          </button>
          <button className="btn btn-secondary btn-sm ms-2" onClick={()=> toast.dismiss(t.id)}
            >
            No
          </button>
        </span>
        ),
        { duration: 5000 }
        );
        };

        useEffect(() => {
        const handler = (event: any) => {
        const btn = event.target.closest("button");
        if (!btn) return;
        const id = btn.getAttribute("data-id");
        if (btn.classList.contains("edit-btn")) {
        setEditingId(id);
        const modalElement = document.getElementById("editModal");
        if (modalElement) {
        const modal = Modal.getOrCreateInstance(modalElement);
        modal.show();
        }
        toast.success("Edit mode enabled");
        }
        if (btn.classList.contains("delete-btn")) {
        handleDelete(id);
        }
        };
        const tableEl = tableRef.current;
        if (tableEl) {
        tableEl.addEventListener("click", handler);
        }
        return () => {
        if (tableEl) {
        tableEl.removeEventListener("click", handler);
        }
        };
        }, [categories]);

        const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed";

        return (
        <ProtectedRoute allowedRoleIds={["1"]}>
          <div className="mt-4">
            <Toaster position="top-center" />
            <div className="row mb-3">
              <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0">
                <h3 className="m-0 heading-style">Course Categories</h3>
              </div>
              <div className="col-12 col-md-6 d-flex justify-content-md-end">
                <button className="btn btn-view text-white rounded-pill w-md-auto" data-bs-toggle="modal"
                  data-bs-target="#addModal">
                  Add Category
                </button>
              </div>
            </div>
            <div className={`table-cont-sts ${sidebarClass}`}>
              <table ref={tableRef} className="display table table-striped responsive table-hover"
                style={{ width: "100%" }}>
                <thead>
                  <tr>
                    <th>S. No</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, index) => (
                  <tr key={category.category_id}>
                    <td>{index + 1}</td>
                    <td>{category.category_name}</td>
                    <td>
                    {category.category_description && (
                      (() => {
                        // Responsive char limit: 25 for mobile, 70 for desktop
                        let charLimit = 70;
                        if (typeof window !== "undefined" && window.innerWidth <= 576) {
                          charLimit = 25;
                        }
                        const desc = category.category_description;
                        if (desc.length > charLimit) {
                          return <>
                            {desc.slice(0, charLimit)}...
                            <button className="btn btn-link btn-sm p-0 ms-1" type="button" onClick={() => {
                              setModalDescription(desc);
                              const modalElement = document.getElementById("descModal");
                              if (modalElement) {
                                // @ts-ignore
                                const modal = window.bootstrap
                                  ? window.bootstrap.Modal.getOrCreateInstance(modalElement)
                                  : Modal.getOrCreateInstance(modalElement);
                                modal.show();
                              }
                            }}>
                              Read more
                            </button>
                          </>;
                        } else {
                          return desc;
                        }
                      })()
                    )}
                    </td>

                    <td>{moment(category.created_at).format("MMMM D, YYYY")}</td>
                    <td>
                      <button className="btn btn-sm btn-primary edit-btn" data-id={category.category_id}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-danger ms-2 delete-btn" data-id={category.category_id}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Description Modal */}
            <div className="modal fade" id="descModal" tabIndex={-1} aria-labelledby="descModalLabel"
              aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="descModalLabel">
                      Category Description
                    </h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body">{modalDescription}</div>
                </div>
              </div>
            </div>
            {/* Add Modal */}
            <div className="modal fade addModal" id="addModal" tabIndex={-1} data-bs-backdrop="static"
              data-bs-keyboard="false">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Add Category</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" />
                  </div>
                  <div className="modal-body">
                    <AddCategoryForm onClose={async ()=> {
                      const modalElement = document.getElementById("addModal");
                      if (modalElement) {
                      if (dataTableInstance.current) {
                      dataTableInstance.current.destroy();
                      dataTableInstance.current = null;
                      }
                      await fetchData();
                      const modal = Modal.getOrCreateInstance(modalElement);
                      modal.hide();
                      setTimeout(() => {
                      document.body.classList.remove("modal-open");
                      document
                      .querySelectorAll(".modal-backdrop")
                      .forEach((el) => el.remove());
                      }, 500);
                      toast.success("Category added successfully!");
                      }
                      }}
                      />
                  </div>
                </div>
              </div>
            </div>
            {/* Edit Modal */}
            <div className="modal fade editModal" id="editModal" tabIndex={-1} data-bs-backdrop="static"
              data-bs-keyboard="false">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Update Category</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" />
                  </div>
                  <div className="modal-body">
                    {editingId && (
                    <UpdateCategoryForm categoryId={editingId} onClose={async ()=> {
                      const modalElement = document.getElementById("editModal");
                      if (modalElement) {
                      const modal = Modal.getOrCreateInstance(modalElement);
                      modal.hide();
                      await fetchData();
                      toast.success("Category updated successfully!");
                      }
                      }}
                      />
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ProtectedRoute>
        );
        };

        export default Main;