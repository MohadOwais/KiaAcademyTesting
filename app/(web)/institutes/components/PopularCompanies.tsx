"use client";

import "./main.css";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { authorizationObj, baseUrl } from "@/app/utils/core";
import Image from 'next/image'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Button } from "@mui/material";

const instituteLogoPath = "https://api.kiacademy.in/uploads/institute_logo";
const PLACEHOLDER = "https://via.placeholder.com/400x200?text=No+Image";

const PopularCompanies = () => {
    const router = useRouter();
    const [companies, setCompanies] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    useEffect(() => {
        getCompanies();
    }, []);

    const getCompanies = async () => {
        setIsLoading(true);
        try {
            const resp = await axios.get(`${baseUrl}/users/institutes`, authorizationObj);
            if (resp?.data?.data) {
                setCompanies(resp.data.data.filter((i: any) => i.institute_type?.toLowerCase() === "company").slice(0, 12));
            }
        } catch (error) {
            console.error("Error fetching companies:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalPages = Math.ceil(companies.length / 4);
    const canGoNext = currentPage < totalPages - 1;
    const canGoPrev = currentPage > 0;

    const handlePrevPage = () => {
        if (canGoPrev) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (canGoNext) setCurrentPage(prev => prev + 1);
    };

    const currentCompanies = companies.slice(currentPage * 4, (currentPage + 1) * 4);

    return (
        <section className="py-5">
            <div className="container-fluid" style={{ maxWidth: '1800px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                        <div style={{ width: '5px', height: '38px', background: '#df1278', borderRadius: '4px', marginRight: '16px' }}></div>
                        <h2 className="mb-0 heading-style">Popular Companies</h2>
                    </div>
                    <div className="slider-controls">
                        <Button
                            onClick={() => router.push("/companies")}
                            className="btn rounded-pill px-4 py-2 btn-view text-white"
                            color="secondary"
                            variant="contained"
                        >
                            Browse Companies
                        </Button>
                        <button
                            className={`btn btn-light rounded-circle py-2 px-2 shadow-sm ${!canGoPrev && 'opacity-50'}`}
                            onClick={handlePrevPage}
                            disabled={!canGoPrev}
                        >
                            <IoIosArrowBack />
                        </button>
                        <button
                            className={`btn btn-light rounded-circle py-2 px-2 shadow-sm ms-2 ${!canGoNext && 'opacity-50'}`}
                            onClick={handleNextPage}
                            disabled={!canGoNext}
                        >
                            <IoIosArrowForward />
                        </button>
                    </div>
                </div>
                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <div className="companies-container">
                        <div className="row g-4">
                            {currentCompanies.map((inst: any) => (
                                <div key={inst.institute_id} className="col-md-3">
                                    <div
                                        className="card h-100 border-1 border-primary rounded-4 border-opacity-10 shadow-md d-flex flex-column p-3"
                                        onClick={() => router.push(`/companies/${inst.institute_id}`)}
                                    >
                                        <div className="position-relative" style={{ height: '200px' }}>
                                            <Image
                                                src={
                                                    inst.profile_picture
                                                        ? `${instituteLogoPath}/${inst.profile_picture}`
                                                        : PLACEHOLDER
                                                }
                                                alt={inst.institute_name}
                                                fill
                                                className="card-img-top rounded-4"
                                                style={{ objectFit: 'cover' }}
                                                sizes="(max-width: 768px) 100vw, 33vw"
                                                priority
                                            />
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    top: 10,
                                                    right: 10,
                                                    background: "#df1278",
                                                    color: "#fff",
                                                    padding: "3px 12px",
                                                    borderRadius: "16px",
                                                    fontSize: "0.93rem",
                                                    fontWeight: 500
                                                }}
                                            >
                                                Company
                                            </span>
                                        </div>
                                        <div className="card-body pt-3 pb-0 d-flex flex-column">
                                            <h5 className="card-title">
                                                {inst.institute_name}
                                            </h5>
                                            <div className="mt-2 text-secondary" style={{ fontSize: "0.98rem" }}>
                                                {inst.address}
                                            </div>
                                            <div className="mt-auto text-muted" style={{ fontSize: "0.85rem" }}>
                                                {inst.contact_number}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PopularCompanies;