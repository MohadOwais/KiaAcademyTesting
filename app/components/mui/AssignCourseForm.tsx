
import { Tooltip } from '@mui/material';
import React from 'react';

const AssignCourseForm = ({ all_tutors, assigned_tutors, unAssign_course, assign_course }: any) => {

    const handleClick = (isAssigned: boolean, tutorId: string) => {
        if (isAssigned) {
            unAssign_course(tutorId)
        } else {
            assign_course(tutorId)
        }
    }

    return (
        <div className="w-100 h-100 d-flex flex-column justify-content-start align-items-start gap-2 overflow-auto">
            {all_tutors?.map((t: any) => {
                const isAssigned = assigned_tutors?.some((at: any) => at.assigned_to === t.user_id);

                return (
                    <div
                        key={t.user_id}
                        className="w-100 d-flex justify-content-between align-items-center gap-2 cursor-pointer p-2 shadow border-1 border border-dark rounded-2"
                    >
                        <p className="w-100 text-start my-0">{`${t?.first_name} ${t?.last_name}`}</p>
                        <div
                            className="d-flex justify-content-end align-items-center gap-1"
                            onClick={() => handleClick(isAssigned, t?.user_id)}
                        >
                            <p className={`m-0 ${!isAssigned ? 'btn btn-sm btn-success' : 'btn btn-sm btn-danger'}`}>
                                {isAssigned ? 'UnAssign' : 'Assign'}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AssignCourseForm;

