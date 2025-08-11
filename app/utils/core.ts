export const userNamePattern = /^[a-zA-Z0-9 !@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{2,15}$/;
export const emailPattern = /^[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
export const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)(?!.*\s{2})[a-zA-Z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,24}$/;
export const otpPattern = /^[a-zA-Z0-9]{6}$/
export const phoneNumberPattern = /^03\d{9}$/
export const rollNoPattern = /^\d{6}$/

export const paginationRowsPerPageData = [10, 20, 30, 40, 50]
export const educationOptions = ["Middle", "Matric", "Intermediate", "O level/A Level", "Undergraduate", "Graduated", "Other"]
export const educationArray = educationOptions.map((option: string) => option?.toUpperCase())
export const genderOptions = ["Male", "Female", "Other"]
export const genderArray = genderOptions.map((option: string) => option?.toUpperCase())
export const profilePictureSizeLimit = 10000000 // 1_mb

// export const baseUrl = "https://api.kiacademy.in/api"
export const baseUrl = "https://api.kiacademy.in/dev-api/"
export const webUrl = "https://kiacademy.in"
export const profilePicture = "/images/profile-picture_ufgahm.png"
export const serverToken = "Bearer skca17503e8090629285ecbc75f309379799df12d"
export const authorizationObj = { withCredentials: true, headers: { Authorization: serverToken } }
export const courseThumbnailPath = "https://api.kiacademy.in/uploads/courses/image"
export const courseVideoPath = "https://api.kiacademy.in/uploads/courses/introvideo"
export const profilePicturePath = "https://api.kiacademy.in/uploads/profile_pictures"
export const lectureVideoPath = "https://api.kiacademy.in/uploads/courses/lecturerVideo"
export const documentsPath = "https://api.kiacademy.in/uploads/documents"
export const RecordedResourcesPath = "https://api.kiacademy.in/uploads/recorded_lecture_resources"
// export const webDomainName = "localhost"
export const webDomainName = "kiacademy"

export const user_status_options = [
    { label: "Active", value: "active" },
    { label: "Pending", value: "pending" },
    { label: "Rejected", value: "rejected" },
]

export const course_language_options = [
    "English", "Urdu", "Hindi", "Arabic",
]

export const subscription_plans_medium_singular = [
    "day", "month", "year"
]

export const subscription_plans_medium_plural = [
    "days", "months", "years"
]

export const courseContentPath = process.env.NEXT_PUBLIC_COURSE_CONTENT_PATH || '/course-content';
