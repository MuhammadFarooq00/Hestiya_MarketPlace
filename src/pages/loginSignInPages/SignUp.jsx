import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import { toast } from "react-toastify";
import Select from "react-select";
import countryList from "react-select-country-list";
import "react-toastify/dist/ReactToastify.css";
import { useAccount } from "wagmi";
import axios from "axios";
import {
  signupInitialValues,
  signupValidationCompanySchema,
  signupValidationSchema,
} from "../../validationDataTypes/index.js";
import { useAppKit } from "@reown/appkit/react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button, Card, Typography } from "@material-tailwind/react";
import PhoneInput from "react-phone-input-2";
import { FiArrowRight, FiEye, FiEyeOff } from "react-icons/fi";
import loginIMG from "../../assets/loginpic.jpg"



const apiClient = axios.create({
  baseURL: "https://api.hestiya.com/api/",
  timeout: 10000,
});

const SignUp = () => {
  const { address } = useAccount();
  const { open, close } = useAppKit();
  // const apiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = "https://api.hestiya.com/api/"
  const countryOptions = countryList().getData();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");
  const market = queryParams.get("market") || "market-place";
  const [showPassword, setShowPassword] = useState(false);
   const [moveTop, setMoveTop] = useState(false);
  const navigate = useNavigate();
  const [userAddress, setUserAddress] = useState(address);

  // console.log("type123::::", type);

  const [industryOptions, setIndustryOptions] = useState(null);
  const [companySizeOptions, setCompanySizeOptions] = useState(null);

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = useFormik({
    initialValues: signupInitialValues,
    validationSchema:
      type === "Company"
        ? signupValidationCompanySchema
        : signupValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const {
          company_name,
          industry,
          company_size,
          first_name,
          last_name,
          email,
          mobile_no,
          country,
          profile_picture,
          gender,
        } = values;
        if (!country && type === "Company") {
          toast.error("Country Selection Required");
          return;
        }
        if (!isBusinessEmail(values.email)) {
          toast.error('Please use a business email address');
          return;
        }

        // if (!address) {
        //   toast.error("Connect Your Wallet");
        //   return;
        // }

        // Common FormData setup
        const formData = new FormData()
        formData.append("user", address);
        // formData.append("company_country_name", country.label);
        formData.append("first_name", first_name);
        formData.append("last_name", last_name);
        formData.append("email", email);
        formData.append("mobile_no", mobile_no);
        formData.append("signup_detail_type", type);
        
        if(gender){
          formData.append("gender", gender);
        } else {
          toast.error("Must select the gender");
          return;
        }
        

        if (values.password) {
       
          const strongRegex = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$",
          );
          if (!strongRegex.test(values.password)) {
            toast.error(
              "Password should contain at least 8 characters, one uppercase, one lowercase, one number and one special character"
            );
            return;
          }

          formData.append("password", values.password);
        } else if (address) {
          formData.append("user", address);
        } else {
          toast.error("Please provide a password or connect your wallet.");
          return;
        }

        if (country?.label === undefined) {
          formData.append("company_country_name", "");
          // console.log("country no");
        } else {
          // console.log("country", country?.label);
          formData.append("company_country_name", country.label);
        }

        if (type === "Company") {
          formData.append("industry", industry);
          formData.append("company_size", company_size);
          formData.append("company_name", company_name);
        } else if (type === "Individual") {
          formData.append("company_name", company_name);
        }

        if (profile_picture) {
          formData.append("profile_picture", profile_picture);
        }

        const res = await apiClient.post(
          address ? `${apiUrl}signup-detail/` : `${apiUrl}signup-detail/register-with-password/`,
          formData
        );
        // console.log("sign up detail response ", res);

        if (res) {
          setTimeout(() => {
            toast.success("OTP Sent Successfully");
            resetForm();
            navigate(`/otp?market=${market}&email=${email}`);
          }, 1000);
        }
      } catch (error) {
        console.error("error", error);

        if (error.response.data.message && error.response.data.message.email) {
          toast.error(error.response.data.message.email[0]);
        } else if (
          error.response.data.message &&
          error.response.data.message.mobile_no
        ) {
          toast.error("This number is already registered.");
        } else if (error.response.data.email){
              toast.error(error.response.data.email[0]);
            } else if (error.response.data.mobile_no){
              toast.error("This number is already registered.");
            
        } else{
          toast.error("Something Went Wrong");
        }
      }
    },
  });

  const fetchIndustry = async () => {
    try {
      const fetchData = await axios.get(`${apiUrl}industry/`);
      setIndustryOptions(fetchData.data);
      // console.log("fetchdata", fetchData);
    } catch (error) {
      console.error("error", error);
    }
  };
  const fetchCompanySize = async () => {
    try {
      const fetchData = await axios.get(`${apiUrl}company-size/`);
      setCompanySizeOptions(fetchData.data);
      // console.log("fetchdata", fetchData.data);
    } catch (error) {
      console.error("error", error);
    }
  };

  useEffect(() => {
    fetchCompanySize();
    fetchIndustry();
  }, []);

    useEffect(() => {
    if (values.password && !address) {
      const timeout = setTimeout(() => {
        setMoveTop(true);
      }, 300); // Delay by 1 second
      return () => clearTimeout(timeout);
    } else {
      setMoveTop(false); // Reset if condition is no longer true
    }
  }, [values.password, address]);


  const isBusinessEmail = (email) => {
    if (!email) return false;
    const freeEmailDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com',
      'outlook.com', 'icloud.com', 'protonmail.com',
      'mail.com', 'aol.com'
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    return domain && !freeEmailDomains.includes(domain);
  };

  return (
    <>
      <div className="flex min-h-[calc(100vh-68px)]">
        {/* Left side with image (hidden on smaller screens) */}
        <div
          className="hidden md:flex w-1/2 bg-cover bg-center"
          style={{
            backgroundImage:
              market === "market-place"
                ? `url(${loginIMG})`
                : `url(${loginIMG})`,
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Details */}
              <h3 className="text-lg font-semibold">Provide Your Details</h3>
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Picture
                </label>
                <input
                  type="file"
                  name="profile_picture"
                  accept="image/jpeg, image/png"
                  onChange={(event) => {
                    setFieldValue(
                      "profile_picture",
                      event.currentTarget.files[0]
                    );
                  }}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.profile_picture && errors.profile_picture
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.profile_picture && errors.profile_picture && (
                  <p className="text-sm text-red-600">
                    {errors.profile_picture}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name<span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={values.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.first_name && errors.first_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.first_name && errors.first_name && (
                  <p className="text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name<span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={values.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.last_name && errors.last_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.last_name && errors.last_name && (
                  <p className="text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Gender<span className="text-red-500"> *</span>
                </label>
                <select
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.gender && errors.gender
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {touched.gender && errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender}</p>
                )}
              </div>


              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address<span className="text-red-500"> *</span>
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
                {values.email && !isBusinessEmail(values.email) && (
    <p className="text-sm text-red-600">
      Please use a company email address (personal emails are not allowed)
    </p>
  )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number<span className="text-red-500"> *</span>
                </label>
                <PhoneInput
                  country={"sg"}
                  value={values.mobile_no}
                  onChange={(value) => setFieldValue("mobile_no", value)}
                  inputClass="w-full p-2 border rounded-md"
                />
                {errors.mobile_no && touched.mobile_no && (
                  <p className="text-sm text-red-600">{errors.mobile_no}</p>
                )}
              </div>

              {/* Company Details */}
              {type === "Company" && (
                <h3 className="text-lg font-semibold">Company Details</h3>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name
                  {type === "Company" && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={values.company_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.company_name && errors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.company_name && errors.company_name && (
                  <p className="text-sm text-red-600">{errors.company_name}</p>
                )}
              </div>

              {type === "Company" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Industry<span className="text-red-500"> *</span>
                    </label>
                    <select
                      name="industry"
                      value={values.industry}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${
                        touched.industry && errors.industry
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Industry</option>
                      {industryOptions && industryOptions.length > 0 ? (
                        industryOptions.map((option) => (
                          <option key={option.id} value={option.industry_type}>
                            {option.industry_type}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No options available
                        </option>
                      )}
                    </select>
                    {touched.industry && errors.industry && (
                      <p className="text-sm text-red-600">{errors.industry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Company Size<span className="text-red-500"> *</span>
                    </label>
                    <select
                      name="company_size"
                      value={values.company_size}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${
                        touched.company_size && errors.company_size
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Company Size</option>
                      {companySizeOptions && companySizeOptions.length > 0 ? (
                        companySizeOptions.map((option) => (
                          <option key={option.id} value={option.company_size}>
                            {option.company_size}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No options available
                        </option>
                      )}
                    </select>
                    {touched.company_size && errors.company_size && (
                      <p className="text-sm text-red-600">
                        {errors.company_size}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Country Select */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country of Incorporation
                  {type === "Company" && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <Select
                  options={countryOptions}
                  isClearable={true}
                  value={values.country}
                  onChange={(value) => setFieldValue("country", value)}
                  onBlur={handleBlur}
                  placeholder="Select Country"
                  className={`rounded-md ${
                    touched.country && errors.country
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>

                {
                !address && (
                  <div>
                  <label className="block text-sm font-medium mb-1">
                    Password<span className="text-red-500"> *</span>
                  </label>
                  <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={(event) => {
                      handleChange(event);
                      if (event.target.value) {
                        setFieldValue("address", ""); // Clear wallet address if password is entered
                      }
                    }}
                    onBlur={handleBlur}
                    className={`w-full p-2 border rounded-md ${
                      touched.password && errors.password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
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
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                )
              }


  {/* Wallet Connect Button */}
  {/* {!values.password && !address && ( */}
   <Button
      fullWidth
      onClick={() => open()}
      className={`!bg-darkgreen ${(values.password && !address) && "invisible"} mb-4 !text-white !hover:bg-opacity-80`}
    >
      {address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : "Connect with Wallet"}
    </Button>
  {/* )} */}


              {/* Terms and Conditions */}
              <h3
      className={`text-lg font-semibold relative ${
        moveTop ? "-top-14" : "top-0"
      }`}
    >
      Terms and Conditions
    </h3>
              <div className={`relative ${
        moveTop ? "-top-14" : "top-0"
      }`}>
                  <label className="inline-flex items-start flex-col gap-1">
    <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={values.terms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="form-checkbox text-blue-500"
                  />
                  <p className="ml-2">
                    I accept the terms and conditions
                  </p>
                </div>
                </label>
               
                  <p className="text-sm h-3 text-red-600">
      {touched.terms && errors.terms ? errors.terms : ""}
    </p>
             
              </div>

{/* <div>
  <label className="inline-flex items-start flex-col gap-1">
    <div className="flex items-center">
      <input
        type="checkbox"
        name="privacyPolicy"
        checked={values.privacyPolicy}
        onChange={handleChange}
        onBlur={handleBlur}
        className="form-checkbox text-blue-500"
      />
      <span className="ml-2">I accept the privacy policy</span>
    </div>
    <p className="text-sm h-3 text-red-600">
      {touched.privacyPolicy && errors.privacyPolicy ? errors.privacyPolicy : ""}
    </p>
  </label>
</div> */}


              <Typography className={`relative text-center ${
        moveTop ? "-top-14" : "top-0"
      } flex items-center`}>
                <Link
                  to={`/private-policies?market=${market}`}
                  className={`${
        moveTop ? "-top-14" : "top-0"
      } text-black flex items-center underline`}
                >
                  View Terms and Conditions
                  <FiArrowRight className="ml-1 text-sm" />
                </Link>
              </Typography>

              {/* Submit Button */}
              <Button className={`!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80  relative ${
        moveTop ? "-top-14" : "top-0"
      }`}
                type="submit"
                fullWidth
                // disabled={!address}
              >
                Sign Up
              </Button>
            </form>
          </Card>
        </div>
        {/* Right side with login form with background img */}
        <div className="flex md:hidden bg-cover bg-center w-full md:w-1/2 items-center justify-center p-8"
         style={{
          backgroundImage:
            market === "market-place"
              ?   `url(${loginIMG})`
              : `url(${loginIMG})`,
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Details */}
              <h3 className="text-lg font-semibold">Provide Your Details</h3>
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Display Picture
                </label>
                <input
                  type="file"
                  name="profile_picture"
                  accept="image/jpeg, image/png"
                  onChange={(event) => {
                    setFieldValue(
                      "profile_picture",
                      event.currentTarget.files[0]
                    );
                  }}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.profile_picture && errors.profile_picture
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.profile_picture && errors.profile_picture && (
                  <p className="text-sm text-red-600">
                    {errors.profile_picture}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  First Name<span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={values.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.first_name && errors.first_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.first_name && errors.first_name && (
                  <p className="text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Last Name<span className="text-red-500"> *</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={values.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.last_name && errors.last_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.last_name && errors.last_name && (
                  <p className="text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Gender<span className="text-red-500"> *</span>
                </label>
                <select
                  name="gender"
                  value={values.gender}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.gender && errors.gender
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {touched.gender && errors.gender && (
                  <p className="text-sm text-red-600">{errors.gender}</p>
                )}
              </div>



              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address<span className="text-red-500"> *</span>
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
                {values.email && !isBusinessEmail(values.email) && (
    <p className="text-sm text-red-600">
      Please use a company email address (personal emails are not allowed)
    </p>
  )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number<span className="text-red-500"> *</span>
                </label>
                <PhoneInput
                  country={"sg"}
                  value={values.mobile_no}
                  onChange={(value) => setFieldValue("mobile_no", value)}
                  inputClass="w-full p-2 border rounded-md"
                />
                {errors.mobile_no && touched.mobile_no && (
                  <p className="text-sm text-red-600">{errors.mobile_no}</p>
                )}
              </div>

              {/* Company Details */}
              {type === "Company" && (
                <h3 className="text-lg font-semibold">Company Details</h3>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name
                  {type === "Company" && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={values.company_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    touched.company_name && errors.company_name
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {touched.company_name && errors.company_name && (
                  <p className="text-sm text-red-600">{errors.company_name}</p>
                )}
              </div>

              {type === "Company" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Industry<span className="text-red-500"> *</span>
                    </label>
                    <select
                      name="industry"
                      value={values.industry}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${
                        touched.industry && errors.industry
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Industry</option>
                      {industryOptions && industryOptions.length > 0 ? (
                        industryOptions?.map((option) => (
                          <option key={option.id} value={option.industry_type}>
                            {option.industry_type}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No options available
                        </option>
                      )}
                    </select>
                    {touched.industry && errors.industry && (
                      <p className="text-sm text-red-600">{errors.industry}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Company Size<span className="text-red-500"> *</span>
                    </label>
                    <select
                      name="company_size"
                      value={values.company_size}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full p-2 border rounded-md ${
                        touched.company_size && errors.company_size
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select Company Size</option>
                      {companySizeOptions && companySizeOptions.length > 0 ? (
                        companySizeOptions.map((option) => (
                          <option key={option.id} value={option.company_size}>
                            {option.company_size}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No options available
                        </option>
                      )}
                    </select>
                    {touched.company_size && errors.company_size && (
                      <p className="text-sm text-red-600">
                        {errors.company_size}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Country Select */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Country of Incorporation
                  {type === "Company" && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <Select
                  options={countryOptions}
                  isClearable={true}
                  value={values.country}
                  onChange={(value) => setFieldValue("country", value)}
                  onBlur={handleBlur}
                  placeholder="Select Country"
                  className={`rounded-md ${
                    touched.country && errors.country
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
{/* 
              {!address && (
                <Button
                  fullWidth
                  onClick={() => open()}
                  className="!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80"
                >
                  {address
                    ? `${address.slice(0, 4)}...${address.slice(-4)}`
                    : "Connect with Wallet"}
                </Button>
              )} */}
                  
                  {
                !address && (
                  <div>
                  <label className="block text-sm font-medium mb-1">
                    Password<span className="text-red-500"> *</span>
                  </label>
                  <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={(event) => {
                      handleChange(event);
                      if (event.target.value) {
                        setFieldValue("address", ""); // Clear wallet address if password is entered
                      }
                    }}
                    onBlur={handleBlur}
                    className={`w-full p-2 border rounded-md ${
                      touched.password && errors.password
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
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
                  </div>
                  {touched.password && errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                )
              }

  {/* Wallet Connect Button */}
  {/* {!values.password && !address && ( */}
    <Button
      fullWidth
      onClick={() => open()}
      className={`!bg-darkgreen ${(values.password && !address) && "invisible"} mb-4 !text-white !hover:bg-opacity-80`}
    >
      {address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : "Connect with Wallet"}
    </Button>
  {/* )} */}


              {/* Terms and Conditions */}
              <h3
      className={`text-lg font-semibold relative ${
        moveTop ? "-top-14" : "top-0"
      }`}
    >
      Terms and Conditions
    </h3>
              <div className={`relative ${
        moveTop ? "-top-14" : "top-0"
      }`}>
                  <label className="inline-flex items-start flex-col gap-1">
    <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={values.terms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="form-checkbox text-blue-500"
                  />
                  <p className="ml-2">
                    I accept the terms and conditions
                  </p>
                </div>
                </label>
               
                  <p className="text-sm h-3 text-red-600">
      {touched.terms && errors.terms ? errors.terms : ""}
    </p>
             
              </div>
            

              {/* <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="privacyPolicy"
                    checked={values.privacyPolicy}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="form-checkbox text-blue-500"
                  />
                  <span className="ml-2">I accept the privacy policy</span>
                </label>
                {touched.privacyPolicy && errors.privacyPolicy && (
                  <p className="text-sm text-red-600">{errors.privacyPolicy}</p>
                )}
              </div> */}

              <Typography className={`relative text-center ${
        moveTop ? "-top-14" : "top-0"
      } flex items-center`}>
                <Link
                  to={`/private-policies?market=${market}`}
                  className={`${
        moveTop ? "-top-14" : "top-0"
      } text-black flex items-center underline`}
                >
                  View Terms and Conditions
                  <FiArrowRight className="ml-1 text-sm" />
                </Link>
              </Typography>

              {/* Submit Button */}
              <Button className={`!bg-darkgreen mb-4 !text-white !hover:bg-opacity-80  relative ${
        moveTop ? "-top-14" : "top-0"
      }`}
                type="submit"
                fullWidth
                // disabled={!address}
              >
                Sign Up
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
};

export default SignUp;
