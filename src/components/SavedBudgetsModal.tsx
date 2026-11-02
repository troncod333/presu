import React from 'react';
import { BudgetRecord } from '../types';
import { X, FolderOpen, Trash2, Calendar, MapPin, ArrowRight } from 'lucide-react';

interface SavedBudgetsModalProps {
  savedBudgets: BudgetRecord[];
  onLoadBudget: (budget: BudgetRecord) => void;
  onDeleteBudget: (id: string) => void;
  onClose: () => void;
}

export const SavedBudgetsModal: React.FC<SavedBudgetsModalProps> = ({
  savedBudgets,
  onLoadBudget,
  onDeleteBudget,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-xl p-5 max-w-2xl w-full border border-slate-800 shadow-2xl max-h-[85vh] flex flex-col text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-xs">
              <FolderOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Presupuestos Guardados ({savedBudgets.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Historial de cotizaciones guardadas en almacenamiento local
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="overflow-y-auto py-3 space-y-2.5 flex-1 scrollbar-thin">
          {savedBudgets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <FolderOpen className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">No tienes presupuestos guardados aún.</p>
              <p className="text-xs text-slate-500">
                Haz clic en "Guardar Presupuesto" en el panel financiero para almacenar cotizaciones.
              </p>
            </div>
          ) : (
            savedBudgets.map((b) => (
              <div
                key={b.id}
                className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/70 hover:bg-slate-950 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white uppercase tracking-wide text-xs">
                      {b.projectType}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono capitalize bg-slate-900 border border-slate-700 text-orange-400">
                      {b.quality}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center space-x-3 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {new Date(b.createdAt).toLocaleDateString('es-CL')}
                    </span>
                    <span>·</span>
                    <span>{b.materials.length} insumos</span>
                  </div>

                  {b.projectAddress && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-xs">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{b.projectAddress}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <div className="text-right mr-2">
                    <span className="font-mono tabular-nums font-bold text-sm text-white block">
                      ${b.totalCost.toLocaleString('es-CL')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">CLP</span>
                  </div>

                  <button
                    onClick={() => onLoadBudget(b)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold transition cursor-pointer text-xs"
                  >
                    <span>Cargar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteBudget(b.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-md transition cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
