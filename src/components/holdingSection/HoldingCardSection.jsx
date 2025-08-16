import React, { useContext, useEffect, useState } from "react";
import CustomDropdown from "../Dropdowns/CustomDropdown";
import CartCard from "./CartCard";
import NoData from "../NoData";
import { useAccount } from "wagmi";
import { readContract } from "@wagmi/core";
import { config, projectId, metadata } from "../../config/WalletConfig";
import { abi } from "../../contractAbis";
import { hiestiyaProxy, getContract } from "../../abi";
import axios from "axios";
import Loader from "../loaders/Loader";
import { UserContext } from "../../context/UserContext";

const HoldingCardSection = () => {
  const [location, setLocation] = useState("");
  const { userDetails, hasAddress, hasToken } = useContext(UserContext);
  const [apiData, setApiData] = useState(null);
  const [dataLoading, setDataLoading] = useState(false); // Add loading state
  const [error, setError] = useState(null); // Add error state
  // const { address } = useAccount();
  // const apiUrl = import.meta.env.VITE_API_URL;
  const apiUrl = "https://api.hestiya.com/api/";
  // transfer Data into needed shape
  function transformData(result) {
    // Create a map to group data by projectId
    const dataMap = new Map();

    result.forEach((item) => {
      const projectId = Number(item.projectId); // Convert projectId to Number
      const credits = Number(item.purchase.credits); // Convert credits to Number

      // Create a new purchase object with credits as a number
      const purchase = {
        ...item.purchase,
        credits: credits,
      };

      // Update or add to the map entry for the projectId
      const existingData = dataMap.get(projectId) || {
        projectId,
        purchases: [],
        totalCredits: 0,
      };

      existingData.purchases.push(purchase); // Add the purchase to the list
      existingData.totalCredits += credits; // Sum up the credits

      dataMap.set(projectId, existingData);
    });

    // Convert the map back to an array
    return Array.from(dataMap.values());
  }

  const getProjectById = async () => {
    try {
      setDataLoading(true); // Set loading to true
      if (hasAddress) {
        const contract = await getContract();
        let result;
        if (hasToken) {
          result = await contract.getAllUserPurchaseRecord(hasAddress);
        } else {
          result = await readContract(config, {
            abi,
            address: hiestiyaProxy,
            functionName: "getAllUserPurchaseRecord",
            args: [hasAddress],
          });
        }

        // console.log("date set:", result);
        // Apply the transformation
        const dataTrans = transformData(result);

        // console.log("data trans", dataTrans);

        const projectResp = await axios.get(
          `${apiUrl}order/?address=${hasAddress}`
        );
        // console.log("ressss", projectResp.data);
        // console.log("projectResp", projectResp.data);
        const enhancedProjects2 = dataTrans
          .map((data) => {
            // Flatten the nested array of projects from projectResp.data
            const allProjects = projectResp.data.flatMap(
              (item) => item.project_vintages || []
            );
            // console.log("allProjects", allProjects);00
            const filter_project_type = allProjects?.map(
              (item) => item.filter_project_type
            );
            // console.log("allProjects", filter_project_type);
            // Find the matching project using the projectId
            const matchingProject2 = allProjects.find(
              (project) => Number(project.project_id) === Number(data.projectId)
            );
            if (matchingProject2) {
              const vintageMap = {};
              // Map through purchases to match vintages by year
              data.purchases.forEach((purchase) => {
                const matchingVintage = matchingProject2.vintages.find(
                  (vintage) => vintage.vintage_year === purchase.year
                );
                if (matchingVintage) {
                  const year = purchase.year;
                  if (!vintageMap[year]) {
                    // Add entry for the year only if it doesn't already exist
                    vintageMap[year] = {
                      id: matchingVintage.item_id, // Include items.id from the projectResp vintage
                      credits: purchase.credits, // Use the credits from the purchase
                      buyer: purchase.buyer,
                      year: purchase.year,
                    };
                  }
                }
              });
              // Convert the vintageMap to an array of unique vintages
              const uniqueVintages = Object.values(vintageMap);
              return {
                ...matchingProject2,
                // totalCredits: data.totalCredits,
                filter_project_type: filter_project_type,
                buyVintage: uniqueVintages,
              };
            }
            return null;
          })
          .filter(Boolean); // Filter out null projects
        // new

        // console.log("Enhanced Projects2:", enhancedProjects2);
        setApiData(enhancedProjects2);
      }
    } catch (error) {
      console.error("Error getById Project", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setDataLoading(false); // Set loading to false
    }
  };

  useEffect(() => {
    getProjectById();
  }, [hasAddress]);

  return (
    <div className="mx-4">
      {hasAddress ? (
        <>
          {dataLoading ? (
            <Loader />
          ) : error ? (
            <div className="flex justify-center items-center h-[80vh]">
              <p>{error}</p> {/* Show error message */}
            </div>
          ) : apiData?.length > 0  ? (
            <>
              <div className="xlll:mx-6 xl:mx-4 flex flex-col sm:flex-row gap-1 sm:gap-0 sm:items-center justify-between">
                <div className="text-lg sx:text-xl xl:text-[28px] font-semibold text-black leading-6 xl:leading-[33.6px]">
                  Hello{" "}
                  {userDetails && (
                    <>
                      {userDetails?.first_name} {userDetails?.last_name}
                    </>
                  )}
                </div>
                {/* <div className="w-full sm:w-[250px] xl:w-[270px]">
              <CustomDropdown
                label="Manage Holdings"
                showLabel={false}
                options={["Location 1", "Location 2", "Location 3"]}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  console.log("Selected Location:", e.target.value);
                }}
                id="location"
              />
            </div> */}
              </div>
              <div className="md:mt-9 mt-6 mb-6 md:mb-[91px]">
                {/* {console.log("apiData", apiData)} */}
                <div>
                  {apiData
                    .filter((item) => {
                      // Check if any buyVintage entry has credits > 0
                      return item.buyVintage?.some(
                        (vintage) => vintage.credits > 0
                      );
                    })
                    .map((item, index) => (
                      // console.log("item",index, item),
                      <CartCard
                        key={index}
                        image={item?.images}
                        projectCode={item.project_id}
                        projectCategory={item?.cat}
                        projectType={item?.type}
                        standards={item?.standard}
                        name={item.project_name}
                        availability={item?.availability}
                        vintages={item?.buyVintage}
                        ratingsCarbonRating={item?.carbon_rating}
                        ratingscobenifit_rating={item?.cobenifit_rating}
                        getProjectById={getProjectById}
                        filter_project_type={item?.filter_project_type[index]}
                      />
                    ))}
                  {/* {apiData.map((item, index) => (
										console.log("item", item),
										<CartCard
											key={index}
											image={item?.images}
											projectCode={item.project_id}
											projectCategory={item?.cat}
											projectType={item?.type}
											standards={item?.standard}
											name={item.project_name}
											availability={item?.availability}
											vintages={item?.buyVintage}
											ratingsCarbonRating={item?.carbon_rating}
											ratingscobenifit_rating={item?.cobenifit_rating}
											getProjectById={getProjectById}
											filter_project_type={item?.filter_project_type[0]}
										/>
									))} */}
                </div>
              </div>
            </>
          ) : (
            <NoData
              headingText={"No Available Holdings"}
              paraText={"You don't have any available holdings at the moment."}
              height={"80vh"}
            />
          )}
        </>
      ) : (
        <NoData
          height={"80vh"}
          headingText={"Log in to Continue"}
          paraText={
            "Please make sure yor are logged in to proceed with transactions."
          }
        />
      )}
    </div>
  );
};

export default HoldingCardSection;
