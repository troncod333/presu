import React from 'react';
import { BudgetRecord } from '../types';
import { FolderOpen, Trash2, ArrowRight, X, Calendar, MapPin, CheckCircle2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 shrink-0">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Mis Presupuestos Guardados ({savedBudgets.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of saved budgets */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {savedBudgets.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
              <FolderOpen className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No tienes presupuestos guardados aún. Genera un presupuesto y haz clic en "💾 Guardar Presupuesto".
              </p>
            </div>
          ) : (
            savedBudgets.map((b) => (
              <div
                key={b.id}
                className="bg-gray-50 dark:bg-gray-700/60 p-4 rounded-xl border border-gray-200 dark:border-gray-600 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-xs text-gray-900 dark:text-white block">
                      {b.title || `Proyecto ${b.projectType.toUpperCase()}`}
                    </span>
                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(b.createdAt).toLocaleDateString('es-CL')}
                      </span>
                      <span>• {b.materials.length} materiales</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 block">
                      ${Math.round(b.totalCost).toLocaleString('es-CL')} CLP
                    </span>
                  </div>
                </div>

                {b.projectAddress && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate">{b.projectAddress}</span>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200 dark:border-gray-600/60">
                  <button
                    onClick={() => onDeleteBudget(b.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer text-xs"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onLoadBudget(b)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"
                  >
                    <span>Cargar en Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
