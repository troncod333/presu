import React, { useState } from 'react';
import { Supplier } from '../types';
import { MapPin, Navigation, Store, Plus, ExternalLink, Compass, Truck } from 'lucide-react';

interface LocationAndMapPanelProps {
  projectAddress: string;
  onAddressChange: (newAddress: string) => void;
  projectLocation: { lat: number; lng: number } | null;
  onLocationChange: (loc: { lat: number; lng: number }) => void;
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;
  onFindSuppliers: () => void;
}

const COMMON_ADDRESSES = [
  { label: 'Cerrillos, Santiago', address: 'Av. Pedro Aguirre Cerda 6800, Cerrillos, Región Metropolitana', lat: -33.4845, lng: -70.7156 },
  { label: 'Maipú Centro, Santiago', address: 'Av. Pajaritos 2200, Maipú, Región Metropolitana', lat: -33.5100, lng: -70.7550 },
  { label: 'Providencia / Las Condes', address: 'Av. Providencia 2100, Providencia, Región Metropolitana', lat: -33.4240, lng: -70.6120 },
  { label: 'San Bernardo / Sur', address: 'Gran Avenida 11500, San Bernardo, Región Metropolitana', lat: -33.5850, lng: -70.6980 },
  { label: 'Viña del Mar / Valparaíso', address: 'Av. Libertad 850, Viña del Mar, Región de Valparaíso', lat: -33.0180, lng: -71.5510 },
  { label: 'Concepción Centro', address: 'Av. O Higgins 700, Concepción, Región del Biobío', lat: -36.8270, lng: -73.0500 }
];

