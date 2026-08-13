import React from 'react';
import { ProjectType } from '../types';
import { PROJECT_CATEGORIES } from '../data/chileData';
import { Check } from 'lucide-react';

interface ProjectCategorySelectorProps {
  selectedCategory: ProjectType | null;
  onSelectCategory: (category: ProjectType) => void;
}

export const ProjectCategorySelector: React.FC<ProjectCategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📋</span> Selecciona Tipo de Proyecto
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Escoge la especialidad para cargar precios y cálculo automatizado
          </p>
        </div>
        {selectedCategory && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <Check className="w-3 h-3" /> Proyecto Activo
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROJECT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`relative flex flex-col items-center justify-between p-4 rounded-xl border text-center transition-all duration-200 group cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-indigo-600 dark:ring-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 shadow-md scale-[1.02]'
                  : `${cat.bgLight} ${cat.bgDark} hover:scale-[1.01] hover:shadow-sm`
              }`}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                {cat.title}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                {cat.description}
              </p>
              
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
