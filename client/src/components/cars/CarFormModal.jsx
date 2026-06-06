// src/components/cars/CarFormModal.jsx
import { useState, useEffect } from 'react';
import { X, Upload, Star, AlertCircle, Car, CheckCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const EMPTY_FORM = {
  make: '', model: '', year: '', price: '', mileage: '',
  condition: 'USED', bodyType: 'SUV', fuel: 'PETROL',
  transmission: 'AUTOMATIC', color: '', engine: '',
  horsepower: '', description: '', featured: false
};

const CONDITIONS = ['NEW', 'USED', 'CERTIFIED'];
const BODY_TYPES = ['SUV', 'SEDAN', 'TRUCK', 'COUPE', 'HATCHBACK', 'CONVERTIBLE', 'VAN', 'WAGON'];
const FUELS = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'];
const TRANSMISSIONS = ['AUTOMATIC', 'MANUAL'];

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-xs text-white/40 mb-1.5">
      {label}{required && <span className="text-brand-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text', required }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
    className="input !py-2.5 !text-sm w-full" />
);

const Select = ({ value, onChange, options }) => (
  <select value={value} onChange={onChange} className="input !py-2.5 !text-sm w-full">
    {options.map(o => <option key={o} value={o}>{o}</option>)}
  </select>
);

// Accepts both old pattern (no isOpen) and new pattern (isOpen prop)
// Old: <CarFormModal car={car} onClose={fn} onSuccess={fn} />
// New: <CarFormModal car={car} isOpen={bool} onClose={fn} onSuccess={fn} />
export default function CarFormModal({ car, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const isEdit = !!car;
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);
  const canFeature = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  // If isOpen is undefined (old pattern), treat as always open
  const shouldRender = isOpen === undefined ? true : isOpen;

  useEffect(() => {
    if (shouldRender) {
      if (car) {
        setForm({
          make: car.make, model: car.model, year: car.year, price: car.price,
          mileage: car.mileage, condition: car.condition, bodyType: car.bodyType,
          fuel: car.fuel, transmission: car.transmission, color: car.color,
          engine: car.engine, horsepower: car.horsepower || '',
          description: car.description, featured: car.featured
        });
        setPreviews(car.images || []);
      } else {
        setForm({ ...EMPTY_FORM });
        setPreviews([]);
      }
      setImages([]);
      setError('');
      setSuccess(false);
    }
  }, [shouldRender, car]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removePreview = (i) => {
    const isExisting = previews[i]?.startsWith('http');
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
    if (!isExisting) {
      const newImgIndex = previews.slice(0, i).filter(p => !p.startsWith('http')).length;
      setImages(prev => prev.filter((_, idx) => idx !== newImgIndex));
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'featured' && !canFeature) return;
        if (k === 'featured') fd.append(k, v === true || v === 'true' ? 'true' : 'false');
        else fd.append(k, v);
      });
      images.forEach(f => fd.append('images', f));
      const existingImages = previews.filter(p => p.startsWith('http'));
      fd.append('existingImages', JSON.stringify(existingImages));
      return isEdit ? carsApi.update(car.id, fd) : carsApi.create(fd);
    },
    onSuccess: (savedCar) => {
      setSuccess(true);
      qc.invalidateQueries({ queryKey: ['dealer-cars'] });
      qc.invalidateQueries({ queryKey: ['admin-cars'] });
      qc.invalidateQueries({ queryKey: ['cars'] });
      qc.invalidateQueries({ queryKey: ['featured-cars'] });
      if (savedCar?.id) qc.invalidateQueries({ queryKey: ['car', savedCar.id] });
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 1200);
    },
    onError: (err) => setError(err.message || 'Something went wrong')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.make || !form.model || !form.year || !form.price) {
      setError('Make, model, year and price are required');
      return;
    }
    setError('');
    mutate();
  };

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-dark-800 border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Car size={18} className="text-brand-400" />
            {isEdit ? `Edit — ${car.make} ${car.model}` : 'Add New Car'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X size={18} className="text-white/40" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-xl">
              <CheckCircle size={15} /> {isEdit ? 'Car updated successfully!' : 'Car added successfully!'}
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Make" required>
              <Input value={form.make} onChange={set('make')} placeholder="e.g. Toyota" required />
            </FormField>
            <FormField label="Model" required>
              <Input value={form.model} onChange={set('model')} placeholder="e.g. Land Cruiser" required />
            </FormField>
            <FormField label="Year" required>
              <Input value={form.year} onChange={set('year')} placeholder="2022" type="number" required />
            </FormField>
            <FormField label="Price (KES)" required>
              <Input value={form.price} onChange={set('price')} placeholder="4500000" type="number" required />
            </FormField>
            <FormField label="Mileage (km)">
              <Input value={form.mileage} onChange={set('mileage')} placeholder="35000" type="number" />
            </FormField>
            <FormField label="Color">
              <Input value={form.color} onChange={set('color')} placeholder="e.g. Pearl White" />
            </FormField>
            <FormField label="Engine">
              <Input value={form.engine} onChange={set('engine')} placeholder="e.g. 3.0L V6 Turbo" />
            </FormField>
            <FormField label="Horsepower">
              <Input value={form.horsepower} onChange={set('horsepower')} placeholder="272" type="number" />
            </FormField>
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Condition">
              <Select value={form.condition} onChange={set('condition')} options={CONDITIONS} />
            </FormField>
            <FormField label="Body Type">
              <Select value={form.bodyType} onChange={set('bodyType')} options={BODY_TYPES} />
            </FormField>
            <FormField label="Fuel Type">
              <Select value={form.fuel} onChange={set('fuel')} options={FUELS} />
            </FormField>
            <FormField label="Transmission">
              <Select value={form.transmission} onChange={set('transmission')} options={TRANSMISSIONS} />
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Description">
            <textarea value={form.description} onChange={set('description')} rows={3}
              placeholder="Describe the car's features, history, condition details..."
              className="input !py-3 resize-none w-full text-sm" />
          </FormField>

          {/* Image Upload */}
          <FormField label={isEdit ? `Photos (${previews.length} current — add more or remove)` : 'Photos (up to 10)'}>
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-brand-500/50 hover:bg-brand-500/5 transition-all">
              <Upload size={18} className="text-white/30 mb-1.5" />
              <span className="text-sm text-white/40">{isEdit ? 'Click to add more images' : 'Click to upload images'}</span>
              <span className="text-xs text-white/20 mt-0.5">JPG, PNG, WEBP up to 5MB each</span>
              <input type="file" multiple accept="image/*" onChange={handleImages} className="hidden" />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-16 rounded-lg overflow-hidden border border-white/10 group">
                    <img src={src} alt="" className="w-full h-full object-cover"
                      onError={e => { e.target.src = 'https://via.placeholder.com/80x64/1a1a1a/444?text=IMG'; }} />
                    <span className={`absolute top-1 left-1 text-[9px] px-1 rounded ${src.startsWith('http') ? 'bg-blue-500/80' : 'bg-green-500/80'} text-white`}>
                      {src.startsWith('http') ? 'saved' : 'new'}
                    </span>
                    <button type="button" onClick={() => removePreview(i)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormField>

          {canFeature && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.featured ? 'bg-brand-500' : 'bg-white/10'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-1'}`} />
              </div>
              <span className="text-sm text-white/60">Mark as Featured</span>
              <Star size={14} className={form.featured ? 'text-brand-400' : 'text-white/20'} />
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={isPending || success}
              className={`flex-1 font-medium px-6 py-3 rounded-lg transition-all duration-200 active:scale-95 ${
                success ? 'bg-green-500 text-white cursor-default' :
                isPending ? 'bg-brand-500/50 text-white cursor-not-allowed' :
                'bg-brand-500 hover:bg-brand-600 text-white'
              }`}>
              {success
                ? `✅ ${isEdit ? 'Saved!' : 'Car Added!'}`
                : isPending
                ? (isEdit ? 'Saving...' : 'Adding car...')
                : (isEdit ? 'Save Changes' : 'Add Car')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
