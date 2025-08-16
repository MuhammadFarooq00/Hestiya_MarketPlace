import React from "react";
import { useNavigate } from "react-router-dom";

const CardSection = ({
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
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/listing?projectCode=${projectCode}`);
    
  };
  
  return (
    <>
      <div className="xlll:mx-6 xl:mx-4 mt-2">
        <div className="w-full py-[25px] px-[23px] rounded-xl bg-[#F5F5F5]">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-10  xll:justify-between">
            <div className="flex gap-[23px]">
              <div className="w-full bg-gray-300 sm:max-w-[200px] h-[200px] rounded-xl">
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
                  {title}
                </div>
                <div
                  className={`flex items-center ${
                    sidebarWidth === "w-24"
                      ? "gap-8 xlll:gap-[54px]"
                      : "gap-10 xlll:gap-[54px]"
                  }`}
                >
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
                    <div
                      className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]"
                    >
                      {ratingsCarbonRating.carbon_rating}
                    </div>
                  ) : (
                    ""
                  )}
                  {ratingscobenifit_rating ? (
                    <div
                      className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]"
                    >
                      {ratingscobenifit_rating.co_rating_obtained} Co-Benefits
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
            <div className="border-r-[1px] border-[#BDC3C7]"></div>
            <div className="flex gap-[20px] flex-col">
              <div className="text-black">
                <div className="text-base font-semibold leading-6">From</div>
                <div className="text-[28px] font-semibold leading-[33.6px]">
                  {price}{" "}
                  <span className="text-base text-[#1D1F2199] font-normal leading-[22.4px]">
                    USDT/Tonne
                  </span>
                </div>
              </div>
              <div className="text-sm font-normal leading-[14px] text-[#1D1F2199]">
                <div>{availability}</div>
                <div>
                  Vintages {vintagesStart} - {vintagesEnd}
                </div>
              </div>
              <div
                onClick={() => {
                  handleClick();
                }}
                className={`py-3 text-center xlll:px-8 ${
                  sidebarWidth === "w-24"
                    ? "w-full sm:w-[300px] xlll:w-[350px]"
                    : "w-full sm:w-[300px] lg:w-full xlll:w-[240px]"
                } bg-[#CDDC6E] text-black text-base font-semibold leading-6 rounded-lg cursor-pointer`}
              >
                Project Details
              </div>
            </div>
          </div>
          <div className="mt-6 flex xl:hidden flex-col gap-6">
            <div className="text-xl font-semibold leading-[30px]">{title}</div>
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
            <div className="flex flex-wrap w-2/3 items-center gap-4">
                  {ratingsCarbonRating &&
                  Array.isArray(ratingsCarbonRating) &&
                  ratingsCarbonRating.length > 0 ? (
                    <div
                      className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]"
                    >
                      {ratingsCarbonRating[0].carbon_rating}
                    </div>
                  ) : (
                    ""
                  )}
                  {ratingscobenifit_rating &&
                  Array.isArray(ratingscobenifit_rating) &&
                  ratingscobenifit_rating.length > 0 ? (
                    <div
                      className="w-fit px-6 py-2 rounded-lg bg-[#ECECEC]"
                    >
                      {ratingscobenifit_rating[0].co_rating_obtained} Co-Benefits
                    </div>
                  ) : (
                    ""
                  )}
                </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CardSection;
