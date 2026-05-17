// src/pages/CarDetailPage.jsx
import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Gauge, Fuel, Settings, Calendar, Palette, Zap, Send, Car,
  TrendingUp, ChevronLeft, ChevronRight, Heart, Share2,
  MessageCircle, Phone, CheckCircle, ArrowLeft, Sparkles,
  Loader, Building // Added missing imports here
} from 'lucide-react';
import { carsApi, ordersApi, aiApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import RelatedCars from '../components/cars/RelatedCars';
import { useSEO } from '../hooks/useSEO';

// ── Helpers ───────────────────────────────────────────────────────────────────
const conditionColor = {
  NEW: 'bg-green-500/20 text-green-400 border-green-500/20',
  CERTIFIED: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
  USED: 'bg-white/10 text-white/50 border-white/10'
};

const confidenceColor = {
  high: 'text-green-400',
  medium: 'text-yellow-400',
  low: 'text-red-400'
};

// ── Spec Card ─────────────────────────────────────────────────────────────────
const SpecCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-dark-700 rounded-xl border border-white/5">
    <span className="text-brand-400 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-xs text-white/30">{label}</p>
      <p className="text-sm font-medium text-white truncate">{value}</p>
    </div>
  </div>
);

// ── Success Toast ─────────────────────────────────────────────────────────────
const Toast = ({ message, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-dark-700 border border-green-500/30 text-white px-5 py-3 rounded-2xl shadow-2xl animate-fade-up">
      <CheckCircle size={16} className="text-green-400 shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CarDetailPage() {
  const { id } = useParams();
  const { token } = useAuthStore();
  const navigate = useNavigate();

  const [activeImg, setActiveImg] = useState(0);
  const [tdMessages, setTdMessages] = useState([{
    role: 'ASSISTANT',
    content: `Hey! 👋 I'm your virtual guide for this car. Ask me anything — how it drives, if it fits your lifestyle, or whether it's worth the price.`
  }]);
  const [tdInput, setTdInput] = useState('');
  const [tdLoading, setTdLoading] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [toast, setToast] = useState('');
  const [orderType, setOrderType] = useState(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [mpesaData, setMpesaData] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const tdBottomRef = useRef(null);

  // FIX 1: Move useQuery above useSEO so 'car' is initialized first
  const { data: car, isLoading } = useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.getById(id)
  });

  // Now useSEO can safely evaluate 'car' without hitting a Temporal Dead Zone
  useSEO(car ? {
    title: `${car.year} ${car.make} ${car.model}`,
    description: `${car.year} ${car.make} ${car.model} · KES ${car.price?.toLocaleString()} · ${car.condition} · ${car.mileage?.toLocaleString()}km. Available at AutoNexus Nairobi.`,
    image: car.images?.[0]
  } : {});

  useEffect(() => {
    tdBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tdMessages]);

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: ({ type, phone }) => ordersApi.create({ carId: id, type, phone }),
    onSuccess: (res, { type }) => {
      if (type === 'INQUIRY') {
        setToast('✅ Inquiry sent! We\'ll contact you soon.');
        setTimeout(() => navigate('/account'), 2500);
      } else if (type === 'DEPOSIT') {
        setMpesaData(res.mpesa);
        setBankDetails(res.bankDetails);
        setToast('📱 Check your phone for Mpesa prompt!');
      }
      setOrderType(null);
    },
    onError: (err) => setToast('❌ ' + (err.message || 'Failed. Please try again.'))
  });

  const sendTestDrive = async () => {
    if (!tdInput.trim() || tdLoading) return;
    const q = tdInput.trim();
    setTdInput('');
    setTdMessages(prev => [...prev, { role: 'USER', content: q }]);
    setTdLoading(true);
    try {
      const res = await aiApi.testDrive(id, { question: q, history: tdMessages });
      setTdMessages(prev => [...prev, { role: 'ASSISTANT', content: res.reply }]);
    } catch {
      setTdMessages(prev => [...prev, { role: 'ASSISTANT', content: 'Connection issue — please try again.' }]);
    }
    setTdLoading(false);
  };

  const checkPaymentStatus = async () => {
    if (!mpesaData?.checkoutRequestId) return;
    setCheckingPayment(true);
    try {
      const res = await ordersApi.checkPaymentStatus(mpesaData.checkoutRequestId);
      if (res.paid) {
        setToast('🎉 Payment confirmed! Vehicle reserved.');
        setMpesaData(null);
        setTimeout(() => navigate('/account'), 2000);
      } else {
        setToast('⏳ Payment not yet confirmed. Try again in a moment.');
      }
    } catch { setToast('Could not check payment status.'); }
    finally { setCheckingPayment(false); }
  };

  const getPricePrediction = async () => {
    setLoadingPrice(true);
    try {
      const res = await aiApi.predictPrice({
        make: car.make, model: car.model, year: car.year,
        mileage: car.mileage, condition: car.condition,
        bodyType: car.bodyType, fuel: car.fuel, transmission: car.transmission
      });
      setPriceData(res);
    } catch { setToast('Could not fetch price analysis.'); }
    finally { setLoadingPrice(false); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${car.year} ${car.make} ${car.model}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToast('Link copied to clipboard!');
    }
  };

  const nextImg = () => setActiveImg(i => (i + 1) % images.length);
  const prevImg = () => setActiveImg(i => (i - 1 + images.length) % images.length);

  // ── Loading / Error states ──────────────────────────────────────────────────
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        <p className="text-white/30 text-sm">Loading vehicle...</p>
      </div>
    </div>
  );

  if (!car) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Car size={48} className="text-white/10" />
      <p className="text-white/40">Vehicle not found</p>
      <Link to="/cars" className="btn-primary !px-5 !py-2 !text-sm">Browse Cars</Link>
    </div>
  );

  const images = car.images?.length
    ? car.images
    : ['https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80'];

  const specs = [
    { icon: <Calendar size={15} />, label: 'Year', value: car.year },
    { icon: <Gauge size={15} />, label: 'Mileage', value: `${car.mileage?.toLocaleString()} km` },
    { icon: <Fuel size={15} />, label: 'Fuel', value: car.fuel },
    { icon: <Settings size={15} />, label: 'Gearbox', value: car.transmission },
    { icon: <Car size={15} />, label: 'Body', value: car.bodyType },
    { icon: <Palette size={15} />, label: 'Color', value: car.color },
    { icon: <Zap size={15} />, label: 'Engine', value: car.engine },
    ...(car.horsepower ? [{ icon: <Zap size={15} />, label: 'Power', value: `${car.horsepower} hp` }] : [])
  ];

  const tdSuggestions = [
    'How does it handle on rough roads?',
    'Is it good for long highway drives?',
    'How\'s the fuel economy?',
    'Is it worth the price?'
  ];

  // FIX 3: Wrapped components inside a JSX Fragment wrapper `<> ... </>`
  return (
    <>
      <div className="min-h-screen bg-dark-900">
        {toast && <Toast message={toast} onClose={() => setToast('')} />}

        {/* ── Back nav ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors mb-6">
            <ArrowLeft size={15} /> Back to listings
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 xl:gap-12">

            {/* ── LEFT: Images + Specs ── */}
            <div className="lg:col-span-3 space-y-5">

              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden bg-dark-800 aspect-video group">
                <img
                  src={images[activeImg]}
                  alt={`${car.make} ${car.model}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&q=80'; }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 via-transparent to-transparent" />

                {/* Nav arrows — only show if multiple images */}
                {images.length > 1 && (
                  <>
                    <button onClick={prevImg}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark-900/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-dark-800 transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={nextImg}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-dark-900/70 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-dark-800 transition-colors opacity-0 group-hover:opacity-100">
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-dark-900/70 backdrop-blur-sm rounded-full text-xs text-white/60 border border-white/10">
                    {activeImg + 1} / {images.length}
                  </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {car.featured && <span className="badge bg-brand-500/90 text-white text-xs backdrop-blur-sm">⭐ Featured</span>}
                  <span className={`badge border text-xs backdrop-blur-sm ${conditionColor[car.condition]}`}>{car.condition}</span>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-brand-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=200&q=60'; }} />
                    </button>
                  ))}
                </div>
              )}

              {/* Specs Grid */}
              <div className="card p-5 sm:p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Settings size={15} className="text-brand-400" /> Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {specs.map((s, i) => <SpecCard key={i} {...s} />)}
                </div>
              </div>

              {/* Description */}
              <div className="card p-5 sm:p-6">
                <h3 className="font-semibold mb-3">About this car</h3>
                <p className="text-white/50 text-sm leading-relaxed">{car.description || 'No description provided.'}</p>
              </div>

              {/* Virtual Test Drive — on mobile shows here, on desktop shows right column */}
              <div className="lg:hidden card flex flex-col overflow-hidden" style={{ height: 420 }}>
                <div className="p-4 border-b border-white/5 bg-dark-700/50">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Sparkles size={15} className="text-brand-400" /> Virtual Test Drive AI
                  </h3>
                  <p className="text-xs text-white/30 mt-0.5">Ask anything about this car</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {tdMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] text-xs px-3 py-2.5 rounded-2xl leading-relaxed ${
                        m.role === 'USER' ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-dark-700 text-white/80 rounded-bl-sm'
                      }`}>{m.content}</div>
                    </div>
                  ))}
                  {tdLoading && (
                    <div className="flex gap-1 pl-1">
                      {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  )}
                  <div ref={tdBottomRef} />
                </div>
                <div className="p-3 border-t border-white/5 flex gap-2">
                  <input value={tdInput} onChange={e => setTdInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendTestDrive()}
                    placeholder="How does it handle in traffic?" className="input !py-2 !text-xs flex-1" />
                  <button onClick={sendTestDrive} disabled={!tdInput.trim() || tdLoading}
                    className="btn-primary !px-3 !py-2 disabled:opacity-40"><Send size={14} /></button>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Price + Actions + AI ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Price Card */}
              <div className="card p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider">{car.make}</p>
                    <h1 className="text-xl sm:text-2xl font-bold leading-tight">{car.model} <span className="text-white/30 font-normal">{car.year}</span></h1>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={handleShare}
                      className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-colors" title="Share">
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="py-4 border-y border-white/5 mb-4">
                  <p className="text-xs text-white/30 mb-1">Listed Price</p>
                  <p className="text-3xl sm:text-4xl font-bold text-brand-400">
                    KES {car.price?.toLocaleString()}
                  </p>
                  <p className="text-xs text-white/20 mt-1">
                    ≈ USD {(car.price / 130).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>

                {/* AI Price Analysis */}
                {!priceData ? (
                  <button onClick={getPricePrediction} disabled={loadingPrice}
                    className="w-full flex items-center justify-center gap-2 text-sm border border-brand-500/20 text-brand-400 rounded-xl py-2.5 hover:bg-brand-500/10 transition-colors mb-4 disabled:opacity-50">
                    {loadingPrice
                      ? <><span className="w-3.5 h-3.5 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" /> Analyzing market...</>
                      : <><TrendingUp size={14} /> Get AI Price Analysis</>
                    }
                  </button>
                ) : (
                  <div className="mb-4 p-4 bg-dark-700 rounded-xl border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/40 font-medium">AI Price Analysis</p>
                      <span className={`text-xs font-medium capitalize ${confidenceColor[priceData.confidence]}`}>
                        {priceData.confidence} confidence
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{priceData.reasoning}</p>
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs text-white/30">Market Range</p>
                      <p className="text-xs text-white font-medium">
                        KES {priceData.minPrice?.toLocaleString()} – {priceData.maxPrice?.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/30">Fair Price</p>
                      <p className={`text-xs font-semibold ${car.price <= priceData.fairPrice ? 'text-green-400' : 'text-yellow-400'}`}>
                        KES {priceData.fairPrice?.toLocaleString()}
                        {car.price <= priceData.fairPrice ? ' ✓ Good deal' : ' ↑ Above market'}
                      </p>
                    </div>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  {token ? (
                    <>
                      {/* Mpesa success state */}
                      {mpesaData && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl space-y-3">
                          <p className="text-sm text-green-400 font-medium flex items-center gap-2">
                            <Phone size={14} /> Mpesa prompt sent to your phone!
                          </p>
                          <p className="text-xs text-white/40">Enter your Mpesa PIN to complete the deposit. Then click below to confirm.</p>
                          <button onClick={checkPaymentStatus} disabled={checkingPayment}
                            className="btn-primary w-full !py-2.5 !text-sm flex items-center justify-center gap-2">
                            {checkingPayment ? <><Loader size={13} className="animate-spin" /> Checking...</> : '✅ I\'ve paid — Confirm'}
                          </button>
                        </div>
                      )}

                      {/* Bank details state */}
                      {bankDetails && (
                        <div className="p-4 bg-dark-700 border border-white/10 rounded-xl space-y-2">
                          <p className="text-xs text-white/40 font-medium flex items-center gap-2 mb-3">
                            <Building size={13} /> Balance Payment — Bank Transfer
                          </p>
                          <p className="text-xs text-white/30">Remaining balance: <span className="text-white font-medium">KES {(car.price - car.price * 0.1)?.toLocaleString()}</span></p>
                          {Object.entries(bankDetails).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-xs">
                              <span className="text-white/30 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-white font-medium">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {!mpesaData && (
                        <>
                          <button onClick={() => createOrder({ type: 'INQUIRY' })} disabled={isPending}
                            className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5">
                            <MessageCircle size={16} />
                            {isPending ? 'Sending...' : 'Send Inquiry'}
                          </button>

                          {/* Phone input for deposit */}
                          <div>
                            <div className="flex gap-2">
                              <input
                                value={phone}
                                onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
                                placeholder="Phone for Mpesa e.g. 0712345678"
                                className={`input !py-3 flex-1 !text-sm ${phoneError ? '!border-red-500/50' : ''}`}
                              />
                            </div>
                            {phoneError && <p className="text-xs text-red-400 mt-1">{phoneError}</p>}
                          </div>

                          <button
                            onClick={() => {
                              if (!phone.trim()) { setPhoneError('Enter your Mpesa phone number'); return; }
                              if (!/^(0|\+254|254)[17]\d{8}$/.test(phone.replace(/\s/g, ''))) { setPhoneError('Enter a valid Kenyan number'); return; }
                              createOrder({ type: 'DEPOSIT', phone });
                            }}
                            disabled={isPending}
                            className="btn-outline w-full flex items-center justify-center gap-2 !py-3.5">
                            <Phone size={16} />
                            {isPending ? 'Processing...' : `Pay Deposit via Mpesa — KES ${(car.price * 0.1)?.toLocaleString()}`}
                          </button>
                          <p className="text-center text-xs text-white/20">10% deposit · Balance via bank transfer</p>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button onClick={() => navigate('/login')} className="btn-primary w-full !py-3.5">
                        Sign In to Inquire
                      </button>
                      <p className="text-center text-xs text-white/30">
                        <Link to="/register" className="text-brand-400 hover:underline">Create account</Link> — it's free
                      </p>
                    </>
                  )}
                </div>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/254700000000?text=Hi! I'm interested in the ${car.year} ${car.make} ${car.model} listed at KES ${car.price?.toLocaleString()} on AutoNexus. Link: ${window.location.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-2 text-sm text-green-400 border border-green-500/20 rounded-xl py-3 hover:bg-green-500/10 transition-colors"
                >
                  <Phone size={15} /> Chat on WhatsApp
                </a>
              </div>

              {/* Virtual Test Drive — desktop only */}
              <div className="hidden lg:flex card flex-col overflow-hidden" style={{ height: 440 }}>
                <div className="p-4 border-b border-white/5 bg-dark-700/30">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Sparkles size={15} className="text-brand-400" /> Virtual Test Drive AI
                  </h3>
                  <p className="text-xs text-white/30 mt-0.5">Ask anything about this car</p>
                </div>

                {/* Suggestions */}
                {tdMessages.length === 1 && (
                  <div className="px-4 pt-3 flex flex-wrap gap-1.5">
                    {tdSuggestions.map((s, i) => (
                      <button key={i} onClick={() => { setTdInput(s); }}
                        className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 hover:border-brand-500/40 hover:text-brand-400 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {tdMessages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] text-xs px-3 py-2.5 rounded-2xl leading-relaxed ${
                        m.role === 'USER' ? 'bg-brand-500 text-white rounded-br-sm' : 'bg-dark-700 text-white/80 rounded-bl-sm'
                      }`}>{m.content}</div>
                    </div>
                  ))}
                  {tdLoading && (
                    <div className="flex gap-1 pl-1">
                      {[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                    </div>
                  )}
                  <div ref={tdBottomRef} />
                </div>

                <div className="p-3 border-t border-white/5 flex gap-2">
                  <input value={tdInput} onChange={e => setTdInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendTestDrive()}
                    placeholder="How does it handle on rough roads?" className="input !py-2 !text-xs flex-1" />
                  <button onClick={sendTestDrive} disabled={!tdInput.trim() || tdLoading}
                    className="btn-primary !px-3 !py-2 disabled:opacity-40"><Send size={14} /></button>
                </div>
              </div>

              {/* Quick specs summary for mobile feel */}
              <div className="card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Quick Summary</h3>
                {[
                  ['Status', car.status],
                  ['Body Type', car.bodyType],
                  ['Fuel', car.fuel],
                  ['Transmission', car.transmission],
                  ['Condition', car.condition],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className="text-white/30">{label}</span>
                    <span className="text-white font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {car && <RelatedCars car={car} />}
    </>
  );
}