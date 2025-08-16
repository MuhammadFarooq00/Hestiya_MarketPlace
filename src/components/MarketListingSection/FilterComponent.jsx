import React, { useContext, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDropdown from "../Dropdowns/CustomDropdown";
import { FiCalendar } from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";
import { SidebarContext } from "../../context/SidebarContext";
import axios from "axios";
import Loader from "../loaders/Loader";
import GirdCard from "./GirdCard";
import DefaultPagination from "../pagination/DefaultPagination";
import SpinnerLoader from "../loaders/SpinnerLoader";
import { useLocation, useNavigate } from "react-router-dom";
import NoData from "../NoData";
import { FaTimes } from "react-icons/fa";
import { FilterFramesOutlined } from "@mui/icons-material";
import FilterForSDG from "../filter/FilterForSdg";




const SDG_OPTIONS = Array.from({ length: 17 }, (_, i) => ({
  id: i + 1,
  label: `SDG ${i + 1}`
}));


const FilterComponent = () => {
  // const apiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = "https://api.hestiya.com/api/"
  const navigate = useNavigate();
  const locations = useLocation();

  const { sidebarWidth } = useContext(SidebarContext);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const startDatePickerRef = useRef("");
  const endDatePickerRef = useRef("");

  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [rating, setRating] = useState("");
  const [filterProjectType, setFilterProjectType] = useState("");
  const [apiRegistory, setApiRegistory] = useState("");
  // for api
  const [apiData, setApiData] = useState(null);
  const [apiCountry, setApiCountry] = useState(null);
  const [apiCategory, setApiCategory] = useState(null);
  const [apiCarbonRating, setApiCarbonRating] = useState(null);
  const [apiProjectType, setApiProjectType] = useState(null);
  const [apiRegistoryType, setApiRegistoryType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(
    Number(new URLSearchParams(locations.search).get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);
  const [sdgItems,setSdgItems] = useState([])

  const fetchData = async (page = 1) => {
    setDataLoading(true);
    try {
      const res = await axios.get(
        `${apiUrl}project-listing/?country=${location}&rating=${rating}&cat=${category}&page=${page}&start=${startDate}&end=${endDate}&registry=${apiRegistory.trim().replace(/\s+/g, "+")}&filter_project_type=${(filterProjectType === "I-RECs" ? "IRECS" : filterProjectType).trim().replace(/\s+/g, "")}&sdg_numbers=${sdgItems.join(",")}`
      );
      // console.log("startDate",startDate,"endDate",endDate)
      const { results, count } = res.data;
      // console.log("results", results);
      if (!results || !Array.isArray(results)) {
        // console.log("Invalid data structure");
        setApiData([]); // Set to empty array
        setTotalPages(1); // Set to 1 to ensure pagination controls are available
        return;
      }

      if (results.length === 0 || count === null) {
        setApiData([]);
        setTotalPages(1); // Set to 1 to ensure pagination controls are available
        return;
      }
      // Set API data for the current page

      // console.log("check results : ",results)
      setApiData(results);
     
      // Calculate itemsPerPage dynamically from the length of the results array
      // const itemsPerPage = results.length;
      const itemsPerPage = 9;

      // Calculate total pages based on the count and itemsPerPage
      const totalPages = Math.ceil(count / itemsPerPage);

      // Set total pages and count
      setTotalPages(totalPages);
      // setCount(count);

      // console.log("Total Pages:", totalPages, "Items per Page:", count, itemsPerPage);
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      setLoading(true);
      const country = await axios.get(`${apiUrl}country/`);
      const countryOptions = country.data.map((item) => ({
        option: item.name,
      }));
      setApiCountry(countryOptions);

      const category = await axios.get(`${apiUrl}set-category/`);
      const categoryOptions = category.data.map((item) => ({
        option: item.cat_name,
      }));
      setApiCategory(categoryOptions);

      

      const carbonRating = await axios.get(`${apiUrl}set-carbon-rating/`);
      const RatingOptions = carbonRating.data.map((item) => ({
        option: item.rating_symbol,
      }));
      setApiCarbonRating(RatingOptions);

      // const projectType = await axios.get(`${apiUrl}set-project-type/`);
      const projectType = [
        {
          type_name: "Carbon Credits",
        },
        {
          type_name: "I-RECs",
        },
      ];
      const projectTypeOptions = projectType.map((item) => ({
        option: item.type_name,
      }));
      setApiProjectType(projectTypeOptions);


      const registory = await axios.get(`${apiUrl}get-registry-names`);
      // console.log("check registory : ", registory)
      const registoryOptions = registory?.data?.map((item) => ({
        option: item.registry_type,
      }));
      
      setApiRegistoryType(registoryOptions);

      // console.log(
      //   "country",
      //   country.data,
      //   "category.data",
      //   category.data,
      //   "carbonRating.data",
      //   carbonRating.data
      // );
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchData(activePage);
    const params = new URLSearchParams(locations.search);
    params.set("page", activePage);
    navigate(`?${params.toString()}`, { replace: true });
  }, [location, category, rating, activePage, startDate, endDate, filterProjectType,apiRegistory, sdgItems ]);

   useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}, [activePage]); 

  if (loading)
    return (
      <div>
        <Loader />
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        Error: {error}
      </div>
    );
  const handleClearDates = () => {
    setStartDate("");
    setEndDate("");
  };



  const handleSDGFilterApply = (selectedSDGs) => {
    // Add your filter logic here
    setSdgItems(selectedSDGs);
    console.log('Selected SDGs:', selectedSDGs);
  };

  const handleSDGFilterClear = () => {
    // Add your clear logic here
    setSdgItems([]);
    console.log('Cleared SDG filters');
  };


  return (
    <>
      {/* <Loader/> */}
      <div className="xlll:mx-6 xl:mx-4 flex gap-4 sm:gap-4 xlll:gap-6 flex-wrap">
        <div
          className={`w-full ${
            sidebarWidth === "w-24"
              ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
              : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
          } `}
        >
          <CustomDropdown
            showLabel={true}
            label="Location"
            options={apiCountry}
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
            }}
            id="location"
          />
        </div>
        <div
          className={`w-full sm:mx-8 xl:mx-0 ${
            sidebarWidth === "w-24"
              ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
              : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
          } `}
        >
          <CustomDropdown
            showLabel={true}
            label="Scopes"
            options={apiCategory}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
            }}
            id="scopes"
          />
        </div>
        <div className="w-full sm:w-[320px]">
          <div className="w-full">
            <label
              htmlFor={"Vintages"}
              className="block text-base text-[#1D1F2199] font-semibold leading-6"
            >
              Vintages
            </label>
            <div className="w-fit flex gap-3 items-center border border-gray-300 rounded-md px-2 py-2 md:px-4 md:py-4  xlll:py-5 focus:outline-blue-500 mt-1.5 md:mt-3">
              <div className="relative">
                <DatePicker
                  id="start-date"
                  selected={startDate ? new Date(startDate, 0) : null}
                  onChange={(date) => setStartDate(date.getFullYear())}
                  showYearPicker
                  dateFormat="yyyy"
                  placeholderText="Start Year"
                  className="outline-none w-1/2 sm:w-32"
                  yearItemNumber={9}
                  ref={startDatePickerRef}
                />
                <FiCalendar
                  onClick={() => startDatePickerRef.current.setFocus()}
                  className="absolute cursor-pointer top-1/2 right-3 transform -translate-y-1/2 w-6 h-6 text-[#262A3A]"
                />
              </div>
              <div className=" h-[19px] border-r-[1px] border-[#BDC3C7]"></div>
              <div className="relative">
                <DatePicker
                  id="end-date"
                  selected={endDate ? new Date(endDate, 0) : null}
                  onChange={(date) => setEndDate(date.getFullYear())}
                  selectsEnd
                  startDate={startDate ? new Date(startDate, 0) : null}
                  showYearPicker
                  dateFormat="yyyy"
                  minDate={startDate ? new Date(startDate, 0) : null}
                  placeholderText="End Year"
                  className="outline-none w-1/2 sm:w-32"
                  ref={endDatePickerRef}
                />
                <FiCalendar onClick={()=>endDatePickerRef.current.setFocus()} className=" cursor-pointer absolute top-1/2 right-5 transform -translate-y-1/2 w-6 h-6 text-[#262A3A]" />
                {(startDate || endDate) && (
                  <button
                    type="button"
                    onClick={handleClearDates}
                    className="text-red-500 absolute top-1/2 right-0 transform -translate-y-1/2"
                    title="Clear dates"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`w-full ${
            sidebarWidth === "w-24"
              ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
              : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
          } `}
        >
          <CustomDropdown
            showLabel={true}
            label="Rating"
            options={apiCarbonRating}
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
            }}
            id="rating"
          />
        </div>
        <div
          className={`w-full sm:mx-8 xl:mx-0 ${
            sidebarWidth === "w-24"
              ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
              : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
          } `}
        >
          <CustomDropdown
            showLabel={true}
            label="Category"
            options={apiProjectType}
            value={filterProjectType}
            onChange={(e) => {
              setFilterProjectType(e.target.value);
            }}
            id="category"
          />
        </div>
        <div
          className={`w-full ${
            sidebarWidth === "w-24"
              ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
              : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
          } `}
        >
          <CustomDropdown
            showLabel={true}
            label="Registry"
            options={apiRegistoryType}
            value={apiRegistory}
            onChange={(e) => {
              setApiRegistory(e.target.value);
            }}
            id="registry"
          />
        </div>
        <div
          className={`w-full ${
            sidebarWidth === "w-24"
              ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
              : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
          } `}
        >
          <div className="relative min-w-[120px]  w-full">
        <label className="block sm:ms-10 xl:ms-4 text-base text-[#1D1F2199] font-semibold leading-6">
          SDG Goals
        </label>
        <FilterForSDG
          options={SDG_OPTIONS}
          label="Select SDGs"
          onApply={handleSDGFilterApply}
          onClear={handleSDGFilterClear}
        />
        </div>
      </div>
        {/* <div className="flex items-end w-full justify-end md:w-fit md:justify-start">
          <button className="bg-darkgreen p-2 sm:p-2.5 xlll:p-3.5 rounded-md">
            <RiSearchLine className="text-white w-7 h-7 sm:w-9 sm:h-9" />
          </button>
        </div> */}
      </div>

      {/* card section 2 */}
      {dataLoading ? (
        <SpinnerLoader />
      ) : (
        <div className="md:mt-9 mt-6 mb-6 md:mb-[91px]">
          {apiData.length === 0 ? (
            <>
              <NoData
                height={"50vh"}
                headingText={"No Projects Available"}
                paraText={
                  "Currently, there are no projects listed. Please check back later for updates!"
                }
              />
            </>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 xlll:grid-cols-3 gap-6">
              {apiData &&
                apiData?.map((item, index) => (
                  // console.log("item", item),
                  <GirdCard
                    key={index}
                    image={item?.images}
                    title={item?.name}
                    projectCode={item?.project_code}
                    projectCategory={item?.cat}
                    projectType={item?.type}
                    standards={item?.standard}
                    price={item?.start_price}
                    availability={item?.total_available_credits}
                    vintagesStart={item?.vintage_start_year}
                    vintagesEnd={item?.vintage_end_year}
                    sidebarWidth={sidebarWidth}
                    ratingsCarbonRating={item?.carbon_rating}
                    ratingscobenifit_rating={item?.cobenifit_rating}
                    filterProjectType={item?.filter_project_type ?? "CarbonCredits"}
                  />
                ))}
            </div>
          )}
        </div>
      )}

      {/* card section 2 */}
      <div className="w-full flex justify-center mt-8">
        <DefaultPagination
          activePage={activePage}
          setActivePage={setActivePage}
          totalPages={totalPages}
        />
      </div>
    </>
  );
};

