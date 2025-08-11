import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl, authorizationObj } from "@/app/utils/core";

interface InstructorDetailsProps {
  instructorId: string;
}

const InstructorDetails: React.FC<InstructorDetailsProps> = ({
  instructorId,
}) => {
  const [instructor, setInstructor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instructorId) return;
    setLoading(true);
    axios
      .get(`${baseUrl}/tutor/${instructorId}`, authorizationObj)
      .then((resp) => {
        if (resp.data && resp.data.data) {
          setInstructor(resp.data.data);
        } else {
          setError("Instructor not found");
        }
      })
      .catch(() => setError("Failed to load instructor details"))
      .finally(() => setLoading(false));
  }, [instructorId]);

  if (loading) return <div>Loading instructor details...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!instructor) return null;

  return (
    <div className="container">
      <div
        className="text-center py-5 bg-gradient1 text-white"
        style={{ borderRadius: "20px" }}
      >
        <h2 className="fw-bold">Meet Your Instructor</h2>
        <p className="mb-4">
          Learn from an industry expert with decades of hands-on experience
        </p>

        <div className="container">
          <div
            className="card mx-auto shadow border-0 rounded-4 p-4"
            style={{ maxWidth: 800 }}
          >
            <div className="row align-items-center">
              {/* Image Column */}
              <div className="col-md-2 text-center mb-4 mb-md-0">
                {instructor.profile_picture ? (
                  <img
                    src={instructor.profile_picture}
                    alt={instructor.first_name}
                    className="rounded-circle shadow"
                    style={{ width: 100, height: 100, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: 100, height: 100, fontSize: 40 }}
                  >
                    <i className="bi bi-person"></i>
                  </div>
                )}
              </div>

              {/* Content Column */}
              <div className="col-md-9 text-center">
                <h4 className="fw-bold mb-1">
                  {instructor.first_name} {instructor.last_name}
                </h4>
                <div className="text-dark-2 fw-semibold mb-2 text-capitalize">
                  {instructor.job_title || "SAP Analytics Cloud Consultant"}
                </div>
                <p className="mb-3 text-capitalize">
                  {instructor.bio ||
                    "Seasoned expert with over 20 years of experience in digital transformation and SAP BI."}
                </p>
                {/* Optional Details Section (Uncomment if needed)
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <div className="p-3 bg-light rounded-3 shadow-sm">
              <div className="text-muted small mb-1">Experience</div>
              <strong>{instructor.experience || "20+ Years"}</strong>
            </div>
            <div className="p-3 bg-success bg-opacity-10 rounded-3 shadow-sm">
              <div className="text-muted small mb-1">Specialization</div>
              <strong>{instructor.expertise || "SAP BI & SAC"}</strong>
            </div>
            <div className="p-3 bg-purple bg-opacity-10 rounded-3 shadow-sm">
              <div className="text-muted small mb-1">Focus</div>
              <strong>{instructor.focus || "Digital Transformation"}</strong>
            </div>
          </div>
          */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetails;
