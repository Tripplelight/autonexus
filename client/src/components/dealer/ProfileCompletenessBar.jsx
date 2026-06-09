// src/components/dealer/ProfileCompletenessBar.jsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const getCompleteness = (profile) => {
  if (!profile) return { score: 0, missing: [] };
  const checks = [
    { key: 'businessName', label: 'Business name', done: !!profile.businessName },
    { key: 'phone', label: 'Phone number', done: !!profile.phone },
    { key: 'location', label: 'Location', done: !!profile.location },
    { key: 'logo', label: 'Logo', done: !!profile.logo },
    { key: 'description', label: 'Business description', done: !!profile.description },
    { key: 'kraPin', label: 'KRA PIN', done: !!profile.kraPin },
  ];
  const done = checks.filter(c => c.done).length;
  const missing = checks.filter(c => !c.done).map(c => c.label);
  return { score: Math.round((done / checks.length) * 100), missing };
};

export default function ProfileCompletenessBar({ profile }) {
  const { score, missing } = getCompleteness(profile);
  if (score === 100) return null;

  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-brand-500';
  const message = score >= 70
    ? 'Almost there! Complete your profile to maximize visibility'
    : 'Complete your profile — dealers with full profiles get 3x more inquiries';

  return (
    <div className="bg-dark-800 border border-white/5 rounded-2xl p-4 sm:p-5 mb-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-white/50">{message}</p>
        <span className="text-xs font-semibold text-white/70 shrink-0 ml-2">{score}%</span>
      </div>

      {/* Bar */}
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Missing items */}
      {missing.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/30">Missing:</span>
          {missing.slice(0, 3).map((item, i) => (
            <span key={i} className="text-xs bg-white/5 text-white/40 px-2 py-0.5 rounded-lg">
              {item}
            </span>
          ))}
          {missing.length > 3 && (
            <span className="text-xs text-white/30">+{missing.length - 3} more</span>
          )}
          <Link to="/dealer/settings">
            <span className="ml-auto text-xs text-brand-400 hover:text-brand-300 flex items-center gap-0.5 transition-colors">
              Complete <ChevronRight size={12} />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}