export default FilterComponent;




















// import React, { useContext, useEffect, useRef, useState } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import CustomDropdown from "../Dropdowns/CustomDropdown";
// import { FiCalendar } from "react-icons/fi";
// import { RiSearchLine } from "react-icons/ri";
// import { SidebarContext } from "../../context/SidebarContext";
// import axios from "axios";
// import Loader from "../loaders/Loader";
// import GirdCard from "./GirdCard";
// import DefaultPagination from "../pagination/DefaultPagination";
// import SpinnerLoader from "../loaders/SpinnerLoader";
// import { useLocation, useNavigate } from "react-router-dom";
// import NoData from "../NoData";
// import { FaTimes } from "react-icons/fa";

// const FilterComponent = () => {
//   // const apiUrl = import.meta.env.VITE_API_URL;
//     const apiUrl = "https://api.hestiya.com/api/"
//   const navigate = useNavigate();
//   const locations = useLocation();

//   const { sidebarWidth } = useContext(SidebarContext);

//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const startDatePickerRef = useRef("");
//   const endDatePickerRef = useRef("");

//   const [location, setLocation] = useState("");
//   const [category, setCategory] = useState("");
//   const [rating, setRating] = useState("");
//   const [filterProjectType, setFilterProjectType] = useState("");
//   // for api
//   const [apiData, setApiData] = useState(null);
//   const [apiCountry, setApiCountry] = useState(null);
//   const [apiCategory, setApiCategory] = useState(null);
//   const [apiCarbonRating, setApiCarbonRating] = useState(null);
//   const [apiProjectType, setApiProjectType] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [dataLoading, setDataLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activePage, setActivePage] = useState(
//     Number(new URLSearchParams(locations.search).get("page")) || 1
//   );
//   const [totalPages, setTotalPages] = useState(1);

