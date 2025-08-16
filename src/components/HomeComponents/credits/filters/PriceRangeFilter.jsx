import React, { useState, useRef, useEffect } from "react";
import { Button, Input } from "@material-tailwind/react";

const PriceRangeFilter = ({
  label = "Select price range",
  onApply,
  onClear,
}) => {
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleApplyFilters = () => {
    if (onApply) {
      onApply({ minPrice, maxPrice });
    }
    setDropdownOpen(false);
  };

  const handleClearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    if (onClear) {
      onClear(); // Clear filters in the parent component
    }
    setDropdownOpen(false);
  };

  const renderButtonText = () => {
    if (minPrice && maxPrice) {
      return `${minPrice} - ${maxPrice}`;
    }
    if (minPrice && !maxPrice) {
      return `From ${minPrice} or more`;
    }
    if (!minPrice && maxPrice) {
      return `Up to ${maxPrice}`;
    }
    return label;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        className="capitalize"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        {renderButtonText()}
      </Button>
      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-3">
            <div className="mb-3">
              <Input
                type="number"
                label="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
            </div>
            <div className="mb-3">
              <Input
                type="number"
                label="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>
          <div className="flex justify-between border-t border-gray-300 p-2">
            <Button size="sm" color="red" onClick={handleClearFilters}>
              Clear
            </Button>
            <Button size="sm" color="blue" onClick={handleApplyFilters}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceRangeFilter;
