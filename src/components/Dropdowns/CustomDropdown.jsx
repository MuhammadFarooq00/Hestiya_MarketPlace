import React, { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md"; // Your custom icon

const CustomDropdown = ({ label, options,showLabel ,value, onChange, id }) => {
  // State to track if dropdown is open
  const [isOpen, setIsOpen] = useState(false);

  // Toggle dropdown state on click
  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative min-w-[220px]  w-full">
      {showLabel && (
        <label
          htmlFor={id}
          className="block  text-base text-[#1D1F2199] font-semibold leading-6"
        >
          {label === "Scopes" ? "Sectorel Scopes" : label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="min-w-[220px] w-full border border-gray-300  rounded-md px-2 py-2 md:px-4 md:py-4 xlll:px-6 xlll:py-5 focus:outline-blue-500  mt-1.5 md:mt-3 pr-8 appearance-none"
          style={{ background: "transparent" }}
          onClick={handleDropdownClick} // Toggle state on click
        >
          <option value="">{label === "Scopes" ? "Select Sectoral" : "Select"}  {label}</option>
          {options && options?.map((option) => (
            <option key={option.option} value={option.option}>
              {option.option}
            </option>
          ))}
        </select>
        <MdKeyboardArrowDown
          className={`absolute right-0 top-1/2 mt-[2px] md:mt-2 transform -translate-y-1/2 text-[#262A3A] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`} // Rotate icon based on dropdown state
          size={24}
        />
      </div>
    </div>
  );
};

export default CustomDropdown;
