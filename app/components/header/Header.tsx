"use client";

import "./Header.css";
import logo from "../../../public/images/2.svg";
import { FaRegHeart } from "react-icons/fa";
import { BsCart } from "react-icons/bs";
import { FaRegBell } from "react-icons/fa";
import { RiAccountCircleLine } from "react-icons/ri";
import { Button, IconButton } from "@mui/material";
import React, { useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoMdArrowForward } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/app/redux/user";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { IoMdNotifications } from "react-icons/io";
import axios from "axios";
import { authorizationObj } from "@/app/utils/core";
import { baseUrl } from "@/app/utils/core";
import toast from "react-hot-toast";
import ConfirmAlertMUI from "../mui/ConfirmAlertMUI";

const RightMenuBar = ({ options }: any) => {
  const dispatch = useDispatch();
  // console.log(options);
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event?.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.setItem("hart", "");
    signOut();
    router.push("/auth");
  };

  return (
    <div className="d-flex align-items-center bg-light rounded-pill px-3 py-2 right-menu-bar">
      {options?.map((option: any, i: number) => (
        <IconButton
          key={i}
          onClick={() =>
            option.onClick ? option.onClick() : router.push(option?.path)
          }
          className="text-dark nav-icon"
          size="small"
        >
          {option?.label}
        </IconButton>
      ))}
    </div>
  );
};

