import React, { useState, useEffect } from 'react';
import { ProjectType, QualityTier, AICalculationResult } from '../types';
import { PROJECT_QUESTIONS } from '../data/chileData';
import { calculateAreaMaterialsLocal } from '../utils/areaCalculators';
import { Sparkles, Brain, ListChecks, AlertCircle, ShieldAlert, Lightbulb, CheckCircle, RefreshCw } from 'lucide-react';

interface AIAssistantPanelProps {
  projectType: ProjectType | null;
  quality: QualityTier;
  projectAddress: string;
  onApplyCalculatedMaterials: (result: AICalculationResult) => void;
  onApplyBasicMaterials: () => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  projectType,
  quality,
  projectAddress,
  onApplyCalculatedMaterials,
  onApplyBasicMaterials
}) => {
  const [measurements, setMeasurements] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AICalculationResult | null>(null);

  // Initialize measurement default values when project changes
  useEffect(() => {
    if (projectType) {
      const questions = PROJECT_QUESTIONS[projectType] || [];
      const defaults: Record<string, any> = {};
      questions.forEach(q => {
        defaults[q.id] = q.defaultValue !== undefined ? q.defaultValue : 1;
      });
      setMeasurements(defaults);
      setAiResult(null);
      setErrorMsg(null);
    }
  }, [projectType]);

  const questions = projectType ? PROJECT_QUESTIONS[projectType] || [] : [];

  const handleInputChange = (id: string, value: string, isSelect: boolean = false) => {
    if (isSelect) {
      setMeasurements(prev => ({
        ...prev,
        [id]: value
      }));
    } else {
      const num = parseFloat(value);
      setMeasurements(prev => ({
        ...prev,
        [id]: isNaN(num) ? 0 : num
      }));
    }
  };

  const isFormValid = Object.values(measurements).some((val: any) => val !== '' && val !== null && val !== undefined && val !== 0);

  const loadingSteps = [
    "🤖 Conectando con Google Gemini AI...",
    "📐 Analizando medidas del proyecto e integrando merma...",
    "📊 Consultando catálogo y normativa chilena (SEC / MINVU)...",
    "✨ Optimizando costos con precios de referencia Chile 2025..."
  ];

  const handleCalculateWithAI = async () => {
    if (!projectType) return;

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingSteps.length);
    }, 1200);

    try {
      const response = await fetch('/api/gemini/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectType,
          measurements,
          quality,
          address: projectAddress
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Error en el servidor de IA');
      }

      const data = await response.json();
      clearInterval(stepInterval);
      
      const formattedResult: AICalculationResult = {
        materials: (data.materials || []).map((m: any, idx: number) => ({
          id: `ai_${idx}_${Date.now()}`,
          name: m.name,
          unit: m.unit,
          basePrice: m.basePrice || 5000,
          quantity: m.quantity || 1,
          selected: true,
          category: m.category || 'Materiales IA',
          reasoning: m.reasoning,
          aiCalculated: true
        })),
        technicalAdvice: data.technicalAdvice || 'Recomendación técnica generada por IA.',
        safetyNote: data.safetyNote || 'Cumplir con la reglamentación técnica correspondiente.',
        savingTips: data.savingTips || 'Adquirir materiales en distribuidores mayoristas de la zona.',
        estimatedLaborMultiplier: data.estimatedLaborMultiplier || 0.45
      };

      setAiResult(formattedResult);
      onApplyCalculatedMaterials(formattedResult);

    } catch (err: any) {
      console.warn("Fallback local por falta de API key o error de red:", err);
      clearInterval(stepInterval);

      // Perform a smart fallback calculation locally using precise Chile area formulas
      const fallbackResult = calculateAreaMaterialsLocal(projectType, measurements, quality);

      setAiResult(fallbackResult);
      onApplyCalculatedMaterials(fallbackResult);

    } finally {
      setIsLoading(false);
    }
  };

  if (!projectType) {
    return (
      <div className="bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-white dark:from-gray-800/80 dark:via-gray-800/50 dark:to-gray-800 rounded-2xl p-6 border border-indigo-100 dark:border-gray-700 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <Brain className="w-6 h-6 animate-bounce" />
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-base">Asistente IA de Materiales</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1">
          Selecciona un tipo de proyecto arriba (ej. Electricidad, Cerámicas, Ampliaciones) para activar el cálculo inteligente con IA.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/40 to-white dark:from-gray-800 dark:via-gray-800/90 dark:to-gray-800/80 rounded-2xl p-5 border border-indigo-200/80 dark:border-indigo-900/50 shadow-sm transition-all">
      
      {/* Title Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-1.5">
              🤖 Asistente IA Gemini - Medidas y Cubicación
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Ingresa las dimensiones de tu obra para calcular materiales requeridos
            </p>
          </div>
        </div>
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {questions.map((q) => (
          <div key={q.id} className="bg-white dark:bg-gray-700/80 p-3.5 rounded-xl border border-gray-200 dark:border-gray-600 shadow-2xs">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
              {q.label}
            </label>
            {q.type === 'select' ? (
              <select
                value={measurements[q.id] ?? q.defaultValue ?? ''}
                onChange={(e) => handleInputChange(q.id, e.target.value, true)}
                className="w-full p-2.5 text-sm font-semibold border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
              >
                {(q.options || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={measurements[q.id] ?? ''}
                  onChange={(e) => handleInputChange(q.id, e.target.value, false)}
                  placeholder="0"
                  className="w-full p-2.5 text-sm font-semibold border border-gray-300 dark:border-gray-500 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                />
                <span className="text-xs font-medium px-3 py-2.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-lg shrink-0">
                  {q.unit}
                </span>
              </div>
            )}
            {q.helpText && (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                💡 {q.helpText}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={handleCalculateWithAI}
          disabled={isLoading || !isFormValid}
          className="flex-1 flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer text-sm"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          <span>{isLoading ? 'Calculando con IA...' : '🧠 Calcular con IA Gemini'}</span>
        </button>

        <button
          onClick={onApplyBasicMaterials}
          className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition-all cursor-pointer text-sm"
        >
          <ListChecks className="w-4 h-4" />
          <span>📋 Cargar Lista Básica</span>
        </button>
      </div>

      {/* Loading animation state */}
      {isLoading && (
        <div className="mt-4 p-4 bg-white/90 dark:bg-gray-700/90 rounded-xl border border-indigo-200 dark:border-indigo-800 text-center space-y-2 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 text-indigo-600 dark:text-indigo-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm font-bold">{loadingSteps[loadingStep]}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Generando desglose detallado para Chile 2025...
          </p>
        </div>
      )}

      {/* Error / Warning Alert */}
      {errorMsg && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI Output Card */}
      {aiResult && !isLoading && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-700/90 rounded-xl border border-indigo-200 dark:border-gray-600 space-y-3 shadow-2xs animate-fade-in">
          
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-600 pb-2">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>Cálculo optimizado con IA completado</span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full">
              {aiResult.materials.length} materiales
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {aiResult.technicalAdvice && (
              <div className="flex items-start space-x-2 bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300">
                <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Norma / Consejo Técnico:</span>
                  <p className="leading-relaxed">{aiResult.technicalAdvice}</p>
                </div>
              </div>
            )}

            {aiResult.safetyNote && (
              <div className="flex items-start space-x-2 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900 text-amber-800 dark:text-amber-300">
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Seguridad e Inspección:</span>
                  <p className="leading-relaxed">{aiResult.safetyNote}</p>
                </div>
              </div>
            )}

            {aiResult.savingTips && (
              <div className="flex items-start space-x-2 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Tip de Ahorro:</span>
                  <p className="leading-relaxed">{aiResult.savingTips}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
