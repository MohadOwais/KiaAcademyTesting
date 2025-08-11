'use client';
import Link from 'next/link';

export default function CourseNavigation() {
  return (
    <div className="p-3">
      {/* Course Title Section */}
      <div className="mb-4">
        <h5 className="fw-bold">Introducing the Enterprise Risk and Compliance</h5>
      </div>

      {/* Navigation List */}
      <div className="list-group list-group-flush">
        <Link 
          href="#"
          className="list-group-item list-group-item-action active d-flex align-items-center gap-2"
        >
          <i className="bi bi-book"></i>
          <div>
            <div>Describing SAP&apos;s Enterprise Governance, Risk, and Compliance (GRC) solutions</div>
            <small className="text-muted">30 mins</small>
          </div>
        </Link>

        <Link 
          href="#"
          className="list-group-item list-group-item-action d-flex align-items-center gap-2"
        >
          <i className="bi bi-journal-text"></i>
          <div>
            <div>Introducing the Enterprise Risk Management Program</div>
            <small className="text-muted">10 mins</small>
          </div>
        </Link>

        <Link 
          href="#"
          className="list-group-item list-group-item-action d-flex align-items-center gap-2"
        >
          <i className="bi bi-shield-check"></i>
          <div>
            <div>Exploring the Key Capabilities of SAP Risk Management</div>
            <small className="text-muted">10 mins</small>
          </div>
        </Link>

        <Link 
          href="#"
          className="list-group-item list-group-item-action d-flex align-items-center gap-2"
        >
          <i className="bi bi-question-circle"></i>
          <div>Quiz</div>
        </Link>
      </div>

      {/* Collapsed Sections */}
      <div className="accordion mt-3" id="courseAccordion">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#section1"
            >
              Explaining Risk Planning
            </button>
          </h2>
          <div id="section1" className="accordion-collapse collapse" data-bs-parent="#courseAccordion">
            <div className="accordion-body">
              {/* Add subsections here */}
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#section2"
            >
              Understanding Risk Identification
            </button>
          </h2>
          <div id="section2" className="accordion-collapse collapse" data-bs-parent="#courseAccordion">
            <div className="accordion-body">
              {/* Add subsections here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 