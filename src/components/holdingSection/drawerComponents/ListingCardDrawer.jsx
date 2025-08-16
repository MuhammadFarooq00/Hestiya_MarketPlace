import React, { useContext, useEffect, useState } from "react";
import { Input } from "@material-tailwind/react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Bounce } from "react-toastify";
import {
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config } from "../../../config/WalletConfig";
import {
  hiestiyaProxy,
  decimalPoint,
  getGasEstimateAndPrice,
  zeroAddress,
  getBalance,
  getBalanceForList,
} from "../../../abi";
import { abi } from "../../../contractAbis";
import { ethers } from "ethers";
import PulseLoader from "react-spinners/PulseLoader";
import { generateAndDownloadPDFListing } from "../../../Template/Template";
import { UserContext } from "../../../context/UserContext";
// Main component

  const apiUrl = "https://api.hestiya.com/api/"

const ListingCardDrawer = ({
  isOpen,
  name,
  onClose,
  address,
  vintageData = [],
  projectId,
  getProjectById,
  filter_project_type,
}) => {
  // const apiUrl = import.meta.env.VITE_API_URL;
  const [prices, setPrices] = useState({});
  const [loadingYear, setLoadingYear] = useState(null);
  const [quantities, setQuantities] = useState({});

  const [gasPrices, setGasPrices] = useState({});
  const [loadingGas, setLoadingGas] = useState(false);

  const [walletGas, setWalletGas] = useState(0);
  const [gasUsed, setGasUsed] = useState(0);
  const { hasToken, setShowSessionModal } = useContext(UserContext);
  const getToken = async () => {
    if (address && zeroAddress) {
      // console.log("address", address);
      // console.log("zeroAddress", zeroAddress);
      const totalGas = await getBalanceForList(zeroAddress, address);
      // console.log("totalGas", totalGas);
      setWalletGas(totalGas);
    }
  };
  useEffect(() => {
    getToken();
    // fetchGasPrice("2024", 0, 0);
  }, [address]);

  const handlePriceChange = async (year, value) => {
    setPrices((prev) => ({
      ...prev,
      [year]: value,
    }));

    const quantity = quantities[year];
    if (value > 0 && quantity > 0) {
      await fetchGasPrice(year, value, quantity);
    }
  };

  const handleQuantityChange = async (year, value) => {
    setQuantities((prev) => ({
      ...prev,
      [year]: value,
    }));

    const price = prices[year];
    if (price > 0 && value > 0) {
      await fetchGasPrice(year, price, value);
    }
  };

  const value = (price) => {
    const totalCostStr = price.toLocaleString("fullwide", {
      useGrouping: false,
    });
    return ethers.utils.parseUnits(totalCostStr, decimalPoint);
  };

  const fetchGasPrice = async (year, price, quantity) => {
    setLoadingGas(true);
    try {
      if (projectId) {
        const functionName = "listCreditsForSale";
        const args = [projectId, quantity, year, value(price)];
        // console.log("arguments : ", args)
        const { estmaiteGasPriceInUSD, estmateGasUsed } =
          await getGasEstimateAndPrice(functionName, args);
        setGasUsed(estmateGasUsed);
        // console.log("estmaiteGasPriceInUSD", estmaiteGasPriceInUSD);
        setGasPrices((prev) => ({
          ...prev,
          [year]: estmaiteGasPriceInUSD,
        }));
      } else {
        // console.log("projectId not found");
      }
    } catch (error) {
      console.error("Failed to fetch gas data:", error);
    } finally {
      setLoadingGas(false);
    }
  };

  const handleListVintage = async (year, id) => {
    setLoadingYear(year);
    try {
      const price = value(prices[year]);
      const quantity = quantities[year];

      // const pdfData = {
      //   hashId: "hashfh55665464565",
      //   actionType: "Listing",
      //   seller:address,
      //   trades: [{
      //     projectId:projectId,
      //     projectName:name,
      //     price_per_credit:Number(prices[year]),
      //     listed_quantity: Number(quantity),
      //     vintageYear:year
      //   }],
      //   fees: 13485n,
      // };
      // // fees: transactionReceipt.gasUsed,

      // console.log(orderItem);

      // generateAndDownloadPDFListing(pdfData)

      // const response = await axios.post(`${apiUrl}p2p-listing/`,orderItem);
      // console.log("response",response)

      // data for api

      if (!price || !quantity || quantity <= 0) {
        toast.error("Invalid Input.", {
          transition: Bounce,
        });
        return;
      }
      // console.log("send to  blockchain", projectId, year, price, quantity);
      if (!hasToken) {

        
       
        const { request } = await simulateContract(config, {
          abi: abi,
          address: hiestiyaProxy,
          functionName: "listCreditsForSale",
          args: [projectId, quantity, year, price],
        });
        const hash = await writeContract(config, request);
        const transactionReceipt = await waitForTransactionReceipt(config, {
          // confirmations: 2,
          hash: hash,
        });
        // console.log("request", request, "tr", transactionReceipt, "hash", hash);
        if (transactionReceipt && hash) {
          const orderItem = {
            order_item: id,
            seller: address,
            listed_quantity: Number(quantity),
            price_per_credit: Number(prices[year]),
            is_active: true,
            trx_hash: hash,
          };

          // console.log(orderItem);

          const response = await axios.post(
            `${apiUrl}p2p-listing/`,
            orderItem
          );

          const pdfData = {
            hashId: hash ?? response?.data?.trx_hash,
            actionType: "Listing",
            seller: address,
            trades: [
              {
                projectId: projectId,
                projectName: name,
                price_per_credit: Number(prices[year]),
                listed_quantity: Number(quantity),
                vintageYear: year,
              },
            ],
            fees: transactionReceipt.gasUsed,
          };

          if (response) {
            generateAndDownloadPDFListing(pdfData);
            toast.success(`Listing Added Successfully`);
            onClose();
            setPrices({});
            setQuantities({});
            getProjectById();
            getToken();
            // console.log(transactionReceipt);
            // console.log("response", response);
          }
        }
      } else {

        try {
        const orderItem = {
          order_item: id,
          seller: address,
          listed_quantity: Number(quantity),
          price_per_credit: Number(prices[year]),
          is_active: true,
          trx_hash: "",
        };

        const response = await axios.post(`${apiUrl}p2p-listing/`, orderItem, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hasToken?.access_token.toString().trim()}`,
          },
        });

        const pdfData = {
          hashId: response?.data?.trx_hash,
          actionType: "Listing",
          seller: address,
          trades: [
            {
              projectId: projectId,
              projectName: name,
              price_per_credit: Number(prices[year]),
              listed_quantity: Number(quantity),
              vintageYear: year,
            },
          ],
          fees: response?.data?.gas_used,
        };

        if (response) {
          generateAndDownloadPDFListing(pdfData);
          toast.success(`Listing Added Successfully`);
          onClose();
          setPrices({});
          setQuantities({});
          getProjectById();
          getToken();
          // console.log(transactionReceipt);
          // console.log("response", response);
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
        // console.log("response", response);
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Listing Failed.", { transition: Bounce });
    } finally {
      setLoadingYear(null);
    }
  };

  const handleClose = () => {
    setPrices({});
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

      {/* Cart Drawer */}
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
              <div>
                <div className="text-2xl mb-2 font-semibold">{name}</div>
                <div className="text-[#1D1F2199] mb-1">
                  Specify the number of {filter_project_type === "CarbonCredits" ? "tonnes": "MWh"} under each vintage that you wish
                  to retire.
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
              </div>
              <div>
                {vintageData.map((yearItem, yearIndex) => {
                  // const totalYear =
                  //   (quantities[yearItem.year] || 0) *
                  //   (prices[yearItem.year] || 0);
                  return (
                    <div
                      key={yearIndex}
                      className="border mt-5 border-[#1D1F2199] rounded-md"
                    >
                      <div className="text-base md:text-lg border-b-[1px] p-4 border-[#1D1F2199] pb-4">
                        Vintage {yearItem.year}
                      </div>
                      <div className="p-4">
                        <div className="border border-[#1D1F2199] rounded-md p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex flex-wrap gap-2">
                              <div className="flex flex-col gap-1">
                                <div className="text-[#1D1F2199] text-sm md:text-base">
                                  Price/{filter_project_type === "CarbonCredits" ? "tonnes": "MWh"}
                                </div>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  label="Price"
                                  value={prices[yearItem.year] || ""}
                                  onChange={(e) =>
                                    handlePriceChange(
                                      yearItem.year,
                                      e.target.value
                                    )
                                  }
                                  className="w-24"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <div className="text-[#1D1F2199] text-sm md:text-base">
                                  Enter {filter_project_type === "CarbonCredits" ? "Tonnes": "MWh"}
                                </div>
                                <Input
                                  type="number"
                                  min="0"
                                  label={filter_project_type === "CarbonCredits" ? "Tonnes": "MWh"}
                                  max={yearItem.credits}
                                  value={quantities[yearItem.year] || ""}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      yearItem.year,
                                      e.target.value
                                    )
                                  }
                                  className="w-24"
                                />
                              </div>

                              {/* <div className="md:w-[250px]">
                                <Input
                                  type="number"
                                  min="0"
                                  max={yearItem.credits}
                                  value={quantities[yearItem.year] || ""}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      yearItem.year,
                                      e.target.value
                                    )
                                  }
                                  className="w-24"
                                  label="Tonnes"
                                />
                              </div> */}
                            </div>
                          </div>
                          <div className="mt-6 flex justify-between items-end">
                            <div className="flex flex-col gap-1">
                              <div className="text-[#1D1F2199] text-sm md:text-base">
                                Available
                              </div>
                              <div className="text-black text-base md:text-lg">
                                {yearItem.credits} {filter_project_type === "CarbonCredits" ? "tonnes": "MWh"}
                              </div>
                            </div>
                            <div className="">
                              <button
                                className={`${
                                  quantities[yearItem.year] > 0 &&
                                  prices[yearItem.year] > 0 &&
                                  walletGas > gasUsed
                                    ? "bg-darkgreen"
                                    : "bg-gray-500"
                                } px-5 py-1.5 rounded-lg text-white`}
                                onClick={() =>
                                  handleListVintage(yearItem.year, yearItem.id)
                                }
                                disabled={
                                  !quantities[yearItem.year] > 0 ||
                                  !prices[yearItem.year] > 0 ||
                                  !(walletGas > gasUsed)
                                }
                              >
                                {loadingYear === yearItem.year ? (
                                  <PulseLoader size={8} color="#ffffff" />
                                ) : (
                                  <>
                                    {!quantities[yearItem.year] > 0 ||
                                    !prices[yearItem.year] > 0 ? (
                                      "Values Required"
                                    ) : (
                                      <>
                                        {walletGas > gasUsed
                                          ? "List"
                                          : "Insufficient"}
                                      </>
                                    )}
                                  </>
                                )}
                              </button>
                            </div>

                            {/* <div>{totalYear}  USDT</div> */}
                          </div>
                          {quantities[yearItem.year] > 0 &&
                          prices[yearItem.year] > 0 &&
                          gasPrices[yearItem.year] !== null &&
                          typeof gasPrices[yearItem.year] !== "undefined" ? (
                            <div className="mt-2 text-sm text-green-600">
                              {loadingGas
                                ? "Fetching Gas Fee..."
                                : ` Estimated Gas Fee: $${gasPrices[
                                    yearItem.year
                                  ]?.toFixed(8)}`}
                            </div>
                          ) : (
                            <div className="mt-2 text-sm text-green-600">
                              {loadingGas ? "Fetching Gas Fee..." : ""}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>No vintages available</div>
          )}
          <div className="flex-1 overflow-y-auto p-4"></div>
          <div className="p-4 border-t border-gray-300 flex justify-between items-center bg-white">
            <div className="flex space-x-2">
              <button
                onClick={handleClose}
                className="text-white rounded-lg px-4 py-2 bg-black"
              >
                Close
              </button>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default ListingCardDrawer;































// {(quantities[yearItem.year] > 0 &&
//   prices[yearItem.year] > 0 &&
//   gasPrices[yearItem.year] !== null) ? (
//     <div className="mt-2 text-sm text-green-600">
//       {loadingGas
//         ? gasPrices[yearItem.year] &&
//           "Fetching Gas Fee..."
//         : ` Estimated Gas Fee: $${gasPrices[
//             yearItem.year
//           ]?.toFixed(8)}`}
//     </div>
//   ) : (
//     <div className="mt-2 text-sm text-green-600">
//       {loadingGas
//         ? gasPrices[yearItem.year] &&
//           "Fetching Gas Fee..."
//         : gasPrices[yearItem.year] !== null
//         ? ` Estimated Gas Fee: $${gasPrices[yearItem.year]?.toFixed(
//             8
//           )}`
//         : ""}
//     </div>
//   )}