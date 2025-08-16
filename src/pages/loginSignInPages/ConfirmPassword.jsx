import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Button, Card, Typography } from "@material-tailwind/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FiEye, FiEyeOff } from "react-icons/fi";
import loginIMG from "../../assets/loginpic.jpg"; // Use the same image as in SignIn

const ConfirmResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = "https://api.hestiya.com/api/"; // API base URL from the document
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Extract token from URL (assuming it's passed as a query parameter)
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  // Validation schema for the form
  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // API call to confirm password reset
        const strongRegex = new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$",
        );
        const errors = [];
        if (!/[A-Z]/.test(values.password)) {
          errors.push("Password should contain at least one uppercase letter");
        }
        if (!/[0-9]/.test(values.password)) {
          errors.push("Password should contain at least one number");
        }
        if (!/[!@#$%^&*]/.test(values.password)) {
          errors.push("Password should contain at least one special character");
        }
        if (errors.length > 0) {
          return toast.error(errors.join(", "));
        }
        
        const response = await axios.post(`${apiUrl}confirm-reset-password/?token=${token}`, {
            new_password: values.password,
            confirm_password: values.confirmPassword,
        }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response) {
          toast.success("Password reset successfully!");
          navigate("/sign-in/?market=market-place"); 
        }
      } catch (error) {
        console.error("Error confirming password reset:", error);
        toast.error(
          error.response?.data?.message || "Error resetting password"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-[calc(100vh-68px)]">
      {/* Left side with image (hidden on smaller screens) */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: `url(${loginIMG})`,
        }}
      >
        {/* Image placeholder */}
      </div>

      {/* Right side with form */}
      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center p-8">
        <Card className="w-full max-w-md p-8">
          <Typography
            variant="h4"
            color="blue-gray"
            className="text-center mb-4"
          >
            Reset Password
          </Typography>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password<span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    formik.touched.password && formik.errors.password
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
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password<span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <FiEye className="text-gray-600" />
                  ) : (
                    <FiEyeOff className="text-gray-600" />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              disabled={formik.isSubmitting}
              className="!bg-darkgreen my-4 !text-white !hover:bg-opacity-80"
            >
              {formik.isSubmitting ? "Submitting..." : "Reset Password"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Mobile view with background image */}
      <div
        className="flex md:hidden w-full bg-cover bg-center items-center justify-center p-8"
        style={{
          backgroundImage: `url(${loginIMG})`,
        }}
      >
        <Card className="w-full max-w-md p-8">
          <Typography
            variant="h4"
            color="blue-gray"
            className="text-center mb-4"
          >
            Confirm Reset Password
          </Typography>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password<span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    formik.touched.password && formik.errors.password
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
              {formik.touched.password && formik.errors.password && (
                <p className="text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password<span className="text-red-500"> *</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full p-2 border rounded-md ${
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <FiEye className="text-gray-600" />
                  ) : (
                    <FiEyeOff className="text-gray-600" />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {formik.errors.confirmPassword}
                  </p>
                )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              disabled={formik.isSubmitting}
              className="!bg-darkgreen my-4 !text-white !hover:bg-opacity-80"
            >
              {formik.isSubmitting ? "Submitting..." : "Reset Password"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ConfirmResetPassword;