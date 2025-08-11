"use client";

import "./index.css";
import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { BsCalendar4Event, BsPersonFill as PersonIcon } from "react-icons/bs";
import LogoutIcon from "@mui/icons-material/Logout";
import { companyName, primaryColor } from "../../utils/data";
// import logo from "../../../public/images/logo-black.png";
import logo from "../../../public/images/4.svg";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { profilePicture } from "@/app/utils/core";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { Button } from "@mui/material";
import ConfirmAlertMUI from "./ConfirmAlertMUI";
import { logout, setIsAdminDrawerOpen } from "@/app/redux/user";
import { baseUrl } from "@/app/utils/core";
import toast from "react-hot-toast";
import { authorizationObj } from "@/app/utils/core";
import axios from "axios";
import {
  FaBook,
  FaVideo,
  FaShoppingCart,
  FaRegBookmark,
  FaPaperPlane,
  FaEnvelope,
} from "react-icons/fa";
import { IoMdPeople } from "react-icons/io";
import { BsFillMortarboardFill } from "react-icons/bs";
import { AiFillDashboard } from "react-icons/ai";
import { IoMdPerson } from "react-icons/io";
import { GrTransaction } from "react-icons/gr";
// import { MdOutlineLiveTv } from "react-icons/md";
import { RiCoupon3Fill } from "react-icons/ri";
import { GrContact } from "react-icons/gr";
import { MdAdminPanelSettings } from "react-icons/md";
import { CgAssign } from "react-icons/cg";
import { MdOutlineCategory } from "react-icons/md";
import { signOut } from "next-auth/react";
import { FaRegCreditCard } from "react-icons/fa";
import { BiSolidPackage } from "react-icons/bi";
import { RiLiveFill } from "react-icons/ri";
import { FaUniversity } from "react-icons/fa";
import { FaDollarSign } from "react-icons/fa";
import { BsPersonBadge } from "react-icons/bs";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});


