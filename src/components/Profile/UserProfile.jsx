import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { Modal, Box, IconButton, CircularProgress } from "@mui/material";
import axios from "axios";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import countryList from "react-select-country-list";
import CloseIcon from "@mui/icons-material/Close";
import PhoneInput from "react-phone-input-2";
import { Avatar } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useDisconnect } from "wagmi";
import { images } from "../../assets";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { sendAccountDeletionEmail } from "../../services/RetirenmentService";

const validationCompanySchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  company_name: yup.string().required("Company name is required"),
  company_size: yup.string().required("Company size is required"),
  mobile_no: yup
    .string()
    .required("Mobile number is required")
    .matches(
      /^\+?(\d{1,4})[-.\s]?(\d{7,10})$/,
      "Please enter a valid mobile number"
    ),
  industry: yup.string().required("industry is required"),
  profile_picture: yup
    .mixed()
    .test(
      "fileType",
      "Unsupported file format. Only jpg or png allowed",
      (value) => {
        // Allow the value to be null or undefined
        if (!value) return true; // Not required

        // Ensure the type is valid if a file is provided
        return ["image/jpeg", "image/png"].includes(value.type);
      }
    )
    .notRequired(),
});
const validationSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  company_name: yup.string(),
  // company_size: yup.string().required("Company size is required"),
  mobile_no: yup
    .string()
    .required("Mobile number is required")
    .matches(
      /^\+?(\d{1,4})[-.\s]?(\d{7,10})$/,
      "Please enter a valid mobile number"
    ),
  // industry: yup.string().required("industry is required"),
  profile_picture: yup
    .mixed()
    .test(
      "fileType",
      "Unsupported file format. Only jpg or png allowed",
      (value) => {
        // Allow the value to be null or undefined
        if (!value) return true; // Not required

        // Ensure the type is valid if a file is provided
        return ["image/jpeg", "image/png"].includes(value.type);
      }
    )
    .notRequired(),
});

