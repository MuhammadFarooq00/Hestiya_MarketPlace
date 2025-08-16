import React, { useState, useRef, useEffect } from 'react';
import { Button, Input } from '@material-tailwind/react';

const QuantityFilter = ({ label = 'Select quantity range', onApply, onClear }) => {
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({ minQuantity: '', maxQuantity: '' });
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

  const validateQuantities = () => {
    const newErrors = { minQuantity: '', maxQuantity: '' };
    let isValid = true;

    if (minQuantity && maxQuantity && Number(minQuantity) > Number(maxQuantity)) {
      newErrors.minQuantity = 'Minimum quantity cannot be greater than maximum quantity';
      newErrors.maxQuantity = 'Maximum quantity cannot be less than minimum quantity';
      isValid = false;
    }

    if (minQuantity < 0) {
      newErrors.minQuantity = 'Minimum quantity cannot be negative';
      isValid = false;
    }

    if (maxQuantity < 0) {
      newErrors.maxQuantity = 'Maximum quantity cannot be negative';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleApplyFilters = () => {
    if (validateQuantities()) {
      if (onApply) {
        onApply({ minQuantity, maxQuantity });
      }
      setDropdownOpen(false);
    }
  };

  const handleClearFilters = () => {
    setMinQuantity('');
    setMaxQuantity('');
    if (onClear) {
      onClear(); // Clear filters in the parent component
    }
    setErrors({ minQuantity: '', maxQuantity: '' });
    setDropdownOpen(false);
  };

  const renderButtonText = () => {
    if (minQuantity && maxQuantity) {
      return `${minQuantity} - ${maxQuantity}`;
    }
    if (minQuantity && !maxQuantity) {
      return `From ${minQuantity} or more`;
    }
    if (!minQuantity && maxQuantity) {
      return `Up to ${maxQuantity}`;
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
                label="Min Quantity"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                min="0"
                error={errors.minQuantity}
              />
            </div>
            <div className="mb-3">
              <Input
                type="number"
                label="Max Quantity"
                value={maxQuantity}
                onChange={(e) => setMaxQuantity(e.target.value)}
                min="0"
                error={errors.maxQuantity}
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

export default QuantityFilter;
