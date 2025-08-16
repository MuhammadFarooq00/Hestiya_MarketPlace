import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import axios from 'axios';
import StripePayment from './stripeconfig';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const StripePaymentWrapper = ({ cartID, setShowStripeModal, datastrue, percentageValue }) => {
  const [clientSecret, setClientSecret] = useState('');
  const [baseAmount, setBaseAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.hestiya.com/api/";

  useEffect(() => {
    const fetchCartTotal = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching cart total for cartID:', cartID); // Debug log
        
        // Validate datastrue structure
        if (!Array.isArray(datastrue)) {
          throw new Error('Invalid cart data format');
        }

        console.log('Datastrue items:', datastrue); // Debug log

        // First get payment intent from your endpoint
        const response = await axios.post(`${apiUrl}payment-intent/`, { 
          cart_id: cartID 
        });
        
        console.log('Payment intent response:', response.data); // Debug log
        
        if (!response.data?.client_secret) {
          throw new Error('Invalid response from server - missing client_secret');
        }
        
        setClientSecret(response.data.client_secret);
        
        // Calculate base amount from cart items with proper validation
        const total = datastrue.reduce((sum, item) => {
          if (!item || typeof item !== 'object') {
            console.error('Invalid item in datastrue:', item);
            return sum;
          }
          
          const itemTotal = parseFloat(item.total);
          if (isNaN(itemTotal)) {
            console.error('Invalid item total:', item.total);
            return sum;
          }
          return sum + itemTotal;
        }, 0);

        console.log('Calculated total:', total); // Debug log

        // Validate the total is a positive number
        if (isNaN(total)) {
          throw new Error('Calculated total is not a number');
        }
        
        if (total <= 0) {
          throw new Error('Total amount must be greater than 0');
        }
        
        setBaseAmount(total);
      } catch (error) {
        console.error('Error in fetchCartTotal:', error);
        setError(error.message || 'Failed to load payment details');
        setBaseAmount(0);
      } finally {
        setLoading(false);
      }
    };

    if (cartID && datastrue?.length > 0) {
      fetchCartTotal();
    } else {
      setError('Missing cart ID or empty cart data');
      setLoading(false);
    }
  }, [cartID, datastrue, apiUrl]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading payment details...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        {error}
        <button 
          onClick={() => window.location.reload()}
          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return <div className="text-red-500 p-4">Error initializing payment. Please try again.</div>;
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <StripePayment 
        clientSecret={clientSecret}
        cartID={cartID}
        setShowStripeModal={setShowStripeModal}
        datastrue={datastrue}
        percentageValue={percentageValue}
        baseAmount={baseAmount}
      />
    </Elements>
  );
};

export default StripePaymentWrapper;












// import React, { useState, useEffect } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { Elements } from '@stripe/react-stripe-js';
// import axios from 'axios';
// import StripePayment from './stripeconfig';

// // const stripePromise = loadStripe('pk_live_51QhTuxIk4TcSBVYmnNPv31CraR7Ae2fhJgnhLeOCgCvobgjS1ZHNdl9PO4shDKnCZuncBQKrrMpuDzwTCQK2Hzh200TTx3Z9wC'); // Replace with your Publishable Key
// const stripePromise = loadStripe('pk_test_51PCeKX02W2AiAFpz2n7rok9COEOQdhuGeNXovHgNjV2Aug6mFjJkPQ33CZevnhrYWfzsq5z1TZZfmpo1FOKgi6hg00mmo7dby0'); // Replace with your Publishable Key


// const StripePaymentWrapper = ({ cartID,setShowStripeModal, datastrue, percentageValue }) => {
//   const [clientSecret, setClientSecret] = useState('');
//   // const apiUrl = import.meta.env.VITE_API_URL;
//   const apiUrl = "http://127.0.0.1:8000/api/"
//   // console.log("apiurl check : ", apiUrl)
//   useEffect(() => {
   
//     axios
//       .post(`${apiUrl}payment-intent/`, { cart_id: cartID,})
//       .then(({ data }) => {
//         // console.log('client secret data: ', data);
//         setClientSecret(data.client_secret)
//       })
//       .catch((error) => console.error('Error fetching client secret:', error));
//   }, []);

//   if (!clientSecret) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <Elements  className=' overflow-y-auto w-full max-h-[660px] ' stripe={stripePromise} options={{ clientSecret }}>
     
//      <StripePayment  clientSecret={clientSecret} cartID={cartID} setShowStripeModal={setShowStripeModal} datastrue={datastrue} percentageValue={percentageValue} />
    
//     </Elements>
//   );
// };

// export default StripePaymentWrapper;












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