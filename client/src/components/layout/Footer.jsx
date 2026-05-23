// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';
import { Car } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
                <Car size={14} className="text-white" />
              </div>
              <span className="font-display text-lg tracking-wider">AUTONEXUS</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed">Your AI-powered gateway to the perfect car. Trusted by thousands across East Africa.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Browse</h4>
            <div className="space-y-2 text-sm text-white/40">
              <Link to="/cars" className="block hover:text-white transition-colors">All Cars</Link>
              <Link to="/cars?bodyType=SUV" className="block hover:text-white transition-colors">SUVs</Link>
              <Link to="/cars?bodyType=SEDAN" className="block hover:text-white transition-colors">Sedans</Link>
              <Link to="/cars?condition=NEW" className="block hover:text-white transition-colors">New Arrivals</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Dealers</h4>
            <div className="space-y-2 text-sm text-white/40">
              <Link to="/become-a-dealer" className="block hover:text-brand-400 transition-colors text-brand-400/70">List Your Cars →</Link>
              <Link to="/login" className="block hover:text-white transition-colors">Dealer Login</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <div className="space-y-2 text-sm text-white/40">
              <span className="block">About Us</span>
              <span className="block">Contact</span>
              <span className="block">Careers</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <div className="space-y-2 text-sm text-white/40">
              <span className="block">Privacy Policy</span>
              <span className="block">Terms of Service</span>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 mt-10 pt-8 text-center text-xs text-white/20">
          © {new Date().getFullYear()} AutoNexus. Built with ❤️ in Nairobi.
        </div>
      </div>
    </footer>
  );
}