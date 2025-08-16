import React, { useState, useEffect, useRef } from "react";
import { Typography } from "@material-tailwind/react";
import IssuancesTable from "./IssuancesTable";
import RetirementsTable from "./RetirementsTable";
import { useLocation, useNavigate } from "react-router-dom";

const CreditSection = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "issuances"; // Get tab from URL or default to "issuances"

  const [activeTab, setActiveTab] = useState(initialTab);
  const [resetPage, setResetPage] = useState(false);

  const tabs = ["issuances", "retirements"];

  const mainDivRef = useRef(null);

  useEffect(() => {
    if (mainDivRef.current) {
      const mainDivHeight = mainDivRef.current.offsetHeight;
      // console.log(`Height of main div: ${mainDivHeight}px`);
    }
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setResetPage(true);

    // Update the tab in the URL query parameters
    const params = new URLSearchParams(location.search);
    params.set("tab", tab);
    navigate({ search: params.toString() });
  };

  // Whenever the location changes, reset the active tab to match the URL
  useEffect(() => {
    const currentTab = queryParams.get("tab") || "issuances";
    setActiveTab(currentTab);
  }, [location.search]);

  return (
    <>
      <div
        ref={mainDivRef}
        className="flex gap-4 mb-5 mt-3 shadow-lg border-b border-gray-200"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 uppercase focus:outline-none ${
              activeTab === tab
                ? "border-b-4 border-black"
                : "border-b-4 border-transparent"
            }`}
            onClick={() => handleTabClick(tab)}
          >
            <Typography
              variant="small"
              className={`${
                activeTab === tab ? "black" : "blue-gray"
              } font-medium`}
            >
              {tab}
            </Typography>
          </button>
        ))}
      </div>

      {activeTab === "issuances" && (
        <IssuancesTable resetPage={resetPage} setResetPage={setResetPage} />
      )}
      {activeTab === "retirements" && (
        <RetirementsTable resetPage={resetPage} setResetPage={setResetPage} />
      )}
    </>
  );
};

export default CreditSection;
