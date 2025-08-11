"use client"

import "./main.css"
// import brainImage from "../../../../public/images/section-6-brain.png"
import mainImage from "../../../../public/images/section-6-main.jpeg"
import Image from "next/image"
import 'bootstrap-icons/font/bootstrap-icons.css'


const List = ({ title, text }: any) => {
    return (
        <div className="feature-card bg-white rounded-4 p-2 shadow-sm border-4">
            <h4 className="fw-bold mb-2 heading-style">{title}</h4>
            <p className="text-muted mb-0">{text}</p>
        </div>
    )
}

const Section6 = () => {
    const section_6_Data = [
        {
            title: "Learn by Doing",
            text: "Get hands-on experience with real projects and interactive exercises designed to reinforce your learning."
        },
        {
            title: "Expert Guidance",
            text: "Learn from industry professionals who bring years of practical experience to your educational journey."
        },
        {
            title: "Career Growth",
            text: "Develop in-demand skills that employers are looking for and take your career to the next level."
        },
    ]

    return (
        <div className="container-fluid py-5 bg-light">
            <div className="row g-5 align-items-center">
                <div className="col-lg-6">
                    <div className="position-relative px-4">
                        <div className="position-absolute top-0 start-0 w-75 h-75"></div>
                        <Image 
                            src={mainImage} 
                            alt="Learning illustration" 
                            width={800}
                            height={600}
                            className="img-fluid rounded-4 shadow position-relative"
                            style={{objectFit: 'cover'}}
                        />
                        <div className="position-absolute bottom-0 end-0 bg-white p-4 rounded-4 shadow-lg" style={{maxWidth: '300px'}}>
                            <div className="d-flex align-items-center">
                                <div className="bg-primary bg-opacity-10 p-2 me-3 heading-style" style={{borderRadius: '50%'}}>
                                    <i className="bi bi-mortarboard fs-5"></i>
                                </div>
                                <div>
                                    <h5 className="fw-bold mb-1 heading-style">1000+</h5>
                                    <p className="text-muted mb-0">Successful Students</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-6">
                    <div className="px-4">
                        <div className="d-flex align-items-center mb-4">
                            <span className="bg-primary bg-opacity-10 px-3 py-2 rounded-pill fw-bold me-3 heading-style" style={{fontSize: '1.5rem'}}>
                                Transform Your Future
                            </span>
                        </div>
                        <p className="lead text-muted mb-2">
                            Unlock your potential with our cutting-edge courses designed to give you the skills needed in today&apos;s digital world. Join a community of learners and start your journey to success.
                        </p>
                        <div className="row g-4">
                            {section_6_Data?.map((data: any, i: number) => (
                                <div key={i} className="col-12">
                                    <List title={data?.title} text={data?.text} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Section6