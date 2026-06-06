// src/pages/DealerSubscriptionPage.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealerApi } from '../services/api';
import api from '../services/api';
import { useSEO } from '../hooks/useSEO';
import { AlertTriangle, Phone, CheckCircle, Loader } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function DealerSubscriptionPage() {
  useSEO({ title: 'My Subscription' });

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paymentState, setPaymentState] = useState('idle'); // idle | pending | polling | success | failed
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const pollingRef = useRef(null);
  const qc = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['dealer-profile'],
    queryFn: dealerApi.getProfile,
  });

  const { data: subscription } = useQuery({
    queryKey: ['dealer-subscription'],
    queryFn: dealerApi.getSubscription,
  });

  // ── Initiate STK Push ──
  const { mutate: initiatePayment, isPending } = useMutation({
    mutationFn: ({ months, phone }) => api.post('/payments/mpesa/subscribe', { months, phone }),
    onSuccess: (data) => {
      setCheckoutRequestId(data.checkoutRequestId);
      setPaymentState('polling');
      startPolling(data.checkoutRequestId);
    },
    onError: (err) => {
      setPaymentState('failed');
      alert(err?.message || 'Failed to initiate payment. Try again.');
    }
  });

  // ── Poll payment status ──
  const startPolling = (reqId) => {
    let attempts = 0;
    const MAX_ATTEMPTS = 12; // 60 seconds max

    pollingRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/payments/mpesa/status/${reqId}`);
        if (res.status === 'PAID') {
          clearInterval(pollingRef.current);
          setPaymentState('success');
          qc.invalidateQueries({ queryKey: ['dealer-subscription'] });
          qc.invalidateQueries({ queryKey: ['dealer-profile'] });
        } else if (res.status === 'FAILED') {
          clearInterval(pollingRef.current);
          setPaymentState('failed');
        }
      } catch (_) {}

      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(pollingRef.current);
        if (paymentState !== 'success') setPaymentState('failed');
      }
    }, 5000);
  };

  useEffect(() => {
    return () => clearInterval(pollingRef.current);
  }, []);

  const handlePay = () => {
    if (!selectedPlan) return;
    if (!mpesaPhone || mpesaPhone.length < 9) {
      alert('Please enter a valid M-Pesa number');
      return;
    }
    setPaymentState('pending');
    initiatePayment({ months: selectedPlan.months, phone: mpesaPhone });
  };

  const resetPayment = () => {
    clearInterval(pollingRef.current);
    setPaymentState('idle');
    setCheckoutRequestId(null);
    setSelectedPlan(null);
    setMpesaPhone('');
  };

  const plans = [
    { months: 1, price: 5000, label: '1 Month' },
    { months: 3, price: 14000, label: '3 Months', popular: true },
    { months: 6, price: 26000, label: '6 Months' },
    { months: 12, price: 48000, label: '12 Months (Best Value)' },
  ];

  if (isLoading) return <div className="p-10 text-center text-sm text-white/50">Loading...</div>;

  const status = subscription?.status || 'TRIAL';
  // `active` is the backend's source of truth — a TRIAL dealer is active too, so
  // their listings are NOT hidden. Don't re-derive from the status string.
  const isActive = !!subscription?.active;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* ── Title ── */}
      <div className="text-center mb-8">
        <h1 className="font-display text-2xl sm:text-3xl tracking-tighter">Choose Your Plan</h1>
        <p className="text-white/50 text-sm mt-2">Keep your dealership visible 24/7</p>
      </div>

      {/* ── Current Status ── */}
      <div className="bg-dark-900 border border-white/10 rounded-2xl p-5 sm:p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs uppercase text-white/40 mb-1">Current Plan</p>
            <p className={`text-2xl sm:text-3xl font-semibold capitalize ${isActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {status}
            </p>
            {subscription?.daysLeft > 0 && (
              <p className="text-white/40 text-xs mt-1">{subscription.daysLeft} days remaining</p>
            )}
          </div>
          {!isActive && (
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle size={20} />
              <span className="text-sm font-medium">Listings Hidden</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Success State ── */}
      {paymentState === 'success' && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 mb-8 text-center">
          <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-emerald-400 mb-1">Payment Successful!</h3>
          <p className="text-white/50 text-sm">Your subscription is now active. Your listings are live 🎉</p>
          <button onClick={resetPayment} className="mt-4 text-xs text-white/40 hover:text-white underline">
            Make another payment
          </button>
        </div>
      )}

      {/* ── Plans ── */}
      {paymentState !== 'success' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.months}
                onClick={() => paymentState === 'idle' && setSelectedPlan(plan)}
                className={`bg-dark-900 border rounded-2xl p-4 sm:p-6 cursor-pointer transition-all hover:-translate-y-1 ${
                  selectedPlan?.months === plan.months
                    ? 'border-brand-500 scale-[1.02]'
                    : 'border-white/10 hover:border-brand-500/50'
                } ${plan.popular ? 'ring-2 ring-brand-500/60' : ''} ${
                  paymentState !== 'idle' ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {plan.popular && (
                  <div className="text-brand-400 text-xs font-bold mb-3 text-center tracking-wide">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-sm sm:text-base font-semibold">{plan.label}</h3>
                <div className="my-4">
                  <p className="text-xs text-white/40">KES</p>
                  <p className="text-2xl sm:text-3xl font-bold">{plan.price.toLocaleString()}</p>
                </div>
                <button className="w-full py-2.5 rounded-xl border border-white/20 hover:bg-white/5 text-sm transition-colors">
                  Select Plan
                </button>
              </div>
            ))}
          </div>

          {/* ── Payment Section ── */}
          {selectedPlan && paymentState === 'idle' && (
            <div className="bg-dark-900 border border-brand-500/30 rounded-2xl p-5 sm:p-8">
              <h3 className="text-lg sm:text-xl font-semibold mb-5">Complete Payment</h3>

              {/* Plan summary */}
              <div className="bg-dark-800 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40">Selected Plan</p>
                  <p className="font-semibold">{selectedPlan.label}</p>
                </div>
                <p className="text-xl font-bold text-brand-400">KES {selectedPlan.price.toLocaleString()}</p>
              </div>

              {/* Phone input */}
              <div className="mb-6">
                <label className="text-xs text-white/40 mb-2 block">M-Pesa Number</label>
                <div className="flex items-center gap-3 bg-dark-800 border border-white/10 focus-within:border-brand-500/50 rounded-xl px-4 py-3 transition-colors">
                  <Phone size={16} className="text-white/30 shrink-0" />
                  <input
                    type="tel"
                    placeholder="e.g. 0712 345 678"
                    value={mpesaPhone}
                    onChange={e => setMpesaPhone(e.target.value)}
                    className="bg-transparent text-sm outline-none flex-1 placeholder:text-white/20"
                  />
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={isPending || !mpesaPhone}
                className="w-full bg-brand-500 hover:bg-brand-600 py-4 rounded-xl text-base font-semibold transition-all active:scale-95 disabled:opacity-60"
              >
                Pay KES {selectedPlan.price.toLocaleString()}
              </button>

              <p className="text-center text-white/30 text-xs mt-4">
                You'll receive a prompt on your phone to confirm payment
              </p>
            </div>
          )}

          {/* ── Polling State ── */}
          {(paymentState === 'pending' || paymentState === 'polling') && (
            <div className="bg-dark-900 border border-brand-500/30 rounded-2xl p-8 text-center">
              <Loader size={36} className="text-brand-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Waiting for payment...</h3>
              <p className="text-white/50 text-sm mb-1">Check your phone and enter your M-Pesa PIN</p>
              <p className="text-white/30 text-xs">This may take up to 60 seconds</p>
              <button onClick={resetPayment} className="mt-6 text-xs text-white/30 hover:text-white underline">
                Cancel
              </button>
            </div>
          )}

          {/* ── Failed State ── */}
          {paymentState === 'failed' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
              <AlertTriangle size={36} className="text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-red-400 mb-1">Payment Failed</h3>
              <p className="text-white/50 text-sm mb-4">The payment was not completed. Please try again.</p>
              <button
                onClick={resetPayment}
                className="bg-brand-500 hover:bg-brand-600 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </>
      )}

      <p className="text-center text-white/20 text-xs mt-8">
        Payment issues? Contact <span className="text-brand-400">admin@autonexus.com</span>
      </p>
    </div>
  );
}