import { useEffect, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Zoom from "yet-another-react-lightbox/plugins/zoom"; // Remove Thumbnails import
import { ReactComponent as LocationIcon } from "../../../assets/svg/location-svg.svg";
import { ReactComponent as ProjectCategoryIcon } from "../../../assets/svg/project-category.svg";
import { ReactComponent as ProjectSizeIcon } from "../../../assets/svg/project-Size.svg";
import { ReactComponent as ProjectTypeIcon } from "../../../assets/svg/project-Type.svg";
import { ReactComponent as DeveloperIcon } from "../../../assets/svg/developer.svg";
import { ReactComponent as EligibilitiesIcon } from "../../../assets/svg/eligibilities.svg";
import { ReactComponent as ProjectRegistryIcon } from "../../../assets/svg/project-Registry.svg";
import { ReactComponent as StandardIcon } from "../../../assets/svg/standard.svg";
import { ReactComponent as GlanceCard1Icon } from "../../../assets/svg/glance-card-1.svg";
import { ReactComponent as GlanceCard2Icon } from "../../../assets/svg/glance-card-3.svg";
import { ReactComponent as GlanceCard3Icon } from "../../../assets/svg/glance-card-2.svg";
import { images } from "../../../assets/index";
import { useLocation } from "react-router-dom";
import Loader from "../../loaders/Loader";
import axios from "axios";
import SDGCardGrid from "../../singleDetailCardComponent/SDGCardGrid";
import DOMPurify from "dompurify";
import IssuancesTableByID from "./IssuancesTableByID";
import RetirementTableByID from "./RetirementTableByID";

const ProjectDetails = () => {
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const projectCode = queryParams.get("projectId");
	//   const { sidebarWidth } = useContext(SidebarContext);
	const [index, setIndex] = useState(-1);
	// const apiUrl = import.meta.env.VITE_API_URL;
	  const apiUrl = "https://api.hestiya.com/api/"
	// for API
	const [apiData, setApiData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const photos = apiData?.images?.map((image) => ({
		src: image?.image,
		alt: "Gallery Image",
		width: 1080,
		height: 720,
	}));

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
			const res = await axios.get(`${apiUrl}reg-detail/${projectCode}`);
			// console.log("hi::::::", res);
			setApiData(res.data);
		} catch (error) {
			setError(error.message);
			console.error("Error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [projectCode]);

	if (loading) return <Loader />;
	if (error)
		return (
			<div className="flex justify-center items-center h-[80vh]">
				Error: {error}
			</div>
		);

	return (
		<>
			<div className="flex justify-center w-full pt-8 xlll:px-6 xl:px-4 px-2">
				<div
					className={`flex flex-col gap-5 md:gap-7 w-full xl:w-2/3 xll:container  xl:gap-9 h-[170px] md:h-[320px] lg:h-[415px] `}
				>
					<div className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
						{apiData?.name}
					</div>

					<div className={`flex gap-1 md:gap-[11px]`}>
						<div
							className={`relative w-full h-[170px] md:h-[320px] lg:h-[415px]`}
						>
							<img
								src={photos[0]?.src}
								alt={photos[0]?.alt}
								onClick={() => setIndex(0)}
								className="w-full  h-[170px] md:h-[320px] lg:h-[415px] rounded-2xl object-cover cursor-pointer"
							/>
							{photos.length > 3 && (
								<button
									onClick={() => setIndex(0)}
									className="absolute bottom-7 left-8 bg-[#CDDC6E] text-black py-3 px-4 text-sm lg:text-base font-semibold leading-6 rounded-lg"
								>
									View All Images
								</button>
							)}
						</div>
						{photos.length > 1 && photos.length <= 3 && (
							<div
								className={`flex flex-col gap-1 md:gap-[11px] w-1/3 xlll:w-[311px]`}
							>
								{photos?.slice(1)?.map((photo, i) => (
									<img
										key={i}
										src={photo?.src}
										alt={photo?.alt}
										onClick={() => setIndex(i + 1)}
										className="w-full h-[82.5px] md:h-[155px] lg:h-[202px] rounded-2xl object-cover cursor-pointer"
									/>
								))}
							</div>
						)}
						{photos.length > 3 && (
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

					{/* Project Overview */}
					{/* <div className="flex flex-col gap-5 md:gap-7 xl:gap-9 text-black">
            <div className=" text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
              Project Overview
            </div>
            <div
              className=" text-sm lg:text-base font-normal leading-[22.4px]"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(apiData?.details?.description),
              }}
            ></div>
          </div> */}
					{/* Project Overview */}

					{/* Project Overview banner */}
					{/* <div className="rounded-xl p-9 flex flex-wrap gap-5 md:gap-[46px] bg-[#BDC3C733] ">
            <div>
              <div className="w-[82px] mb-[11px] h-[82px] rounded-full">
                <img className="" src={images.VerraLogo} alt="" />
              </div>
              <div className="text-sm lg:text-base mb-1 text-black font-normal leading-[22.4px]">
                Project Registry
              </div>
              <div className="text-sm text-[#1D1F2199] font-normal leading-[14px]">
                {apiData?.registry[0]?.registry_name}
              </div>
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
              <div className="text-sm text-[#1D1F2199] font-normal leading-[14px]">
                provided by Hestiya
              </div>
            </div>
          </div> */}
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
									<div className=" text-black text-sm lg:text-base font-normal leading-[22.4px]  pr-0 md:pr-2">
										{apiData?.project_country?.country ?? "--"}
									</div>
								</div>
								<div className="flex flex-col items-center md:items-start">
									<ProjectCategoryIcon className="mb-4" />
									<div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
										Project Category
									</div>
									<div className="  pr-0 md:pr-2 text-black text-sm lg:text-base font-normal leading-[22.4px]">
										{apiData?.cat &&
										Array.isArray(apiData?.cat) &&
										apiData?.cat?.length > 0 ? (
											<>
												{apiData?.cat?.map((cat, i) => (
													<span key={i}>
														{cat?.cat_name}
															{i < apiData?.cat?.length - 1 ? ", " : " "}
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
										Project Size {(apiData?.filter_project_type ?? "CarbonCredits") === "CarbonCredits" ? "(Hectares)" : "MWh" } 
									</div>
									<div className=" text-black text-sm lg:text-base font-normal leading-[22.4px]  pr-0 md:pr-2">
										{apiData?.details?.project_size ?? "--"}
									</div>
								</div>
								<div className="flex flex-col items-center md:items-start">
									<ProjectTypeIcon className="mb-4" />
									<div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
										Project Type
									</div>
									<div className=" text-black text-sm lg:text-base font-normal leading-[22.4px]  pr-0 md:pr-2">
										{apiData?.type &&
										Array.isArray(apiData?.type) &&
										apiData?.type.length > 0 ? (
											<>
												{apiData.type.map((type, index) => (
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
									<div className=" text-black text-sm lg:text-base font-normal leading-[22.4px]  pr-0 md:pr-2">
										{apiData?.details?.developer ?? "--"}
									</div>
								</div>
								<div className="flex flex-col items-center md:items-start">
									<EligibilitiesIcon className="mb-4" />
									<div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
										Eligibilities
									</div>
									<div className=" text-black text-sm lg:text-base font-normal leading-[22.4px]  pr-0 md:pr-2">
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
								<div className=" text-lg md:text-xl font-medium text-[#1D1F2199] leading-[24px]">
									Project Code: {apiData?.project_code}
								</div>
							</div>

							<div className="grid grid-cols-1 sm:text-start text-center sm:grid-cols-2 md:grid-cols-3 justify-between gap-y-9">
								<div className="flex flex-col items-center md:items-start">
									<ProjectRegistryIcon className="mb-4" />
									<div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
										Project Registry
									</div>
									<div className=" text-black text-sm lg:text-base font-normal leading-[22.4px]  pr-0 md:pr-2">
										{apiData?.registry?.registry_name}
									</div>
								</div>
								<div className="flex flex-col items-center md:items-start">
									<StandardIcon className="mb-4" />
									<div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
										Standard
									</div>
									<div className= "pr-0 md:pr-2 text-black text-sm lg:text-base font-normal leading-[22.4px]">
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
									<ProjectTypeIcon className="mb-4" />
									<div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
										Methodology
									</div>
									<div className= "pr-0 md:pr-2 text-black text-sm lg:text-base font-normal leading-[22.4px]">
										{apiData?.registry?.methodology}
									</div>
								</div>
								<div className="flex flex-col items-center md:items-start">
									<ProjectTypeIcon className="mb-4" />
									<div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
										Additional Certification
									</div>
									<div className= "pr-0 md:pr-2 text-black text-sm lg:text-base font-normal leading-[22.4px]">
										{apiData?.certifications &&
										Array.isArray(apiData.certifications) &&
										apiData.certifications.length > 0 ? (
											<>
												{apiData.certifications.map((certi, index) => {
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
									<div className= "pr-0 md:pr-2 text-black text-sm lg:text-base font-normal leading-[22.4px]">
										{apiData?.registry?.project_validator ?? "--"} <br />
										Issue date:{" "}
										{apiData?.registry?.project_validator_date ?? "--"}
									</div>
								</div>
								<div className="flex flex-col items-center md:items-start">
									<ProjectTypeIcon className="mb-4" />
									<div className=" text-black mb-1 md:mb-3 text-lg lg:text-xl font-semibold leading-6 md:leading-7 lg:leading-[30px]">
										CCB Validator
									</div>
									<div className= "pr-0 md:pr-2 text-black text-sm lg:text-base font-normal leading-[22.4px]">
										{apiData?.registry?.cbb_validator ?? "--"} <br />
										Issue date:{" "}
										{apiData?.registry?.cbb_validator_date ?? "--"}
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
						{/* <div className=" text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
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
            </div> */}
						{/* <div className="rounded-xl flex-col md:flex-row items-start p-5 md:p-9 flex bg-[#BDC3C733] ">
              <div className="w-full md:w-1/5">
                
                <div className="w-[82px] mb-[11px] bg-[#1D2F80] text-sm lg:text-base font-semibold text-white flex justify-center items-center h-[82px] rounded-full">
                  {apiData?.carbon_rating?.carbon_rating}
                </div>
                <div className="text-sm lg:text-base mb-1 text-black font-normal leading-[22.4px]">
                  Carbon Rating
                </div>
                <div className="text-sm text-[#1D1F2199] font-normal leading-[14px]">
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
            </div> */}
					</div>
					{/* Carbon Impact & Performance */}

					{/* Co-Benefit Impact */}
					<div className=" text-black flex flex-col gap-5 md:gap-7 xl:gap-9">
						{/* <div className=" text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
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
            </div> */}
						{/* <div className="rounded-xl items-start flex-col md:flex-row gap-3 md:gap-0 p-5 md:p-9 flex bg-[#BDC3C733] ">
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
                <div className="text-sm lg:text-base mb-1 text-black font-normal leading-[22.4px]">
                  Co-benefit Rating
                </div>
                <div className="text-sm text-[#1D1F2199] font-normal leading-[14px]">
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
            </div> */}
						{/* Additional Certifications */}
						<div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
							Additional Certifications
						</div>
						{/* <div
              className="text-sm lg:text-base font-normal leading-[22.4px]"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  apiData?.certifications[0]?.description
                ),
              }}
            ></div> */}
						<div className="rounded-lg">
							<img
								className="w-[310px]"
								src={apiData?.certifications[0]?.file}
								alt="Additional Certifications"
							/>
						</div>
						{/* Impact at a glance */}

                      <div>
					  <div className="text-xl md:text-2xl my-3 mb-10 xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
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
					  </div>
                       

						{/* <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
              Impact at a glance
            </div> */}
						{/* <div
              className="text-sm lg:text-base font-normal leading-[22.4px]"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  apiData?.impact_at_glance[0]?.impact_text
                ),
              }}
            >
            </div> */}
						{/* Impact at a glance card  */}
						{/* <div className="flex flex-col gap-5 md:gap-7 xl:gap-9">
              
              <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center rounded-xl bg-[#8BDB71B2] p-5 md:p-9">
                <GlanceCard1Icon className="!min-w-[90px]" />
                <div className="flex flex-col gap-3 md:gap-6">
                  <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                    Over {apiData?.impact_at_glance[0]?.value_one}
                  </div>
                  <div className="text-sm lg:text-base font-semibold leading-6">
                    tCO2e of emission reductions over the project's lifetime to
                    date Emission reductions are expected to continue over the
                    project's lifetime of 30 years.
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center rounded-xl bg-[#8BDB71B2] p-5 md:p-9">
                <GlanceCard2Icon className="!min-w-[90.02px]" />
                <div className="flex flex-col gap-3 md:gap-6">
                  <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                    {apiData?.impact_at_glance[0]?.value_two}
                  </div>
                  <div className="text-sm lg:text-base font-semibold leading-6">
                    land tenure documents for family plots owned by local
                    communities Providing land ownership to the communities
                    encourages permanent benefits beyond the project lifetime.
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-center rounded-xl bg-[#8BDB71B2] p-5 md:p-9">
                <GlanceCard3Icon className="!min-w-[90px]" />
                <div className="flex flex-col gap-3 md:gap-6">
                  <div className="text-xl md:text-2xl xl:text-[28px] font-semibold xl:leading-[33.6px] md:leading-[29px] leading-[26px]">
                    {apiData?.impact_at_glance[0]?.value_three}
                  </div>
                  <div className="text-sm lg:text-base font-semibold leading-6">
                    Critically Endangered or Endangered species benefitted from
                    reduced threats Species like the Brazilian giant tortoise
                    benefit from reduced threats due to project activities that
                    conserve their habitats.
                  </div>
                </div>
              </div>
            </div> */}
						{/* Impact at a glance card  */}
					</div>
					{/* Co-Benefit Impact */}

					{/* Reporting framework & Co-benefit Impact */}
					<div className="text-black flex flex-col gap-5 md:gap-7 xl:gap-9 mt-3">
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
						{/* 2324 */}
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
											href="https://sdgs.un.org/goals"
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

					<div className="flex flex-col  text-black">
						<div className=" text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
							Issuances List
						</div>
						<IssuancesTableByID projectId={projectCode} />
					</div>
					<div className="flex flex-col  text-black">
						<div className=" text-2xl md:text-3xl lg:text-4xl font-semibold leading-8 md:leading-10 lg:leading-[54px]">
							Retirement List
						</div>
						<RetirementTableByID projectId={projectCode} />
					</div>

					<div className="pb-8"></div>
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
};

export default ProjectDetails;
