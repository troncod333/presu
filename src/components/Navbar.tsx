import React from 'react';
import { 
  Building2, 
  Smartphone, 
  FolderOpen, 
  Code2, 
  Sun, 
  Moon, 
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAndroidView: boolean;
  onToggleAndroidView: () => void;
  onOpenSavedBudgets: () => void;
  onOpenAndroidGuide: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  isAndroidView,
  onToggleAndroidView,
  onOpenSavedBudgets,
  onOpenAndroidGuide,
  savedCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Brand & Badge */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Presupuestador Inteligente Pro
                  </h1>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                    v2.0
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Asistente IA Gemini • Precios Chile 2025 (MINVU, Sodimac, Easy, Construmart)
                </p>
              </div>
            </div>

            {/* Quick mobile buttons */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={onToggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                title="Cambiar Modo"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
              </button>
            </div>
          </div>

          {/* Action Toolbar Controls */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
            
            {/* View Mode Toggle Button */}
            <button
              onClick={onToggleAndroidView}
              className={`flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                isAndroidView
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
              title="Alternar entre modo smartphone Android y modo web completa"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isAndroidView ? 'Modo Smartphone' : 'Vista Web Completa'}</span>
            </button>

            {/* Saved Budgets Modal */}
            <button
              onClick={onOpenSavedBudgets}
              className="relative flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              <span>Presupuestos</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Android Studio Integration Guide */}
            <button
              onClick={onOpenAndroidGuide}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 transition-colors"
            >
              <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Exportar App Android</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="hidden md:flex items-center justify-center p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Cambiar tema claro/oscuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
