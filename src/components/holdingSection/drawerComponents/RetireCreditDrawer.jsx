import React, { useContext, useEffect, useState } from "react";
import { Input } from "@material-tailwind/react";
import { Bounce, toast } from "react-toastify";
import {
	simulateContract,
	waitForTransactionReceipt,
	writeContract,
} from "@wagmi/core";
import {
	hiestiyaProxy,
	getGasEstimateAndPrice,
	zeroAddress,
	getBalance,
	getBalanceForList,
} from "../../../abi";
import { abi } from "../../../contractAbis";
import { config } from "../../../config/WalletConfig";
import axios from "axios";
import PulseLoader from "react-spinners/PulseLoader";
import { generateAndDownloadPDFRetire } from "../../../Template/Template";
import { UserContext } from "../../../context/UserContext";

// Main component
const RetireCreditDrawer = ({
	isOpen,
	name,
	onClose,
	vintageData = [],
	projectId,
	getProjectById,
	address,
	filter_project_type
}) => {
	// const apiUrl = import.meta.env.VITE_API_URL;
	const apiUrl = "https://api.hestiya.com/";
	const [loadingYear, setLoadingYear] = useState(null);
	const [quantities, setQuantities] = useState({});
	// console.log("vintageData", vintageData);

	const [gasPrices, setGasPrices] = useState({});
	const [loadingGas, setLoadingGas] = useState(false);

	const [walletGas, setWalletGas] = useState(0);
	const [gasUsed, setGasUsed] = useState(0);
    const {hasToken, setShowSessionModal} = useContext(UserContext);
	const getToken = async () => {
		if (address && zeroAddress) {
			const totalGas = await getBalanceForList(zeroAddress, address);
			setWalletGas(totalGas);
			// console.log("gas avaible in wallet", totalGas);
		}
	};
	useEffect(() => {
		getToken();
		fetchGasPrice(projectId, 2024, 0);
	}, [address]);

	const handleQuantityChange = async (year, value) => {
		const availableTonnes =
			vintageData.find((item) => item.year === year)?.credits || 0;
		if (value > availableTonnes) {
			toast.error(`Quantity Limit Exceeded.`, {
				transition: Bounce,
			});
			return;
		}

		setQuantities((prev) => ({
			...prev,
			[year]: value,
		}));

		if (value > 0) {
			await fetchGasPrice(projectId, year, value);
		}
	};
	const fetchGasPrice = async (projectId, year, quantity) => {
		setLoadingGas(true);
		try {
			const functionName = "retire";
			const args = [projectId, year, quantity];
			const { estmaiteGasPriceInUSD, estmateGasUsed } =
				await getGasEstimateAndPrice(functionName, args);
			setGasUsed(estmateGasUsed);
			setGasPrices((prev) => ({
				...prev,
				[year]: estmaiteGasPriceInUSD, // Store the gas price for this specific year
			}));
		} catch (error) {
			console.error("Failed to fetch gas data:", error);
		} finally {
			setLoadingGas(false);
		}
	};
	const handleRetireVintage = async (year, id) => {
		// console.log("iddd", id);
		setLoadingYear(year);
		try {
			const quantity = quantities[year];
			// console.log("quantity", quantity);
			if (!quantity || quantity <= 0) {
				toast.error("Invalid Quantity.", { transition: Bounce });
				return;
			}
        if (!hasToken) {
			const { request } = await simulateContract(config, {
				abi: abi,
				address: hiestiyaProxy,
				functionName: "retire",
				args: [projectId, year, quantity],
			});

			const hash = await writeContract(config, request);
			const transcationResp = await waitForTransactionReceipt(config, { hash });
			const retrieData = {
				order_item: id,
				trx_hash: hash,
				retired_credits: Number(quantity),
			};

			if (transcationResp && hash) {
				const res = await axios.post(
					`${apiUrl}credit-retirement/`,
					retrieData,
				);

				const pdfData = {
					hashId: hash ?? transcationResp?.data?.trx_hash,
					actionType: "Retire Credits",
					trades: [
						{
							projectId: projectId,
							projectName: name,
							retired_credits: Number(quantity),
							vintageYear: year,
						},
					],
					fees: transcationResp.gasUsed,
				};

				if (res) {
					generateAndDownloadPDFRetire(pdfData);
					// console.log(res, "innner suces");
					toast.success(`Retirement Successful`);
					onClose();
					setQuantities({});
					getProjectById();
					getToken();
				}
			}
		 } else {

			try {
					// console.log("No token")
					const retrieData = {
						order_item: id,
						trx_hash: "",
						retired_credits: Number(quantity),
					};
				const res = await axios.post(
						`${apiUrl}credit-retirement/`,
						retrieData,
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${hasToken?.access_token?.toString().trim()}`,
							},
						}
					);
	
					const pdfData = {
						hashId:  res?.data?.trx_hash,
						actionType: "Retire Credits",
						trades: [
							{
								projectId: projectId,
								projectName: name,
								retired_credits: Number(quantity),
								vintageYear: year,
							},
						],
						fees:  res?.data?.gas_used || 0,
					};
	
					if (res) {
						generateAndDownloadPDFRetire(pdfData);
						// console.log(res, "innner suces");
						toast.success(`Retirement Successful`);
						onClose();
						setQuantities({});
						getProjectById();
						getToken();
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
					// console.log("res", res);
				}
			}
	
	 catch (error) {
		console.error("error", error);
		toast.error("Retirement Failed.", { transition: Bounce });
	} finally {
		setLoadingYear(null);
	}
};

	const handleClose = () => {
		setQuantities({});
		onClose();
	};

	return (
		<div>
			{/* Backdrop Overlay */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
					onClick={handleClose}
				/>
			)}

			{/* Drawer */}
			<div
				className={`fixed top-0 right-0 w-full md:w-3/5 lg:w-2/5 h-full bg-white shadow-lg z-50 transform ${
					isOpen ? "translate-x-0" : "translate-x-full"
				} transition-transform duration-300 ease-in-out flex flex-col`}
			>
				<>
					{vintageData &&
					Array.isArray(vintageData) &&
					vintageData.length > 0 ? (
						<div className="overflow-y-auto p-4">
							<div className="text-2xl mb-2 font-semibold">{name}</div>
							<div className="text-[#1D1F2199] mb-1">
								Specify the number of {filter_project_type === "CarbonCredits" ? "tonnes": "MWh"} under each vintage that you wish to
								retire.
							</div>
							<div className="border-[1.2px] border-[#1D1F2199]"></div>
							<div className="text-[#1D1F2199] mt-1">
								If you're unable to locate the credits you're seeking, please
								reach out to us at{" "}
								<a
									className="text-blue-300 hover:underline hover:text-blue-400"
									href="mailto:support@hestiya.com"
								>
									support@hestiya.com
								</a>{" "}
								and we'll be happy to assist you further.
							</div>

							{vintageData.map((yearItem, yearIndex) => (
								<div
									key={yearIndex}
									className="border mt-5 border-[#1D1F2199] rounded-md"
								>
									<div className="text-base md:text-lg border-b-[1px] p-4 border-[#1D1F2199] pb-4">
										Vintage {yearItem.year}
									</div>
									<div className="p-4 flex gap-2 items-center justify-between">
										<div className="flex justify-between gap-3 items-start">
											<div className="flex flex-col gap-1">
												<div className="text-[#1D1F2199] text-sm md:text-base">
													Enter {filter_project_type === "CarbonCredits" ? "tonnes": "MWh"}
												</div>
												<Input
													type="number"
													min="0"
													max={yearItem.credits}
													value={quantities[yearItem.year] || ""}
													onChange={(e) =>
														handleQuantityChange(yearItem.year, e.target.value)
													}
													className="w-24"
													label={filter_project_type === "CarbonCredits" ? "Tonnes": "MWh"}
												/>
											</div>
											<div className="flex flex-col gap-2.5">
												<div className="text-[#1D1F2199] text-sm md:text-base">
													Available Credits
												</div>
												<div className="text-black text-base md:text-lg">
													{yearItem.credits} {filter_project_type === "CarbonCredits" ? "tonnes": "MWh"}
												</div>
											</div>
										</div>
										<div>
											<button
												// className="bg-darkgreen text-white px-6 py-1.5 rounded-lg"
												className={`${
													quantities[yearItem.year] > 0 && walletGas > gasUsed
														? "bg-darkgreen"
														: "bg-gray-500"
												} px-5 py-1.5 rounded-lg text-white`}
												onClick={() =>
													handleRetireVintage(yearItem.year, yearItem.id)
												}
												disabled={
													!quantities[yearItem.year] > 0 ||
													!(walletGas > gasUsed)
												}
											>
												{/* {loadingYear === yearItem.year ? (
                          <PulseLoader size={8} color="#ffffff" />
                        ) : (
                          "Retire"
                        )} */}
												{loadingYear === yearItem.year ? (
													<PulseLoader size={8} color="#ffffff" />
												) : (
													<>
														{!quantities[yearItem.year] > 0 ? (
															"Values Required"
														) : (
															<>
																{walletGas > gasUsed
																	? "Retire"
																	: "Insufficient Gas"}
															</>
														)}
													</>
												)}
											</button>
										</div>
									</div>
									{quantities[yearItem.year] > 0 && gasPrices[yearItem.year] ? (
										<div className="px-4 pb-3 text-sm text-green-600">
											{loadingGas
												? gasPrices[yearItem.year] && "Fetching Gas Fee..."
												: ` Estimated Gas Fee: $${gasPrices[
														yearItem.year
												  ]?.toFixed(8)}`}
										</div>
									) : (
										<div className="px-4 pb-3 text-sm text-green-600">
											{loadingGas
												? gasPrices[yearItem.year] && "Fetching Gas Fee..."
												: gasPrices[2024] !== null
												? ` Estimated Gas Fee: $${gasPrices[2024]?.toFixed(8)}`
												: ""}
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div>No vintages available</div>
					)}
					<div className="flex-1 overflow-y-auto p-4"></div>
					<div className="p-4 border-t border-gray-300 flex justify-between items-center bg-white">
						<button
							onClick={handleClose}
							className="text-white rounded-lg px-4 py-2 bg-black"
						>
							Close
						</button>
					</div>
				</>
			</div>
		</div>
	);
};

export default RetireCreditDrawer;
