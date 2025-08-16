import React, { useEffect, useState } from "react";
import { FaDownload, FaSearch, FaEye } from "react-icons/fa";
import {
	Card,
	Typography,
	Button,
	CardBody,
	CardFooter,
	IconButton,
	Tooltip,
	Input,
} from "@material-tailwind/react";
import axios from "axios";
import DefaultPagination from "./DefaultPagination";
import { useLocation, useNavigate } from "react-router-dom";
import SpinnerLoader from "../../loaders/SpinnerLoader";
import FilterWithSearch from "./filters/FilterWithSearch";
import EmailModel from "../../sharedComponent/EmailModel";
import { toast } from "react-toastify";
import SDGImage from "./SDGImage";
import NoData from "../../NoData";

const ProjectTable = ({ resetPage, setResetPage }) => {
	// const apiUrl = import.meta.env.VITE_API_URL;
	  const apiUrl = "https://api.hestiya.com/api/"
	const navigate = useNavigate();
	const location = useLocation();
	const [apiData, setApiData] = useState([]);
	const [apiQuantity, setApiQuantity] = useState([]);
	const [activePage, setActivePage] = useState(
		Number(new URLSearchParams(location.search).get("page")) || 1
	);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(false);

	const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

	// filters States
	const [countryCodes, setCountryCodes] = useState([]);
	const [projectTypeCodes, setProjectTypeCodes] = useState([]);
	const [searchCodes, setSearchCodes] = useState("");

	// Options States
	const [apiCountry, setApiCountry] = useState([]);
	const [projectTypeOptions, setProjectTypeOptions] = useState("");
	const [searchValue, setSearchValue] = useState("");

	const TABLE_HEAD = [
		"Project Details",
		"SDGS",
		"Project Type",
		"Country",
		"action",
	];

	const fetchData = async (page = 1) => {
		setLoading(true);
		try {
			const res = await axios.get(
				`${apiUrl}reg-detail/?page=${page}&country=${countryCodes}&project_type=${encodeURIComponent(
					projectTypeCodes
				)}&search=${searchCodes}`
			);

			const { results, count } = res.data;

			if (!Array.isArray(results)) {
				console.error("Invalid data structure");
				setApiData([]);
				return;
			}

			setApiData(results);

			const itemsPerPage = 10;
			const totalPages = Math.ceil(count / itemsPerPage);
			setTotalPages(totalPages);
			// console.log("count", res.data.count);
			setApiQuantity(res.data.count);

			// console.log("Fetched Data:", res.data);
			// console.log("Total Pages:", totalPages, "Items per Page:", itemsPerPage);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchCountryData = async () => {
		try {
			const country = await axios.get(`${apiUrl}country/`);
			const transformedData = country.data.map((project) => ({
				id: project.name,
				label: project.name,
			}));
			setApiCountry(transformedData);
		} catch (error) {
			console.error("Error fetching project data:", error);
		}
	};
	const fetchProjectTypeData = async () => {
		try {
			const projectType = await axios.get(`${apiUrl}set-type/`);
			const transformedData = projectType.data.map((project) => ({
				id: project.project_type,
				label: project.project_type,
			}));
			// console.log("project type", transformedData);
			setProjectTypeOptions(transformedData);
		} catch (error) {
			console.error("Error fetching project data:", error);
		}
	};

	useEffect(() => {
		fetchCountryData();
		fetchProjectTypeData();
	}, []);

	useEffect(() => {
		if (resetPage) {
			setActivePage(1);
			setResetPage(false);
		}
	}, [resetPage, setResetPage]);

	useEffect(() => {
		fetchData(activePage);
		const params = new URLSearchParams(location.search);
		params.set("page", activePage);
		navigate(`?${params.toString()}`, { replace: true });
	}, [activePage, projectTypeCodes, countryCodes, searchCodes]);

	const handleApplyFiltersCountry = (selectedFilters) => {
		setCountryCodes(selectedFilters);
		setActivePage(1);
		// console.log("Filters applied:", selectedFilters);
	};

	const handleClearFiltersCountry = () => {
		setCountryCodes([]);
		setActivePage(1);
		// console.log("Filters cleared");
	};

	const handleApplyFiltersProjectType = (selectedFilters) => {
		// console.log("object", selectedFilters);
		setProjectTypeCodes(selectedFilters);
		setActivePage(1);
		// console.log("Filters applied:", selectedFilters);
	};

	const handleClearFiltersProjectType = () => {
		setProjectTypeCodes([]);
		setActivePage(1);
		// console.log("Filters cleared");
	};

	const handleInputChangeSearch = (e) => {
		const value = e.target.value;
		setSearchValue(value);

		// Check if the input length is greater than 3
		if (value.length > 0) {
			setSearchCodes(value);
			setActivePage(1);
			// console.log("Input value:", value);
		} else {
			setSearchCodes("");
			setActivePage(1);
			// console.log("Input value:", "");
		}
	};

	const handleProjectDetailPage = (id) => {
		navigate(`/marketplace/hestiya-registory/detail?projectId=${id}`);
		// console.log("iddd", id);
	};

	const handleApply = async (emailValue) => {
		// console.log("Email received from modal:", emailValue);
		try {
			const res = await axios.post(
				`${apiUrl}reg-detail/export_csv/?&country=${countryCodes}&project_type=${encodeURIComponent(
					projectTypeCodes
				)}&search=${searchCodes}`,
				{
					email: emailValue,
				}
			);

			if (res) {
				toast.success(`Check Your Email ${res.data.message}`);
				// console.log("email", res);
			}
		} catch (error) {
			console.error("error", error);
		}
	};

	const handleDownloadClick = () => {
		setIsModalOpen(true);
	};

	return (
		<>
			<Card className="relative flex flex-col h-[calc(100vh-136px)] md:h-[calc(100vh-150px)] w-full">
				<div>
					<div className="flex flex-col justify-between pt-2 mx-4 gap-8 md:flex-row md:items-center">
						<div className=" flex flex-wrap items-center gap-2">
							<FilterWithSearch
								options={apiCountry}
								label="country"
								onApply={handleApplyFiltersCountry}
								onClear={handleClearFiltersCountry}
							/>
							<FilterWithSearch
								options={projectTypeOptions}
								label="project type"
								onClear={handleClearFiltersProjectType}
								onApply={handleApplyFiltersProjectType}
							/>
						</div>
						<div className="flex w-full shrink-0 gap-2 md:w-max">
							<div className="w-full md:w-72">
								<Input
									label="Search"
									icon={<FaSearch className="h-5 w-5" />}
									value={searchValue}
									onChange={handleInputChangeSearch} // Add onChange handler
								/>
							</div>
						</div>
					</div>
				</div>

				{/* CardBody */}
				<CardBody className="relative flex-grow pt-0 mt-4 pb-28 sm:pb-20 md:pb-28 px-0 overflow-auto">
					<div className="w-full max-w-full overflow-auto">
						<table className="min-w-full text-left table-fixed">
							<thead>
								<tr>
									{TABLE_HEAD.map((head) => (
										<th
											key={head}
											className="border-y uppercase border-blue-gray-100 bg-blue-gray-50/50 p-4"
										>
											<div className="flex items-center gap-2">
												<Typography
													variant="small"
													color="blue-gray"
													className="font-normal leading-none opacity-70"
												>
													{head}
												</Typography>
											</div>
										</th>
									))}
								</tr>
							</thead>
							{loading ? (
								<tr>
									<td
										colSpan={TABLE_HEAD.length}
										className="p-4 h-[60vh] text-center"
									>
										<div className="flex justify-center items-center">
											<SpinnerLoader />
										</div>
									</td>
								</tr>
							) : (
								<tbody>
									{apiData.length > 0 ? (
										<>
											{apiData.map((data, index) => {
												const classes = "p-4 border-b border-blue-gray-50";
												return (
													<tr key={data.id || index}>
														<td
															className={`${classes} cursor-pointer`}
															onClick={() =>
																handleProjectDetailPage(data.project_code)
															}
														>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-normal"
															>
																{data.project_code} - {data.name}
															</Typography>
														</td>
														<td className={`${classes}`}>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-normal"
															>
																<SDGImage sdgNumbers={data?.sdgs?.sdg_number} />
															</Typography>
														</td>

														<td className={classes}>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-normal"
															>
																{data.type.length > 1
																	? data.type.map((type, index) => (
																			<span key={index}>
																				{type.project_type}
																				{index < data.type.length - 1
																					? ", "
																					: ""}{" "}
																			</span>
																	  ))
																	: data.type[0]?.project_type}
															</Typography>
														</td>
														<td className={`${classes}`}>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-normal"
															>
																{data.project_country.country}
															</Typography>
														</td>
														<td className={classes}>
															<Tooltip content="View">
																<IconButton
																	variant="text"
																	onClick={() =>
																		handleProjectDetailPage(data.project_code)
																	}
																>
																	<FaEye className="h-4 w-4" />
																</IconButton>
															</Tooltip>
														</td>
													</tr>
												);
											})}
										</>
									) : (
										<tr>
											<td
												colSpan={TABLE_HEAD.length} // Span across all table columns
												className="p-4 h-[60vh] text-center"
											>
												<div className="flex justify-center items-center h-full">
													<NoData
														headingText={"No Projects Available"}
														paraText={
															"Currently, there are no projects listed. Please check back later for updates!"
														}
													/>
												</div>
											</td>
										</tr>
									)}
								</tbody>
							)}
						</table>
					</div>
				</CardBody>

				{/* CardFooter */}
				<CardFooter className="absolute bg-white bottom-0 w-full flex-shrink-0 flex overflow-auto items-center gap-4 justify-between border-t border-blue-gray-50 p-4">
					<div className="text-base font-medium text-gray-500">
						Total Quantity : <span className="text-black">{apiQuantity}</span>
					</div>
					<div className="flex gap-2 items-center">
						<DefaultPagination
							activePage={activePage}
							setActivePage={setActivePage}
							totalPages={totalPages}
						/>
						{/* <Button
							className="flex items-center gap-3"
							size="sm"
							onClick={handleDownloadClick}
						>
							<FaDownload className="h-4 w-4" />
							Download
						</Button> */}
					</div>
				</CardFooter>
			</Card>

			{/* Modal */}
			{isModalOpen && (
				<EmailModel
					headingText={"Export Credits"}
					onApply={handleApply} // Pass the handleApply function to modal
					onClose={() => setIsModalOpen(false)} // Close modal function
				/>
			)}
			{/* Modal */}
		</>
	);
};

export default ProjectTable;
