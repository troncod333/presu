import React, { useState, useEffect } from 'react';
import { MaterialItem, QualityTier, ProjectType } from '../types';
import { QUALITY_MULTIPLIERS, PROJECT_CATEGORIES } from '../data/chileData';
import { ShareBudgetModal } from './ShareBudgetModal';
import { 
  X, 
  Printer, 
  Share2, 
  ArrowLeft, 
  FileText, 
  MapPin, 
  Calendar, 
  Building2, 
  ShieldCheck,
  CheckCircle,
  Download
} from 'lucide-react';

interface PrintBudgetModalProps {
  materials: MaterialItem[];
  quality: QualityTier;
  projectType: ProjectType;
  projectAddress: string;
  onClose: () => void;
}

export const PrintBudgetModal: React.FC<PrintBudgetModalProps> = ({
  materials,
  quality,
  projectType,
  projectAddress,
  onClose
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showShareModal) {
          setShowShareModal(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showShareModal]);

  const selectedMaterials = materials.filter(m => m.selected);
  const mult = QUALITY_MULTIPLIERS[quality] || 1.0;

  const subtotalMaterials = selectedMaterials.reduce((sum, item) => {
    return sum + Math.round(item.basePrice * mult * item.quantity);
  }, 0);

  const categoryConfig = PROJECT_CATEGORIES.find(c => c.id === projectType);
  const laborPercent = categoryConfig ? categoryConfig.laborPercent : 0.45;
  const laborCost = Math.round(subtotalMaterials * laborPercent);
  const transportCost = Math.min(25000, Math.max(5000, Math.round(subtotalMaterials * 0.05)));
  const subtotalNeto = subtotalMaterials + laborCost + transportCost;
  const iva = Math.round(subtotalNeto * 0.19);
  const total = subtotalNeto + iva;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-start p-2 sm:p-4 z-50 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        {/* Floating/Sticky Top Navigation & Action Bar (Hidden on Print) */}
        <header className="sticky top-2 z-40 w-full max-w-3xl mb-3 print:hidden">
          <div className="bg-slate-900 border-2 border-orange-500/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-wrap items-center justify-between gap-2.5">
            
            {/* Prominent Back Button to Return to Form */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold transition-all border border-slate-700 shadow-sm cursor-pointer group"
              title="Regresar al formulario de cubicación y medidas"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400 group-hover:-translate-x-1 transition-transform" />
              <span>← Volver al Formulario</span>
            </button>

            {/* Title / Info */}
            <div className="hidden md:flex items-center space-x-2 text-slate-300 text-xs">
              <FileText className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-white">Vista Previa Cotización Formal PDF</span>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Share Button */}
              <button
                type="button"
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                title="Compartir por WhatsApp, Telegram, Messenger o Correo"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </button>

              {/* Print / Save PDF Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-orange-950 cursor-pointer"
                title="Imprimir documento o Guardar como PDF"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / PDF</span>
              </button>

              {/* Close 'X' button */}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                aria-label="Cerrar vista previa y volver al formulario"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Printable Formal Document Content */}
        <div className="bg-white text-gray-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full border border-gray-200 shadow-2xl relative print:m-0 print:p-0 print:border-none print:shadow-none print:rounded-none">
          
          <div className="space-y-6 text-xs text-gray-800">
            
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-orange-600 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-sm">
                    C
                  </div>
                  <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    Cubicador Pro
                  </h1>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  Cubicación y Presupuesto de Construcción Chile 2025 • Normativa SEC & MINVU
                </p>
                <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-600" />
                  <span>Obra: {projectAddress || 'Santiago, Chile'}</span>
                </div>
              </div>

              <div className="text-right text-[11px] space-y-0.5">
                <span className="font-mono font-bold text-slate-900 block text-xs">
                  COTIZACIÓN N° {Math.floor(100000 + Math.random() * 900000)}
                </span>
                <p className="text-gray-500">Fecha: {new Date().toLocaleDateString('es-CL')}</p>
                <span className="inline-block bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase border border-orange-200">
                  {projectType.toUpperCase()} • CALIDAD {quality.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200">
                <thead className="bg-gray-100 text-gray-700 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2 px-3 border-b">Ítem / Material</th>
                    <th className="py-2 px-2 border-b">Unidad</th>
                    <th className="py-2 px-2 text-right border-b">Cant.</th>
                    <th className="py-2 px-3 text-right border-b">P. Unitario ($)</th>
                    <th className="py-2 px-3 text-right border-b">Total Neto ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {selectedMaterials.map((item, idx) => {
                    const unitPrice = Math.round(item.basePrice * mult);
                    const itemTotal = Math.round(unitPrice * item.quantity);

                    return (
                      <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                        <td className="py-2 px-3 font-medium text-gray-900">
                          {item.name}
                          {item.reasoning && (
                            <span className="block text-[10px] text-gray-500 italic">
                              {item.reasoning}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-gray-600">{item.unit}</td>
                        <td className="py-2 px-2 text-right font-mono font-semibold">{item.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">${unitPrice.toLocaleString('es-CL')}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">${itemTotal.toLocaleString('es-CL')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Totals Table */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-80 space-y-1.5 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal Materiales ({selectedMaterials.length} ítems):</span>
                  <span className="font-mono font-bold">${subtotalMaterials.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Mano de Obra Estimada (~{Math.round(laborPercent * 100)}%):</span>
                  <span className="font-mono font-bold">${laborCost.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Flete y Logística:</span>
                  <span className="font-mono font-bold">${transportCost.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-gray-700 font-bold border-t border-gray-200 pt-1.5">
                  <span>Total Neto:</span>
                  <span className="font-mono">${subtotalNeto.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>I.V.A. (19%):</span>
                  <span className="font-mono font-bold">${iva.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-slate-950 font-black text-sm border-t-2 border-orange-600 pt-1.5">
                  <span>TOTAL GENERAL:</span>
                  <span className="font-mono text-orange-600">${total.toLocaleString('es-CL')} CLP</span>
                </div>
              </div>
            </div>

            {/* Signature and Conditions Notes */}
            <div className="border-t border-gray-200 pt-4 text-[10px] text-gray-500 space-y-1">
              <p>• Precios expresados en Pesos Chilenos (CLP) con valores de referencia para el mercado nacional chileno.</p>
              <p>• Los rendimientos consideran tolerancias constructivas y mermas técnicas de aplicación en faena.</p>
              <p>• Documento generado para efectos de cotización formal, compra de materiales y control presupuestario.</p>
            </div>

            {/* Bottom Actions Bar inside modal (Hidden on Print) */}
            <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 text-orange-400 group-hover:-translate-x-1 transition-transform" />
                <span>← Volver al Formulario de Presupuesto</span>
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir Presupuesto</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-orange-950 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Descargar / Imprimir PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Share Budget Modal */}
      {showShareModal && (
        <ShareBudgetModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          materials={materials}
          quality={quality}
          projectType={projectType}
          projectAddress={projectAddress}
          totalCost={total}
        />
      )}
    </>
  );
};
