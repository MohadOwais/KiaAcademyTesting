import React, { useState, useEffect } from "react";

interface StickyComponentProps {
  scrollToSection: (sectionId: string) => void;
  activeSection: string;
}

const StickyComponent: React.FC<StickyComponentProps> = ({
  scrollToSection,
  activeSection,
}) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const stickyElement = document.getElementById("stickyElement");
      if (stickyElement) {
        const offsetTop = stickyElement.offsetTop;
        if (window.pageYOffset > offsetTop) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSectionClick = (section: string) => {
    if (scrollToSection) {
      scrollToSection(section);
    }
  };

  return (
    <div
      id="stickyElement"
      style={{
        position: isSticky ? "fixed" : "relative",
        top: isSticky ? "0" : "auto",
        backgroundColor: "white", // Adjust as needed
        width: "100%",
        zIndex: 10,
        boxShadow: isSticky ? "0px 4px 6px rgba(0, 0, 0, 0.1)" : "none", // Optional shadow for sticky effect
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="d-flex align-items-center py-3">
              <span className="me-3 text-secondary">On this page:</span>
              <div className="d-flex">
                <button
                  onClick={() => handleSectionClick("courseContent")}
                  className={`btn px-4 py-2 me-2  ${
                    activeSection === "courseContent"
                      ? "active rounded-pill"
                      : ""
                  }`}
                  style={{
                    backgroundColor:
                      activeSection === "courseContent"
                        ? "#0070f2"
                        : "transparent",
                    color: activeSection === "courseContent" ? "#fff" : "#666",
                    // border:
                    //   activeSection === "courseContent" ? "" : "rounded-pill",
                    // borderRadius: "4px",
                    transition: "all 0.3s ease",
                    fontWeight: 500,
                  }}
                >
                  Course Content
                </button>
                <button
                  onClick={() => handleSectionClick("reviews")}
                  className={`btn px-4 py-2 ${
                    activeSection === "reviews" ? "active rounded-pill" : ""
                  }`}
                  style={{
                    backgroundColor:
                      activeSection === "reviews" ? "#0070f2" : "transparent",
                    color: activeSection === "reviews" ? "#fff" : "#666",
                    // border:
                    //   activeSection === "reviews" ? "none" : "1px solid #ddd",
                    // borderRadius: "4px",
                    transition: "all 0.3s ease",
                    fontWeight: 500,
                  }}
                >
                  Reviews
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyComponent;
