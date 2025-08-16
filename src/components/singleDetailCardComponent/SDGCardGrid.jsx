import React from "react";
import { ReactComponent as SDG1Icon } from "../../assets/svg/SDG1.svg";
import { ReactComponent as SDG2Icon } from "../../assets/svg/SDG2.svg";
import { ReactComponent as SDG3Icon } from "../../assets/svg/sdg3.svg";
import { ReactComponent as SDG4Icon } from "../../assets/svg/SDG4.svg";
import { ReactComponent as SDG5Icon } from "../../assets/svg/sdg5.svg";
import { ReactComponent as SDG6Icon } from "../../assets/svg/sdg6.svg";
import { ReactComponent as SDG7Icon } from "../../assets/svg/sdg7.svg";
import { ReactComponent as SDG8Icon } from "../../assets/svg/sdg8.svg";
import { ReactComponent as SDG9Icon } from "../../assets/svg/sdg9.svg";
import { ReactComponent as SDG10Icon } from "../../assets/svg/sdg10.svg";
import { ReactComponent as SDG11Icon } from "../../assets/svg/sdg11.svg";
import { ReactComponent as SDG12Icon } from "../../assets/svg/SDG12.svg";
import { ReactComponent as SDG13Icon } from "../../assets/svg/SDG13.svg";
import { ReactComponent as SDG14Icon } from "../../assets/svg/sdg14.svg";
import { ReactComponent as SDG15Icon } from "../../assets/svg/sdg15.svg";
import { ReactComponent as SDG16Icon } from "../../assets/svg/sdg16.svg";
import { ReactComponent as SDG17Icon } from "../../assets/svg/sdg17.svg";

const sdgData = {
  1: { icon: SDG1Icon, title: "No Poverty", label: "SDG 1" },
  2: { icon: SDG2Icon, title: "Zero Hunger", label: "SDG 2" },
  3: { icon: SDG3Icon, title: "Good Health and Well-being", label: "SDG 3" },
  4: { icon: SDG4Icon, title: "Quality Education", label: "SDG 4" },
  5: { icon: SDG5Icon, title: "Gender Equality", label: "SDG 5" },
  6: {
    icon: SDG6Icon,
    title: "Clean Water and Sanitation for All",
    label: "SDG 6",
  },
  7: { icon: SDG7Icon, title: "Affordable and Clean Energy", label: "SDG 7" },
  8: {
    icon: SDG8Icon,
    title: "Decent Work and Economic Growth",
    label: "SDG 8",
  },
  9: {
    icon: SDG9Icon,
    title: "Industry, Innovation and Infrastructure",
    label: "SDG 9",
  },
  10: { icon: SDG10Icon, title: "Reduced Inequalities", label: "SDG 10" },
  11: {
    icon: SDG11Icon,
    title: "Sustainable Cities and Communities",
    label: "SDG 11",
  },
  12: {
    icon: SDG12Icon,
    title: "Responsible Consumption and Production",
    label: "SDG 12",
  },
  13: { icon: SDG13Icon, title: "Climate Action", label: "SDG 13" },
  14: { icon: SDG14Icon, title: "Life Below Water", label: "SDG 14" },
  15: { icon: SDG15Icon, title: "Life on Land", label: "SDG 15" },
  16: {
    icon: SDG16Icon,
    title: "Peace, Justice and Strong Institutions",
    label: "SDG 16",
  },
  17: { icon: SDG17Icon, title: "Partnerships for the Goals", label: "SDG 17" },
};

const SDGCard = ({ icon: Icon, title, label }) => (
  <div className="text-center flex-col items-center h-[300px] lg:h-[350px] justify-between px-2 bg-[#BDC3C733] text-black flex py-[33px] rounded-md">
    <div className="flex flex-col items-center">
      <Icon className="mb-2 w-[116px] rounded-lg h-[116px]" />
      <div className="text-[21.2px] uppercase font-semibold leading-[25.44px]">
        {title}
      </div>
      <div className="text-[15.14px] font-medium leading-[18.17px]">
        {label}
      </div>
    </div>
    <div className="text-[#314033] text-[15.14px] leading-[18.17px]">
      <a
        href={`https://sdgs.un.org/goals/goal${label.replace("SDG ", "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#314033] text-[15.14px] leading-[18.17px] hover:text-blue-600 duration-300 ease-in-out"
      >
        Read More
      </a>
    </div>
  </div>
);

const SDGCardGrid = ({ sdgNumbers }) => {
  if (!Array.isArray(sdgNumbers)) {
    return null;
  }
  const matchedSDGs = sdgNumbers
    .filter((number) => sdgData[number])
    .map((number) => ({ ...sdgData[number], number }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 lg:gap-x-9 gap-y-6 lg:gap-y-[78px]">
      {matchedSDGs.map((sdg) => (
        <SDGCard key={sdg.number} {...sdg} />
      ))}
    </div>
  );
};

export default SDGCardGrid;
