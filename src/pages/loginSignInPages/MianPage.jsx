import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Typography } from "@material-tailwind/react";
import { UserContext } from "../../context/UserContext";
import loginIMG from "../../assets/loginpic.jpg"
const MianPage = () => {
  const navigate = useNavigate();
  const { setUserDetails, setHasAddress, setHasToken, hasAddress } =
    useContext(UserContext);
  const handleNavigation = (type) => {
    setUserDetails(null);
    setHasAddress("");
    setHasToken(null);
    navigate(`/sign-in/?market=${type}`);
  };
  return (
    <>
      {/* <div className="flex flex-col  md:flex-row min-h-[calc(100vh-60px)]">
        
        <div
          className="flex w-full md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://plus.unsplash.com/premium_photo-1676485163992-4cc18ef56c9e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          }}
        >
          <div className=" w-full justify-center h-[calc(50vh-30px)] md:h-[calc(100vh-60px)] items-center flex bg-white/10 backdrop-blur-[2px] shadow-lg">
            <Button
              className="!bg-darkgreen mb-4 w-fit !text-white !hover:bg-opacity-80"
              onClick={() => handleNavigation("market-place")}
            >
              Marketplace
            </Button>
          </div>
        </div>
        <div
          className="flex w-full md:w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          }}
        >
          <div className=" w-full justify-center h-[calc(50vh-30px)] md:h-[calc(100vh-60px)] items-center flex bg-white/10 backdrop-blur-[2px] shadow-lg">
            <Button
              className="!bg-darkgreen mb-4 w-fit !text-white !hover:bg-opacity-80"
              onClick={() => handleNavigation("ocean-market")}
            >
              Ocean Market
            </Button>
          </div>
        </div>
      </div> */}

      <div
        // className={`flex ${
        //   market === "market-place" ? "flex-row-reverse" : "flex-row"
        // }  min-h-[calc(100vh-60px)]`}
        className={`flex min-h-[calc(100vh-68px)]`}
      >
        {/* Left side with image (hidden on smaller screens) */}
        <div
          className="hidden md:flex w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              // 'url("https://plus.unsplash.com/premium_photo-1676485163992-4cc18ef56c9e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
              `url(${loginIMG})`
          }}
        >
          {/* Image placeholder */}
        </div>

        {/* Right side with login form */}
        <div className="hidden md:flex md:w-1/2 items-center justify-center p-8">
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
                className="!bg-darkgreen mb-4  !text-white !hover:bg-opacity-80"
                onClick={() => handleNavigation("market-place")}
              >
                Marketplace
              </Button>
            </form>
          </Card>
        </div>
        {/* with imgh  */}
        <div
          className="md:hidden flex w-full bg-cover bg-center items-center justify-center p-8"
          style={{
            backgroundImage:
              `url(${loginIMG})`
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
                className="!bg-darkgreen mb-4  !text-white !hover:bg-opacity-80"
                onClick={() => handleNavigation("market-place")}
              >
                Marketplace
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default MianPage;
