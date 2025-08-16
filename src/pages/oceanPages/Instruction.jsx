import React from "react";
import { useNavigate } from "react-router-dom";

const Instruction = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/ocean/residence"); // Navigate to the questionnaire
  };

  return (
    <div className="w-full flex justify-center">
      <div className="relative w-full h-[calc(100vh-74px)] flex flex-col items-center justify-between overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <video
            className="object-cover w-full h-full"
            autoPlay
            loop
            muted
            src="/src/assets/video/watermarked_preview.mp4"
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className=""></div>
        <div className="relative z-10 text-center mt-14">
          <h1 className="text-3xl font-bold text-white">Hestiya</h1>
        </div>
        <div className="relative z-10 text-center mb-14">
          <button
            onClick={handleStart}
            className=" py-3 px-6 bg-darkgreen text-xl capitalize font-semibold text-white rounded-2xl"
          >
            calculate your footprint.
          </button>
        </div>
      </div>
    </div>
  );
};

export default Instruction;