//   const fetchData = async (page = 1) => {
//     setDataLoading(true);
//     try {
//       const res = await axios.get(
//         `${apiUrl}project-listing/?country=${location}&rating=${rating}&cat=${category}&page=${page}&start=${startDate}&end=${endDate}&filter_project_type=${filterProjectType.trim().replace(/\s+/g, "")}`
//       );
//       // console.log("startDate",startDate,"endDate",endDate)
//       const { results, count } = res.data;
//       // console.log("results", results);
//       if (!results || !Array.isArray(results)) {
//         // console.log("Invalid data structure");
//         setApiData([]); // Set to empty array
//         setTotalPages(1); // Set to 1 to ensure pagination controls are available
//         return;
//       }

//       if (results.length === 0 || count === null) {
//         setApiData([]);
//         setTotalPages(1); // Set to 1 to ensure pagination controls are available
//         return;
//       }
//       // Set API data for the current page
//       setApiData(results);

//       // Calculate itemsPerPage dynamically from the length of the results array
//       // const itemsPerPage = results.length;
//       const itemsPerPage = 9;

//       // Calculate total pages based on the count and itemsPerPage
//       const totalPages = Math.ceil(count / itemsPerPage);

//       // Set total pages and count
//       setTotalPages(totalPages);
//       // setCount(count);

