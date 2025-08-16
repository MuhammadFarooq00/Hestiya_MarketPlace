/* eslint-disable no-mixed-spaces-and-tabs */
import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";

export const UserContext = createContext();

export const UserContextProvider = ({ children }) => {
	// const apiUrl = import.meta.env.VITE_API_URL;
	  const apiUrl = "https://api.hestiya.com/api/"
	const { address: accountAddress } = useAccount();
	const [userDetails, setUserDetails] = useState(null);
	const [hasAddress,setHasAddress] = useState();
	const [hasToken,setHasToken] = useState("");
	const [showSessionModal, setShowSessionModal]= useState(false);
	const [cartId, setCartId] = useState(() => {
		return localStorage.getItem("cartId") || "";
	});
	const [checkUserLogedin, setcheckUserLogedin] = useState(true) 
	const [isLoggedIn, setIsLoggedIn] = useState(true);

	useEffect(() => {
		if(hasToken || hasAddress){
			// console.log("check token: ", hasToken)
			// console.log("check address: ", hasAddress)
			return;
		}else{
			const addressFromLocalStorage = JSON.parse(localStorage.getItem("token"))?.address;
		const getToken = JSON.parse(localStorage.getItem("token"));
		const hasAddress = accountAddress || addressFromLocalStorage;
		setHasAddress(hasAddress);
		setHasToken(getToken);
		}
	  }, [accountAddress, hasAddress]);

	const [cartItemsNumber, setCartItemsNumber] = useState(0); // State to store cart items
	const [isLoading, setIsLoading] = useState(false); // State to track loading status

	const handleCartid = async () => {
		try {
			const userDate = {
				user: hasAddress,
			};
			const res = await axios.post(`${apiUrl}add-to-cart/`, userDate);
			// console.log("userDate with cartit", res.data.id);
			setCartId(res.data.id);
		} catch (error) {
			console.error("Error Adding to cart");
		}
	};

	// is ko m n phle comment kiya hua th is ki wja s koi issue th ...

	useEffect(() => {
		if (hasAddress && !cartId) {
			handleCartid();
		}
	}, [hasAddress, cartId]);

	useEffect(() => {
		if (cartId) {
			localStorage.setItem("cartId", cartId);
			fetchCartItems(cartId);
		} else {
			localStorage.removeItem("cartId");
		}
	}, [cartId]);

	const fetchCartItems = async (cartId) => {
		setIsLoading(true);
		try {
			const response = await axios.get(`${apiUrl}cart-item/?cart=${cartId}`);
			if (response) {
				const number = response.data.items.length;
				setCartItemsNumber(number);
			}
		} catch (error) {
			console.error("Error fetching cart items:", error);
		} finally {
			setIsLoading(false);
		}
	};

	// console.log("Check the token",hasToken);

	return (
		<UserContext.Provider
			value={{
				userDetails,
				setUserDetails,
				cartId,
				setCartId,
				fetchCartItems,
				cartItemsNumber,
				handleCartid,
				isLoading,
				hasAddress,
				hasToken,
				setHasToken,
				setHasAddress,
				checkUserLogedin, 
				setcheckUserLogedin,
				isLoggedIn,
				setIsLoggedIn,
				setShowSessionModal,
				showSessionModal
			}}
		>
			{children}
		</UserContext.Provider>
	);
};
