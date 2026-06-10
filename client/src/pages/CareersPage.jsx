// src/pages/CareersPage.jsx
import { useSEO } from '../hooks/useSEO';
import { Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CareersPage() {
  useSEO({ title: 'Careers', description: 'Join the AutoNexus team.' });

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Briefcase size={22} className="text-brand-400" />
      </div>
      <h1 className="font-display text-4xl tracking-wider mb-4">CAREERS</h1>
      <p className="text-white/50 text-lg mb-8">
        We're a small team building something big for East Africa.
      </p>

      <div className="card p-10 mb-8">
        <div className="text-5xl mb-4">🚧</div>
        <h2 className="font-semibold text-lg mb-2">No open positions right now</h2>
        <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
          We're not hiring at the moment, but we're always interested in meeting talented people who care about transforming how East Africa buys cars.
        </p>
      </div>

      <p className="text-white/30 text-sm mb-4">Think you'd be a great fit for our future team?</p>
      <Link to="/contact" className="btn-outline !px-6 !py-2 !text-sm">Send Us Your CV</Link>
    </div>
  );
}