import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { baseUrl, authorizationObj } from "@/app/utils/core";
import Markdown from "@/app/components/markdown/Markdown";

interface Category {
  category_id: string;
  category_name: string;
  category_description: string;
}

interface Currency {
  value: string;
  label: string;
}

interface PriceMatrix {
  ID: string;
  tier_price: string;
  value: string;
  label: string;
}

interface Timezone {
  value: string;
  label: string;
}

interface ModalProps {
  show: boolean;
  onClose: () => void;
  onCreate: (formData: FormData) => void;
}

const COURSE_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const LANGUAGES = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "hindi", label: "Hindi" },
];

const CreateCourseModal: React.FC<ModalProps> = ({ show, onClose, onCreate }) => {
  const currentUser = useSelector((state: any) => state.user);
  const currentInstitute = useSelector((state: any) => state.institute);

  const [categories, setCategories] = useState<Category[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [priceMatrix, setPriceMatrix] = useState<PriceMatrix[]>([]);
  const [timezones, setTimezones] = useState<Timezone[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    courseTitle: "",
    courseDescription: "",
    courseCategoryId: "",
    courseCurrency: "",
    coursePrice: "",
    courseLanguage: "",
    courseLevel: "beginner",
    startDate: "",
    endDate: "",
    classTiming: "",
    courseStatus: "active",
    timezone: "",
  });

  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [courseIntroVideo, setCourseIntroVideo] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");

  useEffect(() => {
    if (show) {
      fetchCategories();
      fetchCurrency();
      fetchTimezones();
    }
  }, [show]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/course-categories`, authorizationObj);
      if (response.data.status === 200) {
        setCategories(response.data.data);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrency = async () => {
    try {
      const resp = await axios.get(`${baseUrl}/payment/get-currency`, authorizationObj);
      if (resp?.data?.status !== 200) {
        console.error('Failed to fetch currency');
        return;
      }
      const formattedCurrencies: Currency[] = resp?.data?.currency.map((curr: string) => ({
        value: curr,
        label: curr
      }));
      setCurrencies(formattedCurrencies);
    } catch (error) {
      console.error('Currency fetch error:', error);
    }
  };

  const fetchPriceMatrix = async (currency: string) => {
    try {
      setLoading(true);
      const resp = await axios.get(`${baseUrl}/payment/get-priceMatrix/${currency}`, authorizationObj);
    
      if (resp?.data?.data) {
        const processedData = resp.data.data.map((item: any) => ({
          ID: item.ID || `price-${Math.random()}`,
          tier_price: item.tier_price,
          value: item.ID || `price-${Math.random()}`,
          label: item.tier_price
        }));
        setPriceMatrix(processedData);
      } else {
        setPriceMatrix([]);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to fetch price matrix");
      setPriceMatrix([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimezones = async () => {
    try {
      const response = await axios.get('https://api.timezonedb.com/v2.1/list-time-zone?key=U3XB8OHVWVAD&format=json');
  
      if (response.data?.zones) {
        const zones = response.data.zones;
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
        const formattedTimezones: Timezone[] = [
          {
            value: userTimezone,
            label: `${userTimezone} (Your timezone)`
          },
          ...zones
            .filter((tz: any) => tz.zoneName !== userTimezone)
            .sort((a: any, b: any) => a.gmtOffset - b.gmtOffset)
            .map((tz: any) => ({
              value: tz.zoneName,
              label: `${tz.zoneName} (GMT${tz.gmtOffset >= 0 ? '+' : ''}${tz.gmtOffset / 3600})`
            }))
        ];
  
        setTimezones(formattedTimezones);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('Timezone fetch error:', error);
      setError('Failed to fetch timezones');
    }
  };
  
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    if (name === "courseCurrency" && value) {
      fetchPriceMatrix(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'thumbnail') {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file for the thumbnail');
        return;
      }
      setCourseThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      if (!file.type.startsWith('video/')) {
        setError('Please upload a video file for the intro');
        return;
      }
      setCourseIntroVideo(file);
    }
  };

  const validateForm = (formData: any): boolean => {
    const validations = [
      { condition: !formData.courseTitle.trim(), message: "Course title is required" },
      { condition: !formData.courseDescription.trim(), message: "Course description is required" },
      { condition: !formData.courseCategoryId, message: "Please select a category" },
      { condition: !formData.startDate || !formData.endDate, message: "Start and end dates are required" },
      { condition: new Date(formData.startDate) >= new Date(formData.endDate), message: "End date must be after start date" },
      { condition: !formData.classTiming, message: "Class timing is required" },
      { condition: !formData.timezone, message: "Please select a timezone" },
      { condition: !courseThumbnail, message: "Course thumbnail is required" },
    ];
  
    for (const { condition, message } of validations) {
      if (condition) {
        setError(message);
        return false;
      }
    }
  
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 

    if (!validateForm(formData)) {
      return;
    }

    const submitFormData = new FormData();
    
    // Add all form fields
    submitFormData.append("course_title", formData.courseTitle);
    submitFormData.append("course_description", formData.courseDescription);
    submitFormData.append("course_category_id", formData.courseCategoryId);
    submitFormData.append("course_currency", formData.courseCurrency);
    submitFormData.append("course_price", formData.coursePrice);
    submitFormData.append("course_language", formData.courseLanguage);
    submitFormData.append("course_level", formData.courseLevel);
    submitFormData.append("start_date", formData.startDate);
    submitFormData.append("end_date", formData.endDate);
    submitFormData.append("class_timing", formData.classTiming);
    submitFormData.append("course_status", formData.courseStatus);
    submitFormData.append("time_zone", formData.timezone);
    submitFormData.append("institute_id", currentInstitute?.institute_id || "");
    submitFormData.append("instructor_id", currentUser?.user_id || "");
    submitFormData.append("is_public", "1");
    submitFormData.append("course_type", "1");
    // Add files
    if (courseThumbnail) submitFormData.append("course_thumbnail", courseThumbnail);
    if (courseIntroVideo) submitFormData.append("course_intro_video", courseIntroVideo);

    try {
      setLoading(true);
      const response = await axios.post(`${baseUrl}/courses/create`, submitFormData, {
        ...authorizationObj,
        headers: {
          ...authorizationObj.headers,
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 8000,
        withCredentials: true
      });
      
      if (response.data.status === 200) {
        alert("Course created successfully");
        if (onCreate) {
          onCreate(submitFormData);
        }
        handleClose();
      } else {
        setError(response.data.message || "Failed to create course");
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      if (error.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (error.response) {
        setError(error.response.data?.message || 'Server error occurred');
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError('Failed to create course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      courseTitle: "",
      courseDescription: "",
      courseCategoryId: "",
      courseCurrency: "",
      coursePrice: "",
      courseLanguage: "",
      courseLevel: "beginner",
      startDate: "",
      endDate: "",
      classTiming: "",
      courseStatus: "active",
      timezone: "",
    });
    setCourseThumbnail(null);
    setCourseIntroVideo(null);
    setThumbnailPreview("");
    setError("");
    onClose();
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      tabIndex={-1}
      style={{ 
        display: 'block',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
      aria-hidden={!show}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered border-0">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Create New Course</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              aria-label="Close"
            />
          </div>
  
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
  
            <form id="courseForm" onSubmit={handleSubmit}>
              <div className="row">
  
                {/* Course Title */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="courseTitle" className="form-label">Course Title</label>
                  <input
                    type="text"
                    id="courseTitle"
                    name="courseTitle"
                    className="form-control"
                    value={formData.courseTitle}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter course title"
                  />
                </div>
  
                {/* Category */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="courseCategoryId" className="form-label">Category</label>
                  <select
                    id="courseCategoryId"
                    name="courseCategoryId"
                    className="form-select"
                    value={formData.courseCategoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.category_id} value={category.category_id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Description */}
                <div className="col-12 mb-3">
                  <Markdown
                    label="Course Description"
                    value={formData.courseDescription}
                    onChange={(text: any) => setFormData(prev => ({ ...prev, courseDescription: text }))}
                  />
                </div>

                {/* Language */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="courseLanguage" className="form-label">Language</label>
                  <select
                    id="courseLanguage"
                    name="courseLanguage"
                    className="form-select"
                    value={formData.courseLanguage}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Level */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="courseLevel" className="form-label">Level</label>
                  <select
                    id="courseLevel"
                    name="courseLevel"
                    className="form-select"
                    value={formData.courseLevel}
                    onChange={handleInputChange}
                    required
                  >
                    {COURSE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Start Date */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="startDate" className="form-label">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="form-control"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
  
                {/* End Date */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="endDate" className="form-label">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="form-control"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
  
                {/* Timezone */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="timezone" className="form-label">Timezone</label>
                  <select
                    id="timezone"
                    name="timezone"
                    className="form-select"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Timezone</option>
                    {timezones.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Class Timing */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="classTiming" className="form-label">Class Timing</label>
                  <input
                    type="time"
                    id="classTiming"
                    name="classTiming"
                    className="form-control"
                    value={formData.classTiming}
                    onChange={handleInputChange}
                    required
                  />
                </div>
  
                {/* Currency */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="courseCurrency" className="form-label">Currency</label>
                  <select
                    id="courseCurrency"
                    name="courseCurrency"
                    className="form-select"
                    value={formData.courseCurrency}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a Currency</option>
                    {currencies?.map((currency, idx) => (
                      <option key={`currency-${idx}`} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Price Tier */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="coursePrice" className="form-label">Price Tier</label>
                  <select
                    id="coursePrice"
                    name="coursePrice"
                    className="form-select"
                    value={formData.coursePrice}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.courseCurrency}
                  >
                    <option value="">Select a price tier</option>
                    {priceMatrix?.map((tier, idx) => (
                      <option key={tier.ID || `tier-${idx}`} value={tier.tier_price}>
                        {tier.tier_price}
                      </option>
                    ))}
                  </select>
                </div>
  
                {/* Thumbnail */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="thumbnail" className="form-label">Course Thumbnail</label>
                  <input
                    type="file"
                    id="thumbnail"
                    name="thumbnail"
                    accept="image/*"
                    className="form-control"
                    onChange={(e) => handleFileChange(e, 'thumbnail')}
                    required={!courseThumbnail}
                  />
                  {thumbnailPreview && (
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="mt-2"
                      style={{ maxWidth: '100px', height: 'auto' }}
                    />
                  )}
                </div>
  
                {/* Intro Video */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="introVideo" className="form-label">Intro Video (Optional)</label>
                  <input
                    type="file"
                    id="introVideo"
                    name="introVideo"
                    accept="video/*"
                    className="form-control"
                    onChange={(e) => handleFileChange(e, 'video')}
                  />
                  <small className="text-muted">A 1–2 min video of the course goals and benefits.</small>
                </div>
              </div>
            </form>
          </div>
  
          {/* Footer */}
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="courseForm"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseModal;
