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
  HardHat
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

// Distinctive specialty color badges
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
    <div className="bg-slate-900/90 text-slate-100 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Especialidad o Partida de Obra
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Selecciona la partida para cargar rendimientos chilenos, cubicación y normativas técnicas
          </p>
        </div>

        {/* Technical subtitle unboxed */}
        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 self-start sm:self-auto bg-slate-950 px-3 py-1 rounded-md border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
          <span>Precios Chile 2025 · Sodimac / Easy / Chilemat</span>
        </div>
      </div>

      {/* Grid of category chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
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
                  ? `${accent.activeBg} ${accent.activeBorder} ring-2 border-l-4 shadow-md`
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
