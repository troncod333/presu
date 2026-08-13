import React from 'react';
import { MaterialItem, QualityTier, ProjectType } from '../types';
import { QUALITY_MULTIPLIERS, PROJECT_CATEGORIES } from '../data/chileData';
import { Calculator, FileText, Save, Truck, Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BudgetSummaryPanelProps {
  materials: MaterialItem[];
  quality: QualityTier;
  projectType: ProjectType | null;
  projectLocation: { lat: number; lng: number } | null;
  projectAddress: string;
  onGeneratePdf: () => void;
  onSaveBudget: () => void;
}

export const BudgetSummaryPanel: React.FC<BudgetSummaryPanelProps> = ({
  materials,
  quality,
  projectType,
  projectLocation,
  projectAddress,
  onGeneratePdf,
  onSaveBudget
}) => {
  const selectedMaterials = materials.filter(m => m.selected);
  const multiplier = QUALITY_MULTIPLIERS[quality];

  // Calculate Subtotal Materials
  const subtotalMaterials = selectedMaterials.reduce((sum, item) => {
    const adjustedUnitPrice = Math.round(item.basePrice * multiplier);
    return sum + (adjustedUnitPrice * item.quantity);
  }, 0);

  // Transport Cost
  let transportCost = 0;
  if (subtotalMaterials > 0) {
    if (projectLocation) {
      transportCost = Math.min(25000, Math.max(5000, Math.round(subtotalMaterials * 0.05)));
    } else {
      transportCost = Math.min(18000, Math.max(4000, Math.round(subtotalMaterials * 0.04)));
    }
  }

  // Labor Cost %
  const categoryConfig = PROJECT_CATEGORIES.find(c => c.id === projectType);
  const laborPercent = categoryConfig ? categoryConfig.laborPercent : 0.45;
  const laborCost = Math.round(subtotalMaterials * laborPercent);

  const totalCost = subtotalMaterials + transportCost + laborCost;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            📊 Resumen del Presupuesto
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Valores finales proyectados en Pesos Chilenos (CLP)
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          Chile 2025
        </span>
      </div>

      {/* Financial Line Items */}
      <div className="space-y-3 text-xs">
        
        {/* Subtotal Materials */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60">
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span className="font-semibold">Subtotal Materiales e Insumos:</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            ${Math.round(subtotalMaterials).toLocaleString('es-CL')}
          </span>
        </div>

        {/* Transport / Freight */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60">
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
            <Truck className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold">Costo Transporte / Despacho:</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            ${Math.round(transportCost).toLocaleString('es-CL')}
          </span>
        </div>

        {/* Handyman / Labor */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60">
          <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200">
            <Wrench className="w-3.5 h-3.5 text-amber-500" />
            <div>
              <span className="font-semibold">Mano de Obra Estimada:</span>
              <span className="text-[10px] text-gray-400 block font-normal">
                ({Math.round(laborPercent * 100)}% de materiales según especialidad)
              </span>
            </div>
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">
            ${Math.round(laborCost).toLocaleString('es-CL')}
          </span>
        </div>

        <hr className="border-gray-200 dark:border-gray-700 my-2" />

        {/* Total Cost Display */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white shadow-md space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">
              Total Proyectado Obra:
            </span>
            <span className="text-xl font-extrabold tracking-tight">
              ${Math.round(totalCost).toLocaleString('es-CL')} CLP
            </span>
          </div>
          <p className="text-[10px] opacity-80 text-right">
            Incluye materiales, flete estimado y mano de obra
          </p>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={onGeneratePdf}
          disabled={selectedMaterials.length === 0}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3.5 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-xs"
        >
          <FileText className="w-4 h-4" />
          <span>📄 Generar Presupuesto PDF Imprimible</span>
        </button>

        <button
          onClick={onSaveBudget}
          disabled={selectedMaterials.length === 0}
          className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3.5 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-xs"
        >
          <Save className="w-4 h-4" />
          <span>💾 Guardar en Mis Presupuestos</span>
        </button>
      </div>

    </div>
  );
};
