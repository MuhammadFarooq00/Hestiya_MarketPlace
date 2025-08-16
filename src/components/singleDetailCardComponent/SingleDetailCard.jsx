/* eslint-disable no-unsafe-optional-chaining */
import { useContext, useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { ReactComponent as LocationIcon } from "../../assets/svg/location-svg.svg";
import { ReactComponent as ProjectCategoryIcon } from "../../assets/svg/project-category.svg";
import { ReactComponent as ProjectSizeIcon } from "../../assets/svg/project-Size.svg";
import { ReactComponent as ProjectTypeIcon } from "../../assets/svg/project-Type.svg";
import { ReactComponent as DeveloperIcon } from "../../assets/svg/developer.svg";
import { ReactComponent as EligibilitiesIcon } from "../../assets/svg/eligibilities.svg";
import { ReactComponent as ProjectRegistryIcon } from "../../assets/svg/project-Registry.svg";
import { ReactComponent as StandardIcon } from "../../assets/svg/standard.svg";
import { ReactComponent as GlanceCard1Icon } from "../../assets/svg/glance-card-1.svg";
import { ReactComponent as GlanceCard2Icon } from "../../assets/svg/glance-card-3.svg";
import { ReactComponent as GlanceCard3Icon } from "../../assets/svg/glance-card-2.svg";
import { ethers } from "ethers";

import { images } from "../../assets/index";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SidebarContext } from "../../context/SidebarContext";
import Loader from "../loaders/Loader";
import axios from "axios";
import AddToCartDrawer from "./drawerComponents/AddToCartDrawer";
import SDGCardGrid from "./SDGCardGrid";
import { useAccount } from "wagmi";
import { toast } from "react-toastify";
import { Bounce } from "react-toastify";
import DOMPurify from "dompurify";
import { hiestiyaProxy, decimalPoint, getContract, tokenAddress, getDecimals } from "../../abi";
import { abi } from "../../contractAbis";
import { readContract } from "@wagmi/core";
import { config } from "../../config/WalletConfig";
import { UserContext } from "../../context/UserContext";

import { Dialog, DialogHeader, DialogBody, DialogFooter, Button, Input, Textarea, Radio } from "@material-tailwind/react";


const LoadingDataSection = () => (
  <div className="animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-px bg-gray-200 w-full my-4"></div>
    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 mt-6"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 mt-6"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
  </div>
);


