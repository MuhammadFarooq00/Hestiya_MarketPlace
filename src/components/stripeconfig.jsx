import React, { useState, useEffect, useContext } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { generateAndDownloadPurchasePDF } from "../Template/Template";
import { UserContext } from "../context/UserContext";

const StripePayment = ({
  clientSecret,
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
  const [showTransactionLoading, setShowTransactionLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [calculatedFees, setCalculatedFees] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const { setCartId } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (elements) {
      const element = elements.getElement(PaymentElement);
      if (element) {
        setIsReady(true);
        
        // Listen for payment method changes
        element.on('change', (event) => {
          if (event.complete && event.value && event.value.type) {
            setPaymentMethod(event.value.type);
          }
        });
      }
    }
  }, [elements]);

  useEffect(() => {
    if (paymentMethod && paymentDetails) {
      calculateFees();
    }
  }, [paymentMethod, paymentDetails]);

  const calculateFees = () => {
    if (!paymentDetails || !paymentMethod) return;

    const baseAmount = paymentDetails.total_cart_price;
    let fees = 0;
    let feeType = '';

    // Determine fee structure based on payment method
    if (paymentMethod === 'card') {
      // In a real app, you would detect card type (domestic/international)
      // For demo purposes, we'll use international with conversion as default
      feeType = 'International Card with Currency Conversion';
      const { percentage, fixed } = feeStructure.internationalWithConversion;
      fees = (baseAmount * percentage / 100) + fixed;
    } else {
      // Handle other payment methods
      feeType = 'Standard Processing';
      const { percentage, fixed } = feeStructure.internationalSameCurrency;
      fees = (baseAmount * percentage / 100) + fixed;
    }

    const platformFee = (baseAmount * percentageValue / 100);
    const total = baseAmount + fees + platformFee;

    setCalculatedFees(fees);
    setTotalAmount(total);

    return {
      feeType,
      fees: fees.toFixed(2),
      platformFee: platformFee.toFixed(2),
      totalAmount: total.toFixed(2)
    };
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setError("Stripe.js has not loaded.");
      setLoading(false);
      return;
    }

    setShowTransactionLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: "if_required",
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setError(null);
        setLoading(false);
        setPaymentSuccess(true);

        const response = await axios.post(
          "https://api.hestiya.com/api/payment/",
          {
            intent_id: paymentIntent.id,
            cart_id: cartID,
          }
        );
        
        if (response.data) {
          const { order_id, trx_hash, gas_used, intent_id } = response.data;

          // Generate PDF
          const pdfData = {
            hashId: trx_hash || intent_id,
            actionType: "Buy",
            trades: datastrue,
            fees: gas_used || 0,
            hestiyafee: percentageValue,
            paymentMethod: "Bank",
            itemType: response?.data?.item_type,
            registry: response?.data?.registry,
            buyerName: response?.data?.buyer_name,
            buyerEmail: response?.data?.buyer_email,
            processingFee: calculatedFees.toFixed(2),
            totalAmount: totalAmount.toFixed(2)
          };
          generateAndDownloadPurchasePDF(pdfData);
        }

        setShowStripeModal(false);
        setCartId(null);
        navigate("/marketplace/portfolio");
        setShowTransactionLoading(false);
        localStorage.removeItem("cartId");
        toast.success("Purchase Successful!");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setShowStripeModal(false);
      setShowTransactionLoading(false);
      toast.error("Payment failed. Please try again.");
    }
  };

  const feeDetails = calculateFees();

  return (
    <div className="rounded-lg bg-white shadow-md p-4">
      <form onSubmit={handlePayment}>
        <PaymentElement />
        
        {paymentMethod && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${paymentDetails.total_cart_price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee ({percentageValue}%):</span>
                <span>${((paymentDetails.total_cart_price * percentageValue) / 100).toFixed(2)}</span>
              </div>
              {feeDetails && (
                <>
                  <div className="flex justify-between">
                    <span>Processing Fee ({feeDetails.feeType}):</span>
                    <span>${feeDetails.fees}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span>${feeDetails.totalAmount}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {paymentSuccess ? null : error && (
          <div className="mt-4 text-red-500 text-sm">{error}</div>
        )}

        <div className="mt-4 text-xs text-justify">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 mr-2"
            />
            <span>
              By proceeding with this transaction, I confirm that I have read,
              understood, and agreed to be bound by Hestiya.com's Privacy Policy,
              Platform Terms & conditions and the privacy policies of any
              third-party payment processors engaged by Hestiya.com. Non-compliance
              with the Platform Terms may result in transaction termination or
              penalties imposed by Hestiya.com.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={
            !stripe ||
            !isReady ||
            loading ||
            !termsAccepted ||
            showTransactionLoading
          }
          className={`w-full mt-4 bg-blue-500 hover:bg-blue-700 ${
            (!termsAccepted || !paymentMethod) ? "opacity-50 cursor-not-allowed" : ""
          } text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {loading || showTransactionLoading 
            ? "Processing..." 
            : `Pay $${totalAmount > 0 ? totalAmount.toFixed(2) : feeDetails?.totalAmount || '0.00'}`}
        </button>
      </form>
      <ToastContainer />
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
