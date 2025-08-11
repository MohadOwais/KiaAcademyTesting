import { Skeleton } from '@mui/material'
import React from 'react'

const CourseCardSkeleton = () => {
    return (
        <div className='card-course w-full h-fit'>
            <Skeleton animation="wave" height={300} />
            <Skeleton animation="wave" height={50} />
            <Skeleton animation="wave" height={40} sx={{ width: "50%" }} />
            <Skeleton animation="wave" height={20} />
            <Skeleton animation="wave" height={30} sx={{ width: "4em" }} />
            <Skeleton animation="wave" height={60} />
        </div>
    )
}

export default CourseCardSkeleton
