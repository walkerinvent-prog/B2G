import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

let stripePromise = null;

function CheckoutForm({ amount, onSuccess, onError, cashAppTag, cashAppTagEnabled }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate Cash App Tag if the option is enabled
    if (cashAppTagEnabled && !cashAppTag?.trim()) {
      toast.error('Please enter your Cash App tag before proceeding with payment');
      // Scroll to Cash App tag section
      const cashAppInput = document.querySelector('input[placeholder="$YourCashTag"]');
      if (cashAppInput) {
        cashAppInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => cashAppInput.focus(), 500);
      }
      return;
    }

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message);
      setProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-[#FFD60A] to-[#6C3BFF] hover:from-[#FFE44D] hover:to-[#8B5CF6] text-white py-6 text-lg rounded-xl"
      >
        {processing ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay ${amount.toFixed(2)}
          </div>
        )}
      </Button>
    </form>
  );
}

export default function StripeCheckout({ amount, orderId, studentName, parentEmail, onSuccess, onError, cashAppTag, cashAppTagEnabled }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStripe();
  }, [amount, orderId]);

  const initializeStripe = async () => {
    setLoading(true);
    setClientSecret(null);
    
    try {
      // Get publishable key from backend
      if (!stripePromise) {
        const keyResponse = await base44.functions.invoke('getStripePublishableKey');
        stripePromise = loadStripe(keyResponse.data.publishableKey);
      }

      // Create payment intent
      const response = await base44.functions.invoke('createStripePayment', {
        amount,
        orderId,
        studentName,
        parentEmail,
      });

      setClientSecret(response.data.clientSecret);
    } catch (error) {
      onError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#FFD60A] animate-spin" />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="text-white/60 text-center py-8">
        Failed to load payment form. Please refresh and try again.
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'night',
      variables: {
        colorPrimary: '#FFD60A',
        colorBackground: '#1a1535',
        colorText: '#ffffff',
        colorDanger: '#df1b41',
        borderRadius: '12px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm 
        amount={amount} 
        onSuccess={onSuccess} 
        onError={onError} 
        cashAppTag={cashAppTag}
        cashAppTagEnabled={cashAppTagEnabled}
      />
    </Elements>
  );
}