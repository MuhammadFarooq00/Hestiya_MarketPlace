import React, { useEffect, useState } from "react";
import { FaEye, FaSort } from "react-icons/fa";
import {
	Card,
	Typography,
	CardBody,
	CardFooter,
	IconButton,
	Tooltip,
} from "@material-tailwind/react";
import axios from "axios";
import DefaultPagination from "../credits/DefaultPagination";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import { MdContentCopy } from "react-icons/md";

const RetirementTableByID = ({ projectId }) => {
	// const apiUrl = import.meta.env.VITE_API_URL;
	  const apiUrl = "https://api.hestiya.com/api/"
	const navigate = useNavigate();
	const location = useLocation();
	const [apiData, setApiData] = useState([]);
	const [activePage, setActivePage] = useState(
		Number(new URLSearchParams(location.search).get("page")) || 1
	);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(false);

	const [sortbackend, setSortBackend] = useState("");

	const [sortOrder, setSortOrder] = useState("asc");
	const [sortOrder2, setSortOrder2] = useState("asc");
	const [sortOrder3, setSortOrder3] = useState("asc");
	const [sortOrder4, setSortOrder4] = useState("asc");

	const TABLE_HEAD = [
		"Vintage",
		"address",
		"Quantity",
		// "Project Details",
		// "Project Type",
		"Issuance date",
		"Retirement date",
		// "action",
	];

	const fetchData = async (page = 1) => {
		setLoading(true);
		try {
			const res = await axios.get(
				`${apiUrl}activity-log/?page=${page}&project=${projectId}&ordering=${sortbackend}&action_type=RETIRE_CREDITS`
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

			// console.log("Fetched Data:", res.data);
			// console.log("Total Pages:", totalPages, "Items per Page:", itemsPerPage);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData(activePage);
		const params = new URLSearchParams(location.search);
		params.set("page", activePage);
		navigate(`?${params.toString()}`, { replace: true });
	}, [activePage, projectId, sortbackend]);

	const handleSortVintageToggle = () => {
		const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
		setSortOrder(newSortOrder);
		setSortOrder2("asc");
		setSortOrder3("asc");
		setSortOrder4("asc");
		setActivePage(1);
		// console.log(
		  newSortOrder === "asc"
		    ? setSortBackend("vintage_year")
		    : setSortBackend("-vintage_year")
		// );
	};
	const handleSortQuantityToggle = () => {
		const newSortOrder = sortOrder2 === "asc" ? "desc" : "asc";
		setSortOrder("asc");
		setSortOrder2(newSortOrder);
		setSortOrder3("asc");
		setSortOrder4("asc");
		setActivePage(1);
		// console.log(
		  newSortOrder === "asc"
		    ? setSortBackend("total_credits")
		    : setSortBackend("-total_credits")
		// );
	};
	const handleSortIssuanceDateToggle = () => {
		const newSortOrder = sortOrder3 === "asc" ? "desc" : "asc";
		setSortOrder("asc");
		setSortOrder2("asc");
		setSortOrder3(newSortOrder);
		setSortOrder4("asc");
		setActivePage(1);
		// console.log(
		  newSortOrder === "asc"
		    ? setSortBackend("timestamp")
		    : setSortBackend("-timestamp")
		// );
	};
	const handleSortRetirementDateToggle = () => {
		const newSortOrder = sortOrder4 === "asc" ? "desc" : "asc";
		setSortOrder("asc");
		setSortOrder2("asc");
		setSortOrder3("asc");
		setSortOrder4(newSortOrder);
		// console.log(
		  newSortOrder === "asc"
		    ? setSortBackend("timestamp")
		    : setSortBackend("-timestamp")
		// );
	};

	return (
		<Card className="flex flex-col h-auto w-full">
			{/* CardBody */}
			<CardBody className="flex-grow pt-0 mt-4  px-0 overflow-auto">
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
								<td colSpan={TABLE_HEAD.length} className="p-4 text-center">
									<div className="flex h-[20vh] justify-center items-center">
										{/* <SpinnerLoader /> */} loading..
									</div>
								</td>
							</tr>
						) : (
							<tbody>
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
											{/* <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {data.project_name}
                        </Typography>
                      </td> */}
											{/* <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          {data.project_type}
                        </Typography>
                      </td> */}
					  {/* {console.log("issuance data check : ", data)} */}
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
														<>{moment(data.creation_timestamp).format("YYYY-MM-DD")}</>
													)}
												</Typography>
											</td>
											{/* <td className={classes}>
                        <Tooltip content="View">
                          <IconButton variant="text">
                            <FaEye className="h-4 w-4" />
                          </IconButton>
                        </Tooltip>
                      </td> */}
										</tr>
									);
								})}
							</tbody>
						)}
					</table>
				</div>
			</CardBody>

			{/* CardFooter */}
			<CardFooter className="bg-white w-full flex-shrink-0 flex overflow-auto items-center gap-4 justify-end border-t border-blue-gray-50 p-2.5">
				{/* <div className="text-base font-medium text-gray-500">
          Total Quantity : <span className="text-black">{apiQuantity}</span>
        </div> */}
				<div className="flex gap-2 items-center">
					<DefaultPagination
						activePage={activePage}
						setActivePage={setActivePage}
						totalPages={totalPages}
					/>
					{/* <Button className="flex items-center gap-3" size="sm">
            <FaDownload className="h-4 w-4" />
            Download
          </Button> */}
				</div>
			</CardFooter>
		</Card>
	);
};

export default RetirementTableByID;
