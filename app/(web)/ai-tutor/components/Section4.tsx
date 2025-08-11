"use client"

import "./main.css";
import { useRouter } from "next/navigation";
import { MdFileDownloadDone } from "react-icons/md";
import Image from "next/image";
import instructorImage from "../../../../public/images/banner.jpg";
import 'bootstrap-icons/font/bootstrap-icons.css'


const FeatureCard = ({ text }: { text: string }) => {
    return (
        <div className="feature-card bg-white rounded-4 p-2 shadow-sm mb-1  border-4">
            <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3">
                    <MdFileDownloadDone className="fs-4" />
                </div>
                <p className="mb-0 text-muted">{text}</p>
            </div>
        </div>
    )
}

const Section4 = () => {
    const router = useRouter()

    const features = [
        "Full time access to all course materials and resources",
        "20+ downloadable resources and practical exercises",
        "Certificate of completion recognized by industry experts",
        "Free 7-day trial to explore our platform"
    ]

    return (
        <div className="container-fluid py-5 bg-light">
            <div className="row g-5 align-items-center">
            <div className="col-lg-6">
                    <div className="px-4"> 
                        <div className="d-flex align-items-center mb-4">
                            <span className="bg-primary bg-opacity-10 px-3 py-2 rounded-pill fw-bold me-3 heading-style" style={{fontSize: '1.5rem'}}>
                                Learn from the Best
                            </span>
                        </div>
                        <h2 className="fw-bold mb-4 heading-style">We have the best instructors available in the city</h2>
                        <p className="lead text-muted mb-2">
                            At KI Academy, we pride ourselves on having the best instructors in the city, each bringing a wealth of knowledge and real-world experience to the classroom. Our expert educators are dedicated to providing personalized guidance and support, ensuring that you receive the highest quality education.
                        </p>
                        <div className="row g-4">
                            {features.map((feature, i) => (
                                <div key={i} className="col-12">
                                    <FeatureCard text={feature} />
                                </div>
                            ))}
                        </div>
                        <button 
                            className="btn btn-lg rounded-pill px-4 mt-4 text-white btn-view"
                            onClick={() => router.push("/auth")}
                        >
                            Get Started Today
                        </button>
                    </div>
                </div>
                <div className="col-lg-6">
                    <div className="position-relative px-4">
                        <div className="position-absolute top-0 start-0 w-75 h-75"></div>
                        <Image 
                            src={instructorImage}
                            alt="Expert Instructors"
                            width={800}
                            height={600}
                            className="img-fluid rounded-4 shadow position-relative"
                            style={{objectFit: 'cover'}}
                        />
                        <div className="position-absolute bottom-0 end-0 bg-white p-4 rounded-4 shadow-lg" style={{maxWidth: '300px'}}>
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-2 me-3 heading-style" style={{borderRadius: '50%'}}>
                                    <i className="bi-award fs-5"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1">100+</h5>
                                    <p className="text-muted mb-0">Expert Instructors</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

              
            </div>
        </div>
    )
}

export default Section4;
