// src/pages/AboutPage.jsx
import { useSEO } from '../hooks/useSEO';
import { Car, Zap, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATS = [
  { label: 'Cars Listed', value: '500+' },
  { label: 'Verified Dealers', value: '20+' },
  { label: 'Cities Covered', value: '3' },
  { label: 'Happy Buyers', value: '1,000+' },
];

const VALUES = [
  { icon: Zap, title: 'AI-Powered', desc: 'Smart search, price prediction, and virtual test drives — technology working for you.' },
  { icon: Shield, title: 'Verified Dealers', desc: 'Every dealer on AutoNexus is vetted. No scams, no ghost listings.' },
  { icon: Globe, title: 'Built for East Africa', desc: 'Designed around the Kenyan market — M-Pesa payments, local pricing, and real inventory.' },
];

export default function AboutPage() {
  useSEO({ title: 'About Us', description: 'AutoNexus is an AI-powered car marketplace built for East Africa.' });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
            <Car size={16} className="text-white" />
          </div>
          <span className="font-display text-xl tracking-wider">AUTONEXUS</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl tracking-wider mb-5">
          THE SMARTER WAY<br />TO BUY A CAR
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
          We're building East Africa's most trusted car marketplace — where AI meets local market knowledge to help buyers find the right car at the right price.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
        {STATS.map(s => (
          <div key={s.label} className="card p-6 text-center">
            <div className="font-display text-3xl text-brand-400 mb-1">{s.value}</div>
            <div className="text-xs text-white/40">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Story */}
      <div className="card p-8 mb-8">
        <h2 className="font-display text-2xl tracking-wider mb-4">OUR STORY</h2>
        <div className="space-y-4 text-white/60 leading-relaxed">
          <p>
            AutoNexus was born from a simple frustration — buying a car in Kenya was unnecessarily hard. Listings were scattered, prices were opaque, and it was nearly impossible to know if you were getting a fair deal.
          </p>
          <p>
            We built AutoNexus to fix that. A single platform where verified dealers list their inventory, buyers get AI-powered price analysis, and every transaction is transparent from inquiry to handover.
          </p>
          <p>
            We're starting in Nairobi and expanding across East Africa — Kenya, Uganda, Tanzania, and beyond. The mission is simple: make buying a car as easy as it should be.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {VALUES.map(v => (
          <div key={v.title} className="card p-6">
            <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center mb-4">
              <v.icon size={18} className="text-brand-400" />
            </div>
            <h3 className="font-semibold mb-2">{v.title}</h3>
            <p className="text-sm text-white/40 leading-relaxed">{v.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link to="/cars" className="btn-primary mr-3">Browse Cars</Link>
        <Link to="/contact" className="btn-outline">Get in Touch</Link>
      </div>
    </div>
  );
}