import { Input } from "@material-tailwind/react";
import { Delete } from "@mui/icons-material";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Loader from "../../loaders/Loader.jsx";
import { toast } from "react-toastify";
import { Bounce } from "react-toastify";
import { decimalPoint, hiestiyaProxy, getContract, tokenAddress, getDecimals} from "../../../abi.js";
import { abi } from "../../../contractAbis";
import { readContract } from "@wagmi/core";
import { config } from "../../../config/WalletConfig.jsx";
import { ethers } from "ethers";
import { UserContext } from "../../../context/UserContext.jsx";

// Helper function to calculate total cost
// const calculateTotalCost = (cartItems) =>
//   cartItems.reduce(
//     (total, item) =>
//       total +
//       item.years.reduce(
//         (yearTotal, yearItem) => yearTotal + yearItem.quantity * yearItem.price,
//         0
//       ),
//     0
//   );

const calculateTotalCost = (cartItems, decimalPoint) => {
  const totalCost = cartItems?.reduce(
    (total, item) =>
      total +
      item.years.reduce(
        (yearTotal, yearItem) => yearTotal + yearItem.quantity * yearItem.price,
        0
      ),
    0
  );
  // Convert totalCost to a string and avoid scientific notation
  const totalCostStr = (totalCost/decimalPoint).toLocaleString("fullwide", {
    useGrouping: false,
  });
  // Convert the total cost to the desired format
  // return ethers.utils.formatUnits(totalCostStr, decimalPoint);
  return totalCostStr;
};

// Helper function to calculate total tonnes
const calculateTotalTonnes = (cartItems) =>
  cartItems.reduce(
    (total, item) =>
      total +
      item.years.reduce(
        (yearTotal, yearItem) => yearTotal + Number(yearItem.quantity),
        0
      ),
    0
  );

