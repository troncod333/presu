import React from 'react';
import { MaterialItem, Supplier, QualityTier } from '../types';
import { QUALITY_MULTIPLIERS } from '../data/chileData';
import { TrendingDown, Award, Store, Truck, MapPin } from 'lucide-react';

interface PriceComparisonMatrixProps {
  materials: MaterialItem[];
  suppliers: Supplier[];
  projectLocation: { lat: number; lng: number } | null;
  quality: QualityTier;
}

export const PriceComparisonMatrix: React.FC<PriceComparisonMatrixProps> = ({
  materials,
  suppliers,
  projectLocation,
  quality
}) => {
  const selectedMaterials = materials.filter(m => m.selected);
  const mult = QUALITY_MULTIPLIERS[quality] || 1.0;

  const baseSubtotal = selectedMaterials.reduce((sum, m) => sum + (m.basePrice * mult * m.quantity), 0);

  // Compute total for each supplier considering distance and discounts
  const comparisons = suppliers.map((sup) => {
    const discount = sup.discountPercent || 0;
    const discountedMaterials = Math.round(baseSubtotal * (1 - discount / 100));
    const transport = Math.min(25000, Math.max(4990, Math.round(sup.distanceKm * 2800)));
    const total = discountedMaterials + transport;

    return {
      supplier: sup,
      discountedMaterials,
      transport,
      total,
      savings: baseSubtotal - discountedMaterials
    };
  }).sort((a, b) => a.total - b.total);

  if (selectedMaterials.length === 0 || comparisons.length === 0) {
    return null;
  }

  const bestOption = comparisons[0];
  const worstOption = comparisons[comparisons.length - 1];
  const maxSavings = Math.max(0, worstOption.total - bestOption.total);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              Comparador de Precios y Flete por Cadena
            </h3>
            <p className="text-[11px] text-slate-400">
              Evaluación combinada de insumos, stock y logística en terreno chileno
            </p>
          </div>
        </div>

        {maxSavings > 0 && (
          <span className="text-[11px] font-mono font-bold text-orange-400 bg-slate-950 px-2 py-0.5 rounded border border-orange-500/30">
            Ahorro máx: ${maxSavings.toLocaleString('es-CL')}
          </span>
        )}
      </div>

      {/* Comparison Cards / List */}
      <div className="space-y-2">
        {comparisons.map((item, idx) => {
          const isBest = idx === 0;

          return (
            <div
              key={item.supplier.id}
              className={`p-3 rounded-lg border text-xs transition-all relative ${
                isBest
                  ? 'bg-slate-950 border-orange-500/80 ring-1 ring-orange-500/20 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100">
                      {item.supplier.name}
                    </span>
                    {isBest && (
                      <span className="badge-reflective text-[9px] px-1.5 py-0.5 rounded-xs inline-flex items-center gap-1">
                        <Award className="w-2.5 h-2.5 stroke-[3]" />
                        <span>MÁS CONVENIENTE</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {item.supplier.distanceKm} km
                    </span>
                    <span>·</span>
                    <span className="text-amber-400 font-bold">★ {item.supplier.rating}</span>
                    {item.supplier.discountPercent && (
                      <span className="text-blue-400 font-bold">
                        (-{item.supplier.discountPercent}% descuento)
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono tabular-nums font-bold text-white block">
                    ${item.total.toLocaleString('es-CL')}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono tabular-nums">
                    Insumos: ${item.discountedMaterials.toLocaleString('es-CL')} · Flete: ${item.transport.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
