// src/components/cars/CarCard.jsx
import { Link } from 'react-router-dom';
import { Heart, Fuel, Gauge, Calendar, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const conditionColor = { NEW: 'bg-green-500/20 text-green-400', CERTIFIED: 'bg-blue-500/20 text-blue-400', USED: 'bg-white/10 text-white/50' };
const fuelIcon = { ELECTRIC: '⚡', HYBRID: '🔋', DIESEL: '⛽', PETROL: '⛽' };

export default function CarCard({ car, isFavorited = false }) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const image = car.images?.[0] || '/placeholder-car.jpg';

  const { mutate: toggleFav } = useMutation({
    mutationFn: () => carsApi.toggleFavorite(car.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] })
  });

  return (
    <div className="card group">
      <div className="relative overflow-hidden aspect-[16/10]">
        <img src={image} alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = 'https://via.placeholder.com/400x250/1a1a1a/444?text=No+Image'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
        {car.featured && <span className="absolute top-3 left-3 badge bg-brand-500/20 text-brand-400">⭐ Featured</span>}
        <span className={`absolute top-3 right-3 badge ${conditionColor[car.condition]}`}>{car.condition}</span>
        {token && (
          <button onClick={(e) => { e.preventDefault(); toggleFav(); }}
            className={`absolute bottom-3 right-3 p-2 rounded-full bg-dark-800/80 backdrop-blur-sm border border-white/10 transition-colors hover:border-brand-500 ${isFavorited ? 'text-brand-500' : 'text-white/40'}`}>
            <Heart size={15} fill={isFavorited ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <Link to={`/cars/${car.id}`} className="block p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider">{car.make}</p>
            <h3 className="font-semibold text-white">{car.model} <span className="text-white/30 font-normal">{car.year}</span></h3>
          </div>
          <p className="text-brand-400 font-semibold text-sm">KES {car.price?.toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/40 mt-3 pt-3 border-t border-white/5">
          <span className="flex items-center gap-1"><Calendar size={11} />{car.year}</span>
          <span className="flex items-center gap-1"><Gauge size={11} />{car.mileage?.toLocaleString()}km</span>
          <span className="flex items-center gap-1">{fuelIcon[car.fuel]}{car.fuel}</span>
          <span className="ml-auto text-white/20">{car.transmission}</span>
        </div>
      </Link>
    </div>
  );
}
