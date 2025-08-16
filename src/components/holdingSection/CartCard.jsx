import React, { useContext, useState } from "react";
import ListingCardDrawer from "./drawerComponents/ListingCardDrawer";
import RetireCreditDrawer from "./drawerComponents/RetireCreditDrawer";
import { useAccount } from "wagmi";
import { UserContext } from "../../context/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { submitRetirement } from "../../services/RetirenmentService";


const RETIREMENT_REASONS = [
  {
    id: 1,
    label: "Regulatory or Compliance Requirement",
    value: "regulatory_compliance"
  },
  {
    id: 2,
    label: "CORSIA Airline Offset",
    value: "corsia_airline"
  },
  {
    id: 3,
    label: "SBTi-Aligned Action",
    value: "sbti_aligned"
  },
  {
    id: 4,
    label: "Philanthropic or Climate Impact Contribution",
    value: "philanthropic_impact"
  },
  {
    id: 5,
    label: "Carbon Neutral Certification",
    value: "carbon_neutral"
  }
];

// Add this to your retirement form component
const RetirementReasonSelect = ({ selectedReason, setSelectedReason }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Retirement Reason
      </label>
      <div className="space-y-2">
        {RETIREMENT_REASONS.map((reason) => (
          <div
            key={reason.id}
            className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors"
            onClick={() => setSelectedReason(reason.value)}
          >
            <input
              type="radio"
              id={reason.value}
              name="retirementReason"
              value={reason.value}
              checked={selectedReason === reason.value}
              onChange={() => setSelectedReason(reason.value)}
              className="h-4 w-4 text-primary border-gray-300"
            />
            <label
              htmlFor={reason.value}
              className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
            >
              {reason.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};




// Add this above the CartCard component
const RetirementForm = ({ 
  projectName, 
  amount, 
  onClose, 
  onSubmit,
  filter_project_type,
  userEmail // Add user email from context
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: userEmail || '', // Pre-populate with user's email
    retirementType: 'Personal',
    agreeTerms: false
  });
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      toast.error('You must agree that retired credits cannot be resold or transferred');
      return;
    }
    const retirementDetails = {
      ...formData,  
      reason: selectedReason,
    }
    onSubmit(retirementDetails);
  };

  return (
    <div className="fixed z-30 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Retirement Details
            </h3>
            <button type="button" onClick={onClose}>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name / Company</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <RetirementReasonSelect
    selectedReason={selectedReason}
    setSelectedReason={setSelectedReason}
  />

  {/* Add validation to ensure a reason is selected */}
  {!selectedReason && (
    <p className="text-red-500 text-sm mt-1">
      Please select a retirement reason
    </p>
  )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Retirement Type</label>
              <select
                name="retirementType"
                value={formData.retirementType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Personal">Personal</option>
                <option value="Corporate">Corporate</option>
                <option value="Gift">Gift</option>
                <option value="Memorial">Memorial</option>
                <option value="Event">Event Offset</option>
              </select>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeTerms" className="font-medium text-gray-700">
                  I understand that retired {filter_project_type === "CarbonCredits" ? "credits" : "certificates"} cannot be resold or transferred
                </label>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
              disabled={!selectedReason}
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#CDDC6E] text-base font-medium text-black hover:bg-[#c6d959] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Confirm Retirement
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};




// Add this to your redeem form component
const RedeemReasonSelect = ({ selectedReason, setSelectedReason }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Redeem Reason
      </label>
      <div className="space-y-2">
        {RETIREMENT_REASONS.map((reason) => (
          <div
            key={reason.id}
            className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors"
            onClick={() => setSelectedReason(reason.value)}
          >
            <input
              type="radio"
              id={reason.value}
              name="redeemReason"
              value={reason.value}
              checked={selectedReason === reason.value}
              onChange={() => setSelectedReason(reason.value)}
              className="h-4 w-4 text-primary border-gray-300"
            />
            <label
              htmlFor={reason.value}
              className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
            >
              {reason.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};


// Add this above the CartCard component
const RedeemForm = ({ 
  projectName, 
  amount, 
  onClose, 
  onSubmit,
  filter_project_type,
  userEmail // Add user email from context
}) => {
  const [selectedReason, setSelectedReason] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: userEmail || '', // Pre-populate with user's email
    redeemType: 'Personal',
    agreeTerms: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.agreeTerms) {
      toast.error('You must agree that redeemed credits cannot be resold or transferred');
      return;
    }
    const redeemDetails = {
      ...formData,  
      reason: selectedReason,
    }
    onSubmit(redeemDetails);
  };

  return (
    <div className="fixed z-30 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Redeem Details
            </h3>
            <button type="button" onClick={onClose}>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name / Company</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <RedeemReasonSelect
              selectedReason={selectedReason}
              setSelectedReason={setSelectedReason}
            />

            {/* Add validation to ensure a reason is selected */}
            {!selectedReason && (
              <p className="text-red-500 text-sm mt-1">
                Please select a redeem reason
              </p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Redeem Type</label>
              <select
                name="redeemType"
                value={formData.redeemType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Personal">Personal</option>
                <option value="Corporate">Corporate</option>
                <option value="Gift">Gift</option>
                <option value="Memorial">Memorial</option>
                <option value="Event">Event Offset</option>
              </select>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeTermsRedeem"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeTermsRedeem" className="font-medium text-gray-700">
                  I understand that redeemed {filter_project_type === "CarbonCredits" ? "credits" : "certificates"} cannot be resold or transferred
                </label>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                disabled={!selectedReason || !formData.agreeTerms}
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#CDDC6E] text-base font-medium text-black hover:bg-[#c6d959] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Confirm Redeem
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};




const CartCard = ({
  image,
  projectCode,
  projectCategory,
  projectType,
  name,
  standards,
  vintages,
  ratingsCarbonRating,
  ratingscobenifit_rating,
  getProjectById,
  filter_project_type,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isDrawerOpen2, setIsDrawerOpen2] = useState(false);
  const [vintageData, setVintageData] = useState("");
  const [projectId, setProjectId] = useState("");
  const { hasAddress } = useContext(UserContext);
  const [showRadeemPopup, setShowRadeemPopup] = useState(false);
  const [radeemAmount, setRadeemAmount] = useState();
  const [showRetirePopup, setShowRetirePopup] = useState(false);
  const [retireAmount, setRetireAmount] = useState();
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [showRetirementForm, setShowRetirementForm] = useState(false);
  const [retirementData, setRetirementData] = useState(null);

  const [showRedeemForm, setShowRedeemForm] = useState(false);
  const [showRedeemConfirmPopup, setShowRedeemConfirmPopup] = useState(false);

  // const apiUrl = import.meta.env.VITE_API_URL;
  const apiUrl = "https://api.hestiya.com/api/";
  // console.log('vintages', vintages);
  // console.log('ratingsCarbonRating', ratingsCarbonRating);

  const handleAddList = (id, vintagesData) => {
    setVintageData(vintagesData);
    setProjectId(id);
    setIsDrawerOpen(true);
  };

  const handleRetireCredits = (id, vintagesData) => {
    // console.log("id", id);
    setVintageData(vintagesData);
    setProjectId(id);
    setIsDrawerOpen2(true);
  };
  const totalCredits = vintages.reduce((total, van) => total + van.credits, 0);

  const handleSubmitRadeem = async (projectId, redeemDetails=null ) => {
    try {
      // console.log('Radeem Amount:', radeemAmount);
      // console.log('Project ID:', projectId);
      console.log('Vintage Data: redeem details :- ', redeemDetails);

      if (radeemAmount && projectId) {
        if (redeemDetails) {

        const redeemData = {
          project_id: projectId,
          project_name: name,
          project_code: projectCode,
          project_type: projectType[0]?.project_type || '',
          project_standard: standards[0]?.project_standard || '',
          amount: redeemDetails.amount || radeemAmount,
          user_email: redeemDetails.email,
          user_name: redeemDetails.name,
          retirement_type: redeemDetails.redeemType,
          retirement_reason: redeemDetails.reason,
          retirement_date: new Date().toISOString(),
          status: 'pending'
        };
        // console.log("Submitting retirement with amount:", retireAmount);
        // console.log("Retirement Data:", retirementData);
        const result = await submitRetirement(redeemData,'redeem');
        
        toast.success(
          `Redeem request submitted. Check your email for confirmation.`,
          { autoClose: 5000 }
        );
      } else {
        const response = await axios.post(`${apiUrl}radeem-credits/`, {
          order_item_id: projectId,
          amount: radeemAmount,
        });
        // console.log("Radeem Response:", response.data);
        toast.success(`Redeem request submitted successfully`);
      }
      setRadeemAmount("");
      setShowRadeemPopup(false);
      setShowRedeemConfirmPopup(false);
      setShowRedeemForm(false);
      }
      else {
        toast.error("Please enter the amount to redeem");
      }
    } catch (error) {
      console.error("Error submitting radeem:", error.response?.data);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Error submitting redeem");
    }
  };

  // const handleSubmitRetire = async (projectId) => {
  //   try {
  //     // console.log('Retire Amount:', retireAmount);
  //     // console.log('Project ID:', projectId);
  //     // console.log('Vintage Data:', vintageData);
  //     if (retireAmount && projectId) {
  //       const response = await axios.post(`${apiUrl}retire-credits/`, {
  //         order_item_id: projectId,
  //         amount: retireAmount,
  //       });
  //       // console.log("Retire Response:");
  //       toast.success(`Retire request submitted successfully`);
  //       setRetireAmount("");
  //       setShowRetirePopup(false);
  //       setShowConfirmPopup(false);
  //     } else {
  //       toast.error("Please enter the amount to retire");
  //     }
  //   } catch (error) {
  //     console.error("Error submitting retire:", error);
  //     toast.error(error.response.data.error);
  //     setRetireAmount("");
  //     setShowRetirePopup(false);
  //     setShowConfirmPopup(false);
  //   }
  // };


  // const handleSubmitRetire = async (projectId, retirementDetails = null) => {
  //   try {
  //     if (retireAmount && projectId) {
  //       const payload = {
  //         order_item_id: projectId,
  //         amount: retireAmount,
  //         ...(retirementDetails && {
  //           retirement_details: {
  //             name: retirementDetails.name,
  //             email: retirementDetails.email,
  //             reason: retirementDetails.reason,
  //             retirement_type: retirementDetails.retirementType,
  //             project_name: name,
  //             project_code: projectCode,
  //             filter_project_type,
  //           }
  //         })
  //       };

  //       const response = await axios.post(`${apiUrl}retire-credits/`, payload);
        
  //       toast.success(`Retirement request submitted successfully`);
  //       if (retirementDetails) {
  //         // Here you would typically send the email with certificate
  //         // This would be handled by your backend
  //         toast.info('Retirement certificate will be emailed to you after confirmation');
  //       }
        
  //       setRetireAmount("");
  //       setShowRetirePopup(false);
  //       setShowConfirmPopup(false);
  //       setShowRetirementForm(false);
  //     } else {
  //       toast.error("Please enter the amount to retire");
  //     }
  //   } catch (error) {
  //     console.error("Error submitting retire:", error);
  //     toast.error(error.response?.data?.error || "Error submitting retirement");
  //     setRetireAmount("");
  //     setShowRetirePopup(false);
  //     setShowConfirmPopup(false);
  //     setShowRetirementForm(false);
  //   }
  // };


// Update the handleSubmitRetire function
const handleSubmitRetire = async (projectId, retirementDetails = null) => {
  try {
    if (retireAmount && projectId) {

      // const response = await axios.post(`${apiUrl}retire-credits/`, {
      //   order_item_id: projectId,
      //   amount: retireAmount,
      // });


      if (retirementDetails) {

        const retirementData = {
          project_id: projectId,
          project_name: name,
          project_code: projectCode,
          project_type: projectType[0]?.project_type || '',
          project_standard: standards[0]?.project_standard || '',
          amount: retireAmount,
          user_email: retirementDetails.email,
          user_name: retirementDetails.name,
          retirement_type: retirementDetails.retirementType,
          retirement_reason: retirementDetails.reason,
          retirement_date: new Date().toISOString(),
          status: 'pending'
        };
        // console.log("Submitting retirement with amount:", retireAmount);
        // console.log("Retirement Data:", retirementData);
        const result = await submitRetirement(retirementData);
        
        toast.success(
          `Retirement request submitted. Check your email for confirmation.`,
          { autoClose: 5000 }
        );
      } else {
        // Simple retirement without form (deprecated path)
        await axios.post(`${apiUrl}retire-credits/`, {
          order_item_id: projectId,
          amount: retireAmount,
        });
        toast.success(`Retirement request submitted`);
      }

      setRetireAmount("");
      setShowRetirePopup(false);
      setShowConfirmPopup(false);
      setShowRetirementForm(false);
    } else {
      toast.error("Please enter the amount to retire");
    }
  } catch (error) {
    console.error("Error submitting retirement:", error);
    
     const errorMessage = error.message.split(' at ')[0].replace('Error: ', '');
    toast.error(errorMessage || "Error submitting retirement");
    // setRetireAmount("");
    setShowRetirePopup(false);
    setShowConfirmPopup(false);
    // setShowRetirementForm(false);
  }
};

  const handleConfirmRetirement = () => {
    // e.preventDefault();
    setShowConfirmPopup(false);
    setShowRetirementForm(true);
  };

const handleConfirmRedeem = () => {
  setShowRedeemConfirmPopup(false);
  setShowRedeemForm(true);
};

  // console.log("check vintages data : ", vintages[0]?.id)
  return (
    <>
      {isDrawerOpen && (
        <ListingCardDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          vintageData={vintageData}
          projectId={projectId}
          name={name}
          getProjectById={getProjectById}
          address={hasAddress}
          filter_project_type={filter_project_type}
        />
      )}
      {isDrawerOpen2 && (
        <RetireCreditDrawer
          isOpen={isDrawerOpen2}
          onClose={() => setIsDrawerOpen2(false)}
          vintageData={vintageData}
          projectId={projectId}
          name={name}
          getProjectById={getProjectById}
          address={hasAddress}
          filter_project_type={filter_project_type}
        />
      )}

      <Link
        to={`/marketplace/listing?projectCode=${projectCode}`}
        className="xlll:mx-6 xl:mx-4 mt-2 cursor-default"
      >
        <div className="w-full py-[25px] px-[23px] rounded-xl mt-4 bg-[#F5F5F5]">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-10  md:justify-between">
            <div className="flex gap-[23px]">
              <div className="max-w-full sm:max-w-[200px] h-[200px] rounded-xl">
                {image && Array.isArray(image) && image?.length > 0 ? (
                  <img
                    src={image[0].image}
                    className="w-full sm:w-[200px] h-[200px] rounded-xl"
                    alt={"Project Image"}
                  />
                ) : (
                  <div className="w-full flex justify-center items-center sm:w-[200px] h-[200px] rounded-xl">
                    no image
                  </div>
                )}
              </div>
              <div className="hidden xl:flex flex-col justify-between">
                <div className="text-xl font-semibold leading-[30px]">
                  {name}
                </div>
                <div className={"flex items-center gap-10 xlll:gap-[54px]"}>
                  <div className="text-base text-[#1D1F2199]">
                    <div className="font-semibold leading-[24px] mb-5">
                      Project Code
                    </div>
                    <div className="font-normal leading-[22.4px]">
                      {projectCode}
                    </div>
                  </div>
                  <div className="text-base text-[#1D1F2199]">
                    <div className="font-semibold leading-[24px] mb-5">
                      Project Category
                    </div>
                    <div className="font-normal leading-[22.4px]">
                      {projectCategory &&
                      Array.isArray(projectCategory) &&
                      projectCategory.length > 0 ? (
                        <>
                          {projectCategory.length > 1 ? (
                            <>
                              {projectCategory[0].cat_name} &{" "}
                              {projectCategory.length} more
                            </>
                          ) : (
                            <>{projectCategory[0].cat_name}</>
                          )}
                        </>
                      ) : (
                        "--"
                      )}
                    </div>
                  </div>
                  <div className="text-base text-[#1D1F2199]">
                    <div className="font-semibold leading-[24px] mb-5">
                      Project Type
                    </div>
                    <div className="font-normal leading-[22.4px]">
                      {projectType &&
                      Array.isArray(projectType) &&
                      projectType.length > 0 ? (
                        <>
                          {projectType.length > 1 ? (
                            <>
                              {projectType[0].project_type} &{" "}
                              {projectType.length} more
                            </>
                          ) : (
                            <>{projectType[0].project_type}</>
                          )}
                        </>
                      ) : (
                        "--"
                      )}
                    </div>
                  </div>
                  <div className="text-base text-[#1D1F2199]">
                    <div className="font-semibold leading-[24px] mb-5">
                      Standards
                    </div>
                    <div className="font-normal leading-[22.4px]">
                      {standards &&
                      Array.isArray(standards) &&
                      standards.length > 0 ? (
                        <>
                          {standards.length > 1 ? (
                            <>
                              {standards[0].project_standard} &{" "}
                              {standards.length} more
                            </>
                          ) : (
                            <>{standards[0].project_standard}</>
                          )}
                        </>
                      ) : (
                        "--"
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap w-2/3 items-center gap-4">
                  {ratingsCarbonRating ? (
                    <div className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]">
                      {ratingsCarbonRating}
                    </div>
                  ) : (
                    "--"
                  )}
                  {ratingscobenifit_rating ? (
                    <div className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]">
                      {ratingscobenifit_rating} Co-Benefits
                    </div>
                  ) : (
                    "--"
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 sm:gap-[60px] flex-col">
              <div className="flex flex-col gap-3">
                {/* {console.log("check the filter type : ", filter_project_type)} */}
                {filter_project_type === "CarbonCredits" && (
                  <button
                    className={
                      "py-3 text-center xlll:px-8 w-full sm:w-[216px] bg-[#CDDC6E] text-black text-base font-semibold leading-6 rounded-lg"
                    }
                    // onClick={(e) => {
                    // 	e.preventDefault();
                    // 	handleRetireCredits(projectCode, vintages);
                    // }}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowRetirePopup(true);
                    }}
                  >
                    Retire Credits
                  </button>
                )}
                {filter_project_type != "CarbonCredits" && (
                  <button
                    className={
                      "py-3 text-center xlll:px-8 w-full sm:w-[216px] bg-[#CDDC6E] text-black text-base font-semibold leading-6 rounded-lg"
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      setShowRadeemPopup(true);
                    }}
                  >
                    Redeem
                  </button>
                )}
                <button
                  className={
                    "py-3 text-center xlll:px-8 w-full sm:w-[216px] bg-[#CDDC6E] text-black text-base font-semibold leading-6 rounded-lg"
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddList(projectCode, vintages);
                  }}
                >
                  List Credits
                </button>
                
              </div>
              <div className="text-black text-left sm:text-right">
                <div className="text-xl font-semibold leading-[30px]">
                  Total Credits
                </div>
                <div className="text-base font-normal leading-[22.4px]">
                  {totalCredits} {/* {price}  */}
                  {filter_project_type === "CarbonCredits" ? "Tonne" : "MWh"}
                  {/* {console.log("check the filter type : ", filter_project_type)} */}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex xl:hidden flex-col gap-6">
            <div className="text-xl font-semibold leading-[30px]">{name}</div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center justify-between">
              <div className="text-base text-[#1D1F2199]">
                <div className="font-semibold leading-[24px] mb-5">
                  Project Code
                </div>
                <div className="font-normal leading-[22.4px]">
                  {projectCode}
                </div>
              </div>
              <div className="text-base text-[#1D1F2199]">
                <div className="font-semibold leading-[24px] mb-5">
                  Project Category
                </div>
                <div className="font-normal leading-[22.4px]">
                  {projectCategory &&
                  Array.isArray(projectCategory) &&
                  projectCategory.length > 0 ? (
                    <>
                      {projectCategory.length > 1 ? (
                        <>
                          {projectCategory[0].cat_name} &{" "}
                          {projectCategory.length} more
                        </>
                      ) : (
                        <>{projectCategory[0].cat_name}</>
                      )}
                    </>
                  ) : (
                    "--"
                  )}
                </div>
              </div>
              <div className="text-base text-[#1D1F2199]">
                <div className="font-semibold leading-[24px] mb-5">
                  Project Type
                </div>
                <div className="font-normal leading-[22.4px]">
                  {projectType &&
                  Array.isArray(projectType) &&
                  projectType.length > 0 ? (
                    <>
                      {projectType.length > 1 ? (
                        <>
                          {projectType[0].project_type} & {projectType.length}{" "}
                          more
                        </>
                      ) : (
                        <>{projectType[0].project_type}</>
                      )}
                    </>
                  ) : (
                    "--"
                  )}
                </div>
              </div>
              <div className="text-base text-[#1D1F2199]">
                <div className="font-semibold leading-[24px] mb-5">
                  Standards
                </div>
                <div className="font-normal leading-[22.4px]">
                  {" "}
                  {standards &&
                  Array.isArray(standards) &&
                  standards.length > 0 ? (
                    <>
                      {standards.length > 1 ? (
                        <>
                          {standards[0].project_standard} & {standards.length}{" "}
                          more
                        </>
                      ) : (
                        <>{standards[0].project_standard}</>
                      )}
                    </>
                  ) : (
                    "--"
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-4">
              {ratingsCarbonRating ? (
                <div className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]">
                  {ratingsCarbonRating}
                </div>
              ) : (
                "--"
              )}
              {ratingscobenifit_rating ? (
                <div className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]">
                  {ratingscobenifit_rating} Co-Benefits
                </div>
              ) : (
                "--"
              )}
            </div>
          </div>
        </div>
      </Link>
      {showRadeemPopup && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          onClick={() => setShowRadeemPopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
          >
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="flex items-center justify-between">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-headline"
                >
                  Enter Amount to Redeem
                </h3>
                <button type="button" onClick={() => setShowRadeemPopup(false)}>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const inputAmount = e.target.amount.value;
                    setRadeemAmount(inputAmount);
                    setShowRadeemPopup(false);
                    setShowRedeemConfirmPopup(true);
                  }}
                >
                  <div className="mt-2">
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      required
                      placeholder="Enter the Redeem Amount"
                      className=" py-3 px-3 mt-5 block w-full outline-none border-2 border-gray-400 rounded-md"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="submit"
                      className="py-3 text-center xlll:px-8 w-full  bg-[#CDDC6E] text-black text-base font-semibold leading-6 rounded-lg"
                    >
                      Redeem
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRetirePopup && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          onClick={() => setShowRetirePopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
          >
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div
              className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-headline"
            >
              <div className="flex items-center justify-between">
                <h3
                  className="text-lg leading-6 font-medium text-gray-900"
                  id="modal-headline"
                >
                  Enter Amount to Retire
                </h3>
                <button type="button" onClick={() => setShowRetirePopup(false)}>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const inputAmount = e.target.amount.value; // Get value directly from input
                    setRetireAmount(inputAmount); // Update state for consistency
                    setShowConfirmPopup(true);
                  }}
                >
                  <div className="mt-2">
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      required
                      placeholder="Enter the Retire Amount"
                      className="py-3 px-3 mt-5 block w-full outline-none border-2 border-gray-400 rounded-md"
                    />
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="submit"
                      className="py-3 text-center xlll:px-8 w-full bg-[#CDDC6E] text-black text-base font-semibold leading-6 rounded-lg"
                    >
                      Retire Credits
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmPopup && (
       <div className="fixed z-20 inset-0 overflow-y-auto" onClick={() => setShowConfirmPopup(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
          >
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-900 opacity-70"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div
              className="inline-block align-bottom bg-white rounded-lg px-6 pt-6 pb-5 text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-md sm:w-full sm:p-6"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex flex-col space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Are you sure you want to retire credits?
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone. Please confirm to continue.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleConfirmRetirement();
                    }}
                    // onClick={(e) => {
                    //   e.preventDefault();
                    //   handleConfirmRetirement();
                    // }}
                    className="bg-[#CDDC6E] hover:bg-[#c6d959] transition text-black font-semibold px-5 py-2 rounded-lg"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmPopup(false);
                      setShowRetirePopup(false);
                      // setRetireAmount("");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRedeemConfirmPopup && (
  <div className="fixed z-20 inset-0 overflow-y-auto" onClick={() => setShowRedeemConfirmPopup(false)}>
    <div
      onClick={(e) => e.stopPropagation()}
      className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        className="fixed inset-0 transition-opacity"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gray-900 opacity-70"></div>
      </div>
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
        &#8203;
      </span>
      <div
        className="inline-block align-bottom bg-white rounded-lg px-6 pt-6 pb-5 text-left overflow-hidden shadow-xl transform transition-all sm:align-middle sm:max-w-md sm:w-full sm:p-6"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Are you sure you want to redeem credits?
          </h3>
          <p className="text-sm text-gray-600">
            This action cannot be undone. Please confirm to continue.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleConfirmRedeem();
              }}
              className="bg-[#CDDC6E] hover:bg-[#c6d959] transition text-black font-semibold px-5 py-2 rounded-lg"
            >
              Continue
            </button>
            <button
              onClick={() => {
                setShowRedeemConfirmPopup(false);
                setShowRadeemPopup(false);
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-5 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

{showRetirementForm && (
  <RetirementForm
    projectName={name}
    amount={retireAmount}
    onClose={() => {
      setShowRetirementForm(false);
      setRetireAmount("");
    }}
    onSubmit={(formData) => handleSubmitRetire(vintages[0]?.id, formData)}
    filter_project_type={filter_project_type}
  />
)}

{showRedeemForm && (
  <RedeemForm
    projectName={name}
    amount={radeemAmount}
    onClose={() => {
      setShowRedeemForm(false);
      setRadeemAmount("");
    }}
    onSubmit={(formData) => handleSubmitRadeem(vintages[0]?.id, formData)}
    filter_project_type={filter_project_type}
  />
)}
    </>
  );
};

export default CartCard;
