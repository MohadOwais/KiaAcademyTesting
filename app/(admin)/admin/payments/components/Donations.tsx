import "./Main.css";
import * as React from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import $ from "jquery";
import "datatables.net-dt/css/dataTables.dataTables.css";
import "datatables.net";
import "datatables.net-responsive-dt";
import "bootstrap-icons/font/bootstrap-icons.css";
import "datatables.net-responsive-dt/css/responsive.dataTables.css";

const ViewTransactionModal = ({
  transaction,
  show,
  onClose,
}: {
  transaction: any;
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
      aria-labelledby="viewTransactionModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="viewTransactionModalLabel">
              <i className="bi bi-credit-card me-2"></i>
              Transaction Details
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
              {/* User Information */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">
                      <i className="bi bi-person me-2"></i> User Information
                    </h6>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Student Name</label>
                      <p className="mb-0">
                        {transaction?.student_name || "N/A"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">
                        Transaction ID
                      </label>
                      <p className="mb-0">
                        {transaction?.transaction_id || "N/A"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Amount</label>
                      <p className="mb-0">
                        {transaction?.amount || "0"}{" "}
                        {transaction?.currency || ""}
                      </p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Payment Date</label>
                      <p className="mb-0">
                        {transaction?.payment_date
                          ? moment(transaction.payment_date).format(
                              "DD/MM/YYYY hh:mm A"
                            )
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h6 className="card-title fw-bold mb-3">
                      <i className="bi bi-credit-card me-2"></i> Transaction
                      Details
                    </h6>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Currency</label>
                      <p className="mb-0">{transaction?.currency || "N/A"}</p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Status</label>
                      <br />
                      <p
                        className={`badge rounded-pill p-2 bg-${
                          transaction?.status === "success"
                            ? "success"
                            : "danger"
                        }`}
                        style={{
                          width: "80px",
                          display: "inline-block",
                          textAlign: "center",
                          textTransform: "capitalize",
                        }}
                      >
                        {transaction?.status
                          ? transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)
                          : "N/A"}
                      </p>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold">Date</label>
                      <p className="mb-0">
                        {transaction?.created_at
                          ? moment(transaction.created_at).format(
                              "MMMM D, YYYY"
                            )
                          : "N/A"}
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
  const [transaction, setTransaction] = React.useState<any>(null);
  const [showModal, setShowModal] = React.useState(false);

  // Log initial data
  React.useEffect(() => {
    // console.log("Initial data received:", data);
  }, [data]);

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
    const $table = $(tableRef.current!);
    const handleView = (e: any) => {
      const btn = e.target.closest(".view-btn");
      if (btn) {
        const id = btn.getAttribute("data-id");
        const found = data.find(
          (item: any, idx: number) =>
            (item.payment_id || idx.toString()) === id ||
            idx.toString() === id
        );
        if (found) {
          setTransaction(found);
          setShowModal(true);
        }
      }
    };
    $table.on("click", ".view-btn", handleView);
    return () => {
      $table.off("click", ".view-btn", handleView);
    };
  }, [data]);

  const handleCloseModal = () => {
    // console.log("Closing modal");
    setShowModal(false);
    setTransaction(null);
  };

  // Log when transaction state changes
  React.useEffect(() => {
    // console.log("Transaction state updated:", transaction);
  }, [transaction]);

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
            <th>Student Name</th>
            <th>Transaction ID</th>
            <th>Amount</th>
            {/* <th>Currency</th> */}
            <th>Payment Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((item: any, index: number) => {
            return (
              <tr key={item.payment_id || index}>
                <td>{index + 1}</td>
                <td>{item.student_name || "N/A"}</td>
                <td>{item.transaction_id || "N/A"}</td>
                <td>
                  {item.currency ? item.currency.toUpperCase() : "N/A"}{" "}
                  {item.amount || "0"}
                </td>
                <td>{moment(item.created_at).format("MMMM D, YYYY")}</td>
                <td>
                  <button
                    className="btn btn-sm btn-view rounded-pill text-white view-btn"
                    data-id={item.payment_id || index}
                  >
                    <i className="bi bi-eye-fill"></i>
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <ViewTransactionModal
        transaction={transaction}
        show={showModal}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TTable;
