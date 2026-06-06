// src/components/dealer/DealerCarTable.jsx
import { useState } from 'react';
import { Edit2, Trash2, Eye, Car, AlertTriangle, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { carsApi } from '../../services/api';

// ── Delete Confirmation Modal ─────────────────────────────────
function DeleteModal({ car, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <button onClick={onCancel} className="text-white/30 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <h3 className="font-semibold text-base mb-1">Delete listing?</h3>
        <p className="text-white/40 text-sm mb-6">
          <span className="text-white">{car.year} {car.make} {car.model}</span> will be permanently removed from your inventory.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/30 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function DealerCarTable({ cars, onEdit, isLoading, canEdit = true }) {
  const [carToDelete, setCarToDelete] = useState(null);
  const qc = useQueryClient();

  const { mutate: deleteCar, isPending: isDeleting } = useMutation({
    mutationFn: (id) => carsApi.delete(id),
    onSuccess: () => {
      setCarToDelete(null);
      qc.invalidateQueries({ queryKey: ['dealer-cars'] });
      qc.invalidateQueries({ queryKey: ['cars'] });
      qc.invalidateQueries({ queryKey: ['featured-cars'] });
    },
    onError: (err) => {
      setCarToDelete(null);
      alert(err?.message || 'Failed to delete car');
    }
  });

  const getStatusBadge = (status) => {
    const styles = {
      AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      RESERVED: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      SOLD: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    };
    return (
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${styles[status] || 'bg-white/5 text-white/50'}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return <div className="p-10 text-center text-white/40 text-sm">Loading inventory...</div>;
  }

  if (cars.length === 0) {
    return (
      <div className="p-10 sm:p-16 text-center">
        <div className="mx-auto w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
          <Car size={24} className="text-white/30" />
        </div>
        <h3 className="text-base font-medium text-white mb-1">No cars yet</h3>
        <p className="text-white/40 text-sm mb-6">Add your first vehicle to get started</p>
        <button
          onClick={() => onEdit(null)}
          disabled={!canEdit}
          className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Your First Car
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/30">
              <th className="px-5 sm:px-6 py-4 text-left">Vehicle</th>
              <th className="px-5 sm:px-6 py-4 text-left">Price</th>
              <th className="px-5 sm:px-6 py-4 text-left hidden sm:table-cell">Mileage</th>
              <th className="px-5 sm:px-6 py-4 text-left">Status</th>
              <th className="px-5 sm:px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-white/[0.02] transition-colors">
                {/* Vehicle */}
                <td className="px-5 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-10 rounded-lg overflow-hidden border border-white/5 bg-dark-950 shrink-0">
                      {car.images?.[0] ? (
                        <img
                          src={car.images[0]}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => e.target.src = 'https://via.placeholder.com/300x200/1a1a1a/555?text=No+Image'}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Car size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white leading-tight">
                        {car.make} {car.model}
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">{car.year} • {car.bodyType}</p>
                    </div>
                  </div>
                </td>

                {/* Price */}
                <td className="px-5 sm:px-6 py-4">
                  <p className="text-sm font-semibold text-brand-400">
                    KES {car.price?.toLocaleString()}
                  </p>
                </td>

                {/* Mileage — hidden on mobile */}
                <td className="px-5 sm:px-6 py-4 text-sm text-white/50 hidden sm:table-cell">
                  {car.mileage?.toLocaleString() || 0} km
                </td>

                {/* Status */}
                <td className="px-5 sm:px-6 py-4">
                  {getStatusBadge(car.status)}
                </td>

                {/* Actions */}
                <td className="px-5 sm:px-6 py-4">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => canEdit && onEdit(car)}
                      disabled={!canEdit}
                      title="Edit"
                      className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => canEdit && !isDeleting && setCarToDelete(car)}
                      disabled={!canEdit || isDeleting}
                      title="Delete"
                      className="p-2 hover:bg-red-500/10 rounded-lg text-white/50 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                    <a
                      href={`/cars/${car.id}`}
                      target="_blank"
                      title="View"
                      className="p-2 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors"
                    >
                      <Eye size={15} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      {carToDelete && (
        <DeleteModal
          car={carToDelete}
          onConfirm={() => deleteCar(carToDelete.id)}
          onCancel={() => setCarToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
}