export default function SingleDetailCard() {
  // const { address, isConnected } = useAccount();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  // const projectCode = queryParams.get("projectCode");
  const initialProjectCode = queryParams.get("projectCode");
  const [projectCode, setProjectCode] = useState(
    initialProjectCode || localStorage.getItem("projectCode") || ""
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  // const [cartId, setCartId] = useState("");
  const { cartId, handleCartid,hasAddress,hasToken} = useContext(UserContext);
  const { sidebarWidth } = useContext(SidebarContext);
  const [index, setIndex] = useState(-1);
  // const apiUrl = import.meta.env.VITE_API_URL;
    const apiUrl = "https://api.hestiya.com/api/"
  // for API
  const [blockChainData, setBlockChainData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [getDecimalsData, setGetDecimalsData] = useState();
  const [blockChainLoading, setBlockChainLoading] = useState(true);
  const [openRatingModal, setOpenRatingModal] = useState(false);
const [ratingType, setRatingType] = useState("hestiya");
const [formData, setFormData] = useState({
  name: "",
  email: "",
  message: "",
  project: null
});
const [isSubmitting, setIsSubmitting] = useState(false);


  const photos = apiData?.images?.map((image) => ({
    src: image?.image,
    alt: "Gallery Image",
    width: 1080,
    height: 720,
  }));


  
  useEffect(() => {
    const fetchDecimals = async () => {
      try {
        const decimals = await getDecimals(tokenAddress);
        setGetDecimalsData(10 ** decimals);
        // console.log("decimals", decimals);
      } catch (error) {
        console.error("Failed to fetch decimals data:", error);
      }
    };
    fetchDecimals();
  }, [tokenAddress]);

  useEffect(() => {
    if(hasAddress){
    handleCartid();
    }
  }, [hasAddress, cartId]);

  const rating = apiData?.cobenifit_rating?.co_rating_obtained;
  const maxRating = apiData?.cobenifit_rating?.co_rating_total;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rating / maxRating) * circumference;

  const rating2 = apiData?.sdgs?.sdg_number.length;
  const maxRating2 = 17;
  const strokeDashoffset2 =
    circumference - (rating2 / maxRating2) * circumference;

  const fetchData = async () => {
    try {
      const res = await axios.get(`${apiUrl}project-listing/${projectCode}`);
      setApiData(res.data);
      setProjectName(res.data.name);
      // console.log("project", res.data);
    } catch (error) {
      setError(error.message);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = async () => {
    setBlockChainLoading(true);
    const contract = await getContract();
    try {
      //  console.log("contract call goes : ",contract);
      let result;
      if(hasToken){
        // console.log('getProjectById and check code : ', projectCode);
         result = await contract.getProjectById(projectCode);
        //  console.log("Hello this one ",result);
      }else{
      result = await readContract(config, {
        abi,
        address: hiestiyaProxy,
        functionName: "getProjectById",
        args: [projectCode],
      });
    }

      // console.log("contract call check result",result);
     
    const data = result[3]?.map((item) => ({
      availableCredits: Number(item.availableCredits),
      soldCredits: Number(item.soldCredits),
      totalCredits: Number(item.totalCredits),
      pricePerCredit: Number(item.pricePerCredit),
      year: item.year,
    }));
    
    // console.log("check results : ", ethers.utils.formatUnits(data.pricePerCredit))
      // console.log("Processed data:", data);

      // Calculate totalCredits, minVintageYear, maxVintageYear, minPrice, maxPrice
      const availableCredits = data?.reduce(
        (sum, item) => sum + item.availableCredits,
        0
      );
      const minVintageYear = Math.min(...data?.map((item) => item.year));
      const maxVintageYear = Math.max(...data?.map((item) => item.year));
      const minPrice = Math.min(...data?.map((item) => item.pricePerCredit));
      const maxPrice = Math.max(...data?.map((item) => item.pricePerCredit));

      const summaryData = {
        availableCredits,
        minVintageYear,
        maxVintageYear,
        minPrice,
        maxPrice,
      };
      // console.log("Summary Data:", summaryData);
      // console.log("data",data)
      setBlockChainData(data);
      setSummaryData(summaryData);
      // console.log("summary Data", summaryData);
    } catch (error) {
      console.error("Error getById Project", error);
    }finally{
      setBlockChainLoading(false);
    }
  };

  useEffect(() => {
    if (initialProjectCode) {
      localStorage.setItem("projectCode", initialProjectCode);
      setProjectCode(initialProjectCode);
    } else if (localStorage.getItem("projectCode")) {
      setProjectCode(localStorage.getItem("projectCode"));
    } else {
      navigate("/marketplace");
    }

    if (!hasAddress) {
      navigate("/marketplace");
    } else {
      fetchData();
      getProjectById();
    }
  }, [projectCode, hasAddress]);
  // console.log("isConnected",isConnected)

  const handleAddToCart = async () => {
    // console.log("check that is the ...")
    if (hasAddress) {
      setIsDrawerOpen(true);
    } else {
      toast.error("Connect Your Wallet", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      // navigate("/sign-in");
    }
  };

  if (loading) return <Loader />;
  if (error)
    return (
      <div className="flex justify-center items-center h-[80vh]">
        Error: {error}
      </div>
    );

  const handleRatingRequest = async () => {
  setIsSubmitting(true);
  try {
    const payload = {
      ...formData,
      project: projectCode,
      rating_type: ratingType
    };
    
    const response = await axios.post(`${apiUrl}request-for-rating`, payload);
    
    toast.success("Rating request submitted successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
    
    setOpenRatingModal(false);
    setFormData({
      name: "",
      email: "",
      message: "",
      project: null
    });
  } catch (error) {
    toast.error("Failed to submit rating request", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      transition: Bounce,
    });
    console.error("Error submitting rating request:", error);
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <>
      <div className="xlll:px-6 xl:px-4 px-2  flex w-full gap-[18px]">
        {blockChainData && (
          <AddToCartDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            cartId={cartId}
            projectName={projectName}
            blockChainData={blockChainData}
            projectCode={projectCode}
            filter_project_type={apiData?.filter_project_type ?? "CarbonCredits"}
          />
        )}
        {/* left side with image gallery  */}
        <div
          className={`flex flex-col gap-5 md:gap-7 xl:gap-9 h-[170px] md:h-[320px] lg:h-[415px] ${
            sidebarWidth === "w-24"
              ? "w-full xll:w-2/3 xlll:w-[988px]"
              : "w-full xll:w-2/3 xlll:w-[900px]"
          } `}
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-10 md:leading-[44px] lg:leading-[52px]">
            {projectName}
          </h1>
          <div className={`flex gap-1 md:gap-[11px]`}>

            <div
              className={`relative ${
                sidebarWidth === "w-24" ? "w-full" : "w-full"
              } h-[170px] md:h-[320px] lg:h-[415px]`}
            >
              <img
                src={photos[0]?.src}
                alt={photos[0]?.alt}
                onClick={() => setIndex(0)}
                className="w-full h-[170px] md:h-[320px] lg:h-[415px] rounded-2xl object-cover cursor-pointer"
              />
              {photos?.length > 3 && (
                <button
                  onClick={() => setIndex(0)}
                  className="absolute bottom-7 left-8 bg-[#CDDC6E] text-black py-3 px-4 text-sm lg:text-base font-semibold leading-6 rounded-lg"
                >
                  View All Images
                </button>
              )}
            </div>
            {photos?.length > 1 && photos?.length <= 3 && (
              <div
                className={`flex flex-col gap-1 md:gap-[11px] w-1/3 xlll:w-[311px]`}
              >
                {photos?.slice(1)?.map((photo, i) => (
                  <img
                    key={i}
                    src={photo.src}
                    alt={photo.alt}
                    onClick={() => setIndex(i + 1)}
                    className="w-full h-[82.5px] md:h-[155px] lg:h-[202px] rounded-2xl object-cover cursor-pointer"
                  />
                ))}
              </div>
            )}
            {photos?.length > 3 && (
              <div className="flex flex-col gap-[11px] w-1/3 xlll:w-[311px]">
                <img
                  src={photos[1]?.src}
                  alt={photos[1]?.alt}
                  onClick={() => setIndex(1)}
                  className="w-full h-[82.5px] md:h-[155px] lg:h-[202px] rounded-2xl object-cover cursor-pointer"
                />
                <img
                  src={photos[2]?.src}
                  alt={photos[2]?.alt}
                  onClick={() => setIndex(2)}
                  className="w-full h-[82.5px] md:h-[155px] lg:h-[202px] rounded-2xl object-cover cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* add to cart  */}
          <div className=" flex-col flex xl:hidden justify-between rounded-[9px] bg-[#BDC3C733] p-5 md:p-[28px]">
           {
            blockChainLoading ?
            <LoadingDataSection/> :
            <>
             <div className="gap-5 md:gap-[36.09px] flex flex-col">
              <div className="flex flex-col gap-[9.62px]">
                <div className="text-xl md:text-2xl xl:text-[28px] text-black font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                  Available {" "} {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Carbon Credits" : "I-RECs"}
                </div>
                <div className="text-lg md:text-xl text-[#1D1F2199] font-medium leading-6">
                  {/* {summaryData?.availableCredits}{(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"} */}
                      {summaryData?.availableCredits <= 0 ? (
              <span className="text-red-600 font-bold text-xl">Sold Out</span>
            ) : (
              <>
                {summaryData?.availableCredits}{" "}
                {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"}
              </>
            )}
                  {/* {console.log("check the filter type : ", apiData?.filter_project_type)} */}
                </div>
              </div>
              <div className="border-b-[1.2px] border-[#BDC3C7]"></div>
              <div className="text-lg md:text-xl text-[#1D1F2199] font-medium leading-6">
                Vintages {summaryData?.minVintageYear} -{" "}
                {summaryData?.maxVintageYear}
                {(apiData?.filter_project_type !== "CarbonCredits") && (
    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
      All prices exclude any redemption fees.
    </div>
  )} 


   {/* {(apiData?.filter_project_type !== "CarbonCredits") && (
    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
      All prices exclude any redemption fees.
    </div>
  )} */}

              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-[9.62px]">
                <div className="text-xl md:text-2xl mt-2 xl:text-[28px] text-black font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? "Credit price range": "Certificate price range"}
                </div>
                <div className="text-lg md:text-xl text-[#1D1F2199] font-medium leading-6">
                  {/* {console.log("check min price and the max price : ", summaryData)} */}
                  {/* {ethers.utils
                    .formatUnits(
                      summaryData?.minPrice?.toLocaleString("fullwide", {
						useGrouping: false,
					  }) || "0", // Ensure it's a string before passing to formatUnits
                      decimalPoint
                    )
                    .toLocaleString("fullwide", {
                      useGrouping: false,
                    })} */}
                    {(summaryData?.minPrice/getDecimalsData).toLocaleString("fullwide", {useGrouping: false})}
                    {" "}
                  -{" "}
                  {/* {ethers.utils
                    .formatUnits(
                      summaryData?.maxPrice?.toLocaleString("fullwide", {
						useGrouping: false,
					  }) || "0", // Ensure it's a string before passing to formatUnits
                      decimalPoint
                    )
                    .toLocaleString("fullwide", {
                      useGrouping: false,
                    })} */}
                    {(summaryData?.maxPrice/getDecimalsData).toLocaleString("fullwide", {useGrouping: false})}
                    {" "}
                    {(!hasToken && hasAddress) ? "USDT/" : "USD/"}{(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"}

                  {/* ${summaryData?.minPrice} - ${summaryData?.maxPrice} USD/tonne */}
                </div>
              </div>
              {
                summaryData?.availableCredits > 0 &&
              <Button
                onClick={handleAddToCart}
                className={`py-3 md:py-[15px] text-center bg-[#CDDC6E] text-black text-base md:text-[19.9px] w-full font-semibold leading-[29.86px] rounded-lg`}
              >
                Add {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? "Carbon Credits" : "I-RECs"} to Cart
              </Button>

              }
            </div>
            </>
           }
          </div>
          {/* add to cart  */}

          {/* Project Overview */}
          <div className="flex flex-col gap-5 md:gap-7 xl:gap-9 text-black">
            <div className=" text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
              Project Overview
            </div>
            {/* {console.log("project overview details : ", apiData?.details?.description)} */}
            <div
  className="text-sm lg:text-base font-normal leading-[22.4px] [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800"
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(apiData?.details?.description),
  }}
></div>

          </div>
          {/* Project Overview */}

          {/* Project Overview banner */}
          <div className="rounded-xl p-9 flex flex-wrap gap-5 md:gap-[46px] bg-[#BDC3C733] ">
            <div>
              <div className="w-[82px] mb-[11px] h-[82px] rounded-full">
                {/* <img className="" src={images.hestiyaLogoColor} alt="" /> */}
                <img src={apiData?.registry?.registory_image} alt={apiData?.registry?.registry_name} className="mb-4 rounded-full w-[82px] h-[82px] object-fit" />
              </div>
              <div className="text-sm lg:text-base mb-1 text-black font-normal leading-[22.4px]">
                Project Registry
              </div>
              {
                apiData?.registry?.registry_url && 
                (
                  <Link to={`${apiData?.registry?.registry_url  }`} target={"_blank"} className={`  text-sm underline text-blue-500  font-normal leading-[14px]`}>
                {/* {console.log("check the registry name 111 : ", apiData?.registry )} */}
                {apiData?.registry?.registry_name}
              </Link>
                )
              }
                {
                !apiData?.registry?.registry_url && 
                (
                  <div  className={` text-sm text-[#1D1F2199] font-normal leading-[14px]`}>
                {/* {console.log("check the registry name 111 : ", apiData?.registry )} */}
                {apiData?.registry?.registry_name}
              </div>
                )
              }
            </div>
            <div>
              <div className="w-[82px] mb-[11px] bg-[#1D2F80] text-sm lg:text-base font-semibold text-white flex justify-center items-center h-[82px] rounded-full">
                {apiData?.carbon_rating?.carbon_rating}
              </div>
              <div className="text-sm lg:text-base mb-1 text-black font-normal leading-[22.4px]">
                Carbon Rating
              </div>
              <div className="text-sm text-[#1D1F2199] font-normal leading-[14px]">
                provided by Hestiya
              </div>
               <button 
    onClick={() => setOpenRatingModal(true)}
    className="text-sm text-[#1D2F80] font-medium underline mt-1 hover:text-[#1a2a6b]"
  >
    Request for rating
  </button>


              <Dialog open={openRatingModal} handler={() => setOpenRatingModal(false)} size="md" className="h-[calc(100vh-4rem)] md:!h-auto">
  <DialogHeader className="border-b border-gray-400 pb-4">
    <div className="text-xl md:text-2xl font-semibold text-[#1D1F21]">
      Request Project Ratings
    </div>
  </DialogHeader>
  
  <DialogBody className="py-6 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start gap-4 p-4 rounded-lg bg-[#F8F9FA]">
          <Radio
            name="ratingType"
            checked={ratingType === "hestiya"}
            onChange={() => setRatingType("hestiya")}
            color="green"
            className="!border-[#CDDC6E] hover:before:opacity-0"
            containerProps={{ className: "p-0" }}
          />
          <div>
            <h4 className="text-lg font-semibold text-[#1D1F21] flex items-start gap-2">
              <span>🌱</span> Request Project Ratings from HESTIYA
            </h4>
            <p className="text-sm text-[#1D1F2199] mt-1">
              Get an official Carbon and Co-benefit Rating directly from Hestiya's internal evaluation framework. 
              Ratings are based on climate impact, transparency, and sustainable co-benefits using in-house methodologies.
            </p>
          </div>
        </div>
        
        {/* <div className="flex items-start gap-4 p-4 rounded-lg bg-[#F8F9FA]">
          <Radio
            name="ratingType"
            checked={ratingType === "bezero"}
            onChange={() => setRatingType("bezero")}
            color="green"
            className="!border-[#CDDC6E] hover:before:opacity-0"
            containerProps={{ className: "p-0" }}
          />
          <div>
            <h4 className="text-lg font-semibold text-[#1D1F21] flex items-center gap-2">
              <span>🌍</span> Request Project Ratings from BE-ZERO
            </h4>
            <p className="text-sm text-[#1D1F2199] mt-1">
              Submit your project for an independent carbon risk rating from BeZero Carbon, 
              a third-party global ratings agency. BeZero provides science-led, credit-specific 
              assessments with transparent scoring models.
            </p>
          </div>
        </div> */}
      </div>
      
      <div className="space-y-4">
        <Input
          label="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          color="green"
        />
        
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          color="green"
        />
        
        <Textarea
          label="Message (Optional)"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          color="green"
        />
      </div>
    </div>
  </DialogBody>
  
  <DialogFooter className="border-t border-gray-400 pt-4">
    <Button
      variant="text"
      color="gray"
      onClick={() => setOpenRatingModal(false)}
      className="mr-2"
    >
      Cancel
    </Button>
    <Button
      color="green"
      onClick={handleRatingRequest}
      disabled={isSubmitting || !formData.name || !formData.email}
      loading={isSubmitting}
      className="bg-[#CDDC6E] text-black"
    >
      Submit Request
    </Button>
  </DialogFooter>
</Dialog>

            </div>
            <div>
              <div className="mb-[11px] flex items-center">
                <svg width="82" height="82" className="relative">
                  <circle
                    cx="41"
                    cy="41"
                    r={radius}
                    stroke="#BDC3C7"
                    strokeWidth="8" // Adjusted strokeWidth for smaller size
                    fill="transparent"
                  />
                  <circle
                    cx="41"
                    cy="41"
                    r={radius}
                    stroke="#CDDC6E"
                    strokeWidth="8" // Adjusted strokeWidth for smaller size
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{
                      transition: "stroke-dashoffset 0.5s",
                      transform: "rotate(-90deg)",
                      transformOrigin: "50% 50%",
                    }}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dy=".3em"
                    fill="#000"
                    className="text-sm lg:text-base text-black font-semibold leading-6"
                  >
                    {rating}/{maxRating}
                  </text>
                </svg>
              </div>
              <div className="text-sm lg:text-base mb-1 text-black font-normal leading-[22.4px]">
                Co-benefit Rating
              </div>
              <div className="text-sm text-[#1D1F2199] font-normal leading-[14px] ">
                provided by Hestiya
              </div>
            </div>
          </div>
          {/* Project Overview banner */}

          {/* Project Overview */}
          <div className=" text-black flex flex-col gap-5 md:gap-7 xl:gap-9">
            <div className=" text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
              Project Details
            </div>
            {/* project summary  */}
            <div className="flex flex-col gap-5 md:gap-7 xl:gap-9">
              <div className="flex justify-between">
                <div className="text-xl md:text-2xl xl:text-[28px] font-semibold text-black xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                  Project Summary
                </div>
                <div className=" text-lg md:text-xl font-medium text-[#1D1F2199] leading-[24px]">
                  Project Code: {apiData?.project_code}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:text-start text-center sm:grid-cols-2 md:grid-cols-3 justify-between gap-y-9">
                <div className="flex flex-col items-center md:items-start">
                  <LocationIcon className="mb-4" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Location
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.project_country?.country ?? "--"}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <ProjectCategoryIcon className="mb-4" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Project Category
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.cat &&
                    Array.isArray(apiData?.cat) &&
                    apiData?.cat.length > 0 ? (
                      <>
                        {apiData.cat?.map((cat, i) => (
                          <span key={i}>
                            {cat.cat_name}
                            {i < apiData.cat.length - 1 ? ", " : " "}
                          </span>
                        ))}
                      </>
                    ) : (
                      "--"
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <ProjectSizeIcon className="mb-4" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Project Size {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? "" : "MWh" } 
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.details?.project_size ?? "--"}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <ProjectTypeIcon className="mb-4" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Project Type
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.type &&
                    Array.isArray(apiData?.type) &&
                    apiData?.type.length > 0 ? (
                      <>
                        {apiData.type?.map((type, index) => (
                          <span key={index}>
                            {type.project_type}
                            {index < apiData.type.length - 1 ? ", " : " "}
                          </span>
                        ))}
                      </>
                    ) : (
                      "--"
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <DeveloperIcon className="mb-4" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Developer
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.details?.developer ?? "--"}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <EligibilitiesIcon className="mb-4" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Eligibilities
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.details?.eligibilies ?? "--"}
                  </div>
                </div>
              </div>
            </div>
            {/* project summary  */}
            {/* Registry Info  */}
            <div className="flex flex-col gap-5 md:gap-7 xl:gap-9">
              <div className="flex justify-between">
                <div className="text-xl md:text-2xl xl:text-[28px] font-semibold text-black xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                  Registry Info
                </div>
                <div className=" text-lg md:text-xl font-medium text-[#1D1F2199] leading-[24px] ">
                  Project Code: {apiData?.project_code}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:text-start text-center sm:grid-cols-2 md:grid-cols-3 justify-between gap-y-9">
                <div className="flex flex-col items-center md:items-start">
                  {/* <ProjectRegistryIcon className="mb-4" /> */}
                  <img src={apiData?.registry?.registory_image} alt={apiData?.registry?.registry_name} className="-mb-[2px] rounded-full w-[76px] h-[76px] object-fit" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Project Registry
                  </div>
                  {/* <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.registry?.registry_name}
                  </div> */}
                  {
                apiData?.registry?.registry_url && 
                (
                  <Link to={`${apiData?.registry?.registry_url  }`} target={"_blank"} className={`    text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2 underline text-blue-500`}>
                {/* {console.log("check the registry name 111 : ", apiData?.registry )} */}
                {apiData?.registry?.registry_name}
              </Link>
                )
              }
                {
                !apiData?.registry?.registry_url && 
                (
                  <div  className={` text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2`}>
                {/* {console.log("check the registry name 111 : ", apiData?.registry )} */}
                {apiData?.registry?.registry_name}
              </div>
                )
              }
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <StandardIcon className="mb-[16px] mt-3" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Standard
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.standard &&
                    Array.isArray(apiData?.standard) &&
                    apiData?.standard.length > 0 ? (
                      <>
                        {apiData?.standard?.map((standard, index) => {
                          return (
                            <span key={index}>
                              {standard.project_standard}
                              {index < apiData.standard.length - 1 && " | "}
                            </span>
                          );
                        })}
                      </>
                    ) : (
                      "--"
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <ProjectTypeIcon className="mb-2 mt-2" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Methodology
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.registry?.methodology}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <ProjectTypeIcon className="mb-4" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Additional Certification
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.certifications &&
                    Array.isArray(apiData?.certifications) &&
                    apiData?.certifications?.length > 0 ? (
                      <>
                        {apiData.certifications?.map((certi, index) => {
                          return (
                            <span key={index}>
                              {certi.certification_name}
                              {index < apiData.certifications.length - 1 &&
                                " - "}
                            </span>
                          );
                        })}
                      </>
                    ) : (
                      "--"
                    )}
                    {/* CCB - No Distinction */}
                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <ProjectTypeIcon className="mb-4" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    Project Validator
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {apiData?.registry?.project_validator && apiData?.registry?.project_validator} <br />
                     
                    {apiData?.registry?.project_validator_date &&
                    (
                      <>
                      <span>
                      Issue date: {" "}  {apiData?.registry?.project_validator_date}
                      </span>
                      </>
                    )
                    }

                  </div>
                </div>
                <div className="flex flex-col items-center md:items-start">
                  <ProjectTypeIcon className="mb-4" />
                  <div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
                    CCB Validator
                  </div>
                  <div className=" text-black text-sm lg:text-base font-normal leading-[22.4px] pr-0 sm:pr-2">
                    {
                      // console.log("check in the console the cbb validator value : ", apiData?.registry?.cbb_validator)
                   ( apiData?.registry?.cbb_validator && !apiData?.registry?.cbb_validator == "NA") && apiData?.registry?.cbb_validator
                    }
                     <br />
                     {apiData?.registry?.cbb_validator_date &&
                    (
                      <>
                      <span>
                      Issue date: {" "}  {apiData?.registry?.cbb_validator_date}
                      </span>
                      </>
                    )
                    }
                    {/* 4K Earth Sciences Private Limited Issue date: 16 Aug 2021 */}
                  </div>
                </div>
              </div>
            </div>
            {/* Registry Info  */}
          </div>
          {/* Project Overview */}

          {/* Carbon Impact & Performance */}
          <div className=" text-black flex flex-col gap-5 md:gap-7 xl:gap-9">
            <div className=" text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
              Carbon Impact & Performance
            </div>
            <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
              Carbon Rating
            </div>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  apiData?.carbon_rating?.rating_text1
                ),
              }}
              className="text-sm lg:text-base font-normal leading-[22.4px]"
            >
              {/* Carbon Rating helps quickly and consistently assess up-to-date
              data on project performance and quality. They provide transparent
              third-party information that's not only forward-looking, but
              standardised for consistency.
              <br />
              <br />
              <br />
              Learn more about Carbon Ratings{" "}
              <span className="text-[#8BDB71]">here.</span> */}
            </div>
            <div className="rounded-xl flex-col md:flex-row items-start p-5 md:p-9 flex bg-[#BDC3C733] ">
              <div className="w-full md:w-1/5">
                {/* <div className="w-[82px] mb-[11px] h-[82px] rounded-full">
                  <img className="" src={images.BBLogo} alt="" />
                </div> */}
                <div className="w-[82px] mb-[11px] bg-[#1D2F80] text-sm lg:text-base font-semibold text-white flex justify-center items-center h-[82px] rounded-full">
                  {apiData?.carbon_rating?.carbon_rating}
                </div>
                <div className="text-sm lg:text-base mb-1 text-black font-normal leading-[22.4px]">
                  Carbon Rating
                </div>
                <div className="text-sm text-[#1D1F2199] font-normal leading-[14px] pe-6">
                  provided by Hestiya
                </div>
              </div>
              <div className="w-full md:w-4/5">
                <div
                  className="space-y-4 text-sm lg:text-base text-black"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      apiData?.carbon_rating?.rating_text2
                    ),
                  }}
                ></div>
              </div>
            </div>
          </div>
          {/* Carbon Impact & Performance */}

          {/* Co-Benefit Impact */}
          <div className=" text-black flex flex-col gap-5 md:gap-7 xl:gap-9">
            <div className=" text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
              Co-Benefit Impact
            </div>
            <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
              Co-benefit Rating
            </div>
            <div className="text-sm lg:text-base font-normal leading-[22.4px]">
              Co-Benefit Rating helps you understand the impact of a project on
              the communities and biodiversity within the project area simply
              and consistently. The rating scores the project across multiple
              factors, including impact on the local communities, biodiversity
              richness, and more, with up-to-date information to help you assess
              the project efficiently.
            </div>
            <div className="rounded-xl items-start flex-col md:flex-row gap-3 md:gap-0 p-5 md:p-9 flex bg-[#BDC3C733] ">
              <div className="w-full md:w-1/5">
                <div className="mb-[11px] flex items-center">
                  <svg width="82" height="82" className="relative">
                    <circle
                      cx="41"
                      cy="41"
                      r={radius}
                      stroke="#BDC3C7"
                      strokeWidth="8" // Adjusted strokeWidth for smaller size
                      fill="transparent"
                    />
                    <circle
                      cx="41"
                      cy="41"
                      r={radius}
                      stroke="#CDDC6E"
                      strokeWidth="8" // Adjusted strokeWidth for smaller size
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      style={{
                        transition: "stroke-dashoffset 0.5s",
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                      }}
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dy=".3em"
                      fill="#000"
                      className="text-sm lg:text-base text-black font-semibold leading-6"
                    >
                      {rating}/{maxRating}
                    </text>
                  </svg>
                </div>
                <div className="text-sm lg:text-base mb-1 text-black font-normal leading-[22.4px] pe-4">
                  Co-benefit Rating
                </div>
                <div className="text-sm text-[#1D1F2199] font-normal leading-[14px] pe-6">
                  provided by Hestiya
                </div>
              </div>
              <div className="w-full md:w-4/5">
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      apiData?.cobenifit_rating?.co_rating_text
                    ),
                  }}
                  className="leading-[22.4px] text-sm lg:text-base text-black"
                ></div>
              </div>
            </div>
            {/* Additional Certifications */}
            <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
              Additional Certifications
            </div>
            <div
              className="text-sm lg:text-base font-normal leading-[22.4px]"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  apiData?.certifications[0]?.description
                ),
              }}
            ></div>
            <div className="rounded-lg">
              <img
                className="w-[310px]"
                src={apiData?.certifications[0]?.file}
                alt="Additional Certifications"
              />
            </div>
            {/* Impact at a glance */}
            <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
              Impact at a glance
            </div>
            <div
              className="text-sm lg:text-base font-normal leading-[22.4px]"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  apiData?.impact_at_glance[0]?.impact_text
                ),
              }}
            >
              {/* Additional standards and certifications that carbon projects can
              get certified under for activities and benefits beyond emission
              reductions and/or removals. */}
            </div>
            {/* Impact at a glance card  */}
            <div className="flex flex-col gap-5 md:gap-7 xl:gap-9">
              {/* 1st */}
              <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center rounded-xl bg-[#8BDB71B2] p-5 md:p-9">
                {
                  apiData?.impact_at_glance[0]?.value_one_image ? (
                    <img
                      className="w-[90px] h-[90px] rounded-full"
                      src={apiData?.impact_at_glance[0]?.value_one_image}
                      alt="Impact at a glance"
                    />
                  ):
                  <GlanceCard1Icon className="!min-w-[90px]" />
                }
                  
              
                <div className="flex flex-col gap-3 md:gap-6">
                  <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                    Over  {apiData?.impact_at_glance[0]?.value_one}
                  </div>
                  <div className="text-sm lg:text-base font-semibold leading-6" 
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        apiData?.impact_at_glance[0]?.value_one_description
                      ),
                    }}
                  >
                    {/* {apiData?.impact_at_glance[0]?.value_one_description ??  `tCO2e of emission reductions over the project's lifetime to
                    date Emission reductions are expected to continue over the
                    project's lifetime of 30 years.`} */}
                  </div>
                </div>
              </div>
              {/* 2nd */}
              <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center rounded-xl bg-[#8BDB71B2] p-5 md:p-9">
              {
                  apiData?.impact_at_glance[0]?.value_two_image ? (
                    <img
                      className="w-[90px] h-[90px] rounded-full"
                      src={apiData?.impact_at_glance[0]?.value_two_image}
                      alt="Impact at a glance"
                    />
                  ):
                <GlanceCard2Icon className="!min-w-[90.02px]" />
}
                <div className="flex flex-col gap-3 md:gap-6">
                  <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                    {apiData?.impact_at_glance[0]?.value_two}
                  </div>
                  <div className="text-sm lg:text-base font-semibold leading-6"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        apiData?.impact_at_glance[0]?.value_two_description
                      ),
                    }}
                  >
                    {/* {apiData?.impact_at_glance[0]?.value_two_description ??  `
                    land tenure documents for family plots owned by local
                    communities Providing land ownership to the communities
                    encourages permanent benefits beyond the project lifetime.`} */}
                  </div>
                </div>
              </div>
              {/* 3rd */}
              <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center rounded-xl bg-[#8BDB71B2] p-5 md:p-9">
              {
                  apiData?.impact_at_glance[0]?.value_three_image ? (
                    <img
                      className="w-[90px] h-[90px] rounded-full"
                      src={apiData?.impact_at_glance[0]?.value_three_image}
                      alt="Impact at a glance"
                    />
                  ):
                <GlanceCard3Icon className="!min-w-[90px]" />}
                <div className="flex flex-col gap-3 md:gap-6">
                  <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                    {apiData?.impact_at_glance[0]?.value_three}
                  </div>
                  <div className="text-sm lg:text-base font-semibold leading-6"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        apiData?.impact_at_glance[0]?.value_three_description
                      ),
                    }}
                  >
                    {/* {apiData?.impact_at_glance[0]?.value_three_description ??  `
                      Critically Endangered or Endangered species benefitted from
                    reduced threats Species like the Brazilian giant tortoise
                    benefit from reduced threats due to project activities that
                    conserve their habitats. `
                  } */}
                  </div>
                </div>
              </div>
            </div>
            {/* Impact at a glance card  */}
          </div>
          {/* Co-Benefit Impact */}

          {/* Reporting framework & Co-benefit Impact */}
          <div className="text-black flex flex-col gap-5 md:gap-7 xl:gap-9">
            <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
              Reporting framework & Co-benefit Impact
            </div>
            <div className="text-sm lg:text-base font-normal leading-[22.4px]">
              Carbon projects' benefits often go beyond carbon sequestration or
              removals; also known as co-benefits, these are additional and/or
              secondary positive impacts that contribute to community
              development, protection of the environment, and enhanced
              resilience toward climate change impacts, among others. These
              co-benefits can be reported under various reporting frameworks
              that provide a structured approach to understanding how carbon
              projects help to address a range of interconnected challenges that
              accompany climate change.
            </div>
            {/* card  */}
            <div className="rounded-xl items-start flex-col md:flex-row p-5 md:p-9 flex bg-[#BDC3C733] ">
              <div className="w-full md:w-1/5">
                <div className="mb-[11px] flex items-center">
                  <svg width="82" height="82" className="relative">
                    <circle
                      cx="41"
                      cy="41"
                      r={radius}
                      stroke="#3F7E44"
                      strokeWidth="8" // Adjusted strokeWidth for smaller size
                      fill="transparent"
                    />
                    <circle
                      cx="41"
                      cy="41"
                      r={radius}
                      stroke="#E4253B"
                      strokeWidth="8" // Adjusted strokeWidth for smaller size
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset2}
                      style={{
                        transition: "stroke-dashoffset 0.5s",
                        transform: "rotate(-90deg)",
                        transformOrigin: "50% 50%",
                      }}
                    />
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dy=".3em"
                      fill="#000"
                      className="text-sm lg:text-base text-black font-semibold leading-6"
                    >
                      {rating2}/{maxRating2}
                    </text>
                  </svg>
                </div>
                <div className="text-sm lg:text-base mb-1 text-black font-normal leading-[22.4px]">
                  SDGs
                </div>
              </div>
              <div className="w-full md:w-4/5">
                <div className="leading-[22.4px] text-sm lg:text-base text-black">
                  The United Nations Sustainable Development Goals (UN SDG),
                  also known as the Global Goals, is a framework developed by
                  the United Nations as a universal call to action. The 17
                  Global Goals are integrated, recognising that actions in one
                  area will affect the outcomes in others. The Global Goals aim
                  to address critical social, economic, and environmental
                  challenges in order to ensure sustainable development for all
                  people by 2030. <br />
                  <br />
                  <span className="font-semibold">
                    <a
                      href={`https://sdgs.un.org/goals`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#314033] hover:text-blue-600 duration-300 ease-in-out"
                    >
                      Read More
                    </a>
                  </span>
                </div>
              </div>
            </div>
            {/* card  */}
            {/* SDGS Cards  */}
            <SDGCardGrid sdgNumbers={apiData?.sdgs?.sdg_number} />
            {/* SDGS Cards  */}
          </div>
          {/* Reporting framework & Co-benefit Impact */}

          <div className="pb-8"></div>
        </div>
        {/* right side  */}

        <div className={ `flex-col hidden ${summaryData?.availableCredits > 0 && "justify-between"} xl:flex  rounded-[9px] bg-[#BDC3C733] w-1/3 xlll:w-[430px] h-auto xlll:h-[415px] p-[28px]`}>
          {
            blockChainLoading ? 
            <LoadingDataSection/>:
            <>
             <div className=" gap-6 xlll:gap-[36.09px] flex flex-col">
            <div className="flex flex-col gap-[9.62px]">
              <div className="text-xl  xlll:text-[28px] text-black font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                Available {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? "Carbon Credits" : "IRECs" } 
              </div>
              <div className="text-lg xll:text-xl text-[#1D1F2199] font-medium leading-6">
                 {/* {summaryData?.availableCredits}{" "}
                {(
                  apiData?.filter_project_type ?? "CarbonCredits"
                ) === "CarbonCredits" ? " Tonnes" : "MWh"} */}
                    {summaryData?.availableCredits <= 0 ? (
              <span className="text-red-600 font-bold text-xl">Sold Out</span>
            ) : (
              <>
                {summaryData?.availableCredits}{" "}
                {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"}
              </>
            )}
              </div>
            </div>
            <div className="border-b-[1.2px] border-[#BDC3C7]"></div>
            <div className="text-lg xll:text-xl text-[#1D1F2199] font-medium leading-6">
              Vintages {summaryData?.minVintageYear} -{" "}
              {summaryData?.maxVintageYear}

              {(apiData?.filter_project_type !== "CarbonCredits") && (
    <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
      All prices exclude any redemption fees.
    </div>
  )}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className={`flex flex-col ${summaryData?.availableCredits <= 0 && "mt-6"}  gap-[9.62px]`}>
              <div className="text-xl  xlll:text-[28px] text-black font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                
                {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? "Credit price range": "Certificate price range"}
              </div>
              <div className="text-lg xll:text-xl text-[#1D1F2199] font-medium leading-6">
                {/* ${summaryData?.minPrice} - ${summaryData?.maxPrice} USD/tonne */}
                {/* $
                {ethers.utils.formatUnits(
                  summaryData?.minPrice.toString(),
                  decimalPoint
                )}{" "}
                - $
                {ethers.utils.formatUnits(
                  summaryData?.maxPrice.toString(),
                  decimalPoint
                )}{" "}
                USDT/Tonne */}
                {/* {ethers.utils
                  .formatUnits(
                    summaryData?.minPrice?.toLocaleString("fullwide", {
                      useGrouping: false,
                    }) || "0", // Ensure it's a string before passing to formatUnits
                    decimalPoint
                  )
                  .toLocaleString("fullwide", {
                    useGrouping: false,
                  })} */}
                  {(summaryData?.minPrice/getDecimalsData).toLocaleString("fullwide", {useGrouping: false})}
                  {" "}
                -{" "}
                {/* {ethers.utils
                  .formatUnits(
                    summaryData?.maxPrice?.toLocaleString("fullwide", {
                      useGrouping: false,
                    }) || "0", // Ensure it's a string before passing to formatUnits
                    decimalPoint
                  )
                  .toLocaleString("fullwide", {
                    useGrouping: false,
                  })} */}
                  {(summaryData?.maxPrice/getDecimalsData).toLocaleString("fullwide", {useGrouping: false})}
                  {" "}
                  {(!hasToken && hasAddress) ? "USDT/" : "USD/"}{(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? " Tonnes" : "MWh"}
              </div>
            </div>
            {
                summaryData?.availableCredits > 0 && (
            <Button
              onClick={handleAddToCart}
              disabled={summaryData?.availableCredits <= 0 || !hasAddress}
              className={`py-[15px] text-center bg-[#CDDC6E] text-black text-sm xll:text-base xlll:text-[19.9px] w-full font-semibold leading-[29.86px] rounded-lg`}
            >
              Add {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? "Carbon Credits" : "I-RECs"} to Cart
            </Button>)
            }
          </div>
            </>
          }
        </div>
      </div>

      <Lightbox
        slides={photos}
        open={index >= 0}
        index={index}
        close={() => setIndex(-1)}
        plugins={[Fullscreen, Slideshow, Zoom]} // Removed Thumbnails
      />
    </>
  );
}
