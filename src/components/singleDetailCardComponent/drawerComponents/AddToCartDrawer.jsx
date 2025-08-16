import { Input } from "@material-tailwind/react";
import { Delete } from "@mui/icons-material";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../../loaders/Loader";
import { toast } from "react-toastify";
import { Bounce } from "react-toastify";
import { ethers } from "ethers";
import { decimalPoint, getDecimals, tokenAddress } from "../../../abi";
import { UserContext } from "../../../context/UserContext";

const calculateTotalCost = (cartItems, decimalPoint) => {
  // console.log("cartItems", cartItems);
  const totalCost = cartItems?.reduce(
    (total, item) =>
      total +
      item.years?.reduce(
        (yearTotal, yearItem) => yearTotal + yearItem.quantity * yearItem.price,
        0
      ),
    0
  );
  const totalCostStr = (totalCost / decimalPoint).toLocaleString("fullwide", {
    useGrouping: false,
  });
  // return ethers.utils.formatUnits(totalCostStr, decimalPoint);
  return totalCostStr;
};

const calculateTotalTonnes = (cartItems) =>
  // console.log("cartItems", cartItems) || 
cartItems?.reduce(
    (total, item) =>
      total +
      item.years?.reduce(
        (yearTotal, yearItem) => yearTotal + Number(yearItem.quantity),
        0
      ),
    0
  );

// const calculateTotalCost = (cartItems, decimalPoint) => {
//   console.log("cartItems", cartItems);
//   if (!cartItems || !cartItems.years) return 0;
  
//   const totalCost = cartItems.years.reduce(
//     (total, yearItem) => total + (yearItem.quantity * yearItem.price),
//     0
//   );
  
//   return (totalCost / decimalPoint).toLocaleString("fullwide", {
//     useGrouping: false,
//   });
// };

// const calculateTotalTonnes = (cartItems) => {
//   console.log("cartItems", cartItems);
//   if (!cartItems || !cartItems.years) return 0;
  
//   return cartItems.years.reduce(
//     (total, yearItem) => total + Number(yearItem.quantity),
//     0
//   );
// };

