import React, { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const CustomDropdown = ({ showLabel, label, options = [], value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle dropdown state on click
  const handleDropdownClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative w-full">
      {showLabel && (
        <label
          htmlFor={id}
          className="block text-base text-[#1D1F2199] font-semibold leading-6"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="w-full border border-gray-300 rounded-md px-2 py-2 md:px-4 md:py-4 xlll:px-6 xlll:py-5 focus:outline-blue-500 mt-1.5 md:mt-3 pr-8 appearance-none"
          style={{ background: "transparent" }}
          onClick={handleDropdownClick}
        >
          <option value="">Select {label}</option>
          {Array.isArray(options) && options.length > 0 ? (
            options.map((option) => (
              <option key={option.project_code} value={option.project_code}>
                {`${option.project_code} - ${option.name.slice(0, 10)}`}
              </option>
            ))
          ) : (
            <option disabled>No options available</option>
          )}
        </select>
        <MdKeyboardArrowDown
          className={`absolute right-3 top-1/2 mt-[2px] md:mt-2 transform -translate-y-1/2 text-[#262A3A] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
          size={24}
        />
      </div>
    </div>
  );
};

export default CustomDropdown;
