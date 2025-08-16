import React, { useEffect, useRef } from "react";
import { IoClose } from "react-icons/io5";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import { ReactComponent as LogoImg } from "../../../assets/svg/logoo.svg";
import LogoImg from "../../../assets/images/hestiya.png";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { BsQuestionCircle, BsShieldFill } from "react-icons/bs";
import { RiQuestionnaireLine } from "react-icons/ri";

const Drawer = ({ open, onClose, menus }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
 const drawerRef = useRef(null);
  const handleNavigation = (targetPath) => {
    if (location.pathname === targetPath) {
      toast("Already On This Page.");
    } else {
      navigate(targetPath);
      onClose();
    }
  };

  const openTalkToUs = () => {
    window.open(
      "https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1ai9jKHkjZhwSU7M8YWn1AbLGnnYCBa8S-7lKwkdOC4qoNRENkUjEPapAScvhvZ_cnnJDGah-N",
      "_blank"
    );
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);




  return (
    <div
      ref={drawerRef}
      className={`fixed top-0 left-0 z-50 sm:w-2/5 w-full h-full bg-darkgreen text-white shadow-lg transition-transform duration-300 transform ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <Link
          to={"/marketplace"}
          className="text-xl flex items-center font-semibold font-logo"
        >
          {/* <LogoImg /> */}
          <img
            src={LogoImg}
            alt="Hestiya Logo"
            className="w-10 h-10 rounded-full mr-4"
          />
          Hestiya
        </Link>
        <button onClick={onClose}>
          <IoClose className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable Menu Area */}
      <div className="flex flex-col h-[calc(100vh-80px)]">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-4">
            {/* Menu Items */}
            {menus.map(({ name, path, Icon }) => (
              <button
                key={path}
                onClick={() => handleNavigation(path)}
                className={`flex items-center rounded-[20px] p-4 ${
                  isActive(path)
                    ? "bg-gray-200 text-lg text-darkgreen"
                    : ""
                } hover:bg-gray-100 text-base hover:text-black`}
              >
                <Icon
                  className={`w-6 h-6 hover:text-black ${
                    isActive(path) ? "text-darkgreen" : ""
                  }`}
                />
                <span className="ml-3">{name}</span>
              </button>
            ))}

            {/* Additional Menu Items */}
            <button
              onClick={() => handleNavigation("/marketplace/hestiya-registory")}
              className={`flex items-center rounded-[20px] p-4 ${
                location.pathname === "/marketplace/hestiya-registory"
                  ? "bg-gray-200 text-lg text-darkgreen"
                  : "text-white"
              } hover:bg-gray-100 text-base hover:text-black`}
            >
              <BiMessageRoundedDetail
                className={`w-6 h-auto hover:text-black ${
                  location.pathname === "/marketplace/hestiya-registory"
                    ? "text-darkgreen"
                    : ""
                }`}
              />
              <span className="ml-3">Hestiya Logs</span>
            </button>

            <button
              onClick={() => handleNavigation("/marketplace/faq")}
              className={`flex items-center rounded-[20px] p-4 ${
                location.pathname === "/marketplace/faq"
                  ? "bg-gray-200 text-lg text-darkgreen"
                  : "text-white"
              } hover:bg-gray-100 text-base hover:text-black`}
            >
              <BsQuestionCircle
                className={`w-6 h-auto hover:text-black ${
                  location.pathname === "/marketplace/faq"
                    ? "text-darkgreen"
                    : ""
                }`}
              />
              <span className="ml-3">FAQs</span>
            </button>

            <button
              onClick={() => handleNavigation("/marketplace/private-policies")}
              className={`flex items-center rounded-[20px] p-4 ${
                location.pathname === "/marketplace/private-policies"
                  ? "bg-gray-200 text-lg text-darkgreen"
                  : "text-white"
              } hover:bg-gray-100 text-base hover:text-black`}
            >
              <BsShieldFill
                className={`w-6 h-auto hover:text-black ${
                  location.pathname === "/marketplace/private-policies"
                    ? "text-darkgreen"
                    : ""
                }`}
              />
              <span className="ml-3">Privacy Policies</span>
            </button>
          </div>
        </div>

        {/* Talk to Us Button - Fixed at Bottom */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={openTalkToUs}
            className="flex items-center justify-center w-full gap-3 h-12 text-center border-[3px] border-white rounded-md text-white hover:bg-white hover:text-darkgreen"
          >
            <RiQuestionnaireLine className="w-6 h-6" />
            <span>Talk to Us</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
