import React from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FaChevronLeft } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa";

const MultiQuestion = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/ocean/residence");
  };
  const handleClose = () => {
    localStorage.removeItem("selectedCountry");
    navigate("/ocean");
  };
  const handleBack = () => {
    navigate("/ocean/residence");
  };
  return (
    <>
      <div className="w-full flex justify-center">
        <div className="relative w-full h-[calc(100vh-74px)] px-2 flex flex-col items-center justify-between overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full">
            <video
              className="object-cover w-full h-full"
              autoPlay
              loop
              muted
              src="/src/assets/video/moontain.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="relative z-10 sm:px-6 flex justify-between mt-6 w-full">
            <button
              onClick={handleBack}
              className="p-[3px] text-white rounded-full"
            >
              <FaChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleClose}
              className="p-[3px]  text-white rounded-full"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          <div className="relative z-10 flex flex-col gap-3 w-full mb-4 sm:mb-14">
            <div className="bg-white text-base w-full sm:w-[340px] px-5 py-4 rounded-t-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-none">
              Okay, let's figure out what your{" "}
              <span className="font-semibold">personal carbon footprint</span>{" "}
              looks like!
            </div>
            <div className="bg-white text-base w-full sm:w-[340px] px-5 py-4 rounded-t-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-none">
              On the top you see the averge, annual Pakistan footprint
            </div>
            <div className="bg-white text-base w-full sm:w-[340px] px-5 py-4 rounded-t-3xl rounded-tr-3xl rounded-br-3xl rounded-bl-none">
              Okay, let's figure out what your{" "}
              <span className="font-semibold">Keep</span>{" "}
              looks like!
            </div>

            <div className="w-full flex justify-center">
              <button
                onClick={handleStart}
                className="py-3 px-14 bg-darkgreen text-xl capitalize font-semibold text-white rounded-full"
              >
                <FaArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiQuestion;
