import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import countryList from "react-select-country-list";
import Select from "react-select";
import { toast } from "react-toastify";

const Residence = () => {
  const navigate = useNavigate();
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Effect to load selected country from localStorage when the component mounts
  useEffect(() => {
    const storedCountry = localStorage.getItem("selectedCountry");
    if (storedCountry) {
      const country = countryOptions.find(
        (option) => option.label === storedCountry
      );
      setSelectedCountry(country || null);
    }
  }, []);

  const handleStart = () => {
    if (selectedCountry) {
      // console.log("country", selectedCountry.label);
      localStorage.setItem("selectedCountry", selectedCountry.label);
      navigate(`/ocean/questionnaire`)
    } else {
      toast.error("Select Your Country of Incorporation");
    }
  };

  const handleClose = () => {
    localStorage.removeItem("selectedCountry"); // Clear the country from localStorage
    navigate("/ocean"); // Navigate back to the instruction page
  };

  const countryOptions = countryList()
    .getData()
    .map((country) => ({
      value: country.value,
      label: country.label,
    }));

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#e5e7eb", // Gray background
      borderColor: "#d1d5db", // Tailwind gray-400
      boxShadow: "none",
      "&:hover": {
        borderColor: "#9ca3af", // Tailwind gray-500
      },
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Ensure the dropdown appears above other elements
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "black", // Text color for the selected value
      textAlign: "left", // Align the selected value to the left
    }),
    option: (provided, { isFocused }) => ({
      ...provided,
      color: "black", // Text color for the dropdown options
      backgroundColor: isFocused ? "#d1d5db" : "white", // Change background color on hover
      textAlign: "left", // Align option text to the left
      display: "flex", // Enable flexbox layout for the option
      alignItems: "center", // Center option contents vertically
      padding: "10px", // Add padding for better click area
    }),
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full h-[calc(100vh-74px)] px-6 flex flex-col items-center justify-between">
        <div className="flex justify-end mt-6 w-full">
          <button
            onClick={handleClose}
            className="p-[3px] bg-gray-400 text-white rounded-full"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>
        <div className="text-center w-full sm:w-[400px] flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <div className="text-3xl font-bold">Please Confirm</div>
            <div className="text-base text-gray-600">
              your Country of residence:
            </div>
          </div>
          <div>
            <Select
              options={countryOptions}
              value={selectedCountry}
              onChange={setSelectedCountry}
              styles={customStyles}
              placeholder="Select your country..."
            />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-center">
              <img
                src="/src/assets/images/lightbulb.png"
                className="w-auto h-14"
                alt=""
              />
            </div>
            <div className="text-base text-gray-600">
              This information will be used to determine the right values for
              calculating your carbon footprint
            </div>
          </div>
        </div>
        <div className="text-center w-full sm:w-[400px] mb-14">
          <button
            onClick={handleStart}
            className="py-3 w-full bg-darkgreen text-xl capitalize font-semibold text-white rounded-2xl"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default Residence;
