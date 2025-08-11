import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Typography } from '@mui/material';
import moment from 'moment';

const SimpleMUIAccordion = ({ summary, title, time }: any) => {

    return (
        <Accordion sx={{ width: "100%", padding: "2px", borderRadius: 1 }} className='border'>
            <AccordionSummary
                expandIcon={null}
                aria-controls="panel2-content"
                id="panel2-header"
            >
                <div className='w-full flex flex-col justify-start items-start'>
                    <div className='w-full flex justify-between items-center'>
                        <p className='text-sm flex items-center m-0'>{moment(time).format("DD/MM/YYYY hh:mm A")}</p>
                        <div
                            className="flex justify-center items-center gap-2"
                        >
                            <ArrowDropDownIcon />
                        </div>
                    </div>
                    <p className='text-xl flex items-center mt-[16px]'>{title || ""}</p>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                {summary}
            </AccordionDetails>
        </Accordion>
    );
};

export default SimpleMUIAccordion;