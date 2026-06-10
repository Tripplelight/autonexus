// src/pages/ContactPage.jsx
import { useState } from 'react';
import { useSEO } from '../hooks/useSEO';
import { Mail, MessageSquare, Send } from 'lucide-react';
import api from '../services/api';

const SUBJECTS = ['General Inquiry', 'Dealer Support', 'Buyer Support', 'Report a Listing', 'Partnership', 'Other'];

export default function ContactPage() {
  useSEO({ title: 'Contact Us', description: 'Get in touch with the AutoNexus team.' });

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message) return;
    setStatus('loading');
    try {
      await api.post('/contact', form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MessageSquare size={22} className="text-brand-400" />
        </div>
        <h1 className="font-display text-4xl tracking-wider mb-3">GET IN TOUCH</h1>
        <p className="text-white/40 text-sm">We usually respond within 24 hours.</p>
      </div>

      {status === 'success' ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="font-semibold text-lg mb-2">Message sent!</h2>
          <p className="text-white/40 text-sm">We'll get back to you within 24 hours.</p>
          <button onClick={() => setStatus(null)} className="btn-outline !px-6 !py-2 !text-sm mt-6">Send Another</button>
        </div>
      ) : (
        <div className="card p-8 space-y-5">
          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-white/40 mb-2 block">Full Name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="John Doe" className="input w-full" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-2 block">Email</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                placeholder="john@email.com" className="input w-full" />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs text-white/40 mb-2 block">Subject</label>
            <select value={form.subject} onChange={e => set('subject', e.target.value)} className="input w-full">
              <option value="">Select a subject...</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="text-xs text-white/40 mb-2 block">Message</label>
            <textarea value={form.message} onChange={e => set('message', e.target.value)}
              placeholder="Tell us how we can help..." rows={5}
              className="input w-full resize-none" />
          </div>

          {status === 'error' && (
            <p className="text-red-400 text-xs">Something went wrong. Please try again.</p>
          )}

          <button onClick={handleSubmit} disabled={status === 'loading'}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {status === 'loading' ? 'Sending...' : <><Send size={14} /> Send Message</>}
          </button>

          {/* Alternative contact */}
          <div className="border-t border-white/5 pt-5 flex items-center gap-3 text-sm text-white/30">
            <Mail size={14} />
            <span>Or email us directly: <a href="mailto:admin@autonexus.com" className="text-brand-400 hover:underline">admin@autonexus.com</a></span>
          </div>
        </div>
      )}
    </div>
  );
}