//       console.log("Total Pages:", totalPages, "Items per Page:", count, itemsPerPage);
//     } catch (error) {
//       setError(error.message);
//       console.error("Error:", error);
//     } finally {
//       setDataLoading(false);
//     }
//   };

//   const fetchFilters = async () => {
//     try {
//       setLoading(true);
//       const country = await axios.get(`${apiUrl}country/`);
//       const countryOptions = country.data.map((item) => ({
//         option: item.name,
//       }));
//       setApiCountry(countryOptions);

//       const category = await axios.get(`${apiUrl}set-category/`);
//       const categoryOptions = category.data.map((item) => ({
//         option: item.cat_name,
//       }));
//       setApiCategory(categoryOptions);

//       const carbonRating = await axios.get(`${apiUrl}set-carbon-rating/`);
//       const RatingOptions = carbonRating.data.map((item) => ({
//         option: item.rating_symbol,
//       }));
//       setApiCarbonRating(RatingOptions);

//       // const projectType = await axios.get(`${apiUrl}set-project-type/`);
//       const projectType = [
//         {
//           type_name: "Carbon Credits",
//         },
//         {
//           type_name: "IRECS",
//         },
//       ];
//       const projectTypeOptions = projectType.map((item) => ({
//         option: item.type_name,
//       }));
//       setApiProjectType(projectTypeOptions);


