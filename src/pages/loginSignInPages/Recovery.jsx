import { useAppKit } from "@reown/appkit/react";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Button, Card, Typography } from "@material-tailwind/react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import loginIMG from "../../assets/loginpic.jpg"
import { UserContext } from "../../context/UserContext";
const Recovery = () => {
  const { hasAddress } = useContext(UserContext);
  // const { address } = useAccount();
  const queryParams = new URLSearchParams(location.search);
  const market = queryParams.get("market") || "market-place";
  // const apiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = "https://api.hestiya.com/api/"
  const navigate = useNavigate();

  const handleRecover = async () => {
    try {
      const response = await axios.post(`${apiUrl}user-signup/activate-user/`, {
        address:hasAddress,
      });
      if (response.status === 200) {
        // console.log("res 454", response);
        toast.success("Account Successfully Recovered");
        if (market === "market-place") {
          navigate(`/marketplace?market=${market}`);
        } else if (market === "ocean-market") {
          navigate(`/ocean?market=${market}`);
        }
        return;
      }
    } catch (error) {
      toast.error("Account Recovery Failed");
      console.error("Error during account recovery:", error);
    }
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-68px)]">
        {/* Left side with image (hidden on smaller screens) */}
        <div
          className="hidden md:flex w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: market === "market-place" ?
              `url(${loginIMG})`: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          }}
        >
          {/* Image placeholder */}
        </div>

        {/* Right side with login form */}
        <div className="hidden md:flex w-full md:w-1/2 items-center justify-center p-8">
          <Card className="w-full max-w-md p-8">
            <Typography
              variant="h4"
              color="blue-gray"
              className="text-center mb-4"
            >
              Welcome to Hestiya
            </Typography>
            <form>
              <Button
                fullWidth
                onClick={handleRecover}
                className="!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80"
              >
                Recover Account
              </Button>
            </form>
          </Card>
        </div>
        {/* Right side with login form with background img */}
        <div className="flex md:hidden bg-cover bg-center w-full md:w-1/2 items-center justify-center p-8"
          style={{
            backgroundImage: market === "market-place" ?
              `url(${loginIMG})` : 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          }}
        >
          <Card className="w-full max-w-md p-8">
            <Typography
              variant="h4"
              color="blue-gray"
              className="text-center mb-4"
            >
              Welcome to Hestiya
            </Typography>
            <form>
              <Button
                fullWidth
                onClick={handleRecover}
                className="!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80"
              >
                Recover Account
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Recovery;