const CenterMenuBar = ({ options }: any) => {
  const router = useRouter();

  const [hoveredOption, setHoveredOption] = useState<any>(null);

  const handleClick = (hover: boolean, path: string) => {
    if (!hover) router.push(path);
  };

  const handleMouseOver = (index: number) => {
    setHoveredOption(index);
  };

  const handleMouseOut = () => {
    setHoveredOption(null);
  };

  return (
    <div className="d-flex justify-content-start">
      {options?.map((option: any, i: number) => (
        <div
          key={i}
          className="position-relative"
          onMouseOver={() => handleMouseOver(i)}
          onMouseOut={handleMouseOut}
        >
          <div
            className="d-flex align-items-center text-dark px-3 py-2 cursor-pointer nav-item-link"
            onClick={() => {
              if (option?.onClick) {
                option.onClick();
              } else if (!option?.hover) {
                handleClick(option?.hover, option?.path);
              }
            }}
          >
            {option?.label}
            {option?.hover && <IoIosArrowDown className="ms-2" />}
          </div>

          {option?.hover && hoveredOption === i && (
            <div
              className="position-absolute bg-light rounded shadow-sm"
              style={{ top: "100%", left: 0, width: "200px" }}
            >
              {option?.options?.map((subOption: any, j: number) => (
                <div
                  key={j}
                  className="d-flex justify-content-between align-items-center p-3 text-dark hover-bg-light cursor-pointer"
                  onClick={() => router.push(subOption?.path)}
                >
                  {subOption?.label}
                  <IoMdArrowForward />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
const NotificationPopup = ({
  notifications,
  onClose,
  show,
}: {
  notifications: any[];
  onClose: () => void;
  show: boolean;
}) => {
  const router = useRouter();

  if (!show) return null;

  return (
    <div className="notification-dropdown">
      <div className="notification-header d-flex justify-content-between align-items-center">
        <div>
          <h6 className="mb-0">Notifications</h6>
          <small className="text-muted">
            {notifications.length === 0
              ? "No new notifications"
              : `${notifications.length} new notifications`}
          </small>
        </div>
        <div
          className="btn-close btn-sm cursor-pointer"
          onClick={onClose}
          role="button"
          aria-label="Close notifications"
        />
      </div>

      <div className="notification-body">
        {notifications.length === 0 ? (
          <div className="text-center p-4">
            <div className="mb-2">
              <IoMdNotifications size={32} className="text-muted" />
            </div>
            <p className="text-muted mb-0">No new notifications</p>
          </div>
        ) : (
          notifications.map((notification: any, index: number) => (
            <div key={index} className="notification-item">
              <div className="d-flex align-items-start gap-2">
                <div
                  className={`notification-indicator ${notification.type === "increase" ? "increase" : "decrease"
                    }`}
                />
                <div>
                  <p className="notification-text mb-1">{notification.title}</p>
                  <small className="text-muted">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="notification-footer">
        <div
          className="btn btn-link text-primary text-decoration-none w-100 cursor-pointer"
          onClick={() => {
            router.push("/student/notifications");
            onClose();
          }}
          role="button"
        >
          View All Alerts
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state);
  const { isLogin } = currentUser;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertData, setAlertdata] = useState<any>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    if (isLogin && currentUser?.user?.user_id) {
      getNotifications();
    }
  }, [isLogin, currentUser?.user?.user_id]);

  const getNotifications = async () => {
    try {
      const resp = await axios.get(
        `${baseUrl}/notifications/received_notification/${currentUser?.user?.user_id}`,
        authorizationObj
      );
      if (resp?.data) {
        setNotifications(resp.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  // become instructor
  const handleBecomeInstructor = () => {
    setAlertdata({
      title: "Switch to Instructor Mode?",
      description: "You're about to switch to Instructor mode, where you can create courses, teach others, and grow your audience. Your student progress will be saved, and you can switch back anytime.",
      fun: async () => {
        try {
          const newRoleId = "2"; // Set role to tutor (2)
          const formData = new FormData();
          formData.append("new_role_id", newRoleId);
          formData.append("user_id", currentUser?.user?.user_id);
          
          const resp = await axios.post(
            `${baseUrl}/user/switch-role`,
            formData,
            authorizationObj
          );

          if (resp?.data?.status >= 200 && resp?.data?.status < 300) {
            const updatedUser = {
              ...currentUser?.user,
              role_id: newRoleId,
            };
            
            dispatch({
              type: "SET_CURRENT_USER",
              payload: updatedUser,
            });

            router.push("/tutor/dashboard?switch=true");
            toast.success("Successfully switched to Tutor role!");
          } else {
            toast.error(resp?.data?.message || "Failed to switch role");
          }
        } catch (error: any) {
          toast.error(error?.message || "Failed to switch role");
        }
      },
    });
    setIsAlertOpen(true);
  };

  // become student
  const handleBecomeStudent = () => {
    setAlertdata({
      title: "Switch to Student Mode?",
      description: "You're switching back to Student mode. All your tutor data and courses are saved, and you can return to Tutor mode whenever you like. Continue your learning journey!",
      fun: async () => {
        try {
          const newRoleId = "3"; // Set role to student (3)
          const formData = new FormData();
          formData.append("new_role_id", newRoleId);
          formData.append("user_id", currentUser?.user?.user_id);
          
          const resp = await axios.post(
            `${baseUrl}/user/switch-role`,
            formData,
            authorizationObj
          );

          if (resp?.data?.status >= 200 && resp?.data?.status < 300) {
            const updatedUser = {
              ...currentUser?.user,
              role_id: newRoleId,
            };
            
            dispatch({
              type: "SET_CURRENT_USER",
              payload: updatedUser,
            });

            router.push("/student/courses?switch=true");
            toast.success("Successfully switched to Student role!");
          } else {
            toast.error(resp?.data?.message || "Failed to switch role");
          }
        } catch (error: any) {
          toast.error(error?.message || "Failed to switch role");
        }
      },
    });
    setIsAlertOpen(true);
  };

  const admin_right_menu_options = [
    {
      path: currentUser?.user?.institute_id
        ? "/institution/admin/announcements"
        : "/admin/announcements",
      label: <FaRegBell />,
    },
    {
      path: currentUser?.user?.institute_id
        ? "/institution/admin/courses"
        : "/admin/courses",
      label: <RiAccountCircleLine />,
    },
  ];

  const tutor_right_menu_options = [
    {
      path: currentUser?.user?.institute_id
        ? "/institution/tutor/announcements"
        : "/tutor/announcements",
      label: <FaRegBell />,
    },
    {
      path: currentUser?.user?.institute_id
        ? "/institution/tutor/courses"
        : "/tutor/courses",
      label: <RiAccountCircleLine />,
    },
  ];

  const student_right_menu_options = [
    {
      path: currentUser?.user?.institute_id
        ? "/institution/student/favourites"
        : "/student/favourites",
      label: (
        <>
          <FaRegHeart className="d-sm-inline" />
          {/* <span className="d-inline d-sm-none">Favourites</span> */}
        </>
      ),
    },
    {
      path: currentUser?.user?.institute_id
        ? "/institution/student/cart"
        : "/student/cart",
      label: (
        <>
          <BsCart className="d-sm-inline" />
          {/* <span className="d-inline d-sm-none">Cart</span> */}
        </>
      ),
    },
    {
      path: currentUser?.user?.institute_id
        ? "/institution/student/notifications"
        : "/student/notifications",
      label: (
        <>
          <div className="notification-container position-relative d-sm-flex">
            <IoMdNotifications className="notification-icon" />
            {notifications?.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </div>
          {/* <span className="d-inline d-sm-none">Notifications</span> */}
        </>
      ),
    },
    {
      path: currentUser?.user?.institute_id ? "/admin/profile" : "/profile",
      label: <RiAccountCircleLine />,
    },
  ];

  const rightMenuBarOptions = [
    ...(currentUser?.user?.role_id === "1"
      ? admin_right_menu_options
      : currentUser?.user?.role_id === "2"
        ? tutor_right_menu_options
        : currentUser?.user?.role_id === "3"
          ? student_right_menu_options
          : []),
  ];

  const centerMenuBarOptions = [
    {
      label: "Courses",
      path: "/current-courses",
    },
    {
      label: "Live Courses",
      path: "/live-courses",
    },
    currentUser?.user?.role_id === "3" && {
      label: "Instructor",
      path: "/tutor/dashboard",
      onClick: handleBecomeInstructor,
    },
    currentUser?.user?.role_id === "2" && {
      label: "Student",
      path: "/student/courses",
      onClick: handleBecomeStudent,
    },
    {
      label: "AI Tutor",
      path: "/ai-tutor",
    },
    {
      label: "Institutes",
      path: "/institutes",
    },
    isLogin && {
      label: "My Learning",
      hover: false,
      path:
        currentUser?.user?.role_id === "1"
          ? "/admin/dashboard"
          : currentUser?.user?.role_id === "2"
            ? currentUser?.user?.institute_id
              ? "/institution/tutor/courses"
              : "/tutor/courses"
            : currentUser?.user?.role_id === "3"
              ? currentUser?.user?.institute_id
                ? "/institution/student/courses"
                : "/student/courses"
              : currentUser?.user?.role_id === "4"
                ? "/institution/admin/dashboard"
                : currentUser?.user?.role_id === "5"
                  ? "/institution/sub-admin/dashboard"
                  : "/",
    },
  ].filter(Boolean);
  

  return (
    <>
      <ConfirmAlertMUI
        open={isAlertOpen}
        setOpen={setIsAlertOpen}
        title={alertData?.title}
        description={alertData?.description}
        fun={alertData?.fun}
      />
      <nav className="navbar navbar-dark sticky-top py-2"> 
        <div className="container-fluid px-lg-4">
          <div className="d-flex align-items-center gap-3 flex-column flex-sm-row text-center text-sm-start">
            <Image
              src={currentUser?.user?.instituteData?.profile_image || logo}
              alt="logo"
              className="navbar-logo rounded-circle cursor-pointer logo-img"
              width={40}
              height={40}
              onClick={() => router.push("/")}
              priority
            />
            <h5 className="mb-0 d-none d-sm-block fw-bolder heading-style fs-4">KI Academy</h5>
          </div>

          {/* Hamburger Icon for Mobile View */}
          <a className="navbar-toggler d-block d-sm-none border-0" type="button" onClick={toggleMobileMenu}>
            <span className="navbar-toggler-icon"></span>
          </a> 

          {/* Mobile Menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
            <button className="close-btn" onClick={toggleMobileMenu}>×</button>
            <div className="mobile-menu-header">
              <span>Menu</span>
              <button className="close-btn" onClick={toggleMobileMenu}>×</button>
            </div>

            <div className="d-flex flex-column align-items-start">
              {centerMenuBarOptions.map((option, index) => (
                <div
                  key={index}
                  className="mobile-menu-item"
                  onClick={() => router.push(option.path)}
                >
                  {option.label}
                </div>
              ))}

              {!isLogin ? (
                <button
                  className="btn btn-dark rounded-pill p-2 "
                  onClick={() => router.push("/auth/signin")}
                >
                  Sign In
                </button>
              ) : (
                <div className="bg-dark rounded-pill d-flex justify-content-center">
                  {rightMenuBarOptions.map((option, index) => (
                    <div
                      key={index}
                      className="mobile-menu-item text-light "
                      onClick={() => router.push(option.path)}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Navigation for larger screens */}
          <div className="d-flex  align-items-center gap-3 d-none d-sm-flex  ">
            {!mobileMenuOpen && (
              <>
                <CenterMenuBar options={centerMenuBarOptions} />
                {isLogin ? (
                  <RightMenuBar options={rightMenuBarOptions} />
                ) : (
                  <button
                    className="btn px-4 py-2 rounded-pill btn-view text-white"
                    onClick={() => router.push("/auth/signin")}
                    type="button"
                  >
                    Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;