//       // console.log(
//       //   "country",
//       //   country.data,
//       //   "category.data",
//       //   category.data,
//       //   "carbonRating.data",
//       //   carbonRating.data
//       // );
//     } catch (error) {
//       setError(error.message);
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFilters();
//   }, []);

//   useEffect(() => {
//     fetchData(activePage);
//     const params = new URLSearchParams(locations.search);
//     params.set("page", activePage);
//     navigate(`?${params.toString()}`, { replace: true });
//   }, [location, category, rating, activePage, startDate, endDate, filterProjectType]);

//   if (loading)
//     return (
//       <div>
//         <Loader />
//       </div>
//     );
//   if (error)
//     return (
//       <div className="flex justify-center items-center h-[80vh]">
//         Error: {error}
//       </div>
//     );
//   const handleClearDates = () => {
//     setStartDate("");
//     setEndDate("");
//   };
//   return (
//     <>
//       {/* <Loader/> */}
//       <div className="xlll:mx-6 xl:mx-4 flex gap-4 sm:gap-4 xlll:gap-6 flex-wrap">
//         <div
//           className={`w-full ${
//             sidebarWidth === "w-24"
//               ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
//               : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
//           } `}
//         >
//           <CustomDropdown
//             showLabel={true}
//             label="Location"
//             options={apiCountry}
//             value={location}
//             onChange={(e) => {
//               setLocation(e.target.value);
//             }}
//             id="location"
//           />
//         </div>
//         <div
//           className={`w-full sm:mx-8 xl:mx-0 ${
//             sidebarWidth === "w-24"
//               ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
//               : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
//           } `}
//         >
//           <CustomDropdown
//             showLabel={true}
//             label="Scopes"
//             options={apiCategory}
//             value={category}
//             onChange={(e) => {
//               setCategory(e.target.value);
//             }}
//             id="scopes"
//           />
//         </div>
//         <div className="w-full sm:w-[320px]">
//           <div className="w-full">
//             <label
//               htmlFor={"Vintages"}
//               className="block text-base text-[#1D1F2199] font-semibold leading-6"
//             >
//               Vintages
//             </label>
//             <div className="w-fit flex gap-3 items-center border border-gray-300 rounded-md px-2 py-2 md:px-4 md:py-4  xlll:py-5 focus:outline-blue-500 mt-1.5 md:mt-3">
//               <div className="relative">
//                 <DatePicker
//                   id="start-date"
//                   selected={startDate ? new Date(startDate, 0) : null}
//                   onChange={(date) => setStartDate(date.getFullYear())}
//                   showYearPicker
//                   dateFormat="yyyy"
//                   placeholderText="Start Year"
//                   className="outline-none w-1/2 sm:w-32"
//                   yearItemNumber={9}
//                   ref={startDatePickerRef}
//                 />
//                 <FiCalendar
//                   onClick={() => startDatePickerRef.current.setFocus()}
//                   className="absolute cursor-pointer top-1/2 right-3 transform -translate-y-1/2 w-6 h-6 text-[#262A3A]"
//                 />
//               </div>
//               <div className=" h-[19px] border-r-[1px] border-[#BDC3C7]"></div>
//               <div className="relative">
//                 <DatePicker
//                   id="end-date"
//                   selected={endDate ? new Date(endDate, 0) : null}
//                   onChange={(date) => setEndDate(date.getFullYear())}
//                   selectsEnd
//                   startDate={startDate ? new Date(startDate, 0) : null}
//                   showYearPicker
//                   dateFormat="yyyy"
//                   minDate={startDate ? new Date(startDate, 0) : null}
//                   placeholderText="End Year"
//                   className="outline-none w-1/2 sm:w-32"
//                   ref={endDatePickerRef}
//                 />
//                 <FiCalendar onClick={()=>endDatePickerRef.current.setFocus()} className=" cursor-pointer absolute top-1/2 right-5 transform -translate-y-1/2 w-6 h-6 text-[#262A3A]" />
//                 {(startDate || endDate) && (
//                   <button
//                     type="button"
//                     onClick={handleClearDates}
//                     className="text-red-500 absolute top-1/2 right-0 transform -translate-y-1/2"
//                     title="Clear dates"
//                   >
//                     <FaTimes className="w-5 h-5" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         <div
//           className={`w-full ${
//             sidebarWidth === "w-24"
//               ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
//               : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
//           } `}
//         >
//           <CustomDropdown
//             showLabel={true}
//             label="Rating"
//             options={apiCarbonRating}
//             value={rating}
//             onChange={(e) => {
//               setRating(e.target.value);
//             }}
//             id="rating"
//           />
//         </div>
//         <div
//           className={`w-full ${
//             sidebarWidth === "w-24"
//               ? "sm:w-[180px] lg:w-[180px] xl:w-[270px] xlll:w-[320px]"
//               : "xlll:w-[261px] sm:w-[180px] xl:w-[220px]"
//           } `}
//         >
//           <CustomDropdown
//             showLabel={true}
//             label="Type"
//             options={apiProjectType}
//             value={filterProjectType}
//             onChange={(e) => {
//               setFilterProjectType(e.target.value);
//             }}
//             id="type"
//           />
//         </div>
//         {/* <div className="flex items-end w-full justify-end md:w-fit md:justify-start">
//           <button className="bg-darkgreen p-2 sm:p-2.5 xlll:p-3.5 rounded-md">
//             <RiSearchLine className="text-white w-7 h-7 sm:w-9 sm:h-9" />
//           </button>
//         </div> */}
//       </div>

