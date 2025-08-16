import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	simulateContract,
	writeContract,
	waitForTransactionReceipt,
	readContract,
} from "@wagmi/core";
import { config } from "../../config/WalletConfig";
import {
	hiestiyaProxy,
	tokenAddress,
	decimalPoint,
	getGasEstimateAndPrice,
	getBalance,
	zeroAddress,
	getBalanceForList,
} from "../../abi";
import { abi } from "../../contractAbis";
import { useAccount, useChainId } from "wagmi";
import { erc20Abi } from "viem";
import { ethers } from "ethers";
import axios from "axios";
import moment from "moment";
import NoData from "../NoData";
import PulseLoader from "react-spinners/PulseLoader";
import { toast } from "react-toastify";
import DefaultPagination from "../pagination/DefaultPagination";
import SpinnerLoader from "../loaders/SpinnerLoader";
import { generateAndDownloadPDFCancelListing } from "../../Template/Template";
import { UserContext } from "../../context/UserContext";
import { formatSignificantFigures } from "../../services/helperFunction";

const ListingCardSection = () => {
	const navigate = useNavigate();

	const [activePage, setActivePage] = useState(
		Number(new URLSearchParams(location.search).get("page")) || 1
	);
	const [totalPages, setTotalPages] = useState(1);

	// const apiUrl = import.meta.env.VITE_API_URL;
	  const apiUrl = "https://api.hestiya.com/api/"
	const [cancelLoading, setCancelLoading] = useState(null);
	const [loading, setLoading] = useState(false);

	const [apiData, setApiData] = useState([]);
	const [gasPrices, setGasPrices] = useState({});

	const [gasUsed, setGasUsed] = useState(0);
	const [walletGas, setWalletGas] = useState(0);
    const {hasToken,hasAddress, setShowSessionModal} = useContext(UserContext);
	useEffect(() => {
		const getToken = async () => {
			if (hasAddress && zeroAddress) {
				const totalGas = await getBalanceForList(zeroAddress, hasAddress);
				setWalletGas(totalGas);
				// console.log("gas avaible in wallet", totalGas);
			}
		};
		getToken();
	}, [hasAddress]);

	const fetchListingsData = async () => {
		setLoading(true);
		try {
			if (hasAddress) {
				const res = await axios.get(
					`${apiUrl}p2p-listing/?address=${hasAddress}&page=${activePage}`
				);
				// console.log("backend listing", res.data);

				const { results, count } = res.data;

				if (!Array.isArray(results)) {
					console.error("Invalid data structure");
					setApiData([]);
					return;
				}
				// console.log("results 111", results);
				setApiData(results);

				const itemsPerPage = 9;
				const totalPages = Math.ceil(count / itemsPerPage);
				
				setTotalPages(totalPages);
				setLoading(false);
				if (results.length > 0) {
            await fetchGasPricesForListings(results);
        } else {
            setGasPrices({});
        }
				// console.log("Fetched Data:", res.data);
				// console.log(
				//   "Total Pages:",
				//   totalPages,
				//   "Items per Page:",
				//   itemsPerPage
				// );
			}
		} catch (err) {
			console.error("Error fetching listings data:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (hasAddress) {
			fetchListingsData();
			const params = new URLSearchParams(location.search);
			params.set("page", activePage);
			navigate(`?${params.toString()}`, { replace: true });
		}
	}, [hasAddress, activePage]);

	const handleCardClick = (projectId) => {
		navigate(`/marketplace/listing?projectCode=${projectId}`);
	};

	const fetchGasPricesForListings = async (listings) => {
		const gasPriceMap = {};

		for (const listing of listings) {
			try {
				const functionName = "cancelListing";
				const args = [listing.id,hasAddress];

				const { estmaiteGasPriceInUSD, estmateGasUsed } =
					await getGasEstimateAndPrice(functionName, args);
				setGasUsed(estmateGasUsed);
				if (
					estmaiteGasPriceInUSD &&
					typeof estmaiteGasPriceInUSD === "number"
				) {
					gasPriceMap[listing.id] = estmaiteGasPriceInUSD?.toFixed(8);
				} else {
					gasPriceMap[listing.id] = "N/A"; // Fallback if gas data is invalid
				}
			} catch (error) {
				console.error(
					`Error fetching gas price for listing ${listing.id}:`,
					error
				);
				gasPriceMap[listing.id] = "N/A"; // Fallback on error
			}
		}

		setGasPrices(gasPriceMap); // Store all gas prices in state
	};

	const handleCancel = async (
		listingId,
		projectId,
		name,
		retired_credits,
		year,
		e
	) => {
		e.stopPropagation();
		setCancelLoading(listingId);
		try {
			if (!hasToken) {
				const { request } = await simulateContract(config, {
					abi,
					address: hiestiyaProxy,
					functionName: "cancelListing",
					args: [listingId, hasAddress],
				});
				const hash = await writeContract(config, request);
				const transactionReceipt = await waitForTransactionReceipt(config, {
					hash,
				});
	
				if (transactionReceipt) {
					const pdfData = {
						hashId: hash ?? transactionReceipt?.data?.trx_hash,
						actionType: "Cancel Listing P2P",
						trades: [
							{
								projectId: projectId,
								projectName: name,
								retired_credits: retired_credits,
								vintageYear: year,
							},
						],
						fees: transactionReceipt.gasUsed,
					};
					// listingId = (Number(listingId) + 14).toString();
					const res = await axios.get(
						`${apiUrl}p2p-listing/${listingId}/cancel/?trx_hash=${hash}`,
						
					);
	
					if (res) {
						generateAndDownloadPDFCancelListing(pdfData);
						toast.success("Cancellation Successful");
						fetchListingsData();
					}
				}	
			}else{

				try {

					// listingId = (Number(listingId) + 14).toString();
					const res = await axios.get(
						`${apiUrl}p2p-listing/${listingId}/cancel/?trx_hash=${''}`,
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${hasToken?.access_token}`,
							},
						}
					);

					const pdfData = {
						hashId: res?.data?.trx_hash || '',
						actionType: "Cancel Listing P2P",
						trades: [
							{
								projectId: projectId,
								projectName: name,
								retired_credits: retired_credits,
								vintageYear: year,
							},
						],
						fees: String(res?.data?.gas_used) || 0,
					};
	
					if (res) {
						generateAndDownloadPDFCancelListing(pdfData);
						toast.success("Cancellation Successful");
						fetchListingsData();
					}
					
				} catch (error) {
				if (
					error?.response?.status === 401 ||
					error?.response?.data?.detail?.toLowerCase().includes("token")
				
				) {
					// toast.error("Session expired. Please login again.");
				    setShowSessionModal(true);

				} else {
					toast.error("Something Went Wrong");
				}
				console.error("Error handling cancel with token:", error);
			}
				
					
				}
			
		} catch (err) {
			toast.error("Something Went Wrong");
			console.error("Error handling cancel:", err);
		} finally {
			setCancelLoading(null);
		}
	};
	return (
		<div>
			{(apiData.length === 0 && !loading) ? (
				<NoData
					height={"60vh"}
					headingText={"No Listings Found"}
					paraText={
						"You haven't listed any projects for sale yet. Start by adding your credits to the market!"
					}
				/>
			) : (
				<>
					{loading ? (
						<div className="!h-[50vh]">
							<SpinnerLoader />
						</div>
					) : (
						<div className="min-h-[50vh]">
							<div className="mx-4 flex gap-1 flex-wrap xlll:mx-8 xl:mx-6 justify-center sm:justify-start">
								{apiData.map((card) => (
									<div
										onClick={() => {
											handleCardClick(
												card.order_item_detail.project.project_code
											);
										}}
										key={card.id}
										className="rounded-lg cursor-pointer bg-[#BDC3C733] p-4 w-[358.28px]"
									>
										<div className="flex justify-between items-center">
											<div className="flex items-center gap-2">
												<div>
													<img
														className="h-[46.23px] min-w-[46.23px]"
														src={card.order_item_detail.project.images[0].image}
														alt=""
													/>
												</div>
												<div className="text-base font-semibold leading-6">
													{card.order_item_detail.project.name}
												</div>
											</div>
											<div className="text-base font-semibold leading-6">
												Vintage Year {card.order_item_detail.vintage}
											</div>
										</div>
										<div className="mt-4 mb-3 flex justify-between">
											<div className="flex flex-col gap-[7.7px]">
												<div className="text-base font-semibold leading-[23.11px]">
													Price/{card.order_item_detail.filter_project_type === "CarbonCredits" ? "Tonne" : "MWh"}
												</div>
												<div className="text-base leading-[22.57px]">
													{formatSignificantFigures(card.price_per_credit)} USDT
												</div>
											</div>
											<div className="flex flex-col gap-[7.7px]">
												<div className="text-base font-semibold leading-[23.11px]">
													Availability
												</div>
												<div className="text-base leading-[22.57px]">
													{card.listed_quantity} {card.order_item_detail.filter_project_type === "CarbonCredits" ? "Tonne" : "MWh"}
												</div>
											</div>
										</div>
										<div className="mt-4 mb-3 flex justify-between">
											<div className="flex flex-col gap-[7.7px]">
												<div className="text-base font-semibold leading-[23.11px]">
													Estimate Transaction Fee
												</div>
												<div className="text-base leading-[22.57px]">
													{gasPrices[card.id]
														? `${Number(gasPrices[card?.id])?.toFixed(5)} USDT`
														: "Loading..."}
												</div>
											</div>
										</div>
										<div className="border-b-[0.96px] border-[#BDC3C7]"></div>
										<div className="flex mt-3 items-center justify-between">
											<div className="text-[#1D1F2199]">
												{moment(card.created_at).fromNow()}
											</div>
											<button
												onClick={(e) =>
													handleCancel(
														card.id,
														// (Number(card.id) - 14).toString(), // update later
														card.order_item_detail.project.project_code,
														card.order_item_detail.project.name,
														card.listed_quantity,
														card.order_item_detail.vintage,
														e
													)
												}
												disabled={
													cancelLoading === card.id ||
													!(Number(walletGas) > Number(gasUsed))
												}
												className={`${
													Number(walletGas) > Number(gasUsed)
														? "bg-[#CDDC6E] text-black"
														: "bg-gray-500 text-white"
												} py-[6.8px] rounded-lg font-semibold leading-[23.11px] text-[15.41px] px-[16.3px] ${
													cancelLoading === card.id ? "opacity-50" : ""
												}`}
											>
												{cancelLoading === card.id ? (
													<>
														<PulseLoader size={8} />
													</>
												) : (
													<>
														<>
															{Number(walletGas) > Number(gasUsed)
																? "Cancel listing"
																: "Insufficient Gas"}
														</>
													</>
												)}
											</button>
										</div>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="flex  justify-center mt-12">
						<DefaultPagination
							activePage={activePage}
							setActivePage={setActivePage}
							totalPages={totalPages}
						/>
					</div>
				</>
			)}
		</div>
	);
};

export default ListingCardSection;
