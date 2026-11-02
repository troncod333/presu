import React from 'react';
import { 
  Building2, 
  Smartphone, 
  FolderOpen, 
  Code2, 
  Sun, 
  Moon, 
  Layers
} from 'lucide-react';
import { UserAccountWidget } from './UserAccountWidget';

interface NavbarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isAndroidView: boolean;
  onToggleAndroidView: () => void;
  onOpenSavedBudgets: () => void;
  onOpenAndroidGuide: () => void;
  savedCount: number;
  onGoHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  onToggleDarkMode,
  isAndroidView,
  onToggleAndroidView,
  onOpenSavedBudgets,
  onOpenAndroidGuide,
  savedCount,
  onGoHome
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 text-slate-100 backdrop-blur-md border-b border-slate-800/80 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Brand & Technical Metadata */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
            <button
              onClick={onGoHome}
              className="flex items-center space-x-3 text-left cursor-pointer group focus:outline-none"
              title="Volver a la Página Principal"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-sm shadow-orange-950 font-bold group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                    Cubicador Pro <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-900 border border-orange-500/40 text-orange-400">CHILE</span>
                  </h1>
                </div>
                <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1.5 whitespace-nowrap">
                  <span>Cubicación & Presupuestos</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>Normas SEC / MINVU</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>Precios Mayoristas</span>
                </div>
              </div>
            </button>

            {/* Quick mobile buttons */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={onToggleDarkMode}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                title="Cambiar Modo"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
              </button>
            </div>
          </div>

          {/* Action Toolbar Controls */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 w-full md:w-auto">
            
            {/* User Account / Token / Referral Widget */}
            <UserAccountWidget />

            {/* View Mode Toggle Button */}
            <button
              onClick={onToggleAndroidView}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap ${
                isAndroidView
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
              title="Alternar entre modo smartphone Android y modo web completa"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAndroidView ? 'Modo Smartphone' : 'Vista Completa'}</span>
            </button>

            {/* Saved Budgets Modal */}
            <button
              onClick={onOpenSavedBudgets}
              className="relative flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <FolderOpen className="w-3.5 h-3.5 text-orange-400" />
              <span>Presupuestos</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-sm bg-orange-600 text-white text-[10px] font-mono font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Android Studio Integration Guide */}
            <button
              onClick={onOpenAndroidGuide}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Guía Android</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="hidden md:flex items-center justify-center p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-colors"
              title="Cambiar tema claro/oscuro"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
