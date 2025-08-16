import React from "react";
import { Input, Typography } from "@material-tailwind/react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import { toast } from "react-toastify";
import { useContext } from "react";
import { UserContext } from "../../context/UserContext";
import loginIMG from "../../assets/loginpic.jpg"
const Otp = () => {
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const market = queryParams.get("market") || "market-place";
	const email = queryParams.get("email");
	const { setHasAddress, setHasToken } = useContext(UserContext);
	// console.log(market, "Market:", email);
	const navigate = useNavigate();

	// const apiUrl = import.meta.env.VITE_API_URL;
	  const apiUrl = "https://api.hestiya.com/api/"

	const inputRefs = React.useRef([]);
	const [otp, setOtp] = React.useState(Array(6).fill(""));

	// Function to submit OTP using axios
	const submitOtp = async (otpValue) => {
		try {
			const response = await axios.post(`${apiUrl}signup-detail/verify-otp/`, {
				email: email,
				otp: otpValue,
			});

			// console.log("OTP verified successfully:", response.data);

			if (response) {
				// console.log("response from otp is : ", response?.data);
				localStorage.setItem("token", JSON.stringify(response?.data));
				setHasAddress(response?.data?.address);
				setHasToken(response?.data);
				setTimeout(() => {
					toast.success("OTP verified successfully! Welcome to Hestiya.");

					if (market === "market-place") {
						navigate(`/marketplace?market=${market}`);
					} else if (market === "ocean-market") {
						// console.log("market", market);
						navigate(`/ocean?market=${market}`);
					}
				}, 1000);
			}
		} catch (error) {
			toast.error("Invalid or Expired OTP");
			//   console.error(
			//     "Error verifying OTP:",
			//     error.response ? error.response.data : error.message
			//   );
		}
	};

	// Function to handle OTP change
	const handleChange = (index, value) => {
		const newOtp = [...otp];
		newOtp[index] = value.replace(/[^0-9]/g, "");
		setOtp(newOtp);

		if (newOtp.every((digit) => digit !== "")) {
			const otpValue = newOtp.join("");
			// console.log("OTP Value:", otpValue);
			submitOtp(otpValue); // Call submit OTP API when OTP is complete
		}

		if (value && index < inputRefs.current.length - 1) {
			inputRefs.current[index + 1].focus();
		}
	};

	// Function to handle backspace
	const handleBackspace = (event, index) => {
		if (event.key === "Backspace" && !event.target.value && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	// Function to resend OTP using axios
	const resendOtp = async () => {
		try {
			const response = await axios.post(`${apiUrl}signup-detail/resend-otp/`, {
				email: email,
			});
			toast.success("OTP Resent Successfully");
			setOtp(Array(6).fill(""));
			inputRefs.current[0].focus();
			// console.log("OTP resent successfully. Check your email:", response.data);
		} catch (error) {
			//   console.error(
			//     "Error resending OTP:",
			//     error.response ? error.response.data : error.message
			//   );
			toast.error("Error Resending OTP");
		}
	};

	return (
		<div
			className="flex justify-center items-center min-h-[calc(100vh-68px)]"
			style={{
				backgroundImage:
					market === "market-place"
						? `url(${loginIMG})`
						: 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			<div className="w-full max-w-lg bg-white px-6 sm:px-10 py-10 sm:py-20 rounded-lg shadow-lg mx-4 sm:mx-auto">
				<div className="flex gap-1 items-center flex-col">
					<Typography
						variant="small"
						color="blue-gray"
						className="flex items-center break-all justify-center gap-1 text-center font-medium text-sm sm:text-base"
					>
						Enter the 6-digit OTP sent to{" "}
					</Typography>
					<Typography
						variant="small"
						color="blue-gray"
						className="flex items-center break-all justify-center gap-1 text-center font-medium text-sm sm:text-base"
					>
						<span className="font-bold ">{email}</span>
					</Typography>
				</div>

				<div className="my-4 flex items-center justify-center gap-1 sm:gap-2">
					{otp.map((digit, index) => (
						<React.Fragment key={index}>
							<Input
								type="text"
								maxLength={1}
								className="!w-8 sm:!w-10 appearance-none !border-t-blue-gray-200 text-center !text-lg placeholder:text-blue-gray-300 placeholder:opacity-100 focus:!border-t-gray-900"
								labelProps={{
									className: "before:content-none after:content-none",
								}}
								containerProps={{
									className: "!min-w-0 !w-8 sm:!w-10 !shrink-0",
								}}
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleBackspace(e, index)}
								inputRef={(el) => (inputRefs.current[index] = el)}
							/>
							{index === 2 && (
								<span className="text-2xl text-slate-700">-</span>
							)}
						</React.Fragment>
					))}
				</div>

				<Typography
					variant="small"
					className="text-center font-normal text-blue-gray-500 text-xs sm:text-sm"
				>
					Did not receive the code?{" "}
					<span className="font-bold cursor-pointer" onClick={resendOtp}>
						Resend
					</span>
				</Typography>
			</div>
		</div>
	);
};

export default Otp;
