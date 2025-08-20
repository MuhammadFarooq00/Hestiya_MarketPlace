import React, { useState, useEffect, useContext, useCallback } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { generateAndDownloadPurchasePDF } from "../Template/Template";
import { UserContext } from "../context/UserContext";

const StripePayment = ({
  cartID,
  setShowStripeModal,
  datastrue,
  percentageValue,
  paymentDetails,
  feeStructure
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cardCountry, setCardCountry] = useState(null);
  const [cardBrand, setCardBrand] = useState(null);
  const [calculatedFees, setCalculatedFees] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [feeType, setFeeType] = useState('');
  const { setCartId } = useContext(UserContext);
  const navigate = useNavigate();

  // Memoized fee calculation
  const calculateFees = useCallback(() => {
    if (!paymentDetails) return null;

    const baseAmount = paymentDetails.total_cart_price;
    let fees = 0;
    let currentFeeType = '';
    let feeDetails = {};

    if (paymentMethod === 'card') {
      if (cardCountry === 'SG') {
        feeDetails = feeStructure.domestic;
      } else if (cardBrand && cardCountry) {
        feeDetails = feeStructure.internationalSameCurrency;
      } else {
        feeDetails = feeStructure.internationalWithConversion;
      }
      
      fees = (baseAmount * feeDetails.percentage / 100) + feeDetails.fixed;
      currentFeeType = feeDetails.label;
    } else if (paymentMethod === 'us_bank_account') {
      feeDetails = feeStructure.usdPayout;
      fees = Math.max(
        (baseAmount * feeDetails.percentage / 100),
        feeDetails.minFee
      );
      currentFeeType = feeDetails.label;
    } else {
      // Default to highest fee if payment method not recognized
      feeDetails = feeStructure.internationalWithConversion;
      fees = (baseAmount * feeDetails.percentage / 100) + feeDetails.fixed;
      currentFeeType = feeDetails.label;
    }

    const platformFee = (baseAmount * percentageValue / 100);
    const total = baseAmount + fees + platformFee;

    return {
      feeType: currentFeeType,
      fees: parseFloat(fees.toFixed(2)),
      platformFee: parseFloat(platformFee.toFixed(2)),
      totalAmount: parseFloat(total.toFixed(2)),
      feePercentage: feeDetails.percentage,
      fixedFee: feeDetails.fixed,
      baseAmount: parseFloat(baseAmount.toFixed(2))
    };
  }, [paymentDetails, paymentMethod, cardCountry, cardBrand, feeStructure, percentageValue]);

  const feeDetails = calculateFees();

  useEffect(() => {
    if (feeDetails) {
      setCalculatedFees(feeDetails.fees);
      setTotalAmount(feeDetails.totalAmount);
      setFeeType(feeDetails.feeType);
    }
  }, [feeDetails]);

  useEffect(() => {
    if (!elements) return;

    const element = elements.getElement(PaymentElement);
    if (!element) return;

    const handleChange = (event) => {
      if (event.complete) {
        if (event.value && event.value.type) {
          setPaymentMethod(event.value.type);
          if (event.value.type === 'card') {
            setCardBrand(event.value.card?.brand || null);
            setCardCountry(event.value.card?.country || null);
          } else {
            setCardBrand(null);
            setCardCountry(null);
          }
        }
      }
    };

    element.on('change', handleChange);
    setIsReady(true);

    return () => {
      element.off('change', handleChange);
    };
  }, [elements]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!stripe || !elements) {
      setError("Payment system not ready. Please try again.");
      setLoading(false);
      return;
    }

    try {
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        throw stripeError;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentSuccess(true);
        
        const response = await axios.post(
          "https://api.hestiya.com/api/payment/",
          {
            intent_id: paymentIntent.id,
            cart_id: cartID,
          }
        );

        if (response.data) {
          const pdfData = {
            hashId: response.data.trx_hash || paymentIntent.id,
            actionType: "Buy",
            trades: datastrue,
            fees: response.data.gas_used || 0,
            hestiyafee: percentageValue,
            paymentMethod: feeType,
            processingFee: feeDetails.fees,
            processingFeeType: feeDetails.feeType,
            processingFeePercentage: feeDetails.feePercentage,
            processingFixedFee: feeDetails.fixedFee,
            totalAmount: feeDetails.totalAmount,
            itemType: response.data?.item_type,
            registry: response.data?.registry,
            buyerName: response.data?.buyer_name,
            buyerEmail: response.data?.buyer_email,
          };
          
          generateAndDownloadPurchasePDF(pdfData);
          
          setCartId(null);
          localStorage.removeItem("cartId");
          navigate("/marketplace/portfolio");
          toast.success("Payment successful!");
          setShowStripeModal(false);
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!paymentDetails) {
    return null;
  }

  return (
    <div className="rounded-lg bg-white shadow-md p-4 max-h-[80vh] overflow-y-auto">
      <form onSubmit={handlePayment} className="space-y-4">
        <PaymentElement/>
        
        {paymentMethod && feeDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${feeDetails.baseAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee ({percentageValue}%):</span>
                <span>${feeDetails.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Processing Fee ({feeDetails.feeType}): 
                  <span className="text-xs text-gray-500 ml-1">
                    ({feeDetails.feePercentage}% + ${feeDetails.fixedFee.toFixed(2)})
                  </span>
                </span>
                <span>${feeDetails.fees.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Amount:</span>
                  <span>${feeDetails.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded text-sm">
            {error}
          </div>
        )}

        <div className="mt-4 text-xs">
          <label className="flex items-start space-x-2">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1"
            />
            <span>
              By proceeding, I agree to Hestiya's Terms and Privacy Policy.
              I understand that additional fees may apply based on my payment method.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={!stripe || !isReady || loading || !termsAccepted}
          className={`w-full mt-4 py-3 px-4 rounded-lg font-bold text-white transition-colors ${
            (!stripe || !isReady || !termsAccepted) 
              ? "bg-gray-400 cursor-not-allowed" 
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? (
            <span className="inline-flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${feeDetails?.totalAmount.toFixed(2) || paymentDetails.total_cart_price.toFixed(2)}`
          )}
        </button>
      </form>
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default StripePayment;

// import React, { useState, useEffect } from 'react';
// import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const StripePayment = ({ onSubmit, clientSecret, cartID,setShowStripeModal }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [isReady, setIsReady] = useState(false);

//   useEffect(() => {
//     if (elements) {
//       const element = elements.getElement(PaymentElement);
//       if (element) {
//         setIsReady(true);
//       }
//     }
//   }, [elements]);

//   const handlePayment = async (e) => {
//     e.preventDefault();

//     setLoading(true);

//     if (!stripe || !elements) {
//       setError('Stripe.js has not loaded.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: window.location.href,
//         },
//         redirect: 'if_required',
//       });

//       if (error) {
//         setError(error.message);
//         setLoading(false);
//       } else if (paymentIntent && paymentIntent.status === 'succeeded') {
//         setError(null);
//         setLoading(false);
//         setPaymentSuccess(true);

//         toast.success('Payment successful!');

//        const response = await axios.post('http://192.168.1.24:8001/api/payment/', {
//           intent_id: paymentIntent.id,
//           cart_id: cartID,
//         });
//         setShowStripeModal(false);

//         // console.log("Payment response",response);
//       }
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={(e) => { handlePayment(e) }}>
//         <PaymentElement />
//         { paymentSuccess ? null : error && <div style={{ color: 'red' }}>{error}</div>}
//         {paymentSuccess && <div className=' mt-4' style={{ color: 'green' }}>Payment successful!</div>}
//         <button
//           type="submit"
//           disabled={!stripe || !isReady || loading}
//           className="w-full cursor-pointer mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
//         >
//           {loading ? 'Processing...' : 'Pay'}
//         </button>
//       </form>
//       <ToastContainer />
//     </div>
//   );
// };

// export default StripePayment;

// import React, { useState, useEffect } from 'react';
// import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const StripePayment = ({ onSubmit, clientSecret, cartID, setShowStripeModal }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [isReady, setIsReady] = useState(false);

//   useEffect(() => {
//     if (elements) {
//       const element = elements.getElement(PaymentElement);
//       if (element) {
//         setIsReady(true);
//       }
//     }
//   }, [elements]);

//   const handlePayment = async (e) => {
//     e.preventDefault(); // Prevent the form submission default behavior

//     setLoading(true);

//     if (!stripe || !elements) {
//       setError('Stripe.js has not loaded.');
//       setLoading(false);
//       return;
//     }

//     try {
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: window.location.href, // Customize if needed
//         },
//         redirect: 'if_required',
//       });

//       if (error) {
//         setError(error.message);
//         setLoading(false);
//       } else if (paymentIntent && paymentIntent.status === 'succeeded') {
//         setError(null);
//         setLoading(false);
//         setPaymentSuccess(true);

//         toast.success('Payment successful!');

//         // Send the payment data to your server for storing/updating records
//         const response = await axios.post('http://192.168.1.24:8001/api/payment/', {
//           intent_id: paymentIntent.id,
//           cart_id: cartID,
//         });
//         console.log('Payment response:', response);

//         // Close the modal after successful payment
//         setShowStripeModal(false);
//       }
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handlePayment}>
//         <PaymentElement />

//         {error && !paymentSuccess && <div style={{ color: 'red' }}>{error}</div>}
//         {paymentSuccess && <div className="mt-4" style={{ color: 'green' }}>Payment successful!</div>}

//         <button
//           type="submit"
//           disabled={!stripe || !isReady || loading}
//           className="w-full cursor-pointer mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10"
//         >
//           {loading ? 'Processing...' : 'Pay'}
//         </button>
//       </form>

//       {/* Toast Notifications */}
//       <ToastContainer />
//     </div>
//   );
// };

// export default StripePayment;
