import {
  authorizationObj,
  baseUrl,
  courseThumbnailPath,
  courseVideoPath,
  serverToken,
} from "@/app/utils/core";
import { FormControl, MenuItem, Select } from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
// import IconButton from "@mui/material/IconButton";
import { useSelector } from "react-redux";
import axios from "axios";
import { useState, useEffect } from "react";
import { getClosestSession } from "@/app/utils/functions";
import AlertMUI from "@/app/components/mui/AlertMUI";
import { FaLink } from "react-icons/fa";
import moment from "moment";
import { MuiMarkdown } from "mui-markdown";
import { redirect, useRouter } from "next/navigation";
import { Share } from "@mui/icons-material";
import "./Main.css";
import {
  FacebookShareButton,
  WhatsappShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  EmailShareButton,
  TelegramShareButton,
  FacebookIcon,
  WhatsappIcon,
  TwitterIcon,
  LinkedinIcon,
  EmailIcon,
  TelegramIcon,
} from "react-share";

const Section1 = ({ course }: any) => {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const currentUser = useSelector((state: any) => state);
  const user_id = currentUser?.user?.user_id;
  const [showIcons, setShowIcons] = useState(false);

  const pageurl = window.location.href;

  const [_course, set_course] = useState<any>(null);
  const [course_additional_information, set_course_additional_information] =
    useState<any>(null);
  const [currencies, set_currencies] = useState<any>([]);
  const [selected_currency, set_selected_currency] = useState("");
  const [course_price, set_course_price] = useState("");
  const [live_sessions, set_live_sessions] = useState<any[]>([]);
  const [closest_session, set_closest_session] = useState<any>(null);
  const [error_message, set_error_message] = useState<null | string>(null);
  const [success_message, set_success_message] = useState<null | string>(null);
  const [is_loading, set_is_loading] = useState(false);
  const [redirect_url, set_redirect_url] = useState("");
  const [total_units, set_total_units] = useState(0);
  const [total_duration, set_total_duration] = useState(0);
  const [course_status, set_course_status] = useState(_course?.course_status);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageurl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  useEffect(() => {
    get_currencies();
  }, []);

  const get_currencies = async () => {
    try {
      const resp = await axios.get(
        `${baseUrl}/payment/get-currency`,
        authorizationObj
      );
      set_currencies(resp?.data?.currency);
    } catch (error) {
      // console.error(error)
    }
  };

  useEffect(() => {
    if (course && course?.length && course[0]) {
      set_course(course[0]);
    }
  }, [course]);

  useEffect(() => {
    set_selected_currency(_course?.display_currency);
    set_course_price(_course?.course_display_price);
    set_course_status(_course?.course_status);
  }, [_course, _course?.course_status]);

  const AddtoCart = async (courseId: string) => {
    if (!courseId) return;

    if (!currentUser?.isLogin) {
      router.push("/auth/signin");
      return;
    }

    if (currentUser?.user?.role_id !== "3") {
      set_error_message("Please login as an student");
      setTimeout(() => set_error_message(null), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("item_id", courseId);
    formData.append("user_id", user_id);

    try {
      const resp = await axios.post(
        `${baseUrl}/cart/add`,
        formData,
        authorizationObj
      );
      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        set_error_message(resp?.data?.message);
        setTimeout(() => set_error_message(null), 3000);
        return;
      }
      set_success_message("Item added to cart successfully!");
      setTimeout(() => set_success_message(null), 3000);
    } catch (error) {
      // console.error(error);
      set_error_message("Item is already in the cart");
      setTimeout(() => set_error_message(null), 3000);
    }
  };

  const AddToWishlist = async (courseId: string) => {
    if (!courseId) return;

    if (!currentUser?.isLogin) {
      router.push("/auth/signin");
      return;
    }

    if (currentUser?.user?.role_id !== "3") {
      set_error_message("Please Login as an student");
      setTimeout(() => set_error_message(null), 3000);
      return;
    }

    const formData = new FormData();
    formData.append("course_id", courseId);
    formData.append("user_id", user_id);

    try {
      const resp = await axios.post(
        `${baseUrl}/wishlist/add`,
        formData,
        authorizationObj
      );
      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        set_error_message(resp?.data?.message);
        setTimeout(() => set_error_message(null), 3000);
        return;
      }
      if (resp?.data?.message === "Item already in wishlist.") {
        set_error_message("Item is already in favourites");
        setTimeout(() => {
          set_error_message(null);
        }, 3000);
        return;
      }
      set_success_message("Item added to wishlist successfully!");
      setTimeout(() => set_success_message(null), 3000);
    } catch (error) {
      // console.error(error);
      set_error_message("Something went wrong, please try later");
      setTimeout(() => set_error_message(null), 3000);
    }
  };

  useEffect(() => {
    get_course_additional_info(_course?.course_id);
    get_live_sessions(_course?.course_id);
  }, [_course, _course?.course_id]);

  const get_course_additional_info = async (courseId: any) => {
    if (!courseId || courseId?.trim() === "") return;
    try {
      const resp = await axios.get(
        `${baseUrl}/courses/${courseId}/additional`,
        authorizationObj
      );
      if (resp?.data?.data && resp?.data?.data?.length && resp?.data?.data[0]) {
        set_course_additional_information(resp?.data?.data[0]);
      }
    } catch (error) {
      // console.error(error)
      set_course_additional_information(null);
    }
  };

  const handleCurrencyChange = async (e: any, newVal: any) => {
    // if (newVal) {
    //     set_selected_currency(newVal)
    //     try {
    //         const resp = await axios.get(`${baseUrl}/payment/get-priceMatrix/${newVal}`, authorizationObj)
    //         const price = resp?.data?.data.find((r: any) => r?.ID === _course?.course_price)
    //         set_course_price(price?.tier_price?.split(" ")[0])
    //     } catch (error) {
    // console.error(error)
    //     }
    // } else {
    //     set_selected_currency(_course?.display_currency)
    //     set_course_price(+_course?.course_display_price)
    // }
  };

  const get_live_sessions = async (courseId: string) => {
    if (!courseId || courseId?.trim() === "") return;

    try {
      const resp = await axios.get(
        `${baseUrl}/onlineclass/${courseId}`,
        authorizationObj
      );
      if (resp?.data?.data) {
        set_live_sessions(resp?.data?.data);
        set_closest_session(getClosestSession(resp?.data?.data));
      } else {
        set_live_sessions([]);
      }
    } catch (error) {
      // console.error(error)
      set_live_sessions([]);
    }
  };

  const join_live_class = async () => {
    if (!closest_session) return;
    if (!closest_session?.data) return;

    const formData = new FormData();
    formData.append("meeting_id", closest_session?.meeting_id);
    formData.append(
      "full_name",
      `${currentUser?.user?.first_name ? currentUser?.user?.first_name : ""} ${
        currentUser?.user?.last_name ? currentUser?.user?.last_name : ""
      }`
    );
    formData.append(
      "role",
      currentUser?.user?.role_id === "3"
        ? "student"
        : currentUser?.user?.role_id === "2"
        ? "instructor"
        : ""
    );

    try {
      set_is_loading(true);
      const resp = await axios.post(
        `${baseUrl}/onlineclass/joinClass`,
        formData,
        authorizationObj
      );
      set_is_loading(false);
      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        set_error_message(resp?.data?.message);
        setTimeout(() => {
          set_error_message(null);
        }, 3000);
        return;
      }
      set_redirect_url(resp?.data?.data?.joinUrl);
    } catch (error) {
      // console.error(error)
      set_is_loading(false);
      set_error_message("Something went wrong, please try later");
      setTimeout(() => {
        set_error_message(null);
      }, 3000);
    }
  };

  useEffect(() => {
    if (redirect_url) {
      window.open(redirect_url, "__blank");
      set_redirect_url("");
    }
  }, [redirect_url]);

  const format_session_time = (timeStr: string) => {
    const [startTime, endTime] = timeStr.split(" to ");
    const startFormatted = moment(startTime, "hh:mm:ss A Z").format("hh:mm A");
    const endFormatted = moment(endTime, "hh:mm:ss A Z").format("hh:mm A");
    const result = `${startFormatted} to ${endFormatted}`;
    return result;
  };

  const checkSessionTime = (sessionDate: string, sessionTimeString: string) => {
    if (!sessionDate) return false;
    if (!sessionTimeString) return false;
    const [startTime, endTime] = sessionTimeString.split(" to ");
    const startDateTime = `${sessionDate?.split(" ")[0]} ${startTime}`;
    const endDateTime = `${sessionDate?.split(" ")[0]} ${endTime}`;
    const startMoment = moment(startDateTime, "YYYY-MM-DD hh:mm:ss A Z");
    const endMoment = moment(endDateTime, "YYYY-MM-DD hh:mm:ss A Z");
    const currentTime = moment();
    const isWithinClassTime = currentTime.isBetween(
      startMoment,
      endMoment,
      null,
      "[)"
    );
    return isWithinClassTime;
  };

  useEffect(() => {
    get_course_sections(_course?.course_id);
  }, [_course]);

  const get_course_sections = async (courseId: any) => {
    if (!courseId || courseId?.trim() === "") return;
    try {
      const resp = await axios.get(
        `${baseUrl}/course-sections/by-course/${courseId}`,
        authorizationObj
      );
      if (resp?.data?.data && resp?.data?.data?.length && resp?.data?.data[0]) {
        set_total_units(resp?.data?.data?.length);
      } else {
        set_total_units(0);
      }
    } catch (error) {
      // console.error(error)
      set_total_units(0);
    }
  };

  const course_statuses = [
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
    { label: "Approved", value: "approved" },
  ];

  const get_course_duration = async (courseId: string) => {
    if (!courseId || courseId.trim() === "") return;

    try {
      const response = await axios.get(
        `${baseUrl}/courses/${courseId}`,
        authorizationObj
      );

      const course = response?.data?.data?.[0];

      if (!course?.start_date || !course?.end_date) {
        console.warn("Start date or end date missing");
        set_total_duration(0);
        return;
      }

      const startDate = new Date(course.start_date);
      const endDate = new Date(course.end_date);

      const diffInMs = endDate.getTime() - startDate.getTime();
      const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

      set_total_duration(diffInDays); // or use another setter if needed
    } catch (error) {
      console.error("Failed to fetch course duration by date", error);
      set_total_duration(0);
    }
  };

  useEffect(() => {
    if (_course?.course_id) {
      get_course_duration(_course?.course_id);
    }
  }, [_course?.course_id]);

  const handle_status_change = async (e: any) => {
    if (!_course?.course_id || _course?.course_id?.trim() === "") return;
    set_course_status(e?.target?.value);
    const formData = new FormData();
    formData.append("course_status", e?.target?.value);
    try {
      const resp = await axios.post(
        `${baseUrl}/courses/update/${_course?.course_id}`,
        formData,
        authorizationObj
      );
      if (resp?.data?.status > 299 || resp?.data?.status < 200) {
        set_error_message(resp?.data?.message);
        setTimeout(() => {
          set_error_message(null);
        }, 3000);
      }
      set_success_message("Course Status Updated Sucessfully");
      setTimeout(() => {
        set_success_message(null);
      }, 3000);
    } catch (error) {
      // console.error(error)
      set_error_message("Something went wrong, please try later");
      setTimeout(() => {
        set_error_message(null);
      }, 3000);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ backgroundColor: "#1a2733" }}>
      {/* Course Title Bar */}

      {/* Main Content */}
      <div className="container py-4">
        <div className="row">
          {/* Left Column - Video */}
          <div className="col-12 col-lg-7 mb-4 mb-lg-0">
            <div className="text-white py-3">
              <div className="row">
                <div className="col-12">
                  <span
                    className="fs-5 fw-semibold rounded-pill px-2 py-1"
                    style={{ backgroundColor: "#223548" }}
                  >
                    Learning Journey
                  </span>
                  <h1 className="h3 fw-bold mb-0">{_course?.course_title}</h1>
                  <div
                    className="d-flex align-items-center gap-4 mt-2 p-2 border-2 rounded-2"
                    style={{ backgroundColor: "#223548" }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <i className="fas fa-book-open"></i>
                      <span>Total {total_units} Units</span>
                      <span>|</span>
                      <span>
                        Total{" "}
                        <span className="fw-semibold">
                          {Math.floor(total_duration / 30)} months{" "}
                          {total_duration % 30} days
                        </span>{" "}
                        Duration
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="ratio ratio-16x9">
              <video
                src={`${courseVideoPath}/${_course?.course_intro_video}`}
                className="object-fit-cover w-100 rounded"
                poster={`${courseThumbnailPath}/${_course?.course_thumbnail}`}
                controls
                autoPlay
              ></video>
            </div>

            {/* Course Status (Admin Only) */}
            {currentUser?.user?.role_id === "1" && course_status && (
              <div className="mt-4">
                <div className="d-flex align-items-center gap-3">
                  <p className="text-white m-0">Course Status:</p>
                  <FormControl
                    variant="outlined"
                    sx={{
                      width: "200px",
                      backgroundColor: "#fff",
                      borderRadius: "10px",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#ccc",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#1976d2",
                      },
                    }}
                  >
                    <Select
                      value={course_status}
                      onChange={handle_status_change}
                    >
                      {course_statuses?.map((item: any, i: number) => (
                        <MenuItem value={item?.value} key={i}>
                          {item?.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Course Info */}
          <div className="col-12 col-lg-5 py-3 text-white">
            <div className="mb-4">
              <h5 className="mb-3">Course Overview</h5>
              <div>
                <MuiMarkdown>{_course?.course_description}</MuiMarkdown>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="mb-3">Learning objectives</h5>
              <div>
                <MuiMarkdown>
                  {course_additional_information?.what_you_will_learn}
                </MuiMarkdown>
              </div>
            </div>

            <div className="mb-4">
              <h5 className="mb-3">Your current experience in this topic</h5>
              <div className="d-flex align-items-center justify-content-between">
                {/* Beginner Level Progress */}
                {_course?.course_level?.toUpperCase() === "BEGINNER" && (
                  <div className="text-center">
                    <p className="mb-1 small">Beginner</p>
                    <div
                      className="progress"
                      style={{ width: "300px", height: "4px" }}
                    >
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: "35%", // Beginner level
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Intermediate Level Progress */}
                {_course?.course_level?.toUpperCase() === "INTERMEDIATE" && (
                  <div className="text-center">
                    <p className="mb-1 small">Intermediate</p>
                    <div
                      className="progress"
                      style={{ width: "300px", height: "4px" }}
                    >
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: "70%", // Intermediate level
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Advanced Level Progress */}
                {_course?.course_level?.toUpperCase() === "ADVANCED" && (
                  <div className="text-center">
                    <p className="mb-1 small">Advanced</p>
                    <div
                      className="progress"
                      style={{ width: "300px", height: "4px" }}
                    >
                      <div
                        className="progress-bar bg-primary"
                        style={{
                          width: "100%", // Advanced level
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h5 className="mb-2">Course Instuctor</h5>
              <p className=" mb-0">
                {_course?.instructor_first_name} {_course?.instructor_last_name}
              </p>
            </div>

            <div className="mb-4">
              <h5 className="mb-2">Prerequisites</h5>
              <div className="text-white">
                <MuiMarkdown>
                  {course_additional_information?.requirements}
                </MuiMarkdown>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center">
              {closest_session && (
                <button
                  className="btn btn-secondary px-4"
                  disabled={
                    !closest_session ||
                    is_loading ||
                    !currentUser ||
                    !_course?.is_enrolled
                  }
                  onClick={join_live_class}
                >
                  {is_loading ? "Joining" : "Join Live Class"}
                </button>
              )}

              {currentUser?.user?.role_id === "3" || !currentUser?.isLogin ? (
                <div className="d-flex gap-2">
                  {!_course?.is_enrolled && (
                    <button
                      className="btn btn-view text-white rounded-pill"
                      // style={{
                      //   color: "#fff",
                      //   backgroundColor: "#2691d7",
                      //   borderColor: "#2691d7",
                      // }}
                      onClick={() => AddtoCart(_course.course_id)}
                    >
                      <AddShoppingCartIcon /> Add to Cart
                    </button>
                  )}
                  <button
                    className=" btn btn-view text-white rounded-pill"
                    // style={{
                    //   color: "#fff",
                    //   backgroundColor: "#2691d7",
                    //   borderColor: "#2691d7",
                    // }}
                    onClick={() => AddToWishlist(_course.course_id)}
                  >
                    <FavoriteIcon /> Add to Favourites
                  </button>
                  <button
                    className="btn btn-view text-white rounded-pill"
                    onClick={() => setShowIcons(!showIcons)}
                  >
                    <Share /> Share
                  </button>
                </div>
              ) : (
                <p className="text-white mb-0">
                  Please login as a student to enroll or purchase
                </p>
              )}
            </div>
            {showIcons && (
              <div
                className="position-absolute  mt-2 p-3 bg-white rounded shadow-lg d-flex gap-3 "
                style={{ right: "100px", zIndex: 9999 }}
              >
                <FacebookShareButton url={pageurl} title={"title"}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <WhatsappShareButton url={pageurl} title={"title"}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
                <TwitterShareButton url={pageurl} title={"title"}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <LinkedinShareButton url={pageurl} title={"title"}>
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
                <EmailShareButton url={pageurl}>
                  <EmailIcon size={32} round />
                </EmailShareButton>
                <TelegramShareButton url={pageurl}>
                  <TelegramIcon size={32} round />
                </TelegramShareButton>
                <button
                  onClick={handleCopy}
                  className="btn btn-light d-flex align-items-center justify-content-center"
                  title="Copy link"
                  style={{ width: 48, height: 32, borderRadius: "50%" }}
                >
                  <FaLink size={48} />
                </button>
              </div>
            )}
            {/* Live Session Info */}
            {closest_session && (
              <div className="mt-4 text-secondary">
                <p className="mb-1">
                  <span className="fw-bold">Next Live Class:</span>{" "}
                  {moment(closest_session?.data?.start_date).format(
                    "DD/MM/YYYY"
                  )}{" "}
                  {format_session_time(closest_session?.data?.class_time)}
                </p>
                <p className="mb-0">
                  Duration: {closest_session?.data?.class_duration}
                </p>
                <p className="mb-0">{closest_session?.data?.title}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error_message && <AlertMUI text={error_message} status="error" />}
      {success_message && <AlertMUI text={success_message} status="success" />}
    </div>
  );
};

export default Section1;
