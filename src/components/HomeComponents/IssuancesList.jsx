import React, { useEffect, useState } from "react";
import { FaEye, FaSort } from "react-icons/fa";
import {
  Card,
  Typography,
  CardBody,
  CardFooter,
  IconButton,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import moment from "moment";
import DefaultPagination from "./project/DefaultPagination";
import { MdContentCopy } from "react-icons/md";
import { toast } from "react-toastify";

const IssuancesList = ({ projectId }) => {
  // const apiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = "https://api.hestiya.com/api/"
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const projectCode = queryParams.get("projectId");
  const address = queryParams.get("address");
  const year = queryParams.get("year");
  const actionType = queryParams.get("actionType");
  const projectName = queryParams.get("projectName");
  const credits = queryParams.get("credits");
  const time = queryParams.get("time");
  const transhash = queryParams.get("transhash");
  const filter_project_type = queryParams.get("filter_project_type");

  // console.log("transhash", transhash);

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
    "Action Type",
    "address",
    "Quantity",
    // "Project Details",
    // "Project Type",
    "Issuance date",
    // "Retirement date",
    "action",
  ];

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${apiUrl}activity-log/?page=${page}&project=${projectCode}&address=${address}&vintage_start_year=${year}&vintage_end_year=${year}`
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
      toast.error("An error occurred while retrieving data. Please try again.");
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
    //   newSortOrder === "asc"
    //     ? setSortBackend("vintage_year")
    //     : setSortBackend("-vintage_year")
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
    //   newSortOrder === "asc"
    //     ? setSortBackend("total_credits")
    //     : setSortBackend("-total_credits")
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
    //   newSortOrder === "asc"
    //     ? setSortBackend("timestamp")
    //     : setSortBackend("-timestamp")
    // );
  };
  const handleSortRetirementDateToggle = () => {
    const newSortOrder = sortOrder4 === "asc" ? "desc" : "asc";
    setSortOrder("asc");
    setSortOrder2("asc");
    setSortOrder3("asc");
    setSortOrder4(newSortOrder);
    // console.log(
    //   newSortOrder === "asc"
    //     ? setSortBackend("timestamp")
    //     : setSortBackend("-timestamp")
    // );
  };

  const 
  handleProjectDetailPage = (
    id,
    address,
    year,
    actionType,
    projectName,
    credits,
    time,
    transhash,
    filter_project_type,
    
  ) => {
    // {console.log("check the fileter project type :-", filter_project_type)}
    navigate(
      `/marketplace/hestiya-registory/issuance-detail?projectId=${id}&address=${address}&year=${year}&actionType=${actionType}&projectName=${projectName}&credits=${credits}&time=${time}&transhash=${transhash}&filter_project_type=${filter_project_type}`
    );
    // console.log("iddd", id);
  };

  const handleProject = () => {
    navigate(`/marketplace/hestiya-registory/detail?projectId=${projectCode}`);
  };
  return (
    <>
      <div className="w-full flex flex-col gap-3 pt-8 xlll:px-8 xl:px-6 px-4">
        <div className=" text-black text-lg md:text-2xl lg:text-3xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
          {console.log("check the fileter project type :-", filter_project_type)}
          {filter_project_type === "CarbonCredits" ? "Credits" : "I-RECs"}{" "}
        </div>

        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row justify-between sm:items-center  border-b-2 pb-2 border-gray-500">
          <div className="flex items-end gap-2">
            <div className=" text-black text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
              Project Name :
            </div>
            <div className=" text-gray-600 text-lg lg:text-xl leading-6 md:leading-7 lg:leading-[30px]">
              {projectName ?? "--"}
            </div>
          </div>
          <Button
            variant="outlined"
            className="w-fit"
            size="sm"
            onClick={() => handleProject()}
          >
            view project
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row justify-between sm:items-center  border-b-2 pb-2 border-gray-500">
          <div className="flex items-end gap-2">
            <div className=" text-black text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
              Action Type :
            </div>
            <div className=" text-gray-600 text-lg lg:text-xl leading-6 md:leading-7 lg:leading-[30px]">
              {actionType === "RETIRE_CREDITS"
                ? "Credits Retired"
                : actionType === "CANCEL_LIST"
                ? "Listing Cancelled"
                : actionType === "LIST_P2P"
                ? "P2P Listing"
                : actionType === "BUY_P2P"
                ? "P2P Purchase"
                : actionType === "BUY_MARKETPLACE"
                ? "Marketplace Purchase With Wallet"
                : actionType === "REDEEM_CREDITS"
                ? "Redeem Credits"
                : actionType === "ADMIN_TRANSFER"
        ? "Marketplace Purchase With Bank"
                : "" ?? "--"}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className=" text-black text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
              Vintage year :
            </div>
            <div className=" text-gray-600 text-lg lg:text-xl leading-6 md:leading-7 lg:leading-[30px]">
              {year ?? "--"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row justify-between sm:items-center  border-b-2 pb-2 border-gray-500">
          <div className="flex items-end gap-2">
            <div className=" text-black text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
              Total {filter_project_type === "CarbonCredits"
                ? "Credits" : "I-RECs"} :
            </div>
            <div className=" text-gray-600 text-lg lg:text-xl leading-6 md:leading-7 lg:leading-[30px]">
              {credits ?? "--"}
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className=" text-black text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
              Issuance Date :
            </div>
            <div className=" text-gray-600 text-lg lg:text-xl leading-6 md:leading-7 lg:leading-[30px]">
              {moment(time).format("YYYY-MM-DD") ?? "--"}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row justify-between sm:items-center  border-b-2 pb-2 border-gray-500">
          <div className="flex items-end gap-2">
            <div className=" text-black text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
              Transaction hash :
            </div>
            <div className=" text-gray-600 break-all text-lg lg:text-xl leading-6 md:leading-7 lg:leading-[30px]">
              {transhash !== "null" ? (
                <div className="flex gap-1 items-center">
                  <Link
                    target="_blank" // Open in a new tab
                    rel="noopener noreferrer" // Security measure
                    className="hover:text-blue-500 hover:underline"
                    to={`https://polygonscan.com/tx/${transhash}`}
                  >
                    {transhash.slice(0, 5)}...
                    {transhash.slice(-4)}
                  </Link>
                  <MdContentCopy
                    className=" cursor-pointer"
                    onClick={() => navigator.clipboard.writeText(transhash)}
                  />
                </div>
              ) : (
                "--"
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="xlll:px-8 xl:px-6 px-4 text-black mt-4 text-lg md:text-2xl lg:text-3xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
        History
      </div>

      <Card className="mb-4 flex flex-col h-auto w-full">
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
                        {/* {console.log( " data action types",data.action_type)} */}
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-bold"
                          >
                            <div
                              className={`py-1 px-4 w-fit rounded-3xl text-white text-base font-semibold
                                ${
                                  data.action_type === "RETIRE_CREDITS"
                                    ? "bg-red-400"
                                    : data.action_type === "CANCEL_LIST"
                                    ? "bg-red-400"
                                    : data.action_type === "LIST_P2P"
                                    ? "bg-orange-700"
                                    : data.action_type === "BUY_P2P"
                                    ? "bg-green-500"
                                    : data.action_type === "BUY_MARKETPLACE"
                                    ? "bg-green-500"
                                    : data.action_type === "REDEEM_CREDITS"
                                    ? "bg-green-500"
                                    :data.action_type === "BUY_WITH_STRIPE"
                                    ? "bg-green-500"
                                    : data.action_type === "ADMIN_TRANSFER"
                                    ? "bg-green-500"
                                    : ""
                                }
                                `}
                            >
                              {" "}
                              {data.action_type === "RETIRE_CREDITS"
                                    ? data?.status?.toString().toLowerCase() ===
                                      "pending"
                                      ? "Credits Pending"
                                      : data?.status
                                          ?.toString()
                                          .toLowerCase() === "rejected"
                                      ? "Credits Rejected"
                                      : data?.status
                                          ?.toString()
                                          .toLowerCase() === "approved"
                                      ? "Credits Retired"
                                      : "--"
                                    : data.action_type === "CANCEL_LIST"
                                    ? "Listing Cancelled"
                                    : data.action_type === "LIST_P2P"
                                    ? "P2P Listing"
                                    : data.action_type === "BUY_P2P"
                                    ? "P2P Purchase"
                                    : data.action_type === "BUY_MARKETPLACE"
                                    ? "Marketplace Purchase With Wallet"
                                    : data.action_type === "REDEEM_CREDITS"
                                    ? 
									data?.status?.toString().toLowerCase() ===
									"pending"
									? "Redeem Pending"
									: data?.status
										?.toString()
										.toLowerCase() === "rejected"
									? "Redeem Rejected"
									: data?.status
										?.toString()
										.toLowerCase() === "approved"
									? "Redeem Credits"
									: "--"
									
                                    : data.action_type === "BUY_WITH_STRIPE"
                                    ? "Marketplace Purchase With Stripe"
                                    : data.action_type === "ADMIN_TRANSFER"
        ? "Marketplace Purchase With Bank"
                                    : "--"}
                            </div>
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
                        {/* <td className={classes}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal opacity-70"
                        >
                          {data.creation_timestamp === null ? "N/A" : <>{moment(data.creation_timestamp).format("YYYY-MM-DD")}</>}
                        </Typography>
                      </td> */}
                        <td className={classes}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal opacity-70"
                          >
                            {data.timestamp === null ? (
                              "N/A"
                            ) : (
                              <>{moment(data.timestamp).format("YYYY-MM-DD")}</>
                            )}
                          </Typography>
                        </td>
                        {console.log("check .... :-", data.filter_project_type)}
                        <td className={classes}>
                          <Tooltip content="View">
                            <IconButton
                              variant="text"
                              onClick={() =>
                                handleProjectDetailPage(
                                  data.project_id,
                                  data.sender_address,
                                  data.vintage_year,
                                  data.action_type,
                                  data.project_name,
                                  data.total_credits,
                                  data.timestamp,
                                  data.trx_hash,
                                  data.filter_project_type,
                                )
                              }
                            >
                              <FaEye className="h-4 w-4" />
                            </IconButton>
                          </Tooltip>
                        </td>
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
    </>
  );
};

export default IssuancesList;
