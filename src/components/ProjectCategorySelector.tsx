import React from 'react';
import { ProjectType } from '../types';
import { PROJECT_CATEGORIES } from '../data/chileData';
import { 
  Zap, 
  Grid, 
  Layers, 
  Home, 
  Paintbrush, 
  Droplet, 
  Maximize2, 
  Camera, 
  Check, 
  HardHat,
  ChevronRight
} from 'lucide-react';

interface ProjectCategorySelectorProps {
  selectedCategory: ProjectType;
  onSelectCategory: (category: ProjectType) => void;
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Grid,
  Layers,
  Home,
  Paintbrush,
  Droplet,
  Maximize2,
  Camera
};

// Distinctive specialty color accents
const CATEGORY_ACCENTS: Partial<Record<ProjectType, { text: string; bg: string; activeBorder: string; activeBg: string; activeText: string }>> = {
  electricidad: {
    text: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    activeBorder: 'border-orange-500 ring-orange-500/30',
    activeBg: 'bg-orange-950/40',
    activeText: 'text-orange-400'
  },
  ceramicas: {
    text: 'text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    activeBorder: 'border-cyan-500 ring-cyan-500/30',
    activeBg: 'bg-cyan-950/40',
    activeText: 'text-cyan-400'
  },
  tabiqueria: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    activeBorder: 'border-blue-500 ring-blue-500/30',
    activeBg: 'bg-blue-950/40',
    activeText: 'text-blue-400'
  },
  techumbre: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    activeBorder: 'border-orange-500 ring-orange-500/30',
    activeBg: 'bg-orange-950/40',
    activeText: 'text-orange-400'
  },
  pintura: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    activeBorder: 'border-emerald-500 ring-emerald-500/30',
    activeBg: 'bg-emerald-950/40',
    activeText: 'text-emerald-400'
  },
  gasfiteria: {
    text: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    activeBorder: 'border-sky-500 ring-sky-500/30',
    activeBg: 'bg-sky-950/40',
    activeText: 'text-sky-400'
  },
  ampliacion: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    activeBorder: 'border-yellow-500 ring-yellow-500/30',
    activeBg: 'bg-yellow-950/40',
    activeText: 'text-yellow-400'
  },
  cctv: {
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    activeBorder: 'border-indigo-500 ring-indigo-500/30',
    activeBg: 'bg-indigo-950/40',
    activeText: 'text-indigo-400'
  }
};

export const ProjectCategorySelector: React.FC<ProjectCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="bg-slate-900/90 text-slate-100 p-3.5 sm:p-5 rounded-xl border border-slate-800 shadow-sm">
      
      {/* Title & Technical Subtitle */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <HardHat className="w-4 h-4 text-orange-500 shrink-0" />
          <h2 className="text-xs sm:text-base font-bold text-white tracking-tight">
            Especialidad de Obra
          </h2>
          <span className="sm:hidden text-[10px] text-slate-400 flex items-center gap-0.5 font-mono">
            <span>Desliza</span>
            <ChevronRight className="w-3 h-3 text-orange-400 inline" />
          </span>
        </div>

        {/* Technical subtitle unboxed */}
        <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
          <span>Precios Chile 2025 · Sodimac / Easy / Chilemat</span>
        </div>
      </div>

      {/* MOBILE VIEW: Horizontal Touch Rail (Saves ~320px of mobile height) */}
      <div className="sm:hidden flex overflow-x-auto gap-2 pb-1.5 scrollbar-none snap-x -mx-1 px-1">
        {PROJECT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = CATEGORY_ICONS[cat.iconName] || HardHat;
          const accent = CATEGORY_ACCENTS[cat.id] || {
            text: 'text-orange-400',
            bg: 'bg-slate-800',
            activeBorder: 'border-orange-500 ring-orange-500/30',
            activeBg: 'bg-orange-950/30',
            activeText: 'text-orange-400'
          };
          const isCriticalSec = cat.id === 'electricidad' || cat.id === 'gasfiteria';

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`snap-start shrink-0 w-[118px] p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer active:scale-95 ${
                isSelected
                  ? `${accent.activeBg} ${accent.activeBorder} ring-2 border-orange-500 shadow-md`
                  : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center border ${
                    isSelected
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : `${accent.bg} ${accent.text} border-transparent`
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                {isSelected ? (
                  <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-slate-950 shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                ) : isCriticalSec ? (
                  <span className="text-[8px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1 py-0.2 rounded border border-amber-400/20">
                    SEC
                  </span>
                ) : null}
              </div>

              <div>
                <h3 className={`text-xs font-bold leading-tight truncate ${
                  isSelected ? 'text-white' : 'text-slate-200'
                }`}>
                  {cat.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                  M.O. ~{Math.round(cat.laborPercent * 100)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* DESKTOP VIEW: Full Grid (sm:grid) */}
      <div className="hidden sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {PROJECT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComponent = CATEGORY_ICONS[cat.iconName] || HardHat;
          const accent = CATEGORY_ACCENTS[cat.id] || {
            text: 'text-orange-400',
            bg: 'bg-slate-800',
            activeBorder: 'border-orange-500 ring-orange-500/30',
            activeBg: 'bg-orange-950/30',
            activeText: 'text-orange-400'
          };
          const isCriticalSec = cat.id === 'electricidad' || cat.id === 'gasfiteria';

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-3 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                isSelected
                  ? `${accent.activeBg} ${accent.activeBorder} ring-2 border-orange-500 shadow-md`
                  : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800/90 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors border ${
                    isSelected
                      ? 'bg-slate-900 border-slate-700 text-white'
                      : `${accent.bg} ${accent.text} border-transparent`
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                {isSelected ? (
                  <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-slate-950 shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : isCriticalSec ? (
                  <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20" title="Norma SEC Aplicable">
                    SEC
                  </span>
                ) : null}
              </div>

              <div>
                <h3 className={`text-xs font-bold leading-tight ${
                  isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'
                }`}>
                  {cat.name}
                </h3>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <span>M.O. ~{Math.round(cat.laborPercent * 100)}%</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
};
