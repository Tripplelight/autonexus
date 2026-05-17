// src/pages/HomePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, ArrowRight, Shield, TrendingUp, ChevronDown, Car, Users, Award, Zap } from 'lucide-react';
import { useSEO } from "../hooks/useSEO";
import { carsApi, aiApi } from '../services/api';
import CarCard from '../components/cars/CarCard';
import Testimonials from '../components/ui/Testimonials';

// ── Animated counter ──────────────────────────────────────────────────────────
const Stat = ({ value, label }) => (
  <div className="text-center">
    <p className="font-display text-4xl sm:text-5xl tracking-wider text-white">{value}</p>
    <p className="text-white/40 text-xs sm:text-sm mt-1 uppercase tracking-widest">{label}</p>
  </div>
);

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useSEO({ title: "Find Your Perfect Car", description: "AI-powered car dealership in Nairobi. Browse verified vehicles, get price predictions and virtual test drives." });

  const { data } = useQuery({
    queryKey: ['featured-cars'],
    queryFn: () => carsApi.getAll({ featured: true, limit: 6 })
  });

  const { data: allCars } = useQuery({
    queryKey: ['cars-count'],
    queryFn: () => carsApi.getAll({ limit: 1 })
  });

  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) { navigate('/cars'); return; }
    setSearching(true);
    try {
      const res = await aiApi.smartSearch(searchQuery);
      const params = new URLSearchParams(res.filters).toString();
      navigate(`/cars?${params}&aiSearch=true`);
    } catch {
      navigate(`/cars?search=${encodeURIComponent(searchQuery)}`);
    } finally { setSearching(false); }
  };

  const features = [
    {
      icon: <Sparkles size={22} />,
      title: 'AI-Powered Search',
      desc: 'Describe your perfect car in plain English — budget, use case, vibe — and our AI finds the best matches instantly.',
      color: 'brand'
    },
    {
      icon: <TrendingUp size={22} />,
      title: 'Price Intelligence',
      desc: 'Get real-time market price predictions powered by AI before you commit, so you always know if you\'re getting a fair deal.',
      color: 'green'
    },
    {
      icon: <Shield size={22} />,
      title: 'Verified Inventory',
      desc: 'Every vehicle is inspected, documented and certified by our team before listing. No surprises, no stress.',
      color: 'blue'
    },
    {
      icon: <Car size={22} />,
      title: 'Virtual Test Drive',
      desc: 'Ask our AI anything about any car — how it handles, if it fits your lifestyle — before stepping into the showroom.',
      color: 'purple'
    }
  ];

  const colorMap = {
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/10',
    green: 'bg-green-500/10 text-green-400 border-green-500/10',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/10'
  };

  const popular = ['Toyota Land Cruiser', 'BMW 3 Series', 'Subaru Forester', 'Mercedes GLE'];

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">

        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1920&q=80"
            alt="Luxury car"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-900 via-dark-900/85 to-dark-900/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-dark-900/30" />
        </div>

        {/* Decorative orange glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32 w-full">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium mb-8 animate-fade-up">
              <Sparkles size={12} />
              AI-Powered Car Dealership · Nairobi, Kenya
            </div>

            {/* Headline */}
            <h1 className="font-display tracking-wider text-white leading-[0.9] mb-6 animate-fade-up"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)' }}>
              FIND YOUR<br />
              <span className="text-brand-500">PERFECT</span><br />
              DRIVE.
            </h1>

            <p className="text-white/50 text-lg leading-relaxed mb-10 max-w-lg animate-fade-up">
              Browse premium verified vehicles. Let AI find your match. Get transparent pricing. Drive home happy.
            </p>

            {/* Smart Search Bar */}
            <form onSubmit={handleSmartSearch} className="animate-fade-up">
              <div className="flex gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-sm max-w-2xl focus-within:border-brand-500/50 transition-colors">
                <div className="relative flex-1 flex items-center">
                  <Sparkles size={16} className="absolute left-3 text-brand-500 shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder='Try "family SUV under 5M, automatic, diesel"'
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching}
                  className="btn-primary !rounded-xl !px-5 !py-3 flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  {searching
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Searching...</>
                    : <><Search size={15} /> AI Search</>
                  }
                </button>
              </div>

              {/* Popular searches */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4">
                <span className="text-xs text-white/20 uppercase tracking-wider">Popular:</span>
                {popular.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSearchQuery(s)}
                    className="text-xs text-white/40 hover:text-brand-400 transition-colors border border-white/10 hover:border-brand-500/30 px-3 py-1 rounded-full"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </form>

            {/* CTAs */}
            <div className="flex gap-3 mt-8 animate-fade-up">
              <button onClick={() => navigate('/cars')} className="btn-primary flex items-center gap-2">
                Browse All Cars <ArrowRight size={15} />
              </button>
              <button onClick={() => navigate('/cars?condition=NEW')} className="btn-outline flex items-center gap-2">
                New Arrivals
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20 animate-bounce">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────────────── */}
      <section className="bg-dark-800 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            <Stat value={`${allCars?.total || '50'}+`} label="Vehicles Listed" />
            <Stat value="100%" label="Verified Stock" />
            <Stat value="4" label="AI Features" />
            <Stat value="24/7" label="AI Assistant" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-brand-400 text-xs uppercase tracking-widest font-medium mb-3">Why AutoNexus</p>
          <h2 className="font-display text-4xl sm:text-5xl tracking-wider">THE SMARTER WAY<br />TO BUY A CAR</h2>
          <p className="text-white/40 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
            We combine verified inventory with cutting-edge AI to make car buying transparent, fast, and stress-free.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div key={i} className={`card p-6 border ${colorMap[f.color].split(' ')[2]} hover:-translate-y-1 transition-transform duration-300`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${colorMap[f.color].split(' ').slice(0,2).join(' ')}`}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED CARS ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-brand-400 text-xs uppercase tracking-widest font-medium mb-2">Hand-picked</p>
            <h2 className="font-display text-4xl sm:text-5xl tracking-wider">FEATURED RIDES</h2>
          </div>
          <button
            onClick={() => navigate('/cars')}
            className="btn-outline !px-5 !py-2.5 !text-sm flex items-center gap-2 hidden sm:flex"
          >
            View all <ArrowRight size={14} />
          </button>
        </div>

        {data?.cars?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.cars.map(car => <CarCard key={car.id} car={car} />)}
          </div>
        ) : (
          <div className="text-center py-20 card">
            <Car size={40} className="text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No featured cars yet — add some from the admin panel</p>
          </div>
        )}

        <div className="text-center mt-8 sm:hidden">
          <button onClick={() => navigate('/cars')} className="btn-outline flex items-center gap-2 mx-auto">
            View all cars <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&q=80"
            alt="Car interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-dark-900/80" />
          <div className="absolute inset-0 bg-brand-500/10" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <Zap size={32} className="text-brand-400 mx-auto mb-6" />
          <h2 className="font-display text-4xl sm:text-6xl tracking-wider mb-6">
            LET AI FIND YOUR<br /><span className="text-brand-500">PERFECT CAR</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Tell our AI your budget, lifestyle and preferences. Get personalized recommendations in seconds.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => navigate('/cars')} className="btn-primary flex items-center gap-2 !px-8 !py-4">
              Start Browsing <ArrowRight size={16} />
            </button>
            <button onClick={() => navigate('/register')} className="btn-outline !px-8 !py-4">
              Create Free Account
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
