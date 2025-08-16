/* eslint-disable no-mixed-spaces-and-tabs */
import {
	createBrowserRouter,
	RouterProvider,
	Navigate,
	useLocation,
	useNavigate,
  } from "react-router-dom";
  import { useCallback, useEffect, useMemo, useState,useContext,useRef } from "react";
  import { useAccount } from "wagmi";
  import axios from "axios";
  import "./index.css";
  import MarketSpaceLayout from "./layout/marketplace/MarketSpaceLayout";
  import Layout from "./layout/Layout";
  // Import other components...
  import { ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import "react-datepicker/dist/react-datepicker.css";
  import "react-phone-input-2/lib/style.css";
import "./index.css";

import MarketListing from "./pages/marketplacePage/MarketListing";
import SingleCardDetail from "./pages/marketplacePage/SingleCardDetail";
import CartListing from "./pages/marketplacePage/CartListing";
import P2pPage from "./pages/marketplacePage/P2pPage";
import Holding from "./pages/marketplacePage/Holding";
import ActiveHistory from "./pages/marketplacePage/ActiveHistory";
import "react-toastify/dist/ReactToastify.css";
import HomeLayout from "./layout/publicHistory/HomeLayout";
import Public from "./pages/homeLayoutPage/Public";
import Credits from "./pages/homeLayoutPage/Credits";
import "react-datepicker/dist/react-datepicker.css";
import ProjectDetail from "./pages/homeLayoutPage/ProjectDetail";
import SignUp from "./pages/loginSignInPages/SignUp";
import IssuancesListDetail from "./pages/homeLayoutPage/IssuancesListDetail";
import MianPage from "./pages/loginSignInPages/MianPage";
import "react-phone-input-2/lib/style.css";
import Instruction from "./pages/oceanPages/Instruction";
import Questionnaire from "./pages/oceanPages/Questionnaire";
import Residence from "./pages/oceanPages/Residence";
import MultiQuestion from "./pages/oceanPages/MultiQuestion";
import SpinnerLoader from "./components/loaders/SpinnerLoader";
import Otp from "./pages/loginSignInPages/Otp";
import Recovery from "./pages/loginSignInPages/Recovery";
import FAQ from "./pages/FAQ";
import PrivatePolicies from "./pages/PrivatePolicies";
import SignIn from "./pages/loginSignInPages/SignIn";
import Method from "./pages/loginSignInPages/Method";
import Profile from "./pages/marketplacePage/Profile";
import ConfirmResetPassword from "./pages/loginSignInPages/ConfirmPassword";
import SessionExpiredModal from "./components/SessionExpiredModal";
import { UserContext } from "./context/UserContext";

  
const ProtectedRoute = ({ children }) => {
  const { address: accountAddress, isConnected } = useAccount();
  const { hasAddress } = useContext(UserContext);
  const location = useLocation();

  const checkAddress = !!accountAddress || !!localStorage.getItem("token") || !!hasAddress;

  if (!hasAddress) {
	return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};
  
  const AuthProtectedRoute = ({ children }) => {
	const token = useMemo(() => localStorage.getItem("token"), []);
	const { address: accountAddress } = useAccount();
	  const { hasAddress } = useContext(UserContext);
	const location = useLocation();
  
	const isRestrictedRoute = useMemo(() => {
	  const restrictedPaths = new Set(["/", "/sign-in", "/choice-method", 
		"/sign-detail", "/recovery", "/otp"]);
	  return restrictedPaths.has(location.pathname) || 
		location.pathname.startsWith("/otp/");
	}, [location.pathname]);
  
	if (token && isRestrictedRoute) {
	  return <Navigate to="/marketplace" replace />;
	}
  
	return children;
  };


 const AppRouter = () => {
	return useMemo(()=>  createBrowserRouter([
	  {
		path: "/",
		element: (
		  <AuthProtectedRoute>
			<Layout />
		  </AuthProtectedRoute>
		),
		children: [
		  { path: "", element: <MianPage /> },
		  { path: "sign-in", element: <SignIn /> },
		  { path: "choice-method", element: <Method /> },
		  { path: "sign-detail", element: <SignUp /> },
		  { path: "recovery", element: <Recovery /> },
		  { path: "confirm-password", element: <ConfirmResetPassword /> },
		  { path: "otp", element: <Otp /> },
		  {path:"private-policies",element: <PrivatePolicies />}
		],
	  },
	  {
		path: "marketplace",
		element: (
		  <ProtectedRoute>
			<MarketSpaceLayout />
		  </ProtectedRoute>
		),
		children: [
		  { path: "", element: <MarketListing /> },
		  { path: "cart", element: <CartListing /> },
		  { path: "portfolio", element: <Holding /> },
		  { path: "P2P-trading", element: <P2pPage /> },
		  { path: "history", element: <ActiveHistory /> },
		  { path: "listing", element: <SingleCardDetail /> },
		  { path: "profile", element: <Profile /> },
		  { path: "faq", element: <FAQ /> },
		  {path: "private-policies", element: <PrivatePolicies />},
	  
		  // Hestiya Registry as a sub-route
		  {
			path: "hestiya-registory",
			element: <HomeLayout />,
			children: [
			  { path: "", element: <Public /> },
			  { path: "credits", element: <Credits /> },
			  {path: "irecs", element: <Credits />},
			  { path: "detail", element: <ProjectDetail /> },
			  { path: "issuance-detail", element: <IssuancesListDetail /> },
			],
		  },
		],
	  }
	]), []);
  };
  
  function App() {
	  const [sessionExpired, setSessionExpired] = useState(false);
	  const { isConnected, address } = useAccount();
	  const {setShowSessionModal, showSessionModal,hasAddress} = useContext(UserContext);
	
  // Use a ref to track the interceptor
   useEffect(() => {
	const interceptor = axios.interceptors.response.use(
	  (response) => response,
	  (error) => {
		// Skip all checks if wallet is connected
		if (isConnected || address ) return Promise.reject(error);

		const isSignupError = error.config?.url?.includes('/signup-detail');
		const isTokenError = error.response?.status === 401 || 
		  error.response?.data?.detail?.toLowerCase().includes("token") ||
		  error.response?.data?.error?.toLowerCase().includes("token");
		
		// Only show modal if there's a token in localStorage
		if ((isTokenError || isSignupError) && localStorage.getItem("token")) {
		  setSessionExpired(true);
		  localStorage.clear();
		}
		return Promise.reject(error);
	  }
	);

	return () => {
	  axios.interceptors.response.eject(interceptor);
	};
  }, []);

 const handleLoginAgain = useCallback(() => {
  localStorage.clear();
  setSessionExpired(false);
  window.location.href = "/sign-in";
}, []);
	return (
	  <>
	  {!isConnected && (
		<SessionExpiredModal 
		  open={sessionExpired} 
		  onLogin={handleLoginAgain} 
		/>
	  )}

		<RouterProvider router={AppRouter()} />
		<ToastContainer />
	  </>
	);
  }
  
  export default App;































//   const AppRouter = () => {
// 	return useMemo(() => createBrowserRouter([
// 	  {
// 		path: "/",
// 		element: (
// 		//   <AuthProtectedRoute>
// 			<Layout />
// 		//   </AuthProtectedRoute>
// 		),
// 		children: [
// 		  { path: "", element: <MianPage /> },
// 		  { path: "sign-in", element: <SignIn /> },
// 		  { path: "choice-method", element: <Method /> },
// 		  { path: "sign-detail", element: <SignUp /> },
// 		  { path: "recovery", element: <Recovery /> },
// 		  { path: "confirm-password", element: <ConfirmResetPassword /> },
// 		  { path: "otp", element: <Otp /> },
// 		  {path:"private-policies",element: <PrivatePolicies />}
// 		],
// 	  },
// 	  {
// 		path: "marketplace",
// 		element: (
// 		//   <ProtectedRoute>
// 			<MarketSpaceLayout />
// 		//   </ProtectedRoute>
// 		),
// 		children: [
// 		  { path: "", element: <MarketListing /> },
// 		  { path: "cart", element: <CartListing /> },
// 		  { path: "portfolio", element: <Holding /> },
// 		  { path: "P2P-trading", element: <P2pPage /> },
// 		  { path: "history", element: <ActiveHistory /> },
// 		  { path: "listing", element: <SingleCardDetail /> },
// 		  { path: "profile", element: <Profile /> },
// 		  { path: "faq", element: <FAQ /> },
// 		  {path: "private-policies", element: <PrivatePolicies />},
	  
// 		  // Hestiya Registry as a sub-route
// 		  {
// 			path: "hestiya-registory",
// 			element: <HomeLayout />,
// 			children: [
// 			  { path: "", element: <Public /> },
// 			  { path: "credits", element: <Credits /> },
// 			  {path: "irecs", element: <Credits />},
// 			  { path: "detail", element: <ProjectDetail /> },
// 			  { path: "issuance-detail", element: <IssuancesListDetail /> },
// 			],
// 		  },
// 		],
// 	  }
// 	]), []);
//   };






























// /* eslint-disable no-mixed-spaces-and-tabs */
// import {
// 	createBrowserRouter,
// 	RouterProvider,
// 	Navigate,
// 	useLocation,
// 	useNavigate,
//   } from "react-router-dom";
//   import { useCallback, useEffect, useMemo } from "react";
//   import { useAccount } from "wagmi";
//   import axios from "axios";
//   import "./index.css";
//   import MarketSpaceLayout from "./layout/marketplace/MarketSpaceLayout";
//   import Layout from "./layout/Layout";
//   // Import other components...
//   import { ToastContainer } from "react-toastify";
//   import "react-toastify/dist/ReactToastify.css";
//   import "react-datepicker/dist/react-datepicker.css";
//   import "react-phone-input-2/lib/style.css";
// import "./index.css";

// import MarketListing from "./pages/marketplacePage/MarketListing";
// import SingleCardDetail from "./pages/marketplacePage/SingleCardDetail";
// import CartListing from "./pages/marketplacePage/CartListing";
// import P2pPage from "./pages/marketplacePage/P2pPage";
// import Holding from "./pages/marketplacePage/Holding";
// import ActiveHistory from "./pages/marketplacePage/ActiveHistory";
// import "react-toastify/dist/ReactToastify.css";
// import HomeLayout from "./layout/publicHistory/HomeLayout";
// import Public from "./pages/homeLayoutPage/Public";
// import Credits from "./pages/homeLayoutPage/Credits";
// import "react-datepicker/dist/react-datepicker.css";
// import ProjectDetail from "./pages/homeLayoutPage/ProjectDetail";
// import SignUp from "./pages/loginSignInPages/SignUp";
// import IssuancesListDetail from "./pages/homeLayoutPage/IssuancesListDetail";
// import MianPage from "./pages/loginSignInPages/MianPage";
// import "react-phone-input-2/lib/style.css";
// import Instruction from "./pages/oceanPages/Instruction";
// import Questionnaire from "./pages/oceanPages/Questionnaire";
// import Residence from "./pages/oceanPages/Residence";
// import MultiQuestion from "./pages/oceanPages/MultiQuestion";
// import SpinnerLoader from "./components/loaders/SpinnerLoader";
// import Otp from "./pages/loginSignInPages/Otp";
// import Recovery from "./pages/loginSignInPages/Recovery";
// import FAQ from "./pages/FAQ";
// import PrivatePolicies from "./pages/PrivatePolicies";
// import SignIn from "./pages/loginSignInPages/SignIn";
// import Method from "./pages/loginSignInPages/Method";
// import Profile from "./pages/marketplacePage/Profile";
// import ConfirmResetPassword from "./pages/loginSignInPages/ConfirmPassword";

//   // Memoized token validation logic
//   const useTokenValidation = () => {
// 	const isTokenExpired = useCallback((token) => {
// 	  if (!token) return true;
// 	  try {
// 		const { access_token } = JSON.parse(token);
// 		const payload = JSON.parse(atob(access_token.split('.')[1]));
// 		return Date.now() >= payload.exp * 1000;
// 	  } catch {
// 		return true;
// 	  }
// 	}, []);
  
// 	const refreshToken = useCallback(async (signal) => {
// 	  const token = localStorage.getItem("token");
// 	  if (!token || !isTokenExpired(token)) return;
  
// 	  try {
// 		const { refresh_token } = JSON.parse(token);
// 		if (!refresh_token) return;
  
// 		const response = await axios.post(`${apiUrl}token/refresh/`, 
// 		  { refresh: refresh_token },
// 		  { signal }
// 		);
  
// 		if (response.status === 200) {
// 		  const newToken = { ...JSON.parse(token), access_token: response.data.access_token };
// 		  localStorage.setItem("token", JSON.stringify(newToken));
// 		}
// 	  } catch (err) {
// 		if (!axios.isCancel(err)) {
// 		  console.error("Token refresh error:", err);
// 		  if (err.response?.status === 401) {
// 			localStorage.removeItem("token");
// 			window.location.href = "/";
// 		  }
// 		}
// 	  }
// 	}, [isTokenExpired]);
  
// 	return { refreshToken, isTokenExpired };
//   };
  
//   const ProtectedRoute = ({ children }) => {
// 	const { address: accountAddress } = useAccount();
// 	const location = useLocation();
// 	const { refreshToken, isTokenExpired } = useTokenValidation();
  
// 	const hasValidToken = useMemo(() => {
// 	  const token = localStorage.getItem("token");
// 	  return !!token && !isTokenExpired(token);
// 	}, [isTokenExpired]);
  
// 	const hasAddress = useMemo(
// 	  () => !!accountAddress || hasValidToken,
// 	  [accountAddress, hasValidToken]
// 	);
  
// 	useEffect(() => {
// 	  const controller = new AbortController();
// 	  const checkToken = async () => {
// 		await refreshToken(controller.signal);
// 	  };
	  
// 	  checkToken();
// 	  const interval = setInterval(checkToken, 300000); // 5 minutes
	  
// 	  return () => {
// 		controller.abort();
// 		clearInterval(interval);
// 	  };
// 	}, [refreshToken]);
  
// 	if (!hasAddress) {
// 	  return <Navigate to="/" state={{ from: location }} replace />;
// 	}
  
// 	return children;
//   };
  
//   const AuthProtectedRoute = ({ children }) => {
// 	const token = useMemo(() => localStorage.getItem("token"), []);
// 	const { address: accountAddress } = useAccount();
// 	const location = useLocation();
  
// 	const isRestrictedRoute = useMemo(() => {
// 	  const restrictedPaths = new Set(["/", "/sign-in", "/choice-method", 
// 		"/sign-detail", "/recovery", "/otp"]);
// 	  return restrictedPaths.has(location.pathname) || 
// 		location.pathname.startsWith("/otp/");
// 	}, [location.pathname]);
  
// 	if (token && isRestrictedRoute) {
// 	  return <Navigate to="/marketplace" replace />;
// 	}
  
// 	return children;
//   };
  

//   "this is a auth protected route for the user to access the marketplace before login or signup, if the user is already logged in and tries to access the login or signup page, it will redirect to the marketplace page";

// // const AuthProtectedRoute = ({ children }) => {
// // 	const navigate = useNavigate();
// // 	const { address: accountAddress } = useAccount();
// // 	const location = useLocation();
// // 	const { isTokenExpired, refreshToken } = useTokenValidation();
  
// // 	const token = useMemo(() => localStorage.getItem("token"), []);
// // 	const isRestrictedRoute = useMemo(() => {
// // 	  const restrictedPaths = new Set([
// // 		"/",
// // 		"/sign-in",
// // 		"/choice-method",
// // 		"/sign-detail",
// // 		"/recovery",
// // 		"/otp",
// // 	  ]);
// // 	  return (
// // 		restrictedPaths.has(location.pathname) ||
// // 		location.pathname.startsWith("/otp/")
// // 	  );
// // 	}, [location.pathname]);
  
// // 	// Check and handle token expiry
// // 	useEffect(() => {
// // 	  const controller = new AbortController();
  
// // 	  const validateAndHandleToken = async () => {
// // 		if (token && isTokenExpired(token)) {
// // 		  localStorage.removeItem("token"); // Clear token
// // 		  navigate("/", { replace: true }); // Navigate to home
// // 		} else {
// // 		  await refreshToken(controller.signal); // Refresh token if valid
// // 		}
// // 	  };
  
// // 	  validateAndHandleToken();
// // 	  const interval = setInterval(validateAndHandleToken, 300000); // 5 minutes
  
// // 	  return () => {
// // 		controller.abort();
// // 		clearInterval(interval);
// // 	  };
// // 	}, [token, isTokenExpired, refreshToken, navigate]);
  
// // 	if (token && isRestrictedRoute) {
// // 	  return <Navigate to="/marketplace" replace />;
// // 	}
  
// // 	return children;
// //   };
  
// //   export default AuthProtectedRoute;


//  const AppRouter = () => {
// 	return useMemo(() => createBrowserRouter([
// 	  {
// 		path: "/",
// 		element: (
// 		  <AuthProtectedRoute>
// 			<Layout />
// 		  </AuthProtectedRoute>
// 		),
// 		children: [
// 		  { path: "", element: <MianPage /> },
// 		  { path: "sign-in", element: <SignIn /> },
// 		  { path: "choice-method", element: <Method /> },
// 		  { path: "sign-detail", element: <SignUp /> },
// 		  { path: "recovery", element: <Recovery /> },
// 		  { path: "confirm-password", element: <ConfirmResetPassword /> },
// 		  { path: "otp", element: <Otp /> },
// 		  {path:"private-policies",element: <PrivatePolicies />}
// 		],
// 	  },
// 	  {
// 		path: "marketplace",
// 		element: (
// 		  <ProtectedRoute>
// 			<MarketSpaceLayout />
// 		  </ProtectedRoute>
// 		),
// 		children: [
// 		  { path: "", element: <MarketListing /> },
// 		  { path: "cart", element: <CartListing /> },
// 		  { path: "portfolio", element: <Holding /> },
// 		  { path: "P2P-trading", element: <P2pPage /> },
// 		  { path: "history", element: <ActiveHistory /> },
// 		  { path: "listing", element: <SingleCardDetail /> },
// 		  { path: "profile", element: <Profile /> },
// 		  { path: "faq", element: <FAQ /> },
// 		  {path: "private-policies", element: <PrivatePolicies />},
	  
// 		  // Hestiya Registry as a sub-route
// 		  {
// 			path: "hestiya-registory",
// 			element: <HomeLayout />,
// 			children: [
// 			  { path: "", element: <Public /> },
// 			  { path: "credits", element: <Credits /> },
// 			  {path: "irecs", element: <Credits />},
// 			  { path: "detail", element: <ProjectDetail /> },
// 			  { path: "issuance-detail", element: <IssuancesListDetail /> },
// 			],
// 		  },
// 		],
// 	  }
// 	]), []);
//   };
  
//   function App() {
// 	return (
// 	  <>
// 		<RouterProvider router={AppRouter()} />
// 		<ToastContainer />
// 	  </>
// 	);
//   }
  
//   export default App;





















// =============================================== 

// Last COmmit ... before setting up the session-model









// //   const AppRouter = () => {
// // 	return useMemo(() => createBrowserRouter([
// // 	  {
// // 		path: "/",
// // 		element: (
// // 		//   <AuthProtectedRoute>
// // 			<Layout />
// // 		//   </AuthProtectedRoute>
// // 		),
// // 		children: [
// // 		  { path: "", element: <MianPage /> },
// // 		  { path: "sign-in", element: <SignIn /> },
// // 		  { path: "choice-method", element: <Method /> },
// // 		  { path: "sign-detail", element: <SignUp /> },
// // 		  { path: "recovery", element: <Recovery /> },
// // 		  { path: "confirm-password", element: <ConfirmResetPassword /> },
// // 		  { path: "otp", element: <Otp /> },
// // 		  {path:"private-policies",element: <PrivatePolicies />}
// // 		],
// // 	  },
// // 	  {
// // 		path: "marketplace",
// // 		element: (
// // 		//   <ProtectedRoute>
// // 			<MarketSpaceLayout />
// // 		//   </ProtectedRoute>
// // 		),
// // 		children: [
// // 		  { path: "", element: <MarketListing /> },
// // 		  { path: "cart", element: <CartListing /> },
// // 		  { path: "portfolio", element: <Holding /> },
// // 		  { path: "P2P-trading", element: <P2pPage /> },
// // 		  { path: "history", element: <ActiveHistory /> },
// // 		  { path: "listing", element: <SingleCardDetail /> },
// // 		  { path: "profile", element: <Profile /> },
// // 		  { path: "faq", element: <FAQ /> },
// // 		  {path: "private-policies", element: <PrivatePolicies />},
	  
// // 		  // Hestiya Registry as a sub-route
// // 		  {
// // 			path: "hestiya-registory",
// // 			element: <HomeLayout />,
// // 			children: [
// // 			  { path: "", element: <Public /> },
// // 			  { path: "credits", element: <Credits /> },
// // 			  {path: "irecs", element: <Credits />},
// // 			  { path: "detail", element: <ProjectDetail /> },
// // 			  { path: "issuance-detail", element: <IssuancesListDetail /> },
// // 			],
// // 		  },
// // 		],
// // 	  }
// // 	]), []);
// //   };