import "./Main.css";
import * as React from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import "bootstrap-icons/font/bootstrap-icons.css";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

const ViewMessageModal = ({
  message,
  show,
  onClose,
}: {
  message: any;
  show: boolean;
  onClose: () => void;
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const [modalInstance, setModalInstance] = React.useState<any>(null);

  React.useEffect(() => {
    if (modalRef.current && !modalInstance) {
      const instance = new window.bootstrap.Modal(modalRef.current);
      setModalInstance(instance);
    }
  }, [modalInstance]);

  React.useEffect(() => {
    if (modalInstance) {
      if (show) {
        modalInstance.show();
      } else {
        modalInstance.hide();
      }
    }
  }, [show, modalInstance]);

  React.useEffect(() => {
    const handleHidden = () => {
      onClose();
    };

    if (modalRef.current) {
      modalRef.current.addEventListener("hidden.bs.modal", handleHidden);
    }

    return () => {
      if (modalRef.current) {
        modalRef.current.removeEventListener("hidden.bs.modal", handleHidden);
      }
    };
  }, [onClose]);

  return (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="viewMessageModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="viewMessageModalLabel">
              <i className="bi bi-envelope me-2"></i>
              Message Details
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body">
            <div className="row g-3">
              {/* Sender Info */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">
                      <i className="bi bi-person me-2"></i> Sender Information
                    </h6>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Name</label>
                      <p className="mb-0">{message?.c_name || "N/A"}</p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Email</label>
                      <p className="mb-0">
                        {message?.email?.toLowerCase() || "N/A"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Contact</label>
                      <p className="mb-0">{message?.contact || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Details */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">
                      <i className="bi bi-clock me-2"></i> Message Details
                    </h6>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Sent At</label>
                      <p className="mb-0">
                        {message
                          ? moment(message?.created_date).format("MMMM D, YYYY")
                          : "N/A"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Message</label>
                      <p className="mb-0 white-space-pre-wrap">
                        {message?.message || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              <i className="bi bi-x-circle me-2"></i> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TTable = ({ data }: any) => {
  const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen);
  const tableRef = React.useRef<HTMLTableElement>(null);
  const [tableInstance, setTableInstance] = React.useState<any>(null);
  const [message, setMessage] = React.useState<any>(null);
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    if (data?.length && tableRef.current) {
      const $table = $(tableRef.current);
      if ($.fn.DataTable.isDataTable($table)) {
        $table.DataTable().destroy();
      }
      $table.DataTable({
        paging: true,
        searching: true,
        ordering: true,
        pageLength: 10,
        lengthMenu: [
          [10, 20, 30, 40, 50],
          [10, 20, 30, 40, 50],
        ],
        responsive: true,
        columnDefs: [
          { responsivePriority: 1, targets: 0 },
          { responsivePriority: 2, targets: 1 },
          { responsivePriority: 3, targets: 2 },
          { responsivePriority: 4, targets: 3 },
          { responsivePriority: 5, targets: 4 },
          { responsivePriority: 6, targets: 5 },
          { responsivePriority: 7, targets: 6 },
        ],
      });
    }
    return () => {
      if (tableRef.current) {
        const $table = $(tableRef.current);
        if ($.fn.DataTable.isDataTable($table)) {
          $table.DataTable().destroy();
        }
      }
    };
  }, [data]);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const target = e.target as HTMLElement;
      const button = target.closest(".view-message-btn") as HTMLButtonElement | null;
      if (button && button.dataset.id) {
        const msg = data.find((d: any) => d.id == button.dataset.id);
        if (msg) {
          setMessage({
            ...msg,
            c_name: msg.c_name || msg.Name || "N/A"
          });
          setShowModal(true);
        }
      }
    };
    const table = tableRef.current;
    if (table) table.addEventListener("click", handler);
    return () => {
      if (table) table.removeEventListener("click", handler);
    };
  }, [data]);

  const handleViewMessage = (data: any) => {
    // console.log("Viewing message data:", data); // Debug log
    setMessage({
      ...data,
      c_name: data.c_name || data.Name || "N/A", // Handle both possible name properties
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage(null);
  };

      const sidebarClass = isDrawerOpen ? "sidebar-open" : "sidebar-closed"; 

  return (
    <div
      className={`table-cont-sts ${sidebarClass}`}
    >
      <table
        ref={tableRef}
        className="display table table-striped responsive table-hover"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            <th>Sr. No</th>
            <th>Name</th>
            <th>Email</th>
            <th>Contact</th>
            <th>Registered On</th>
            <th>Message</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item: any, index: number) => (
            <tr key={item.id || index}>
              <td>{index + 1}</td>
              <td>{item.c_name || "N/A"}</td>
              <td>{item.email?.toLowerCase() || "N/A"}</td>
              <td>{item.contact || "N/A"}</td>
              <td>{moment(item.created_date).format("MMMM D, YYYY")}</td>
              <td>
                {item.message
                  ? `${item.message.substring(0, 20)}${
                      item.message.length > 20 ? "..." : ""
                    }`
                  : "N/A"}
              </td>
              <td>
                <button
                  type="button"
                  className="btn btn-sm btn-view rounded-pill text-white view-message-btn"
                  data-id={item.id}
                >
                  <i className="bi bi-eye-fill me-1"></i>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ViewMessageModal
        message={message}
        show={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TTable;