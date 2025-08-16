import React, { useState, useRef, useEffect } from 'react';
import { Button, Checkbox, Input } from '@material-tailwind/react';

const SDG_OPTIONS = Array.from({ length: 17 }, (_, i) => ({
  id: i + 1,
  label: `SDG ${i + 1}`
}));

const FilterForSDG = ({
  label = 'Select SDGs',
  onApply,
  onClear
}) => {
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      onApply(selectedFilters);
    }
    setDropdownOpen(false);
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    setSearchTerm('');
    if (onClear) {
      onClear();
    }
    setDropdownOpen(false);
  };

  const filteredOptions = SDG_OPTIONS.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getButtonText = () => {
    if (selectedFilters.length === 0) {
      return label;
    }
    if (selectedFilters.length === 1) {
      return SDG_OPTIONS.find((option) => option.id === selectedFilters[0])?.label || label;
    }
    return `${SDG_OPTIONS.find((option) => option.id === selectedFilters[0])?.label} +${selectedFilters.length - 1}`;
  };

  return (
    <div className="relative xl:ms-4 sm:ms-10 w-full min-w-[180px] max-w-full" ref={dropdownRef}>
      <div
        variant="outlined"
        className={`w-full border cursor-pointer ${dropdownOpen ? "border-2 border-blue-500" : "border-gray-300 " }  rounded-md px-2 py-2 md:px-4 md:py-4 xlll:px-6 xlll:py-5 focus:outline-blue-500  mt-1.5 md:mt-3 pr-8 appearance-none`}
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <span className="block truncate pr-6">
          {getButtonText()}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[250px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3">
            <div className="mb-3">
              <Input
                type="text"
                label="Search SDGs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="!min-w-0"
                containerProps={{
                  className: "min-w-0 w-full"
                }}
              />
            </div>

            <div className="max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center py-2 px-1 hover:bg-gray-50 rounded transition-colors"
                >
                  <Checkbox
                    id={`sdg-${option.id}`}
                    checked={selectedFilters.includes(option.id)}
                    onChange={() =>
                      setSelectedFilters((prev) =>
                        prev.includes(option.id)
                          ? prev.filter((id) => id !== option.id)
                          : [...prev, option.id]
                      )
                    }
                    className="h-4 w-4 text-primary border-gray-300 rounded"
                    containerProps={{
                      className: "p-0"
                    }}
                  />
                  <label
                    htmlFor={`sdg-${option.id}`}
                    className="ml-2 text-sm text-gray-700 cursor-pointer flex-grow"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex  p-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
            <Button
              size="sm"
              variant="text"
              color="red"
              onClick={handleClearFilters}
              className="px-3 py-1.5 min-w-[60px]"
            >
              Clear
            </Button>
            <Button
              size="sm"
              color="blue"
              onClick={handleApplyFilters}
              className="px-3 ms-4 py-1.5 min-w-[60px]"
            >
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterForSDG;