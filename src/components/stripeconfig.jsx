import React, { useState, useEffect, useContext } from "react";
import { 
  useStripe, 
  useElements, 
  CardElement
} from "@stripe/react-stripe-js";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { generateAndDownloadPurchasePDF } from "../Template/Template";
import { UserContext } from "../context/UserContext";
import { FiInfo } from "react-icons/fi";

const StripePayment = ({
  clientSecret,
  cartID,
  setShowStripeModal,
  datastrue,
  percentageValue,
  baseAmount
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showFeeTooltip, setShowFeeTooltip] = useState(false);
  const [feeDetails, setFeeDetails] = useState(null);
  const [cardDetails, setCardDetails] = useState(null);
  const { setCartId } = useContext(UserContext);
  const navigate = useNavigate();

  // Initialize feeDetails with proper validation
  useEffect(() => {
    const validAmount = Number(baseAmount) || 0;
    const percentage = 5.9;
    const fixed = 0.50;
    const totalFee = ((validAmount * percentage) / 100) + fixed;
    
    setFeeDetails({
      percentage,
      fixed,
      totalFee,
      displayAmount: (validAmount + totalFee).toFixed(2),
      type: 'international_conversion',
      scheme: 'card',
      country: 'International'
    });
  }, [baseAmount]);

  // Detect card type and country using Binlist
  const detectCardDetails = async (bin) => {
    try {
      const response = await axios.get(`https://binlist.io/lookup/${bin}`);
      return {
        scheme: response.data.scheme || 'card',
        type: response.data.type || 'unknown',
        country: response.data.country?.name || 'International',
        bank: response.data.bank?.name || 'Unknown Bank'
      };
    } catch (error) {
      console.error("Error detecting card details:", error);
      return {
        scheme: 'card',
        type: 'unknown',
        country: 'International',
        bank: 'Unknown Bank'
      };
    }
  };

  // Calculate fees based on card type and country
  const calculateFees = (cardInfo) => {
    const validAmount = Number(baseAmount) || 0;
    const isDomestic = cardInfo.country === 'Singapore';
    const isDebit = cardInfo.type === 'debit';
    
    let percentage = 5.9;
    let fixed = 0.50;

    if (isDomestic) {
      percentage = isDebit ? 3.4 : 3.9;
    } else if (cardInfo.country !== 'International') {
      percentage = 3.9;
    }

    const totalFee = ((validAmount * percentage) / 100) + fixed;
    const displayAmount = (validAmount + totalFee).toFixed(2);
    
    return {
      percentage,
      fixed,
      totalFee,
      displayAmount,
      type: isDomestic ? 'domestic' : 
           (cardInfo.country === 'International' ? 'international_conversion' : 'international'),
      scheme: cardInfo.scheme,
      country: cardInfo.country
    };
  };

  // Handle card number changes
  useEffect(() => {
    const cardElement = elements?.getElement(CardElement);
    
    if (cardElement) {
      const handleChange = async (event) => {
        if (event.complete) {
          setIsReady(true);
        } else {
          setIsReady(false);
        }

        try {
          const cardValue = event.value;
          if (!cardValue || typeof cardValue !== 'string') {
            return;
          }

          const cleanedValue = cardValue.replace(/\s/g, '');
          if (cleanedValue.length >= 6) {
            const bin = cleanedValue.substring(0, 6);
            const cardInfo = await detectCardDetails(bin);
            setCardDetails(cardInfo);
            
            const fees = calculateFees(cardInfo);
            setFeeDetails(fees);
          }
        } catch (error) {
          console.error("Error processing card details:", error);
          // Fallback to default fees
          const validAmount = Number(baseAmount) || 0;
          setFeeDetails(prev => ({
            ...prev,
            displayAmount: (validAmount + ((validAmount * 5.9) / 100) + 0.50).toFixed(2)
          }));
        }
      };

      cardElement.on('change', handleChange);
      return () => {
        cardElement.off('change', handleChange);
      };
    }
  }, [elements, baseAmount]);

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !termsAccepted) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (error) {
        setError(error.message);
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
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
            stripeFee: feeDetails?.totalFee || 0,
            paymentMethod: "Bank",
            itemType: response.data.item_type,
            registry: response.data.registry,
            buyerName: response.data.buyer_name,
            buyerEmail: response.data.buyer_email,
          };
          generateAndDownloadPurchasePDF(pdfData);
        }

        setShowStripeModal(false);
        setCartId(null);
        navigate("/marketplace/portfolio");
        toast.success("Purchase Successful!");
      }
    } catch (err) {
      setError(err.message);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!stripe) {
    return <div className="flex justify-center items-center h-64">Loading Stripe...</div>;
  }

  return (
    <div className="rounded-lg bg-white shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Complete Your Payment</h2>
      
      {feeDetails && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${(Number(baseAmount) || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center">
                <span>Processing Fee ({feeDetails.percentage}%):</span>
                <button 
                  onClick={() => setShowFeeTooltip(!showFeeTooltip)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                  type="button"
                >
                  <FiInfo size={14} />
                </button>
              </div>
              <span>${((Number(baseAmount) || 0) * feeDetails.percentage / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Fixed Fee:</span>
              <span>${feeDetails.fixed.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Total:</span>
              <span>${feeDetails.displayAmount}</span>
            </div>
          </div>
          
          {showFeeTooltip && (
            <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-sm">
              {feeDetails.type === 'domestic' && (
                <p>Domestic {cardDetails?.scheme || 'card'} card ({feeDetails.percentage}% + ${feeDetails.fixed})</p>
              )}
              {feeDetails.type === 'international' && (
                <p>International {cardDetails?.scheme || 'card'} card ({feeDetails.percentage}% + ${feeDetails.fixed})</p>
              )}
              {feeDetails.type === 'international_conversion' && (
                <p>International card with currency conversion ({feeDetails.percentage}% + ${feeDetails.fixed})</p>
              )}
              {cardDetails?.country && <p>Card issued in: {cardDetails.country}</p>}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handlePayment} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Card Details</label>
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
              hidePostalCode: true
            }}
          />
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 mr-2"
            required
          />
          <label htmlFor="terms" className="text-sm">
            I agree to the terms and conditions
          </label>
        </div>

        <button
          type="submit"
          disabled={!stripe || !isReady || loading || !termsAccepted}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            (!stripe || !isReady || loading || !termsAccepted) 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Processing...' : `Pay $${feeDetails?.displayAmount || '0.00'}`}
        </button>

        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>

      <ToastContainer />
    </div>
  );
};

export default StripePayment;










// import React, { useState, useEffect, useContext } from "react";
// import {
//   useStripe,
//   useElements,
//   PaymentElement,
// } from "@stripe/react-stripe-js";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
// import {
//   generateAndDownloadPDF,
//   generateAndDownloadPurchasePDF,
// } from "../Template/Template";
// import { UserContext } from "../context/UserContext";

// const StripePayment = ({
//   onSubmit,
//   clientSecret,
//   cartID,
//   setShowStripeModal,
//   datastrue,
//   percentageValue,
// }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);
//   const [isReady, setIsReady] = useState(false);
//   const [termsAccepted, setTermsAccepted] = useState(false);
//   const [showTransactionLoading, setShowTransactionLoading] = useState(false);
//   const { setCartId } = useContext(UserContext);
//   const navigate = useNavigate();

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
//       setError("Stripe.js has not loaded.");
//       setLoading(false);
//       return;
//     }

//     setShowTransactionLoading(true);

//     try {
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: window.location.href,
//         },
//         redirect: "if_required",
//       });

//       if (error) {
//         setError(error.message);
//         setLoading(false);
//       } else if (paymentIntent && paymentIntent.status === "succeeded") {
//         setError(null);
//         setLoading(false);
//         setPaymentSuccess(true);

//         const response = await axios.post(
//           "http://127.0.0.1:8000/api/payment/",
//           {
//             intent_id: paymentIntent.id,
//             cart_id: cartID,
//           }
//         );
//         if (response.data) {
//           const { order_id, trx_hash, gas_used, intent_id } = response.data;

//           // Generate PDF
//           const pdfData = {
//             hashId: trx_hash || intent_id,
//             actionType: "Buy",
//             trades: datastrue,
//             fees: gas_used || 0,
//             hestiyafee: percentageValue,
//             paymentMethod: "Bank",
//             itemType: response?.data?.item_type,
//             registry: response?.data?.registry,
//             buyerName: response?.data?.buyer_name,
//             buyerEmail: response?.data?.buyer_email,
//           };
//           generateAndDownloadPurchasePDF(pdfData);
//         }

//         setShowStripeModal(false);
//         setCartId(null);
//         navigate("/marketplace/portfolio");
//         setShowTransactionLoading(false);
//         localStorage.removeItem("cartId");
//         toast.success("Purchase Successful!");
//         // console.log("Payment response",response);
//       }
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//       setShowStripeModal(false);
//       setShowTransactionLoading(false);
//       toast.error("Payment failed. Please try again.");
//       // navigate('/marketplace/cart');
//     }
//   };

//   useEffect(() => {
//     if (showTransactionLoading) {
//       const timer = setTimeout(() => {
//         setShowTransactionLoading(false);
//         toast.info("Transaction is being processed. Please wait...");
//       }, 3000); // Show loading for 3 seconds

//       return () => clearTimeout(timer);
//     }
//   }, [showTransactionLoading]);

//   return (
//     <div className=" rounded-lg bg-white shadow-md">
//       <form
//         className=""
//         onSubmit={(e) => {
//           handlePayment(e);
//         }}
//       >
//         <PaymentElement />
//         {paymentSuccess
//           ? null
//           : error && <div style={{ color: "red" }}>{error}</div>}
//         {/* {paymentSuccess && <div className='mt-4' style={{ color: 'green' }}>Payment successful!</div>} */}

//         <div className="mt-4 text-[13px] text-justify  ">
//           <label>
//             <input
//               type="checkbox"
//               checked={termsAccepted}
//               onChange={(e) => setTermsAccepted(e.target.checked)}
//               className="text-[10px] mr-2"
//             />
//             By proceeding with this transaction, I confirm that I have read,
//             understood, and agreed to be bound by Hestiya.com's Privacy Policy,
//             Platform Terms & conditions and the privacy policies of any
//             third-party payment processors engaged by Hestiya.com. <br />{" "}
//             Non-compliance with the Platform Terms may result in transaction
//             termination or penalties imposed by Hestiya.com.
//           </label>
//         </div>

//         <button
//           type="submit"
//           disabled={
//             !stripe ||
//             !isReady ||
//             loading ||
//             !termsAccepted ||
//             showTransactionLoading
//           }
//           className={`w-full cursor-pointer mt-4 bg-blue-500 hover:bg-blue-700 ${
//             termsAccepted ? "" : "opacity-50 cursor-not-allowed"
//           } text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10`}
//         >
//           {loading || showTransactionLoading ? "Processing..." : "Pay"}
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
