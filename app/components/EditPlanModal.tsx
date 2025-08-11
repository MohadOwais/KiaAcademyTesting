import React, { useRef, useEffect, useState } from "react";
import EditPlanForm from "./EditPlanForm";

// Define the EditPlanModalProps interface
interface EditPlanModalProps {
  show: boolean;
  onClose: () => void;
  getPlans: () => void;
  planData: any;  // This should be planData, not data
  setPlanData: (data: any) => void;
}

// Define the EditPlanFormProps interface
interface EditPlanFormProps {
  data: any;
  getPlans: () => void;
  setPlanData: (data: any) => void;
  onClose: () => void;
  set_is_editing: (isEditing: boolean) => void;
  is_editing: boolean;
}

const EditPlanModal: React.FC<EditPlanModalProps> = ({
  show,
  onClose,
  getPlans,
  planData, // Use planData here
  setPlanData,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalInstance, setModalInstance] = useState<any>(null);

  // Initialize Bootstrap modal instance
  useEffect(() => {
    if (modalRef.current && !modalInstance) {
      const modal = new window.bootstrap.Modal(modalRef.current);
      setModalInstance(modal);
    }
  }, [modalInstance]);

  // Show or hide modal based on 'show' prop
  useEffect(() => {
    if (modalInstance) {
      show ? modalInstance.show() : modalInstance.hide();
    }
  }, [show, modalInstance]);

  // Clean up modal instance on component unmount
  useEffect(() => {
    return () => {
      modalInstance?.dispose?.();
    };
  }, [modalInstance]);

  return (
    <div
      className="modal fade"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="editPlanModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="editPlanModalLabel">
              Edit Plan
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {planData ? (
              <EditPlanForm
                onClose={onClose}
                data={planData} // Passing planData here, matching the prop name in EditPlanForm
                get_plans={getPlans} // Updated to match the expected prop name
                set_data={setPlanData}
                set_is_editing={() => {}} // Placeholder function for set_is_editing
                is_editing={true} // Placeholder value for is_editing
              />
            ) : (
              <p className="text-muted">No plan selected for editing.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPlanModal;
