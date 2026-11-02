import React from 'react';
import { X, Smartphone, Download, CheckCircle2, ShieldCheck, Globe, Cpu } from 'lucide-react';

interface AndroidGuideModalProps {
  onClose: () => void;
}

export const AndroidGuideModal: React.FC<AndroidGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-xl p-5 sm:p-6 max-w-lg w-full border border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Instalación en Smartphone Android
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Usa la aplicación en terreno como una APK / PWA nativa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-lg border border-blue-500/30 space-y-2">
            <span className="font-bold text-blue-400 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-400" />
              <span>Opción 1: Instalar como App Directa (PWA)</span>
            </span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              <li>Abre esta aplicación en el navegador <strong>Google Chrome</strong> de tu teléfono Android.</li>
              <li>Presiona los <strong>tres puntos verticales (⋮)</strong> en la esquina superior derecha.</li>
              <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.</li>
              <li>El icono de la app aparecerá en tu teléfono con vista completa sin barra de navegación.</li>
            </ol>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-orange-400" />
              <span>Opción 2: Empaquetar como APK Android Nativa</span>
            </span>
            <p className="text-slate-300 leading-relaxed">
              El código fuente está construido con arquitectura responsive y estándar web compatible con:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400 font-mono">
              <li>Android Studio (WebView con soporte para ChromeClient)</li>
              <li>Capacitor / Cordova (Wrapper nativo multiplataforma)</li>
              <li>PWABuilder de Microsoft para generar bundle de Google Play</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
