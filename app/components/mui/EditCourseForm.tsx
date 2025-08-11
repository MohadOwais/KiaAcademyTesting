import "./index.css"
import axios from "axios"
import { useEffect, useRef, useState } from "react"
import { authorizationObj, baseUrl, serverToken } from "../../utils/core"
import { Button, TextField } from "@mui/material"
import AlertMUI from "./AlertMUI"
import { formatString } from "../../utils/functions"
import Image from 'next/image'
const EditCourseForm = ({ id, setOpen, getProducts }: any) => {

    useEffect(() => {
        getProduct(id)
    }, [id])

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [product, setProduct] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState<null | string>(null)
    const [successMessage, setSuccessMessage] = useState<null | string>(null)
    const [exampleObj, setExampleObj] = useState<any>([])
    const [thumbnail, set_thumbnail] = useState<any>(null)
    const [video, set_video] = useState<any>(null)

    const imageRef: any = useRef()
    const videoRef: any = useRef()

    const getProduct = async (id: string) => {

        if (!id || id?.trim() === "") return

        try {
            const resp = await axios.get(`${baseUrl}/courses/${id}`, authorizationObj)
            const productData = resp?.data?.data
            setProduct(productData)
        } catch (error) {
            // console.error(error)
        }
    }

    const editProduct = async (e: any) => {

        e?.preventDefault()
        setErrorMessage(null)
        setSuccessMessage(null)

        if (!id || id?.trim() === "") return

        const excludedKeys = ["course_thumbnail", "course_intro_video", "course_id", "instructor_id", "course_category_id", "course_description", "created_at", "deleted_at", "updated_at", "studnt_id", "review_id", "rating", "comment"];

        const formData = new FormData()
        Object.keys(product).forEach((key) => {
            if (product[key] && !excludedKeys.includes(key)) {
                formData.append(key, product[key])
            }
        });

        if (thumbnail) {
            formData.append("course_thumbnail", thumbnail);
        }
        if (video) {
            formData.append("course_intro_video", video);
        }

        try {
            setIsLoading(true)
            const resp = await axios.put(`${baseUrl}/courses/${id}`, formData, {
                withCredentials: true,
                headers: {
                    Authorization: serverToken,
                    "Content-Type": "multipart/form-data"
                }
            })
            if (resp?.data?.status >= 200 && resp?.data?.status < 300) {
                setSuccessMessage(resp?.data?.message)
            } else {
                setErrorMessage(resp?.data?.message)
                setTimeout(() => {
                    setErrorMessage(null)
                }, 2000)
            }
            setIsLoading(false)
            setOpen(false)
            getProducts()
            setTimeout(() => {
                setSuccessMessage(null)
            }, 3000)

        } catch (error: any) {
            // console.error(error)
            setIsLoading(false)
            setErrorMessage(error?.response?.data?.message)
            setTimeout(() => {
                setErrorMessage(null)
            }, 3000);
        }

    }

    useEffect(() => {
        if (product) {
            const example_data = Object.keys(product)
            const stringsToRemove =
                ["course_thumbnail", "course_intro_video", "course_id", "instructor_id", "course_category_id", "course_description", "created_at", "deleted_at", "updated_at", "studnt_id", "review_id", "rating", "comment"]
            const updatedStrs = example_data?.filter((item: any) => !stringsToRemove.includes(item))
            setExampleObj(updatedStrs)
        }
    }, [product])

    useEffect(() => {
        setProduct({ ...product, course_thumbnail: thumbnail, course_intro_video: video })
    }, [thumbnail, video])

    return (
        <>
            {errorMessage && <AlertMUI status="error" text={errorMessage} />}
            {successMessage && <AlertMUI status="success" text={successMessage} />}
            <form onSubmit={editProduct} className="editForm">
                <div className="cont">
                    <>
                        <input type="file" hidden id="image" accept="image/*"
                            onChange={(e: any) => set_thumbnail(e?.target?.files[0])}
                            ref={imageRef}
                        />
                        <input type="file" hidden id="video" accept="video/*"
                            onChange={(e: any) => set_video(e?.target?.files[0])}
                            ref={videoRef}
                        />
                        <Image src={thumbnail ? URL.createObjectURL(thumbnail) : product?.imageUrl} style={{
                            width: "100px",
                            height: "100px",
                            objectFit: "cover",
                            objectPosition: "center",
                            borderRadius: "12px",
                            cursor: "pointer",
                            background: "#353535"
                        }} alt="Course Thumbnail Preview" onClick={() => {
                            if (imageRef.current) {
                                imageRef.current.click()
                            }
                        }} />
                    </>
                    <video muted src={video ? URL.createObjectURL(video) : product?.video} className="bg-black mt-4  rounded-lg cursor-pointer"
                        onClick={() => {
                            if (videoRef.current) {
                                videoRef.current.click()
                            }
                        }}
                    ></video>
                </div>
                <div className="w-full h-full flex justify-start items-start gap-4 flex-wrap">
                    {console.log("exampleObj", exampleObj)}
                    {
                        exampleObj?.map((key: string, i: number) => (
                            <TextField key={i} id={`outlined-basic-${i}`} label={formatString(key)}
                                variant="outlined" fullWidth defaultValue={product[key]}
                                onChange={(e: any) => {
                                    setProduct({ ...product, [key]: e?.target?.value })
                                }}
                            />
                        ))
                    }
                </div>
                <div style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                }}>
                    <Button type="submit" disabled={isLoading} color="primary" variant="contained"
                        sx={{ width: "12em", fontSize: "1em" }}
                    >Update</Button>
                </div>
            </form>
        </>
    )
}

export default EditCourseForm