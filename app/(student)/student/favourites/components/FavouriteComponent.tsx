import React, { useState, useEffect } from 'react';
import { IoHeart } from "react-icons/io5";
import CourseCard from '@/app/components/CourseCard';
import CourseCardSkeleton from '@/app/components/mui/CourseCardSkeleton';
import { Typography } from '@mui/material';
import { authorizationObj, baseUrl } from "@/app/utils/core";
import axios from "axios";
import { useSelector } from "react-redux";
import toast, { Toaster } from 'react-hot-toast';

export const EmptyFavourites = () => {
  return (
    <div className="container-fluid py-5">
      <div className="row justify-content-center">
        <div className="col-12 text-center">
          <IoHeart style={{ fontSize: "120px" }} className="mb-4" />
          <Typography variant="h4" component="h2" className="fw-bold">
            No Items in Favourites
          </Typography>
        </div>
      </div>
    </div>
  );
};

interface FavouriteComponentProps {
  data: any[]; // This is the list of favourite courses
  get_data: () => void; // Function to fetch new data from API
  is_loading: boolean;
  set_is_loading: (loading: boolean) => void;
}

const FavouriteComponent: React.FC<FavouriteComponentProps> = ({
  data,
  get_data,
  is_loading,
  set_is_loading
}) => {
  const currentUser = useSelector((state: any) => state?.user);
  
  // State to store the local favourite list
  const [localFavourites, setLocalFavourites] = useState(data);

  useEffect(() => {
    // Sync the data prop when it changes
    setLocalFavourites(data);
  }, [data]);

  const removeFromFavourites = async (courseId: string, wishlistId: string) => {
    try {
      set_is_loading(true);
      // Make the API call to remove from the wishlist
      const response = await axios.delete(
        `${baseUrl}/wishlist/remove/${currentUser.user_id}/${courseId}`,
        authorizationObj
      );

      // Optimistically remove the course from local state
      setLocalFavourites((prevFavourites) =>
        prevFavourites.filter((course) => course.wishlist_id !== wishlistId)
      );

      // Call the get_data function to ensure the UI is in sync with the backend
      get_data(); // Refresh data from the backend after successful removal

      // Show a success toast
      toast.success('Course removed from favourites!');
      
    } catch (err) {
      // Handle error and show error toast
      toast.error("❌ Failed to remove from favourites: " + (err as Error).message);
      set_is_loading(false);
    }
  };

  if (is_loading) {
    return (
      <div className="row g-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-3">
            <CourseCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!localFavourites?.length) {
    return <EmptyFavourites />;
  }

  return (
    <>
      {/* Toast container for notifications */}
      <Toaster position="top-center" />
      
      <div className="row g-4">
        {localFavourites.map((course, index) => (
          <div key={course.course_id || index} className="col-12 col-sm-6 col-lg-3">
            <CourseCard
              course={{
                ...course,
                display_price: course.display_price || course.course_price,
                currency: course.currency || course.display_currency,
              }}
              options={{
                is_favourite: true,
                onFavouriteUpdate: () => removeFromFavourites(course.course_id, course.wishlist_id),
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default FavouriteComponent;
