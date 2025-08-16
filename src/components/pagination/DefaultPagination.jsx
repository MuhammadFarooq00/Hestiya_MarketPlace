// import React from "react";
// import { Button, IconButton } from "@material-tailwind/react";
// import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";

// const DefaultPagination = ({ activePage, setActivePage, totalItems }) => {
//   // Calculate total pages based on total items and items per page
//   const totalPages = Math.ceil(totalItems / 10);

//   if (totalPages <= 0) return null;

//   const getItemProps = (index) => ({
//     variant: activePage === index ? "filled" : "text",
//     onClick: () => setActivePage(index),
//   });

//   const next = () => {
//     if (activePage === totalPages) return;
//     setActivePage(activePage + 1);
//   };

//   const prev = () => {
//     if (activePage === 1) return;
//     setActivePage(activePage - 1);
//   };

//   // Calculate which page numbers to display, for example, only 5 page numbers
//   const pageNumbers = [];
//   const visiblePages = 5; // You can adjust this number based on how many page numbers you want visible
//   let startPage = Math.max(1, activePage - Math.floor(visiblePages / 2));
//   let endPage = startPage + visiblePages - 1;

//   if (endPage > totalPages) {
//     endPage = totalPages;
//     startPage = Math.max(1, totalPages - visiblePages + 1);
//   }

//   for (let i = startPage; i <= endPage; i++) {
//     pageNumbers.push(i);
//   }
  
//   console.log("check the props : ", activePage, setActivePage, totalPages) 

//   return (
//     <div className="flex items-center gap-4">
//       <Button
//         variant="text"
//         className="flex items-center gap-2"
//         onClick={prev}
//         disabled={activePage === 1}
//       >
//         <FaLongArrowAltLeft strokeWidth={2} className="h-4 w-4" /> Previous
//       </Button>
      
//       <div className="flex items-center gap-2">
//         {pageNumbers.map((pageNum) => (
//           <IconButton
//             key={pageNum}
//             className={`${activePage === pageNum ? "!bg-[#CDDC6E] text-black" : ""}`}
//             {...getItemProps(pageNum)}
//           >
//             {pageNum}
//           </IconButton>
//         ))}
//       </div>

//       <Button
//         variant="text"
//         className="flex items-center gap-2"
//         onClick={next}
//         disabled={activePage === totalPages}
//       >
//         Next
//         <FaLongArrowAltRight strokeWidth={2} className="h-4 w-4" />
//       </Button>
//     </div>
//   );
// };

// export default DefaultPagination;




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

  // console.log("check the props : ", activePage, setActivePage, totalPages)

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="text"
        className="flex items-center gap-2"
        onClick={prev}
        disabled={activePage === 1}
      >
        <FaLongArrowAltLeft strokeWidth={2} className="h-4 w-4" /> Previous
      </Button>
      <div className="flex items-center gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <IconButton
            key={i}
            className={`${activePage === i + 1 ? "!bg-[#CDDC6E] text-black" : ""}`}
            {...getItemProps(i + 1)}
          >
            {i + 1}
          </IconButton>
        ))}
      </div>
      <Button
        variant="text"
        className="flex items-center gap-2"
        onClick={next}
        disabled={activePage === totalPages}
      >
        Next
        <FaLongArrowAltRight strokeWidth={2} className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DefaultPagination;
