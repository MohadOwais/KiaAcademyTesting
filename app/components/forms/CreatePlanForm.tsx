import React, { FormEvent, Fragment, useState } from 'react'
import AlertMUI from '../mui/AlertMUI'
import axios from 'axios'
import { authorizationObj, baseUrl, subscription_plans_medium_singular } from '@/app/utils/core'
import { capitalizeString } from '@/app/utils/functions'

const CreatePlanForm = ({ set_show_plan_modal, get_plans, showToast }: any) => {

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
            if (showToast) showToast.error("Plan name is required");
            else set_error_message("Plan name is required");
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!plan_description) {
            if (showToast) showToast.error("Plan description is required");
            else set_error_message("Plan description is required");
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!plan_duration) {
            if (showToast) showToast.error("Plan duration is required");
            else set_error_message("Plan duration is required");
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!plan_medium) {
            if (showToast) showToast.error("Plan medium is required");
            else set_error_message("Plan medium is required");
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!tutors_allowed) {
            if (showToast) showToast.error("Allowed tutors are required");
            else set_error_message("Allowed tutors are required");
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!courses_allowed) {
            if (showToast) showToast.error("Allowed courses are required");
            else set_error_message("Allowed courses are required");
            setTimeout(() => set_error_message(""), 3000);
            return
        }
        if (!storage_allowed) {
            if (showToast) showToast.error("Allowed storage is required");
            else set_error_message("Allowed storage is required");
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
// console.log("Form Data: ", formData)
        try {
            set_is_loading(true)
            const resp = await axios.post(`${baseUrl}/subscription-plans/create`, formData, authorizationObj)
            set_is_loading(false)
            // console.log("Response: ", resp)
            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                if (showToast) showToast.error(resp?.data?.message);
                else set_error_message(resp?.data?.message);
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
            if (showToast) showToast.success("Plan added successfully");
            else set_success_message("Plan added successfully");
            setTimeout(() => set_success_message(""), 3000);
            get_plans()
            set_show_plan_modal(false)

        } catch (error) {
            // console.error(error)
            set_is_loading(false)
            if (showToast) showToast.error("Something went wrong, please try later");
            else set_error_message("Something went wrong, please try later");
            setTimeout(() => set_error_message(""), 3000);
        }

    }

    return (
        <Fragment>
            {error_message && <AlertMUI text={error_message} status="error" />}
            {success_message && <AlertMUI text={success_message} status="success" />}
            <form className="w-100" onSubmit={createPlan}>
                <div className="mb-3">
                    <label className="form-label">Plan Name</label>
                    <input
                        type="text"
                        className="form-control"
                        value={plan_name}
                        onChange={e => set_plan_name(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Plan Description</label>
                    <textarea
                        className="form-control"
                        value={plan_description}
                        onChange={e => set_plan_description(e.target.value)}
                        required
                    />
                </div>
                <div className="row">
                    <div className="col-12 col-md-4 mb-3">
                        <label className="form-label">Plan Price In USD</label>
                        <input
                            type="number"
                            className="form-control"
                            value={plan_price}
                            onChange={e => set_plan_price(Number(e.target.value))}
                            required
                        />
                    </div>
                    <div className="col-12 col-md-4 mb-3">
                        <label className="form-label">Duration</label>
                        <input
                            type="number"
                            className="form-control"
                            value={plan_duration}
                            onChange={e => set_plan_duration(Number(e.target.value))}
                            required
                        />
                    </div>
                    <div className="col-12 col-md-4 mb-3">
                        <label className="form-label">Plan Medium</label>
                        <select
                            className="form-select"
                            value={plan_medium}
                            onChange={e => set_plan_medium(e.target.value)}
                            required
                        >
                            <option value="">Select Medium</option>
                            {subscription_plans_medium_singular.map((medium: string) => (
                                <option key={medium} value={medium.toLowerCase()}>{capitalizeString(medium)}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-md-4 mb-3">
                        <label className="form-label">Tutors Allowed</label>
                        <input
                            type="number"
                            className="form-control"
                            value={tutors_allowed}
                            onChange={e => set_tutors_allowed(Number(e.target.value))}
                            required
                        />
                    </div>
                    <div className="col-12 col-md-4 mb-3">
                        <label className="form-label">Courses Allowed</label>
                        <input
                            type="number"
                            className="form-control"
                            value={courses_allowed}
                            onChange={e => set_courses_allowed(Number(e.target.value))}
                            required
                        />
                    </div>
                    <div className="col-12 col-md-4 mb-3">
                        <label className="form-label">Storage Allowed In GBs</label>
                        <input
                            type="number"
                            className="form-control"
                            value={storage_allowed}
                            onChange={e => set_storage_allowed(Number(e.target.value))}
                            required
                        />
                    </div>
                </div>
                <button
                    className="btn btn-secondary w-100"
                    type="submit"
                    disabled={is_loading}
                >
                    {is_loading ? 'Creating...' : 'Create Plan'}
                </button>
            </form>
        </Fragment>
    )
}

export default CreatePlanForm