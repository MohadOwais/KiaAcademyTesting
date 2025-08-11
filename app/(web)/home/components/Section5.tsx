"use client"

import { useRouter } from "next/navigation"
import image from "../../../../public/images/section-5.avif"
import Image from "next/image"
import { Button } from "@mui/material"
import { useSelector } from "react-redux"

const Section5 = () => {
    const router = useRouter()
    const currentUser = useSelector((state: any) => state.currentUser)
    const { isLogin } = currentUser || {}

    return (
        <section className="py-5 py-md-7">
            <div className="container-fluid">
                <div className="row align-items-center g-5">
                    {/* Image Column - Stays first on all devices */}
                    <div className="col-12 col-lg-6">
                        <div className="position-relative" style={{ height: '500px' }}>
                            <Image
                                src={image}
                                alt="KI Academy Expertise"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                                style={{
                                    objectFit: 'cover',
                                    objectPosition: 'center',
                                    borderRadius: '12px'
                                }}
                                loading="lazy"
                                quality={75}
                                placeholder="blur"
                                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPjA+OjU1RUVHSkdKTEtMTEY2RjlKSkf/2wBDAR"
                                className="shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Content Column */}
                    <div className="col-12 col-lg-6">
                        <div className="ps-lg-4">
                            <h1 className="display-4 fw-bold mb-4 heading-style">
                                Discover world of KI Academy expertise
                            </h1>
                            <p className="lead text-secondary mb-4">
                                Discover a world of knowledge and growth with KI Academy. Our platform is dedicated 
                                to empowering learners with cutting-edge skills and in-depth expertise across various fields. 
                                Whether you&apos;re advancing in your career or starting fresh, our courses are designed to inspire, 
                                challenge, and transform your abilities. Join us and unlock your potential with comprehensive 
                                learning experiences tailored just for you!
                            </p>
                            {!isLogin && (
                                <Button
                                    onClick={() => router.push("/auth")}
                                    color="secondary"
                                    variant="contained"
                                    className="px-5 py-2 btn-view text-white rounded-pill"
                                    size="large"
                                >
                                    Get Enrolled Today
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Section5
