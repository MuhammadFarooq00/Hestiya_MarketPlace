import React, { useState, useRef, useEffect } from 'react';
import { Button, Checkbox, Input } from '@material-tailwind/react';

const FilterWithSearch = ({
  options = [],
  label = 'Select options',
  onApply,
  onClear,
  checkIsFilterProjectType
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

  const handleCheckboxChange = (optionId) => {
    if (checkIsFilterProjectType) {
      setSelectedFilters([optionId]); // Only allow one selection
    } else {
      setSelectedFilters((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    }
  };

  const filteredOptions = Array.isArray(options)
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const renderButtonText = () => {
    if (selectedFilters.length === 0) {
      return label;
    }
    if (selectedFilters.length === 1) {
      return (
        options.find((option) => option.id === selectedFilters[0])?.label || label
      );
    }
    return `${options.find((option) => option.id === selectedFilters[0])?.label} +${selectedFilters.length - 1}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button className="capitalize" onClick={() => setDropdownOpen(!dropdownOpen)}>
        {renderButtonText()}
      </Button>
      {dropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="p-2">
            <div className="my-2">
              <Input
                type="text"
                label="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-2"
              />
            </div>
            <div
              className="overflow-y-auto overflow-x-auto"
              style={{ maxHeight: '200px', maxWidth: '100%' }}
            >
              {filteredOptions.map((option) => (
                <div key={option.id} className="flex items-center mb-1">
                  <Checkbox
                    id={`filter-${option.id}`}
                    checked={selectedFilters.includes(option.id)}
                    onChange={() => handleCheckboxChange(option.id)}
                    disabled={checkIsFilterProjectType && selectedFilters.length > 0 && !selectedFilters.includes(option.id)}
                  />
                  <label
                    htmlFor={`filter-${option.id}`}
                    className="ml-2 text-sm text-gray-700 whitespace-nowrap"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between border-t border-gray-300 p-2">
            <Button size="sm" color="red" onClick={handleClearFilters}>
              Clear All
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

export default FilterWithSearch;
























// import React, { useState, useRef, useEffect } from 'react';
// import { Button, Checkbox, Input } from '@material-tailwind/react';

// const FilterWithSearch = ({
//   options = [],
//   label = 'Select options',
//   onApply,
//   onClear,
//   checkIsFilterProjectType
// }) => {
//   const [selectedFilters, setSelectedFilters] = useState([]);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const handleApplyFilters = () => {
//     // console.log("Selected Filters before applying:", selectedFilters);
//     if (onApply) {
//       onApply(selectedFilters);
//     }
//     setDropdownOpen(false);
//   };

//   const handleClearFilters = () => {
//     // console.log("Selected Filters before clearing:", selectedFilters);
//     setSelectedFilters([]);
//     setSearchTerm('');
//     if (onClear) {
//       onClear(); // Call the onClear function passed from the parent
//     }
//     setDropdownOpen(false);
//   };

//   const filteredOptions = Array.isArray(options)
//     ? options.filter((option) =>
//         option.label.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     : [];

//   const renderButtonText = () => {
//     if (selectedFilters.length === 0) {
//       return label;
//     }
//     if (selectedFilters.length === 1) {
//       return (
//         options.find((option) => option.id === selectedFilters[0])?.label ||
//         label
//       );
//     }
//     return `${options.find((option) => option.id === selectedFilters[0])?.label} +${selectedFilters.length - 1}`;
//   };

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <Button
//         className="capitalize"
//         onClick={() => setDropdownOpen(!dropdownOpen)}
//       >
//         {renderButtonText()}
//       </Button>
//       {dropdownOpen && (
//         <div className="absolute top-full left-0 mt-2 w-60 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
//           <div className="p-2">
//             <div className="my-2">
//               <Input
//                 type="text"
//                 label="Search options..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="mb-2"
//               />
//             </div>
//             <div
//               className="overflow-y-auto overflow-x-auto"
//               style={{ maxHeight: '200px', maxWidth: '100%' }}
//             >
//               {filteredOptions.map((option) => (
//                 <div key={option.id} className="flex items-center mb-1">
//                   <Checkbox
//                     id={`filter-${option.id}`}
//                     checked={selectedFilters.includes(option.id)}
//                     onChange={() =>
//                       setSelectedFilters((prev) =>
//                         prev.includes(option.id)
//                           ? prev.filter((id) => id !== option.id)
//                           : [...prev, option.id]
//                       )
//                     }
//                   />
//                   <label
//                     htmlFor={`filter-${option.id}`}
//                     className="ml-2 text-sm text-gray-700 whitespace-nowrap"
//                   >
//                     {option.label}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="flex justify-between border-t border-gray-300 p-2">
//             <Button size="sm" color="red" onClick={handleClearFilters}>
//               Clear All
//             </Button>
//             <Button size="sm" color="blue" onClick={handleApplyFilters}>
//               Apply
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FilterWithSearch;
