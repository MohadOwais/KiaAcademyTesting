import "./index.css"
import axios from "axios"
import { useEffect, useState } from "react"
import { authorizationObj, baseUrl, serverToken } from "../../utils/core"
import { Button, TextField } from "@mui/material"
import AlertMUI from "./AlertMUI"
import { formatString } from "../../utils/functions"

const EditStudentForm = ({ id, setOpen, getProducts }: any) => {

    useEffect(() => {
        getProduct(id)
    }, [id])

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [product, setProduct] = useState<any>(null)
    const [errorMessage, setErrorMessage] = useState<null | string>(null)
    const [successMessage, setSuccessMessage] = useState<null | string>(null)
    const [exampleObj, setExampleObj] = useState<any>([])

    const getProduct = async (id: string) => {

        if (!id || id?.trim() === "") return

        try {
            const resp = await axios.get(`${baseUrl}/students/${id}`, authorizationObj)
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

        const excludedKeys = ["student_id", "user_id", "updated_at", "deleted_at"]
        const formData = new FormData()
        Object.keys(product).forEach((key) => {
            if (product[key] && !excludedKeys.includes(key)) {
                formData.append(key, product[key])
            }
        });

        try {
            setIsLoading(true)
            const resp = await axios.put(`${baseUrl}/students/update/${id}`, formData, {
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
                ["student_id", "user_id", "updated_at", "deleted_at"]
            const updatedStrs = example_data?.filter((item: any) => !stringsToRemove.includes(item))
            setExampleObj(updatedStrs)
        }
    }, [product])

    return (
        <>
            {errorMessage && <AlertMUI status="error" text={errorMessage} />}
            {successMessage && <AlertMUI status="success" text={successMessage} />}
            <form onSubmit={editProduct} className="editForm">
                <div className="w-full h-full flex justify-start items-start gap-4 flex-wrap">
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

export default EditStudentForm