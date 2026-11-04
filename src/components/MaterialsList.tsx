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

  const isIntegerUnit = (unit?: string, category?: string) => {
    return ['un', 'pza', 'placa', 'rollo', 'tira', 'saco', 'foco', 'enchufe', 'puerta', 'recinto', 'caja', 'modulo', 'disyuntor', 'puntos'].includes(unit?.toLowerCase().trim() || '') ||
      category?.toLowerCase().includes('artefacto') ||
      category?.toLowerCase().includes('iluminac') ||
      category?.toLowerCase().includes('proteccion');
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-3.5 sm:p-5 border border-slate-800 shadow-sm space-y-3.5">
      
      {/* Header and Quality Tier Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5">
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Lista de Insumos ({materials.filter(m => m.selected).length}/{materials.length})</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Ajusta cantidades, marcas y calidad de terminación
          </p>
        </div>

        {/* Quality Tiers - Full width on mobile, compact on desktop */}
        <div className="grid grid-cols-3 md:flex items-center space-x-0 md:space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800 w-full md:w-auto">
          {(['economico', 'medio', 'premium'] as QualityTier[]).map((tier) => {
            const isSelected = quality === tier;
            return (
              <button
                key={tier}
                onClick={() => onQualityChange(tier)}
                className={`py-1.5 px-2 sm:px-3 rounded-md text-[11px] sm:text-xs font-bold capitalize transition-all cursor-pointer text-center whitespace-nowrap ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tier === 'economico' ? 'Económico' : tier === 'medio' ? 'Estándar' : 'Premium'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Add Material Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar insumo o partida..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-slate-100 placeholder-slate-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          {onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
              <span>Inicio</span>
            </button>
          )}

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm shadow-blue-950"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ Insumo</span>
          </button>
        </div>
      </div>

      {/* Add Custom Material Inline Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-3 bg-slate-950 rounded-lg border border-slate-700 space-y-3 text-xs animate-in fade-in duration-150">
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
                placeholder="un, m, saco..."
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Precio ($ CLP):</label>
              <input
                type="number"
                required
                placeholder="5000"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-700 bg-slate-900 text-white text-xs outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
            >
              Guardar Insumo
            </button>
          </div>
        </form>
      )}

      {/* MOBILE VIEW (md:hidden): Touch-Friendly Item Cards (Eliminates table cramping & overflow) */}
      <div className="md:hidden space-y-2">
        {filteredMaterials.map((mat) => {
          const adjustedPrice = Math.round(mat.basePrice * multiplier);
          const rowTotal = Math.round(adjustedPrice * mat.quantity);
          const isHighImpactCost = totalMaterialsCost > 0 && (rowTotal / totalMaterialsCost) >= 0.25;
          const isSafetyCritical = mat.reasoning?.toLowerCase().includes('sec') || 
                                   mat.reasoning?.toLowerCase().includes('seguridad') ||
                                   mat.category.toLowerCase().includes('proteccion');
          const isInt = isIntegerUnit(mat.unit, mat.category);

          return (
            <div
              key={mat.id}
              className={`p-3 rounded-xl border transition-all ${
                !mat.selected
                  ? 'bg-slate-950/40 border-slate-900 opacity-40 line-through'
                  : isHighImpactCost
                  ? 'bg-slate-950 border-orange-500/40 shadow-xs'
                  : 'bg-slate-950/90 border-slate-800'
              }`}
            >
              {/* Top Row: Checkbox + Name + Badges + Delete */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1">
                  <button
                    onClick={() => onToggleMaterial(mat.id)}
                    className="min-h-[40px] min-w-[40px] flex items-center justify-center -ml-1 text-blue-400 active:scale-95 cursor-pointer"
                    title={mat.selected ? "Desactivar" : "Activar"}
                  >
                    {mat.selected ? (
                      <CheckSquare className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-600" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-white leading-tight">
                        {mat.name}
                      </span>
                      {mat.aiCalculated && (
                        <span className="text-[9px] bg-slate-800 text-orange-400 font-mono font-bold px-1 rounded border border-orange-500/30">
                          IA
                        </span>
                      )}
                    </div>

                    {isHighImpactCost && (
                      <span className="badge-reflective text-[8px] px-1 py-0.2 rounded-xs inline-flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-2.5 h-2.5 stroke-[3]" />
                        <span>ALTO COSTO ({Math.round((rowTotal / totalMaterialsCost) * 100)}%)</span>
                      </span>
                    )}

                    {isSafetyCritical && (
                      <span className="badge-reflective-amber text-[8px] px-1 py-0.2 rounded-xs inline-flex items-center gap-1 mt-1">
                        <ShieldAlert className="w-2.5 h-2.5 stroke-[3]" />
                        <span>NORMA SEC</span>
                      </span>
                    )}

                    {mat.reasoning && (
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
                        {mat.reasoning}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveMaterial(mat.id)}
                  className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-500 active:text-red-400 cursor-pointer -mr-1"
                  title="Eliminar insumo"
                  aria-label="Eliminar insumo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Row: Unit Price + Stepper + Line Total */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-900/80 mt-2">
                <div className="text-[11px] font-mono text-slate-400">
                  <span className="text-slate-300 font-semibold">${adjustedPrice.toLocaleString('es-CL')}</span>
                  <span className="text-[10px] text-slate-500">/{mat.unit}</span>
                </div>

                {/* Touch Stepper (40px touch hitboxes) */}
                <div className="flex items-center space-x-1 bg-slate-900 px-1 py-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => onUpdateQuantity(mat.id, isInt ? Math.max(1, Math.round(mat.quantity) - 1) : Math.max(0.1, Math.round((mat.quantity - 0.5) * 10) / 10))}
                    className="w-8 h-8 rounded bg-slate-800 text-white flex items-center justify-center font-bold active:bg-slate-700 cursor-pointer text-sm"
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>

                  <input
                    type="number"
                    step={isInt ? "1" : "0.1"}
                    min={isInt ? "1" : "0.1"}
                    value={mat.quantity}
                    onChange={(e) => {
                      if (isInt) {
                        const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                        onUpdateQuantity(mat.id, digitsOnly === '' ? 1 : Math.max(1, parseInt(digitsOnly, 10)));
                      } else {
                        onUpdateQuantity(mat.id, parseFloat(e.target.value) || 0.1);
                      }
                    }}
                    className="w-12 text-center text-xs font-mono font-bold bg-transparent text-white outline-none"
                  />

                  <button
                    onClick={() => onUpdateQuantity(mat.id, isInt ? Math.round(mat.quantity) + 1 : Math.round((mat.quantity + 0.5) * 10) / 10)}
                    className="w-8 h-8 rounded bg-slate-800 text-white flex items-center justify-center font-bold active:bg-slate-700 cursor-pointer text-sm"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono tabular-nums font-bold text-white block">
                    ${rowTotal.toLocaleString('es-CL')}
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">CLP</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW (hidden md:block): 6-Column Data Table */}
      <div className="hidden md:block overflow-x-auto border border-slate-800/90 rounded-lg">
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
              const isHighImpactCost = totalMaterialsCost > 0 && (rowTotal / totalMaterialsCost) >= 0.25;
              const isSafetyCritical = mat.reasoning?.toLowerCase().includes('sec') || 
                                       mat.reasoning?.toLowerCase().includes('seguridad') ||
                                       mat.category.toLowerCase().includes('proteccion');
              const isInt = isIntegerUnit(mat.unit, mat.category);

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
                      title={mat.selected ? "Desactivar" : "Activar"}
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
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        onClick={() => onUpdateQuantity(mat.id, isInt ? Math.max(1, Math.round(mat.quantity) - 1) : Math.max(0.1, Math.round((mat.quantity - 0.5) * 10) / 10))}
                        className="w-5 h-5 rounded bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold hover:bg-slate-700 hover:text-white cursor-pointer"
                        title={isInt ? "Restar 1 unidad" : "Restar 0.5"}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        step={isInt ? "1" : "0.1"}
                        min={isInt ? "1" : "0.1"}
                        value={mat.quantity}
                        onChange={(e) => {
                          if (isInt) {
                            const digitsOnly = e.target.value.replace(/[^0-9]/g, '');
                            onUpdateQuantity(mat.id, digitsOnly === '' ? 1 : Math.max(1, parseInt(digitsOnly, 10)));
                          } else {
                            onUpdateQuantity(mat.id, parseFloat(e.target.value) || 0.1);
                          }
                        }}
                        className="w-14 text-center py-0.5 text-xs font-mono tabular-nums font-bold border border-slate-700 rounded bg-slate-950 text-white outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => onUpdateQuantity(mat.id, isInt ? Math.round(mat.quantity) + 1 : Math.round((mat.quantity + 0.5) * 10) / 10)}
                        className="w-5 h-5 rounded bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold hover:bg-slate-700 hover:text-white cursor-pointer"
                        title={isInt ? "Sumar 1 unidad" : "Sumar 0.5"}
                      >
                        +
                      </button>
                    </div>
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
