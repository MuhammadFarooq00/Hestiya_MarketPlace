import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation , useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx"; // Import RxCross2 for the close icon
import { ReactComponent as LogoImg } from "../assets/svg/hestiya-without-text.svg";


const Layout = () => {
  const { address } = useAccount();
  const { open } = useAppKit();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const location = useLocation();
  const isOtpPage = location.pathname.includes("otp");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // useEffect(()=>{
  //   if(!address){
  //       navigate("/")
  //   }
  // },[address])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <nav className="flex justify-between items-center px-6 py-4 bg-darkgreen text-white shadow-md">
        {/* Left Side: Logo */}
        <div>
      {isOtpPage ? (
        <span className="text-xl gap-1 flex items-center font-logo font-semibold opacity-50 cursor-not-allowed">
          <LogoImg className="w-5" />
          Hestiya
        </span>
      ) : (
        <Link to={"/marketplace"} className="text-xl gap-1 flex items-center font-logo font-semibold">
          <LogoImg className="w-5" />
          Hestiya
        </Link>
      )}
    </div>

        {/* Center: Menus */}
        {/* <div className="hidden md:flex gap-6">
          {menus.map((menu) => (
            <Link
              key={menu.name}
              to={menu.path}
              className={`text-base font-medium text-white rounded-lg duration-300 px-2 py-1 hover:bg-black ${
                location.pathname === menu.path ? "bg-black " : ""
              }`} // Add active menu border-bottom
              onClick={() => setMenuOpen(false)} // Auto-hide on menu click
            >
              {menu.name}
            </Link>
          ))}
        </div> */}

        {/* Right Side: Login/Logout */}
        <div className="flex items-center gap-4">
          {/* Toggle Menu Icon */}
          {/* {["/", "/sign-in","/sign-in/?market=market-place", "/choice-method", "/sign-detail", "/recovery", "/otp"].includes(window.location.pathname) || window.location.pathname !== "/" && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-2xl"
            >
              {menuOpen ? <RxCross2 /> : <RxHamburgerMenu />}{" "}
            </button>
          )} */}
          {address && (
            <button
              onClick={() => open()}
              className=" block px-4 py-2 border rounded-md text-base font-semibold"
            >
              {address
                ? `${address.slice(0, 4)}...${address.slice(-4)}`
                : "Login"}
            </button>
          )}
        </div>
      </nav>

      {/* Responsive Mobile Menu */}
      {menuOpen && (
        <div ref={menuRef} className="md:hidden bg-darkgreen shadow-md">
          {/* {menus.map((menu) => (
            <Link
              key={menu.name}
              to={menu.path}
              className={`block px-6 py-2 text-white ${
                location.pathname === menu.path ? "bg-black" : ""
              }`} // Add active menu border-bottom for mobile
              onClick={() => setMenuOpen(false)} // Auto-hide on menu click
            >
              {menu.name}
            </Link>
          ))} */}
          {address && (
            <button
              onClick={() => open()}
              className="block md:hidden ml-6 mt-3 px-6 py-2 border rounded-md text-base text-white mb-4 font-semibold "
            >
              {address
                ? `${address.slice(0, 4)}...${address.slice(-4)}`
                : "Login"}
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
