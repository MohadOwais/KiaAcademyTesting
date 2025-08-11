// import React, { useEffect, useRef, useState } from "react";
// import CreateCouponForm from "./CreateCouponForm";

// interface CreateCouponModalProps {
//   show: boolean;
//   onClose: () => void;
//   getCoupons: () => void;
// }

// const CreateCouponModal: React.FC<CreateCouponModalProps> = ({ show, onClose, getCoupons }) => {
//   const modalRef = useRef<HTMLDivElement>(null);
//   const [modalInstance, setModalInstance] = useState<any>(null);

//   useEffect(() => {
//     if (modalRef.current && typeof window !== "undefined") {
//       const bootstrap = require("bootstrap");
//       const instance = bootstrap.Modal.getOrCreateInstance(modalRef.current);
//       setModalInstance(instance);
//     }
//   }, []);

//   useEffect(() => {
//     if (modalInstance) {
//       if (show) {
//         modalInstance.show();
//       } else {
//         modalInstance.hide();
//       }
//     }
//   }, [show, modalInstance]);

//   useEffect(() => {
//     return () => {
//       if (modalInstance) {
//         modalInstance.dispose();
//       }
//     };
//   }, [modalInstance]);

//   return (
//     <div
//       className="modal fade"
//       ref={modalRef}
//       tabIndex={-1}
//       aria-labelledby="createCouponModalLabel"
//       aria-hidden="true"
//     >
//       <div className="modal-dialog modal-dialog-centered modal-md">
//         <div className="modal-content">
//           <div className="modal-header">
//             <h5 className="modal-title" id="createCouponModalLabel">
//               Create New Coupon
//             </h5>
//             <button
//               type="button"
//               className="btn-close"
//               onClick={onClose}
//               aria-label="Close"
//             ></button>
//           </div>
         
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CreateCouponModal;
