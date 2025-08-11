import React from "react";
import styles from "./CertificateCard.module.css";

interface CertificateCardProps {
  cert: {
    id: string;
    title: string;
    issueDate: string;
    imageUrl: string;
    description?: string;
    code?: string;
    validTill?: string;
    student_name?: string;
    issued_to?: string;
    issuer_name?: string;
    instructor_name?: string;
    issuer_id?: string | null;
    created_at?: string;
    updated_at?: string;
    certificate_code?: string;
  };
  onView: (cert: any) => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ cert, onView }) => {
  return (
    <div
      className={`card border-0 shadow-sm mb-3 ${styles["cert-card"]} ${styles["cert-card-hover"]}`}
      onClick={() => onView(cert)}
    >
      <img
        src={cert.imageUrl}
        alt={cert.title}
        className={`card-img-top ${styles["cert-card-img"]}`}
      />
      <div className={`card-body ${styles["cert-card-body"]}`}>
        <h5 className="card-title fw-semibold mb-2">{cert.title}</h5>
        <p className="card-text text-secondary small mb-2">
          <span className="me-2">🏅</span>Issued: {cert.issueDate}
        </p>
        {/* {cert.student_name && (
          <p className="card-text small mb-2">
            <b>Student:</b> {cert.student_name}
          </p>
        )}
        {cert.issuer_name && (
          <p className="card-text small mb-2">
            <b>Issuer:</b> {cert.issuer_name}
          </p>
        )}
        {cert.instructor_name && (
          <p className="card-text small mb-2">
            <b>Instructor:</b> {cert.instructor_name}
          </p>
        )}
        {cert.code && (
          <p className="card-text small mb-2">
            <b>Code:</b> {cert.code}
          </p>
        )}
        {cert.validTill && (
          <p className="card-text small mb-2">
            <b>Valid Till:</b> {cert.validTill}
          </p>
        )}
        {cert.created_at && (
          <p className="card-text small mb-2">
            <b>Created:</b> {cert.created_at}
          </p>
        )}
        {cert.updated_at && (
          <p className="card-text small mb-2">
            <b>Updated:</b> {cert.updated_at}
          </p>
        )}
        {cert.description && (
          <p className="card-text small mb-2">{cert.description}</p>
        )} */}
        <button
          className="btn btn-view rounded-pill text-white btn-sm mt-2 w-100 fw-bold shadow-sm"
          style={{ borderRadius: 12 }}
          onClick={(e) => {
            e.stopPropagation();
            onView(cert);
          }}
        >
          View Certificate
        </button>
      </div>
    </div>
  );
};

export default CertificateCard;

