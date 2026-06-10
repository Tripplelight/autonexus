// src/pages/CarsPage.jsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, X, Search, ChevronDown } from 'lucide-react';
import { useSEO } from "../hooks/useSEO";
import { carsApi } from '../services/api';
import CarCard from '../components/cars/CarCard';

const BODY_TYPES = ['SUV', 'SEDAN', 'TRUCK', 'COUPE', 'HATCHBACK', 'CONVERTIBLE', 'VAN', 'WAGON'];
const FUELS = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'];
const TRANSMISSIONS = ['AUTOMATIC', 'MANUAL'];
const CONDITIONS = ['NEW', 'USED', 'CERTIFIED'];
const SORTS = [
  { value: 'createdAt', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'year', label: 'Year: Newest' }
];

const EMPTY_FILTERS = {
  make: '', bodyType: '', fuel: '', transmission: '',
  condition: '', minPrice: '', maxPrice: '',
  sort: 'createdAt', search: '', page: 1
};

// ── Filter content (shared between drawer and sidebar) ────────────────────────
const FilterContent = ({ filters, setFilter, clearFilters }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="font-semibold text-sm">Filters</h3>
      <button onClick={clearFilters} className="text-xs text-brand-400 hover:underline">Clear all</button>
    </div>

    {/* Search */}
    <div>
      <label className="text-xs text-white/40 mb-2 block">Keyword</label>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input value={filters.search} onChange={e => setFilter('search', e.target.value)}
          placeholder="Make, model..." className="input !py-2 !text-xs !pl-8 w-full" />
      </div>
    </div>

    {/* Body Type */}
    <div>
      <label className="text-xs text-white/40 mb-2 block">Body Type</label>
      <div className="grid grid-cols-2 gap-1.5">
        {BODY_TYPES.map(t => (
          <button key={t} onClick={() => setFilter('bodyType', filters.bodyType === t ? '' : t)}
            className={`text-xs py-2 rounded-lg border transition-colors ${filters.bodyType === t ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
            {t}
          </button>
        ))}
      </div>
    </div>

    {/* Fuel */}
    <div>
      <label className="text-xs text-white/40 mb-2 block">Fuel Type</label>
      <div className="grid grid-cols-2 gap-1.5">
        {FUELS.map(f => (
          <button key={f} onClick={() => setFilter('fuel', filters.fuel === f ? '' : f)}
            className={`text-xs py-2 rounded-lg border transition-colors ${filters.fuel === f ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
            {f}
          </button>
        ))}
      </div>
    </div>

    {/* Transmission */}
    <div>
      <label className="text-xs text-white/40 mb-2 block">Transmission</label>
      <div className="grid grid-cols-2 gap-1.5">
        {TRANSMISSIONS.map(t => (
          <button key={t} onClick={() => setFilter('transmission', filters.transmission === t ? '' : t)}
            className={`text-xs py-2 rounded-lg border transition-colors ${filters.transmission === t ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
            {t}
          </button>
        ))}
      </div>
    </div>

    {/* Condition */}
    <div>
      <label className="text-xs text-white/40 mb-2 block">Condition</label>
      <div className="grid grid-cols-3 gap-1.5">
        {CONDITIONS.map(c => (
          <button key={c} onClick={() => setFilter('condition', filters.condition === c ? '' : c)}
            className={`text-xs py-2 rounded-lg border transition-colors ${filters.condition === c ? 'bg-brand-500/20 border-brand-500 text-brand-400' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
            {c}
          </button>
        ))}
      </div>
    </div>

    {/* Price */}
    <div>
      <label className="text-xs text-white/40 mb-2 block">Price Range (KES)</label>
      <div className="flex gap-2">
        <input type="number" placeholder="Min" value={filters.minPrice}
          onChange={e => setFilter('minPrice', e.target.value)}
          className="input !py-2 !text-xs w-full" />
        <input type="number" placeholder="Max" value={filters.maxPrice}
          onChange={e => setFilter('maxPrice', e.target.value)}
          className="input !py-2 !text-xs w-full" />
      </div>
    </div>
  </div>
);

// ── Active chips ──────────────────────────────────────────────────────────────
const Chip = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
    {label}
    <button onClick={onRemove} className="ml-0.5 hover:text-white"><X size={10} /></button>
  </span>
);

// ── Skeleton card ─────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-dark-700" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-dark-700 rounded w-1/3" />
      <div className="h-4 bg-dark-700 rounded w-2/3" />
      <div className="h-3 bg-dark-700 rounded w-full mt-3" />
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CarsPage() {
  const [searchParams] = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    make: searchParams.get('make') || '',
    bodyType: searchParams.get('bodyType') || '',
    fuel: searchParams.get('fuel') || '',
    transmission: searchParams.get('transmission') || '',
    condition: searchParams.get('condition') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: 'createdAt',
    search: searchParams.get('search') || '',
    page: 1
  });
 
  useEffect(() => {
  const search = searchParams.get('search') || '';
  setFilters(prev => ({ ...prev, search, page: 1 }));
}, [searchParams]);

  useSEO({ title: "Browse Cars", description: "Browse hundreds of verified cars in Nairobi. Filter by make, body type, fuel, price and more." });

  const { data, isLoading } = useQuery({
    queryKey: ['cars', filters],
    queryFn: () => carsApi.getAll({ ...filters })
  });

  const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  const clearFilters = () => setFilters({ ...EMPTY_FILTERS });

  const activeCount = [filters.bodyType, filters.fuel, filters.transmission, filters.condition, filters.minPrice, filters.maxPrice, filters.search].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Mobile Filter Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          {/* Drawer */}
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-dark-800 border-l border-white/10 overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold">Filter Cars</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2 hover:bg-white/5 rounded-lg">
                <X size={18} className="text-white/40" />
              </button>
            </div>
            <FilterContent filters={filters} setFilter={setFilter} clearFilters={clearFilters} />
            <button onClick={() => setDrawerOpen(false)} className="btn-primary w-full mt-6">
              Show {data?.total || 0} Results
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="min-w-0 overflow-hidden">
          <h1 className="font-display text-2xl sm:text-4xl tracking-wide truncate">ALL VEHICLES</h1>
          <p className="text-white/40 text-sm mt-1">{data?.total || 0} cars available</p>
        </div>
        <button onClick={() => setDrawerOpen(true)}
          className="lg:hidden btn-outline !px-4 !py-2 !text-sm flex items-center gap-2">
          <SlidersHorizontal size={14} />
          Filters
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {filters.bodyType && <Chip label={filters.bodyType} onRemove={() => setFilter('bodyType', '')} />}
          {filters.fuel && <Chip label={filters.fuel} onRemove={() => setFilter('fuel', '')} />}
          {filters.transmission && <Chip label={filters.transmission} onRemove={() => setFilter('transmission', '')} />}
          {filters.condition && <Chip label={filters.condition} onRemove={() => setFilter('condition', '')} />}
          {filters.search && <Chip label={`"${filters.search}"`} onRemove={() => setFilter('search', '')} />}
          {(filters.minPrice || filters.maxPrice) && (
            <Chip label={`KES ${filters.minPrice || '0'} – ${filters.maxPrice || '∞'}`}
              onRemove={() => { setFilter('minPrice', ''); setFilter('maxPrice', ''); }} />
          )}
        </div>
      )}

      <div className="flex gap-7">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="card p-5 sticky top-24">
            <FilterContent filters={filters} setFilter={setFilter} clearFilters={clearFilters} />
          </div>
        </aside>

        {/* ── Cars Grid ── */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-white/30 text-sm hidden sm:block">
              {isLoading ? 'Loading...' : `${data?.cars?.length || 0} of ${data?.total || 0} cars`}
            </p>
            <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)}
              className="input !py-2 !text-sm ml-auto" style={{ width: 'auto' }}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array(6).fill(0).map((_, i) => <Skeleton key={i} />)}
            </div>
          ) : !data?.cars?.length ? (
            <div className="text-center py-20 card">
              <SlidersHorizontal size={36} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/40 text-sm">No cars match your filters</p>
              <button onClick={clearFilters} className="btn-outline !px-5 !py-2 !text-sm mt-4">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {data.cars.map(car => <CarCard key={car.id} car={car} />)}
            </div>
          )}

          {/* Pagination */}
          {data?.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10 flex-wrap">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${filters.page === p ? 'bg-brand-500 text-white' : 'bg-dark-700 text-white/40 hover:text-white'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
