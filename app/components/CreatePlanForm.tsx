import { Autocomplete, TextField } from '@mui/material'
import { Button } from '@mui/material'
import React, { FormEvent, Fragment, useState } from 'react'
import AlertMUI from './mui/AlertMUI'
import axios from 'axios'
import { authorizationObj, baseUrl, subscription_plans_medium_singular } from '@/app/utils/core'
import { capitalizeString } from '@/app/utils/functions'

const CreatePlanForm = ({ set_show_plan_modal, get_plans }: any) => {

    const [plan_name, set_plan_name] = useState("")
    const [plan_description, set_plan_description] = useState("")
    const [plan_price, set_plan_price] = useState(0)
    const [plan_medium, set_plan_medium] = useState("")
    const [plan_duration, set_plan_duration] = useState(0)
    const [tutors_allowed, set_tutors_allowed] = useState(0)
    const [courses_allowed, set_courses_allowed] = useState(0)
    const [storage_allowed, set_storage_allowed] = useState(0)

    const [is_loading, set_is_loading] = useState(false)
    const [error_message, set_error_message] = useState("")
    const [success_message, set_success_message] = useState("")

    const createPlan = async (e: FormEvent) => {
        e.preventDefault()
        if (!plan_name) {
            set_error_message("Plan name is required")
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!plan_description) {
            set_error_message("Plan description is required")
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!plan_duration) {
            set_error_message("Plan duration is required")
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!plan_medium) {
            set_error_message("Plan medium is required")
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!tutors_allowed) {
            set_error_message("Allowed tutors are required")
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!courses_allowed) {
            set_error_message("Allowed courses are required")
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!storage_allowed) {
            set_error_message("Allowed storage is required")
            setTimeout(() => set_error_message(""), 3000);
            return
        }

        const formData = new FormData()
        formData.append("plan_name", plan_name)
        formData.append("plan_description", plan_description)
        formData.append("plan_price", plan_price.toString())
        formData.append("plan_medium", plan_medium)
        formData.append("plan_duration", plan_duration.toString())
        formData.append("tutors_allowed", tutors_allowed.toString())
        formData.append("courses_allowed", courses_allowed.toString())
        formData.append("storage_allowed", storage_allowed.toString())

        try {
            set_is_loading(true)
            const resp = await axios.post(`${baseUrl}/subscription-plans/create`, formData, authorizationObj)
            set_is_loading(false)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                set_error_message(resp?.data?.message)
                setTimeout(() => set_error_message(""), 3000);
                return
            }
            set_plan_name("")
            set_plan_description("")
            set_plan_price(0)
            set_plan_medium("")
            set_plan_duration(0)
            set_tutors_allowed(0)
            set_courses_allowed(0)
            set_storage_allowed(0)
            set_success_message("Plan added successfully")
            setTimeout(() => set_success_message(""), 3000);
            get_plans()
            set_show_plan_modal(false)

        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            set_error_message("Something went wrong, please try later")
            setTimeout(() => set_error_message(""), 3000);
        }

    }

    return (
        <Fragment>
            {error_message && <AlertMUI text={error_message} status="error" />}
            {success_message && <AlertMUI text={success_message} status="success" />}
            <form className='w-full flex flex-col justify-start items-start gap-4'
                onSubmit={createPlan}
            >
                <TextField
                    label="Plan Name"
                    value={plan_name}
                    onChange={(e: any) => set_plan_name(e.target.value)}
                    fullWidth
                />

                <TextField
                    label="Plan Description"
                    value={plan_description}
                    onChange={(e: any) => set_plan_description(e.target.value)}
                    fullWidth
                />

                <TextField
                    label="Plan Price In USD"
                    type="number"
                    value={plan_price}
                    onChange={(e: any) => set_plan_price(e.target.value)}
                    fullWidth
                />

                <TextField
                    label="Duration"
                    type='number'
                    value={plan_duration}
                    onChange={(e: any) => set_plan_duration(e.target.value)}
                    fullWidth
                />

                <Autocomplete
                    disablePortal
                    options={subscription_plans_medium_singular}
                    value={capitalizeString(plan_medium)}
                    sx={{ marginBottom: 1 }}
                    fullWidth
                    onChange={(e, val: any) => set_plan_medium(val?.toLowerCase())}
                    renderInput={(params) => <TextField {...params} label="Plan Medium" />}
                />

                <TextField
                    label="Tutors Allowed"
                    type='number'
                    value={tutors_allowed}
                    onChange={(e: any) => set_tutors_allowed(e.target.value)}
                    fullWidth
                />

                <TextField
                    label="Courses Allowed"
                    type='number'
                    value={courses_allowed}
                    onChange={(e: any) => set_courses_allowed(e.target.value)}
                    fullWidth
                />

                <TextField
                    label="Storage Allowed In GBs"
                    type='number'
                    value={storage_allowed}
                    onChange={(e: any) => set_storage_allowed(e.target.value)}
                    fullWidth
                />

                <Button
                    color='secondary'
                    variant='contained'
                    type='submit'
                    disabled={is_loading}
                    fullWidth
                >
                    Create Plan
                </Button>
            </form>
        </Fragment>
    )
}

export default CreatePlanForm