import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { TextField, Box, Button } from '@mui/material';
import { Typography } from 'antd';
import moment from 'moment';
import Markdown from '../markdown/Markdown';

const EditableAccordionMUI = ({ summary, title, onEdit, onDelete, time, description }: any) => {

    const [single_section_title, set_single_section_title] = React.useState(title);
    const [single_section_desc, set_single_section_desc] = React.useState(description);
    const [isExpanded, setIsExpanded] = React.useState(false);

    const handleEditClick = () => {
        onEdit(single_section_title, single_section_desc)
    };

    const handleDeleteClick = () => {
        if (onDelete) onDelete()
    };

    const handleAccordionChange = (event: React.SyntheticEvent, expanded: boolean) => {
        event.stopPropagation()
        setIsExpanded(expanded);
    };

    return (
        <Accordion sx={{ width: "100%", padding: "2px", borderRadius: 1 }} className='border'
            onChange={handleAccordionChange}
            expanded={isExpanded}
        >
            <AccordionSummary
                expandIcon={null}
                aria-controls="panel2-content"
                id="panel2-header"
            >
                <div className='w-full flex flex-col justify-start items-start gap-4'>
                    <div className='w-full flex justify-between items-center'>
                        <Typography>{moment(time).format("DD/MM/YYYY hh:mm A")}</Typography>
                        <div
                            className="flex justify-center items-center gap-2"
                        >
                            <span>View Lectures & Quiz</span>
                            <ArrowDropDownIcon />
                        </div>
                    </div>
                    <TextField
                        label="Unit Title"
                        value={single_section_title || ""}
                        variant="outlined"
                        fullWidth
                        sx={{ fontSize: "18px", fontWeight: "semi-bold", textTransform: "capitalize", marginY: "8px" }}
                        onChange={(e: any) => set_single_section_title(e.target.value)}
                    />
                </div>
            </AccordionSummary>
            <AccordionDetails>
                {(description && isExpanded) ? <Markdown
                    label="Description"
                    value={single_section_desc}
                    onChange={(text: any) => set_single_section_desc(text)}
                    onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        setIsExpanded(true);
                    }}
                /> : null}
                <Box sx={{ width: "100%", display: 'flex', justifyContent: "flex-end", alignItems: 'center', gap: 1, marginRight: 2, marginTop: 2, marginBottom: 2 }}>
                    {
                        onEdit ? <Button
                            sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40px" }}
                            onClick={handleEditClick} color="secondary" variant="contained"
                        > <EditIcon sx={{ fontSize: "16px", marginRight: "8px" }} /> <span className='mt-[3px]'>Save Changes</span></Button>
                            : null
                    }
                    {
                        onDelete ? <Button
                            sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "40px" }}
                            onClick={handleDeleteClick} color="secondary" variant="contained"
                        > <DeleteIcon sx={{ fontSize: "16px", marginRight: "8px" }} /> <span className='mt-[3px]'>Delete</span></Button>
                            : null
                    }
                </Box>
                {summary}
            </AccordionDetails>
        </Accordion>
    );
};

export default EditableAccordionMUI;