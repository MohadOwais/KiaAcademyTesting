'use client';

export default function CourseContent() {
  return (
    <div className="p-4">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><a href="#">Browse</a></li>
          <li className="breadcrumb-item"><a href="#">Learning Journeys</a></li>
          <li className="breadcrumb-item"><a href="#">Exploring SAP Risk Management</a></li>
          <li className="breadcrumb-item active" aria-current="page">
            Describing SAP&apos;s Enterprise Governance, Risk, and Compliance (GRC) solutions
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <div className="content-section">
        <h1 className="display-6 mb-4">
          Describing SAP&apos;s Enterprise Governance, Risk, and Compliance (GRC) solutions in the context of the Three Lines of Defense (3 LoD) approach
        </h1>

        {/* Objective Section */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3 mb-3">
              <i className="bi bi-bullseye fs-4 text-success"></i>
              <h5 className="card-title mb-0">Objective</h5>
            </div>
            <p className="card-text">
              After completing this lesson, you will be able to describe SAP&apos;s Enterprise Governance, Risk, and Compliance (GRC)
              solutions in the context of the Three Lines of Defense (3 LoD) approach.
            </p>
          </div>
        </div>

        {/* Why Are the Three Lines of Defense Important? */}
        <section className="mb-4">
          <h2>Why Are the Three Lines of Defense (3LoD) Important?</h2>
          <p className="lead">
            The current economic environment and significant risk events over the last few years have caused companies to have a
            renewed focus on the effectiveness of risk management. Many companies now feel overwhelmed with the amount of risk
            management activity and have failed to reap the benefits of the investment in risk management.
          </p>
        </section>

        {/* Three Line of Defense and SAP GRC Solutions */}
        <section className="mb-4">
          <h2>Three Line of Defense and SAP GRC Solutions</h2>
          <p>
            In the context of the Three Lines of Defense (3 LoD) approach, SAP&apos;s Enterprise Governance, Risk, and Compliance (GRC)
            solutions play a crucial role in enabling organizations to effectively manage risks, ensure compliance, and strengthen
            governance practices across the enterprise.
          </p>
        </section>

        {/* Governance Body Diagram */}
        <div className="card bg-primary text-white p-3 mb-4">
          <h3 className="text-center">Governance Body</h3>
          {/* Add more diagram elements here */}
        </div>
      </div>
    </div>
  );
} 