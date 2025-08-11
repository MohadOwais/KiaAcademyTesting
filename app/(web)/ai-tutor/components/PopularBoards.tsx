"use client";

import "./main.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Button } from "@mui/material";

// Sample board data (replace with API in future)
const boardData = [
  {
    id: 1,
    title: "CBSE",
    image: "https://placehold.co/600x400/1778bc/FFFFFF?text=CBSE",
  },
  {
    id: 2,
    title: "ICSE",
    image: "https://placehold.co/600x400/ff6f61/FFFFFF?text=ICSE",
  },
  {
    id: 3,
    title: "State Board - Maharashtra",
    image: "https://placehold.co/600x400/28a745/FFFFFF?text=Maharashtra+Board",
  },
  {
    id: 4,
    title: "State Board - Tamil Nadu",
    image: "https://placehold.co/600x400/ffc107/000000?text=TN+Board",
  },
  {
    id: 5,
    title: "IB Board",
    image: "https://placehold.co/600x400/6610f2/FFFFFF?text=IB+Board",
  },
  {
    id: 6,
    title: "Cambridge IGCSE",
    image: "https://placehold.co/600x400/20c997/FFFFFF?text=IGCSE",
  },
];

const PopularBoards = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 4;

  const totalPages = Math.ceil(boardData.length / itemsPerPage);
  const canGoNext = currentPage < totalPages - 1;
  const canGoPrev = currentPage > 0;

  const handlePrevPage = () => canGoPrev && setCurrentPage(prev => prev - 1);
  const handleNextPage = () => canGoNext && setCurrentPage(prev => prev + 1);

  const currentBoards = boardData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <section className="py-5">
      <div className="container-fluid" style={{ maxWidth: "1800px" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <div
              style={{
                width: "5px",
                height: "38px",
                background: "var(--color-dark-2, #1778bc)",
                borderRadius: "4px",
                marginRight: "16px",
              }}
            ></div>
            <h3 className="mb-0 heading-style">Popular Boards in India</h3>
          </div>
          <div className="slider-controls">
            <Button
              onClick={() => router.push("/boards")}
              className="btn rounded-pill px-4 py-2 btn-view text-white"
              color="secondary"
              variant="contained"
            >
              Browse All Boards
            </Button>

            <button
              className={`btn btn-light rounded-circle py-2 px-2 shadow-sm ${!canGoPrev && "opacity-50"}`}
              onClick={handlePrevPage}
              disabled={!canGoPrev}
            >
              <IoIosArrowBack />
            </button>
            <button
              className={`btn btn-light rounded-circle py-2 px-2 shadow-sm ms-2 ${!canGoNext && "opacity-50"}`}
              onClick={handleNextPage}
              disabled={!canGoNext}
            >
              <IoIosArrowForward />
            </button>
          </div>
        </div>

        <div className="row g-4">
          {currentBoards.map(board => (
            <div key={board.id} className="col-md-3">
              <div
                className="card h-100 relative-position border-0 rounded-4 shadow-sm d-flex flex-column p-2"
                style={{ cursor: "pointer" }}
                onClick={() => router.push(`/boards/${board.title.toLowerCase().replace(/\s+/g, "-")}`)}
              >
                <div className="position-relative" style={{ height: "200px" }}>
                  <img
                    src={board.image}
                    alt={board.title}
                    className="card-img-top rounded-4"
                    style={{ objectFit: "cover", height: "200px", width: "100%" }}
                    loading="lazy"
                  />
                </div>

                <div className="card-body pt-3 pb-2 d-flex flex-column justify-content-center align-items-center">
                  <h5 className="card-title fw-bold text-center">{board.title}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularBoards;
