import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import StripePayment from './stripeconfig';

const stripePromise = loadStripe('pk_live_51QhTuxIk4TcSBVYmnNPv31CraR7Ae2fhJgnhLeOCgCvobgjS1ZHNdl9PO4shDKnCZuncBQKrrMpuDzwTCQK2Hzh200TTx3Z9wC');

const StripePaymentWrapper = ({ cartID, setShowStripeModal, datastrue, percentageValue }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const feeStructure = {
    domestic: { percentage: 3.4, fixed: 0.50, currency: 'SGD', label: 'Domestic Card (SGD)' },
    internationalSameCurrency: { percentage: 3.9, fixed: 0.50, currency: 'SGD', label: 'International Card (same currency)' },
    internationalWithConversion: { percentage: 5.9, fixed: 0.50, currency: 'SGD', label: 'International Card + currency conversion' },
    usdPayout: { percentage: 1, fixed: 5, currency: 'USD', label: 'USD Payout', minFee: 5 }
  };

  const apiUrl = "https://api.hestiya.com/api/";

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const [detailsResponse, intentResponse] = await Promise.all([
          axios.get(`${apiUrl}cart-item/?cart=${cartID}`),
          axios.post(`${apiUrl}payment-intent/`, { cart_id: cartID })
        ]);

        if (!detailsResponse.data || !intentResponse.data.client_secret) {
          throw new Error('Failed to load payment details');
        }

        setPaymentDetails(detailsResponse.data);
        setClientSecret(intentResponse.data.client_secret);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment details:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [cartID]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading payment details...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 p-4">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={() => setShowStripeModal(false)}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Close
        </button>
      </div>
    );
  }

  if (!clientSecret || !paymentDetails) {
    return null;
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#6772e5',
          }
        }
      }}
    >
      <StripePayment 
        clientSecret={clientSecret} 
        cartID={cartID} 
        setShowStripeModal={setShowStripeModal} 
        datastrue={datastrue} 
        percentageValue={percentageValue}
        paymentDetails={paymentDetails}
        feeStructure={feeStructure}
      />
    </Elements>
  );
};

export default StripePaymentWrapper;











// const StripePayment = ({ onSubmit, clientSecret }) => {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [paymentSuccess, setPaymentSuccess] = useState(false);

//   const handlePayment = async () => {
//     setLoading(true);

//     if (!stripe || !elements) {
//       return;
//     }

//     try {
//       // Confirm the payment on the client side
//       const { error, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: 'http://localhost:3000/success', // Redirect after payment
//         },
//       });

//       if (error) {
//         setError(error.message);
//         setLoading(false);
//       } else {
//         setError(null);
//         setLoading(false);
//         setPaymentSuccess(true);

//         // Call the parent's onSubmit function with payment details
//         onSubmit({
//           paymentIntentId: paymentIntent.id,
//           amount: paymentIntent.amount,
//           currency: paymentIntent.currency,
//         });
//       }
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <PaymentElement />
//       {error && <div style={{ color: 'red' }}>{error}</div>}
//       {paymentSuccess && <div style={{ color: 'green' }}>Payment successful!</div>}
//       <button
//         onClick={handlePayment}
//         disabled={!stripe || loading}
//         className='w-full cursor-pointer mt-4 bg-blue-500  hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 z-10'
      
//       >
//         {loading ? 'Processing...' : 'Pay Through the Gateway'}
//       </button>
//     </div>
//   );
// };

// const StripePaymentWrapper = ({ onSubmit }) => {
//   const [clientSecret, setClientSecret] = useState('');

//   useEffect(() => {
//     fetch('http://localhost:4000/create-payment-intent', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ amount: 100 }), 
//     })
//       .then((res) => res.json())
//       .then((data) => setClientSecret(data.clientSecret))
//       .catch((error) => console.error('Error fetching client secret:', error));
//   }, []);

//   if (!clientSecret) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Elements stripe={stripePromise} options={{ clientSecret }}>
//       <StripePayment onSubmit={onSubmit} clientSecret={clientSecret} />
//     </Elements>
//   );
// };

// export default StripePaymentWrapper;