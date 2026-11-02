import React, { useState, useEffect, useMemo } from 'react';
import { ProjectType, QualityTier, AICalculationResult, MaterialItem } from '../types';
import { PROJECT_QUESTIONS } from '../data/chileData';
import { calculateAreaMaterialsLocal } from '../utils/areaCalculators';
import { calculateSpaceAndArtifacts } from '../utils/spaceCalculator';
import { InteractiveBlueprint } from './InteractiveBlueprint';
import { FloorPlanCanvas } from './FloorPlanCanvas';
import { 
  Sparkles, 
  Brain, 
  ListChecks, 
  AlertCircle, 
  ShieldAlert, 
  Lightbulb, 
  CheckCircle, 
  RefreshCw, 
  Sliders, 
  Compass, 
  PenTool,
  ArrowRight,
  ArrowLeft,
  Home,
  Lock,
  Crown,
  HardHat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TOKEN_COSTS } from '../types/auth';

interface AIAssistantPanelProps {
  projectType: ProjectType | null;
  quality: QualityTier;
  projectAddress: string;
  measurements?: Record<string, any>;
  onUpdateMeasurements?: (newMeasurements: Record<string, any>) => void;
  onApplyCalculatedMaterials: (result: AICalculationResult) => void;
  onApplyBasicMaterials: () => void;
  currentMaterials?: MaterialItem[];
  onExportMaterials?: (updatedMaterials: MaterialItem[]) => void;
  onOpenCanvasTab?: () => void;
  onGoBackToHome?: () => void;
  onResetToInitial?: () => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  projectType,
  quality,
  projectAddress,
  measurements: propMeasurements,
  onUpdateMeasurements,
  onApplyCalculatedMaterials,
  onApplyBasicMaterials,
  currentMaterials = [],
  onExportMaterials,
  onOpenCanvasTab,
  onGoBackToHome,
  onResetToInitial
}) => {
  const [internalMeasurements, setInternalMeasurements] = useState<Record<string, any>>({});
  const measurements = propMeasurements || internalMeasurements;

  const [viewMode, setViewMode] = useState<'form' | 'canvas' | 'blueprint'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<AICalculationResult | null>(null);

  const { 
    user, 
    isAuthenticated, 
    isPro, 
    tokens, 
    consumeTokens, 
    openAuthModal, 
    openPaywallModal 
  } = useAuth();

  // Initialize measurement default values when project changes
  useEffect(() => {
    if (projectType) {
      const questions = PROJECT_QUESTIONS[projectType] || [];
      const defaults: Record<string, any> = {};
      questions.forEach(q => {
        defaults[q.id] = q.defaultValue !== undefined ? q.defaultValue : 1;
      });

      if (onUpdateMeasurements) {
        onUpdateMeasurements(defaults);
      } else {
        setInternalMeasurements(defaults);
      }
      setAiResult(null);
      setErrorMsg(null);
    }
  }, [projectType]);

  const questions = projectType ? PROJECT_QUESTIONS[projectType] || [] : [];

  const handleInputChange = (id: string, value: string, isSelect: boolean = false) => {
    let newMeasurements: Record<string, any>;
    const questionDef = questions.find(q => q.id === id);
    const isIntegerField = questionDef?.isInteger || 
      ['numOutlets', 'numLights', 'doors', 'coats', 'bathrooms', 'kitchen', 'floors', 'camerasExt', 'camerasInt', 'storageDays'].includes(id);

    if (isSelect) {
      newMeasurements = {
        ...measurements,
        [id]: value
      };
    } else if (isIntegerField) {
      // Strict whole integer parsing: eliminate decimal points/commas
      const digitsOnly = value.replace(/[^0-9]/g, '');
      const parsedInt = digitsOnly === '' ? 0 : parseInt(digitsOnly, 10);
      const minVal = questionDef?.min !== undefined ? questionDef.min : 0;
      newMeasurements = {
        ...measurements,
        [id]: Math.max(minVal, parsedInt)
      };
    } else {
      const num = parseFloat(value);
      newMeasurements = {
        ...measurements,
        [id]: isNaN(num) ? 0 : num
      };
    }

    if (onUpdateMeasurements) {
      onUpdateMeasurements(newMeasurements);
    } else {
      setInternalMeasurements(newMeasurements);
    }
  };

  // Compute space dimensions and required artifacts based on current measurements
  const spaceInfo = useMemo(() => {
    if (!projectType) return null;
    return calculateSpaceAndArtifacts(projectType, measurements);
  }, [projectType, measurements]);

  const isFormValid = Object.values(measurements).some((val: any) => val !== '' && val !== null && val !== undefined && val !== 0);

  const loadingSteps = [
    "Conectando con motor de cubicación Gemini...",
    "Analizando dimensiones, tolerancias y merma...",
    "Consultando catálogo y normativa chilena (SEC / MINVU)...",
    "Generando desglose con precios Sodimac / Easy / Chilemat..."
  ];

  const handleCalculateWithAI = async () => {
    if (!projectType) return;

    if (!isAuthenticated) {
      openAuthModal('register');
      return;
    }

    if (!isPro && tokens < TOKEN_COSTS.AI_CALCULATION) {
      openPaywallModal('Cálculo de Insumos con IA', TOKEN_COSTS.AI_CALCULATION);
      return;
    }

    const tokenResult = consumeTokens(
      TOKEN_COSTS.AI_CALCULATION, 
      `Cálculo IA para ${projectType.toUpperCase()}`,
      'ai_calc'
    );

    if (!tokenResult.success) {
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch('/api/gemini/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectType,
          measurements,
          quality,
          address: projectAddress
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error(`Error en servidor: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.materials || !Array.isArray(data.materials)) {
        throw new Error("Formato de respuesta inválido.");
      }

      const formattedResult: AICalculationResult = {
        materials: data.materials.map((m: any, idx: number) => ({
          id: `ai-${Date.now()}-${idx}`,
          name: m.name,
          unit: m.unit || 'un',
          basePrice: Number(m.basePrice) || 5000,
          quantity: Number(m.quantity) || 1,
          category: m.category || 'General',
          selected: true,
          aiCalculated: true,
          reasoning: m.reasoning || ''
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
      <div className="bg-slate-900 text-slate-100 rounded-xl p-6 border border-slate-800 text-center">
        <div className="w-10 h-10 rounded-lg bg-slate-800 text-orange-400 flex items-center justify-center mx-auto mb-3 border border-slate-700">
          <HardHat className="w-5 h-5 text-orange-400" />
        </div>
        <h3 className="font-bold text-white text-base">Asistente de Medidas y Cubicación</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
          Selecciona una partida arriba (ej. Electricidad, Cerámicas, Tabiquería) para activar el formulario técnico de obra y el plano interactivo.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm transition-all space-y-4">
      
      {/* Title Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
              <span>Cálculo Técnico de Partida y Medidas</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Define dimensiones o dibuja en el plano para calcular merma y cómputo de insumos
            </p>
          </div>
        </div>

        {/* View Mode Toggle: Formulario vs Plano 2D Konva vs Esquema CAD */}
        <div className="flex items-center space-x-1 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto flex-wrap gap-1">
          <button
            onClick={() => setViewMode('form')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'form'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Formulario</span>
          </button>
          
          <button
            onClick={() => setViewMode('canvas')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'canvas'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Plano 2D</span>
            <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-slate-300">
              Konva
            </span>
          </button>

          <button
            onClick={() => setViewMode('blueprint')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'blueprint'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Esquema CAD</span>
          </button>
        </div>
      </div>

      {/* Conditional View: FloorPlanCanvas vs InteractiveBlueprint vs Inputs Form Grid */}
      {viewMode === 'canvas' && projectType ? (
        <div className="mb-4">
          <FloorPlanCanvas
            projectType={projectType}
            quality={quality}
            currentMaterials={currentMaterials}
            measurements={measurements}
            onUpdateMeasurements={(newM) => {
              if (onUpdateMeasurements) {
                onUpdateMeasurements(newM);
              } else {
                setInternalMeasurements(newM);
              }
            }}
            onExportMaterials={(updated) => {
              if (onExportMaterials) {
                onExportMaterials(updated);
              }
            }}
            onNavigateToBudget={() => setViewMode('form')}
          />
        </div>
      ) : viewMode === 'blueprint' ? (
        <div className="mb-4">
          <InteractiveBlueprint
            projectType={projectType}
            measurements={measurements}
            onUpdateMeasurements={(newMeasurements) => {
              if (onUpdateMeasurements) {
                onUpdateMeasurements(newMeasurements);
              } else {
                setInternalMeasurements(newMeasurements);
              }
            }}
            onSyncAndRecalculate={handleCalculateWithAI}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {questions.map((q) => (
              <div key={q.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {q.label}
                </label>
                {q.type === 'select' ? (
                  <select
                    value={measurements[q.id] ?? q.defaultValue ?? ''}
                    onChange={(e) => handleInputChange(q.id, e.target.value, true)}
                    className="w-full p-2.5 text-xs font-semibold border border-slate-700 rounded-md bg-slate-900 text-white focus:border-blue-500 outline-none cursor-pointer"
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
                      min={q.isInteger ? (q.min !== undefined ? q.min : 0) : 0}
                      step={q.isInteger ? "1" : "0.1"}
                      value={measurements[q.id] ?? ''}
                      onChange={(e) => handleInputChange(q.id, e.target.value, false)}
                      onKeyDown={(e) => {
                        if (q.isInteger && (e.key === '.' || e.key === ',' || e.key === 'e' || e.key === 'E')) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="0"
                      className="w-full p-2 text-xs font-mono tabular-nums font-bold border border-slate-700 rounded-md bg-slate-900 text-white focus:border-blue-500 outline-none"
                    />
                    <div className="flex items-center space-x-1 shrink-0">
                      <span className="text-xs font-mono font-medium px-2 py-1.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                        {q.unit}
                      </span>
                      {q.isInteger ? (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/30" title="Artefacto: número entero">
                          Entero
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-500/30" title="Medida: permite decimales">
                          Decimal
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {q.helpText && (
                  <p className="mt-1 text-[11px] text-slate-400 leading-snug">
                    {q.helpText}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Bloque de Parámetros Resultantes y Acceso al Plano 2D */}
          {spaceInfo && (
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">
                    Superficie Paramétrica Dedicada
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Cálculo geométrico deducido para el plano de {spaceInfo.roomName}
                  </p>
                </div>
                
                {/* Medidas resultantes */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="text-xs font-mono tabular-nums font-bold px-2.5 py-1 bg-slate-900 text-orange-400 border border-slate-700 rounded">
                    {spaceInfo.length.toFixed(1)}m × {spaceInfo.width.toFixed(1)}m ({spaceInfo.area.toFixed(1)} m²)
                  </span>
                </div>
              </div>

              {/* Artefactos calculados */}
              <div>
                <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                  Artefactos estimados para faena ({spaceInfo.artifacts.reduce((acc, a) => acc + a.count, 0)} unidades):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {spaceInfo.artifacts.map(art => (
                    <span 
                      key={art.type} 
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-200 font-mono"
                    >
                      <span className="text-orange-400 font-bold">{art.count}</span>
                      <span className="font-sans text-slate-300">{art.label}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Botón de Entrada al Plano */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenCanvasTab) {
                      onOpenCanvasTab();
                    } else {
                      setViewMode('canvas');
                    }
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-blue-950 transition-all cursor-pointer text-xs"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Abrir Plano 2D y Ubicar Puntos de Instalación</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions: Construction Orange & Sober Slate */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
        <button
          onClick={handleCalculateWithAI}
          disabled={isLoading || !isFormValid}
          className="flex-1 flex items-center justify-center space-x-2 font-bold py-3 px-4 rounded-lg shadow-sm bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950 transition-all cursor-pointer text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : isPro ? (
            <Crown className="w-4 h-4 text-amber-200" />
          ) : !isAuthenticated ? (
            <Sparkles className="w-4 h-4 text-amber-200" />
          ) : tokens < TOKEN_COSTS.AI_CALCULATION ? (
            <Lock className="w-4 h-4 text-amber-200" />
          ) : (
            <Brain className="w-4 h-4" />
          )}
          <span>
            {isLoading 
              ? 'Cubicando con IA...' 
              : isPro
              ? 'Calcular Insumos con IA (PRO)'
              : !isAuthenticated
              ? 'Iniciar y Calcular con IA (+50 Tokens)'
              : tokens < TOKEN_COSTS.AI_CALCULATION
              ? 'Tokens Agotados'
              : `Calcular con IA Gemini (-${TOKEN_COSTS.AI_CALCULATION} tokens)`}
          </span>
        </button>

        <button
          onClick={onApplyBasicMaterials}
          className="flex-1 flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-3 px-4 rounded-lg border border-slate-700 transition-all cursor-pointer text-xs"
        >
          <ListChecks className="w-4 h-4 text-slate-400" />
          <span>Cargar Lista Estándar</span>
        </button>
      </div>

      {/* Loading animation state */}
      {isLoading && (
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-orange-400">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-xs font-bold">{loadingSteps[loadingStep]}</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Optimizando rendimientos y tolerancias chilenas...
          </p>
        </div>
      )}

      {/* Error / Warning Alert */}
      {errorMsg && (
        <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-200 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI Output Card with Reflective Safety / SEC Styling */}
      {aiResult && !isLoading && (
        <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 space-y-3 shadow-inner">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <CheckCircle className="w-4 h-4" />
              <span>Cálculo optimizado de partida completado</span>
            </div>
            <span className="text-[11px] font-mono text-slate-300 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">
              {aiResult.materials.length} insumos cargados
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Technical Advice Box - Cobalt Blue Border */}
            {aiResult.technicalAdvice && (
              <div className="flex items-start space-x-2 bg-slate-900 p-3 rounded-lg border border-blue-500/40 text-slate-200">
                <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-400 block mb-0.5">Norma / Recomendación Técnica:</span>
                  <p className="leading-relaxed text-slate-300">{aiResult.technicalAdvice}</p>
                </div>
              </div>
            )}

            {/* High-Attention Reflective Safety Note (SEC / NCh Alert) */}
            {aiResult.safetyNote && (
              <div className="flex items-start space-x-2 bg-slate-900 p-3 rounded-lg border-2 border-reflective text-slate-200">
                <div className="shrink-0 mt-0.5">
                  <span className="badge-reflective text-[9px] px-1.5 py-0.5 rounded-xs inline-flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 stroke-[3]" />
                    NORMATIVA SEC Y SEGURIDAD
                  </span>
                </div>
                <div>
                  <p className="leading-relaxed text-slate-200 font-medium mt-0.5">{aiResult.safetyNote}</p>
                </div>
              </div>
            )}

            {/* Savings Tip - Construction Amber */}
            {aiResult.savingTips && (
              <div className="flex items-start space-x-2 bg-slate-900 p-3 rounded-lg border border-amber-500/30 text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-400 block mb-0.5">Optimización de Costos:</span>
                  <p className="leading-relaxed text-slate-300">{aiResult.savingTips}</p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls: Back to measurements or Back to Main Page */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAiResult(null);
                if (onResetToInitial) onResetToInitial();
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
              <span>Modificar Medidas</span>
            </button>

            {onGoBackToHome && (
              <button
                type="button"
                onClick={onGoBackToHome}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-sm shadow-blue-950"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-white" />
                <span>Volver a la Página Principal</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
