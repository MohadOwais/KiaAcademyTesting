"use client"

import { useRouter } from "next/navigation"
import image from "../../../../public/images/section-7.avif"
import Image from "next/image"
import { Button } from "@mui/material"
import { useSelector } from "react-redux"

const Section7 = () => {
    const router = useRouter()
    const currentUser = useSelector((state: any) => state.currentUser)
    const { isLogin } = currentUser || {}

    return (
        <section className="py-5 py-md-7 bg-light">
            <div className="container-fluid">
                <div className="row align-items-center g-5">
                    {/* Content Column - Appears first on mobile */}
                    <div className="col-12 col-lg-6 order-2 order-lg-1">
                        <div className="pe-lg-4">
                            <h1 className="display-4 fw-bold mb-4 heading-style">
                                Empower your journey with KI Academy's insights
                            </h1>
                            <p className="lead text-secondary mb-4">
                                Join KI Academy to unlock a world of educational possibilities. Our platform connects institutions 
                                with passionate learners, providing cutting-edge tools and resources for seamless online learning. 
                                Experience the future of education with our comprehensive learning management system.
                            </p>
                            {!isLogin && (
                                <Button
                                    onClick={() => router.push("/institution/registration")}
                                    color="secondary"
                                    variant="contained"
                                    className="px-5 py-2 btn-view text-white rounded-pill"
                                    size="large"
                                >
                                    Register as Institution
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Image Column - Appears second on mobile */}
                    <div className="col-12 col-lg-6 order-1 order-lg-2">
                        <div className="position-relative" style={{ height: '500px' }}>
                            <Image
                                src={image}
                                alt="KI Academy Insights"
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
                                className="shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Section7
