import "./Main.css";
import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import moment from "moment";
import ConfirmAlertMUI from "@/app/components/mui/ConfirmAlertMUI";
import { Typography, Grid, TextField, Button, Box, Tabs, Tab } from "@mui/material";
import AlertMUI from "@/app/components/mui/AlertMUI";
import FullScreenDialog from "@/app/components/mui/FullScreenDialogue";
import { authorizationObj, baseUrl, profilePicture } from "@/app/utils/core";
import axios from "axios";
import { useSelector } from "react-redux";
import PropTypes from 'prop-types';
import { FiBellOff } from "react-icons/fi";
import Image from 'next/image'
function CustomTabPanel(props: any) {
const { children, value, index, ...other } = props;

return (
<div role="tabpanel" hidden={value !==index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}
    {...other}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
</div>
);
}

CustomTabPanel.propTypes = {
children: PropTypes.node,
index: PropTypes.number.isRequired,
value: PropTypes.number.isRequired,
};

function a11yProps(index: any) {
return {
id: `simple-tab-${index}`,
'aria-controls': `simple-tabpanel-${index}`,
};
}

export const SingleNotification = ({ notification, is_sent }: any) => {

const profile_picture = `${is_sent ? notification?.receiver_profile : notification?.sender_profile}`
const user_name = is_sent ? notification?.receiver_name : notification?.sender_name

return (
<div className="w-full border p-4 flex justify-start items-start gap-4 hover:bg-[#fafafa]">
    <Image src={profile_picture} alt="profile-picture"
        className="w-[45px] h-[45px] rounded-full object-cover object-center bg-[#ededed]" width={50} height={50}
        onError={(e: any)=> (e.target.src = profilePicture)}
        />
        <div className="w-full flex flex-col justify-start items-start">
            <p className="w-full text-left text-lg">{user_name}</p>
            <p className="w-full text-left text-[#909090]">{notification?.message}</p>
            <p className="w-full text-right text-xs text-[#787878]">
                {moment(notification?.created_at)?.format("DD/MM/YYYY hh:mm A")}</p>
        </div>
</div>
)
}

export const NoNotification = () => {
return (
<>
    <div className="w-full h-[40vh] flex flex-col justify-end items-center gap-8">
        <FiBellOff style={{ fontSize: "120px" }} />
        <p className="w-full text-center text-2xl font-bold">No Notification</p>
    </div>
</>
)
}

export const ListNotifications = ({ notifications, is_sent }: any) => {

return (
<div className="w-full flex flex-col justify-start items-start">
    {notifications?.length ? notifications?.map((not: any, i: number) =>
    <SingleNotification key={i} notification={not} is_sent={is_sent} />) :
    <NoNotification />}
</div>
)
}

