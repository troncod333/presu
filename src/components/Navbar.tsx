import React, { useState } from 'react';
import { 
  Building2, 
  Smartphone, 
  FolderOpen, 
  Code2, 
  Sun, 
  Moon, 
  Menu,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 text-slate-100 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand Wordmark (Zone 1) */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={onGoHome}
              className="flex items-center space-x-2.5 text-left cursor-pointer group focus:outline-none"
              title="Volver a la Página Principal"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-sm shadow-orange-950 font-bold group-hover:scale-105 transition-transform shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                    Cubicador Pro
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-slate-900 border border-orange-500/40 text-orange-400">
                    CHILE
                  </span>
                </div>
                <span className="hidden sm:inline-block text-[10px] text-slate-400 leading-none">
                  Cubicación y Presupuestos SEC / MINVU
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Toolbar Controls (Zone 2 & 3) */}
          <div className="hidden md:flex items-center gap-2">
            <UserAccountWidget />

            <button
              onClick={onToggleAndroidView}
              className={`flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all whitespace-nowrap cursor-pointer ${
                isAndroidView
                  ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
              }`}
              title="Alternar entre modo smartphone Android y modo web completa"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>{isAndroidView ? 'Simulador Smartphone' : 'Vista Completa'}</span>
            </button>

            <button
              onClick={onOpenSavedBudgets}
              className="relative flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-slate-200 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5 text-orange-400" />
              <span>Presupuestos</span>
              {savedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-sm bg-orange-600 text-white text-[10px] font-mono font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenAndroidGuide}
              className="flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Guía Android</span>
            </button>

            <button
              onClick={onToggleDarkMode}
              className="flex items-center justify-center p-2 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-colors cursor-pointer"
              title="Cambiar tema claro/oscuro"
              aria-label="Cambiar tema"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>
          </div>

          {/* Mobile Right Controls: Compact, touch-friendly, never cluttered */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            <UserAccountWidget />

            {/* Saved Budgets Quick Icon */}
            <button
              onClick={onOpenSavedBudgets}
              className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-900 text-slate-200 border border-slate-800 active:bg-slate-800 cursor-pointer"
              title="Ver presupuestos guardados"
              aria-label="Presupuestos guardados"
            >
              <FolderOpen className="w-4 h-4 text-orange-400" />
              {savedCount > 0 && (
                <span className="absolute top-1.5 right-1 px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[9px] font-mono font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-900 text-slate-200 border border-slate-800 active:bg-slate-800 cursor-pointer"
              aria-label="Abrir menú de opciones"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-orange-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onToggleDarkMode();
                }}
                className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-medium active:bg-slate-800"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
                <span>{isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAndroidGuide();
                }}
                className="flex items-center space-x-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 font-medium active:bg-slate-800"
              >
                <Code2 className="w-4 h-4 text-blue-400" />
                <span>Guía Android</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onToggleAndroidView();
              }}
              className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium text-xs active:bg-slate-800"
            >
              <Smartphone className="w-4 h-4 text-orange-400" />
              <span>{isAndroidView ? 'Desactivar Marco Simulador' : 'Marco Simulador Smartphone'}</span>
            </button>
          </div>
        )}

      </div>
    </header>
  );
};
