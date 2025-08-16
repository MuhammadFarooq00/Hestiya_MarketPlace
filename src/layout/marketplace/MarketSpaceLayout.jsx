/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as MarketIcon } from "../../assets/svg/market-sideBar-icon.svg";
// import { ReactComponent as MarketIcon } from "../assets/svg/market-sideBar-icon.svg";
import { ReactComponent as CartIcon } from "../../assets/svg/cart-sideBar-icon.svg";
import { ReactComponent as HoldingsIcon } from "../../assets/svg/holding-sideBar-icon.svg";
import { ReactComponent as TradingIcon } from "../../assets/svg/trading-sideBar-icon.svg";
import { ReactComponent as HistoryIcon } from "../../assets/svg/activity-History-sideBar-icon.svg";
import { ReactComponent as LeftArrowIcon } from "../../assets/svg/slider-left-arrow.svg";
import { ReactComponent as TopBarMenuIcon } from "../../assets/svg/topBar-menu-fold-line.svg";
import { ReactComponent as ShoppingIcon } from "../../assets/svg/shopping-basket-line.svg";
import { RxHamburgerMenu } from "react-icons/rx";
import { RiQuestionnaireLine } from "react-icons/ri";
import { BsQuestionCircle, BsShieldFill } from "react-icons/bs";

import { BiMessageRoundedDetail } from "react-icons/bi";

// import { FaRegUser } from "react-icons/fa";
import LogoImg  from "../../assets/images/hestiya.png";
import Drawer from "./Drawers/Drawer";
import { useAppKit } from "@reown/appkit/react";
import {
  SidebarContext,
  SidebarProvider,
} from "../../context/SidebarContext.jsx";
// import { useAccount } from "wagmi";
import axios from "axios";
import { UserContext } from "../../context/UserContext.jsx";
import ProfileMenu from "./ProfileMenu.jsx";
import { toast } from "react-toastify";

const menuItems = [
  { name: "Market", path: "/marketplace", Icon: MarketIcon },
  { name: "Cart", path: "/marketplace/cart", Icon: CartIcon },
  { name: "Portfolio", path: "/marketplace/portfolio", Icon: HoldingsIcon },
  { name: "P2P Trading", path: "/marketplace/P2P-trading", Icon: TradingIcon },
  { name: "Activity History", path: "/marketplace/history", Icon: HistoryIcon },
  // { name: "Hestiya Registory", path: "/hestiya-registory", Icon: BiMessageRoundedDetail },
  // { name: "FAQs", path: "/marketplace/faq", Icon: BsQuestionCircle },
];