//       {/* card section 2 */}
//       {dataLoading ? (
//         <SpinnerLoader />
//       ) : (
//         <div className="md:mt-9 mt-6 mb-6 md:mb-[91px]">
//           {apiData.length === 0 ? (
//             <>
//               <NoData
//                 height={"50vh"}
//                 headingText={"No Projects Available"}
//                 paraText={
//                   "Currently, there are no projects listed. Please check back later for updates!"
//                 }
//               />
//             </>
//           ) : (
//             <div className="grid sm:grid-cols-2 xl:grid-cols-3 xlll:grid-cols-3 gap-6">
//               {apiData &&
//                 apiData?.map((item, index) => (
//                   // console.log("item", item),
//                   <GirdCard
//                     key={index}
//                     image={item?.images}
//                     title={item?.name}
//                     projectCode={item?.project_code}
//                     projectCategory={item?.cat}
//                     projectType={item?.type}
//                     standards={item?.standard}
//                     price={item?.start_price}
//                     availability={item?.total_available_credits}
//                     vintagesStart={item?.vintage_start_year}
//                     vintagesEnd={item?.vintage_end_year}
//                     sidebarWidth={sidebarWidth}
//                     ratingsCarbonRating={item?.carbon_rating}
//                     ratingscobenifit_rating={item?.cobenifit_rating}
//                     filterProjectType={item?.filter_project_type ?? "CarbonCredits"}
//                   />
//                 ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* card section 2 */}
//       <div className="w-full flex justify-center mt-8">
//         <DefaultPagination
//           activePage={activePage}
//           setActivePage={setActivePage}
//           totalPages={totalPages}
//         />
//       </div>
//     </>
//   );
// };

// export default FilterComponent;
