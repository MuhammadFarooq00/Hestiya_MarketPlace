import { useLocation, useNavigate } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import NoData from "../NoData";
import BuyCardSection from "./BuyCardSection";
import ListingCardSection from "./ListingCardSection";
import { UserContext } from "../../context/UserContext";

const P2P = () => {
	const { userDetails,hasAddress } = useContext(UserContext);

	// const { address } = useAccount();
	const navigate = useNavigate();
	const { search } = useLocation();

	const queryParams = new URLSearchParams(search);
	const initialTab = queryParams.get("tab") || "Buy";
	const [activeTab, setActiveTab] = useState(initialTab);

	useEffect(() => {
		const params = new URLSearchParams(search);
		params.set("tab", activeTab);
		navigate(`?${params.toString()}`, { replace: true });
	}, [activeTab, navigate, search]);

	const handleTabChange = (newTab) => {
		setActiveTab(newTab);
		// Reset activePage to 1 when the tab changes
		const params = new URLSearchParams(search);
		params.set("tab", newTab);
		params.set("page", 1); // Reset page to 1
		navigate(`?${params.toString()}`, { replace: true });
	};

	return (
		<>
			{hasAddress ? (
				<div className="flex flex-col gap-9">
					<div className="border-[#BDC3C7] border-[1px] h-[64px] flex">
						<button
							className={`border-[#BDC3C7] border-r-[2px] w-[250px] h-full text-base font-normal leading-[22.4px] ${
								activeTab === "Buy"
									? " bg-[#CDDC6E] text-black"
									: " bg-white text-[#1D1F2199]"
							}`}
							onClick={() => handleTabChange("Buy")}
						>
							Listed Credits
						</button>
						<button
							className={` border-[#BDC3C7] border-r-[2px] w-[250px] h-full text-base font-normal leading-[22.4px] ${
								activeTab === "List"
									? " bg-[#CDDC6E] text-black"
									: " bg-white text-[#1D1F2199]"
							}`}
							onClick={() => handleTabChange("List")}
						>
							My Listings
						</button>
					</div>

					<div className="xlll:mx-8 xl:mx-6 mx-4 flex flex-col sm:flex-row gap-1 sm:gap-0 sm:items-center justify-between">
						<div className="text-lg sx:text-xl xl:text-[28px] font-semibold text-black leading-6 xl:leading-[33.6px]">
							Hello{" "}
							{userDetails && (
								<>
									{userDetails?.first_name} {userDetails?.last_name}
								</>
							)}
						</div>
						{/* <div className="w-full sm:w-[250px] xl:w-[270px]">
              <CustomDropdown
                label="Manage Holdings"
                showLabel={false}
                options={["Location 1", "Location 2", "Location 3"]}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  console.log("Selected Location:", e.target.value);
                }}
                id="location"
              />
            </div> */}
					</div>

					{activeTab === "Buy" && <BuyCardSection />}
					{activeTab === "List" && <ListingCardSection />}
				</div>
			) : (
				<NoData
					height={"80vh"}
					headingText={"Log in to Continue"}
					paraText={"Please make sure yor are logged in to proceed with transactions."}
				/>
			)}
		</>
	);
};

export default P2P;
