import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import NoData from "../NoData";
import Loader from "../loaders/Loader";
import moment from "moment";
import { ReactComponent as Calendar } from "../../assets/svg/calendar-lines.svg";
import DefaultPagination from "../pagination/DefaultPagination";
import VintageYearFilter from "../HomeComponents/credits/filters/VintageYearFilter";
import QuantityFilter from "../HomeComponents/credits/filters/QuantityFilter";
import IssuanceDateFilter from "../HomeComponents/credits/filters/IssuanceDateFilter";
import FilterWithSearch from "../HomeComponents/project/filters/FilterWithSearch";
import PriceRangeFilter from "../HomeComponents/credits/filters/PriceRangeFilter";
import { MdOutlineFileDownload } from "react-icons/md";
import { jsPDF } from "jspdf";
import { generateAndDownloadHistory } from "../../Template/Template";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";

const History = () => {
  // const { address } = useAccount();
  const { userDetails, hasAddress } = useContext(UserContext);
  // const apiUrl = import.meta.env.VITE_API_URL;
  const apiUrl = "https://api.hestiya.com/api/";

  const [activePage, setActivePage] = useState(1);
  const [projectOptions, setProjectOptions] = useState("");
  const [projectTypeOptions, setProjectTypeOptions] = useState("");
  const [startVintageYear, setStartVintageyear] = useState("");
  const [endVintageYear, setEndVintageyear] = useState("");
  const [startPriceRange, setStartPriceRange] = useState("");
  const [endPriceRange, setEndPriceRange] = useState("");
  const [minCredits, setMinCredits] = useState("");
  const [maxCredits, setMaxCredits] = useState("");
  const [minDate, setMinDate] = useState("");
  const [maxDate, setMaxDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiHistoryData, setApiHistoryData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [projectCodes, setProjectCodes] = useState([]);
  const [filter_project_type, setFilter_project_type] = useState("");
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      if (hasAddress) {
        console.log("filterProjecttpe", filter_project_type);
        const res = await axios.get(
          `${apiUrl}activity-log/?address=${hasAddress}&page=${activePage}&vintage_start_year=${startVintageYear}&vintage_end_year=${endVintageYear}&min_credits=${minCredits}&max_credits=${maxCredits}&date_min=${minDate}&date_max=${maxDate}&project=${projectCodes}&min_price=${startPriceRange}&max_price=${endPriceRange}&filter_project_type=${filter_project_type === "I-RECs" ? "IRECS" : filter_project_type
            .trim()
            .replace(/\s+/g, "")}`
        );
        const { results, count } = res.data;

        if (!Array.isArray(results)) {
          console.error("Invalid data structure");
          setApiData([]);
          return;
        }

        setApiHistoryData(results);

        const itemsPerPage = 10;
        const totalPages = Math.ceil(count / itemsPerPage);
        setTotalPages(totalPages);
      }
    } catch (error) {
      console.error("error", error);
      setError("Failed to load listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [
    // address,
    activePage,
    startVintageYear,
    projectCodes,
    endVintageYear,
    startPriceRange,
    endPriceRange,
    maxCredits,
    minCredits,
    minDate,
    maxDate,
    hasAddress,
    filter_project_type,
  ]);

  const fetchProjectData = async () => {
    try {
      const response = await axios.get(`${apiUrl}project`);
      const projects = response.data;

      const transformedData = projects.map((project) => ({
        id: project.project_code,
        label: `${project.name}`,
      }));

      setProjectOptions(transformedData);
      // console.log("1231242", transformedData);
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };
  const fetchProjectTypeData = async () => {
    try {
      // const response = await axios.get(`${apiUrl}project-type`);
      // const projectTypes = response.data;
      const projectTypes = [
        { id: 1, name: "Carbon Credits" },
        { id: 2, name: "I-RECs" },
      ];
      const transformedData = projectTypes.map((projectType) => ({
        id: projectType.id,
        label: projectType.name,
      }));

      setProjectTypeOptions(transformedData);
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  const handleApplyFiltersProjectType = (selectedFilters) => {
    console.log("selectedFilters", selectedFilters);
    if (selectedFilters.length > 0) {
      if (selectedFilters[0] === 1) {
        setFilter_project_type("CarbonCredits");
      } else if (selectedFilters[0] === 2) {
        setFilter_project_type("I-RECs");
      }
    } else {
      setFilter_project_type("");
    }
    setActivePage(1);
  };

  const handleClearFiltersProjectType = () => {
    setFilter_project_type("");
    setActivePage(1);
  };

  useEffect(() => {
    fetchProjectData();
    fetchProjectTypeData();
  }, []);

  const handleApplyFiltersYear = (filters) => {
    setStartVintageyear(filters.startYear);
    setEndVintageyear(filters.endYear);
    setActivePage(1);
  };
  const handleClearFiltersYear = () => {
    setStartVintageyear("");
    setEndVintageyear("");
    setActivePage(1);
  };
  const handleApplyPriceRange = (filters) => {
    setStartPriceRange(filters.minPrice !== "" ? Number(filters.minPrice) : "");
    setEndPriceRange(filters.maxPrice !== "" ? Number(filters.maxPrice) : "");
    setActivePage(1);
  };

  const handleClearPriceRange = () => {
    setStartPriceRange("");
    setEndPriceRange("");
    setActivePage(1);
  };
  const handleApplyFiltersCredit = (filters) => {
    // console.log("sdfdsgdg", filters);
    setMinCredits(filters.minQuantity);
    setMaxCredits(filters.maxQuantity);
    setActivePage(1);
  };
  const handleClearFiltersCredit = () => {
    setMinCredits("");
    setMaxCredits("");
    setActivePage(1);
  };
  const handleApplyFiltersIssuanceDate = (filters) => {
    // console.log("sdfdsgdg", filters);
    setMinDate(filters.startDate);
    setMaxDate(filters.endDate);
    setActivePage(1);
  };
  const handleClearFiltersIssuanceDate = () => {
    setMinDate("");
    setMaxDate("");
    setActivePage(1);
  };

  const handleApplyFiltersProject = (selectedFilters) => {
    setProjectCodes(selectedFilters);
    setActivePage(1);
    // console.log("Filters applied:", selectedFilters);
  };

  const handleClearFiltersProject = () => {
    setProjectCodes([]);
    setActivePage(1);
  };

  // Function to generate and download PDF
  const handleDownload = (history) => {
    // console.log("history", history);
    const actionTypeText =
      history.action_type === "RETIRE_CREDITS"
        ? "Credits Retired"
        : history.action_type === "CANCEL_LIST"
        ? "Listing Cancelled"
        : history.action_type === "LIST_P2P"
        ? "P2P Listing"
        : history.action_type === "BUY_P2P"
        ? "P2P Purchase"
        : history.action_type === "BUY_MARKETPLACE"
        ? "Marketplace Purchase With Wallet"
        : history.action_type === "BUY_WITH_STRIPE"
        ? "Marketplace Purchase With Stripe"
        : history.action_type === "ADMIN_TRANSFER"
        ? "Marketplace Purchase With Bank"
        : "--";
    const data = {
      ...history,
      action_type: actionTypeText,
    };
    console.log("data", data);
    generateAndDownloadHistory(data);
  };

  return (
    <>
      {hasAddress ? (
        <div className="xlll:mx-6 xl:mx-4 mt-2 mx-4 mb-4">
          <div className="text-lg sx:text-xl xl:text-[28px] font-semibold text-black leading-6 xl:leading-[33.6px]">
            Transaction History
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <VintageYearFilter
              label="vintages"
              onApply={handleApplyFiltersYear}
              onClear={handleClearFiltersYear}
            />
            <PriceRangeFilter
              label="Price Range"
              onApply={handleApplyPriceRange}
              onClear={handleClearPriceRange}
            />
            <QuantityFilter
              label="quantity"
              onApply={handleApplyFiltersCredit}
              onClear={handleClearFiltersCredit}
            />
            <IssuanceDateFilter
              label="Issuance Date"
              onApply={handleApplyFiltersIssuanceDate}
              onClear={handleClearFiltersIssuanceDate}
            />
            <FilterWithSearch
              options={projectOptions}
              label="Projects"
              onApply={handleApplyFiltersProject}
              onClear={handleClearFiltersProject}
            />
            <FilterWithSearch
              options={projectTypeOptions}
              label="Project Type"
              onApply={handleApplyFiltersProjectType}
              onClear={handleClearFiltersProjectType}
              checkIsFilterProjectType={true}
            />
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              {apiHistoryData.length > 0 ? (
                <>
                  <div className="mt-4 flex flex-col items-center gap-4 min-h-[67vh]">
                    {apiHistoryData &&
                      apiHistoryData.map((history, index) => (
                        <div
                          key={history.id || index}
                          className="bg-white w-full xl:w-2/3 shadow-sm border border-slate-200 rounded-lg p-4 capitalize"
                        >
                          {/* {console.log("check the data : ", history.action_type)} */}
                          <div className="flex justify-between items-center sm:text-2xl text-xl  leading-[30px] pb-2 border-b border-slate-200">
                            <div
                              className={` py-1 px-4 rounded-3xl text-white text-base font-semibold
                          ${
                            history.action_type === "RETIRE_CREDITS"
                              ? "bg-red-400"
                              : history.action_type === "CANCEL_LIST"
                              ? "bg-red-400"
                              : history.action_type === "LIST_P2P"
                              ? "bg-orange-700"
                              : history.action_type === "BUY_P2P"
                              ? "bg-green-500"
                              : history.action_type === "BUY_MARKETPLACE"
                              ? "bg-green-500"
                              : history.action_type === "REDEEM_CREDITS"
                              ? "bg-green-500"
                              : history.action_type === "BUY_WITH_STRIPE"
                              ? "bg-green-500"
                              : history.action_type === "ADMIN_TRANSFER"
                              ? "bg-green-500"
                              : ""
                          }
                          `}
                            >
                              {history.action_type === "RETIRE_CREDITS"
                                    ? history?.status?.toString().toLowerCase() ===
                                      "pending"
                                      ? "Credits Pending"
                                      : history?.status
                                          ?.toString()
                                          .toLowerCase() === "rejected"
                                      ? "Credits Rejected"
                                      : history?.status
                                          ?.toString()
                                          .toLowerCase() === "approved"
                                      ? "Credits Retired"
                                      : "--"
                                : history.action_type === "CANCEL_LIST"
                                ? "Listing Cancelled"
                                : history.action_type === "LIST_P2P"
                                ? "P2P Listing"
                                : history.action_type === "BUY_P2P"
                                ? "P2P Purchase"
                                : history.action_type === "ADMIN_TRANSFER"
        ? "Marketplace Purchase With Bank"
                                : history.action_type === "BUY_MARKETPLACE"
                                ? "Marketplace Purchase With Wallet"
                                : history.action_type === "REDEEM_CREDITS"
                                ? 
                                history?.status?.toString().toLowerCase() ===
              "pending"
              ? "Redeem Pending"
              : history?.status
                ?.toString()
                .toLowerCase() === "rejected"
              ? "Redeem Rejected"
              : history?.status
                ?.toString()
                .toLowerCase() === "approved"
              ? "Redeem Credits"
              : "--"
                                : history.action_type === "BUY_WITH_STRIPE"
                                ? "Marketplace Purchase With Stripe"
                                : "" ?? "--"}
                            </div>
                            {history.vintage_year && (
                              <div className="sm:text-lg text-base">
                                vintage {history.vintage_year}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between py-6 sm:text-xl text-lg font-semibold sm:items-center">
                            <div className="relative inline-block">
                              <span className="break-words inline">
                                {history.project_name}{" "}
                              </span>
                              <span className="absolute ms-1 mt-[5px]">
                                <MdOutlineFileDownload
                                  className="cursor-pointer"
                                  onClick={() => handleDownload(history)}
                                />
                              </span>
                            </div>

                            {history.total_credits && (
                              <div>
                                <div
                                  className={`text-black capitalize
                              ${
                                history.action_type === "RETIRE_CREDITS"
                                  ? "text-red-400"
                                  : history.action_type === "CANCEL_LIST"
                                  ? "text-red-400"
                                  : history.action_type === "LIST_P2P"
                                  ? "text-orange-700"
                                  : history.action_type === "BUY_P2P"
                                  ? "text-green-500"
                                  : history.action_type === "BUY_MARKETPLACE"
                                  ? "text-green-500"
                                  : history.action_type === "REDEEM_CREDITS"
                                  ? "text-green-500"
                                  : history.action_type === "BUY_WITH_STRIPE"
                                  ? "text-green-500"
                                  : history.action_type === "ADMIN_TRANSFER"
                                  ? "text-green-500"
                                  : ""
                              }
                              `}
                                >
                                  {history.action_type === "RETIRE_CREDITS" ? (
                                    <>- {history.total_credits}</>
                                  ) : history.action_type === "ADMIN_TRANSFER" ? (
                                    <>+ {history.total_credits}</>
                                  ):  
                                  history.action_type === "CANCEL_LIST" ? (
                                    <>- {history.total_credits}</>
                                  ) : history.action_type === "LIST_P2P" ? (
                                    <>- {history.total_credits}</>
                                  ) : history.action_type === "BUY_P2P" ? (
                                    <>+ {history.total_credits}</>
                                  ) : history.action_type ===
                                    "BUY_MARKETPLACE" ? (
                                    <>+ {history?.total_credits}</>
                                  ) : history.action_type ===
                                    "BUY_WITH_STRIPE" ? (
                                    <>+ {history?.total_credits}</>
                                  ) : history.action_type ===
                                    "REDEEM_CREDITS" ? (
                                    <>+ {history?.total_credits}</>
                                  )
                                   : (
                                    ""
                                  )}{" "}
                                  {history.filter_project_type ===
                                  "CarbonCredits"
                                    ? "Tonnes"
                                    : "MWh"}{" "}
                                  {/* {console.log(
                                    "historydata",
                                    history.filter_project_type
                                  )} */}
                                  {/* {history.total_credits}  */}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-[#1D1F2199] sm:text-base text-sm border-t border-slate-200 pt-2">
                            <div className="flex gap-2 items-center">
                              <Calendar className="w-5 h-5" />
                              <div className="mt-0.5">
                                {moment(history.timestamp).format(
                                  "YYYY-MM-DD, hh:mm A"
                                )}
                              </div>
                            </div>
                            {history.total_price && (
                              <div className="text-black font-semibold">
                                total price:{" "}
                                <span className="text-[#1D1F2199] font-normal">
                                  {history.total_price} USDT
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="w-full flex justify-center mt-8">
                    <DefaultPagination
                      activePage={activePage}
                      setActivePage={setActivePage}
                      totalPages={totalPages}
                    />
                  </div>
                </>
              ) : (
                <div className="mt-5">
                  <NoData
                    height={"60vh"}
                    headingText={"No History Available"}
                    paraText={
                      "You have no transaction history at the moment. Once you make purchases or sales, your activity will be displayed here."
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div>
          <NoData
            headingText={"Log in to Continue"}
            paraText={
              "Please make sure yor are logged in to proceed with transactions."
            }
            height={"80vh"}
          />
        </div>
      )}
    </>
  );
};

export default History;
