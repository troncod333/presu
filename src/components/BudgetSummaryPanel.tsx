import React, { useState } from 'react';
import { MaterialItem, QualityTier, ProjectType } from '../types';
import { QUALITY_MULTIPLIERS, PROJECT_CATEGORIES } from '../data/chileData';
import { Calculator, FileText, Save, Truck, Wrench, ShieldCheck, Crown, Lock, AlertTriangle, ArrowLeft, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TOKEN_COSTS } from '../types/auth';
import { ShareBudgetModal } from './ShareBudgetModal';

interface BudgetSummaryPanelProps {
  materials: MaterialItem[];
  quality: QualityTier;
  projectType: ProjectType | null;
  projectLocation: { lat: number; lng: number } | null;
  projectAddress: string;
  onGeneratePdf: () => void;
  onSaveBudget: () => void;
  onGoBack?: () => void;
}

export const BudgetSummaryPanel: React.FC<BudgetSummaryPanelProps> = ({
  materials,
  quality,
  projectType,
  projectLocation,
  projectAddress,
  onGeneratePdf,
  onSaveBudget,
  onGoBack
}) => {
  const { 
    user, 
    isAuthenticated, 
    isPro, 
    tokens, 
    consumeTokens, 
    openAuthModal, 
    openPaywallModal 
  } = useAuth();

  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  const selectedMaterials = materials.filter(m => m.selected);
  const multiplier = QUALITY_MULTIPLIERS[quality] || 1.0;

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

  // High Attention Conditions
  const isPremiumTier = quality === 'premium';
  const hasHighValueItems = selectedMaterials.some(m => {
    const cost = Math.round(m.basePrice * multiplier) * m.quantity;
    return subtotalMaterials > 0 && (cost / subtotalMaterials) >= 0.25;
  });

  // Handle Protected PDF Generation
  const handlePdfClick = () => {
    if (!isAuthenticated) {
      openAuthModal('register');
      return;
    }
    if (!isPro && tokens < TOKEN_COSTS.PDF_EXPORT) {
      openPaywallModal('Exportar Cotización Formal en PDF', TOKEN_COSTS.PDF_EXPORT);
      return;
    }
    const tokenResult = consumeTokens(
      TOKEN_COSTS.PDF_EXPORT, 
      `Descarga de Cotización Formal PDF (${projectType?.toUpperCase() || 'Obra'})`,
      'pdf_export'
    );
    if (tokenResult.success) {
      onGeneratePdf();
    }
  };

  // Handle Protected Save Budget
  const handleSaveClick = () => {
    if (!isAuthenticated) {
      openAuthModal('register');
      return;
    }
    if (!isPro && tokens < TOKEN_COSTS.SAVE_BUDGET) {
      openPaywallModal('Guardar Presupuesto en Historial Ilimitado', TOKEN_COSTS.SAVE_BUDGET);
      return;
    }
    const tokenResult = consumeTokens(
      TOKEN_COSTS.SAVE_BUDGET, 
      `Guardar presupuesto en la nube (${projectType?.toUpperCase() || 'Obra'})`,
      'save_budget'
    );
    if (tokenResult.success) {
      onSaveBudget();
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-4">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-4 h-4 text-orange-500" />
            <span>Resumen Financiero de Obra</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cómputo en tiempo real con mano de obra y transporte para Chile
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          CLP 2025
        </span>
      </div>

      {/* Financial Line Items */}
      <div className="space-y-2 text-xs">
        
        {/* Subtotal Materials */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="font-medium">Subtotal Insumos ({selectedMaterials.length} seleccionados):</span>
          </div>
          <span className="font-mono tabular-nums font-bold text-slate-100 text-sm">
            ${Math.round(subtotalMaterials).toLocaleString('es-CL')}
          </span>
        </div>

        {/* Transport / Freight */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-300">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Transporte y Logística Estimada:</span>
          </div>
          <span className="font-mono tabular-nums font-bold text-slate-100 text-sm">
            ${Math.round(transportCost).toLocaleString('es-CL')}
          </span>
        </div>

        {/* Handyman / Labor */}
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
          <div className="flex items-center space-x-2 text-slate-300">
            <Wrench className="w-3.5 h-3.5 text-orange-400" />
            <div>
              <span className="font-medium">Mano de Obra Especializada:</span>
              <span className="text-[10px] text-slate-500 block font-mono">
                ~{Math.round(laborPercent * 100)}% s/materiales ({categoryConfig?.name || 'Partida'})
              </span>
            </div>
          </div>
          <span className="font-mono tabular-nums font-bold text-slate-100 text-sm">
            ${Math.round(laborCost).toLocaleString('es-CL')}
          </span>
        </div>

        {/* High Attention Reflective Alert if Critical Threshold Reached */}
        {hasHighValueItems && (
          <div className="border border-reflective bg-slate-950 p-2.5 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="badge-reflective text-[9px] px-1.5 py-0.5 rounded-sm">
                ATENCIÓN
              </span>
              <span className="text-slate-300 text-[11px]">
                Existen partidas dominantes (&gt;25% del total). Revisa la lista para optimizar marcas.
              </span>
            </div>
          </div>
        )}

        {isPremiumTier && (
          <div className="border border-reflective-amber bg-slate-950 p-2.5 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="badge-reflective-amber text-[9px] px-1.5 py-0.5 rounded-sm">
                PREMIUM
              </span>
              <span className="text-slate-300 text-[11px]">
                Factor calidad alta (+38%). Incluye acabados y primeras marcas de importación.
              </span>
            </div>
          </div>
        )}

        {/* Total Cost Display - Sober Architectural Graphite with Orange Outline */}
        <div className="p-4 rounded-lg bg-slate-950 border border-orange-500/50 shadow-md space-y-1 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Total Proyectado Obra:
            </span>
            <span className="text-xl font-extrabold tracking-tight font-mono tabular-nums text-white">
              ${Math.round(totalCost).toLocaleString('es-CL')} <span className="text-xs text-orange-400 font-sans">CLP</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-400 text-right">
            Valores con IVA estimado incluido según lista de proveedores
          </p>
        </div>

      </div>

      {/* Action Buttons: Vivid Cobalt Blue and Construction Orange */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handlePdfClick}
          disabled={selectedMaterials.length === 0}
          className="w-full flex items-center justify-center space-x-2 font-bold p-3 rounded-lg shadow-sm bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-xs"
        >
          {isPro ? (
            <Crown className="w-4 h-4 text-amber-300" />
          ) : !isAuthenticated || tokens < TOKEN_COSTS.PDF_EXPORT ? (
            <Lock className="w-4 h-4 text-amber-300" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          <span>
            {isPro
              ? 'Exportar Cotización Formal PDF (PRO)'
              : !isAuthenticated
              ? 'Exportar PDF (Regístrate y recibe 50 Tokens)'
              : tokens < TOKEN_COSTS.PDF_EXPORT
              ? `Exportar PDF (Requiere ${TOKEN_COSTS.PDF_EXPORT} Tokens)`
              : `Exportar Presupuesto PDF (-${TOKEN_COSTS.PDF_EXPORT} tokens)`}
          </span>
        </button>

        <button
          onClick={handleSaveClick}
          disabled={selectedMaterials.length === 0}
          className="w-full flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-500 text-white font-bold p-3 rounded-lg shadow-sm shadow-orange-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-xs"
        >
          <Save className="w-4 h-4" />
          <span>
            {isPro
              ? 'Guardar en Mis Presupuestos (Ilimitado)'
              : `Guardar en Mis Presupuestos (-${TOKEN_COSTS.SAVE_BUDGET} tokens)`}
          </span>
        </button>

        {/* Share Button (WhatsApp, Telegram, Messenger, etc.) */}
        <button
          type="button"
          onClick={() => setShowShareModal(true)}
          disabled={selectedMaterials.length === 0}
          className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-2.5 rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer text-xs active:scale-98"
          title="Compartir cotización por WhatsApp, Messenger, Telegram o correo"
        >
          <Share2 className="w-4 h-4" />
          <span>Compartir Cotización (WhatsApp, Redes, etc.)</span>
        </button>

        {onGoBack && (
          <button
            type="button"
            onClick={onGoBack}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold p-2.5 rounded-lg border border-slate-700 transition-all cursor-pointer text-xs"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            <span>Volver a la Página Principal</span>
          </button>
        )}
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && projectType && (
        <ShareBudgetModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          materials={materials}
          quality={quality}
          projectType={projectType}
          projectAddress={projectAddress}
          totalCost={totalCost}
        />
      )}

    </div>
  );
};