const AddToCartDrawer = ({
  isOpen,
  onClose,
  cartId,
  projectCode,
  blockChainData,
  projectName,
  filter_project_type,
}) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [getDecimalsData, setGetDecimalsData] = useState();

  const navigate = useNavigate();
  // const apiUrl = import.meta.env.VITE_API_URL;
  const apiUrl = "https://api.hestiya.com/api/";
  const { fetchCartItems } = useContext(UserContext);

  const [selectedVintageYear, setSelectedVintageYear] = useState("");
  const [quantityMap, setQuantityMap] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const effectiveProjectCode =
          projectCode || localStorage.getItem("projectCode");
          // console.log("effectiveProjectCode", effectiveProjectCode, "carditd", cartId);
        let newCartItems = null;
        if (cartId && effectiveProjectCode) {
          const updatedData = await axios.get(
            `${apiUrl}cart-item/?cart=${cartId}`
          );

          // console.log("updatedData", updatedData);
          const filteredCartItems = updatedData?.data.items?.filter(
            (item) => item.project_id === effectiveProjectCode
          );

          const updateCartItems = filteredCartItems?.map((item) => ({
            year: item.vintage_year,
            quantity: item.quantity,
          }));

          const apiData = blockChainData;
          // console.log("apiData", apiData);
          newCartItems = {
            name: projectName,
            years: apiData?.map((vintage) => {
              const matchingUpdateItem = updateCartItems?.find(
                (updateItem) => updateItem.year === vintage.year
              );

              return {
                year: vintage.year,
                price: vintage.pricePerCredit,
                available: vintage.availableCredits,
                quantity: matchingUpdateItem ? matchingUpdateItem.quantity : 0,
              };
            }),
          };
          //   setCartItems([newCartItems]);
          const initialQuantityMap = {};
          newCartItems.years?.forEach((yearItem) => {
            initialQuantityMap[yearItem.year] = yearItem.quantity;
          });

          setCartItems([newCartItems]);
          setQuantityMap(initialQuantityMap);
          setSelectedVintageYear(newCartItems.years[0]?.year || "");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectCode, cartId]);

  // const handleQuantityChange = (year, quantity) => {
  //   const parsedQuantity = Number(quantity);
  //   const yearItem = cartItems[0].years.find((y) => y.year === year);

  //   if (!yearItem) {
  //     setErrors((prevErrors) => ({
  //       ...prevErrors,
  //       [year]: "Year not found in cart items.",
  //     }));
  //     return;
  //   }

  //   if (parsedQuantity < 0) {
  //     setErrors((prevErrors) => ({
  //       ...prevErrors,
  //       [year]: `Quantity cannot be less than 0.`,
  //     }));
  //   } else if (parsedQuantity > yearItem.available) {
  //     setErrors((prevErrors) => ({
  //       ...prevErrors,
  //       [year]: `Please enter a quantity between 0 and ${yearItem.available}.`,
  //     }));
  //   } else {
  //     setErrors((prevErrors) => {
  //       const { [year]: removedError, ...rest } = prevErrors;
  //       return rest;
  //     });
  //     setQuantityMap((prev) => ({
  //       ...prev,
  //       [year]: parsedQuantity,
  //     }));
  //   }
  // };

  const handleQuantityChange = (year, quantity) => {
    const parsedQuantity = Number(quantity);
    const yearItem = cartItems[0].years.find((y) => y.year === year);
  
    if (!yearItem) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [year]: "Year not found in cart items.",
      }));
      return;
    }
  
    if (parsedQuantity < 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [year]: `Quantity cannot be less than 0.`,
      }));
    } else if (parsedQuantity > yearItem.available) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [year]: `Please enter a quantity between 0 and ${yearItem.available}.`,
      }));
    } else {
      setErrors((prevErrors) => {
        const { [year]: removedError, ...rest } = prevErrors;
        return rest;
      });
  
      // Update both quantityMap and cartItems
      setQuantityMap((prev) => ({
        ...prev,
        [year]: parsedQuantity,
      }));
  
      setCartItems((prev) => {
        const updatedYears = prev[0].years.map((item) => 
          item.year === year ? { ...item, quantity: parsedQuantity } : item
        );
        return [{ ...prev[0], years: updatedYears }];
      });
    }
  };


  const handleClearYear = () => {
    setQuantityMap((prev) => ({
      ...prev,
      [selectedVintageYear]: 0,
    }));
  };

  const handleUpdateCart = async () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Invalid Quantities in Cart.", {
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
      items: cartItems[0]?.years
        .map((yearItem) => ({
          project_id: projectCode,
          vintage_year: yearItem.year,
          quantity: quantityMap[yearItem.year] || 0,
        }))
        .filter((item) => item.quantity > 0), // Filter items with quantity > 0
    };
    try {
      const res = await axios.post(`${apiUrl}cart-item/`, cartPayload);
      if (res) {
        fetchCartItems(cartId);
        toast.success("Cart Successfully Updated", {
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
        onClose();
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      toast.error("Cart Update Error", {
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

  // Handle buy cart submission
  const handleBuyCart = async () => {
    if (Object.keys(errors).length > 0) {
      toast.error("Invalid Quantities in Cart", {
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
      items: cartItems[0]?.years?.map((yearItem) => ({
        project_id: projectCode,
        vintage_year: yearItem.year,
        quantity: quantityMap[yearItem.year] || 0,
      })),
    };
    try {
      const res = await axios.post(`${apiUrl}cart-item/`, cartPayload);
      if (res) {
        fetchCartItems(cartId);
        navigate("/marketplace/cart");
        onClose();
      }
    } catch (error) {
      console.error("Error buying cart:", error);
      toast.error("Purchase Error", {
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

  const handleVintageYearChange = (e) => {
    setSelectedVintageYear(e.target.value);
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
          <>
            <Loader />
          </>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div>
                <div className="text-2xl mb-2 font-semibold">{projectName}</div>
                <div className="text-[#1D1F2199] mb-1">
                  Enter required{" "}
                  {(filter_project_type ?? "CarbonCredits") === "CarbonCredits"
                    ? " Tonnes"
                    : "MWh"}{" "}
                  under each vintage you’d like to purchase.
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

              <div className="mb-4 mt-5">
                <label
                  htmlFor="vintage-year"
                  className="block text-gray-700 mb-2"
                >
                  Vintage Year
                </label>
                <select
                  id="vintage-year"
                  value={selectedVintageYear}
                  onChange={handleVintageYearChange}
                  className="block w-full border border-gray-400 rounded p-2"
                >
                  {cartItems[0]?.years?.map((yearItem) => (
                    <option key={yearItem.year} value={yearItem.year}>
                      {yearItem.year}
                    </option>
                  ))}
                </select>
              </div>

              {cartItems?.map((item, index) => (
                <div key={index} className="mb-4">
                  {cartItems[0]?.years
                    .filter((yearItem) => yearItem.year == selectedVintageYear)
                    ?.map((yearItem, yearIndex) => {
                      const totalYear = yearItem.quantity * yearItem.price;
                      const totalYearStr = totalYear.toLocaleString(
                        "fullwide",
                        {
                          useGrouping: false,
                        }
                      );
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
                                      Price/{" "}
                                      {(filter_project_type ??
                                        "CarbonCredits") === "CarbonCredits"
                                        ? " Tonnes"
                                        : "MWh"}
                                    </div>
                                    <div className="text-black text-base md:text-lg">
                                      {(
                                        yearItem.price / getDecimalsData
                                      ).toLocaleString("fullwide", {
                                        useGrouping: false,
                                      })}{" "}
                                      USD
                                    </div>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <div className=" text-[#1D1F2199] text-sm md:text-base">
                                      Available
                                    </div>
                                    <div className="text-black text-base md:text-lg">
                                      {yearItem.available -
                                        (quantityMap[yearItem.year] || 0)}{" "}
                                      {(filter_project_type ??
                                        "CarbonCredits") === "CarbonCredits"
                                        ? " Tonnes"
                                        : "MWh"}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleClearYear()}
                                  className="bg-[#1D1F2199] text-white p-1 rounded-lg"
                                >
                                  <Delete />
                                </button>
                              </div>
                              <div className="mt-6 flex justify-between items-center">
                                <div className="md:w-[250px]">
                                  <Input
                                    variant="outlined"
                                    label={`Enter required ${
                                      (filter_project_type ??
                                        "CarbonCredits") === "CarbonCredits"
                                        ? " Tonnes"
                                        : "MWh"
                                    }`}
                                    type="number"
                                    className="text-xs md:text-sm"
                                    value={
                                      quantityMap[yearItem.year] === 0
                                        ? ""
                                        : quantityMap[yearItem.year]
                                    }
                                    onFocus={(e) => {
                                      if (e.target.value === "0") {
                                        e.target.value = "";
                                      }
                                    }}
                                    onBlur={(e) => {
                                      if (e.target.value === "") {
                                        e.target.value = 0;
                                      }
                                    }}
                                    onChange={(e) => {
                                      const value =
                                        e.target.value === ""
                                          ? 0
                                          : Number(e.target.value);
                                      handleQuantityChange(
                                        yearItem.year,
                                        value
                                      );
                                    }}
                                    error={!!errors[yearItem.year]}
                                    success={!errors[yearItem.year]}
                                  />
                                </div>
                                <div>
                                  {(
                                    (yearItem.price *
                                      (quantityMap[yearItem.year] || 0)) /
                                    getDecimalsData
                                  ).toLocaleString("fullwide", {
                                    useGrouping: false,
                                  })}{" "}
                                  USD
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
                      {calculateTotalCost(cartItems, getDecimalsData)} USD
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="text-[#1D1F2199] text-sm md:text-base">
                      Total{" "}
                      {(filter_project_type ?? "CarbonCredits") ===
                      "CarbonCredits"
                        ? " Tonnes"
                        : "MWh"}
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
                  Add to Cart
                </button>
                <button
                  className="bg-[#CDDC6E] text-black px-4 py-2 rounded-lg"
                  onClick={handleBuyCart}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddToCartDrawer;
