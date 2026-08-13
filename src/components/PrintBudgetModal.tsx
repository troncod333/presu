import React, { useState } from 'react';
import { MaterialItem, QualityTier, ProjectType } from '../types';
import { QUALITY_MULTIPLIERS } from '../data/chileData';
import { Printer, Download, X, Building2, CheckCircle2 } from 'lucide-react';

interface PrintBudgetModalProps {
  materials: MaterialItem[];
  quality: QualityTier;
  projectType: ProjectType | null;
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
  const [clientName, setClientName] = useState('Cliente Estimado');
  const [notes, setNotes] = useState('Presupuesto válido por 15 días hábiles a contar de la fecha de emisión. Cotización referencial basada en precios de mercado Chile 2025.');

  const selectedMaterials = materials.filter(m => m.selected);
  const multiplier = QUALITY_MULTIPLIERS[quality];

  const subtotal = selectedMaterials.reduce((sum, item) => {
    return sum + (Math.round(item.basePrice * multiplier) * item.quantity);
  }, 0);

  const transport = projectAddress ? Math.min(25000, Math.max(5000, Math.round(subtotal * 0.05))) : 0;
  const labor = Math.round(subtotal * 0.45);
  const total = subtotal + transport + labor;

  const handlePrint = () => {
    window.print();
  };

  const currentDateStr = new Date().toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full p-6 border border-gray-200 dark:border-gray-700 shadow-2xl space-y-6 my-8">
        
        {/* Modal Controls Bar (Hidden on print) */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 print:hidden">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Vista Previa de Presupuesto PDF / Imprimible
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT AREA */}
        <div id="print-section" className="bg-white p-8 rounded-xl border border-gray-200 text-gray-900 font-sans space-y-6">
          
          {/* Document Header */}
          <div className="flex justify-between items-start border-b-2 border-indigo-600 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center text-sm">
                  P
                </div>
                <h1 className="text-xl font-black text-indigo-600 uppercase tracking-tight">
                  Presupuestador Inteligente Pro
                </h1>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Servicios Profesionales de Construcción y Cubicación • Chile
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-indigo-900 uppercase">
                COTIZACIÓN N° {Math.floor(100000 + Math.random() * 900000)}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Fecha: {currentDateStr}</p>
              <p className="text-xs text-gray-500">Categoría: {projectType?.toUpperCase() || 'GENERAL'}</p>
            </div>
          </div>

          {/* Client & Project Info */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
            <div>
              <span className="font-bold text-gray-700 block mb-1">DATOS DEL CLIENTE:</span>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded p-1.5 font-semibold text-gray-900 print:border-none print:p-0"
              />
            </div>

            <div>
              <span className="font-bold text-gray-700 block mb-1">DIRECCIÓN DE OBRA / PROYECTO:</span>
              <p className="font-semibold text-gray-900">{projectAddress || 'Santiago, Chile'}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50 text-indigo-900 font-bold border-b-2 border-indigo-200">
                  <th className="p-2.5">Material / Insumo</th>
                  <th className="p-2.5 text-center">Unidad</th>
                  <th className="p-2.5 text-center">Cantidad</th>
                  <th className="p-2.5 text-right">P. Unitario</th>
                  <th className="p-2.5 text-right">Total Linea</th>
                </tr>
              </thead>
              <tbody>
                {selectedMaterials.map((item, idx) => {
                  const unitPrice = Math.round(item.basePrice * multiplier);
                  const lineTotal = Math.round(unitPrice * item.quantity);

                  return (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-2.5 font-medium border-b border-gray-200">{item.name}</td>
                      <td className="p-2.5 text-center border-b border-gray-200">{item.unit}</td>
                      <td className="p-2.5 text-center font-bold border-b border-gray-200">{item.quantity}</td>
                      <td className="p-2.5 text-right border-b border-gray-200">${unitPrice.toLocaleString('es-CL')}</td>
                      <td className="p-2.5 text-right font-bold border-b border-gray-200">${lineTotal.toLocaleString('es-CL')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals & Financial Box */}
          <div className="flex justify-between items-start pt-2">
            <div className="max-w-md text-[11px] text-gray-500 space-y-1">
              <span className="font-bold text-gray-700 block">NOTAS Y CONDICIONES:</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-[11px] print:border-none print:bg-transparent"
              />
            </div>

            <div className="w-64 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal Materiales:</span>
                <span className="font-bold">${Math.round(subtotal).toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Despacho / Flete:</span>
                <span className="font-bold">${Math.round(transport).toLocaleString('es-CL')}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Mano de Obra Estimada:</span>
                <span className="font-bold">${Math.round(labor).toLocaleString('es-CL')}</span>
              </div>
              <hr className="border-gray-300 my-1" />
              <div className="flex justify-between text-base font-black text-indigo-600">
                <span>TOTAL OBRAS:</span>
                <span>${Math.round(total).toLocaleString('es-CL')} CLP</span>
              </div>
            </div>
          </div>

          {/* Signature lines */}
          <div className="grid grid-cols-2 gap-12 pt-8 text-center text-xs text-gray-500">
            <div className="border-t border-gray-300 pt-2">
              <p className="font-bold text-gray-700">Firma Maestro / Aceptado por Cliente</p>
            </div>
            <div className="border-t border-gray-300 pt-2">
              <p className="font-bold text-gray-700">Presupuestador Inteligente Pro v2.0</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