const UserProfile = () => {
  const { userDetails, setUserDetails, hasAddress, hasToken, setShowSessionModal,isLoggedIn } =
    useContext(UserContext);
  const [open, setOpen] = useState(false);
  // const apiUrl = import.meta.env.VITE_API_URL;
  const apiUrl = "https://api.hestiya.com/api/";
  const [loading, setLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const navigate = useNavigate();
  const countryOptions = countryList().getData();
  const [industryOptions, setIndustryOptions] = useState(null);
  const [companySizeOptions, setCompanySizeOptions] = useState(null);
  const { disconnect } = useDisconnect();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [copied, setCopied] = useState(false);
  // const []
  // console.log("userDetails", userDetails);
  const [showPassword, setShowPassword] = useState(false);
  const selectedCountry = countryOptions.find(
    (country) => country.label === userDetails?.company_country_name
  );
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [selectedReason, setSelectedReason] = useState("");

  const deleteReasons = [
    "No longer using the platform",
    "Privacy concerns",
    "Created a new account",
    "Not satisfied with service",
  ];

  const signupInitialValues = {
    company_name: userDetails?.company_name || "",
    industry: userDetails?.industry || "",
    country: selectedCountry || null,
    company_size: userDetails?.company_size || "",
    mobile_no: userDetails?.mobile_no || "",
    first_name: userDetails?.first_name || "",
    last_name: userDetails?.last_name || "",
    profile_picture: null,
  };

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

  const resetFormWithUserData = () => {
    setValues({
      profile_picture: "",
      first_name: userDetails?.first_name || "",
      last_name: userDetails?.last_name || "",
      company_name: userDetails?.company_name || "",
      mobile_no: userDetails?.mobile_no || "",
      industry: userDetails?.industry || "",
      company_size: userDetails?.company_size || "",
      country: selectedCountry || "",
    });
  };

  // When userDetails changes (e.g., after API success), update form values
  useEffect(() => {
    if (open) {
      resetFormWithUserData(); // Update form values when modal is opened
    }
  }, [userDetails, open,hasAddress]);

  useEffect(() => {
    fetchCompanySize();
    fetchIndustry();
  }, [hasAddress]);

  const handleProfilePictureChange = (event) => {
    const file = event.currentTarget.files[0];
    setFieldValue("profile_picture", file);

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    // setProfilePreview(null); // Reset the preview on close
    setOpen(false);
    // resetForm();
  };

  const handleDelete = async () => {
    try {
      const finalReason =
        selectedReason === "other" ? otherReason : selectedReason;
      // console.log("Delete reason:", finalReason);

      // const res = await axios.delete(
      //   `${apiUrl}user-signup/${hasAddress}/`
      // );
      // if (res) {
      //   toast.success("Account Deleted");
      //   setTimeout(() => {
      //     setUserDetails(null);
      //     localStorage.clear();
      //     disconnect();
      //     navigate("/");
      //   }, 1000);
      // }

      // Send both the account deletion request and reason to the API

      if (hasAddress) {
        const responseOfListing = await axios.get(
          `${apiUrl}p2p-listing/?address=${hasAddress}`
        );
        // console.log("backend listing", responseOfListing.data);

        const { results, count } = responseOfListing.data;

        if (results.length > 0) {
          toast.error(
            "Please cancel your listings before deleting your account"
          );
          return;
        } else {
          const res = await axios.delete(
            `${apiUrl}user-signup/${hasAddress}/`,
            {
              data: {
                reason: finalReason,
              },
            }
          );

          if (res) {
            // await sendAccountDeletionEmail(userDetails?.email, userDetails?.first_name);
            toast.success(
              "Your account deletion request has been sent to the admin."
            );
            setTimeout(() => {
              setUserDetails(null);
              localStorage.clear();
              disconnect();
              navigate("/");
              window.location.reload();
            }, 1000);
          }
        }
      }
    } catch (error) {
      console.error("error", error);
      toast.error("Failed to delete account");
    } finally {
      setDeleteWarningOpen(false);
      setSelectedReason("");
      setOtherReason("");
    }
  };

  const urlToFile = async (url, filename, mimeType) => {
    const response = await fetch(url);
    const data = await response.blob();
    return new File([data], filename, { type: mimeType });
  };

  const {
    values,
    errors,
    touched,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
    setValues,
    resetForm,
  } = useFormik({
    initialValues: signupInitialValues,
    validationSchema:
      userDetails?.signup_detail_type === "Company"
        ? validationCompanySchema
        : validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        const {
          company_name,
          industry,
          company_size,
          first_name,
          last_name,
          mobile_no,
          country,
          profile_picture,
        } = values;
        if (!values.country && userDetails?.signup_detail_type === "Company") {
          console.error("Country is required");
          toast.error("Country Selection Required");
          return;
        }

        const formData = new FormData();

        formData.append("is_verified", true);
        formData.append("signup_detail_type", userDetails?.signup_detail_type);
        formData.append("user", hasAddress);

        // formData.append("company_name", company_name);
        if (company_name !== userDetails?.company_name) {
          formData.append("company_name", company_name);
        }

        // formData.append("first_name", first_name);
        if (first_name !== userDetails?.first_name) {
          formData.append("first_name", first_name);
        }

        // formData.append("last_name", last_name);
        if (last_name !== userDetails?.last_name) {
          formData.append("last_name", last_name);
        }

        // formData.append("mobile_no", mobile_no);
        if (mobile_no !== userDetails?.mobile_no) {
          formData.append("mobile_no", mobile_no);
        }

        // if type company also append these fields
        // if (userDetails?.signup_detail_type === "Company") {
        //   formData.append("industry", industry);
        //   formData.append("company_size", company_size);
        // }
        if (userDetails?.signup_detail_type === "Company") {
          if (industry !== userDetails?.industry) {
            formData.append("industry", industry);
          }
          if (company_size !== userDetails?.company_size) {
            formData.append("company_size", company_size);
          }
        }

        if (country.label !== userDetails?.company_country_name) {
          if (country?.label === undefined) {
            formData.append("company_country_name", "");
            // console.log("country no");
          } else {
            // console.log("country", country?.label);
            formData.append("company_country_name", country.label);
          }
        }

        // // handle image logic

        let imageToSend;
        if (profile_picture) {
          imageToSend = profile_picture;
        } else if (userDetails?.profile_picture) {
          imageToSend = await urlToFile(
            userDetails?.profile_picture,
            "profile_picture.png",
            "image/png"
          );
        }

        if (imageToSend) {
          formData.append("profile_picture", imageToSend);
        }

        const res = await axios.patch(
          `${apiUrl}signup-detail/${hasAddress}/`,
          formData
        );
        if (res) {
          // console.log("res ", res);
          const res1 = await axios.get(`${apiUrl}signup-detail/${hasAddress}`);
          // console.log("res11", res1.data);
          if (res1) {
            setTimeout(() => {
              setUserDetails(res1.data);
              toast.success("Update Successful");
              resetForm();
              handleClose();
            }, 1000);
          }
        }
      } catch (error) {
        if (
          error.response.data.mobile_no[0] ===
          "signup detail with this mobile no already exists."
        ) {
          toast.error("This number is already registered.");
        } else {
          toast.error("Please Try Again");
        }
        console.error("error", error.response.data);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleExportPrivateKey = async () => {
    setError("");
    try {
      const res = await axios.post(
        `${apiUrl}decrypt-private-key/`,
        {
          password: address,
        },
        {
          headers: {
            Authorization: `Bearer ${hasToken?.access_token}`,
          },
        }
      );
      if (res) {
        setPrivateKey(res.data.decrypted_private_key);
        // setIsPopupOpen(false);
      }
    } catch (error) {
      console.error("error", error);
      setError(error.message);
      if (error.response && error.response.status === 401) {
        setError("Invalid password. Please try again. ");
        setShowSessionModal(true)
      } else {
        setError("Failed to export private key. Please try again.");
      }
    }
  };

  return (
    <div className="p-6  min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Welcome to Your Profile</h1>

      <div className="bg-white overflow-hidden shadow rounded-lg border">
        <div className="flex sm:gap-0 gap-3 md:items-center flex-col md:flex-row justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2">
            <div>
              {userDetails?.profile_picture ? (
                <Avatar
                  variant="circular"
                  alt="profile image"
                  className="cursor-pointer"
                  src={userDetails?.profile_picture}
                />
              ) : // (
              //   <Avatar
              //     variant="circular"
              //     alt="profile image"
              //     className="cursor-pointer"
              //     src={images.avatarImage}
              //   />
              // )

              userDetails?.gender ? (
                <Avatar
                  variant="circular"
                  alt="profile image"
                  className="cursor-pointer"
                  src={
                    userDetails?.gender?.toLowerCase() === "male"
                      ? images.avatarImage
                      : images.avatarImageWoman
                  }
                />
              ) : (
                <Avatar
                  variant="circular"
                  alt="profile image"
                  className="cursor-pointer"
                  src={images.avatarImage}
                />
              )}
            </div>
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Display Picture
              </h3>
              {/* <p className="mt-1 max-w-2xl text-sm text-gray-500">
								This is some information about the user.
							</p> */}
            </div>
          </div>
          <div className="flex w-full md:w-2/3 gap-2 mt-2 flex-wrap  md:mt-0 md:justify-end">
            <button
              onClick={() => setDeleteWarningOpen(true)}
              className={` py-2 px-4 rounded-md bg-red-700 sm:mb-4 !text-white !hover:bg-opacity-80`}
            >
              Delete Account
            </button>
            <button
              onClick={handleOpen}
              className={` py-2 px-4 rounded-md bg-darkgreen sm:mb-4 !text-white !hover:bg-opacity-80`}
            >
              Edit
            </button>

            {hasToken && (
              <button
                onClick={() => setIsPopupOpen(true)}
                className={` py-2 px-4 rounded-md bg-darkgreen sm:mb-4 !text-white !hover:bg-opacity-80`}
              >
                Export Private Key
              </button>
            )}
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails?.first_name} {userDetails?.last_name}
              </dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails?.email}
              </dd>
            </div>

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 items-center sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Phone number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <PhoneInput
                  country={"us"} // This will default to US; change as needed
                  value={userDetails?.mobile_no}
                  disabled
                  inputProps={{
                    name: "mobile_no",
                  }}
                  className="!w-fit"
                  enableAreaCodes={true} // Enable area codes if needed
                />
              </dd>
            </div>

            {/* <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Phone number
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails?.mobile_no}
              </dd>
            </div> */}

            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Country of Incorporation
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails?.company_country_name === ""
                  ? "N/A"
                  : userDetails?.company_country_name}
              </dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Company Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {userDetails?.company_name ? userDetails?.company_name : "N/A"}
              </dd>
            </div>
            <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Wallet Address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {hasAddress ? hasAddress : "N/A"}
              </dd>
            </div>
            {userDetails?.signup_detail_type === "Company" && (
              <>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Company Size
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetails?.company_size}
                  </dd>
                </div>
                <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">
                    Industry Size
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {userDetails?.industry}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        className="flex justify-center items-center"
      >
        <Box className="bg-white p-6 rounded-md max-h-[90vh] overflow-auto shadow-lg w-full max-w-lg mx-auto my-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-bold ">Edit Profile</div>
              <IconButton
                onClick={() => {
                  handleClose(), resetForm();
                }}
                className="absolute right-2"
              >
                <CloseIcon />
              </IconButton>
            </div>
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Display Picture
              </label>
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="mb-2 w-20 h-20 object-cover rounded-full"
                />
              ) : (
                userDetails?.profile_picture && (
                  <img
                    src={userDetails?.profile_picture}
                    alt="Current Profile"
                    className="mb-2 w-20 h-20 object-cover rounded-full"
                  />
                )
              )}
              <input
                type="file"
                name="profile_picture"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="mt-2"
              />
              {touched.profile_picture && errors.profile_picture ? (
                <div className="text-red-500 text-sm mt-1">
                  {errors.profile_picture}
                </div>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name
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
                Last Name
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
                Company Name
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
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <PhoneInput
                country={"sg"}
                value={values.mobile_no}
                onChange={(value) => setFieldValue("mobile_no", value)}
                inputClass="w-full p-2 border rounded-md"
              />
              {errors.mobile_no && touched.mobile_no && (
                <div className="text-red-600">{errors.mobile_no}</div>
              )}
            </div>

            {userDetails?.signup_detail_type === "Company" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Industry
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
                    Company Size
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
              </label>
              <Select
                isClearable={true}
                options={countryOptions}
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
            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full p-2 rounded-md ${
                loading ? "bg-gray-500" : "bg-darkgreen"
              } mb-4 !text-white !hover:bg-opacity-80`}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Update Profile"}
            </button>
          </form>
        </Box>
      </Modal>

      {isPopupOpen && (
        <div
          onClick={() => {
            setIsPopupOpen(false);
            setPrivateKey("");
            setAddress("");
          }}
          role="dialog"
          aria-labelledby="modal-title"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg"
          >
            {!privateKey && (
              <>
                <h3 id="modal-title" className="text-lg font-bold mb-4">
                  Enter the password to show the private key
                </h3>
                <div className=" relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter Password"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-3 transform "
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <FiEye className="text-gray-600" />
                    ) : (
                      <FiEyeOff className="text-gray-600" />
                    )}
                  </button>
                </div>
              </>
            )}

            {privateKey && (
              <>
                <h3 id="modal-title" className="text-lg font-bold mb-4">
                  Private Key
                </h3>
                <p className="text-green-500 text-sm w-auto mb-2 py-2 leading-6 h-auto break-words overflow-hidden">
                  {privateKey}{" "}
                  <span
                    className="px-2 py-1 cursor-pointer bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 "
                    onClick={() => {
                      navigator.clipboard.writeText(privateKey);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1000);
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </span>
                </p>
              </>
            )}
            {error && (
              <p className="text-red-500 text-sm -mt-3 ps-2 mb-1 text-nowrap text-break">
                {error}
              </p>
            )}
            <div className={`flex ${error && "mt-2"} gap-4`}>
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  setPrivateKey("");
                  setAddress("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExportPrivateKey}
                className="px-4 py-2 bg-darkgreen text-white rounded hover:bg-opacity-80"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Warning Modal */}
      {deleteWarningOpen && (
        <div
          onClick={() => setDeleteWarningOpen(false)}
          role="dialog"
          aria-labelledby="delete-warning-title"
          aria-modal="true"
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md"
          >
            <h3
              id="delete-warning-title"
              className="text-lg font-bold mb-4 text-red-600"
            >
              Warning: Account Deletion
            </h3>
            <p className="mb-4">
              Are you sure you want to delete your account? This action cannot
              be undone and all your data will be permanently removed.
            </p>

            {/* Reason Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Please select a reason for deleting your account:
              </label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full p-2 border rounded-md mb-2"
                required
              >
                <option value="">Select a reason</option>
                {deleteReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
                <option value="other">Other</option>
              </select>

              {selectedReason === "other" && (
                <textarea
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Please specify your reason"
                  className="w-full p-2 border rounded-md"
                  rows="3"
                  required
                />
              )}
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setDeleteWarningOpen(false);
                  setSelectedReason("");
                  setOtherReason("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  !selectedReason ||
                  (selectedReason === "other" && !otherReason)
                }
                className={`px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 
            ${
              !selectedReason || (selectedReason === "other" && !otherReason)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