const MarketSpaceLayout = () => {
  const { setUserDetails, cartItemsNumber,hasAddress } = useContext(UserContext);
  // const { address: accountAddress } = useAccount();
  // const [getaddress, setaddress] = useState("");
const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // console.log("con::", address);
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  // const { open } = useAppKit();
  const isActive = (path) => location.pathname === path;
  const toastCounts = React.useRef({});
  // const apiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = "https://api.hestiya.com/api/"

  // const [userAddress, setUserAddress] = useState(address);
  const CheckSignUpDetail = async () => {
    try {
      const res = await axios.get(`${apiUrl}signup-detail/${hasAddress}`);
      // console.log("res", res.data);
      if (res) {
        setUserDetails(res.data);
        // const currentPath = location.pathname;

        // if (currentPath && currentPath !== "/") {
        //   navigate(currentPath);
        // } else {
        //   navigate("/");
        // }
      }
    } catch (error) {
      if (
        error.response?.data?.detail ===
        "No SignupDetail matches the given query."
      ) {
        navigate(`/choice-method`);
      } else if (
        error?.response?.data?.message ===
        "Please verify your OTP before proceeding"
      ) {
        error?.response?.data?.email;
        navigate(`/otp?email=${error?.response?.data?.email}`);
      } else {
        console.error("Error fetching sign-up details.", error?.response?.data);
        toast.error("Sign-Up Details Error");
      }
    }
  };

  useEffect(() => {

    // const addressFromLocalStorage =   JSON.parse(localStorage.getItem("token"))?.address;
    // const hasAddress = accountAddress || addressFromLocalStorage;
    // setaddress(hasAddress);
    if (hasAddress) {
      // console.log("hasAddress in useeffect", hasAddress);
      CheckSignUpDetail();
    }
  }, [hasAddress]);

  const handleNavigation = (targetPath) => {
    if (location.pathname === targetPath) {
      // Initialize count for this path if it doesn't exist
      if (!toastCounts.current[targetPath]) {
        toastCounts.current[targetPath] = 0;
      }
      
      // Only show toast if count is less than 4
      if (toastCounts.current[targetPath] < 4) {
        toast("Already On This Page");
        toastCounts.current[targetPath] += 1;
        
        // Reset count after 5 minutes (300000ms) for this path
        setTimeout(() => {
          toastCounts.current[targetPath] = 0;
        }, 300000);
      }
    } else {
      navigate(targetPath);
    }
  };


  const openTalkToUs = () => {
    window.open(
      "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1ai9jKHkjZhwSU7M8YWn1AbLGnnYCBa8S-7lKwkdOC4qoNRENkUjEPapAScvhvZ_cnnJDGah-N",
      "_blank"
    );
  };


  useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (!mobile && drawerOpen) {
      setDrawerOpen(false);
    }
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [drawerOpen]);

  return (
    <SidebarProvider>
      <section className="flex min-h-screen  font-sans">
        <SidebarContext.Consumer>
          {({ sidebarWidth, toggleSidebar }) => (
            <>
              {/* side bar  */}
              <div
                className={`fixed left-0 top-0 h-screen px-6 pt-6 hidden lg:flex flex-col text-black duration-500 ${sidebarWidth} ${
                  sidebarWidth === "w-24" ? "bg-darkgreen" : "bg-[#FBFBFB]"
                }`}
              >
                {/* logo */}
                <div
                  className={`flex items-center ${
                    sidebarWidth === "w-24"
                      ? "justify-center"
                      : "justify-between"
                  }`}
                >
                  <Link
                    to={"/marketplace"}
                    className={`text-[28px] gap-1.5 font-logo flex items-center font-semibold leading-8 ${
                      sidebarWidth === "w-24" ? "hidden" : ""
                    } `}
                  >
                    <img
                      src={LogoImg}
                      alt="logo"
                      className={`w-16 h-auto ${
                        sidebarWidth === "w-24" ? "hidden" : ""
                      }`}
                    />
                    Hestiya
                  </Link>
                  {/* arrow icon  */}
                  <LeftArrowIcon
                    className={` text-white w-6 h-6 mt-2 cursor-pointer transition-transform ${
                      sidebarWidth === "w-24"
                        ? "rotate-180 !text-white"
                        : "!text-[#1D1F21]"
                    }`}
                    onClick={toggleSidebar}
                  />
                  {/* arrow icon  */}
                </div>
                {/* logo */}

                {/* menu  */}
                <div className="flex flex-col h-[calc(100vh-100px)] mt-8">
                  <div
                    className={`flex-1 overflow-y-auto ${
                      sidebarWidth === "w-24" ? "sidebar-div2" : "sidebar-div"
                    } relative flex flex-col max-h-[700px]`}
                  >
                    <div className="flex flex-col gap-3 pb-4">
                      {menuItems.map(({ name, path, Icon }) => (
                        <button
                          key={path}
                          onClick={() => handleNavigation(path)}
                          // to={path}
                          className={`rounded-[20px] flex gap-3 items-center ${
                            isActive(path)
                              ? sidebarWidth === "w-24"
                                ? "text-black"
                                : "bg-[#E7E8E7] text-darkgreen text-xl leading-[30px]"
                              : sidebarWidth === "w-24"
                              ? "text-white"
                              : "text-[#1D1F2199] text-base leading-6"
                          } ${
                            sidebarWidth === "w-24"
                              ? "py-0 px-3"
                              : "py-3 px-3.5 hover:bg-[#E7E8E7] hover:text-darkgreen"
                          }`}
                          title={sidebarWidth === "w-24" ? name : ""}
                        >
                          <Icon
                            className={`${
                              isActive(path)
                                ? "text-black"
                                : sidebarWidth === "w-24"
                                ? "text-white hover:text-black duration-200"
                                : "text-gray-600"
                            }`}
                          />
                          <p
                            className={`my-0 whitespace-pre duration-200 ${
                              sidebarWidth === "w-24" ? "hidden" : ""
                            }`}
                          >
                            {name}
                          </p>
                        </button>
                      ))}

                      <button
                        onClick={() => handleNavigation("/marketplace/hestiya-registory")}
                        className={`rounded-[20px] flex gap-3 items-center ${
                          location.pathname === "/marketplace/hestiya-registory"
                            ? sidebarWidth === "w-24"
                              ? "text-black"
                              : "bg-[#E7E8E7] text-darkgreen text-xl leading-[30px]"
                            : sidebarWidth === "w-24"
                            ? "text-white"
                            : "text-[#1D1F2199] text-base leading-6"
                        } ${
                          sidebarWidth === "w-24"
                            ? "py-0 px-3"
                            : "py-3 px-3.5 hover:bg-[#E7E8E7] hover:text-darkgreen"
                        }`}
                      >
                        <BiMessageRoundedDetail
                          className={`w-6 h-auto ${
                            location.pathname === "/marketplace/hestiya-registory"
                              ? "text-black"
                              : sidebarWidth === "w-24"
                              ? "text-white hover:text-black duration-200"
                              : "text-gray-600"
                          }`}
                        />
                        <p
                          className={`my-0 whitespace-pre duration-200 ${
                            sidebarWidth === "w-24" ? "hidden" : ""
                          }`}
                        >
                          Hestiya Logs
                        </p>
                      </button>

                      <button
                        onClick={() => handleNavigation("/marketplace/faq")}
                        className={`rounded-[20px] flex gap-3 items-center ${
                          location.pathname === "/marketplace/faq"
                            ? sidebarWidth === "w-24"
                              ? "text-black"
                              : "bg-[#E7E8E7] text-darkgreen text-xl leading-[30px]"
                            : sidebarWidth === "w-24"
                            ? "text-white"
                            : "text-[#1D1F2199] text-base leading-6"
                        } ${
                          sidebarWidth === "w-24"
                            ? "py-0 px-3"
                            : "py-3 px-3.5 hover:bg-[#E7E8E7] hover:text-darkgreen"
                        }`}
                      >
                        <BsQuestionCircle
                          className={`w-6 ml-[1px] h-auto ${
                            location.pathname === "/marketplace/faq"
                              ? "text-black"
                              : sidebarWidth === "w-24"
                              ? "text-white hover:text-black duration-200"
                              : "text-gray-600"
                          }`}
                        />
                        <p
                          className={`my-0 whitespace-pre duration-200 ${
                            sidebarWidth === "w-24" ? "hidden" : ""
                          }`}
                        >
                          FAQs
                        </p>
                      </button>
                      <button
                        onClick={() => handleNavigation("/marketplace/private-policies")}
                        className={`rounded-[20px] flex gap-3 items-center ${
                          location.pathname === "/marketplace/private-policies"
                            ? sidebarWidth === "w-24"
                              ? "text-black"
                              : "bg-[#E7E8E7] text-xl leading-[30px]"
                            : sidebarWidth === "w-24"
                            ? "text-white"
                            : " text-base leading-6"
                        } ${
                          sidebarWidth === "w-24"
                            ? "py-0 px-3"
                            : "py-3 px-3.5 hover:bg-[#E7E8E7] hover:text-darkgreen"
                        }`}
                      >
                        <BsShieldFill
                          className={`w-6 ml-[1px] h-auto ${
                            location.pathname === "/marketplace/private-policies"
                              ? ""
                              : sidebarWidth === "w-24"
                              ? "text-white duration-200"
                              : "text-gray-600"
                          }`}
                        />
                        <p
                          className={`my-0 whitespace-pre duration-200 ${
                            sidebarWidth === "w-24" ? "hidden" : ""
                          }`}
                        >
                          Privacy Policies
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Talk to Us button - Fixed at bottom */}
                  <div className="mt-auto ">
                    <button 
                      onClick={openTalkToUs}
                      className={`flex items-center mb-6 xl:mb-4  justify-center w-full h-12 text-center border-[3px] border-[#000000] rounded-md ${
                        sidebarWidth === "w-24" 
                          ? "text-white hover:bg-white hover:text-darkgreen" 
                          : "text-black hover:bg-[#E7E8E7]"
                      }`}
                    >
                      <RiQuestionnaireLine 
                        className={`w-6 ml-[1px] h-auto ${
                          sidebarWidth === "w-24" 
                            ? "text-white" 
                            : "text-gray-600"
                        }`} 
                      />
                      <p
                        className={`my-0 whitespace-pre duration-200 ${
                          sidebarWidth === "w-24" ? "hidden" : ""
                        }`}
                      >
                        Talk to Us
                      </p>
                    </button>
                  </div>
                </div>
                {/* menu  */}
              </div>
              {/* side bar  */}

              {/* top bar  */}
              <div
                className={`w-full overflow-auto ${
                  sidebarWidth === "w-24" ? "lg:ml-24" : "lg:ml-[268px]"
                }`}
              >
                <nav className="mx-6 my-4">
                  {/* {
                    hasAddress ? 
                    (
                      <> */}
                      <div className="relative flex items-center justify-between">
                    <div>
                      <RxHamburgerMenu
                        onClick={() => setDrawerOpen(true)}
                        className="cursor-pointer w-6 h-6 block lg:hidden"
                      />
                    </div>
                    <div className=" flex items-center gap-2 ">
                      <Link
                        to={"/marketplace/cart"}
                        className="border-[1px] relative rounded-md border-[#BDC3C7] hover:bg-[#BDC3C7] duration-200 p-1"
                      >
                        <ShoppingIcon className="relative" />
                        <span className="absolute font-semibold bottom-[-8px] left-[-10px] bg-orange-900 text-white rounded-full px-2 py-1 text-xs">
                          {cartItemsNumber}
                        </span>{" "}
                      </Link>
                      <ProfileMenu />
                    </div>
                  </div>
                      {/* </>
                    ):(

                      <div className="relative flex items-center justify-between">
                      <div>
                        <RxHamburgerMenu
                          onClick={() => setDrawerOpen(true)}
                          className="cursor-pointer w-6 h-6 block lg:hidden"
                        />
                      </div>
                        <button
                          onClick={() => handleNavigation("/sign-in")}
                          variant="outline"
                          className="text-black bg-[#CDDC6E] duration-200 font-semibold px-4 py-2 rounded-md"
                        >
                          Log in / Sign Up
                        </button>
                      </div>

                    )
                  } */}
                </nav>
                <div className="mt-6 lg:mb-6">
                  <Outlet />
                </div>
              </div>
              {/* top bar  */}
            </>
          )}
        </SidebarContext.Consumer>
        <Drawer
          open={drawerOpen}
          menus={menuItems}
          onClose={() => setDrawerOpen(false)}
          onOutsideClick={() => setDrawerOpen(false)}
        />
      </section>
    </SidebarProvider>
  );
};

export default MarketSpaceLayout;
