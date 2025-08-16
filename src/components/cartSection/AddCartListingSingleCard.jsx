import React, { useContext, useDebugValue, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import NoData from "../NoData";
import UpdateCartDrawer from "./drawerComponents/UpdateCartDrawer";
import Loader from "../loaders/Loader";
import {
  simulateContract,
  writeContract,
  waitForTransactionReceipt,
  readContract,
  estimateFeesPerGas,
  estimateGas,
} from "@wagmi/core";
import { config } from "../../config/WalletConfig";
import {
  hiestiyaProxy,
  tokenAddress,
  inDecimals,
  decimalPoint,
  tokenContract,
  hestyaContract,
  getGasEstimateAndPrice,
  getBalance,
  zeroAddress,
  getContract,
  getDecimals,
  getBalanceForList,
} from "../../abi";
import { abi, erc20Abi } from "../../contractAbis";
import { useNavigate } from "react-router-dom";
import { useAccount, useChainId } from "wagmi";
import { ethers } from "ethers";
import PulseLoader from "react-spinners/PulseLoader";
import { generateAndDownloadPDF, generateAndDownloadPurchasePDF } from "../../Template/Template";
import { etherUnits, formatEther, parseEther } from "viem";
import { UserContext } from "../../context/UserContext";
import StripePaymentWrapper from "../payment";
import { Button } from "@material-tailwind/react";
import { FiInfo } from "react-icons/fi";
const AddCartListingSingleCard = () => {
  // const { address } = useAccount();
  const chainId = useChainId();
  // const apiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = "https://api.hestiya.com/api/"
  // const [cartId, setCartId] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("gateway");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [projectListings, setProjectListings] = useState([]);
  const [vintageData, setvintageData] = useState([]);
  const [projectCode, setProjectCartCode] = useState("");
  const [isCartUpdated, setIsCartUpdated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState("");
  const [projectIds, setProjectIds] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [vintageYears, setVintageYears] = useState([]);
  const [credits, setCredits] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [percentageValue, setPercentageValue] = useState(0);
  const navigate = useNavigate();
  const [gasPriceInUSD, setGasPriceInUSD] = useState(null);
  const [loadingGas, setLoadingGas] = useState(false);
  const [getDecimalsData, setGetDecimalsData] = useState();
  const [walletGas, setWalletGas] = useState(0);
  const [walletToken, setWalletToken] = useState(0);
  const [gasUsed, setGasUsed] = useState(0);
const [showTooltip, setShowTooltip] = useState(false);
const [stripeTooltip, setStripeTooltip] = useState(false);
const [stripeFeePercentage] = useState(5.9); // Stripe charges 5.9% fee

  const {
    cartId,
    setCartId,
    fetchCartItems,
    handleCartid,
    hasAddress,
    hasToken,
    setShowSessionModal,

  } = useContext(UserContext);
  const [showStripeModal, setShowStripeModal] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      setButtonLoading(true);
      try {
        if (hasAddress && tokenAddress) {
          const totalToken = await getBalanceForList(tokenAddress, hasAddress);
          console.log("token avaible in wallet", totalToken);
          setWalletToken(totalToken);
        }
        if (hasAddress && zeroAddress) {
          const totalGas = await getBalanceForList(zeroAddress, hasAddress);
          setWalletGas(totalGas);
        }
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
      setButtonLoading(false);
    };
    if(hasAddress){
    handleCartid();
    }
    getToken();
    
  }, [hasAddress, showStripeModal, cartId]);

  const fetchData = async () => {
    if (cartId) {
      setIsLoading(true);
      try {
        const cartResponse = await axios.get(
          `${apiUrl}cart-item/?cart=${cartId}`
        );
        const vintageData = cartResponse.data;
        setvintageData(vintageData);
        // console.log("vintageData 123", vintageData);

        // Retrieve the address from localStorage
        // const address = "defaultAddress";

        // abdullah: Construct the filteredVintageData object using reduce
        const filteredVintageData = vintageData.items
          ?.filter((item) => item.total_price > 0)
          ?.reduce(
            (acc, item) => {
              acc.projectIds.push(Number(item.project_id));
              acc.vintageYears.push(item.vintage_year);
              acc.credits.push(item.quantity);

              return acc;
            },
            { projectIds: [], vintageYears: [], credits: [], hasAddress }
          );
        setProjectIds(filteredVintageData.projectIds);
        setVintageYears(filteredVintageData.vintageYears);
        setCredits(filteredVintageData.credits);

        // console.log("filteredVintageData", filteredVintageData);
        // abdullah: values that use Place order

        const projectCodes = [
          ...new Set(
            vintageData.items
              .filter((item) => item.quantity > 0)
              .map((item) => item.project.project_code)
          ),
        ];
        const projectResponse = await axios.get(
          `${apiUrl}project-listing/?no_page=true`
        );
        // console.log("projectResponse", projectResponse);
        const filteredProjects = projectResponse.data.filter((project) =>
          projectCodes.includes(project.project_code)
        );
        setProjectListings(filteredProjects);
        // console.log("fil 1", filteredProjects);
      } catch (error) {
        console.error("Error fetching cart data", error);
      } finally {
        setIsLoading(false);
        setIsCartUpdated(false);
      }
    }
  };
  const hanldePercentageValue = async () => {
    const contract = await getContract();
    let result;
    if (hasToken) {
      result = await contract.platformFeePercentage();
    } else {
      result = await readContract(config, {
        abi,
        address: hiestiyaProxy,
        functionName: "platformFeePercentage",
      });
    }
    const value = Number(result);
    // console.log("percentage",value)
    setPercentageValue(value);
  };
  useEffect(() => {
    fetchData();
    hanldePercentageValue();
  }, [cartId, isCartUpdated, showStripeModal]);

  const filteredVintages = (cardVintages, vintageItems) => {
    // console.log("new one", cardVintages);
    // console.log("new two", vintageItems);
    return cardVintages
      .map((vintage) => {
        const matchingVintage = vintageItems.find(
          (item) => item.vintage_id === vintage.id
        );
        if (matchingVintage) {
          const tonnes = matchingVintage.quantity;
          const total = matchingVintage.total_price;
          // console.log("matchingVintage", matchingVintage);
          // Include only if tonnes and total are greater than zero
          if (tonnes > 0 && total > 0) {
            return {
              ...vintage,
              tonnes: matchingVintage.quantity,
              total: matchingVintage.total_price,
              year: Number(matchingVintage.vintage_year),
            };
          } else {
            console.error("no data");
          }
        }
        return null;
      })
      .filter((vintage) => vintage !== null)
      .sort((a, b) => a.year - b.year);
  };
  
  const handleAddToCart = (id, name) => {
    setProjectCartCode(id);
    setProjectName(name);
    setIsDrawerOpen(true);
    // console.log("id:::::::", id);
  };

  const datastrue = projectListings.flatMap((project) => {
    const filteredVintagesData = filteredVintages(
      project.vintages,
      vintageData.items
    );

    const projectType =
      project.type && Array.isArray(project.type) && project.type.length > 0
        ? project.type.length > 1
          ? `${project.type[0].project_type} & ${project.type.length} more`
          : project.type[0].project_type
        : "--";

    // Map filtered vintage data to the desired structure
    return filteredVintagesData.map((vintage) => ({
      projectId: project.project_code,
      projectName: project.name,
      vintageYear: vintage.vintage_year,
      totalTonnes: vintage.tonnes,
      pricePerTonne: vintage.price,
      projectType,
    }));
  });

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
          //cook totalPrice
          args: [hiestiyaProxy, parseEther(value)],
        });
        const hash = await writeContract(config, request);
        const transactionReceipt = await waitForTransactionReceipt(config, {
          // confirmations: 2,
          hash: hash,
        });
        toast.success("Token Approval Successful");
      }
    } catch (error) {
      console.error(error);
    }
  };