// Main component
const UpdateCartDrawer = ({
  isOpen,
  onClose,
  cartId,
  projectCode,
  onCartUpdate,
  projectName,
  filter_project_type,
  selectedMethod = "gateway", // default to gateway if not provided
}) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [getDecimalsData, setGetDecimalsData] = useState();

  // const apiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = "https://api.hestiya.com/api/"
  const { fetchCartItems,hasToken } = useContext(UserContext);


  useEffect(() => {
    const fetchDecimals = async () => {
      try {
        const decimals = await getDecimals(tokenAddress);
        setGetDecimalsData(10 ** decimals);
        // console.log("decimals", decimals);
      } catch (error) {
        console.error("Failed to fetch decimals data:", error);
      }
    };
    fetchDecimals();
  }, [tokenAddress]);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let newCartItems = null;
        const contract = await getContract();
        let result;
      if(hasToken){
         result = await contract.getProjectById(projectCode);
      }else
      {
         result = await readContract(config, {
          abi,
          address: hiestiyaProxy,
          functionName: "getProjectById",
          args: [projectCode],
        });
      }

        // console.log("date set:", result[3]);

        const data = result[3].map((item) => ({
          availableCredits: Number(item.availableCredits),
          soldCredits: Number(item.soldCredits),
          totalCredits: Number(item.totalCredits),
          pricePerCredit: Number(item.pricePerCredit), // Keeping this as BigInt before converting
          year: item.year,
        }));

        // console.log("Processed data:", data);

        // blockchain
        if (cartId) {
          const resp = await axios.get(`${apiUrl}cart-item/?cart=${cartId}`);
          // console.log("cart vintage:", resp.data[0].project_id);
          // console.log("resp", resp);
          const filteredCartItems = resp.data.items.filter(
            (item) => item.project_id === projectCode
          );

          const updateCartItems = filteredCartItems?.map((item) => ({
            year: item.vintage_year,
            quantity: item.quantity,
          }));

          // console.log("Filtered Cart Items:", updateCartItems);

          // Fetch the project listing to get the full vintage data
          const res = await axios.get(
            `${apiUrl}project-listing/${projectCode}`
          );

          // console.log("data bloc", data);
          const apiData = data;

          newCartItems = {
            name: projectName,
            years: apiData
              .map((vintage) => {
                // Find the matching updateCartItem by vintage id
                const matchingUpdateItem = updateCartItems.find(
                  (updateItem) => updateItem.year === vintage.year
                );

                return {
                  // id: vintage.id,
                  year: vintage.year,
                  price: vintage.pricePerCredit,
                  available: vintage.availableCredits,
                  quantity: matchingUpdateItem
                    ? matchingUpdateItem.quantity
                    : 0,
                };
              })
              .sort((a, b) => a.year - b.year),
          };
          setCartItems([newCartItems]);
          // console.log("updated values", newCartItems);
        }
      } catch (error) {
        setError(error.message, "234");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectCode, cartId]);

  // Handle quantity change
  const handleQuantityChange = (itemIndex, yearIndex, quantity) => {
    const parsedQuantity = quantity === "" ? 0 : Number(quantity); // Set to 0 if empty
    const yearItem = cartItems[itemIndex].years[yearIndex];

    if (parsedQuantity < 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`${itemIndex}-${yearIndex}`]: "Quantity cannot be less than 0.",
      }));
    } else if (parsedQuantity > yearItem.available) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [`${itemIndex}-${yearIndex}`]: `Please enter a quantity between 0 and ${yearItem.available}.`,
      }));
    } else {
      // Clear error message if the input is valid
      setErrors((prevErrors) => {
        const { [`${itemIndex}-${yearIndex}`]: removedError, ...rest } =
          prevErrors;
        return rest;
      });
      // Update the cart with the valid quantity
      updateCart(itemIndex, yearIndex, parsedQuantity);
    }
  };
  // Update cart in state
  const updateCart = (itemIndex, yearIndex, quantity) => {
    const newCartItems = [...cartItems];
    newCartItems[itemIndex].years[yearIndex].quantity = Number(quantity);
    setCartItems(newCartItems);
  };

  // Clear year quantity
  const handleClearYear = (itemIndex, yearIndex) => {
    updateCart(itemIndex, yearIndex, 0);
  };

  // Handle cart update submission
  const handleUpdateCart = async () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Invalid Quantities Detected.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    const cartPayload = {
      cart_id: cartId,
      items: cartItems.flatMap((item) =>
        item.years
          .filter((yearItem) => yearItem.quantity >= 0)
          .map((yearItem) => ({
            project_id: projectCode,
            vintage_year: yearItem.year,
            quantity: yearItem.quantity,
          }))
      ),
    };
    // console.log("cartPayload", cartPayload);
    try {
      const res = await axios.post(`${apiUrl}cart-item/`, cartPayload);
      if (res) {
        fetchCartItems(cartId);
        toast.success(<div>Cart Successfully Updated.</div>, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        onCartUpdate();
        onClose();
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Cart Update Error.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
    }
  };

  if (error)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        Error: {error}
      </div>
    );

  return (
    <div>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 w-full md:w-3/5 lg:w-2/5 h-full bg-white shadow-lg z-50 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {cartItems?.map((item, index) => (
                <div key={index} className="mb-4">
                  <div>
                    <div className="text-2xl mb-2 font-semibold">
                      {item.name}
                    </div>
                    <div className="text-[#1D1F2199] mb-1">
                      Enter required  {(filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"} {" "} under each vintage you’d like to
                      purchase.
                    </div>
                    <div className="border-[1.2px] border-[#1D1F2199]"></div>
                    <div className="text-[#1D1F2199] mt-1">
                      Can’t find the credits you’re looking for? Email us at:{" "}
                      <Link
                        className="text-blue-300 hover:underline hover:text-blue-400"
                        to={"#"}
                      >
                        support@hestiya.com
                      </Link>
                    </div>
                  </div>
                  {item?.years?.map((yearItem, yearIndex) => {
                    // const totalYear = yearItem.quantity * yearItem.price;

                    const totalYear = yearItem.quantity * yearItem.price;
                    const totalYearStr = totalYear.toLocaleString("fullwide", {
                      useGrouping: false,
                    });
                    // const formattedTotalYear = ethers.utils.formatUnits(
                    //   totalYearStr,
                    //   decimalPoint
                    // );
                    const formattedTotalYear = totalYearStr;
                    return (
                      <div
                        key={yearIndex}
                        className="border mt-5 border-[#1D1F2199] rounded-md"
                      >
                        <div className=" text-base md:text-lg border-b-[1px]  p-4 border-[#1D1F2199] pb-4">
                          Vintage {yearItem.year}
                        </div>
                        <div className="p-4">
                          <div className="border border-[#1D1F2199] rounded-md p-4">
                            <div className="flex justify-between items-center">
                              <div className="flex gap-2">
                                <div className="flex flex-col gap-1">
                                  <div className=" text-[#1D1F2199] text-sm md:text-base">
                                    Price/ {(filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"}
                                  </div>
                                  <div className="text-black text-base md:text-lg">
                                    {/* {ethers.utils.formatUnits(
                                      yearItem.price.toString(),
                                      decimalPoint
                                    )} */}
                                    {(yearItem.price/getDecimalsData).toLocaleString(
                                        "fullwide",
                                        {
                                          useGrouping: false,
                                        }
                                      )}
                                    {" "}
                                    {/* {yearItem.price.toFixed(2)}  */}
                                    {/* USD */}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <div className=" text-[#1D1F2199] text-sm md:text-base">
                                    Available
                                  </div>
                                  <div className="text-black text-base md:text-lg">
                                    {yearItem.available}  {(filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleClearYear(index, yearIndex)
                                }
                                className="bg-[#1D1F2199] text-white p-1 rounded-lg"
                              >
                                <Delete />
                              </button>
                            </div>
                            <div className="mt-6 flex justify-between items-center">
                              <div className="md:w-[250px]">
                                <Input
                                  type="number"
                                  min="0"
                                  max={yearItem.available}
                                  label={(filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"}
                                  className="w-24"
                                  //   value={
                                  //     yearItem.quantity !== undefined
                                  //       ? yearItem.quantity
                                  //       : ""
                                  //   }
                                  onFocus={(e) => {
                                    if (e.target.value === "0") {
                                      e.target.value = ""; // Clear the input if it's 0 on focus
                                    }
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      handleQuantityChange(index, yearIndex, 0); // Set quantity to 0 on blur if the input is empty
                                    }
                                  }}
                                  value={
                                    yearItem.quantity === 0
                                      ? ""
                                      : yearItem.quantity
                                  }
                                  //   onChange={(e) => {
                                  //     const quantityValue = e.target.value;
                                  //     if (
                                  //       quantityValue === "" ||
                                  //       /^[0-9]*$/.test(quantityValue)
                                  //     ) {
                                  //       handleQuantityChange(
                                  //         index,
                                  //         yearIndex,
                                  //         quantityValue
                                  //       );
                                  //     }
                                  //   }}
                                  onChange={(e) => {
                                    const quantityValue =
                                      e.target.value === ""
                                        ? 0
                                        : e.target.value; // Set value to 0 if empty
                                    if (/^[0-9]*$/.test(quantityValue)) {
                                      handleQuantityChange(
                                        index,
                                        yearIndex,
                                        quantityValue
                                      ); // Handle quantity change
                                    }
                                  }}
                                  error={!!errors[`${index}-${yearIndex}`]}
                                />
                                {errors[`${index}-${yearIndex}`] && (
                                  <p className="text-red-500 text-sm mt-1">
                                    {errors[`${index}-${yearIndex}`]}
                                  </p>
                                )}
                              </div>
                              <div>
                                {(formattedTotalYear/getDecimalsData)}{" "}
                                {selectedMethod !== "gateway" ? "USDT" : "USD"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-300 flex justify-between flex-wrap gap-4 items-center bg-white">
              <div>
                <div className="text-2xl mb-2 font-semibold">Total Project</div>
                <div className="flex gap-6">
                  <div className="flex flex-col gap-1">
                    <div className="text-[#1D1F2199] text-sm md:text-base">
                      Total
                    </div>
                    <div className="text-xl">
                      {calculateTotalCost(cartItems, getDecimalsData)} {selectedMethod !== "gateway" ? "USDT" : "USD"}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[#1D1F2199] text-sm md:text-base">
                      Total {" "}  {(filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"}
                    </div>
                    <div className="text-xl">
                      {calculateTotalTonnes(cartItems)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={onClose}
                  className="text-white rounded-lg px-4 py-2 bg-black"
                >
                  Close
                </button>
                <button
                  className="bg-[#CDDC6E] text-black px-4 py-2 rounded-lg"
                  onClick={handleUpdateCart}
                >
                  Update Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UpdateCartDrawer;
