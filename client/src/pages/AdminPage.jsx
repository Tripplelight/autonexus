// src/pages/AdminPage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, carsApi } from '../services/api';
import {
  Car, Package, BarChart3, Plus, Trash2, Pencil,
  CheckCircle, XCircle, X, Upload, Star, StarOff,
  ChevronLeft, AlertCircle, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'cars', label: 'Cars', icon: Car },
  { id: 'orders', label: 'Orders', icon: Package },
];

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

const statusColor = {
  PENDING: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  CONFIRMED: 'text-green-400 bg-green-500/10 border-green-500/20',
  CANCELLED: 'text-red-400 bg-red-500/10 border-red-500/20',
  COMPLETED: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
};

const conditionColor = {
  NEW: 'text-green-400 bg-green-500/10',
  CERTIFIED: 'text-blue-400 bg-blue-500/10',
  USED: 'text-white/40 bg-white/5'
};

// ── Sub-components ────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color = 'brand' }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
      color === 'green' ? 'bg-green-500/10 text-green-400' :
      color === 'blue' ? 'bg-blue-500/10 text-blue-400' :
      color === 'yellow' ? 'bg-yellow-500/10 text-yellow-400' :
      'bg-brand-500/10 text-brand-400'
    }`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-white/40">{label}</p>
      {sub && <p className="text-xs text-white/20 mt-0.5">{sub}</p>}
    </div>
  </div>
);

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

// ── Car Form Modal ────────────────────────────────────────────────────────────
const CarFormModal = ({ car, onClose, onSuccess }) => {
  const [form, setForm] = useState(car ? {
    make: car.make, model: car.model, year: car.year, price: car.price,
    mileage: car.mileage, condition: car.condition, bodyType: car.bodyType,
    fuel: car.fuel, transmission: car.transmission, color: car.color,
    engine: car.engine, horsepower: car.horsepower || '', description: car.description,
    featured: car.featured
  } : { ...EMPTY_FORM });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(car?.images || []);
  const [error, setError] = useState('');
  const isEdit = !!car;

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setCheck = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.checked }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
  };

  const removePreview = (i) => {
    const isExisting = previews[i]?.startsWith('http');
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
    if (!isExisting) {
      // Only remove from new images array if it's a new upload
      const newImgIndex = previews.slice(0, i).filter(p => !p.startsWith('http')).length;
      setImages(prev => prev.filter((_, idx) => idx !== newImgIndex));
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'featured') fd.append(k, v === true || v === 'true' ? 'true' : 'false');
        else fd.append(k, v);
      });
      // New images to upload
      images.forEach(f => fd.append('images', f));
      // Existing images to keep (pass as JSON string)
      const existingImages = previews.filter(p => p.startsWith('http'));
      fd.append('existingImages', JSON.stringify(existingImages));
      return isEdit ? carsApi.update(car.id, fd) : carsApi.create(fd);
    },
    onSuccess: () => { onSuccess(); onClose(); },
    onError: (err) => setError(err.message || 'Something went wrong')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.make || !form.model || !form.year || !form.price) {
      setError('Make, model, year and price are required'); return;
    }
    setError('');
    mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="w-full max-w-2xl bg-dark-800 border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Car size={18} className="text-brand-400" />
            {isEdit ? `Edit — ${car.make} ${car.model}` : 'Add New Car'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X size={18} className="text-white/40" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
              <AlertCircle size={15} /> {error}
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
              <Input value={form.year} onChange={set('year')} placeholder="e.g. 2022" type="number" required />
            </FormField>
            <FormField label="Price (KES)" required>
              <Input value={form.price} onChange={set('price')} placeholder="e.g. 4500000" type="number" required />
            </FormField>
            <FormField label="Mileage (km)">
              <Input value={form.mileage} onChange={set('mileage')} placeholder="e.g. 35000" type="number" />
            </FormField>
            <FormField label="Color">
              <Input value={form.color} onChange={set('color')} placeholder="e.g. Pearl White" />
            </FormField>
            <FormField label="Engine">
              <Input value={form.engine} onChange={set('engine')} placeholder="e.g. 3.0L V6 Turbo" />
            </FormField>
            <FormField label="Horsepower">
              <Input value={form.horsepower} onChange={set('horsepower')} placeholder="e.g. 272" type="number" />
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

          {/* Image Upload — works for both Add and Edit */}
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
                    {/* Badge for existing vs new */}
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

          {/* Featured toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
              className={`w-10 h-6 rounded-full transition-colors relative ${form.featured ? 'bg-brand-500' : 'bg-white/10'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-white/60">Mark as Featured</span>
            <Star size={14} className={form.featured ? 'text-brand-400' : 'text-white/20'} />
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? (isEdit ? 'Saving...' : 'Adding car...') : (isEdit ? 'Save Changes' : 'Add Car')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ car, onClose, onConfirm, isPending }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
    <div className="w-full max-w-sm bg-dark-800 border border-white/10 rounded-2xl p-6 text-center">
      <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 size={24} className="text-red-400" />
      </div>
      <h3 className="font-semibold text-lg mb-2">Delete this car?</h3>
      <p className="text-white/40 text-sm mb-6">
        <span className="text-white">{car.year} {car.make} {car.model}</span> will be permanently removed from the inventory.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
        <button onClick={onConfirm} disabled={isPending}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-3 rounded-lg transition-colors">
          {isPending ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── Main Admin Page ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const [showCarForm, setShowCarForm] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [deletingCar, setDeletingCar] = useState(null);
  const qc = useQueryClient();

  const { data: carsData } = useQuery({
    queryKey: ['admin-cars'],
    queryFn: () => carsApi.getAll({ limit: 100 })
  });

  const { data: orders } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: ordersApi.getAll
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-orders'] })
  });

  const { mutate: deleteCar, isPending: isDeleting } = useMutation({
    mutationFn: (id) => carsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-cars'] });
      qc.invalidateQueries({ queryKey: ['cars'] });
      setDeletingCar(null);
    }
  });

  const { mutate: toggleFeatured } = useMutation({
    mutationFn: ({ id, featured }) => carsApi.update(id, { featured: !featured }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-cars'] })
  });

  const onFormSuccess = () => {
    qc.invalidateQueries({ queryKey: ['admin-cars'] });
    qc.invalidateQueries({ queryKey: ['cars'] });
  };

  const cars = carsData?.cars || [];
  const totalValue = cars.reduce((sum, c) => sum + (c.price || 0), 0);
  const pendingOrders = orders?.filter(o => o.status === 'PENDING').length || 0;
  const availableCars = cars.filter(c => c.status === 'AVAILABLE').length;

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Modals */}
      {(showCarForm || editingCar) && (
        <CarFormModal
          car={editingCar}
          onClose={() => { setShowCarForm(false); setEditingCar(null); }}
          onSuccess={onFormSuccess}
        />
      )}
      {deletingCar && (
        <DeleteModal
          car={deletingCar}
          onClose={() => setDeletingCar(null)}
          onConfirm={() => deleteCar(deletingCar.id)}
          isPending={isDeleting}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-white/30 text-sm mb-1">Welcome back 👋</p>
            <h1 className="font-display text-4xl tracking-wider">DEALER DASHBOARD</h1>
          </div>
          <button onClick={() => setShowCarForm(true)}
            className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Car
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-800 border border-white/5 rounded-xl p-1 w-fit mb-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === id ? 'bg-brand-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
              }`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Car} label="Total Inventory" value={cars.length} sub={`${availableCars} available`} color="brand" />
              <StatCard icon={Package} label="Pending Orders" value={pendingOrders} sub="Needs attention" color="yellow" />
              <StatCard icon={BarChart3} label="Total Orders" value={orders?.length || 0} sub="All time" color="blue" />
              <StatCard icon={Car} label="Inventory Value" value={`KES ${(totalValue / 1000000).toFixed(1)}M`} sub="Combined listing price" color="green" />
            </div>

            {/* Recent Orders */}
            <div className="card">
              <div className="p-5 border-b border-white/5">
                <h3 className="font-semibold flex items-center gap-2"><Package size={16} className="text-brand-400" /> Recent Orders</h3>
              </div>
              <div className="divide-y divide-white/5">
                {!orders?.length ? (
                  <p className="p-6 text-white/30 text-sm text-center">No orders yet</p>
                ) : orders.slice(0, 5).map(o => (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{o.car?.year} {o.car?.make} {o.car?.model}</p>
                      <p className="text-xs text-white/30">{o.user?.name} · {o.type}</p>
                    </div>
                    <p className="text-sm text-brand-400 font-medium shrink-0">KES {o.amount?.toLocaleString()}</p>
                    <span className={`badge border text-xs shrink-0 ${statusColor[o.status]}`}>{o.status}</span>
                  </div>
                ))}
              </div>
              {orders?.length > 5 && (
                <div className="p-4 text-center">
                  <button onClick={() => setTab('orders')} className="text-sm text-brand-400 hover:underline">
                    View all {orders.length} orders →
                  </button>
                </div>
              )}
            </div>

            {/* Featured Cars Quick View */}
            <div className="card">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2"><Star size={16} className="text-brand-400" /> Featured Cars</h3>
                <button onClick={() => setTab('cars')} className="text-xs text-white/30 hover:text-white">Manage →</button>
              </div>
              <div className="divide-y divide-white/5">
                {cars.filter(c => c.featured).length === 0 ? (
                  <p className="p-6 text-white/30 text-sm text-center">No featured cars — mark some from the Cars tab</p>
                ) : cars.filter(c => c.featured).map(car => (
                  <div key={car.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-12 h-9 bg-dark-700 rounded-lg overflow-hidden shrink-0">
                      {car.images?.[0] && <img src={car.images[0]} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{car.year} {car.make} {car.model}</p>
                      <p className="text-xs text-white/30">KES {car.price?.toLocaleString()}</p>
                    </div>
                    <span className={`badge text-xs ${conditionColor[car.condition]}`}>{car.condition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Cars Tab ── */}
        {tab === 'cars' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white/40 text-sm">{cars.length} vehicles in inventory</p>
              <button onClick={() => setShowCarForm(true)} className="btn-primary !px-4 !py-2 !text-sm flex items-center gap-2">
                <Plus size={14} /> Add Car
              </button>
            </div>

            <div className="card divide-y divide-white/5">
              {!cars.length ? (
                <div className="p-12 text-center">
                  <Car size={40} className="text-white/10 mx-auto mb-3" />
                  <p className="text-white/30 text-sm">No cars yet — add your first listing</p>
                  <button onClick={() => setShowCarForm(true)} className="btn-primary !px-4 !py-2 !text-sm mt-4">Add Car</button>
                </div>
              ) : cars.map(car => (
                <div key={car.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
                  {/* Image */}
                  <div className="w-20 h-14 bg-dark-700 rounded-xl overflow-hidden shrink-0 border border-white/5">
                    {car.images?.[0]
                      ? <img src={car.images[0]} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Car size={18} className="text-white/10" /></div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{car.year} {car.make} {car.model}</p>
                      {car.featured && <span className="badge bg-brand-500/10 text-brand-400 text-xs">⭐ Featured</span>}
                      <span className={`badge text-xs ${conditionColor[car.condition]}`}>{car.condition}</span>
                    </div>
                    <p className="text-xs text-white/30 mt-0.5">
                      {car.bodyType} · {car.fuel} · {car.transmission} · {car.mileage?.toLocaleString()} km
                    </p>
                  </div>

                  {/* Price */}
                  <p className="text-brand-400 font-semibold text-sm shrink-0 hidden sm:block">
                    KES {car.price?.toLocaleString()}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Link to={`/cars/${car.id}`} target="_blank"
                      className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="View listing">
                      <Eye size={15} />
                    </Link>
                    <button onClick={() => toggleFeatured({ id: car.id, featured: car.featured })}
                      className={`p-2 rounded-lg transition-colors ${car.featured ? 'text-brand-400 hover:bg-brand-500/10' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                      title={car.featured ? 'Unfeature' : 'Feature'}>
                      {car.featured ? <Star size={15} /> : <StarOff size={15} />}
                    </button>
                    <button onClick={() => setEditingCar(car)}
                      className="p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Edit">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => setDeletingCar(car)}
                      className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Orders Tab ── */}
        {tab === 'orders' && (
          <div className="card divide-y divide-white/5">
            {!orders?.length ? (
              <p className="p-12 text-white/30 text-sm text-center">No orders yet</p>
            ) : orders.map(o => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{o.car?.year} {o.car?.make} {o.car?.model}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {o.user?.name} · {o.user?.email} · {o.type}
                  </p>
                  <p className="text-xs text-white/20 mt-0.5">
                    {new Date(o.createdAt).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <p className="text-sm text-brand-400 font-semibold shrink-0 hidden sm:block">
                  KES {o.amount?.toLocaleString()}
                </p>
                <span className={`badge border text-xs shrink-0 ${statusColor[o.status]}`}>{o.status}</span>
                {o.status === 'PENDING' && (
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => updateStatus({ id: o.id, status: 'CONFIRMED' })}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors" title="Confirm">
                      <CheckCircle size={16} />
                    </button>
                    <button onClick={() => updateStatus({ id: o.id, status: 'CANCELLED' })}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Cancel">
                      <XCircle size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}