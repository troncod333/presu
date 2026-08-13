import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Supplier, ProjectType } from '../types';
import { AREA_COLORS } from '../data/chileData';
import { 
  MapPin, 
  Search, 
  Crosshair, 
  Trash2, 
  Plus, 
  Store, 
  Navigation, 
  Phone,
  AlertCircle,
  X
} from 'lucide-react';

interface LocationAndMapPanelProps {
  projectAddress: string;
  onAddressChange: (address: string) => void;
  projectLocation: { lat: number; lng: number } | null;
  onLocationChange: (loc: { lat: number; lng: number } | null) => void;
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;
  onFindSuppliers: () => void;
}

export const LocationAndMapPanel: React.FC<LocationAndMapPanelProps> = ({
  projectAddress,
  onAddressChange,
  projectLocation,
  onLocationChange,
  suppliers,
  onAddSupplier,
  onFindSuppliers
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const locationMarkerRef = useRef<L.Marker | null>(null);
  const supplierMarkersRef = useRef<L.Marker[]>([]);

  const [searchQuery, setSearchQuery] = useState(projectAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Supplier Form State
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreAddress, setNewStoreAddress] = useState('');
  const [newStorePhone, setNewStorePhone] = useState('');
  const [newStoreSpecialties, setNewStoreSpecialties] = useState('');
  const [newStoreArea, setNewStoreArea] = useState<ProjectType | 'general'>('general');

  // Default coordinates: Santiago / Cerrillos, Chile
  const defaultLat = -33.4845;
  const defaultLng = -70.7156;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (leafletMapRef.current) return; // Map already initialized

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([defaultLat, defaultLng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Click handler on map to drop project pin
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      updateProjectPin(lat, lng, 'Ubicación seleccionada en el mapa');
    });

    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update supplier markers on map
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Clear previous supplier markers
    supplierMarkersRef.current.forEach(m => map.removeLayer(m));
    supplierMarkersRef.current = [];

    suppliers.forEach((s) => {
      const color = AREA_COLORS[s.area] || '#6B7280';
      const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M14 0C8.5 0 4 4.5 4 10c0 8.5 10 22 10 22s10-13.5 10-22C24 4.5 19.5 0 14 0zm0 15c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/>
        </svg>
      `;

      const customIcon = L.icon({
        iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -32]
      });

      const popupHtml = `
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #1f2937; font-size: 13px;">${s.name}</strong><br/>
          <span style="font-size: 11px; color: #4b5563;">📍 ${s.address}</span><br/>
          <span style="font-size: 11px; color: #2563eb;">📞 ${s.phone}</span>
        </div>
      `;

      const marker = L.marker([s.lat, s.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupHtml);

      supplierMarkersRef.current.push(marker);
    });
  }, [suppliers]);

  // Update pin helper
  const updateProjectPin = (lat: number, lng: number, desc: string) => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (locationMarkerRef.current) {
      map.removeLayer(locationMarkerRef.current);
    }

    const pinIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
    marker.bindPopup(`<strong>📍 Ubicación de Obra</strong><br/>${desc}`).openPopup();
    locationMarkerRef.current = marker;

    map.setView([lat, lng], 14);

    onLocationChange({ lat, lng });
    setStatusMsg(`✅ Ubicación fijada: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  // Search Address via Nominatim
  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatusMsg('Buscando dirección en Chile...');

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery + ', Chile'
      )}&limit=1`;

      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const displayName = data[0].display_name;

        onAddressChange(displayName);
        setSearchQuery(displayName);
        updateProjectPin(lat, lng, displayName);
      } else {
        setStatusMsg('❌ Dirección no encontrada. Intenta con calle, número y comuna.');
      }
    } catch (err) {
      setStatusMsg('❌ Error de conexión al buscar dirección.');
    } finally {
      setIsSearching(false);
    }
  };

  // Get User Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg('❌ Tu navegador no soporta geolocalización.');
      return;
    }

    setStatusMsg('📍 Obteniendo tu ubicación actual...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const desc = 'Tu ubicación GPS actual';

        setSearchQuery(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        onAddressChange(`Ubicación GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
        updateProjectPin(lat, lng, desc);
      },
      () => {
        setStatusMsg('❌ No se pudo obtener la ubicación GPS.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Clear location
  const handleClearLocation = () => {
    if (locationMarkerRef.current && leafletMapRef.current) {
      leafletMapRef.current.removeLayer(locationMarkerRef.current);
      locationMarkerRef.current = null;
    }
    onLocationChange(null);
    onAddressChange('');
    setSearchQuery('');
    setStatusMsg('');
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([defaultLat, defaultLng], 12);
    }
  };

  // Save new hardware store
  const handleSaveSupplier = () => {
    if (!newStoreName.trim() || !newStoreAddress.trim()) {
      alert('Por favor ingresa el nombre y dirección de la ferretería.');
      return;
    }

    const baseLat = projectLocation ? projectLocation.lat : defaultLat;
    const baseLng = projectLocation ? projectLocation.lng : defaultLng;

    const newSupplier: Supplier = {
      id: `supp_${Date.now()}`,
      name: newStoreName,
      address: newStoreAddress,
      phone: newStorePhone || '+56 9 1234 5678',
      lat: baseLat + (Math.random() - 0.5) * 0.02,
      lng: baseLng + (Math.random() - 0.5) * 0.02,
      area: newStoreArea,
      rating: 4.8,
      specialties: newStoreSpecialties || 'Atención personalizada local'
    };

    onAddSupplier(newSupplier);

    // Reset form
    setNewStoreName('');
    setNewStoreAddress('');
    setNewStorePhone('');
    setNewStoreSpecialties('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>📍</span> Ubicación y Proveedores Cercanos
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Define la dirección de la obra para calcular flete y cotizar en ferreterías locales
          </p>
        </div>
      </div>

      {/* Address Search Bar */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchAddress()}
            placeholder="Ej: Av. Pajaritos 2500, Maipú o haz clic en el mapa..."
            className="w-full p-3 pr-12 text-xs font-medium border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSearchAddress}
            disabled={isSearching}
            className="absolute right-2 p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Buscar dirección"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleGetLocation}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors text-xs font-semibold cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>📍 Mi Ubicación GPS</span>
          </button>

          <button
            onClick={handleClearLocation}
            className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-200 transition-colors text-xs font-semibold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar Mapa</span>
          </button>
        </div>

        {statusMsg && (
          <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
            {statusMsg}
          </p>
        )}
      </div>

      {/* Leaflet Map Container */}
      <div className="relative">
        <div ref={mapContainerRef} className="map border-2 border-gray-200 dark:border-gray-700 shadow-inner" />
        
        <div className="absolute top-3 right-3 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm text-[10px] font-semibold text-gray-600 dark:text-gray-300 pointer-events-none">
          💡 Haz clic en el mapa para situar la obra
        </div>
      </div>

      {/* Category Map Legend */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-gray-600 dark:text-gray-300">
        <span className="font-bold text-gray-700 dark:text-gray-200 mr-1">Simbología:</span>
        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span> Electricidad
        </span>
        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Cámaras
        </span>
        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span> Cerámicas
        </span>
        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span> Ampliaciones
        </span>
      </div>

      {/* Supplier Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
        <button
          onClick={onFindSuppliers}
          className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-3 rounded-xl shadow-sm transition-all cursor-pointer text-xs"
        >
          <Search className="w-4 h-4" />
          <span>🔍 Buscar Precios en Proveedores</span>
        </button>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center space-x-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 font-bold p-3 rounded-xl transition-all cursor-pointer text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>➕ Agregar Ferretería Local</span>
        </button>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700 shadow-xl space-y-4 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Registrar Proveedor / Ferretería Local
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Nombre del Local / Ferretería</label>
                <input
                  type="text"
                  placeholder="Ej: Ferretería Don Carlos"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Dirección Completa</label>
                <input
                  type="text"
                  placeholder="Ej: Av. San Martín 1420, Santiago"
                  value={newStoreAddress}
                  onChange={(e) => setNewStoreAddress(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Teléfono o WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+56 9 8765 4321"
                    value={newStorePhone}
                    onChange={(e) => setNewStorePhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Especialidad</label>
                  <select
                    value={newStoreArea}
                    onChange={(e) => setNewStoreArea(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="general">Ferretería General</option>
                    <option value="electricidad">Electricidad</option>
                    <option value="ceramicas">Cerámicas y Pisos</option>
                    <option value="ampliaciones">Obra Gruesa</option>
                    <option value="gasfiteria">Gasfitería</option>
                    <option value="pintura">Pinturas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Notas / Marcas de Interés</label>
                <textarea
                  placeholder="Descuentos por compras sobre $100.000, despacho a domicilio gratis, etc."
                  value={newStoreSpecialties}
                  onChange={(e) => setNewStoreSpecialties(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-xs hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSupplier}
                className="flex-1 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Guardar Proveedor
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
