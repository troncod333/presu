import React, { useState } from 'react';
import { MaterialItem, QualityTier } from '../types';
import { QUALITY_MULTIPLIERS } from '../data/chileData';
import { 
  Package, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckSquare, 
  Square,
  DollarSign,
  Tag,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface MaterialsListProps {
  materials: MaterialItem[];
  quality: QualityTier;
  onQualityChange: (quality: QualityTier) => void;
  onToggleMaterial: (id: string) => void;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveMaterial: (id: string) => void;
  onAddCustomMaterial: (item: Omit<MaterialItem, 'id' | 'selected'>) => void;
}

export const MaterialsList: React.FC<MaterialsListProps> = ({
  materials,
  quality,
  onQualityChange,
  onToggleMaterial,
  onUpdateQuantity,
  onRemoveMaterial,
  onAddCustomMaterial
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('unidad');
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [customQty, setCustomQty] = useState<number | ''>(1);

  const multiplier = QUALITY_MULTIPLIERS[quality];

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPrice || Number(customPrice) <= 0) {
      alert('Ingresa el nombre y un precio válido para el material.');
      return;
    }

    onAddCustomMaterial({
      name: customName.trim(),
      unit: customUnit || 'unidad',
      basePrice: Number(customPrice),
      quantity: Number(customQty) || 1,
      custom: true
    });

    setCustomName('');
    setCustomPrice('');
    setCustomQty(1);
    setShowAddModal(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
      
      {/* Quality Tier Selection Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Materiales e Insumos del Proyecto
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ajusta la calidad de insumos y modifica cantidades según necesidades
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
            {materials.filter(m => m.selected).length} seleccionados
          </span>
        </div>

        {/* Quality Cards Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          
          <button
            onClick={() => onQualityChange('bajo')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              quality === 'bajo'
                ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
            }`}
          >
            <div className="text-xl mb-0.5">🥉</div>
            <div className="font-bold text-xs">Económico</div>
            <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
              -30% Precio
            </span>
          </button>

          <button
            onClick={() => onQualityChange('medio')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              quality === 'medio'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-600 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
            }`}
          >
            <div className="text-xl mb-0.5">🥈</div>
            <div className="font-bold text-xs">Estándar</div>
            <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400">
              Mercado Base
            </span>
          </button>

          <button
            onClick={() => onQualityChange('premium')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              quality === 'premium'
                ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-600 text-purple-900 dark:text-purple-200 ring-2 ring-purple-600 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
            }`}
          >
            <div className="text-xl mb-0.5">🥇</div>
            <div className="font-bold text-xs">Premium</div>
            <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-400">
              +40% Alta Gama
            </span>
          </button>

        </div>
      </div>

      {/* Materials List Items */}
      {materials.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No hay materiales cargados aún. Selecciona un tipo de proyecto o usa el Asistente IA.
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {materials.map((mat) => {
            const adjustedUnitPrice = Math.round(mat.basePrice * multiplier);
            const totalLinePrice = Math.round(adjustedUnitPrice * mat.quantity);

            return (
              <div
                key={mat.id}
                className={`flex flex-wrap sm:flex-nowrap items-center justify-between p-3 rounded-xl border transition-all ${
                  mat.selected
                    ? 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 shadow-2xs'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                {/* Checkbox & Details */}
                <div className="flex items-center space-x-3 min-w-[200px] flex-1">
                  <button
                    onClick={() => onToggleMaterial(mat.id)}
                    className="text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    {mat.selected ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                      <span>{mat.name}</span>
                      {mat.aiCalculated && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                          IA
                        </span>
                      )}
                      {mat.custom && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Personalizado
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                      <span>${adjustedUnitPrice.toLocaleString('es-CL')} / {mat.unit}</span>
                      {mat.reasoning && (
                        <span className="italic text-gray-400 hidden sm:inline">• {mat.reasoning}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity Input & Price Total */}
                <div className="flex items-center space-x-3 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={mat.quantity}
                      onChange={(e) => onUpdateQuantity(mat.id, parseFloat(e.target.value) || 0)}
                      className="w-16 p-1.5 text-center text-xs font-bold border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-left font-medium">
                      {mat.unit}
                    </span>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <div className="text-xs font-extrabold text-gray-900 dark:text-white">
                      ${totalLinePrice.toLocaleString('es-CL')}
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveMaterial(mat.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                    title="Eliminar material"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Material Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 text-gray-700 dark:text-gray-300 hover:text-indigo-600 p-3 rounded-xl transition-all cursor-pointer text-xs font-bold"
      >
        <Plus className="w-4 h-4" />
        <span>➕ Agregar Material Personalizado</span>
      </button>

      {/* Modal Custom Material */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddCustom} className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700 shadow-xl space-y-4">
            
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Agregar Material Personalizado
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre del Material</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Bisagra especial o Aditivo líquido"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Unidad de Medida</label>
                  <select
                    value={customUnit}
                    onChange={(e) => setCustomUnit(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="unidad">unidad</option>
                    <option value="metro">metro</option>
                    <option value="m²">m²</option>
                    <option value="saco">saco</option>
                    <option value="galón">galón</option>
                    <option value="bolsa">bolsa</option>
                    <option value="plancha">plancha</option>
                    <option value="tira">tira</option>
                    <option value="pack">pack</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Precio Unitario CLP</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Ej: 4500"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Cantidad Inicial</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={customQty}
                  onChange={(e) => setCustomQty(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Agregar Material
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
};
