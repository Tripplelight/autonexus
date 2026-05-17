// src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Car, Check } from 'lucide-react';
import { useSEO } from "../hooks/useSEO";
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

const validate = ({ name, email, password, phone }) => {
  const errors = {};
  if (!name.trim()) errors.name = 'Full name is required';
  else if (name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address';

  if (!password) errors.password = 'Password is required';
  else if (password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (!/[A-Z]/.test(password)) errors.password = 'Include at least one uppercase letter';
  else if (!/[0-9]/.test(password)) errors.password = 'Include at least one number';

  if (phone && !/^(\+?254|0)[17]\d{8}$/.test(phone.replace(/\s/g, '')))
    errors.phone = 'Enter a valid Kenyan number e.g. 0712345678';

  return errors;
};

const FieldError = ({ msg }) => msg
  ? <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{msg}</p>
  : null;

const PasswordStrength = ({ password }) => {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
  ];
  if (!password) return null;
  return (
    <div className="flex gap-3 mt-2">
      {checks.map((c, i) => (
        <span key={i} className={`flex items-center gap-1 text-xs ${c.pass ? 'text-green-400' : 'text-white/20'}`}>
          <Check size={10} /> {c.label}
        </span>
      ))}
    </div>
  );
};

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  useSEO({ title: "Create Account" });
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setServerError(''); setLoading(true);
    try {
      const res = await authApi.register(form);
      setAuth(res.user, res.token);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <Car size={18} className="text-white" />
          </div>
          <span className="font-display text-xl tracking-wider">AUTONEXUS</span>
        </div>

        <h1 className="font-display text-4xl tracking-wider mb-1">CREATE ACCOUNT</h1>
        <p className="text-white/40 text-sm mb-8">Join thousands of smart car buyers</p>

        <div className="card p-7 space-y-5">
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={15} className="shrink-0" /> {serverError}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={set('name')}
              className={`input w-full ${errors.name ? '!border-red-500/50' : ''}`}
              autoComplete="name"
            />
            <FieldError msg={errors.name} />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              className={`input w-full ${errors.email ? '!border-red-500/50' : ''}`}
              autoComplete="email"
            />
            <FieldError msg={errors.email} />
          </div>

          {/* Phone */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Phone <span className="text-white/20">(optional)</span></label>
            <input
              type="tel"
              placeholder="0712 345 678"
              value={form.phone}
              onChange={set('phone')}
              className={`input w-full ${errors.phone ? '!border-red-500/50' : ''}`}
              autoComplete="tel"
            />
            <FieldError msg={errors.phone} />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={set('password')}
                className={`input w-full !pr-10 ${errors.password ? '!border-red-500/50' : ''}`}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
            <FieldError msg={errors.password} />
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
              : 'Create Account'
            }
          </button>

          <p className="text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
