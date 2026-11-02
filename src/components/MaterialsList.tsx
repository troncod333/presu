import React, { useState } from 'react';
import { MaterialItem, QualityTier } from '../types';
import { QUALITY_MULTIPLIERS } from '../data/chileData';
import { 
  Package, 
  Plus, 
  Trash2, 
  CheckSquare, 
  Square, 
  Search, 
  AlertTriangle,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';

interface MaterialsListProps {
  materials: MaterialItem[];
  quality: QualityTier;
  onQualityChange: (quality: QualityTier) => void;
  onToggleMaterial: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveMaterial: (id: string) => void;
  onAddCustomMaterial: (item: Omit<MaterialItem, 'id' | 'selected'>) => void;
  onGoBack?: () => void;
}

export const MaterialsList: React.FC<MaterialsListProps> = ({
  materials,
  quality,
  onQualityChange,
  onToggleMaterial,
  onUpdateQuantity,
  onRemoveMaterial,
  onAddCustomMaterial,
  onGoBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('un');
  const [customPrice, setCustomPrice] = useState('');
  const [customQty, setCustomQty] = useState('1');
  const [customCategory, setCustomCategory] = useState('General');

  const multiplier = QUALITY_MULTIPLIERS[quality] || 1.0;

  // Calculate total to identify items exceeding 25% of materials budget
  const totalMaterialsCost = materials
    .filter(m => m.selected)
    .reduce((sum, m) => sum + Math.round(m.basePrice * multiplier) * m.quantity, 0);

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    onAddCustomMaterial({
      name: customName,
      unit: customUnit,
      basePrice: parseInt(customPrice) || 5000,
      quantity: parseFloat(customQty) || 1,
      category: customCategory || 'Personalizado'
    });

    setCustomName('');
    setCustomPrice('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-4">
      {/* Header and Quality Tier Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500" />
            <span>Lista de Materiales e Insumos ({materials.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ajusta cantidades, calidad de marcas y detecta ítems de alto impacto presupuestario
          </p>
        </div>

        {/* Quality Tiers - Striking Orange & Cobalt segmented controls */}
        <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start md:self-auto">
          {(['economico', 'medio', 'premium'] as QualityTier[]).map((tier) => {
            const isSelected = quality === tier;
            return (
              <button
                key={tier}
                onClick={() => onQualityChange(tier)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tier === 'economico' ? 'Económico (-18%)' : tier === 'medio' ? 'Estándar' : 'Premium (+38%)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Add Material Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar material, categoría o norma..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          {onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
              <span>Volver a Inicio</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm shadow-blue-950"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Agregar Insumo</span>
          </button>
        </div>
      </div>

      {/* Add Custom Material Inline Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-3.5 bg-slate-950 rounded-lg border border-slate-700 space-y-3 text-xs">
          <div className="font-bold text-slate-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Nuevo Insumo Personalizado</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre / Descripción:</label>
              <input
                type="text"
                required
                placeholder="Ej. Cinta Aisladora 3M Temflex"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Unidad:</label>
              <input
                type="text"
                placeholder="un, m, saco, rollo..."
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Precio Unitario ($ CLP):</label>
              <input
                type="number"
                required
                placeholder="5000"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
            >
              Guardar en Presupuesto
            </button>
          </div>
        </form>
      )}

      {/* Materials Table / List with Reflective Safety Markers */}
      <div className="overflow-x-auto border border-slate-800/90 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
              <th className="py-2.5 px-3">Estado</th>
              <th className="py-2.5 px-3">Descripción Técnica</th>
              <th className="py-2.5 px-2 text-right">Unitario ($)</th>
              <th className="py-2.5 px-3 text-center">Cantidad</th>
              <th className="py-2.5 px-3 text-right">Total ($)</th>
              <th className="py-2.5 px-2 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 bg-slate-900">
            {filteredMaterials.map((mat) => {
              const adjustedPrice = Math.round(mat.basePrice * multiplier);
              const rowTotal = Math.round(adjustedPrice * mat.quantity);
              
              // High attention threshold: > 25% of total materials cost
              const isHighImpactCost = totalMaterialsCost > 0 && (rowTotal / totalMaterialsCost) >= 0.25;
              const isSafetyCritical = mat.reasoning?.toLowerCase().includes('sec') || 
                                       mat.reasoning?.toLowerCase().includes('seguridad') ||
                                       mat.category.toLowerCase().includes('proteccion');

              return (
                <tr
                  key={mat.id}
                  className={`transition-colors ${
                    !mat.selected 
                      ? 'opacity-35 line-through bg-slate-950/40' 
                      : isHighImpactCost
                        ? 'bg-slate-800/50 hover:bg-slate-800'
                        : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <button
                      onClick={() => onToggleMaterial(mat.id)}
                      className="cursor-pointer text-blue-400 hover:text-blue-300 transition-colors"
                      title={mat.selected ? "Desactivar de presupuesto" : "Activar en presupuesto"}
                    >
                      {mat.selected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                      <span>{mat.name}</span>
                      
                      {/* High Attention Reflective Fluor Badges */}
                      {isHighImpactCost && (
                        <span 
                          className="badge-reflective text-[9px] px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1"
                          title="Este ítem representa más del 25% del costo total de insumos"
                        >
                          <AlertTriangle className="w-2.5 h-2.5 stroke-[3]" />
                          ALTO COSTO ({Math.round((rowTotal / totalMaterialsCost) * 100)}%)
                        </span>
                      )}

                      {isSafetyCritical && (
                        <span 
                          className="badge-reflective-amber text-[9px] px-1.5 py-0.5 rounded-sm inline-flex items-center gap-1"
                          title="Elemento de seguridad o certificación normativa SEC"
                        >
                          <ShieldAlert className="w-2.5 h-2.5 stroke-[3]" />
                          NORMA SEC
                        </span>
                      )}

                      {mat.aiCalculated && (
                        <span className="text-[9px] bg-slate-800 text-orange-400 font-mono font-bold px-1.5 py-0.2 rounded border border-orange-500/30">
                          IA
                        </span>
                      )}
                    </div>
                    {mat.reasoning && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {mat.reasoning}
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-300">
                    ${adjustedPrice.toLocaleString('es-CL')} <span className="text-[10px] text-slate-500">/{mat.unit}</span>
                  </td>

                  <td className="py-2.5 px-3">
                    {(() => {
                      const isIntegerUnit = ['un', 'pza', 'placa', 'rollo', 'tira', 'saco', 'foco', 'enchufe', 'puerta', 'recinto', 'caja', 'modulo', 'disyuntor', 'puntos'].includes(mat.unit?.toLowerCase().trim()) ||
                        mat.category?.toLowerCase().includes('artefacto') ||
                        mat.category?.toLowerCase().includes('iluminac') ||
                        mat.category?.toLowerCase().includes('proteccion');

                      return (
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onUpdateQuantity(mat.id, isIntegerUnit ? Math.max(1, Math.round(mat.quantity) - 1) : Math.max(0.1, Math.round((mat.quantity - 0.5) * 10) / 10))}
                            className="w-5 h-5 rounded bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold hover:bg-slate-700 hover:text-white cursor-pointer"
                            title={isIntegerUnit ? "Restar 1 unidad entera" : "Restar 0.5"}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step={isIntegerUnit ? "1" : "0.1"}
                            min={isIntegerUnit ? "1" : "0.1"}
                            value={mat.quantity}
                            onKeyDown={(e) => {
                              if (isIntegerUnit && (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E')) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              if (isIntegerUnit) {
                                const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                                onUpdateQuantity(mat.id, digitsOnly === '' ? 1 : Math.max(1, parseInt(digitsOnly, 10)));
                              } else {
                                onUpdateQuantity(mat.id, parseFloat(e.target.value) || 0.1);
                              }
                            }}
                            className="w-14 text-center py-0.5 text-xs font-mono tabular-nums font-bold border border-slate-700 rounded bg-slate-950 text-white outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => onUpdateQuantity(mat.id, isIntegerUnit ? Math.round(mat.quantity) + 1 : Math.round((mat.quantity + 0.5) * 10) / 10)}
                            className="w-5 h-5 rounded bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold hover:bg-slate-700 hover:text-white cursor-pointer"
                            title={isIntegerUnit ? "Sumar 1 unidad entera" : "Sumar 0.5"}
                          >
                            +
                          </button>
                        </div>
                      );
                    })()}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-100">
                    ${rowTotal.toLocaleString('es-CL')}
                  </td>

                  <td className="py-2.5 px-2 text-center">
                    <button
                      onClick={() => onRemoveMaterial(mat.id)}
                      className="p-1 text-slate-500 hover:text-red-400 transition cursor-pointer"
                      title="Eliminar insumo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
