import React, { useEffect, useState } from "react";
import {
	FaDownload,
	FaSearch,
	FaEye,
	FaSortUp,
	FaSortDown,
	FaSort,
} from "react-icons/fa";
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
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import SpinnerLoader from "../../loaders/SpinnerLoader";
import FilterWithSearch from "./filters/FilterWithSearch";
import VintageYearFilter from "./filters/VintageYearFilter";
import QuantityFilter from "./filters/QuantityFilter";
import IssuanceDateFilter from "./filters/IssuanceDateFilter";
import EmailModel from "../../sharedComponent/EmailModel";
import { toast } from "react-toastify";
import { MdContentCopy } from "react-icons/md";
import NoData from "../../NoData";

const RetirementsTable = ({ resetPage, setResetPage }) => {
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

	// filters States
	const [startVintageYear, setStartVintageyear] = useState("");
	const [endVintageYear, setEndVintageyear] = useState("");
	const [minCredits, setMinCredits] = useState("");
	const [maxCredits, setMaxCredits] = useState("");
	const [minDate, setMinDate] = useState("");
	const [maxDate, setMaxDate] = useState("");
	const [minRetirementDate, setMinRetirementDate] = useState("");
	const [maxRetirementDate, setMaxRetirementDate] = useState("");
	const [projectCodes, setProjectCodes] = useState([]);
	const [countryCodes, setCountryCodes] = useState([]);
	const [projectTypeCodes, setProjectTypeCodes] = useState([]);
	const [searchCodes, setSearchCodes] = useState("");

	const [sortbackend, setSortBackend] = useState("");

	const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

	// Options States
	const [apiCountry, setApiCountry] = useState([]);
	const [projectOptions, setProjectOptions] = useState("");
	const [projectTypeOptions, setProjectTypeOptions] = useState("");
	const [searchValue, setSearchValue] = useState("");

	const [sortOrder, setSortOrder] = useState("asc");
	const [sortOrder2, setSortOrder2] = useState("asc");
	const [sortOrder3, setSortOrder3] = useState("asc");
	const [sortOrder4, setSortOrder4] = useState("asc");

	const TABLE_HEAD = [
		"Vintage",
		"Address",
		"Quantity",
		"Project Details",
		"Project Type",
		"Issuance date",
		"Retirement date",
		"action",
	];

	const fetchData = async (page = 1) => {
		setLoading(true);
		console.log("page",page)
		try {
			const res = await axios.get(
				`${apiUrl}activity-log/?vintage_start_year=${startVintageYear}&vintage_end_year=${endVintageYear}&min_credits=${minCredits}&max_credits=${maxCredits}&date_min=${minDate}&date_max=${maxDate}&page=${page}&project=${projectCodes}&country=${countryCodes}&project_type=${encodeURIComponent(
					projectTypeCodes
				)}&search=${searchCodes}&ordering=${sortbackend}&action_type=RETIRE_CREDITS&filter_project_type=${
          location.pathname.includes("credits") ? "CarbonCredits" : "IRECS"}`
			);

			// total_credits
			//

			const { results, count } = res.data;

			if (!Array.isArray(results)) {
				console.error("Invalid data structure");
				setApiData([]);
				return;
			}

			const isCreditsPage = location.pathname.includes("credits");

			// Filter the data accordingly
			const filteredData = results.filter(item => 
				isCreditsPage 
					? item.filter_project_type === "CarbonCredits" 
					: item.filter_project_type !== "CarbonCredits"
			);

			setApiData(filteredData);

			const itemsPerPage = 10;
			const totalPages = Math.ceil(count / itemsPerPage);
			setTotalPages(totalPages);
			setApiQuantity(res.data.sum_of_credits);

			// console.log("Fetched Data:", res.data);
			// console.log("Total Pages:", totalPages, "Items per Page:", itemsPerPage);
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Data Fetching Error");
		} finally {
			setLoading(false);
		}
	};

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
		fetchProjectData();
		fetchCountryData();
		fetchProjectTypeData();
	}, []);
	useEffect(() => {
		if (resetPage) {
			setActivePage(1); // Reset the active page to 1
			setResetPage(false); // Reset the page reset state
		}
	}, [resetPage, setResetPage]);
	useEffect(() => {

		const currentPage = resetPage ? 1 : activePage;
		fetchData(currentPage);
		const params = new URLSearchParams(location.search);
		params.set("page", activePage);
		navigate(`?${params.toString()}`, { replace: true });
	}, [
		activePage,
		resetPage,
		startVintageYear,
		endVintageYear,
		maxCredits,
		minCredits,
		minDate,
		maxDate,
		projectCodes,
		countryCodes,
		searchCodes,
		sortbackend,
		projectTypeCodes,
		minRetirementDate,
		maxRetirementDate,
		location.pathname,
	]);

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
	const handleApplyFiltersRetirementDate = (filters) => {
		// console.log("sdfdsgdg", filters);
		setMinRetirementDate(filters.startDate);
		setMaxRetirementDate(filters.endDate);
		setActivePage(1);
	};
	const handleClearFiltersRetirementDate = () => {
		setMinRetirementDate("");
		setMaxRetirementDate("");
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
		// console.log("Filters cleared");
	};

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

	const handleSortVintageToggle = () => {
		const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
		setSortOrder(newSortOrder);
		setSortOrder2("asc");
		setSortOrder3("asc");
		setSortOrder4("asc");
		setActivePage(1);
		newSortOrder === "asc"
		  ? setSortBackend("vintage_year")
		  : setSortBackend("-vintage_year")
		// console.log(
		// );
	};
	const handleSortQuantityToggle = () => {
		const newSortOrder = sortOrder2 === "asc" ? "desc" : "asc";
		setSortOrder("asc");
		setSortOrder2(newSortOrder);
		setSortOrder3("asc");
		setSortOrder4("asc");
		setActivePage(1);
		  newSortOrder === "asc"
		    ? setSortBackend("total_credits")
		    : setSortBackend("-total_credits")
		// console.log(
		// );
	};
	const handleSortIssuanceDateToggle = () => {
		const newSortOrder = sortOrder3 === "asc" ? "desc" : "asc";
		setSortOrder("asc");
		setSortOrder2("asc");
		setSortOrder3(newSortOrder);
		setSortOrder4("asc");
		setActivePage(1);
		  newSortOrder === "asc"
		    ? setSortBackend("timestamp")
		    : setSortBackend("-timestamp")
		// console.log(
		// );
	};
	const handleSortRetirementDateToggle = () => {
		const newSortOrder = sortOrder4 === "asc" ? "desc" : "asc";
		setSortOrder("asc");
		setSortOrder2("asc");
		setSortOrder3("asc");
		setSortOrder4(newSortOrder);
		  newSortOrder === "asc"
		    ? setSortBackend("timestamp")
		    : setSortBackend("-timestamp")
		// console.log(
		// );
	};
	const handleProjectDetailPage = (id) => {
		navigate(`/marketplace/hestiya-registory/detail?projectId=${id}`);
		// console.log("iddd", id);
	};
	// api/activity-log/export_csv/
	const handleApply = async (emailValue) => {
		// console.log("Email received from modal:", emailValue);
		try {
			const res = await axios.post(
				`${apiUrl}activity-log/export_csv/?vintage_start_year=${startVintageYear}&vintage_end_year=${endVintageYear}&min_credits=${minCredits}&max_credits=${maxCredits}&date_min=${minDate}&date_max=${maxDate}&project=${projectCodes}&country=${countryCodes}&project_type=${encodeURIComponent(
					projectTypeCodes
				)}&search=${searchCodes}&ordering=${sortbackend}&action_type=RETIRE_CREDITS`,
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
		setIsModalOpen(true); // Open the modal
	};
	return (
		<>
			<Card className="relative flex flex-col h-[calc(100vh-136px)] md:h-[calc(100vh-150px)] w-full">
				<div>
					<div className="flex flex-col justify-between pt-2 mx-4 gap-8 md:flex-row md:items-center">
						<div className=" flex flex-wrap items-center gap-2">
							<VintageYearFilter
								label="vintages"
								onApply={handleApplyFiltersYear}
								onClear={handleClearFiltersYear}
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
							<IssuanceDateFilter
								label="Retirement date"
								onApply={handleApplyFiltersRetirementDate}
								onClear={handleClearFiltersRetirementDate}
							/>
							<FilterWithSearch
								options={projectOptions}
								label="Projects"
								onApply={handleApplyFiltersProject}
								onClear={handleClearFiltersProject}
							/>
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
												{head === "Vintage" && (
													<IconButton
														variant="text"
														onClick={handleSortVintageToggle}
													>
														<FaSort />
													</IconButton>
												)}
												{head === "Quantity" && (
													<IconButton
														variant="text"
														onClick={handleSortQuantityToggle}
													>
														<FaSort />
													</IconButton>
												)}
												{head === "Issuance date" && (
													<IconButton
														variant="text"
														onClick={handleSortIssuanceDateToggle}
													>
														<FaSort />
													</IconButton>
												)}
												{head === "Retirement date" && (
													<IconButton
														variant="text"
														onClick={handleSortRetirementDateToggle}
													>
														<FaSort />
													</IconButton>
												)}
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
														<td className={classes}>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-bold"
															>
																{data.vintage_year}
															</Typography>
														</td>
														<td className={classes}>
															<Tooltip content={`${data.sender_address}`}>
																<Typography
																	variant="small"
																	color="blue-gray"
																	className="flex gap-1 items-center font-bold"
																>
																	<Link
																		target="_blank" // Open in a new tab
																		rel="noopener noreferrer" // Security measure
																		className="hover:text-blue-500 hover:underline"
																		to={`https://polygonscan.com/address/${data.sender_address}`}
																	>
																		{data.sender_address.slice(0, 5)}...
																		{data.sender_address.slice(-4)}
																	</Link>
																	<MdContentCopy
																		className=" cursor-pointer"
																		onClick={() =>
																			navigator.clipboard.writeText(
																				data.sender_address
																			)
																		}
																	/>
																</Typography>
															</Tooltip>
														</td>
														<td className={classes}>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-normal"
															>
																{data.total_credits}
															</Typography>
														</td>
														<td
															className={`${classes} cursor-pointer`}
															onClick={() =>
																handleProjectDetailPage(data.project_id)
															}
														>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-normal"
															>
																{data.project_name}
															</Typography>
														</td>
														<td className={classes}>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-normal"
															>
																{data.project_type.length > 1 ? (
																	<>
																		{data.project_type.map((type, index) => (
																			<span key={index}>
																				{type}
																				{index < data.project_type.length - 1
																					? ", "
																					: " "}
																			</span>
																		))}
																	</>
																) : (
																	<span>{data.project_type[0]}</span>
																)}
															</Typography>
														</td>
														<td className={classes}>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-normal opacity-70"
															>
																{data.timestamp === null ? (
																	"N/A"
																) : (
																	<>
																		{moment(data.timestamp).format(
																			"YYYY-MM-DD"
																		)}
																	</>
																)}
															</Typography>
														</td>
														<td className={classes}>
															<Typography
																variant="small"
																color="blue-gray"
																className="font-normal opacity-70"
															>
																{data.creation_timestamp === null ? (
																	"N/A"
																) : (
																	<>
																		{moment(data.creation_timestamp).format(
																			"YYYY-MM-DD"
																		)}
																	</>
																)}
															</Typography>
														</td>
														<td className={classes}>
															<Tooltip content="View">
																<IconButton
																	variant="text"
																	onClick={() =>
																		handleProjectDetailPage(data.project_id)
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
														headingText="No Retirement Data Available"
														paraText={
															"There are currently no retirement records to display. Please check back later for updates!"
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

export default RetirementsTable;
