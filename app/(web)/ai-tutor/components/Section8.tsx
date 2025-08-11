"use client"

import "./main.css";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { authorizationObj, baseUrl, courseThumbnailPath } from "@/app/utils/core";
import defaultCourseImage from "../../../../public/images/banner.jpg"
import { shortenString } from "@/app/utils/functions"
import { useSelector } from "react-redux";
import Image from 'next/image'

const Card = ({ title, text, image, id, course_id }: any) => {

    const router = useRouter()

    return (
        <>
            <div className="card">
                <Image src={image} alt="image"
                    onError={(e: any) => e.target.src = defaultCourseImage?.src}
                />
                <div>
                    <h3>{shortenString(title, 15)}</h3>
                    <p className="h-[72px]">{shortenString(text, 80)}</p>
                    <Button
                        variant="contained" color="secondary"
                        style={{ width: "100%", marginTop: "1em", marginBottom: "1em", color: "#fff" }}
                        onClick={() => router.push(`/current-courses/${course_id}`)}
                    >Learn more...</Button>
                </div>
            </div>
        </>
    )
}

const Section2 = () => {

    const router = useRouter()
    const currentUser = useSelector((state: any) => state?.user)

    const [cardOptions, setCardOptions] = useState<any>([])
    const [firstCards, set_firstCards] = useState([])

    useEffect(() => { get_courses_data() }, [])

    const get_courses_data = async () => {
        try {
            const resp = await axios.get(`${baseUrl}/courses/recomended/${currentUser?.user_id}`, authorizationObj)
            const data = resp?.data?.data
            if (data) {
                const processed_data = data?.filter((c: any) => c?.course_status === "approved").map((d: any) => {
                    return {
                        id: d?.course_id,
                        course_id: d?.course_id,
                        image: `${courseThumbnailPath}/${d?.course_thumbnail}`,
                        title: shortenString(d?.course_title, 13),
                        text: shortenString(d?.course_description, 70),
                    }
                })
                setCardOptions(processed_data)
                set_firstCards(processed_data)
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
                setCardOptions((prev: any) => [
                    ...prev,
                    ...firstCards.map((card: any) => ({
                        ...card,
                        id: `${card.id}-${Date.now()}-${Math.random()}`,
                    })),
                ]);
            }

            container.scrollLeft += direction * scrollSpeed;
        }, 16);

        return () => clearInterval(scrollInterval);
    }, [firstCards]);

    return (
        <>
            <div className="section-2">
                <h2>Recommended for you</h2>
                <div className="cards-cont hide-scrollbar"
                    ref={containerRef}
                >
                    {cardOptions?.map((option: any) => <Card key={option?.id} title={option?.title} text={option?.text} image={option?.image} id={option?.id} course_id={option?.course_id} />)}
                </div>
                <div className="button-end">
                    <Button color="primary" variant="contained" style={{ color: "#fff", paddingLeft: "4em", paddingRight: "4em" }}
                        onClick={() => router.push("/current-courses")}
                    >View all courses</Button>
                </div>
            </div>
        </>
    )
}

export default Section2;
