import React from "react";
import { ReactComponent as NoDateIcon } from "../assets/svg/no-data.svg";

const NoData = ({ headingText, paraText, height }) => {
	return (
		<div
			className={`md:mt-9 flex justify-center items-center mt-6 h-[${height}]`}
		>
			<div className="flex flex-col gap-4 sm:gap-[73px] items-center">
				<NoDateIcon className="w-32 h-32 sm:w-[200px] sm:h-[200px] lg:w-[260px] lg:h-[260px]" />
				<div className="text-center px-2">
					<div className=" text-xl md:text-4xl text-black font-semibold leading-[54px]">
						{headingText}
					</div>
					<div className="mt-1 md:mt-3 text-[#1D1F2199] text-base font-semibold leading-6">
						{paraText}
					</div>
				</div>
			</div>
		</div>
	);
};

export default NoData;
