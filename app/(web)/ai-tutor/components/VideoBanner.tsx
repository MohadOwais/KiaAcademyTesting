"use client";

import "./main.css";
import { useState } from "react";
import { Button, IconButton, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";
import { RxCross2 } from "react-icons/rx";
import { useRouter } from "next/navigation";
import { RiRobot2Line } from "react-icons/ri";

const SearchBar = ({ text, setText }: any) => {
    return (
        <TextField
            placeholder="Ask me anything..."
            id="fullWidth"
            className="feedSearchinput w-100"
            // Icon at end of input: Clear (X) if text is present, otherwise search icon
            InputProps={{
                endAdornment: text ? (
                    <IconButton onClick={() => setText("")}>
                        <RxCross2 />
                    </IconButton>
                ) : (
                    <Search />
                ),
                sx: {
                    borderRadius: "100px",
                    padding: "0 1em",
                    '@media (min-width: 768px)': {
                        width: "400px"
                    }
                },
            }}
            variant="outlined"
            value={text}
            onChange={(e: any) => setText(e.target.value)}
            // Ensure keyboard Enter triggers form submit
            sx={{ background: "#fff", borderRadius: "200px" }}
        />
    );
};

const VideoBanner = () => {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState<string>("");

    // Handles the form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form reload behavior
        const query = searchInput.trim();

        if (!query) return; // Don't do anything if the input is empty

        // Example action: navigate or trigger search logic
        console.log("Query submitted:", query);
        // router.push(`/search?q=${encodeURIComponent(query)}`); // Uncomment to navigate to results page
    };

    return (
        <div
            className="position-relative overflow-hidden mt-1 mx-4 rounded-4"
        >
            {/* Background Video */}
            <video
                autoPlay
                muted
                loop
                className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
                style={{ zIndex: 0 }}
            >
                <source src="/videos/banner-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Content */}
            <div
                className="position-relative z-1 d-flex flex-column justify-content-center align-items-center text-center px-3"
                style={{ minHeight: "60vh", background: "rgba(0, 0, 0, 0.5)" }}
            >
                <div className="text-white">
                    {/* Heading and icon */}
                    <div className="d-flex flex-column flex-md-row align-items-center gap-3 mb-4">
                        <RiRobot2Line size={60} className="text-white mb-3 mb-md-0" />
                        <h1 className="display-4 fw-bold mb-0">Smarter Learning with AI</h1>
                    </div>

                    {/* Subheading */}
                    <p className="lead fw-semibold mb-4">
                        Tailored for Lifelong Success — Design your custom path to thrive in school, career, and life.
                    </p>

                    {/* Form for searching */}
                    {/* <form
                        onSubmit={handleSubmit}
                        className="d-flex flex-column flex-md-row gap-3 justify-content-center align-items-center w-100"
                    >
                        {/* Search input field 
                        <div className="w-md-auto">
                            <SearchBar text={searchInput} setText={setSearchInput} />
                        </div>

                        {/* Optional Submit Button (currently hidden) 
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            className="btn btn-view p-3 rounded-pill"
                            sx={{
                                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                                color: "white",
                                minWidth: "120px"
                            }}
                        >
                            Ask
                        </Button>
                    </form> */}
                </div>
            </div>
        </div>
    );
};

export default VideoBanner;
