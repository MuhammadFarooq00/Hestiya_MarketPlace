import React from "react";
import { ReactComponent as SDG1Icon } from "../../../assets/svg/SDG1 copy.svg";
import { ReactComponent as SDG2Icon } from "../../../assets/svg/SDG2 copy.svg";
import { ReactComponent as SDG3Icon } from "../../../assets/svg/sdg3 copy.svg";
import { ReactComponent as SDG4Icon } from "../../../assets/svg/SDG4 copy.svg";
import { ReactComponent as SDG5Icon } from "../../../assets/svg/sdg5 copy.svg";
import { ReactComponent as SDG6Icon } from "../../../assets/svg/sdg6 copy.svg";
import { ReactComponent as SDG7Icon } from "../../../assets/svg/sdg7 copy.svg";
import { ReactComponent as SDG8Icon } from "../../../assets/svg/sdg8 copy.svg";
import { ReactComponent as SDG9Icon } from "../../../assets/svg/sdg9 copy.svg";
import { ReactComponent as SDG10Icon } from "../../../assets/svg/sdg10 copy.svg";
import { ReactComponent as SDG11Icon } from "../../../assets/svg/sdg11 copy.svg";
import { ReactComponent as SDG12Icon } from "../../../assets/svg/SDG12 copy.svg";
import { ReactComponent as SDG13Icon } from "../../../assets/svg/SDG13 copy.svg";
import { ReactComponent as SDG14Icon } from "../../../assets/svg/sdg14 copy.svg";
import { ReactComponent as SDG15Icon } from "../../../assets/svg/sdg15 copy.svg";
import { ReactComponent as SDG16Icon } from "../../../assets/svg/sdg16 copy.svg";
import { ReactComponent as SDG17Icon } from "../../../assets/svg/sdg17 copy.svg";

const sdgData = {
  1: { icon: SDG1Icon },
  2: { icon: SDG2Icon },
  3: { icon: SDG3Icon },
  4: { icon: SDG4Icon },
  5: { icon: SDG5Icon },
  6: { icon: SDG6Icon },
  7: { icon: SDG7Icon },
  8: { icon: SDG8Icon },
  9: { icon: SDG9Icon },
  10: { icon: SDG10Icon },
  11: { icon: SDG11Icon },
  12: { icon: SDG12Icon },
  13: { icon: SDG13Icon },
  14: { icon: SDG14Icon },
  15: { icon: SDG15Icon },
  16: { icon: SDG16Icon },
  17: { icon: SDG17Icon },
};

const SDGCard = ({ icon: Icon }) => (
  <Icon className="w-[50px] rounded-lg h-[50px]" />
);

const SDGImage = ({ sdgNumbers }) => {
  if (!Array.isArray(sdgNumbers)) {
    return null;
  }
  const matchedSDGs = sdgNumbers
    .filter((number) => sdgData[number])
    .map((number) => ({ ...sdgData[number], number }));

  return (
    <div className="flex gap-1 items-center">
      {matchedSDGs.map((sdg) => (
        <SDGCard key={sdg.number} {...sdg} />
      ))}
    </div>
  );
};

export default SDGImage;

// sdgNumbers
