// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Car } from 'lucide-react';
import { useSEO } from "../hooks/useSEO";
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { GoogleLogin } from '@react-oauth/google';

const validate = ({ email, password }) => {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
  if (!password) errors.password = 'Password is required';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
};

const FieldError = ({ msg }) => msg
  ? <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertCircle size={11} />{msg}</p>
  : null;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  useSEO({ title: "Sign In" });
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
      const res = await authApi.login(form);
      setAuth(res.user, res.token);
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Invalid email or password');
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

        <h1 className="font-display text-4xl tracking-wider mb-1">SIGN IN</h1>
        <p className="text-white/40 text-sm mb-8">Welcome back — your garage awaits</p>

        <div className="card p-7 space-y-5">
          {/* Server error */}
          {serverError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={15} className="shrink-0" /> {serverError}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-xs text-white/40 mb-1.5 block">Email address</label>
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

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-white/40">Password</label>
            </div>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                className={`input w-full !pr-10 ${errors.password ? '!border-red-500/50' : ''}`}
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError msg={errors.password} />
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              : 'Sign In'
            }
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/20 text-xs">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (res) => {
                if (!agreed) {
                  setServerError('You must agree to the Terms of Service and Privacy Policy.');
                  return;
                }
                try {
                  const data = await authApi.googleAuth(res.credential);
                  setAuth(data.user, data.token);
                  navigate('/');
                } catch (err) {
                  setServerError(err.message || 'Google sign-in failed');
                }
              }}
              onError={() => setServerError('Google sign-in failed')}
              theme="filled_black"
              shape="rectangular"
              width="400"
            />
          </div>

          <p className="text-center text-sm text-white/40">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:underline font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
