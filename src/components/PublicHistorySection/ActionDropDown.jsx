import React, { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const ActionDropDown = ({ onValueChange }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedValue, setSelectedValue] = useState("");

	// Hardcoded options with their display values and states
	const options = [
		{ value: "", display: "Select action" },
		{ value: "BUY_MARKETPLACE", display: "Marketplace Purchase" },
		{ value: "LIST_P2P", display: "P2P Listing" },
		{ value: "CANCEL_LIST", display: "Listing Cancelled" },
		{ value: "BUY_P2P", display: "P2P Purchase" },
		{ value: "RETIRE_CREDITS", display: "Credits Retired" },
	];

	// Toggle dropdown state on click
	const handleDropdownClick = () => {
		setIsOpen(!isOpen);
	};

	// Handle option selection
	const handleSelectChange = (e) => {
		const newValue = e.target.value;
		setSelectedValue(newValue);
		onValueChange(newValue); // Pass the new value to the parent
	};

	return (
		<div className="relative w-full">
			<label
				htmlFor={"actions"}
				className="block text-base text-[#1D1F2199] font-semibold leading-6"
			>
				Action
			</label>
			<div className="relative">
				<select
					id={"actions"}
					value={selectedValue}
					onChange={handleSelectChange}
					className="w-full border border-gray-300 rounded-md px-2 py-2 md:px-4 md:py-4 xlll:px-6 xlll:py-5 focus:outline-blue-500 mt-1.5 md:mt-3 pr-8 appearance-none"
					style={{ background: "transparent" }}
					onClick={handleDropdownClick}
				>
					{options.map((option) => (
						<option key={option.value} value={option.value}>
							{option.display}
						</option>
					))}
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

export default ActionDropDown;
