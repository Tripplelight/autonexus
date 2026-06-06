// src/pages/DealerOnboardingPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Building, MapPin, Phone, FileText, Upload, Check, ArrowRight, SkipForward } from 'lucide-react';
import { dealerApi } from '../services/api';
import { useSEO } from '../hooks/useSEO';

const STEPS = [
  { id: 1, label: 'Business Profile', desc: 'Help buyers find and trust you' },
  { id: 2, label: 'First Listing', desc: 'Add your first vehicle' },
  { id: 3, label: 'Trial Status', desc: 'Understand your free trial' },
];

export default function DealerOnboardingPage() {
  useSEO({ title: 'Welcome to AutoNexus' });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ businessName: '', phone: '', location: '', description: '' });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => v && data.append(k, v));
      if (logo) data.append('logo', logo);
      await dealerApi.updateProfile(data);
      qc.invalidateQueries({ queryKey: ['dealer-profile'] });
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const goToDashboard = () => navigate('/dealer/dashboard');

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check size={22} className="text-white" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl tracking-wider mb-1">YOU'RE IN!</h1>
          <p className="text-white/40 text-sm">Let's set up your dealership in 3 quick steps</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s.id ? 'bg-brand-500 text-white' :
                  step === s.id ? 'bg-brand-500/20 border-2 border-brand-500 text-brand-400' :
                  'bg-dark-700 text-white/20'
                }`}>
                  {step > s.id ? <Check size={13} /> : s.id}
                </div>
                <span className={`text-xs text-center hidden sm:block ${step >= s.id ? 'text-white/50' : 'text-white/20'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 ${step > s.id ? 'bg-brand-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1 — Business Profile */}
        {step === 1 && (
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="font-semibold text-base mb-1">Complete your business profile</h2>
              <p className="text-white/40 text-xs">Dealers with full profiles get 3x more inquiries</p>
            </div>

            {/* Logo upload */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                {logoPreview
                  ? <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                  : <Building size={20} className="text-white/20" />
                }
              </div>
              <label className="cursor-pointer flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors border border-white/10 hover:border-white/30 px-4 py-2 rounded-xl">
                <Upload size={14} />
                Upload Logo
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Business Name</label>
              <div className="relative">
                <Building size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={form.businessName} onChange={set('businessName')}
                  placeholder="e.g. Prestige Motors Ltd"
                  className="input w-full !pl-8 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={form.phone} onChange={set('phone')}
                  placeholder="0712 345 678"
                  className="input w-full !pl-8 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">Location</label>
              <div className="relative">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input value={form.location} onChange={set('location')}
                  placeholder="e.g. Westlands, Nairobi"
                  className="input w-full !pl-8 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 mb-1.5 block">About Your Dealership <span className="text-white/20">(optional)</span></label>
              <div className="relative">
                <FileText size={13} className="absolute left-3 top-3 text-white/30" />
                <textarea value={form.description} onChange={set('description')}
                  rows={2} placeholder="Tell buyers what makes you unique..."
                  className="input w-full !pl-8 !py-2.5 resize-none text-sm" />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={() => setStep(2)}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors">
                <SkipForward size={13} /> Skip for now
              </button>
              <button onClick={saveProfile} disabled={loading}
                className="flex-1 bg-brand-500 hover:bg-brand-600 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? 'Saving...' : <><span>Save & Continue</span><ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — First Listing */}
        {step === 2 && (
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-1">Add your first vehicle</h2>
            <p className="text-white/40 text-xs mb-6">Listings go live as soon as your trial is active</p>

            <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 mb-6">
              <p className="text-sm text-brand-400 font-medium mb-2">💡 Pro tip</p>
              <ul className="text-xs text-white/40 space-y-1">
                <li>• Add at least 5 photos per car for best results</li>
                <li>• Complete descriptions get 2x more inquiries</li>
                <li>• AI price prediction helps you price competitively</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors">
                <SkipForward size={13} /> Do this later
              </button>
              <button onClick={() => navigate('/dealer/dashboard?action=add-car')}
                className="flex-1 bg-brand-500 hover:bg-brand-600 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2">
                Add First Car <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Trial Status */}
        {step === 3 && (
          <div className="bg-dark-800 border border-white/5 rounded-2xl p-6">
            <h2 className="font-semibold text-base mb-1">Your 30-day free trial</h2>
            <p className="text-white/40 text-xs mb-6">Here's what you get and what happens next</p>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Unlimited car listings', active: true },
                { label: 'AI-powered smart search', active: true },
                { label: 'Buyer inquiries & WhatsApp leads', active: true },
                { label: 'Dealer dashboard & analytics', active: true },
                { label: 'After trial — KES 5,000/month to stay active', active: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.active ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                    <Check size={11} className={item.active ? 'text-emerald-400' : 'text-white/20'} />
                  </div>
                  <p className={`text-sm ${item.active ? 'text-white/70' : 'text-white/30'}`}>{item.label}</p>
                </div>
              ))}
            </div>

            <button onClick={goToDashboard}
              className="w-full bg-brand-500 hover:bg-brand-600 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-2">
              Go to Dashboard <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}