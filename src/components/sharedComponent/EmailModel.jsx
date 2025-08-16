import React from "react";
import { Button } from "@mui/material";
import { useFormik } from "formik";
import { emailModelInitialValues, emailModelValidationSchema } from "../../validationDataTypes";

const EmailModel = ({ onApply, onClose, headingText }) => {


  // Formik for form management and validation
  const formik = useFormik({
    initialValues: emailModelInitialValues,
    validationSchema:emailModelValidationSchema,
    onSubmit: (values) => {
      onApply(values.email);
      onClose();
    },
  });
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-1">{headingText}</h2>
        <p className="text-sm text-gray-500 mb-5">
          Please enter your email address. Your export will be emailed to you
          when it's ready.
        </p>
        <form onSubmit={formik.handleSubmit}>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            name="email"
            className="w-full p-2 border rounded-md mb-2"
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email ? (
            <div className="text-red-500 text-sm">{formik.errors.email}</div>
          ) : null}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outlined" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Apply
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailModel;
