import React, { useEffect, useState } from "react";
import CustomDropdown from "./CustomDropdownWithName";
import axios from "axios";
import { ReactComponent as Calendar } from "../../assets/svg/calendar-lines.svg";
import moment from "moment";
import { MdContentCopy } from "react-icons/md";
import NoData from "../NoData";
import { FaSearch } from "react-icons/fa";
import ActionDropDown from "./ActionDropDown";

const PublicHistorySection = () => {
	// const apiUrl = import.meta.env.VITE_API_URL;
	  const apiUrl = "https://api.hestiya.com/api/"

	const [projectIds, setProjectIds] = useState("");
	const [projectOption, setProjectOption] = useState("");
	const [apiData, setApiData] = useState([]);

	const [query, setQuery] = useState("");
	const [searchParam, setSearchParam] = useState("");
	const [action_type, setAction_Type] = useState("");

	// Handle search action
	const handleSearch = () => {
		if (query.length > 10) {
			setSearchParam(query);
			// console.log("Search query:", query);
		} else if (query.length === 0) {
			setSearchParam("");
		}
		// Add your search logic here
	};

	// Handle input change
	const handleChange = (e) => {
		setQuery(e.target.value);
	};

	// Handle Enter key press
	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const fetchProjectData = async () => {
		try {
			const project = await axios.get(`${apiUrl}project`);
			// console.log("projeeeê", project.data);
			setProjectOption(project.data);
		} catch (error) {
			console.error("error", error);
		}
	};
	// /api/project/
	useEffect(() => {
		fetchProjectData();
	}, []);

	const filterFetchData = async () => {
		try {
			// console.log("projectIds 123", projectIds);
			if (projectIds === "") {
				setApiData([]);
				setAction_Type("");
				setSearchParam("");
			} else {
				const data = await axios.get(
					`${apiUrl}activity-log/?address=${searchParam}&page=1&project_id__project_code=${projectIds}&project_name=&action_type=${action_type}`
				);
				// console.log("dataaaa 121", data.data.results);
				setApiData(data.data.results);
			}
		} catch (error) {
			console.error("error", error);
		}
	};

	useEffect(() => {
		filterFetchData();
	}, [projectIds, searchParam, action_type]);

	return (
		<>
			<div className=" flex items-end gap-4 md:flex-row flex-col">
				<div className="w-full md:w-[220px]">
					<CustomDropdown
						showLabel={true}
						label="Project"
						options={projectOption}
						value={projectIds}
						onChange={(e) => {
							setProjectIds(e.target.value);
							setAction_Type("");
							setSearchParam("");
							// console.log("Selected Project:", e.target.value);
						}}
						id="project"
					/>
				</div>

				{projectIds !== "" && (
					<>
						<div className="relative w-full md:w-[220px]">
							<label
								htmlFor="search-input"
								className="block text-base text-[#1D1F2199] font-semibold leading-6"
							>
								Wallet Address
							</label>
							<div className="relative">
								<input
									type="text"
									value={query}
									onChange={handleChange}
									onKeyDown={handleKeyDown}
									placeholder="Search..."
									className="w-full rounded-lg border border-gray-300 pl-2 py-2 md:pl-4 md:py-4 xlll:pl-6 xlll:py-5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1.5 md:mt-3"
								/>
								<button
									onClick={handleSearch}
									className="absolute right-3 top-1/2 mt-[2px] md:mt-1 transform -translate-y-1/2 text-gray-600"
								>
									<FaSearch size={20} />
								</button>
							</div>
						</div>

						<div className="w-full md:w-[220px] ">
							<ActionDropDown
								onValueChange={(value) => {
									setAction_Type(value);
								}}
							/>
						</div>
					</>
				)}
			</div>

			{projectIds === "" ? (
				<NoData height={"60vh"} headingText={"Please Select Project First"} />
			) : (
				<>
					<div className="mt-4 flex flex-col items-center gap-4 ">
						{apiData.length > 0 ? (
							<>
								{apiData.map((history) => (
									<>
										<div className="bg-white w-full xl:w-2/3 shadow-sm border border-slate-200 rounded-lg p-4 capitalize">
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
								: history.action_type === "ADMIN_TRANSFER"
        ? "Marketplace Purchase With Bank"
                                : "" ?? "--"}
												</div>
												{history.vintage_year && (
													<div className="sm:text-lg text-base">
														vintage {history.vintage_year}
													</div>
												)}
											</div>
											<div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between pt-3 pb-2 sm:text-xl text-lg font-semibold sm:items-center">
												<div className="">{history.project_name}</div>
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
																			: history.action_type ===
																			  "BUY_MARKETPLACE"
																			? "text-green-500"
																			: history.action_type ===
																			  "REDEEM_CREDITS"
																			? "text-green-500"
																			: history.action_type ===
																			  "BUY_WITH_STRIPE"
																			? "text-green-500"
																			: history.action_type ===
																			  "ADMIN_TRANSFER"
																			? "text-green-500"
																			: ""
																	}
                                  `}
														>
															{history.action_type === "RETIRE_CREDITS" ? (
																<>- {history.total_credits}</>
															) : history.action_type === "CANCEL_LIST" ? (
																<>- {history.total_credits}</>
															) : history.action_type === "LIST_P2P" ? (
																<>{history.total_credits}</>
															) : history.action_type === "BUY_P2P" ? (
																<>+ {history.total_credits}</>
															) : history.action_type === "BUY_MARKETPLACE" ? (
																<>+ {history.total_credits}</>
															) : history.action_type === "REDEEM_CREDITS" ? (
																<>+ {history.total_credits}</>
															) : history.action_type === "BUY_WITH_STRIPE" ? (
																<>+ {history.total_credits}</>
															) :
																history.action_type === "ADMIN_TRANSFER" ? (
																<>+ {history.total_credits}</>
															) : 
															 (
																""
															)}{" "}
															Tonnes
															{/* {history.total_credits} ton */}
														</div>
													</div>
												)}
											</div>
											<div className="text-lg flex items-center gap-1 font-semibold">
												Sender Address :{" "}
												<div className="text-[#1D1F2199] font-normal">
													{history.sender_address ? (
														<>
															{history.sender_address.slice(0, 5)}...
															{history.sender_address.slice(-4)}
														</>
													) : (
														"NA"
													)}
												</div>
												{history.sender_address && (
													<MdContentCopy
														className=" cursor-pointer"
														onClick={() =>
															navigator.clipboard.writeText(
																history.sender_address
															)
														}
													/>
												)}
											</div>
											<div className="text-lg flex gap-1 items-center font-semibold pb-3">
												Buyer Address :{" "}
												<div className="text-[#1D1F2199] font-normal">
													{history.buyer_address ? (
														<>
															{history.buyer_address.slice(0, 5)}...
															{history.buyer_address.slice(-4)}
														</>
													) : (
														"NA"
													)}
												</div>
												{history.buyer_address && (
													<MdContentCopy
														className=" cursor-pointer"
														onClick={() =>
															navigator.clipboard.writeText(
																history.sender_address
															)
														}
													/>
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
															{history.total_price} USBT
														</span>
													</div>
												)}
											</div>
										</div>
									</>
								))}
							</>
						) : (
							<>
								<NoData
									height={"60vh"}
									headingText={"No Projects Available"}
									paraText={
										"Currently, there are no projects listed. Please check back later for updates!"
									}
								/>
							</>
						)}
					</div>
				</>
			)}
		</>
	);
};

export default PublicHistorySection;
