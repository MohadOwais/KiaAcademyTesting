"use client";

import "./main.css";
import { useState } from "react";
import { Button, IconButton, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import { RxCross2 } from "react-icons/rx";
import { useRouter } from "next/navigation";

// import bgVideo from "/videos/banner-video.mp4"

const SearchBar = ({ text, setText, onSearch }: any) => {
  return (
    <TextField
      label=""
      placeholder="Search our 4000+ courses"
      id="fullWidth"
      className="feedSearchinput"
      InputProps={{
        endAdornment: (
          <>
            <IconButton
              onClick={() => setText("")}
              style={{ visibility: text ? "visible" : "hidden" }}
            >
              <RxCross2 />
            </IconButton>
            <IconButton onClick={onSearch} type="button" sx={{ color: 'var(--color-dark-2)' }}>
              <Search />
            </IconButton>
          </>
        ),
        sx: {
          borderRadius: "100px",
          width: { xs: "100%", sm: "250px", md: "350px" },
          minWidth: "150px",
          maxWidth: "100%",
          // Remove padding from the outer wrapper if needed
          padding: 0,
          "& input": {
            padding: { xs: "0 1em", sm: "0", md: "0 1em" }, // This is the key part
          },
        },
      }}
      variant="outlined"
      value={text}
      onChange={(e: any) => setText(e?.target?.value)}
      sx={{
        background: "#fff",
        borderRadius: "200px",
        "& .MuiInputBase-input::placeholder": {
          color: "var(--color-dark-2)",
          opacity: 1,
        },
      }}
    />
  );
};

const Section1 = () => {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState<string>("");

  const searchCourses = async (e: any) => {
    e?.preventDefault();
    if (!searchInput || searchInput?.trim() === "") return;
    router.push(`/current-courses?q=${searchInput}`);
  };

  return (
    <>
      <div className="section-1 d-flex justify-content-between align-items-center mt-1 mx-3">
        <video autoPlay muted loop className="video-banner text-center">
          <source src="/videos/banner-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="left">
          <h1>
            Bring your goals <br /> into focus
          </h1>
          <p>
            KI Academy offers online courses and programs that <br /> prepare
            you for every career moment
          </p>
          <form onSubmit={searchCourses}>
            <SearchBar
              text={searchInput}
              setText={setSearchInput}
              onSearch={searchCourses}
            />
          </form>
        </div>
        {/* <>
                    <div className="right">
                        <img src={man} alt="man" width={100} height={100} />
                    </div>
                </> */}
      </div>
    </>
  );
};

export default Section1;