export const LocationAndMapPanel: React.FC<LocationAndMapPanelProps> = ({
  projectAddress,
  onAddressChange,
  projectLocation,
  onLocationChange,
  suppliers,
  onAddSupplier,
  onFindSuppliers
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const [newSupName, setNewSupName] = useState('');
  const [newSupChain, setNewSupChain] = useState<'Sodimac' | 'Easy' | 'Construmart' | 'Chilemat' | 'Imperial' | 'Local'>('Local');
  const [newSupAddress, setNewSupAddress] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('+56 9 ');
  const [newSupDist, setNewSupDist] = useState('2.0');

  const handleSelectPreset = (preset: typeof COMMON_ADDRESSES[0]) => {
    onAddressChange(preset.address);
    onLocationChange({ lat: preset.lat, lng: preset.lng });
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName.trim()) return;

    const newSup: Supplier = {
      id: `sup_custom_${Date.now()}`,
      name: newSupName,
      chain: newSupChain,
      address: newSupAddress || 'Dirección local',
      distanceKm: parseFloat(newSupDist) || 2.5,
      phone: newSupPhone || '+56 9 1234 5678',
      rating: 4.8,
      lat: (projectLocation?.lat || -33.48) + 0.01,
      lng: (projectLocation?.lng || -70.71) + 0.01,
      discountPercent: 5
    };

    onAddSupplier(newSup);
    setShowAddModal(false);
    setNewSupName('');
    setNewSupAddress('');
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-xs">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">
              Ubicación de Faena y Logística
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cálculo de flete y radio de distribución de ferreterías en Chile
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer border border-slate-700"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Ferretería Local</span>
        </button>
      </div>

      {/* Address Input & Presets */}
      <div className="space-y-2">
        <div className="relative">
          <MapPin className="w-4 h-4 text-orange-400 absolute left-3 top-3" />
          <input
            type="text"
            value={projectAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Ingresa dirección de la obra (ej. Av. Pajaritos 1500, Maipú)..."
            className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Quick Commune Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400 font-semibold mr-1">Rápidos:</span>
          {COMMON_ADDRESSES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => handleSelectPreset(preset)}
              className="text-[11px] px-2 py-0.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-medium transition cursor-pointer font-mono"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Mobile Radar / Stores Toggle Button */}
        <div className="sm:hidden pt-1">
          <button
            type="button"
            onClick={() => setMobileExpanded(!mobileExpanded)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 active:bg-slate-800"
          >
            <span className="flex items-center gap-1.5 text-blue-400">
              <Navigation className="w-3.5 h-3.5" />
              <span>{mobileExpanded ? 'Ocultar Cobertura Ferretera' : 'Ver Radar y Locales Cercanos'}</span>
            </span>
            <span className="text-[10px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-slate-400">
              {suppliers.length} ferreterías {mobileExpanded ? '▲' : '▼'}
            </span>
          </button>
        </div>
      </div>

      {/* Radar and Suppliers Container: Always visible on desktop (sm:space-y-4), toggleable on mobile */}
      <div className={`${mobileExpanded ? 'space-y-4' : 'hidden'} sm:block sm:space-y-4 animate-in fade-in duration-150`}>
        
        {/* Visual Map / Radar Widget */}
        <div className="bg-slate-950 rounded-lg p-3.5 border border-slate-800 text-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-blue-400">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Radio de Cobertura Ferretera (GPS Santiago / Regiones)</span>
            </div>
            <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">
              {suppliers.length} distribuidores
            </span>
          </div>

        {/* Simulated Map Schematic */}
        <div className="h-32 bg-[#0b0f17] rounded border border-slate-800/80 relative flex items-center justify-center overflow-hidden">
          {/* Radar circle rings */}
          <div className="absolute w-24 h-24 rounded-full border border-blue-500/20" />
          <div className="absolute w-48 h-48 rounded-full border border-blue-500/10" />
          <div className="absolute w-64 h-64 rounded-full border border-blue-500/5" />

          {/* Center Pin: Project (Construction Orange) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-3.5 h-3.5 rounded-full bg-orange-500 ring-4 ring-orange-500/30" />
            <span className="text-[9px] font-bold text-orange-300 bg-slate-950 px-1.5 py-0.2 rounded mt-1 border border-slate-800">
              Tu Obra
            </span>
          </div>

          {/* Supplier Pins positioned around */}
          {suppliers.slice(0, 5).map((sup, idx) => {
            const angles = [30, 110, 200, 290, 340];
            const angle = angles[idx % angles.length] * (Math.PI / 180);
            const dist = 35 + (idx * 9);
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;

            return (
              <div
                key={sup.id}
                style={{ transform: `translate(${x}px, ${y}px)` }}
                className="absolute flex flex-col items-center group cursor-pointer"
                title={`${sup.name} (${sup.distanceKm} km)`}
              >
                <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-slate-800 text-[8px] flex items-center justify-center font-bold text-white shadow-xs">
                  {sup.chain[0]}
                </div>
                <span className="text-[8px] text-slate-300 bg-slate-950 px-1 rounded whitespace-nowrap opacity-80 group-hover:opacity-100 border border-slate-800">
                  {sup.chain} ({sup.distanceKm}km)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nearest Suppliers List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Distribuidores y Ferreterías Cercanas
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suppliers.slice(0, 4).map((s) => (
            <div
              key={s.id}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/70 flex items-start justify-between text-xs"
            >
              <div>
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-blue-400" />
                  <span>{s.name}</span>
                </div>
                <span className="text-[11px] text-slate-400 block line-clamp-1 mt-0.5">
                  {s.address}
                </span>
                <div className="flex items-center space-x-2 mt-1 text-[10px] font-mono">
                  <span className="font-semibold text-slate-300">
                    📍 {s.distanceKm} km
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-amber-400 font-bold">
                    ★ {s.rating}
                  </span>
                  {s.discountPercent && (
                    <span className="text-orange-400 font-bold">
                      (-{s.discountPercent}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Add Custom Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl p-5 max-w-md w-full border border-slate-800 shadow-2xl space-y-4 text-slate-100">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-500" />
              <span>Registrar Ferretería o Distribuidor Local</span>
            </h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nombre de la Ferretería / Local:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ferretería Los Aromos"
                  value={newSupName}
                  onChange={(e) => setNewSupName(e.target.value)}
                  className="w-full p-2 border border-slate-700 rounded-md bg-slate-950 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Cadena o Tipo:
                  </label>
                  <select
                    value={newSupChain}
                    onChange={(e: any) => setNewSupChain(e.target.value)}
                    className="w-full p-2 border border-slate-700 rounded-md bg-slate-950 text-white outline-none focus:border-blue-500"
                  >
                    <option value="Local">Ferretería Local / Barrio</option>
                    <option value="Chilemat">Chilemat</option>
                    <option value="Sodimac">Sodimac</option>
                    <option value="Easy">Easy</option>
                    <option value="Construmart">Construmart</option>
                    <option value="Imperial">Imperial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Distancia aproximada (km):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newSupDist}
                    onChange={(e) => setNewSupDist(e.target.value)}
                    className="w-full p-2 border border-slate-700 rounded-md bg-slate-950 text-white outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Dirección:
                </label>
                <input
                  type="text"
                  placeholder="Calle y comuna..."
                  value={newSupAddress}
                  onChange={(e) => setNewSupAddress(e.target.value)}
                  className="w-full p-2 border border-slate-700 rounded-md bg-slate-950 text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-bold"
                >
                  Guardar Ferretería
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