export const ViewNotifications = () => {

const currentUser = useSelector((state: any) => state?.user)

const [send_notifications, set_send_notifications] = React.useState<any[]>([])
    const [recieved_notifications, set_recieved_notifications] = React.useState<any[]>([])

        React.useEffect(() => {
        get_recieved_notifications()
        get_send_notifications()
        }, [])

        const get_recieved_notifications = async () => {
        try {
        const resp = await axios.get(`${baseUrl}/notifications/received_notification/${currentUser?.user_id}`,
        authorizationObj)
        if (resp?.data) {
        set_recieved_notifications(resp?.data)
        } else {
        set_recieved_notifications([])
        }
        } catch (error) {
        // console.error(error)
        set_recieved_notifications([])
        }
        }

        const get_send_notifications = async () => {
        try {
        const resp = await axios.get(`${baseUrl}/notifications/sent_notification/${currentUser?.user_id}`,
        authorizationObj)
        if (resp?.data) {
        set_send_notifications(resp?.data)
        } else {
        set_send_notifications([])
        }
        } catch (error) {
        // console.error(error)
        set_send_notifications([])
        }
        }

        const [value, setValue] = React.useState<number>(0);

            const handleChange = (event: any, newValue: number) => {
            setValue(newValue);
            };

            return (
            <div className="p-8 h-full overflow-y-auto">
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" variant="fullWidth">
                    <Tab label="Sent Notifications" {...a11yProps(0)} sx={{ textTransform: "capitalize" }} />
                    <Tab label="Recieved Notifications" {...a11yProps(1)} sx={{ textTransform: "capitalize" }} />
                </Tabs>
                <CustomTabPanel value={value} index={0}>
                    <ListNotifications notifications={send_notifications} is_sent={true} />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <ListNotifications notifications={recieved_notifications} is_sent={false} />
                </CustomTabPanel>
            </div>
            )
            }

            const TTable = ({ data, getAllStudents }: any) => {

            const isDrawerOpen = useSelector((state: any) => state?.isAdminDrawerOpen)
            const currentUser = useSelector((state: any) => state?.user)

            const [alertData, setAlertdata] = React.useState<any>(null);
                const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);
                    const [clientErrorMessage, setClientErrorMessage] = React.useState<string | null>(null);
                        const [clientSuccessMessage, setClientSuccessMessage] = React.useState<string | null>(null);
                            const [rows, setRows] = React.useState<any>([]);
                                const [selected_students, set_selected_students] = React.useState<string>("")
                                    const [message, set_message] = React.useState("")
                                    const [is_loading, set_is_loading] = React.useState(false)
                                    const [selected_rows, set_selected_rows] = React.useState<any>([])
                                        const [is_viewing, set_is_viewing] = React.useState(false)

                                        const get_recieved_notifications = async () => {
                                        try {
                                        const resp = await
                                        axios.get(`${baseUrl}/notifications/received_notification/${currentUser?.user_id}`,
                                        authorizationObj)
                                        } catch (error) {
                                        // console.error(error)
                                        }
                                        }

                                        const get_send_notifications = async () => {
                                        try {
                                        const resp = await
                                        axios.get(`${baseUrl}/notifications/sent_notification/${currentUser?.user_id}`,
                                        authorizationObj)
                                        } catch (error) {
                                        // console.error(error)
                                        }
                                        }

                                        React.useEffect(() => {
                                        if (data?.length) {
                                        const formattedData = data.map((item: any) => ({
                                        id: item?.id,
                                        student_name: `${item?.first_name} ${item?.last_name}`,
                                        email: item?.email,
                                        user_id: item?.user_id,
                                        course_title: item?.course_title,
                                        enrollment_date: item?.enrollment_date,
                                        profile_picture: item?.profile_picture,
                                        }));
                                        setRows(formattedData);
                                        }
                                        }, [data]);

                                        const handleSelectionChange = (selectionModel: any) => {
                                        const selectedData = rows
                                        .map((item: any, index: number) => ({
                                        ...item,
                                        id: index + 1,
                                        }))
                                        .filter((row: any) => selectionModel.includes(row.id));

                                        set_selected_rows(selectionModel)
                                        const selectedUserIds = selectedData.map((std: any) => std.user_id).join(",");
                                        set_selected_students(selectedUserIds);
                                        };

                                        const columns: any = [
                                        {
                                        field: 'sr_no',
                                        headerName: 'Sr. No',
                                        width: 70,
                                        },
                                        {
                                        field: 'profile_picture',
                                        headerName: 'Picture',
                                        renderCell: (params: any) => {
                                        return (
                                        <Image src={`${params.row.profile_picture || profilePicture}`}
                                            alt="profile picture" width={35} height={35}
                                            style={{ width: "35px", height: "35px", marginTop: "6px", objectFit: "cover", objectPosition: "center", background: "#EDEDED" }}
                                            onError={(e: any)=> e.target.src = profilePicture}
                                            />
                                            );
                                            },
                                            },
                                            {
                                            field: 'student_name',
                                            headerName: 'Student Name',
                                            width: 200
                                            },
                                            {
                                            field: 'email',
                                            headerName: 'Email',
                                            width: 200
                                            },
                                            {
                                            field: 'course_title',
                                            headerName: 'Course',
                                            width: 250,
                                            renderCell: (params: any) => (
                                            params.value ?
                                            <p>{params?.value}</p>
                                            : "N/A"
                                            )
                                            },
                                            ];

                                            const create_announcement = async () => {
                                            if (!message || message?.trim() === "") {
                                            setClientErrorMessage("Announcement message is required")
                                            setTimeout(() => {
                                            setClientErrorMessage(null)
                                            }, 3000);
                                            return
                                            }

                                            if (!selected_students || selected_students?.trim() === "") {
                                            setClientErrorMessage("Please select students")
                                            setTimeout(() => {
                                            setClientErrorMessage(null)
                                            }, 3000);
                                            return
                                            }

                                            // const data_to_send = {
                                            // sender_id: currentUser?.user_id,
                                            // receiver_id: selected_students,
                                            // role_id: currentUser?.role_id,
                                            // message: message,
                                            // is_read: false
                                            // }

                                            const formData = new FormData()
                                            formData.append("sender_id", currentUser?.user_id)
                                            formData.append("receiver_id", selected_students)
                                            formData.append("role_id", currentUser?.role_id)
                                            formData.append("message", message)
                                            formData.append("is_read", "false")

                                            try {

                                            set_is_loading(true)
                                            const resp = await axios.post(`${baseUrl}/notifications/create`, formData,
                                            authorizationObj)
                                            set_is_loading(false)
                                            if (resp?.data?.status > 299 || resp?.data?.status < 200) {
                                                setClientErrorMessage(resp?.data?.message) 
                                                setTimeout(()=> {
                                                setClientErrorMessage(null)
                                                }, 3000);
                                                return
                                                }
                                                set_message("")
                                                set_selected_students("")
                                                set_selected_rows([])
                                                setClientSuccessMessage("Announcement sent to students successfully")
                                                setTimeout(() => {
                                                setClientSuccessMessage(null)
                                                }, 3000);

                                                } catch (error) {
                                                // console.error(error)
                                                set_is_loading(false)
                                                setClientErrorMessage("Something went wrong, please try later")
                                                setTimeout(() => {
                                                setClientErrorMessage(null)
                                                }, 3000);
                                                return
                                                }

                                                }

                                                return (
                                                <>
                                                    {clientErrorMessage &&
                                                    <AlertMUI status="error" text={clientErrorMessage} />}
                                                    {clientSuccessMessage &&
                                                    <AlertMUI status="success" text={clientSuccessMessage} />}
                                                    <ConfirmAlertMUI open={isAlertOpen} setOpen={setIsAlertOpen}
                                                        title={alertData?.title} description={alertData?.description}
                                                        fun={alertData?.fun} isLoading={false} />
                                                    <FullScreenDialog open={is_viewing} onClose={()=>
                                                        set_is_viewing(false)}
                                                        headerTitle="Notifications"
                                                        >
                                                        <ViewNotifications />
                                                    </FullScreenDialog>
                                                    <Typography
                                                        sx={{ fontSize: "20px", fontWeight: "semi-bold", paddingLeft: "8px" }}>
                                                        Announcements</Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <TextField label="Announcement Message" required
                                                                value={message || "" } variant="outlined" fullWidth
                                                                multiline sx={{ marginBottom: 1 }} onChange={(e: any)=>
                                                                set_message(e.target.value)}
                                                                />
                                                        </Grid>
                                                        <Grid item xs={12}
                                                            sx={{ paddingTop: 0, marginTop: "-8px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "8px" }}>
                                                            <Button color="secondary" variant="contained"
                                                                sx={{ width: "200px" }} fullWidth onClick={()=>
                                                                set_is_viewing(true)}
                                                                >View Notifications</Button>
                                                            <Button color="secondary" variant="contained"
                                                                disabled={is_loading || !message || !selected_students}
                                                                sx={{ width: "200px" }} fullWidth
                                                                onClick={create_announcement}>{is_loading ? "Processing"
                                                                : "Create Announcement"}</Button>
                                                        </Grid>
                                                        {/* <Grid item xs={12}
                                                            sx={{ paddingTop: 0, marginTop: "-8px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                                                            <Button color="secondary" variant="outlined"
                                                                sx={{ width: "200px" }} fullWidth
                                                                onClick={get_send_notifications}>get send
                                                                notifications</Button>
                                                        </Grid>
                                                        <Grid item xs={12}
                                                            sx={{ paddingTop: 0, marginTop: "-8px", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                                                            <Button color="secondary" variant="outlined"
                                                                sx={{ width: "200px" }} fullWidth
                                                                onClick={get_recieved_notifications}>get recieved
                                                                notifications</Button>
                                                        </Grid> */}
                                                    </Grid>
                                                    <div className="table-cont-sts mt-8"
                                                        style={{ width: `calc(100vw - ${isDrawerOpen ? "300px" : "120px"})` }}>
                                                        <DataGrid rows={ rows.map((item: any, index: number)=> ({
                                                            ...item,
                                                            sr_no: index + 1,
                                                            id: index + 1,
                                                            }))
                                                            } columns={columns}
                                                            initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 10 },
                        },
                    }}
                                                            pageSizeOptions={[5, 10]}
                                                            checkboxSelection
                                                            onRowSelectionModelChange={(selectionModel: any) =>
                                                            handleSelectionChange(selectionModel)}
                                                            rowSelectionModel={selected_rows}
                                                            disableRowSelectionOnClick
                                                            />
                                                    </div>
                                                </>
                                                );
                                                }

                                                export default TTable;