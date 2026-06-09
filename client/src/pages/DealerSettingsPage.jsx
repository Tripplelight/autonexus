// src/pages/DealerSettingsPage.jsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, FileText, CreditCard, MessageCircle, ArrowLeft, Save, Check } from 'lucide-react';
import { dealerApi } from '../services/api';

const Field = ({ label, icon, error, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs text-white/40 uppercase tracking-wider flex items-center gap-1.5">
      {icon} {label}
    </label>
    <input
      className={`input w-full ${error ? 'border-red-500/50' : ''}`}
      {...props}
    />
    {error && <p className="text-xs text-red-400">{error}</p>}
  </div>
);

const Section = ({ title, icon, children }) => (
  <div className="card p-5 sm:p-6 space-y-4">
    <h2 className="font-semibold flex items-center gap-2 text-white/80">
      <span className="text-brand-400">{icon}</span> {title}
    </h2>
    {children}
  </div>
);

export default function DealerSettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    businessName: '',
    phone: '',
    location: '',
    kraPin: '',
    description: '',
    whatsapp: '',
    bankName: '',
    bankAccountName: '',
    bankAccountNumber: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['dealer-profile'],
    queryFn: dealerApi.getProfile,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        businessName: profile.businessName || '',
        phone: profile.phone || '',
        location: profile.location || '',
        kraPin: profile.kraPin || '',
        description: profile.description || '',
        whatsapp: profile.whatsapp || '',
        bankName: profile.bankName || '',
        bankAccountName: profile.bankAccountName || '',
        bankAccountNumber: profile.bankAccountNumber || '',
      });
    }
  }, [profile]);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== undefined) formData.append(k, v); });
      return dealerApi.updateProfile(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealer-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      setErrors({ submit: err.message || 'Failed to save. Try again.' });
    }
  });

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.businessName.trim()) errs.businessName = 'Required';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (!form.location.trim()) errs.location = 'Required';
    if (form.whatsapp && !/^\+?\d{9,15}$/.test(form.whatsapp.replace(/\s/g, '')))
      errs.whatsapp = 'Invalid number (e.g. +254712345678)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (validate()) save();
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-900 pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => navigate('/dealer/dashboard')}
            className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Settings</h1>
            <p className="text-xs text-white/30">Manage your profile and business details</p>
          </div>
        </div>

        {/* Business Profile */}
        <Section title="Business Profile" icon={<User size={15} />}>
          <Field
            label="Business Name" icon={<User size={11} />}
            value={form.businessName} onChange={set('businessName')}
            placeholder="Demo Motors Nairobi" error={errors.businessName}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Phone" icon={<Phone size={11} />}
              value={form.phone} onChange={set('phone')}
              placeholder="0712345678" error={errors.phone}
            />
            <Field
              label="Location" icon={<MapPin size={11} />}
              value={form.location} onChange={set('location')}
              placeholder="Westlands, Nairobi" error={errors.location}
            />
          </div>
          <Field
            label="KRA PIN" icon={<FileText size={11} />}
            value={form.kraPin} onChange={set('kraPin')}
            placeholder="A012345678Z"
          />
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider">Business Description</label>
            <textarea
              value={form.description} onChange={set('description')}
              placeholder="Tell buyers about your dealership..."
              rows={3}
              className="input w-full resize-none"
            />
          </div>
        </Section>

        {/* WhatsApp */}
        <Section title="WhatsApp Contact" icon={<MessageCircle size={15} />}>
          <p className="text-xs text-white/30 -mt-1">
            This number appears on every car listing as the WhatsApp chat button.
          </p>
          <Field
            label="WhatsApp Number" icon={<Phone size={11} />}
            value={form.whatsapp} onChange={set('whatsapp')}
            placeholder="+254712345678" error={errors.whatsapp}
          />
        </Section>

        {/* Bank Details */}
        <Section title="Bank Details" icon={<CreditCard size={15} />}>
          <p className="text-xs text-white/30 -mt-1">
            Shown to buyers when they pay a deposit for your vehicles.
          </p>
          <Field
            label="Bank Name"
            value={form.bankName} onChange={set('bankName')}
            placeholder="Equity Bank Kenya"
          />
          <Field
            label="Account Name"
            value={form.bankAccountName} onChange={set('bankAccountName')}
            placeholder="Demo Motors Limited"
          />
          <Field
            label="Account Number"
            value={form.bankAccountNumber} onChange={set('bankAccountNumber')}
            placeholder="0123456789"
          />
        </Section>

        {/* Error */}
        {errors.submit && (
          <p className="text-sm text-red-400 text-center">{errors.submit}</p>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isPending}
          className={`btn-primary w-full !py-3.5 flex items-center justify-center gap-2 transition-all ${saved ? '!bg-green-500' : ''}`}
        >
          {saved ? <><Check size={16} /> Saved!</> : isPending ? 'Saving...' : <><Save size={16} /> Save Changes</>}
        </button>

      </div>
    </div>
  );
}