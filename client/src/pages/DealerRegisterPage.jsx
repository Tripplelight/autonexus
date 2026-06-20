// src/pages/DealerRegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Car, Check, Building, MapPin, Phone } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSEO } from '../hooks/useSEO';
import api from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

const FieldError = ({ msg }) => msg
  ? <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{msg}</p>
  : null;

const validate = ({ name, email, password, phone, businessName, location }) => {
  const errors = {};
  if (!name.trim()) errors.name = 'Full name is required';
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Valid email required';
  if (!password || password.length < 8) errors.password = 'Min 8 characters';
  else if (!/[A-Z]/.test(password)) errors.password = 'Include an uppercase letter';
  else if (!/[0-9]/.test(password)) errors.password = 'Include a number';
  if (!phone) errors.phone = 'Phone is required';
  if (!businessName.trim()) errors.businessName = 'Business name is required';
  if (!location.trim()) errors.location = 'Location is required';
  return errors;
};

export default function DealerRegisterPage() {
  useSEO({ title: 'Become a Dealer' });
  const { user, setAuth } = useAuthStore();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: user?.name || '', email: user?.email || '', password: '', phone: user?.phone || '',
    businessName: '', location: '', kraPin: '', description: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const nextStep = () => {
  const stepErrors = {};
  if (step === 1) {
    if (!form.name) stepErrors.name = 'Required';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) stepErrors.email = 'Valid email required';
    if (!form.password || form.password.length < 8) stepErrors.password = 'Min 8 characters';
    if (!form.phone) stepErrors.phone = 'Required';
    if (!agreed) { setServerError('You must agree to the Terms of Service and Privacy Policy.'); return; }
  }
  if (Object.keys(stepErrors).length) { setErrors(stepErrors); return; }
  setStep(2);
  };

  const submit = async () => {
  // if logged in, skip the full validate() since password/name aren't needed
  const errs = user
    ? (!form.businessName.trim() ? { businessName: 'Required' } : !form.location.trim() ? { location: 'Required' } : {})
    : validate(form);

  if (Object.keys(errs).length) { setErrors(errs); return; }
  setServerError(''); setLoading(true);
  try {
    const res = user
      ? await api.post('/dealers/upgrade', { businessName: form.businessName, location: form.location, kraPin: form.kraPin, description: form.description })
      : await api.post('/dealers/register', form);
    setAuth(res.user, res.token);
    navigate('/dealer/onboarding');
  } catch (err) {
    setServerError(err.response?.data?.message || 'Registration failed');
  } finally { setLoading(false); }
};

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <Car size={18} className="text-white" />
          </div>
          <span className="font-display text-xl tracking-wider">AUTONEXUS</span>
        </div>

        <h1 className="font-display text-4xl tracking-wider mb-1">BECOME A DEALER</h1>
        <p className="text-white/40 text-sm mb-2">Join East Africa's digital Showroom</p>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-brand-500 text-white' : 'bg-dark-700 text-white/30'}`}>
                {step > s ? <Check size={13} /> : s}
              </div>
              <span className={`text-xs ${step >= s ? 'text-white/60' : 'text-white/20'}`}>
                {s === 1 ? 'Account' : 'Business'}
              </span>
              {s < 2 && <div className={`w-8 h-px ${step > s ? 'bg-brand-500' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="card p-7 space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={15} /> {serverError}
            </div>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Full Name</label>
                <input value={form.name} onChange={set('name')} placeholder="Brian Mwangi"
                  className={`input w-full ${errors.name ? '!border-red-500/50' : ''}`} />
                <FieldError msg={errors.name} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@business.com"
                  className={`input w-full ${errors.email ? '!border-red-500/50' : ''}`} />
                <FieldError msg={errors.email} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="0712 345 678"
                  className={`input w-full ${errors.phone ? '!border-red-500/50' : ''}`} />
                <FieldError msg={errors.phone} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Password</label>
                {/* Agreement */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setAgreed(v => !v)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors
                      ${agreed ? 'bg-brand-500 border-brand-500' : 'border-white/20 bg-transparent'}`}
                  >
                    {agreed && <Check size={12} className="text-white" />}
                  </button>
                  <p className="text-xs text-white/40 leading-relaxed">
                    I agree to AutoNexus's{' '}
                    <Link to="/terms-of-service" className="text-brand-400 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy-policy" className="text-brand-400 hover:underline">Privacy Policy</Link>
                  </p>
                </div>

                <div className="relative flex items-center gap-3 !my-2">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-white/20 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <div className="w-full [&>div]:!w-full">
                  <GoogleLogin
                    onSuccess={async (res) => {
                      if (!agreed) {
                        setServerError('You must agree to the Terms of Service and Privacy Policy.');
                        return;
                      }
                      try {
                        const data = await authApi.googleAuth(res.credential);
                        setAuth(data.user, data.token);
                        navigate('/dealer/onboarding');
                      } catch (err) {
                        setServerError(err.message || 'Google sign-in failed');
                      }
                    }}
                    onError={() => setServerError('Google sign-in failed')}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    width="100%"
                  />
                </div>

                <button onClick={nextStep} className="btn-primary w-full !py-3.5">Continue →</button>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    placeholder="Min 8 characters" className={`input w-full !pr-10 ${errors.password ? '!border-red-500/50' : ''}`} />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError msg={errors.password} />
              </div>
              <button onClick={nextStep} className="btn-primary w-full !py-3.5">Continue →</button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Business Name <span className="text-brand-400">*</span></label>
                <div className="relative">
                  <Building size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={form.businessName} onChange={set('businessName')} placeholder="e.g. Prestige Motors Ltd"
                    className={`input w-full !pl-9 ${errors.businessName ? '!border-red-500/50' : ''}`} />
                </div>
                <FieldError msg={errors.businessName} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Location <span className="text-brand-400">*</span></label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input value={form.location} onChange={set('location')} placeholder="e.g. Westlands, Nairobi"
                    className={`input w-full !pl-9 ${errors.location ? '!border-red-500/50' : ''}`} />
                </div>
                <FieldError msg={errors.location} />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">KRA PIN <span className="text-white/20">(optional)</span></label>
                <input value={form.kraPin} onChange={set('kraPin')} placeholder="A000000000Z"
                  className="input w-full" />
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1.5 block">Business Description <span className="text-white/20">(optional)</span></label>
                <textarea value={form.description} onChange={set('description')} rows={2}
                  placeholder="Tell buyers about your dealership..."
                  className="input w-full !py-3 resize-none text-sm" />
              </div>

              {/* Trial info */}
              {import.meta.env.VITE_SUBSCRIPTIONS_ENABLED === 'true' && (
                <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
                  <p className="text-sm text-brand-400 font-medium mb-1">🎉 30-Day Free Trial</p>
                  <p className="text-xs text-white/40">List unlimited cars, get AI-powered listings, receive inquiries. After trial: KES 5,000/month.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">← Back</button>
                <button onClick={submit} disabled={loading} className="btn-primary flex-1 !py-3.5">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : 'Create Account'}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-xs text-white/30">
            Already a dealer? <Link to="/login" className="text-brand-400 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}