// src/pages/DealerPublicPage.jsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, Car, MessageCircle } from 'lucide-react';
import { carsApi } from '../services/api';
import api from '../services/api';
import CarCard from '../components/cars/CarCard';
import { useSEO } from '../hooks/useSEO';

export default function DealerPublicPage() {
  const { id } = useParams();

  const { data: dealer, isLoading } = useQuery({
    queryKey: ['dealer-public', id],
    queryFn: () => api.get(`/dealers/${id}/public`),
  });

  const { data: carsData } = useQuery({
    queryKey: ['dealer-public-cars', id],
    queryFn: () => carsApi.getAll({ dealerId: id, limit: 12 }),
    enabled: !!id,
  });

  useSEO({
    title: dealer?.businessName ? `${dealer.businessName} — AutoNexus` : 'Dealer',
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-white/40 text-sm">
        Loading dealer profile...
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-white/40 text-sm">Dealer not found</p>
        <Link to="/cars" className="text-brand-400 text-sm mt-2 inline-block hover:underline">
          Browse all cars
        </Link>
      </div>
    );
  }

  const cars = carsData?.cars || carsData || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Dealer Header ── */}
      <div className="bg-dark-800 border border-white/5 rounded-2xl p-5 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row gap-5 items-start">

          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-dark-700 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
            {dealer.logo
              ? <img src={dealer.logo} alt={dealer.businessName} className="w-full h-full object-cover" />
              : <Car size={24} className="text-white/20" />
            }
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-display text-xl sm:text-2xl tracking-wider mb-2">
              {dealer.businessName?.toUpperCase()}
            </h1>
            <div className="flex flex-wrap gap-3 text-xs text-white/40">
              {dealer.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {dealer.location}
                </span>
              )}
              {dealer.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {dealer.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Car size={12} /> {cars.length} vehicles
              </span>
            </div>
            {dealer.description && (
              <p className="text-sm text-white/50 mt-3 leading-relaxed">{dealer.description}</p>
            )}
          </div>

          {/* WhatsApp CTA */}
          {dealer.phone && (
            <a
              href={`https://wa.me/${dealer.phone.replace(/^0/, '254').replace(/\s/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-2.5 rounded-xl transition-colors shrink-0"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* ── Dealer Listings ── */}
      <div>
        <h2 className="font-semibold text-sm text-white/60 mb-4">
          {cars.length} vehicle{cars.length !== 1 ? 's' : ''} available
        </h2>

        {cars.length === 0 ? (
          <div className="text-center py-16 text-white/30 text-sm">
            No listings available at the moment
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cars.map(car => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}