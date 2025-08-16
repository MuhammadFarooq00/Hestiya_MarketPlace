import { useAppKit } from "@reown/appkit/react";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { UserContext } from "../../context/UserContext";

import { Button, Card, Typography } from "@material-tailwind/react";
import Loader from "../../components/loaders/Loader";
import { useFormik } from "formik";
import { loginInitialValues, loginValidationSchema } from "../../validationDataTypes";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import loginIMG from "../../assets/loginpic.jpg"

const SignIn = () => {
  const { address } = useAccount();
  const { open } = useAppKit();
  // const apiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = "https://api.hestiya.com/api/"
  console.log(apiUrl)

  const navigate = useNavigate();
  const { setUserDetails, setHasAddress, setHasToken,hasAddress } = useContext(UserContext);
  const location = useLocation();
  const [loading, setLoading] = useState(true); // Loading state
  const [userAddress, setUserAddress] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const [userName, setUserName] = useState("");
  const market = queryParams.get("market") || "market-place";
  const [isError, setIsError] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const [isResetClick, setIsResetClick] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  // const {accountAddress} = useAccount();
  const from = location.state?.from?.pathname || "/marketplace";
  const CheckSignUpDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}signup-detail/${address ?? hasAddress}`);
      // console.log("res", res.data);
      if (res) {
        setUserDetails(res.data);
        const name =
          res.data?.first_name && res.data?.last_name
            ? `${res.data.first_name} ${res.data.last_name}`
            : res.data?.first_name || res.data?.last_name
            ? res.data.first_name || res.data.last_name
            : `${userAddress.slice(0, 4)}...${userAddress.slice(-4)}`;

        console.log(name);
        setUserName(name);

        if (market === "market-place") {
          const from = location.state?.from || `/marketplace?market=${market}`;
          // console.log("from:", from);
          navigate(from);
        } else if (market === "ocean-market") {
          // console.log("ocean-market");
          navigate("/ocean");
        }
      }
    } catch (error) {
      ("No CustomUser matches the given query.");
      if (
        error.response?.data?.detail ===
        "No SignupDetail matches the given query."
      ) {
        navigate(`/choice-method?market=${market}`);
      } else if (
        error?.response?.data?.message ===
        "Please verify your OTP before proceeding"
      ) {
        error?.response?.data?.email;
        navigate(`/otp?market=${market}&email=${error?.response?.data?.email}`);
      } else {
        console.error("Error fetching sign-up details.", error?.response?.data);
        toast.error("Error Retrieving Sign-Up Details");
      }
    }  finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address || hasAddress) {
      setUserAddress(address ?? hasAddress);
      // CheckSignUpDetail();
    } else {
      setLoading(false);
    }
  }, [hasAddress, address]);

  const fetchData = async () => {
    try {
      const response = await axios.post(`${apiUrl}user-signup/`, {
        wallet_address: address ?? hasAddress,
        user_type: "client",
      });
      if (response) {
        CheckSignUpDetail();
      }
      // console.log("user sign in response", response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    // use this api if user doest exist in DB
    // check user call by get api user signup
    if (address || hasAddress) {
      const checkUserExist = async () => {
        try {
          const response = await axios.get(
            `${apiUrl}user-signup/${address ?? hasAddress}`
          );
          // console.log("user sign in response", response.data);
          if (!response.data.is_active) {
            navigate(`/recovery?market=${market}`);
          } else {
            CheckSignUpDetail();
          }
          // if (response) {
          // }
        } catch (error) {
          console.error("error", error.response.data);
          if (
            error.response.data.detail ===
            "No CustomUser matches the given query."
          ) {
            fetchData();
          }
          if (
            error.response.data.detail ===
            "No CustomUser matches the given query."
          ) {
            navigate(`/recovery?market=${market}`);
          }
          console.error(
            "Error fetching User sign in data",
            error.response.data.detail
          );
        }
      };
      checkUserExist();
    }
  }, [address,hasAddress]);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    setErrors,
    handleSubmit,
    
    setFieldValue,
    isSubmitting,
  } = useFormik({
    initialValues: loginInitialValues,
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsError("");
        const response = await axios.post(`${apiUrl}login/`, values);
        if (response) {
          // console.log("user sign in response", JSON.stringify(response?.data));
          setUserAddress(response?.data?.address);
          localStorage.setItem("token", JSON.stringify(response?.data));
        setHasAddress(response?.data?.address);
        setHasToken(response?.data);
        if(response?.data?.is_active){
          navigate(`/marketplace?market=market-place`, { replace: true });
        }else{
          navigate(`/recovery?market=${market}`);
        }
        }
      } catch (error) {
        const { response } = error;
      
        if (response?.data?.message) {
          const message = response.data.message.toString().toLowerCase();
          
          // Check for specific OTP message
          if (message.includes("verify your otp") && response.data.email) {
            const userEmail = encodeURIComponent(response.data.email);
            const baseUrl = window.location.origin; // Dynamically gets the current domain
            const redirectUrl = `${baseUrl}/otp?market=market-place&email=${userEmail}`;
            window.location.href = redirectUrl;
          } else {
            setIsError(response.data.message);
            // toast.error(response.data.message);
          }
        } else {
          console.error("Error fetching data:", error);
        }
      }
      
    }
  });

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}reset-password/`, {
        email: resetEmail,
      });
      if (response) {
        toast.success("Password reset link sent to your email");
        setResetSubmitting(false);
        setIsResetClick(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setResetSubmitting(false);
      setIsResetClick(false);
      toast.error("Error sending reset link");
    }
  };

  // const handleResetCancel = () => {
  //   setIsResetClick(false);
  //   setResetEmail("");
  //   setResetSubmitting(false);
  // };
  useEffect(() => {
    if(address || hasAddress){
      setHasAddress(address ?? hasAddress);
    }
  }
  , [address,hasAddress]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
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
              // market === "market-place"
              //   ? 'url("https://plus.unsplash.com/premium_photo-1676485163992-4cc18ef56c9e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")'
              //   : 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
            }}
          >
            {/* Image placeholder */}
          </div>

          {/* Right side with login form */}
          <div className="hidden md:flex w-full md:w-1/2 items-center justify-center p-8">
           {
            !isResetClick && (
              <Card className="w-full max-w-md p-8">
              <Typography
                variant="h4"
                color="blue-gray"
                className="text-center mb-4"
              >
                Welcome to Hestiya
              </Typography>
       
                   <form onSubmit={handleSubmit}  className="space-y-4">
                   <div>
                <label className="block text-sm font-medium mb-1">
                  Email<span className="text-red-500"> *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.email && errors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password<span className="text-red-500"> *</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full p-2 border rounded-md ${
                      touched.password && errors.password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <FiEye className="text-gray-600" />
                    ) : (
                      <FiEyeOff className="text-gray-600" />
                    )}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              {isError && <p className="text-sm text-red-600">{isError}</p>}
              <Button
                type="submit"
                fullWidth
                className="!bg-darkgreen my-4 !text-white !hover:bg-opacity-80"
              >
                Login
              </Button>
             
              
                   </form>
                   <Typography className="text-center flex items-center justify-center flex-wrap mt-2">
                Forgot your password?{" "}
                <button
                  onClick={() => setIsResetClick(true)}
                  className="text-green-900 ms-2 underline"
                >
                 {" "} Reset Password
                </button>
              </Typography>
              <div className="flex items-center mt-4">
                <div className="border-b border-gray-300 w-full" />
                <p className="mx-4 text-gray-500">or</p>
                <div className="border-b border-gray-300 w-full" />
              </div>
                 
              <form>
                <Button
                  fullWidth
                  onClick={() => open()}
                  className="!bg-darkgreen my-4 !text-white !hover:bg-opacity-80"
                >
                  {userName
                    ? userName
                    : userAddress
                    ? `${userAddress.slice(0, 4)}...${userAddress.slice(-4)}`
                    : "Continue With Wallet"}
                </Button>
              </form>
              <Typography className="text-center">
                Don’t have an account?{" "}
                <Link
                  to={`/choice-method?market=${market}`}
                  className="text-green-900"
                >
                  Register
                </Link>
              </Typography>
              <Typography className="text-center flex items-center justify-center">
                <Link
                  to={`/private-policies?market=${market}`}
                  className="text-black flex items-center underline"
                >
                  Terms & Conditions
                  <FiArrowRight className="ml-1 text-sm" />
                </Link>
              </Typography>
            </Card>
            )
           }
           {
            isResetClick && (
              <Card className="w-full max-w-md p-8">
              <Typography
                variant="h4"
                color="blue-gray"
                className="text-center mb-4"
              >
                Reset Password
              </Typography>
              <form onSubmit={handleResetSubmit}  className="space-y-4">
                  <div>
                <label className="block text-sm font-medium mb-1">
                  Email<span className="text-red-500"> *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={`w-full p-2 border rounded-md`}
                />
              </div>
              <Button
                type="submit"
                fullWidth
                className="!bg-darkgreen my-4 !text-white !hover:bg-opacity-80"
              >
                Reset Password
              </Button>
              </form>
            </Card>
            )
          }
          </div>
          {/* Right side with login form with backgroun img */}
          <div
            className="flex md:hidden w-full bg-cover bg-center items-center justify-center p-8"
            style={{
              backgroundImage:
                // 'url("https://plus.unsplash.com/premium_photo-1676485163992-4cc18ef56c9e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
                `url(${loginIMG})`,
              // market === "market-place"
              //   ? 'url("https://plus.unsplash.com/premium_photo-1676485163992-4cc18ef56c9e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")'
              //   : 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
            }}
          >
          {
            !isResetClick && (
              <Card className="w-full max-w-md p-8">
              <Typography
                variant="h4"
                color="blue-gray"
                className="text-center mb-4"
              >
                Welcome to Hestiya
              </Typography>
              <form onSubmit={handleSubmit}  className="space-y-4">
                   <div>
                <label className="block text-sm font-medium mb-1">
                  Email<span className="text-red-500"> *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.email && errors.email
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password<span className="text-red-500"> *</span>
                </label>
                <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.password && errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <FiEye className="text-gray-600" />
                  ) : (
                    <FiEyeOff className="text-gray-600" />
                  )}
                </button>
              
              </div>
              {touched.password && errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
              </div>
              {isError && <p className="text-sm text-red-600">{isError}</p>}
              <Button
                type="submit"
                fullWidth
                className="!bg-darkgreen my-4 !text-white !hover:bg-opacity-80"
              >
                Login
              </Button>
              
              
                   </form>
                   <Typography className="text-center flex items-center justify-center flex-wrap mt-2">
                Forgot your password?{" "}
                <button
                  onClick={() => setIsResetClick(true)}
                  className="text-green-900 ms-2 underline"
                >
                 {" "} Reset Password
                </button>
              </Typography>
              
              <div className="flex items-center my-4">
                <div className="border-b border-gray-300 w-full" />
                <p className="mx-4 text-gray-500">or</p>
                <div className="border-b border-gray-300 w-full" />
              </div>
              <form>
                <Button
                  fullWidth
                  onClick={() => open()}
                  className="!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80"
                >
                  {userName
                    ? userName
                    : userAddress
                    ? `${userAddress.slice(0, 4)}...${userAddress.slice(-4)}`
                    : "Continue With Wallet"}
                </Button>
              </form>
              <Typography className="text-center">
                Don’t have an account?{" "}
                <Link
                  to={`/choice-method?market=${market}`}
                  className="text-green-900"
                >
                  Register
                </Link>
              </Typography>
              <Typography className="text-center flex items-center justify-center">
                <Link
                  to={`/private-policies?market=${market}`}
                  className="text-black flex items-center underline"
                >
                  Terms & Conditions
                  <FiArrowRight className="ml-1 text-sm" />
                </Link>
              </Typography>
            </Card>
            )
          }
          {
            isResetClick && (
              <Card className="w-full max-w-md p-8">
              <Typography
                variant="h4"
                color="blue-gray"
                className="text-center mb-4"
              >
                Reset Password
              </Typography>
              <form onSubmit={handleResetSubmit}  className="space-y-4">
                  <div>
                <label className="block text-sm font-medium mb-1">
                  Email<span className="text-red-500"> *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className={`w-full p-2 border rounded-md`}
                />
              </div>
              <Button
                type="submit"
                fullWidth
                className="!bg-darkgreen my-4 !text-white !hover:bg-opacity-80"
              >
                Reset Password
              </Button>
              </form>
            </Card>
            )
          }
          </div>
        </div>
      )}
    </>
  );
};

export default SignIn;
