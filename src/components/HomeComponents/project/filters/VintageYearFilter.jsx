import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from '@material-tailwind/react';

const VintageYearFilter = ({ label = 'Select year range', onApply, onClear }) => {
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleApplyFilters = () => {
    if (onApply) {
      onApply({ startYear, endYear });
    }
    setDropdownOpen(false);
  };

  const handleClearFilters = () => {
    setStartYear('');
    setEndYear('');
    if (onClear) {
      onClear(); // Clear filters in the parent component
    }
    setDropdownOpen(false);
  };

  const renderButtonText = () => {
    if (startYear && endYear) {
      return `${startYear} - ${endYear}`;
    }
    if (startYear && !endYear) {
      return `From ${startYear} or later`;
    }
    if (!startYear && endYear) {
      return `Up to ${endYear}`;
    }
    return label;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button className="capitalize" onClick={() => setDropdownOpen(!dropdownOpen)}>
        {renderButtonText()}
      </Button>
      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-3">
            <div className="mb-3">
              <Input
                type="number"
                label="Start Year"
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="mb-3">
              <Input
                type="number"
                label="End Year"
                value={endYear}
                onChange={(e) => setEndYear(e.target.value)}
                min="1900"
                max={new Date().getFullYear()}
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

export default VintageYearFilter;