const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawerMUI({ children }: any) {
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const state = useSelector((state: any) => state);
  const currentUser = state?.user;
  const isAdminDrawerOpen = state?.isAdminDrawerOpen;

  const [sideBarData, setSideBarData] = React.useState<any[]>([]);
  const [clear, setClear] = React.useState<boolean>(false);

  // Use Next.js usePathname for reactive route changes
  const pathName = usePathname();

  // Responsive drawer state
  const [open, setOpen] = React.useState<any>(false);



  // Set drawer open/close based on screen size
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setOpen(false); // Always closed on mobile
      } else {
        setOpen(true); // Always open on desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // When user manually opens/closes, override only for that action
  const handleDrawerOpen = () => {
    setOpen(true);
    dispatch(setIsAdminDrawerOpen(true));
  };


  

  const handleDrawerClose = () => {
    setOpen(false);
    dispatch(setIsAdminDrawerOpen(false));
  };

  React.useEffect(() => {
    getSideBarData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, pathName]);

  const getSideBarData = () => {
    if (currentUser?.role_id === "1") {
      setSideBarData([
        {
          label: "Dashboard",
          route: "/admin/dashboard",
          icon: <AiFillDashboard />,
        },
        {
          label: "Courses",
          route: "/admin/courses",
          icon: <FaBook />,
        },
        {
          label: "Tutors",
          route: "/admin/tutors",
          icon: <IoMdPerson />,
        },

        {
          label: "Students",
          route: "/admin/students",
          icon: <IoMdPeople />,
        },
        {
          label: "Institutions",
          route: "/admin/institutions",
          icon: <BsFillMortarboardFill />,
        },
        {
          label: "Onboarding-Institutions",
          route: "/admin/onboarding-institutions",
          icon: <FaUniversity />,
        },
        {
          label: "Announcements",
          route: "/admin/announcements",
          icon: <FaPaperPlane />,
        },
        {
          label: "Course Categories",
          route: "/admin/course-categories",
          icon: <MdOutlineCategory />,
        },
        {
          label: "Contact Us",
          route: "/admin/contact-us",
          icon: <GrContact />,
        },
        {
          label: "Payments",
          route: "/admin/payments",
          icon: <GrTransaction />,
        },
        {
          label: "Payouts",
          route: "/admin/payouts",
          icon: <FaDollarSign />,
        },
        {
          label: "Plans",
          route: "/admin/plans",
          icon: <FaRegCreditCard />,
        },
        {
          label: "Subscriptions",
          route: "/admin/subscriptions",
          icon: <BiSolidPackage />,
        },
        {
          label: "Coupons",
          route: "/admin/coupons",
          icon: <RiCoupon3Fill />,
        },
      ]);
    } else if (currentUser?.role_id === "2") {
      if (currentUser?.institute_id) {
        setSideBarData([
          {
            label: "Dashboard",
            route: "/institution/tutor/dashboard",
            icon: <AiFillDashboard />,
          },
          {
            label: "Courses",
            route: "/institution/tutor/courses",
            icon: <FaBook />,
          },
          {
            label: "Online Classes",
            route: "/institution/tutor/online-classes",
            icon: <RiLiveFill />,
          },
          // {
          //   label: "Notifications",
          //   route: "/institution/tutor/notifications",
          //   icon: <FaEnvelope />,
          // },
          {
            label: "Students",
            route: "/institution/tutor/students",
            icon: <IoMdPeople />,
          },
          {
            label: "Announcements",
            route: "/institution/tutor/announcements",
            icon: <FaPaperPlane />,
          },
          {
            label: "Class Calendar",
            route: "/institution/tutor/class-calendar",
            icon: <BsCalendar4Event />,
          },
        ]);
      } else {
        setSideBarData([
          {
            label: "Dashboard",
            route: "/tutor/dashboard",
            icon: <AiFillDashboard />,
          },
          {
            label: "Courses",
            route: "/tutor/courses",
            icon: <FaBook />,
          },
          {
            label: "Students",
            route: "/tutor/students",
            icon: <IoMdPeople />,
          },
          {
            label: "Announcements",
            route: "/tutor/announcements",
            icon: <FaPaperPlane />,
          },
          {
            label: "Online Classes",
            route: "/tutor/online-classes",
            icon: <RiLiveFill />,
          },
          {
            label: "Class Calendar",
            route: "/tutor/class-calendar",
            icon: <BsCalendar4Event />,
          },
          {
            label: "Transactions",
            route: "/tutor/transactions",
            icon: <GrTransaction />,
          },
        ]);
      }
    } else if (currentUser?.role_id === "3") {
      if (currentUser?.institute_id) {
        setSideBarData([
          {
            label: "Courses",
            route: "/institution/student/courses",
            icon: <FaBook />,
          },
          {
            label: "Notifications",
            route: "/institution/student/notifications",
            icon: <FaEnvelope />,
          },
          {
            label: "Cart",
            route: "/institution/student/cart",
            icon: <FaShoppingCart />,
          },
          {
            label: "Favourites",
            route: "/institution/student/favourites",
            icon: <FaRegBookmark />,
          },
          {
            label: "Payment",
            route: "/institution/student/payment",
            icon: <FaRegBookmark />,
          },
        ]);
      } else {
        setSideBarData([
          {
            label: "Courses",
            route: "/student/courses",
            icon: <FaBook />,
          },
          {
            label: "Notifications",
            route: "/student/notifications",
            icon: <FaEnvelope />,
          },
          {
            label: "Cart",
            route: "/student/cart",
            icon: <FaShoppingCart />,
          },
          {
            label: "Favourites",
            route: "/student/favourites",
            icon: <FaRegBookmark />,
          },
          {
            label: "Payment",
            route: "/student/payment",
            icon: <FaRegBookmark />,
          },
        ]);
      }
    } else if (currentUser?.role_id === "4") {
      setSideBarData([
        {
          label: "Dashboard",
          route: "/institution/admin/dashboard",
          icon: <AiFillDashboard />,
        },

        {
          label: "Courses",
          route: "/institution/admin/courses",
          icon: <FaBook />,
        },
        {
          label: "Online Classes",
          route: "/institution/admin/online-classes",
          icon: <RiLiveFill />,
        },
        {
          label: "Assign Course",
          route: "/institution/admin/assign-course",
          icon: <CgAssign />,
        },
        {
          label: "Sub Admins",
          route: "/institution/admin/sub-admins",
          icon: <MdAdminPanelSettings />,
        },
        {
          label: "Instructors",
          route: "/institution/admin/instructors",
          icon: <IoMdPerson />,
        },
        {
          label: "Students",
          route: "/institution/admin/students",
          icon: <IoMdPeople />,
        },
        {
          label: "Announcements",
          route: "/institution/admin/announcements",
          icon: <FaPaperPlane />,
        },
        {
          label: "Transactions",
          route: "/institution/admin/transactions",
          icon: <GrTransaction />,
        },
        {
          label: "Class Calendar",
          route: "/institution/admin/class-calendar",
          icon: <BsCalendar4Event />,
        },
      ]);
    } else if (currentUser?.role_id === "5") {
      setSideBarData([
        {
          label: "Dashboard",
          route: "/institution/sub-admin/dashboard",
          icon: <AiFillDashboard />,
        },
        {
          label: "Courses",
          route: "/institution/sub-admin/courses",
          icon: <FaBook />,
        },
        {
          label: "Online Classes",
          route: "/institution/sub-admin/online-classes",
          icon: <RiLiveFill />,
        },
        {
          label: "Assign Course",
          route: "/institution/sub-admin/assign-course",
          icon: <CgAssign />,
        },
        {
          label: "Instructors",
          route: "/institution/sub-admin/instructors",
          icon: <IoMdPerson />,
        },
        {
          label: "Students",
          route: "/institution/sub-admin/students",
          icon: <IoMdPeople />,
        },
        {
          label: "Announcements",
          route: "/institution/sub-admin/announcements",
          icon: <FaPaperPlane />,
        },
        {
          label: "Class Calendar",
          route: "/institution/sub-admin/class-calendar",
          icon: <BsCalendar4Event />,
        },
        // {
        //   label: "Transactions",
        //   route: "/institution/sub-admin/transactions",
        //   icon: <GrTransaction />,
        // },
      ]);
    }
  };

  // menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event?.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // confirmation alert
  const [alertData, setAlertdata] = React.useState<any>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState<boolean>(false);

  // loading
  const [isLoading, setIsLoading] = React.useState<boolean>(false);


  React.useEffect(() => {
    if (clear) {
      localStorage.setItem("hart", "");
    }
  }, [clear]);

  // logout
  const _logout = async () => {
    try {
      setIsLoading(true);
      setIsLoading(false);
      setClear(true);
      dispatch(logout());
      setAlertdata(null);
      setIsAlertOpen(false);
      signOut();
      router?.push("/auth/signin");
    } catch (error: any) {
      setIsLoading(false);
    }
  };
 // role change
  const _switchRole = async () => {
    try {
      // Toggle between role 2 (tutor) and 3 (student)
      const newRoleId = currentUser?.role_id === "2" ? "3" : "2";
      const formData = new FormData();
      formData.append("new_role_id", newRoleId);
      formData.append("user_id", currentUser?.user_id);
      
      const resp = await axios.post(
        `${baseUrl}/user/switch-role`,
        formData,
        authorizationObj
      );

      if (resp?.data?.status >= 200 && resp?.data?.status < 300) {
        // Update the user's role in the current user state
        const updatedUser = {
          ...currentUser,
          role_id: newRoleId
        };
        
        // Update Redux store
        dispatch({
          type: 'SET_CURRENT_USER',
          payload: updatedUser
        });

        // Redirect based on new role
        if (newRoleId === "2") {
          router.push("/tutor/dashboard?switch=true");
          toast.success("Role changed successfully to Tutor!");
        } else {
          // updated the url to reload the page
          router.push("/student/courses?switch=true");
          toast.success("Role changed successfully to Student!");
        }
      } else {
        toast.error(resp?.data?.message || "Failed to change role");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to change role");
    }
  };
  return (
    <>
      <ConfirmAlertMUI
        open={isAlertOpen}
        setOpen={setIsAlertOpen}
        title={alertData?.title}
        description={alertData?.description}
        fun={alertData?.fun}
        isLoading={isLoading}
      />
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar position="fixed" open={open} className="bg-gradient12">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              className="w-full flex justify-between items-center"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                className="flex gap-2 items-start cursor-pointer"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  const dashboardRouteMap: { [key: string]: string } = {
                    "1": "/admin/dashboard",
                    "2": "/tutor/dashboard",
                    "3": "/student/courses",
                    "4": "/institution/admin/dashboard",
                    "5": "/institution/sub-admin/dashboard",
                  };
                  const route = dashboardRouteMap[currentUser?.role_id] || "/"; // fallback to home or default
                  router.push(route);
                }}
              >
                <p className="m-0">
                  {currentUser?.instituteData?.name
                    ? currentUser.instituteData.name
                    : companyName}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <>
                  <Button
                    id="basic-button"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                  >
                    <div className="flex items-center">
                      <Image
                        src={currentUser?.profile_picture || profilePicture}
                        alt="profile picture"
                        width={50}
                        height={50}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                          objectPosition: "0% 10%",
                          borderRadius: "50%", // This will make the image round
                          cursor: "pointer",
                        }}
                        onError={(e: any) => {
                          e.target.src = profilePicture;
                        }}
                        priority={true}
                        loading="eager"
                      />
                    </div>
                  </Button>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={openMenu}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                  >
                    {["1", "2", "3", "4", "5"].includes(
                      currentUser?.role_id
                    ) && (
                      <MenuItem
                        onClick={() => {
                          handleClose();
                          const roleRouteMap: { [key: string]: string } = {
                            "1": "/admin/profile",
                            "2": "/tutor/profile",
                            "3": "/profile",
                            "4": "/institution/admin/profile",
                            "5": "/institution/sub-admin/profile",
                          };
                          router?.push(roleRouteMap[currentUser.role_id]);
                        }}
                      >
                        <PersonIcon style={{ width: 18, height: 18 }} />
                        <span className="ml-2 pt-[3px]">Profile</span>
                      </MenuItem>
                    )}
                {/* switch role */}
                    {(currentUser?.role_id === "2" || currentUser?.role_id === "3") && (
                      <MenuItem
                        onClick={() => {
                          setAlertdata({
                            title: "Switch to Student Mode?",
                            description:
                              "You're switching back to Student mode. All your tutor data and courses are saved, and you can return to Tutor mode whenever you like. Continue your learning journey!",
                            fun: _switchRole,
                          });
                          setIsAlertOpen(true);
                          handleClose();
                        }}
                      >
                        <span className="ml-2 pt-[3px]">
                          <BsPersonBadge style={{ width: 18, height: 18 }} />
                          Switch Role</span>
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        setAlertdata({
                          title: "Logout?",
                          description:
                            "Are you sure you want to logout?. The action cannot be undone",
                          fun: _logout,
                        });
                        setIsAlertOpen(true);
                        handleClose();
                      }}
                    >
                      <LogoutIcon sx={{ width: 18, height: 18 }} />{" "}
                      <span className="ml-2 pt-[3px]">Logout</span>
                    </MenuItem>
                  </Menu>
                </>
              </div>
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          open={open}
          classes={{ paper: "bg-gradient1" }}
        >
          <DrawerHeader>
            <div
              className="flex gap-2 items-center m-auto cursor-pointer"
              onClick={() => {
                const dashboardRouteMap: { [key: string]: string } = {
                  "1": "/admin/dashboard",
                  "2": "/tutor/dashboard",
                  "3": "/student/courses", // Same dashboard as student for role "3", or change if needed
                  "4": "/institution/admin/dashboard",
                  "5": "/institution/sub-admin/dashboard",
                };
                const route = dashboardRouteMap[currentUser?.role_id] || "/"; // Default route
                router.push(route);
              }}
              style={{ cursor: "pointer", textAlign: "center" }}
            >
              <Image
                src={logo}
                width={85}
                height={85}
                objectFit="contain"
                alt="logo"
                className="rounded-full p-[3px] w-[85px] h-[85px]"
                style={{
                  borderRadius: "9999px", // fully rounded like Tailwind's "rounded-full"
                  padding: "3px",
                  width: "85px",
                  height: "85px",
                  marginTop: "5px",
                  objectFit: "contain",
                }}
              />
            </div>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List sx={{ padding: 0, marginTop: "15px" }}>
            {sideBarData?.map((data: any, i: number) => (
              <ListItem
                key={i}
                disablePadding
                onClick={() => router?.push(data?.route)}
                sx={{
                  display: "block",
                  color: pathName === data?.route ? primaryColor : "",
                }}
              >
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: pathName === data?.route ? primaryColor : "",
                    }}
                  >
                    {data?.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={data?.label}
                    sx={{
                      opacity: open ? 1 : 0,
                    }}
                    className={`${pathName === data?.route ? "font-bold" : ""}`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, backgroundColor: "#fff" }}
        >
          <DrawerHeader />
          {children}
        </Box>
      </Box>
    </>
  );
}