//   <li style="margin: 5px 0; color: #333; list-style-position: outside; display: flex; align-items: center; position: relative;">
//     <span style="position: absolute; left: -20px; top: 80%; transform: translateY(-50%); display: inline-block; width: 5px; height: 5px; background-color: #333; border-radius: 50%;"></span>
//     <strong>Project Name:</strong> ${pdfData.trades[0]?.projectName || '[e.g., Rajasthan Solar Farm]'}
// </li>

  const handlePlaceOrder = async (amount) => {
    setButtonLoading(true);
    try {
      const totalPrice =
        Number(amount) + (Number(amount) * percentageValue) / 100;

      // const pdfData = {
      //   hashId: "006461646217521210",
      //   actionType: "Buy",
      //   trades: datastrue,
      //   fees: 13381n,
      //   hestiyafee: percentageValue,
      //   itemType: ["CarbonCredits", "RenewableEnergyCertificates"],
      //   registry: "Hestiyaregis, Hestiyamarket",
      //   buyerName: "Abdullah",
      //   buyerEmail: "Abd@gmail.com"
      // };
      // generateAndDownloadPurchasePDF(pdfData);

      // return
      if (isNaN(totalPrice)) {
        console.error("Invalid amount value:", amount);
        return;
      }

      console.log(totalPrice, "check this is the price");
      console.log(credits, "amount");
      if (!hasToken) {
        if (chainId != 31337) {
          await tokenApproval(totalPrice.toString(), tokenAddress);
        }
        const { request } = await simulateContract(config, {
          abi: abi,
          address: hiestiyaProxy,
          functionName: "bulkPurchase",
          args: [projectIds, vintageYears, credits, tokenAddress],
        });
        console.log(request, "check this is the request");
        const hash = await writeContract(config, request);
        const transactionReceipt = await waitForTransactionReceipt(config, {
          // confirmations: 2,
          hash: hash,
        });
        if (transactionReceipt && hash ) {
          const response = await axios.post(`${apiUrl}order/`, {
            cart_id: cartId,
            trx_hash: hash,
          });
          if (response && hash && transactionReceipt) {
            fetchCartItems(cartId);
            setCartId("");
            // console.log(transactionReceipt);
            // console.log("hash: 12345" + hash);

            const pdfData = {
              hashId: hash ?? transactionReceipt.transactionHash ?? transactionReceipt.hash,
              actionType: "Buy",
              trades: datastrue,
              fees: transactionReceipt.gasUsed,
              hestiyafee: percentageValue,
              itemType: response?.data?.item_type,
              registry: response?.data?.registory,
              buyerName: response?.data?.buyer_name,
              buyerEmail: response?.data?.buyer_email,
            };
            generateAndDownloadPurchasePDF(pdfData);
            setCartId("");
            toast.success(`Purchase Successful`);
            navigate("/marketplace/portfolio");
          }
        }
      } else {
        try {
        const response = await axios.post(
          `${apiUrl}order/`,
          {
            cart_id: cartId,
            trx_hash: "",
          },
          {
            headers: {
              Authorization: `Bearer ${hasToken?.access_token
                .toString()
                .trim()}`,
            },
          }
        );
        // console.log("response", response);
        if (response) {
          fetchCartItems(cartId);
          setCartId("");
          // console.log(transactionReceipt);
          // console.log("hash: 12345" + hash);

          const pdfData = {
            hashId: response?.data?.trx_hash,
            actionType: "Buy",
            trades: datastrue,
            fees: response?.data?.gas_used || 0,
            hestiyafee: percentageValue,
            itemType: response?.data?.item_type,
            registry: response?.data?.registory,
            buyerName: response?.data?.buyer_name,
            buyerEmail: response?.data?.buyer_email,
            // currency: selectedMethod != "gateway" ? "USDT" : "USD",
          };
          generateAndDownloadPurchasePDF(pdfData);
          setCartId("");
          toast.success(`Purchase Successful`);
          navigate("/marketplace/portfolio");
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
    } catch (error) {
      toast.error("Something went wrong. Please try later");
      console.error("something went wrong", error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (error)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        Error: {error}
      </div>
    );

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };

  useEffect(() => {
    const fetchGasData = async () => {
      if (
        projectIds.length > 0 &&
        vintageYears.length > 0 &&
        credits.length > 0 &&
        tokenAddress !== null
      ) {
        setLoadingGas(true);
        try {
          const functionName = "bulkPurchase";
          // console.log("tokenAddress", tokenAddress);
          if(tokenAddress){
            const args = [projectIds, vintageYears, credits, tokenAddress];
            // console.log("line 397", functionName, args)
            const { estmaiteGasPriceInUSD, estmateGasUsed } =
              await getGasEstimateAndPrice(functionName, args);
              // console.log("check the gasprice and the estimate gas used", estmaiteGasPriceInUSD, estmateGasUsed)
            setGasPriceInUSD(estmaiteGasPriceInUSD);
            setGasUsed(estmateGasUsed);
          }
          
        } catch (error) {
          console.error("Failed to fetch gas data:", error);
        } finally {
          setLoadingGas(false);
        }
      }
    };

    fetchGasData();
  }, [projectIds, vintageYears, credits, tokenAddress, showStripeModal]);
  
  // const grandTotal =
  //   selectedMethod != "gateway"
  //     ? (
  //         vintageData.total_cart_price +
  //         (vintageData.total_cart_price * percentageValue) / 100
  //       )?.toFixed(4)
  //     : (
  //         vintageData.total_cart_price +
  //         (vintageData.total_cart_price * percentageValue) / 100 +
  //         gasPriceInUSD
  //       )?.toFixed(4);

  const grandTotal =
  selectedMethod != "gateway"
    ? (
        vintageData.total_cart_price +
        (vintageData.total_cart_price * percentageValue) / 100
      )?.toFixed(4)
    : (
        vintageData.total_cart_price +
        (vintageData.total_cart_price * percentageValue) / 100 +
        (vintageData.total_cart_price * stripeFeePercentage) / 100 +
        gasPriceInUSD
      )?.toFixed(4);

  // const handlePayment = async () => {
  //   try {
  //     const response = await axios.post(
  //       `${apiUrl}order/`,
  //       {
  //         cart_id: cartId,
  //         trx_hash: "",
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${hasToken?.access_token.toString().trim()}`,
  //         },
  //       }
  //     );
  //     if (response) {
  //       fetchCartItems(cartId);
  //       setCartId("");
  //       // console.log(transactionReceipt);
  //       // console.log("hash: 12345" + hash);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {

  // },[showStripeModal])

useEffect(() => {
  const fetchDecimals = async () => {
    try {
      const decimals = await getDecimals(tokenAddress);
      setGetDecimalsData(decimals);
      // console.log("decimals", decimals);
    } catch (error) {
      console.error("Failed to fetch decimals data:", error);
    }
  };
  fetchDecimals();
}, [tokenAddress]);


  const feeAmount = (
    (vintageData.total_cart_price * percentageValue) /
    100
  ).toFixed(3);

  const stripeFeeAmount = (
  (vintageData.total_cart_price * stripeFeePercentage) / 
  100
).toFixed(3);

useEffect(() => {
  const handleClickOutside = (event) => {
    // Close tooltips if click is outside of any tooltip or its trigger button
    if (showTooltip || stripeTooltip) {
      const tooltipElements = document.querySelectorAll('.tooltip-container, .tooltip-trigger');
      let clickedOutside = true;
      
      tooltipElements.forEach(element => {
        if (element.contains(event.target)) {
          clickedOutside = false;
        }
      });

      if (clickedOutside) {
        setShowTooltip(false);
        setStripeTooltip(false);
      }
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [showTooltip, stripeTooltip]);

  return (
    <>
      {hasAddress ? (
        <>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {cartId === "" ||
              projectListings.length === 0 ||
              vintageData.total_cart_price <= 0 ? (
                <NoData
                  height={"80vh"}
                  headingText={"Cart is Empty"}
                  paraText={
                    "Your cart is currently empty. Please add a project to proceed with your purchase."
                  }
                />
              ) : (
                <>
                  <div className="xlll:mx-6 xl:mx-4 mt-2 mb-4 flex flex-col gap-4 xl:gap-0 xlll:flex-row">
                    {/* 1st  */}
                    {/* temp  */}
                    <div className="w-full xlll:w-2/3 ">
                      {projectListings?.map((card) => (
                        <div
                          key={card.project_code}
                          className="w-full flex flex-col lg:flex-row gap-4 p-4  rounded-3xl bg-[#F5F5F5] mb-2"
                        >
                          <div className="border-2 w-full lg:w-2/5 flex gap-4 flex-col border-[#D9D9D9] rounded-3xl py-[19px] px-4">
                            <div className="gap-[29px] flex flex-col">
                              <div className="w-full rounded-3xl">
                                {card.images &&
                                Array.isArray(card.images) &&
                                card.images?.length > 0 ? (
                                  <img
                                    src={card.images[0].image}
                                    className="w-full h-[137px] bg-cover object-cover rounded-3xl"
                                    alt={"Project Image"}
                                  />
                                ) : (
                                  <div className="max-w-full flex justify-center items-center sm:w-[200px] h-[200px] rounded-xl">
                                    no image
                                  </div>
                                )}
                              </div>
                              <div className="text-xl font-semibold leading-[30px]">
                                {card.name}
                              </div>
                            </div>
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start gap-4 xlll:justify-between">
                                <div className="text-base text-[#1D1F2199]">
                                  <div className="font-semibold leading-[24px] mb-5">
                                    Standards
                                  </div>
                                  <div className="font-normal leading-[22.4px]">
                                    {card.standard &&
                                    Array.isArray(card.standard) &&
                                    card.standard.length > 0 ? (
                                      <>
                                        {card.standard.length > 1 ? (
                                          <>
                                            {card.standard[0].project_standard}{" "}
                                            & {card.standard.length} more
                                          </>
                                        ) : (
                                          <>
                                            {card.standard[0].project_standard}
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      "--"
                                    )}
                                  </div>
                                </div>
                                <div className="text-base text-[#1D1F2199]">
                                  <div className="font-semibold leading-[24px] mb-5">
                                    Project Type
                                  </div>
                                  <div className="font-normal leading-[22.4px]">
                                    {card.type &&
                                    Array.isArray(card.type) &&
                                    card.type.length > 0 ? (
                                      <>
                                        {card.type.length > 1 ? (
                                          <>
                                            {card.type[0].project_type} &{" "}
                                            {card.type.length} more
                                          </>
                                        ) : (
                                          <>{card.type[0].project_type}</>
                                        )}
                                      </>
                                    ) : (
                                      "--"
                                    )}
                                  </div>
                                </div>

                                <div className="text-base text-[#1D1F2199]">
                                  <div className="font-semibold leading-[24px] mb-5">
                                    Project Code
                                  </div>
                                  <div className="font-normal leading-[22.4px]">
                                    {card.project_code}
                                  </div>
                                </div>
                              </div>
                              <div className="flex text-[#1D1F2199] flex-wrap w-full items-center gap-4">
                                {card.carbon_rating ? (
                                  <div className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]">
                                    {card.carbon_rating.carbon_rating}
                                  </div>
                                ) : (
                                  ""
                                )}
                                {card.cobenifit_rating ? (
                                  <div className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]">
                                    {card.cobenifit_rating.co_rating_obtained}{" "}
                                    Co-Benefits
                                  </div>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="w-full lg:w-3/5 flex flex-col justify-center gap-4">
                            <div className="px-4 py-[19px] border-2  border-[#D9D9D9] rounded-3xl">
                              <div className="overflow-x-auto">
                                <table className="text-sm xs:text-base font-semibold leading-6 w-full text-left text-black">
                                  <thead>
                                    <tr>
                                      <th
                                        scope="col"
                                        className="pb-4 px-2 md:px-0 w-1/4"
                                      >
                                        Vintage
                                      </th>
                                      <th
                                        scope="col"
                                        className="pb-4 px-2 md:px-0 w-1/4"
                                      >
                                        Price/{" "}
                                        {(card?.filter_project_type ??
                                          "CarbonCredits") === "CarbonCredits"
                                          ? " Tonnes"
                                          : "MWh"}{" "}
                                        {selectedMethod != "gateway" ? "(USDT)" : "(USD)"}
                                      </th>
                                      <th
                                        scope="col"
                                        className="pb-4 px-2 md:px-0 w-1/4"
                                      >
                                        {(card?.filter_project_type ??
                                          "CarbonCredits") === "CarbonCredits"
                                          ? " Tonnes"
                                          : "MWh"}
                                      </th>
                                      <th
                                        scope="col"
                                        className="pb-4 px-2 md:px-0 w-1/4"
                                      >
                                        Total {selectedMethod != "gateway" ? "(USDT)" : "(USD)"}
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="text-[#1D1F2199]">
                                    {filteredVintages(
                                      card.vintages,
                                      vintageData.items
                                    ).map((item, index) => {
                                      return (
                                        <tr
                                          key={index}
                                          className={`${
                                            index === card.vintages.length - 1
                                              ? ""
                                              : "border-b border-[#BDC3C7]"
                                          }`}
                                        >
                                          <td
                                            className={`${
                                              index === card.vintages.length - 1
                                                ? "pb-0 pt-4"
                                                : "pt-4 pb-4"
                                            } w-1/4 px-2 md:px-0`}
                                          >
                                            {item.year ?? "---"}
                                          </td>
                                          <td
                                            className={`${
                                              index === card.vintages.length - 1
                                                ? "pb-0 pt-4"
                                                : "pt-4 pb-4"
                                            } w-1/4 px-2 md:px-0`}
                                          >
                                            {item.price ?? "---"}
                                          </td>
                                          <td
                                            className={`${
                                              index === card.vintages.length - 1
                                                ? "pb-0 pt-4"
                                                : "pt-4 pb-4"
                                            } w-1/4 px-2 md:px-0`}
                                          >
                                            {item.tonnes ?? "---"}
                                          </td>
                                          <td
                                            className={`${
                                              index === card.vintages.length - 1
                                                ? "pb-0 pt-4"
                                                : "pt-4 pb-4"
                                            } w-1/4 px-2 md:px-0`}
                                          >
                                            {item.total ?? "---"}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                            <div className="px-4 py-[19px] flex flex-col gap-6 border-2 border-[#D9D9D9] rounded-3xl">
                              <div className="flex flex-col gap-4">
                                <div className="text-[28px] font-semibold leading-[33.6px]">
                                  {card.start_price}{" "}
                                  <span className="text-base text-[#1D1F2199] font-normal leading-[22.4px]">
                                  {selectedMethod != "gateway" ? "USDT" : "USD"}/
                                    {(card?.filter_project_type ??
                                      "CarbonCredits") === "CarbonCredits"
                                      ? " Tonnes"
                                      : "MWh"}
                                  </span>
                                </div>

                                <div className="flex gap-2 text-sm font-normal leading-[14px] text-[#1D1F2199]">
                                  <div>
                                    {card.total_available_credits}{" "}
                                    {(card?.filter_project_type ??
                                      "CarbonCredits") === "CarbonCredits"
                                      ? " Tonnes"
                                      : "MWh"} {" "}
                                    available{" "}
                                  </div>
                                  <div className="border border-white"></div>
                                  <div>
                                    Vintages {card.vintage_start_year} -{" "}
                                    {card.vintage_end_year}
                                  </div>
                                </div>
                              </div>

                              <div>
                                <button
                                  className={`py-3 text-center bg-[#CDDC6E] w-full text-black px-[23px] text-base font-semibold leading-6 rounded-lg`}
                                  onClick={() =>
                                    handleAddToCart(card.project_code)
                                  }
                                >
                                  Update Cart
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* temp  */}

                    {/* 2nd  */}

                    <div className="pl-0 xl:pl-5 flex flex-col gap-3 w-full xlll:w-1/3">
                      <div className=" flex flex-col lg:flex-row xl:flex-col gap-3">
                        <div className="w-full border-[1.2px] flex flex-col gap-5 xl:gap-9 border-[#BDC3C7] p-5 xl:p-7 rounded-lg">
                          <div className="flex flex-col gap-3 xl:gap-5">
                            <h2 className=" text-base xs:text-lg xl:text-xl font-semibold leading-[30px]">
                              Payment Method
                            </h2>
                            {/* Payment Options */}
                            {/* <div className="flex items-center">
                                  <input
                                    id="credit-card"
                                    name="payment-method"
                                    type="radio"
                                    value="credit-card"
                                    checked={selectedMethod === "credit-card"}
                                    onChange={() => setSelectedMethod("credit-card")}
                                    className="custom-radio"
                                  />

                                  <label
                                    htmlFor="credit-card"
                                    className="ml-3 cursor-pointer block text-lg xl:text-xl font-medium leading-4 xl:eading-6 text-[#1D1F2199]"
                                  >
                                    Credit Card
                                  </label>
                                </div> */}


<div>
                              
                              <div className="flex items-center mt-1">
                                <label
                                  htmlFor="payment-method"
                                  className="flex items-center cursor-pointer"
                                >
                                  <input
                                    id="payment-method"
                                    name="payment-method"
                                    type="radio"
                                    value="gateway"
                                    checked={selectedMethod === "gateway"}
                                    onChange={() => setSelectedMethod("gateway")}
                                    className="hidden"
                                  />
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                                      selectedMethod === "gateway"
                                        ? "border-[#1D1F2199] bg-[#1D1F2199]"
                                        : "border-gray-400 bg-transparent"
                                    }`}
                                  >
                                    {selectedMethod === "gateway" && (
                                      <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <span className="ml-3 text-base xs:text-lg xl:text-xl font-medium leading-4 xl:leading-6 text-[#1D1F2199]">
                                    Pay through Credit Card/Bank	
                                  </span>
                                </label>
                              </div>
                              
                                                            
                                                          </div>

                           <div className="flex items-center">
  <label
    htmlFor="crypto-wallet"
    className="flex items-center cursor-pointer"
  >
    <input
      id="crypto-wallet"
      name="payment-method"
      type="radio"
      value="crypto"
      checked={selectedMethod === "crypto"}
      onChange={() => setSelectedMethod("crypto")}
      className="hidden"
    />
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
        selectedMethod === "crypto"
          ? "border-[#1D1F2199] bg-[#1D1F2199]"
          : "border-gray-400 bg-transparent"
      }`}
    >
      {selectedMethod === "crypto" && (
        <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
      )}
    </div>
    <span className="ml-3 text-base xs:text-lg xl:text-xl font-medium leading-4 xl:leading-6 text-[#1D1F2199]">
      Pay through Crypto Wallet
    </span>
  </label>
</div>

{selectedMethod === "gateway" && (
                                                              <button
                                                                onClick={(e) => {
                                                                  e.preventDefault()
                                                                  if(grandTotal && grandTotal < 0.5){
                                                                      toast.error(" Minimum total should be more than $0.5 required to proceed with payment.");
                                                                      return;
                                                                   }else{
                                                                  setShowStripeModal(true)
                                                                   }
                                                                }}
                                                                className="w-full cursor-pointer mt-2 py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
                                                              >
                                                                Pay through Credit Card/Bank	
                                                              </button>
                                                            )}
                              
                                                            {showStripeModal && (
                                                             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                                                             <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md 
                                                                             max-h-[96vh] overflow-y-auto py-4">
                                                               <StripePaymentWrapper cartID={cartId} setShowStripeModal={setShowStripeModal} datastrue={datastrue} percentageValue={percentageValue} />
                                                           
                                                               <button
                                                                 onClick={(e) => {
                                                                   e.preventDefault();
                                                                   setShowStripeModal(false);
                                                                 }}
                                                                 className="mt-4 w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 
                                                                            rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                               >
                                                                 Close
                                                               </button>
                                                             </div>
                                                           </div>
                                                           
                                                            )}


                          </div>

                          <div className="border-b-[1.2px] border-[#BDC3C7]"></div>
                          {/* Review Total */}
                          <div className="flex flex-col gap-6">
                            <div className="text-lg sx:text-xl xl:text-[28px] font-semibold text-black leading-6 xl:leading-[33.6px]">
                              Review Total
                            </div>
                            <div className="flex text-base xl:text-lg font-medium leading-4 xl:leading-6 text-[#1D1F2199] justify-between">
                              <span>Projects Total</span>
                              <span>{vintageData.total_cart_price} {selectedMethod != "gateway" ? "USDT" : "USD"}</span>
                            </div>
                             <div className="">
      <div className="flex text-base xl:text-lg font-medium leading-4 xl:leading-6 text-[#1D1F2199] justify-between items-center">
        <div className="flex items-center space-x-1">
          <span className="relative">Hestiya Fee

          {showTooltip && (
  <div className="absolute z-10 bottom-7 left-0 w-64 p-3 bg-white border border-gray-300 rounded-md shadow-md text-sm text-gray-700">
    <div className="relative">
      <p>
        This 5% platform fee is charged by the Hestiya Marketplace to cover
        infrastructure, security, and operational costs.
      </p>
      {/* Tooltip Arrow */}
      {/* <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-l border-b border-gray-300 rotate-45"></div> */}
    </div>
  </div>
)}

          </span>
          <button
            onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
          setStripeTooltip(false); // Close other tooltip
        }}
            className="text-[#1D1F2199] hover:text-black focus:outline-none"
          >
            <FiInfo className="w-4 h-4" /> {/* Icon from react-icons */}
          </button>
        </div>

        <span>
          {feeAmount} {selectedMethod !== "gateway" ? "USDT" : "USD"}
        </span>
      </div>

      {/* Tooltip */}
      
    </div>

    {selectedMethod === "gateway" && (
    <div className="flex text-base xl:text-lg font-medium leading-4 xl:leading-6 text-[#1D1F2199] justify-between">
      <span className="relative flex items-center">Payment Processing Fee (Stripe)
        <button
           onClick={(e) => {
              e.stopPropagation();
              setStripeTooltip(!stripeTooltip);
              setShowTooltip(false); // Close other tooltip
            }}
            className="text-[#1D1F2199] ms-1 -mb-[2px] hover:text-black focus:outline-none"
          >
            <FiInfo className="w-4 h-4" /> {/* Icon from react-icons */}
          </button>

          {stripeTooltip && (
  <div className="absolute z-10 bottom-7 -right-10 sm:-right-36  w-64 p-3 bg-white border border-gray-300 rounded-md shadow-md text-sm text-gray-700">
    <div className="relative">
      <p>
      This 5.9% processing fee is charged by Stripe for credit card and bank
              payment processing services. It covers transaction costs and fraud
              prevention measures.
      </p>
      {/* Tooltip Arrow */}
      {/* <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-l border-b border-gray-300 rotate-45"></div> */}
    </div>
  </div>
)}
      </span>
      <span>{stripeFeeAmount} USD</span>
    </div>
  )}
                            {selectedMethod != "gateway" && (
                              <div className="flex text-base xl:text-lg font-medium leading-4 xl:leading-6 text-[#1D1F2199] justify-between">
                                <span>Estimated Transaction Fee</span>
                                {/* {console.log("check the gasprice", gasPriceInUSD)} */}
                                <span>
                                  {loadingGas ? (
                                    "laoding transaction fee..."
                                  ) : (
                                    <>{gasPriceInUSD?.toFixed(4)} {selectedMethod != "gateway" ? "USDT" : "USD"}</>
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between text-base xs:text-lg xl:text-xl leading-5 xl:leading-[30px] text-black font-semibold">
                              <div>Grand Total</div>

                              <div>
                                {grandTotal}{" "}
                                <span className="text-[14px]">{selectedMethod != "gateway" ? "USDT" : "USD"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Grand Total */}
                          {/* <div className="px-6 py-[18px] ">
                            <div className="flex justify-between text-base xs:text-lg xl:text-xl leading-5 xl:leading-[30px] text-black font-semibold">
                              <div>Grand Total</div>

                              <div>
                                {vintageData.total_cart_price +
                                  (vintageData.total_cart_price *
                                    percentageValue) /
                                    100}{" "}
                                <span className="text-[14px]">{selectedMethod != "gateway" ? "USDT" : "USD"}</span>
                              </div>
                            </div>
                          </div> */}
                        </div>
                      { selectedMethod != "gateway" &&   <div className="w-full border-[1.2px] border-[#BDC3C7] p-5 xl:p-7 flex gap-3 md:gap-6 flex-col rounded-lg">
                          <div className="text-base xs:text-xl leading-[30px] font-semibold text-black">
                            Agree to Terms & Conditions
                          </div>
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              id="terms"
                              name="terms"
                              checked={isChecked}
                              onChange={handleCheckboxChange}
                              className="accent-[#314033] rounded-lg h-6 w-6 border-[2px] border-[#BDC3C7]"
                            ></input>
                            <label
                              htmlFor="terms"
                              className="ml-2 text-sm xs:text-base text-black font-normal leading-[22.4px] text-justify"
                            >
                              By proceeding with this transaction, I confirm my
                              understanding and agreement to be bound by Hestiya
                              Ltd.'s Privacy Policy, Platform Terms & conditions
                              and privacy policies of any third-party payment
                              processor engaged by Hestiya. Non-compliance with
                              Platform Terms may result in transaction
                              termination or penalties imposed by Hestiya.
                            </label>
                          </div>
                        </div>}
                      </div>

                      {/* <Button onClick={handlePlaceOrder} className="w-full">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-base xs:text-lg xl:text-xl font-semibold leading-[30px] text-white">
                            Place Order
                          </span>
                          {buttonLoading && (
                            <PulseLoader size={10} color="#fff" />
                          )}
                        </div>

                      </Button> */}
                     { 
                      selectedMethod != "gateway" && 
                      <div className="">
                        {buttonLoading ? (
                          <button
                            className={`${
                              buttonLoading === false
                                ? " bg-[#CDDC6E]"
                                : "bg-gray-400"
                            } py-3 text-center  w-full text-black px-[23px] text-base md:text-lg xl:text-xl font-semibold leading-[30px] rounded-lg`}
                            onClick={() =>
                              handlePlaceOrder(vintageData.total_cart_price)
                            }
                            disabled={buttonLoading}
                          >
                            <PulseLoader size={10} />
                          </button>
                        ) : (
                          <button
                            className={`${
                              isChecked &&
                              Number(gasUsed) < Number(walletGas) &&
                              Number(grandTotal) < Number(walletToken)
                                ? " bg-[#CDDC6E]"
                                : "bg-gray-400"
                            } py-3 text-center  w-full text-black px-[23px] text-base md:text-lg xl:text-xl font-semibold leading-[30px] rounded-lg`}
                            onClick={() =>
                              handlePlaceOrder(vintageData.total_cart_price)
                            }
                            disabled={
                              !isChecked ||
                              !(
                                Number(gasUsed) < Number(walletGas) &&
                                Number(grandTotal) < Number(walletToken)
                              )
                            }
                          >
                            {gasUsed < walletGas ? (
                              <>
                                {Number(grandTotal) < Number(walletToken)
                                  ? "Place Order"
                                  : "Insufficient Balance"}
                              </>
                            ) : (
                              "Insufficient Gas"
                            )}
                          </button>
                        )}
                      </div>}
                    </div>
                  </div>
                  {/* {console.log("{Project listings are: } ", projectListings)} */}
                  {isDrawerOpen && (
                    <UpdateCartDrawer
                      isOpen={isDrawerOpen}
                      onCartUpdate={() => setIsCartUpdated(true)}
                      onClose={() => setIsDrawerOpen(false)}
                      cartId={cartId}
                      projectCode={projectCode}
                      projectName={projectName}
                      filter_project_type={
                        projectListings[0]?.filter_project_type ??
                        "CarbonCredits"
                      }
                      selectedMethod={selectedMethod}
                    />
                  )}
                </>
              )}
            </>
          )}
        </>
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

export default AddCartListingSingleCard;

// publishKEY = pk_test_51PCeKX02W2AiAFpz2n7rok9COEOQdhuGeNXovHgNjV2Aug6mFjJkPQ33CZevnhrYWfzsq5z1TZZfmpo1FOKgi6hg00mmo7dby0
// secretKEY = sk_test_51PCeKX02W2AiAFpzU1Cc5X1hFfWaosSDqBL0qdh3nLYwtSR2Loimy5YNf16ihd2ezqWVyJtH4UhZqXFiXuqHCc5g00XQdJv0o2
