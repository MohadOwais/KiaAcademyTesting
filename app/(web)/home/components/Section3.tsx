"use client"

import "./main.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { authorizationObj, baseUrl, courseThumbnailPath } from "@/app/utils/core";
import defaultCourseImage from "../../../../public/images/banner.jpg"
import { shortenString } from "@/app/utils/functions";
import { useRouter } from "next/navigation";
import Image from 'next/image'
const bricks = [
    {
        title: "Web Development:",
        options: ["HTML, CSS, JavaScript", "Responsive design", "Frameworks (React, Angular)", "Full-stack development"],
        image: "https://plus.unsplash.com/premium_photo-1661288553491-2218d09372be?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Data Science",
        options: ["Python, R, SQL", "Machine learning", "Data visualization", "Statistical analysis"],
        image: "https://plus.unsplash.com/premium_photo-1663050633633-2856e875dcc7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Digital Marketing",
        options: ["SEO, SEM", "Social media strategy", "Email marketing", "Data analytics"],
        image: "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Graphic Design",
        options: ["Adobe tools", "Typography & layout", "Branding & logos", "Portfolio creation"],
        image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1156&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Cybersecurity",
        options: ["Encryption & firewalls", "Ethical hacking", "Threat prevention", "Case studies"],
        image: "https://images.unsplash.com/photo-1681516582806-63e90c9426b7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    {
        title: "Business & Entrepreneurship",
        options: ["Business models", "Marketing & sales", "Financial literacy", "Leadership skills"],
        image: "https://images.unsplash.com/photo-1607706189992-eae578626c86?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
]

const WhiteBrick = ({ image, title, options, description, course_id }: any) => {
    const router = useRouter()
    return (
        <>
            <div className="brick-white"
                onClick={() => router.push(`/current-courses/${course_id}`)}
            >
                <Image src={image} alt="image"
                    onError={(e: any) => e.target.src = defaultCourseImage?.src}
                />
                <div>
                    <h3>{shortenString(title, 22)}</h3>
                    {/* <ul>
                        {options?.map((opt: any, i: number) => <li key={i}>{opt}</li>)}
                    </ul> */}
                    <p>{shortenString(description, 80)}</p>
                </div>
            </div>
        </>
    )

}

const Section3 = () => {

    const [brickOptions, setBrickOptions] = useState<any>([])
    const [firstBricks, set_firstBricks] = useState<any>([])

    useEffect(() => {
        get_courses_data()
    }, [])

    const get_courses_data = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/courses/latest`, authorizationObj)
            const data = resp?.data?.data
            if (data) {
                const processed_data = data?.filter((c: any) => c?.course_status === "approved").map((d: any) => {
                    return {
                        id: d?.course_id,
                        course_id: d?.course_id,
                        title: d?.course_title,
                        image: `${courseThumbnailPath}/${d?.course_thumbnail}`,
                        options: [],
                        description: d?.course_description
                    }
                })
                setBrickOptions(processed_data)
                set_firstBricks(processed_data)
            }
        } catch (error) {
            // console.error(error)
        }
    }

    const containerRef: any = useRef()

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scrollSpeed = 1;
        const direction = 1;

        const scrollInterval = setInterval(() => {
            const maxScroll = container.scrollWidth - container.clientWidth;

            if (container.scrollLeft + 50 >= maxScroll) {
                setBrickOptions((prev: any) => [
                    ...prev,
                    ...firstBricks.map((card: any) => ({
                        ...card,
                        id: `${card.id}-${Date.now()}-${Math.random()}`,
                    })),
                ]);
            }

            container.scrollLeft += direction * scrollSpeed;
        }, 16);

        return () => clearInterval(scrollInterval);
    }, [firstBricks]);

    return (
        <>
            <div className="section-3">
                <h2>Explore New <span>Courses</span></h2>
                <p>
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Doloremque mollitia cupiditate esse quia, consequatur ab minus
                    <br />
                    consectetur temporibus facere, facilis consequuntur, eum ea illo eveniet obcaecati voluptatum earum possimus illum?
                </p>
                <div className="bricks-cont hide-scrollbar" ref={containerRef}>
                    {brickOptions?.map((opt: any) => <WhiteBrick key={opt?.id} title={opt?.title} options={opt?.options} image={opt?.image} description={opt?.description} course_id={opt?.course_id} />)}
                </div>
            </div>
        </>
    )
}

export default Section3;
