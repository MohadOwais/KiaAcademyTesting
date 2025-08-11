"use client";

import "./main.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiSchoolLine } from "react-icons/ri"; // Changed icon to represent institutes

const InstituteBanner = () => {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState<string>("");

    return (
        <div
            className="position-relative overflow-hidden mt-1 mx-4 rounded-4"
        >
            {/* Background Video */}
            <video
                autoPlay
                muted
                loop
                className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
                style={{ zIndex: 0 }}
            >
                <source src="/videos/banner-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Content */}
            <div
                className="position-relative z-1 d-flex flex-column justify-content-center align-items-center text-center px-3"
                style={{ minHeight: "50vh", background: "rgba(0, 0, 0, 0.5)" }}
            >
                <div className="text-white">
                    {/* Heading and icon */}
                    <div className="d-flex flex-column flex-md-row align-items-center gap-3 mb-4">
                        <RiSchoolLine size={60} className="text-white mb-3 mb-md-0" />
                        <h1 className="display-4 fw-bold mb-0">
                            Discover Top Institutes
                        </h1>
                    </div>

                    {/* Subheading */}
                    <p className="lead fw-semibold mb-4">
                        Connect with trusted institutions to elevate your education and skills.
                    </p>

                    {/* Coming Soon Message */}
                    <h3 className="fw-bold text-white bg-dark bg-opacity-75 px-4 py-2 rounded-pill">
                        🚧 Institute Features Coming Soon 🚀
                    </h3>
                </div>
            </div>
        </div>
    );
};

export default InstituteBanner;
