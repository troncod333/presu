import React from 'react';
import { MaterialItem, Supplier, QualityTier } from '../types';
import { QUALITY_MULTIPLIERS } from '../data/chileData';
import { Store, TrendingDown, Phone, MapPin, CheckCircle, ExternalLink } from 'lucide-react';

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
  const multiplier = QUALITY_MULTIPLIERS[quality];

  // Helper to calculate Haversine distance in km
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const defaultLat = -33.4845;
  const defaultLng = -70.7156;

  const currentLat = projectLocation ? projectLocation.lat : defaultLat;
  const currentLng = projectLocation ? projectLocation.lng : defaultLng;

  // Rank suppliers by distance
  const suppliersWithDist = suppliers.map(s => ({
    ...s,
    distanceKm: calculateDistance(currentLat, currentLng, s.lat, s.lng)
  })).sort((a, b) => a.distanceKm - b.distanceKm);

  if (selectedMaterials.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm text-center">
        <Store className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Comparador de Precios</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Selecciona materiales arriba para ver la comparativa en ferreterías cercanas.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            💰 Comparativa Inteligente de Precios
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Comparativa estimada por ítem en las 3 ferreterías más cercanas
          </p>
        </div>
      </div>

      {/* Item Comparisons */}
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {selectedMaterials.slice(0, 6).map((mat, idx) => {
          const basePrice = Math.round(mat.basePrice * multiplier);

          // Generate 3 price variations across top 3 closest suppliers
          const storeVariations = suppliersWithDist.slice(0, 3).map((supplier, sIdx) => {
            // Price variance factor (-12% to +10%)
            const priceFactors = [0.92, 1.00, 1.06];
            const unitPrice = Math.round(basePrice * priceFactors[sIdx % priceFactors.length]);
            const totalPrice = Math.round(unitPrice * mat.quantity);

            return {
              supplier,
              unitPrice,
              totalPrice,
              isBest: sIdx === 0
            };
          }).sort((a, b) => a.totalPrice - b.totalPrice);

          return (
            <div key={mat.id} className="bg-gray-50 dark:bg-gray-700/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2">
              
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 dark:text-white">
                  {mat.name} ({mat.quantity} {mat.unit})
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  Base Est.: ${basePrice.toLocaleString('es-CL')}/{mat.unit}
                </span>
              </div>

              {/* Stores Breakdown */}
              <div className="space-y-1.5">
                {storeVariations.map((item, sIdx) => (
                  <div
                    key={item.supplier.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                      sIdx === 0
                        ? 'bg-emerald-100/70 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {sIdx === 0 && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      <div>
                        <div className="font-bold text-[11px] flex items-center gap-1">
                          <span>{item.supplier.name}</span>
                          {sIdx === 0 && (
                            <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                              Mejor Opción
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>a {item.supplier.distanceKm.toFixed(1)} km</span>
                          <span>• 📞 {item.supplier.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-xs">
                        ${item.totalPrice.toLocaleString('es-CL')}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">
                        ${item.unitPrice.toLocaleString('es-CL')} / {mat.unit}
                      </div>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
