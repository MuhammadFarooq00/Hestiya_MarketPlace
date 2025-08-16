import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from '@material-tailwind/react';
import moment from 'moment';

const IssuanceDateFilter = ({ label = 'Select date range', onApply, onClear }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({ startDate: '', endDate: '' });
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

  const validateDates = () => {
    const newErrors = { startDate: '', endDate: '' };
    let isValid = true;

    if (startDate && endDate && moment(startDate).isAfter(moment(endDate))) {
      newErrors.startDate = 'Start date cannot be after end date';
      newErrors.endDate = 'End date cannot be before start date';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleApplyFilters = () => {
    if (validateDates()) {
      if (onApply) {
        onApply({ startDate, endDate });
      }
      setDropdownOpen(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    if (onClear) {
      onClear(); // Clear filters in the parent component
    }
    setErrors({ startDate: '', endDate: '' });
    setDropdownOpen(false);
  };

  const renderButtonText = () => {
    if (startDate && endDate) {
      return `${moment(startDate).format('YYYY/MM/DD')} - ${moment(endDate).format('YYYY/MM/DD')}`;
    }
    if (startDate && !endDate) {
      return `From ${moment(startDate).format('YYYY/MM/DD')}`;
    }
    if (!startDate && endDate) {
      return `Up to ${moment(endDate).format('YYYY/MM/DD')}`;
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
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                error={!!errors.startDate}
              />
            </div>
            <div className="mb-3">
              <Input
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                error={!!errors.endDate}
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

export default IssuanceDateFilter;
