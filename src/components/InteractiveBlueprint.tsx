import React, { useState } from 'react';
import { ProjectType } from '../types';
import { calculateSpaceAndArtifacts } from '../utils/spaceCalculator';
import { Compass, Sparkles, ZoomIn, ZoomOut, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface InteractiveBlueprintProps {
  projectType: ProjectType;
  measurements: Record<string, any>;
  onUpdateMeasurements: (newMeasurements: Record<string, any>) => void;
  onSyncAndRecalculate: () => void;
}

export const InteractiveBlueprint: React.FC<InteractiveBlueprintProps> = ({
  projectType,
  measurements,
  onUpdateMeasurements,
  onSyncAndRecalculate
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const spaceInfo = calculateSpaceAndArtifacts(projectType, measurements);

  const length = Number(measurements.length) || spaceInfo.length;
  const width = Number(measurements.width) || spaceInfo.width;
  const area = width * length;
  const perimeter = (width + length) * 2;

  const handleAdjust = (field: string, delta: number) => {
    const currentVal = Number(measurements[field]) || (field === 'length' ? length : width);
    const nextVal = Math.max(1.0, Math.min(30.0, Math.round((currentVal + delta) * 10) / 10));
    onUpdateMeasurements({
      ...measurements,
      [field]: nextVal
    });
  };

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 360;
  const scale = Math.min((svgWidth - 120) / width, (svgHeight - 100) / length) * zoomLevel;

  const roomW = width * scale;
  const roomH = length * scale;
  const startX = (svgWidth - roomW) / 2;
  const startY = (svgHeight - roomH) / 2;

  // High Attention condition: Large space or high load electrical/structural requirement
  const isHighAttentionArea = area >= 25 || projectType === 'electricidad' || projectType === 'ampliacion';

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-sm relative overflow-hidden font-sans">
      {/* CAD Header Controls */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
            <Compass className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Plano Técnico Vectorial · {spaceInfo.roomName}</span>
              {isHighAttentionArea && (
                <span className="badge-reflective text-[8px] px-1 py-0.2 rounded-xs">
                  FAENA ACTIVA
                </span>
              )}
            </h4>
            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
              {width.toFixed(2)}m × {length.toFixed(2)}m = <strong className="text-orange-400">{area.toFixed(2)} m²</strong> · Perímetro: {perimeter.toFixed(2)} m
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.15))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition cursor-pointer border border-slate-700"
            title="Alejar Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.8, prev + 0.15))}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition cursor-pointer border border-slate-700"
            title="Acercar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition cursor-pointer border border-slate-700"
            title="Restablecer Escala"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onSyncAndRecalculate}
            className="flex items-center space-x-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-bold shadow-sm shadow-orange-950 cursor-pointer active:scale-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Recalcular Partida</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas with Sober Architectural Slate Grid */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-2 relative flex items-center justify-center overflow-auto shadow-inner">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full max-h-[340px] select-none"
        >
          {/* Blueprint Grid Pattern */}
          <defs>
            <pattern id="cadGridSober" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a2332" strokeWidth="0.75" />
            </pattern>
            <pattern id="cadMajorGridSober" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#25354d" strokeWidth="1.2" opacity="0.4" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width={svgWidth} height={svgHeight} fill="url(#cadGridSober)" />
          <rect width={svgWidth} height={svgHeight} fill="url(#cadMajorGridSober)" />

          {/* Room Area Fill - Sober Deep Cobalt Surface */}
          <rect
            x={startX}
            y={startY}
            width={roomW}
            height={roomH}
            fill="#1e3a5f"
            fillOpacity="0.18"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeDasharray="none"
          />

          {/* Architectural Diagonal Alignment Guides */}
          <line x1={startX} y1={startY} x2={startX + roomW} y2={startY + roomH} stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.25" />
          <line x1={startX + roomW} y1={startY} x2={startX} y2={startY + roomH} stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.25" />

          {/* Dimension Label Top (Width) - Vivid Cobalt Blue Line */}
          <line x1={startX} y1={startY - 18} x2={startX + roomW} y2={startY - 18} stroke="#2563eb" strokeWidth="1.5" />
          <line x1={startX} y1={startY - 25} x2={startX} y2={startY - 11} stroke="#2563eb" strokeWidth="1.5" />
          <line x1={startX + roomW} y1={startY - 25} x2={startX + roomW} y2={startY - 11} stroke="#2563eb" strokeWidth="1.5" />
          <text
            x={startX + roomW / 2}
            y={startY - 24}
            fill="#60a5fa"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
          >
            ↔ {width.toFixed(2)} m (Ancho)
          </text>

          {/* Dimension Label Left (Length) - Construction Orange Line */}
          <line x1={startX - 18} y1={startY} x2={startX - 18} y2={startY + roomH} stroke="#ea580c" strokeWidth="1.5" />
          <line x1={startX - 25} y1={startY} x2={startX - 11} y2={startY} stroke="#ea580c" strokeWidth="1.5" />
          <line x1={startX - 25} y1={startY + roomH} x2={startX - 11} y2={startY + roomH} stroke="#ea580c" strokeWidth="1.5" />
          <text
            x={startX - 26}
            y={startY + roomH / 2}
            fill="#fb923c"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
            fontWeight="bold"
            transform={`rotate(-90 ${startX - 26} ${startY + roomH / 2})`}
          >
            ↕ {length.toFixed(2)} m (Largo)
          </text>

          {/* Center Info Plaque - Sober Technical Plate */}
          <g transform={`translate(${startX + roomW / 2}, ${startY + roomH / 2})`}>
            <rect x="-65" y="-22" width="130" height="44" rx="4" fill="#0b0f17" stroke="#334155" strokeWidth="1.5" opacity="0.95" />
            <text x="0" y="-4" fill="#f1f5f9" fontSize="11" fontWeight="bold" textAnchor="middle">
              {spaceInfo.roomName}
            </text>
            <text x="0" y="14" fill="#f97316" fontSize="12" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
              {area.toFixed(2)} m²
            </text>
          </g>

          {/* High Attention Reflective Safety / SEC Marker (Top-Right Corner) */}
          {isHighAttentionArea && (
            <g transform={`translate(${startX + roomW - 35}, ${startY + 20})`}>
              <circle cx="0" cy="0" r="12" fill="#ccff00" stroke="#0b0f17" strokeWidth="1.5" />
              <text x="0" y="4" fill="#0b0f17" fontSize="10" fontWeight="900" textAnchor="middle">!</text>
              <text x="0" y="22" fill="#ccff00" fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                SEC / NCh
              </text>
            </g>
          )}

          {/* Access Door Symbol at bottom */}
          <path
            d={`M ${startX + 30} ${startY + roomH} A 30 30 0 0 1 ${startX + 60} ${startY + roomH - 30}`}
            fill="none"
            stroke="#22c55e"
            strokeWidth="1.8"
            strokeDasharray="3 2"
          />
          <line x1={startX + 30} y1={startY + roomH} x2={startX + 60} y2={startY + roomH - 30} stroke="#22c55e" strokeWidth="2" />
          <text x={startX + 65} y={startY + roomH - 12} fill="#4ade80" fontSize="9" fontWeight="bold">Puerta Acceso</text>

          {/* Window Symbol at top */}
          <rect x={startX + roomW / 2 - 25} y={startY - 3} width="50" height="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
          <text x={startX + roomW / 2} y={startY + 15} fill="#fbbf24" fontSize="9" textAnchor="middle">Ventana</text>
        </svg>
      </div>

      {/* Quick Adjust Buttons - Cobalt & Orange Interactivity */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2 pt-2 border-t border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-400">Ajustar Ancho:</span>
          <button
            onClick={() => handleAdjust('width', -0.5)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono font-bold cursor-pointer border border-slate-700"
          >
            -0.5m
          </button>
          <span className="font-mono tabular-nums text-blue-400 font-bold">{width.toFixed(1)}m</span>
          <button
            onClick={() => handleAdjust('width', 0.5)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono font-bold cursor-pointer border border-slate-700"
          >
            +0.5m
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-400">Ajustar Largo:</span>
          <button
            onClick={() => handleAdjust('length', -0.5)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono font-bold cursor-pointer border border-slate-700"
          >
            -0.5m
          </button>
          <span className="font-mono tabular-nums text-orange-400 font-bold">{length.toFixed(1)}m</span>
          <button
            onClick={() => handleAdjust('length', 0.5)}
            className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono font-bold cursor-pointer border border-slate-700"
          >
            +0.5m
          </button>
        </div>
      </div>
    </div>
  );
};
