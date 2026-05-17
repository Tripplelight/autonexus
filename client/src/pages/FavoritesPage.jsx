// src/pages/FavoritesPage.jsx
import { useQuery } from '@tanstack/react-query';
import { carsApi } from '../services/api';
import CarCard from '../components/cars/CarCard';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { data: cars, isLoading } = useQuery({ queryKey: ['favorites'], queryFn: carsApi.getFavorites });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-4xl tracking-wider mb-2">SAVED CARS</h1>
      <p className="text-white/40 text-sm mb-8">{cars?.length || 0} saved vehicles</p>
      {isLoading ? <p className="text-white/30">Loading...</p> :
        !cars?.length ? (
          <div className="text-center py-20">
            <Heart size={40} className="text-white/10 mx-auto mb-4" />
            <p className="text-white/30">No saved cars yet. Start browsing!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cars.map(car => <CarCard key={car.id} car={car} isFavorited />)}
          </div>
        )
      }
    </div>
  );
}
