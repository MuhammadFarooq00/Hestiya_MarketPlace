import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Typography } from "@material-tailwind/react";
import loginIMG from "../../assets/loginpic.jpg"
const Method = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const market = queryParams.get("market") || "market-place";

  const navigate = useNavigate();
  const handleNavigation = (type) => {
    navigate(`/sign-detail?type=${type}&market=${market}`);
  };
  return (
    <>
      <div className="flex min-h-[calc(100vh-68px)]">
        {/* Left side with image (hidden on smaller screens) */}
        <div
          className="hidden md:flex w-1/2 bg-cover bg-center"
          style={{
            backgroundImage: market === "market-place" ?
              `url(${loginIMG})` : 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          }}
        >
          {/* Image placeholder */}
        </div>

        {/* Right side with login form */}
        <div className="hidden md:flex  md:w-1/2 items-center justify-center p-8">
          <Card className="w-full max-w-md p-8">
            <Typography
              variant="h4"
              color="blue-gray"
              className="text-center mb-4"
            >
              Select Your Registration Type
            </Typography>
            <form>
              <Button
                fullWidth
                className="!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80"
                onClick={() => handleNavigation("Individual")}
              >
                Individual
              </Button>
              <Button
                fullWidth
                className="!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80"
                onClick={() => handleNavigation("Company")}
              >
                Company
              </Button>
            </form>
          </Card>
        </div>
        {/* Right side with login form with backgroun img*/}
        <div className="flex w-full md:hidden bg-cover bg-center items-center justify-center p-8"
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
              Select Your Registration Type
            </Typography>
            <form>
              <Button
                fullWidth
                className="!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80"
                onClick={() => handleNavigation("Individual")}
              >
                Individual
              </Button>
              <Button
                fullWidth
                className="!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80"
                onClick={() => handleNavigation("Company")}
              >
                Company
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Method;
