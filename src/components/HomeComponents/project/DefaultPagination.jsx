import React from "react";
import { Button, IconButton } from "@material-tailwind/react";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";

const DefaultPagination = ({ activePage, setActivePage, totalPages }) => {
  if (totalPages <= 0) return null;

  const getItemProps = (index) => ({
    variant: activePage === index ? "filled" : "text",
    onClick: () => setActivePage(index),
  });

  const next = () => {
    if (activePage === totalPages) return;
    setActivePage(activePage + 1);
  };

  const prev = () => {
    if (activePage === 1) return;
    setActivePage(activePage - 1);
  };

  // Helper function to create a range of numbers
  const range = (start, end) => {
    return Array(end - start + 1)
      .fill()
      .map((_, idx) => start + idx);
  };

  const renderPagination = () => {
    let pages = [];

    if (totalPages <= 6) {
      pages = range(1, totalPages); // If less than 6 pages, show all
    } else if (activePage <= 3) {
      // If active page is within the first 3 pages
      pages = [...range(1, 3), "...", totalPages - 1, totalPages];
    } else if (activePage >= totalPages - 3) {
      // If active page is within the last 3 pages
      pages = [1, 2, 3, "...", ...range(totalPages - 2, totalPages)];
    } else {
      // Active page is in the middle, show 3 after activePage
      pages = [
        1, 2, 3,  // First three pages
        "...",
        activePage,
        activePage + 1,
        activePage + 2,
        "...",
        totalPages - 1,
        totalPages,
      ];
    }

    return pages.map((page, i) =>
      typeof page === "string" ? (
        <span key={i} className="px-2 text-gray-500">
          {page}
        </span>
      ) : (
        <IconButton
          key={i}
          className={`${
            activePage === page ? "!bg-[#CDDC6E] text-black" : ""
          }`}
          {...getItemProps(page)}
        >
          {page}
        </IconButton>
      )
    );
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="text"
        className="flex items-center gap-2"
        onClick={prev}
        disabled={activePage === 1}
      >
        <FaLongArrowAltLeft strokeWidth={2} className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2">{renderPagination()}</div>
      <Button
        variant="text"
        className="flex items-center gap-2"
        onClick={next}
        disabled={activePage === totalPages}
      >
        <FaLongArrowAltRight strokeWidth={2} className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DefaultPagination;
