// src/components/cars/RelatedCars.jsx
import { useQuery } from '@tanstack/react-query';
import { carsApi } from '../../services/api';
import CarCard from './CarCard';

export default function RelatedCars({ car }) {
  const { data } = useQuery({
    queryKey: ['related-cars', car.id],
    queryFn: () => carsApi.getAll({ bodyType: car.bodyType, limit: 4 }),
    enabled: !!car.id
  });

  const related = data?.cars?.filter(c => c.id !== car.id).slice(0, 3);
  if (!related?.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div className="mb-7">
        <p className="text-brand-400 text-xs uppercase tracking-widest font-medium mb-2">Similar Vehicles</p>
        <h3 className="font-display text-3xl tracking-wider">YOU MIGHT ALSO LIKE</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {related.map(c => <CarCard key={c.id} car={c} />)}
      </div>
    </section>
  );
}
