/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import { UserContext } from "../../context/UserContext";

const GirdCard = ({
  image,
  title,
  projectCode,
  projectCategory,
  projectType,
  standards,
  price,
  availability,
  vintagesEnd,
  vintagesStart,
  sidebarWidth,
  ratingsCarbonRating,
  ratingscobenifit_rating,
  filterProjectType,
}) => {
  const navigate = useNavigate();

  // const { address: accountAddress } = useAccount();
  // const [hasAddress, setHasAddress] = useState();
  const { hasAddress: userHasAddress,hasToken } = useContext(UserContext);
  // useEffect(() => {
  //   const addressFromLocalStorage = JSON.parse(localStorage.getItem("token"))?.address;
  //   const hasAddress = accountAddress || addressFromLocalStorage;
  //   setHasAddress(hasAddress);
  // }, [accountAddress, hasAddress]);

   const handleClick = (e) => {
     e.preventDefault();
     console.log(userHasAddress, "hasAddress", projectCode, "projectCode");
     if (userHasAddress) {
       navigate(`/marketplace/listing?projectCode=${projectCode}`);
     } else {
       toast.error("Please Connect Your Wallet");
     }
   };

  return (
    <>
      <div className=" p-4 sm:p-6 w-full bg-[#F5F5F5] rounded-2xl">
        <div className="w-full bg-gray-300  h-[137px] rounded-2xl">
          {image && Array.isArray(image) && image?.length > 0 ? (
            <img
              src={image[0].image}
              className="w-full bg-cover object-cover h-[137px] rounded-2xl"
              alt={"Project Image"}
            />
          ) : (
            <div className="w-full flex justify-center items-center h-[137px] rounded-2xl">
              no image
            </div>
          )}
        </div>
        <div className=" mt-4 sm:mt-[29px] text-xl text-black font-semibold leading-[30px]">
          {title}
        </div>
        <div className={`flex items-center flex-wrap gap-4 my-3 sm:my-4`}>
          <div className="text-base text-[#1D1F2199] flex flex-col gap-2">
            <div className="font-semibold leading-[24px]">Project Code</div>
            <div className="font-normal leading-[22.4px]">{projectCode}</div>
          </div>

          <div className="text-base text-[#1D1F2199] flex flex-col gap-2">
            <div className="font-semibold leading-[24px]">Project Type</div>
            <div className="font-normal leading-[22.4px]">
              {projectType &&
              Array.isArray(projectType) &&
              projectType.length > 0 ? (
                <>
                  {projectType.length > 1 ? (
                    <>
                      {projectType[0].project_type} & {projectType.length} more
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
          <div className="text-base text-[#1D1F2199] flex flex-col gap-2">
            <div className="font-semibold leading-[24px]">Standards</div>
            <div className="font-normal leading-[22.4px]">
              {standards && Array.isArray(standards) && standards.length > 0 ? (
                <>
                  {standards.length > 1 ? (
                    <>
                      {standards[0].project_standard} & {standards.length} more
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
        <div className="flex text-base mb-3 sm:mb-4 flex-wrap w-full items-center gap-2">
          {ratingsCarbonRating ? (
            <div className="w-fit px-2 py-1 rounded-lg text-[#1D1F2199] bg-[#ECECEC]">
              {ratingsCarbonRating.carbon_rating}
            </div>
          ) : (
            ""
          )}
          {ratingscobenifit_rating ? (
            <div className="w-fit px-2 py-1 rounded-lg text-[#1D1F2199] bg-[#ECECEC]">
              {ratingscobenifit_rating.co_rating_obtained} Co-Benefits
            </div>
          ) : (
            ""
          )}
        </div>

        <div className="flex items-end gap-2">
          <div className="flex w-1/2 flex-col gap-2">
            <div className="text-black">
              <div className="text-base font-semibold leading-6">From</div>
              <div className="text-[28px] font-semibold leading-[33.6px]">
                {price}{" "}
                <span className="text-base text-[#1D1F2199] font-normal leading-[22.4px]">
                  { (!hasToken && userHasAddress) ? "USDT/" : "USD/"}{filterProjectType === "CarbonCredits" ? "Tonne" : "MWh"}
                </span>
              </div>
            </div>
            <div className="text-sm font-normal leading-[14px] text-[#1D1F2199]">
              <div>
                {availability > 0 ? (
                  <>
                    {availability} {filterProjectType === "CarbonCredits" ? "Tonne" : "MWh"} available
                  </>
                ) : (
                  <div className="inline-block text-red-600 font-semibold text-base shadow-sm animate-pulse">
                    Sold Out
                  </div>
                )}
              </div>
              
              <div>
                Vintages {vintagesStart} - {vintagesEnd}
              </div>
            </div>
          </div>
          <div
            onClick={(e) => {
              handleClick(e);
            }}
            className={` w-1/2 h-fit py-3 px-3 text-center bg-[#CDDC6E] text-black text-base font-semibold leading-6 rounded-lg cursor-pointer`}
          >
            Project Details
          </div>
        </div>
      </div>
    </>
  );
};

export default GirdCard;
