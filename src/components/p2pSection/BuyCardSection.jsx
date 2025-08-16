/* eslint-disable no-mixed-spaces-and-tabs */
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
	tokenContract,
	getGasEstimateAndPrice,
	getBalance,
	zeroAddress,
	getBalanceForList,
} from "../../abi";
import { abi } from "../../contractAbis";
import { useAccount, useChainId } from "wagmi";
import { erc20Abi, formatEther, parseEther } from "viem";
import { ethers } from "ethers";
import axios from "axios";
import moment from "moment";
import NoData from "../NoData";
import PulseLoader from "react-spinners/PulseLoader";
import { toast } from "react-toastify";
import DefaultPagination from "../pagination/DefaultPagination";
import SpinnerLoader from "../loaders/SpinnerLoader";
import { generateAndDownloadPDFBuyP2P } from "../../Template/Template";
import { UserContext } from "../../context/UserContext";
import { formatSignificantFigures } from "../../services/helperFunction";

const BuyCardSection = () => {
	// const { address } = useAccount();
	const navigate = useNavigate();
	const chainId = useChainId();

	const [gasUsed, setGasUsed] = useState(0);
	const [walletGas, setWalletGas] = useState(0);

	// const apiUrl = import.meta.env.VITE_API_URL;
	  const apiUrl = "https://api.hestiya.com/api/"
	const [buyLoading, setBuyLoading] = useState(null);

	const [activePage, setActivePage] = useState(
		Number(new URLSearchParams(location.search).get("page")) || 1
	);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(false);
	const [gasPrices, setGasPrices] = useState({});
	const [walletToken, setWalletToken] = useState(0);

	const [apiData, setApiData] = useState([]);

	const { hasAddress, hasToken , setShowSessionModal} = useContext(UserContext);

	useEffect(() => {
		const getToken = async () => {
			if (hasAddress && tokenAddress) {
				const totalToken = await getBalanceForList(tokenAddress, hasAddress);
				// console.log("token avaible in wallet", totalToken);
				setWalletToken(totalToken);
			}
			if (hasAddress && zeroAddress) {
				const totalGas = await getBalanceForList(zeroAddress, hasAddress);
				setWalletGas(totalGas);
				// console.log("gas avaible in wallet", totalGas);
			}
		};
		getToken();
	}, [hasAddress]);

	const fetchBuyListingsData = async () => {
		setLoading(true);

		try {
			const res = await axios.get(
				`${apiUrl}p2p-listing/?&page=${activePage}`,
			);
			// console.log("backend listing", res.data);
			const { results, count } = res.data;

			if (!Array.isArray(results)) {
				console.error("Invalid data structure");
				setApiData([]);
				return;
			}
			// console.log("results", results);
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
			// console.log("Total Pages:", totalPages, "Items per Page:", itemsPerPage);
		} catch (err) {
			console.error("Error fetching buy listings data:", err);
		} finally {
			setLoading(false);
		}
	};

	const fetchGasPricesForListings = async (listings) => {
		const gasPriceMap = {};

		for (const listing of listings) {
			try {
				const functionName = "buyCreditsFromListing";
				const args = [listing.id, listing.listed_quantity, tokenAddress];


				const { estmaiteGasPriceInUSD, estmateGasUsed } =
					await getGasEstimateAndPrice(functionName, args);

				setGasUsed(estmateGasUsed);

				// console.log(`Gas Data for listing ${listing.id}:`, estmaiteGasPriceInUSD);
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

		// console.log("check the gas price: ",gasPriceMap)

		setGasPrices(gasPriceMap); // Store all gas prices in state
	};

	useEffect(() => {
		if (hasAddress && activePage) {
			fetchBuyListingsData();
			const params = new URLSearchParams(location.search);
			params.set("page", activePage);
			navigate(`?${params.toString()}`, { replace: true });
		}
	}, [hasAddress, activePage]);

	const tokenApproval = async (value, tokenAddress) => {
		try {
			const contract = tokenContract(tokenAddress);
			const allowance = await contract.allowance(hasAddress, hiestiyaProxy);
			const allowanceInt = Number(
				formatEther(allowance.toString())
			).toLocaleString("fullwide", { useGrouping: false });

			if (allowanceInt < Number(value)) {
				const { request } = await simulateContract(config, {
					abi: erc20Abi,
					address: tokenAddress,
					functionName: "approve",
					args: [hiestiyaProxy, parseEther(value)],
				});
				const hash = await writeContract(config, request);
				const transactionReceipt = await waitForTransactionReceipt(config, {
					hash: hash,
				});
				toast.success("Token Approval Successful");
			}
		} catch (error) {
			toast.error("Error during token approval:", error);
			throw new Error("Token Approval Failed");
		}
	};



	const handleBuy = async (
		listingId,
		credits,
		total_price,
		projectId,
		projectName,
		pricePerTonne,
		vintageYear,
		e
	) => {
		e.stopPropagation();
 
		//  const pdfData = {
		// 				hashId: "0x3757sdsf96898",
		// 				actionType: "Buy P2P",
		// 				trades: [
		// 					{
		// 						projectId: '4',
		// 						listingId: "78",
		// 						projectName: "Hesitya Marketplace",
		// 						totalTonnes: "31",
		// 						pricePerTonne: "235",
		// 						vintageYear: 2023,
		// 					},
		// 				],
		// 				fees: 0.611,
		// 			};
		// 			generateAndDownloadPDFBuyP2P(pdfData);
		// return;


		setBuyLoading(listingId);
		try {
		if(!hasToken){
			if (chainId !== 31337) {
				// token approve if needed
				await tokenApproval(total_price.toString(), tokenAddress);
			}
			// console.log("listingId", listingId, credits, tokenAddress);
			const { request } = await simulateContract(config, {
				abi: abi,
				address: hiestiyaProxy,
				functionName: "buyCreditsFromListing",
				args: [listingId, credits, tokenAddress],
			});
			const hash = await writeContract(config, request);
			const transactionReceipt = await waitForTransactionReceipt(config, {
				hash,
			});

			if (transactionReceipt && hash) {
				// console.log("transaction check ...")
				// listingId = (Number(listingId) + 14).toString();
				const resp = await axios.post(`${apiUrl}p2p-transaction/`, {
					listing: listingId,
					buyer: hasAddress,
					trx_hash: hash,
				});
				if (resp) {
					const pdfData = {
						hashId: hash ?? transactionReceipt?.data?.trx_hash,
						actionType: "Buy P2P",
						trades: [
							{
								projectId: projectId,
								listingId: listingId,
								projectName: projectName,
								totalTonnes: credits,
								pricePerTonne: pricePerTonne,
								vintageYear: vintageYear,
							},
						],
						fees: transactionReceipt.gasUsed,
					};
					generateAndDownloadPDFBuyP2P(pdfData);

					toast.success("Purchase Successful");
					// console.log(transactionReceipt);
					// console.log("hash:" + hash);
					fetchBuyListingsData();
				}
			}
		}else{

			try {
				// listingId = (Number(listingId) + 14).toString();
				const resp = await axios.post(`${apiUrl}p2p-transaction/`, {
					listing: listingId,
					buyer: hasAddress,
					trx_hash: "",
				},
				{
					headers: {
					  "Content-Type": "application/json",
					  Authorization: `Bearer ${hasToken?.access_token.toString().trim()}`,
					},
				  }
			);
				if (resp) {
					const pdfData = {
						hashId: resp?.data?.trx_hash,
						actionType: "Buy P2P",
						trades: [
							{
								projectId: projectId,
								listingId: listingId,
								projectName: projectName,
								totalTonnes: credits,
								pricePerTonne: pricePerTonne,
								vintageYear: vintageYear,
							},
						],
						fees: resp?.data?.gas_used || 0,
					};
					generateAndDownloadPDFBuyP2P(pdfData);

					toast.success("Purchase Successful");
					// console.log(transactionReceipt);
					// console.log("hash:" + hash);
					fetchBuyListingsData();
				}
			}catch (error) {
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
			console.error("Error handling buy:", err);
		} finally {
			setBuyLoading(null);
		}
	};

	const handleCardClick = (projectId) => {
		navigate(`/marketplace/listing?projectCode=${projectId}`);
	};

	// console.log("walletGas", typeof walletGas);
	// console.log("gasUsed", typeof gasUsed);

	return (
		<div>
			{( apiData.length === 0  && !loading)? (
				<NoData
					height={"60vh"}
					headingText={"No Listings Available"}
					paraText={
						"There are no available listings for sale at the moment. Be the first to list your credits on the market!"
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
								{[...apiData].reverse().map((card) => (
									<div
										onClick={() => {
											handleCardClick(
												card.order_item_detail.project.project_code
											);
										}}
										key={card.id}
										className="rounded-lg cursor-pointer bg-[#BDC3C733] p-4 w-[358.28px]"
									>
										<div className=" flex-col w-full">
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
											<div className="text-base mt-5 w-fit font-semibold leading-6 ">
												Vintage Year :  <span className="text-gray-700 md:ps-2">{card.order_item_detail.vintage}</span>
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
													{card.listed_quantity} {card.order_item_detail.filter_project_type === "CarbonCredits" ? "Tonnes" : "MWh"}
												</div>
											</div>
										</div>

										<div className="mt-4 mb-3 flex justify-between">
											<div className="flex flex-col gap-[7.7px]">
												<div className="text-base font-semibold leading-[23.11px]">
													Estimate Transaction Fee
												</div>
												<div className="text-base leading-[22.57px]">
													{gasPrices[card?.id]
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

												{/* {console.log("card.seller",card.seller,hasAddress)} */}


											 {
												card.seller === hasAddress ? (
													<button disabled={true} className="bg-[#CDDC6E] disabled text-black py-[6.8px] rounded-lg font-semibold leading-[23.11px] text-[15.41px] px-[16.3px]">
														Listed by you
													</button>
												):(
												
													<button
												onClick={(e) =>
													handleBuy(
														card.id,
														// (Number(card.id) - 14).toString(), // update later
														card.listed_quantity,
														card.total_price,
														card.order_item_detail.project.project_code,
														card.order_item_detail.project.name,
														card.price_per_credit,
														card.order_item_detail.vintage,
														e
													)
												}
												disabled={
													buyLoading === card.id ||
													!(
														Number(walletGas) > Number(gasUsed) &&
														Number(walletToken) >= Number(card.total_price)
													)
												}
												className={`${
													Number(walletGas) > Number(gasUsed) &&
													Number(walletToken) >= Number(card.total_price)
														? "bg-[#CDDC6E] text-black"
														: "bg-gray-500 text-white"
												} py-[6.8px] rounded-lg font-semibold leading-[23.11px] text-[15.41px] px-[16.3px] ${
													buyLoading === card.id ? "opacity-50" : ""
												}`}
											>
												{buyLoading === card.id ? (
													<PulseLoader size={8} />
												) : (
													<>
														{Number(walletGas) < Number(gasUsed)
															? "Insufficient Gas"
															: Number(walletToken) < Number(card.total_price)
															? "Insufficient Balance"
															: "Buy"}
													</>
												)}
											</button>
												
												)
											 }

											
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

export default BuyCardSection;













































// /* eslint-disable no-mixed-spaces-and-tabs */
// import React, { useContext, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
// 	simulateContract,
// 	writeContract,
// 	waitForTransactionReceipt,
// 	readContract,
// } from "@wagmi/core";
// import { config } from "../../config/WalletConfig";
// import {
// 	hiestiyaProxy,
// 	tokenAddress,
// 	decimalPoint,
// 	tokenContract,
// 	getGasEstimateAndPrice,
// 	getBalance,
// 	zeroAddress,
// } from "../../abi";
// import { abi } from "../../contractAbis";
// import { useAccount, useChainId } from "wagmi";
// import { erc20Abi, formatEther, parseEther } from "viem";
// import { ethers } from "ethers";
// import axios from "axios";
// import moment from "moment";
// import NoData from "../NoData";
// import PulseLoader from "react-spinners/PulseLoader";
// import { toast } from "react-toastify";
// import DefaultPagination from "../pagination/DefaultPagination";
// import SpinnerLoader from "../loaders/SpinnerLoader";
// import { generateAndDownloadPDFBuyP2P } from "../../Template/Template";
// import { UserContext } from "../../context/UserContext";

// const BuyCardSection = () => {
// 	// const { address } = useAccount();
// 	const navigate = useNavigate();
// 	const chainId = useChainId();

// 	const [gasUsed, setGasUsed] = useState(0);
// 	const [walletGas, setWalletGas] = useState(0);

// 	// const apiUrl = import.meta.env.VITE_API_URL;
// 	  const apiUrl = "https://api.hestiya.com/api/"
// 	const [buyLoading, setBuyLoading] = useState(null);

// 	const [activePage, setActivePage] = useState(
// 		Number(new URLSearchParams(location.search).get("page")) || 1
// 	);
// 	const [totalPages, setTotalPages] = useState(1);
// 	const [loading, setLoading] = useState(false);
// 	const [gasPrices, setGasPrices] = useState({});
// 	const [walletToken, setWalletToken] = useState(0);

// 	const [apiData, setApiData] = useState([]);

// 	const { hasAddress, hasToken } = useContext(UserContext);

// 	useEffect(() => {
// 		const getToken = async () => {
// 			if (hasAddress && tokenAddress) {
// 				const totalToken = await getBalance(tokenAddress, hasAddress);
// 				// console.log("token avaible in wallet", totalToken);
// 				setWalletToken(totalToken);
// 			}
// 			if (hasAddress && zeroAddress) {
// 				const totalGas = await getBalance(zeroAddress, hasAddress);
// 				setWalletGas(totalGas);
// 				// console.log("gas avaible in wallet", totalGas);
// 			}
// 		};
// 		getToken();
// 	}, [hasAddress]);

// 	const fetchBuyListingsData = async () => {
// 		setLoading(true);

// 		try {
// 			const res = await axios.get(
// 				`${apiUrl}p2p-listing/?page=${activePage}` // Removed the except parameter to show all listings
// 			);
// 			console.log("backend listing", res.data);
// 			const { results, count } = res.data;

// 			if (!Array.isArray(results)) {
// 				console.error("Invalid data structure");
// 				setApiData([]);
// 				return;
// 			}
// 			// console.log("results", results);
// 			setApiData(results);

// 			const itemsPerPage = 10;
// 			const totalPages = Math.ceil(count / itemsPerPage);
// 			setTotalPages(totalPages);
// 			await fetchGasPricesForListings(results);
// 			// console.log("Fetched Data:", res.data);
// 			// console.log("Total Pages:", totalPages, "Items per Page:", itemsPerPage);
// 		} catch (err) {
// 			console.error("Error fetching buy listings data:", err);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const fetchGasPricesForListings = async (listings) => {
// 		const gasPriceMap = {};

// 		for (const listing of listings) {
// 			try {
// 				// Only calculate gas for listings not owned by the user
// 				if (listing.seller.toLowerCase() !== hasAddress?.toLowerCase()) {
// 					const functionName = "buyCreditsFromListing";
// 					const args = [listing.id, listing.listed_quantity, tokenAddress];

// 					const { estmaiteGasPriceInUSD, estmateGasUsed } =
// 						await getGasEstimateAndPrice(functionName, args);

// 					setGasUsed(estmateGasUsed);

// 					// console.log(`Gas Data for listing ${listing.id}:`, estmaiteGasPriceInUSD);
// 					if (
// 						estmaiteGasPriceInUSD &&
// 						typeof estmaiteGasPriceInUSD === "number"
// 					) {
// 						gasPriceMap[listing.id] = estmaiteGasPriceInUSD?.toFixed(8);
// 					} else {
// 						gasPriceMap[listing.id] = "N/A"; // Fallback if gas data is invalid
// 					}
// 				} else {
// 					gasPriceMap[listing.id] = "N/A"; // No gas needed for own listings
// 				}
// 			} catch (error) {
// 				console.error(
// 					`Error fetching gas price for listing ${listing.id}:`,
// 					error
// 				);
// 				gasPriceMap[listing.id] = "N/A"; // Fallback on error
// 			}
// 		}

// 		setGasPrices(gasPriceMap); // Store all gas prices in state
// 	};

// 	useEffect(() => {
// 		if (hasAddress) {
// 			fetchBuyListingsData();
// 			const params = new URLSearchParams(location.search);
// 			params.set("page", activePage);
// 			navigate(`?${params.toString()}`, { replace: true });
// 		}
// 	}, [hasAddress, activePage]);

// 	const tokenApproval = async (value, tokenAddress) => {
// 		try {
// 			const contract = tokenContract(tokenAddress);
// 			const allowance = await contract.allowance(hasAddress, hiestiyaProxy);
// 			const allowanceInt = Number(
// 				formatEther(allowance.toString())
// 			).toLocaleString("fullwide", { useGrouping: false });

// 			if (allowanceInt < Number(value)) {
// 				const { request } = await simulateContract(config, {
// 					abi: erc20Abi,
// 					address: tokenAddress,
// 					functionName: "approve",
// 					args: [hiestiyaProxy, parseEther(value)],
// 				});
// 				const hash = await writeContract(config, request);
// 				const transactionReceipt = await waitForTransactionReceipt(config, {
// 					hash: hash,
// 				});
// 				toast.success("Token Approval Successful");
// 			}
// 		} catch (error) {
// 			toast.error("Error during token approval:", error);
// 			throw new Error("Token Approval Failed");
// 		}
// 	};

// 	const handleBuy = async (
// 		listingId,
// 		credits,
// 		total_price,
// 		projectId,
// 		projectName,
// 		pricePerTonne,
// 		vintageYear,
// 		e
// 	) => {
// 		e.stopPropagation();
// 		setBuyLoading(listingId);
// 		try {
// 		if(!hasToken){
// 			if (chainId !== 31337) {
// 				// token approve if needed
// 				await tokenApproval(total_price.toString(), tokenAddress);
// 			}
// 			// console.log("listingId", listingId, credits, tokenAddress);
// 			const { request } = await simulateContract(config, {
// 				abi: abi,
// 				address: hiestiyaProxy,
// 				functionName: "buyCreditsFromListing",
// 				args: [listingId, credits, tokenAddress],
// 			});
// 			const hash = await writeContract(config, request);
// 			const transactionReceipt = await waitForTransactionReceipt(config, {
// 				hash,
// 			});

// 			if (transactionReceipt && hash) {
// 				// console.log("transaction check ...")
// 				// listingId = (Number(listingId) + 14).toString();
// 				const resp = await axios.post(`${apiUrl}p2p-transaction/`, {
// 					listing: listingId,
// 					buyer: hasAddress,
// 					trx_hash: hash,
// 				});
// 				if (resp) {
// 					const pdfData = {
// 						hashId: hash ?? transactionReceipt?.data?.trx_hash,
// 						actionType: "Buy P2P",
// 						trades: [
// 							{
// 								projectId: projectId,
// 								listingId: listingId,
// 								projectName: projectName,
// 								totalTonnes: credits,
// 								pricePerTonne: pricePerTonne,
// 								vintageYear: vintageYear,
// 							},
// 						],
// 						fees: transactionReceipt.gasUsed,
// 					};
// 					generateAndDownloadPDFBuyP2P(pdfData);

// 					toast.success("Purchase Successful");
// 					// console.log(transactionReceipt);
// 					// console.log("hash:" + hash);
// 					fetchBuyListingsData();
// 				}
// 			}
// 		}else{
			
// 				// listingId = (Number(listingId) + 14).toString();
// 				const resp = await axios.post(`${apiUrl}p2p-transaction/`, {
// 					listing: listingId,
// 					buyer: hasAddress,
// 					trx_hash: "",
// 				},
// 				{
// 					headers: {
// 					  "Content-Type": "application/json",
// 					  Authorization: `Bearer ${hasToken?.access_token.toString().trim()}`,
// 					},
// 				  }
// 			);
// 				if (resp) {
// 					const pdfData = {
// 						hashId: resp?.data?.trx_hash,
// 						actionType: "Buy P2P",
// 						trades: [
// 							{
// 								projectId: projectId,
// 								listingId: listingId,
// 								projectName: projectName,
// 								totalTonnes: credits,
// 								pricePerTonne: pricePerTonne,
// 								vintageYear: vintageYear,
// 							},
// 						],
// 						fees: resp?.data?.gas_used || 0,
// 					};
// 					generateAndDownloadPDFBuyP2P(pdfData);

// 					toast.success("Purchase Successful");
// 					// console.log(transactionReceipt);
// 					// console.log("hash:" + hash);
// 					fetchBuyListingsData();
// 				}
// 			}
		
// 		} catch (err) {
// 			toast.error("Something Went Wrong");
// 			console.error("Error handling buy:", err);
// 		} finally {
// 			setBuyLoading(null);
// 		}
// 	};

// 	const handleCardClick = (projectId) => {
// 		navigate(`/marketplace/listing?projectCode=${projectId}`);
// 	};

// 	// console.log("walletGas", typeof walletGas);
// 	// console.log("gasUsed", typeof gasUsed);

// 	return (
// 		<div>
// 			{apiData.length === 0 ? (
// 				<NoData
// 					height={"60vh"}
// 					headingText={"No Listings Available"}
// 					paraText={
// 						"There are no available listings for sale at the moment. Be the first to list your credits on the market!"
// 					}
// 				/>
// 			) : (
// 				<>
// 					{loading ? (
// 						<div className="!h-[50vh]">
// 							<SpinnerLoader />
// 						</div>
// 					) : (
// 						<div className="min-h-[50vh]">
// 							<div className="mx-4 flex gap-1 flex-wrap xlll:mx-8 xl:mx-6 justify-center sm:justify-start">
// 								{[...apiData].reverse().map((card) => {
// 									const isOwnListing = card.seller.toLowerCase() === hasAddress?.toLowerCase();
									
// 									return (
// 										<div
// 											onClick={() => {
// 												handleCardClick(
// 													card.order_item_detail.project.project_code
// 												);
// 											}}
// 											key={card.id}
// 											className="rounded-lg bg-[#BDC3C733] p-4 w-[358.28px]"
// 										>
// 											<div className=" flex-col w-full">
// 												<div className="flex items-center gap-2">
// 													<div>
// 														<img
// 															className="h-[46.23px] min-w-[46.23px]"
// 															src={card.order_item_detail.project.images[0].image}
// 															alt=""
// 														/>
// 													</div>
// 													<div className="text-base font-semibold leading-6">
// 														{card.order_item_detail.project.name}
// 													</div>
// 												</div>
// 												<div className="text-base mt-5 w-fit font-semibold leading-6 ">
// 													Vintage Year :  <span className="text-gray-700 md:ps-2">{card.order_item_detail.vintage}</span>
// 												</div>
// 											</div>
// 											<div className="mt-4 mb-3 flex justify-between">
// 												<div className="flex flex-col gap-[7.7px]">
// 													<div className="text-base font-semibold leading-[23.11px]">
// 														Price/{card.order_item_detail.filter_project_type === "CarbonCredits" ? "Tonne" : "MWh"}
// 													</div>
// 													<div className="text-base leading-[22.57px]">
// 														{card.price_per_credit} USDT
// 													</div>
// 												</div>
// 												<div className="flex flex-col gap-[7.7px]">
// 													<div className="text-base font-semibold leading-[23.11px]">
// 														Availability
// 													</div>
// 													<div className="text-base leading-[22.57px]">
// 														{card.listed_quantity} {card.order_item_detail.filter_project_type === "CarbonCredits" ? "Tonnes" : "MWh"}
// 													</div>
// 												</div>
// 											</div>

// 											<div className="mt-4 mb-3 flex justify-between">
// 												<div className="flex flex-col gap-[7.7px]">
// 													<div className="text-base font-semibold leading-[23.11px]">
// 														Estimate Transaction Fee
// 													</div>
// 													<div className="text-base leading-[22.57px]">
// 														{gasPrices[card.id]
// 															? `${gasPrices[card.id]} USDT`
// 															: "N/A"}
// 													</div>
// 												</div>
// 											</div>

// 											<div className="border-b-[0.96px] border-[#BDC3C7]"></div>
// 											<div className="flex mt-3 items-center justify-between">
// 												<div className="text-[#1D1F2199]">
// 													{moment(card.created_at).fromNow()}
// 												</div>
// 												<button
// 													onClick={(e) => {
// 														if (!isOwnListing) {
// 															handleBuy(
// 																card.id,
// 																card.listed_quantity,
// 																card.total_price,
// 																card.order_item_detail.project.project_code,
// 																card.order_item_detail.project.name,
// 																card.price_per_credit,
// 																card.order_item_detail.vintage,
// 																e
// 															)
// 														} else {
// 															e.stopPropagation();
// 														}
// 													}}
// 													disabled={
// 														isOwnListing ||
// 														buyLoading === card.id ||
// 														!(
// 															Number(walletGas) > Number(gasUsed) &&
// 															Number(walletToken) >= Number(card.total_price)
// 														)
// 													}
// 													className={`${
// 														isOwnListing 
// 															? "bg-gray-300 text-gray-600 cursor-default"
// 															: Number(walletGas) > Number(gasUsed) &&
// 															  Number(walletToken) >= Number(card.total_price)
// 															? "bg-[#CDDC6E] text-black"
// 															: "bg-gray-500 text-white"
// 													} py-[6.8px] rounded-lg font-semibold leading-[23.11px] text-[15.41px] px-[16.3px] ${
// 														buyLoading === card.id ? "opacity-50" : ""
// 													}`}
// 												>
// 													{buyLoading === card.id ? (
// 														<PulseLoader size={8} />
// 													) : (
// 														<>
// 															{isOwnListing
// 																? "Listed by you"
// 																: Number(walletGas) < Number(gasUsed)
// 																? "Insufficient Gas"
// 																: Number(walletToken) < Number(card.total_price)
// 																? "Insufficient Balance"
// 																: "Buy"}
// 														</>
// 													)}
// 												</button>
// 											</div>
// 										</div>
// 									);
// 								})}
// 							</div>
// 						</div>
// 					)}

// 					<div className="flex  justify-center mt-12">
// 						<DefaultPagination
// 							activePage={activePage}
// 							setActivePage={setActivePage}
// 							totalPages={totalPages}
// 						/>
// 					</div>
// 				</>
// 			)}
// 		</div>
// 	);
// };

// export default BuyCardSection;