import { get_plan_medium } from '@/app/(admin)/admin/plans/Main'
import { capitalizeString } from '@/app/utils/functions'
import React from 'react'
import { IoMdCalendar, IoMdPerson, IoMdPricetag, IoMdTime, IoMdInformationCircle } from 'react-icons/io'
import moment from 'moment'

const InfoCard = ({ title, value, icon: Icon, className = '' }: any) => {
    return (
        <div className={`bg-white rounded-lg shadow-sm p-3 ${className}`}>
            <div className="flex items-center gap-2 mb-1">
                <div className="bg-primary bg-opacity-10 p-2 rounded-full">
                    <Icon className="text-primary text-lg" />
                </div>
                <h6 className="text-gray-600 font-medium mb-0 text-sm">{title}</h6>
            </div>
            <p className="text-gray-800 font-semibold text-base">{value}</p>
        </div>
    )
}

const ViewSubscription = ({ data }: any) => {
    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'bg-success bg-opacity-10 text-success'
            case 'expired':
                return 'bg-danger bg-opacity-10 text-danger'
            case 'pending':
                return 'bg-warning bg-opacity-10 text-warning'
            default:
                return 'bg-secondary bg-opacity-10 text-secondary'
        }
    }

    return (
        <div className="row g-4">
            {/* Left Column */}
            <div className="col-md-6">
                {/* Header Section */}
                <div className="bg-opacity-5 rounded-lg p-3 mb-3">
                    <h4 className="text-primary fw-bold mb-1 h5">{data?.plan_name}</h4>
                    <p className="text-gray-600 small">{data?.plan_description}</p>
                </div>

                {/* Status Badge */}
                <div className="mb-3">
                    <span className={`px-3 py-1 rounded-pill fw-900 ${getStatusColor(data?.status)}`}>
                        {capitalizeString(data?.status)}
                    </span>
                </div>

                {/* Main Info */}
                <div className="row g-3">
                    <div className="col-12">
                        <InfoCard
                            title="Subscriber"
                            value={data?.name}
                            icon={IoMdPerson}
                        />
                    </div>
                    <div className="col-12">
                        <InfoCard
                            title="Duration"
                            value={`${data?.plan_duration} ${get_plan_medium(data?.plan_medium, data?.plan_duration)}`}
                            icon={IoMdTime}
                        />
                    </div>
                </div>
            </div>

            {/* Right Column */}
            <div className="col-md-6">
                {/* Dates Section */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <InfoCard
                            title="Start Date"
                            value={moment(data?.start_date).format('MMMM D, YYYY')}
                            icon={IoMdCalendar}
                        />
                    </div>
                    <div className="col-12">
                        <InfoCard
                            title="End Date"
                            value={moment(data?.end_date).format('MMMM D, YYYY')}
                            icon={IoMdCalendar}
                        />
                    </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <IoMdInformationCircle className="text-primary text-lg" />
                        <h6 className="text-gray-700 font-medium mb-0 small">Additional Information</h6>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 small">Payment ID</span>
                            <span className="font-medium small">{data?.payment_id || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600 small">Plan Price</span>
                            <span className="font-medium small">${data?.plan_price || "0.00"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewSubscription