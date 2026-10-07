import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Line, Text, Group, Arc, Arrow } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { ProjectType, MaterialItem, QualityTier } from '../types';
import { calculateSpaceAndArtifacts, buildLayoutFromSpaceParams, SpaceDimensions, RoomInfo } from '../utils/spaceCalculator';
import { 
  DoorOpen, 
  Trash2, 
  RotateCw, 
  Sparkles, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Grid, 
  Download, 
  Plus, 
  Minus,
  Move, 
  PenTool, 
  MousePointer, 
  Maximize2,
  RefreshCw,
  Layers,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Calculator,
  ArrowLeft,
  Ruler,
  Scale,
  Settings2,
  Crosshair,
  Info,
  X
} from 'lucide-react';

export type CanvasItemType = 
  | 'door'
  | 'door_double'
  | 'window'
  | 'outlet'
  | 'switch'
  | 'light'
  | 'panel_tda'
  | 'force_circuit'
  | 'camera_ext'
  | 'camera_int'
  | 'nvr'
  | 'monitor'
  | 'junction_box'
  | 'wc'
  | 'sink'
  | 'shower'
  | 'kitchen_sink'
  | 'water_valve'
  | 'calefont'
  | 'column'
  | 'stud_post';

export interface CanvasPlacedItem {
  id: string;
  type: CanvasItemType;
  label: string;
  x: number;
  y: number;
  rotation: number; // in degrees: 0, 90, 180, 270
}

export interface WallSegment {
  id: string;
  points: number[]; // [x1, y1, x2, y2]
}

interface FloorPlanCanvasProps {
  projectType: ProjectType;
  quality?: QualityTier;
  currentMaterials: MaterialItem[];
  measurements?: Record<string, any>;
  onUpdateMeasurements?: (newMeasurements: Record<string, any>) => void;
  onExportMaterials: (updatedMaterials: MaterialItem[]) => void;
  onNavigateToBudget?: () => void;
  className?: string;
}

interface ItemDefinition {
  type: CanvasItemType;
  label: string;
  category: string;
  badge: string;
  color: string;
  description: string;
  defaultMaterials: Array<{
    name: string;
    unit: string;
    basePrice: number;
    qtyPerItem: number;
    category: string;
  }>;
}

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  projectType,
  quality = 'medio',
  currentMaterials,
  measurements = {},
  onUpdateMeasurements,
  onExportMaterials,
  onNavigateToBudget,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 700, height: 480 });
  const [zoom, setZoom] = useState<number>(1);
  const [activeTool, setActiveTool] = useState<CanvasItemType | 'select' | 'wall' | 'calibrate'>('door');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [themeMode, setThemeMode] = useState<'blueprint' | 'dark' | 'light'>('blueprint');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Placed elements & walls
  const [items, setItems] = useState<CanvasPlacedItem[]>([]);
  const [walls, setWalls] = useState<WallSegment[]>([]);
  const [drawingWall, setDrawingWall] = useState<number[] | null>(null);

  // Scale & Calibration Configuration state
  // Default reference: 100px = 1.0 metro (as requested in brief: "ej. 100px = 1 metro")
  const [scalePixels, setScalePixels] = useState<number>(() => Number(measurements?.scalePixels) || 100);
  const [scaleMeters, setScaleMeters] = useState<number>(() => Number(measurements?.scaleMeters) || 1.0);
  const [wallHeight, setWallHeight] = useState<number>(() => Number(measurements?.wallHeight) || 2.4);
  const [showScaleModal, setShowScaleModal] = useState<boolean>(false);

  // Calibration Ruler tool state
  const [calibrationPoints, setCalibrationPoints] = useState<number[] | null>(null);
  const [calibratingDistancePx, setCalibratingDistancePx] = useState<number | null>(null);
  const [calibrationModalOpen, setCalibrationModalOpen] = useState<boolean>(false);
  const [calibrationInputMeters, setCalibrationInputMeters] = useState<string>('1.0');

  // Dynamic Scale: pixels per 1.0 real meter
  const pixelsPerMeter = useMemo(() => {
    const px = Math.max(1, scalePixels);
    const m = Math.max(0.01, scaleMeters);
    return Math.max(5, px / m);
  }, [scalePixels, scaleMeters]);

  // Magnetic grid lines (representing 0.5m increments at active scale)
  const gridSize = useMemo(() => {
    return Math.max(10, Math.round(pixelsPerMeter / 2));
  }, [pixelsPerMeter]);

  // Initial space parameters derived from user form measurements
  const initialSpace = useMemo(() => {
    return calculateSpaceAndArtifacts(projectType, measurements);
  }, [projectType, measurements]);

  const [roomLength, setRoomLength] = useState<number>(initialSpace.length);
  const [roomWidth, setRoomWidth] = useState<number>(initialSpace.width);

  // Sync local dimensions when measurements change from exterior
  useEffect(() => {
    setRoomLength(initialSpace.length);
    setRoomWidth(initialSpace.width);
  }, [initialSpace.length, initialSpace.width]);

  // Responsive dimensions using ResizeObserver as instructed in guidelines
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let timeoutId: NodeJS.Timeout;
    const observer = new ResizeObserver((entries) => {
      // Debounce resize updates for performance on rapid window resizing
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        for (const entry of entries) {
          const { width } = entry.contentRect;
          if (width > 0) {
            // Keep roughly 4:3 or 16:10 aspect ratio
            const calculatedHeight = Math.max(420, Math.min(620, Math.round(width * 0.65)));
            setDimensions({
              width: Math.floor(width),
              height: calculatedHeight
            });
          }
        }
      }, 100);
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  // Item definitions and Chilean material mappings
  const itemCatalog: Record<CanvasItemType, ItemDefinition> = useMemo(() => ({
    door: {
      type: 'door',
      label: 'Puerta Abatible (80x200cm)',
      category: 'Accesos',
      badge: '🚪',
      color: '#f59e0b',
      description: 'Puerta de acceso o paso con hoja y radio de apertura 90°',
      defaultMaterials: [
        { name: 'Puerta Pino Oregón / Terciado 80x200cm con marco', unit: 'un', basePrice: 42000, qtyPerItem: 1, category: 'Puertas y Aberturas' },
        { name: 'Cerradura Cilindro Acceso / Embutir 3 golpes', unit: 'un', basePrice: 18500, qtyPerItem: 1, category: 'Cerrajería' },
        { name: 'Bisagras de Acero Inox 3.5" (pack x3)', unit: 'pack', basePrice: 4990, qtyPerItem: 1, category: 'Fijaciones' }
      ]
    },
    door_double: {
      type: 'door_double',
      label: 'Puerta Doble Hoja (140x200cm)',
      category: 'Accesos',
      badge: '🚪🚪',
      color: '#d97706',
      description: 'Acceso principal o mampara doble hoja abatible',
      defaultMaterials: [
        { name: 'Puerta doble hoja pino radiata 140x200cm', unit: 'un', basePrice: 85000, qtyPerItem: 1, category: 'Puertas y Aberturas' },
        { name: 'Cerradura seguridad embutida doble paleta', unit: 'un', basePrice: 28900, qtyPerItem: 1, category: 'Cerrajería' },
        { name: 'Bisagras acero 3.5" (pack x6)', unit: 'pack', basePrice: 8990, qtyPerItem: 1, category: 'Fijaciones' }
      ]
    },
    window: {
      type: 'window',
      label: 'Ventana / Ventanal (120x100cm)',
      category: 'Aberturas',
      badge: '🪟',
      color: '#06b6d4',
      description: 'Vano vidriado con doble marco y cierre hermético',
      defaultMaterials: [
        { name: 'Ventana Aluminio Línea 20 120x100cm con vidrio 4mm', unit: 'un', basePrice: 45000, qtyPerItem: 1, category: 'Ventanas y Cristales' },
        { name: 'Espuma Poliuretano expansiva para sellos 750ml', unit: 'un', basePrice: 6500, qtyPerItem: 0.5, category: 'Sellantes' },
        { name: 'Silicona neutra transparente para vanos', unit: 'un', basePrice: 4200, qtyPerItem: 1, category: 'Sellantes' }
      ]
    },
    outlet: {
      type: 'outlet',
      label: 'Enchufe Doble 10/16A (SEC RIC N°10)',
      category: 'Electricidad',
      badge: '⚡',
      color: '#eab308',
      description: 'Módulo enchufe doble con conexión a tierra de protección',
      defaultMaterials: [
        { name: 'Módulo Enchufe Doble 10/16A Bticino / Schneider', unit: 'un', basePrice: 4990, qtyPerItem: 1, category: 'Material Eléctrico' },
        { name: 'Caja Chuqui embutida metálica 58x98mm', unit: 'un', basePrice: 850, qtyPerItem: 1, category: 'Canalización' },
        { name: 'Cable EVA Libre Halógeno 2.5mm² (Rojo/Blanco/Verde)', unit: 'm', basePrice: 950, qtyPerItem: 6, category: 'Conductores' },
        { name: 'Tubería Conduit PVC 20mm tramo 3m', unit: 'tira', basePrice: 1650, qtyPerItem: 1, category: 'Canalización' }
      ]
    },
    switch: {
      type: 'switch',
      label: 'Interruptor 9/12 o 9/24 10A',
      category: 'Electricidad',
      badge: '🔘',
      color: '#10b981',
      description: 'Comando de encendido simple o combinación para alumbrado',
      defaultMaterials: [
        { name: 'Módulo Interruptor 9/12 Bticino / Schneider', unit: 'un', basePrice: 3890, qtyPerItem: 1, category: 'Material Eléctrico' },
        { name: 'Caja Chuqui embutida metálica 58x98mm', unit: 'un', basePrice: 850, qtyPerItem: 1, category: 'Canalización' },
        { name: 'Cable EVA Libre Halógeno 1.5mm² (Retorno/Fase)', unit: 'm', basePrice: 680, qtyPerItem: 4, category: 'Conductores' }
      ]
    },
    light: {
      type: 'light',
      label: 'Punto de Luz / Foco LED Cenital',
      category: 'Electricidad',
      badge: '💡',
      color: '#facc15',
      description: 'Luminaria de cielo embutida o plafón LED 18W',
      defaultMaterials: [
        { name: 'Panel / Plafón LED Embutir 18W Luz Cálida/Fría', unit: 'un', basePrice: 6990, qtyPerItem: 1, category: 'Iluminación' },
        { name: 'Caja octogonal plástica para cielo', unit: 'un', basePrice: 950, qtyPerItem: 1, category: 'Canalización' },
        { name: 'Cable EVA Libre Halógeno 1.5mm²', unit: 'm', basePrice: 680, qtyPerItem: 5, category: 'Conductores' }
      ]
    },
    panel_tda: {
      type: 'panel_tda',
      label: 'Tablero TDA General SEC',
      category: 'Electricidad',
      badge: '🛡️',
      color: '#ef4444',
      description: 'Tablero de distribución alumbrado y fuerza con automáticos y diferencial',
      defaultMaterials: [
        { name: 'Gabinete Tablero TDA Sobrepuesto/Embutir 8 Módulos IP40', unit: 'un', basePrice: 16500, qtyPerItem: 1, category: 'Protecciones' },
        { name: 'Disyuntor Termomagnético 1P 16A Legrand / Schneider', unit: 'un', basePrice: 5200, qtyPerItem: 2, category: 'Protecciones' },
        { name: 'Disyuntor Termomagnético 1P 10A Legrand / Schneider', unit: 'un', basePrice: 4900, qtyPerItem: 1, category: 'Protecciones' },
        { name: 'Interruptor Diferencial 2P 25A 30mA SEC', unit: 'un', basePrice: 19800, qtyPerItem: 1, category: 'Protecciones' },
        { name: 'Barra de tierra y neutro de cobre', unit: 'un', basePrice: 4200, qtyPerItem: 1, category: 'Protecciones' }
      ]
    },
    force_circuit: {
      type: 'force_circuit',
      label: 'Toma de Fuerza Especial (20A Horno/Lavadora)',
      category: 'Electricidad',
      badge: '🔥',
      color: '#f97316',
      description: 'Circuito dedicado de alta potencia con conductor 4mm²',
      defaultMaterials: [
        { name: 'Enchufe Industrial / Schuko 16A/20A con tapa hermética', unit: 'un', basePrice: 8900, qtyPerItem: 1, category: 'Material Eléctrico' },
        { name: 'Cable EVA Libre Halógeno 4.0mm² (Fase/Neutro/Tierra)', unit: 'm', basePrice: 1550, qtyPerItem: 10, category: 'Conductores' },
        { name: 'Automático Termomagnético 1P 20A Curva C', unit: 'un', basePrice: 5800, qtyPerItem: 1, category: 'Protecciones' }
      ]
    },
    camera_ext: {
      type: 'camera_ext',
      label: 'Cámara Exterior IP67 Bala (PoE)',
      category: 'Cámaras y Seguridad',
      badge: '📹',
      color: '#3b82f6',
      description: 'Cámara IP bala con visión nocturna IR 30m para intemperie',
      defaultMaterials: [
        { name: 'Cámara IP Bullet 4MP Exterior IP67 Dahua/Hikvision IR30m', unit: 'un', basePrice: 42900, qtyPerItem: 1, category: 'CCTV' },
        { name: 'Caja Estanca IP65 100x100mm con prensaestopas', unit: 'un', basePrice: 3200, qtyPerItem: 1, category: 'CCTV' },
        { name: 'Cable de Red UTP Cat6 100% Cobre Exterior Doble Chaqueta', unit: 'm', basePrice: 850, qtyPerItem: 25, category: 'Cableado' },
        { name: 'Conector RJ45 Macho Cat6 con bota de protección (par)', unit: 'par', basePrice: 800, qtyPerItem: 1, category: 'Conectores' }
      ]
    },
    camera_int: {
      type: 'camera_int',
      label: 'Cámara Domo Interior PoE',
      category: 'Cámaras y Seguridad',
      badge: '🎥',
      color: '#8b5cf6',
      description: 'Cámara domo fija o 360° para recintos interiores',
      defaultMaterials: [
        { name: 'Cámara IP Domo 4MP Interior con Micrófono Integrado', unit: 'un', basePrice: 38900, qtyPerItem: 1, category: 'CCTV' },
        { name: 'Cable de Red UTP Cat6 Interior Cobre', unit: 'm', basePrice: 650, qtyPerItem: 20, category: 'Cableado' },
        { name: 'Conector RJ45 Cat6 (par)', unit: 'par', basePrice: 800, qtyPerItem: 1, category: 'Conectores' }
      ]
    },
    nvr: {
      type: 'nvr',
      label: 'Grabador NVR 8CH PoE 4K',
      category: 'Cámaras y Seguridad',
      badge: '🖴',
      color: '#10b981',
      description: 'Unidad de grabación centralizada con puertos PoE y disco duro',
      defaultMaterials: [
        { name: 'Grabador NVR 8 Canales PoE 4K Dahua/Hikvision', unit: 'un', basePrice: 119000, qtyPerItem: 1, category: 'CCTV' },
        { name: 'Disco Duro Vigilancia 24/7 2TB WD Purple / Seagate Skyhawk', unit: 'un', basePrice: 68900, qtyPerItem: 1, category: 'Almacenamiento' },
        { name: 'UPS / Respaldo Eléctrico 650VA para NVR', unit: 'un', basePrice: 45000, qtyPerItem: 1, category: 'Protección Eléctrica' }
      ]
    },
    monitor: {
      type: 'monitor',
      label: 'Monitor Vigilancia 22" Full HD',
      category: 'Cámaras y Seguridad',
      badge: '🖥️',
      color: '#06b6d4',
      description: 'Pantalla de visualización continua con soporte de muro',
      defaultMaterials: [
        { name: 'Monitor LED 22" Full HD 75Hz HDMI/VGA', unit: 'un', basePrice: 79900, qtyPerItem: 1, category: 'Monitoreo' },
        { name: 'Cable HDMI 2.0 Blindado 4K 2 metros', unit: 'un', basePrice: 5900, qtyPerItem: 1, category: 'Cables' },
        { name: 'Soporte de Muro VESA 75/100 articulado', unit: 'un', basePrice: 9900, qtyPerItem: 1, category: 'Fijaciones' }
      ]
    },
    junction_box: {
      type: 'junction_box',
      label: 'Caja Estanca IP65',
      category: 'Cámaras y Seguridad',
      badge: '📦',
      color: '#64748b',
      description: 'Caja hermética de derivación y empalme',
      defaultMaterials: [
        { name: 'Caja estanca estandar IP65 100x100x50mm', unit: 'un', basePrice: 3200, qtyPerItem: 1, category: 'Cajas' }
      ]
    },
    wc: {
      type: 'wc',
      label: 'Inodoro / WC One-Piece',
      category: 'Gasfitería',
      badge: '🚽',
      color: '#0284c7',
      description: 'WC sanitario con estanque de doble descarga ecológica',
      defaultMaterials: [
        { name: 'Inodoro One-Piece Corona / Briggs 4.8L doble descarga', unit: 'un', basePrice: 78900, qtyPerItem: 1, category: 'Sanitarios' },
        { name: 'Flexible trenzado acero inox 1/2" HI-HE 30cm', unit: 'un', basePrice: 3500, qtyPerItem: 1, category: 'Grifería' },
        { name: 'Llave de paso angular cromada 1/2" x 1/2"', unit: 'un', basePrice: 4200, qtyPerItem: 1, category: 'Grifería' },
        { name: 'Sello de cera con brida para desagüe 110mm', unit: 'un', basePrice: 2800, qtyPerItem: 1, category: 'Instalaciones' },
        { name: 'Perno de anclaje WC con tarugo y tapa plástica', unit: 'par', basePrice: 1990, qtyPerItem: 1, category: 'Fijaciones' }
      ]
    },
    sink: {
      type: 'sink',
      label: 'Lavatorio / Vanitorio',
      category: 'Gasfitería',
      badge: '🚰',
      color: '#0ea5e9',
      description: 'Vanitorio con mueble o lavatorio mural y grifería monomando',
      defaultMaterials: [
        { name: 'Mueble vanitorio con lavatorio loza 50cm', unit: 'un', basePrice: 65000, qtyPerItem: 1, category: 'Mobiliario' },
        { name: 'Grifería Monomando Lavatorio Cromada Stretto / Fas', unit: 'un', basePrice: 24900, qtyPerItem: 1, category: 'Grifería' },
        { name: 'Desagüe y sifón plástico extensible 1-1/4" a 40mm', unit: 'un', basePrice: 4800, qtyPerItem: 1, category: 'Desagües' },
        { name: 'Flexibles de agua fría y caliente 1/2" (par)', unit: 'par', basePrice: 6500, qtyPerItem: 1, category: 'Flexibles' }
      ]
    },
    shower: {
      type: 'shower',
      label: 'Receptáculo Ducha / Tina',
      category: 'Gasfitería',
      badge: '🚿',
      color: '#0369a1',
      description: 'Área de ducha con mezcladora y desagüe sifonado',
      defaultMaterials: [
        { name: 'Receptáculo Ducha Acrílico Reforzado 80x80cm', unit: 'un', basePrice: 52000, qtyPerItem: 1, category: 'Sanitarios' },
        { name: 'Monomando Tina/Ducha con flexible y teléfono regulable', unit: 'un', basePrice: 34900, qtyPerItem: 1, category: 'Grifería' },
        { name: 'Desagüe sifonado de tina/receptáculo 50mm con rejilla inox', unit: 'un', basePrice: 6900, qtyPerItem: 1, category: 'Desagües' },
        { name: 'Membrana impermeabilizante elástica para zona húmeda 4kg', unit: 'un', basePrice: 21900, qtyPerItem: 1, category: 'Impermeabilización' }
      ]
    },
    kitchen_sink: {
      type: 'kitchen_sink',
      label: 'Lavaplatos Doble / Sencillo',
      category: 'Gasfitería',
      badge: '🍽️',
      color: '#10b981',
      description: 'Cubierta lavaplatos acero inoxidable con rebalse y monomando cuello alto',
      defaultMaterials: [
        { name: 'Cubierta Lavaplatos Acero Inox 80x50cm 1 cubeta 1 escurridor', unit: 'un', basePrice: 36900, qtyPerItem: 1, category: 'Cocina' },
        { name: 'Grifería Monomando Lavaplatos Cuello de Cisne Móvil', unit: 'un', basePrice: 28900, qtyPerItem: 1, category: 'Grifería' },
        { name: 'Sifón lavaplatos con rebalse y conexión a lavavajillas', unit: 'un', basePrice: 5900, qtyPerItem: 1, category: 'Desagües' }
      ]
    },
    water_valve: {
      type: 'water_valve',
      label: 'Llave de Paso 1/2" Esférica',
      category: 'Gasfitería',
      badge: '🛑',
      color: '#dc2626',
      description: 'Válvula de bola para corte sectorizado de agua fría o caliente',
      defaultMaterials: [
        { name: 'Llave de paso esférica de corte 1/2" HI-HI bronce/latón', unit: 'un', basePrice: 6500, qtyPerItem: 1, category: 'Valvulería' },
        { name: 'Terminales HI/HE para PPR o PEX 20mm', unit: 'un', basePrice: 1800, qtyPerItem: 2, category: 'Fittings' }
      ]
    },
    calefont: {
      type: 'calefont',
      label: 'Calefont 13L Tiro Forzado Ionizado',
      category: 'Gasfitería',
      badge: '♨️',
      color: '#ea580c',
      description: 'Generador instantáneo de agua caliente certificado SEC con ducto',
      defaultMaterials: [
        { name: 'Calefont 13 Litros Tiro Forzado Ionizado GLP/GN Junkers/Splendid', unit: 'un', basePrice: 229000, qtyPerItem: 1, category: 'Agua Caliente' },
        { name: 'Ducto evacuación gases de combustión inox 60mm', unit: 'un', basePrice: 18900, qtyPerItem: 1, category: 'Ventilación' },
        { name: 'Flexible de gas certificado SEC 1/2" x 1/2" 1 metro', unit: 'un', basePrice: 9500, qtyPerItem: 1, category: 'Gas' }
      ]
    },
    column: {
      type: 'column',
      label: 'Pilar Hormigón Armado 20x20cm',
      category: 'Estructura',
      badge: '🏛️',
      color: '#4f46e5',
      description: 'Pilar estructural con 4 barras de acero A63-42H y estribos',
      defaultMaterials: [
        { name: 'Fierro estriado A63-42H 10mm (barra 6m)', unit: 'tira', basePrice: 6800, qtyPerItem: 4, category: 'Fierro Estructural' },
        { name: 'Fierro estriado 6mm para estribos (barra 6m)', unit: 'tira', basePrice: 2900, qtyPerItem: 3, category: 'Fierro Estructural' },
        { name: 'Cemento Melón / Polpaico Extra 25kg', unit: 'saco', basePrice: 4690, qtyPerItem: 2, category: 'Áridos y Cemento' },
        { name: 'Arena gruesa y ripio 3/4" embolsado', unit: 'saco', basePrice: 2500, qtyPerItem: 4, category: 'Áridos y Cemento' }
      ]
    },
    stud_post: {
      type: 'stud_post',
      label: 'Montante Reforzado Metalcon 60mm',
      category: 'Tabiquería',
      badge: '📏',
      color: '#0284c7',
      description: 'Refuerzo de pie derecho para soporte de carga pesada o vanos',
      defaultMaterials: [
        { name: 'Montante estructural Metalcon 60x38x0.85mm 3m', unit: 'tira', basePrice: 6200, qtyPerItem: 2, category: 'Perfilería' },
        { name: 'Tornillo drywall autoperforante 8x1/2" cabeza lenteja (pack x100)', unit: 'pack', basePrice: 3200, qtyPerItem: 0.5, category: 'Fijaciones' }
      ]
    }
  }), []);

  // Filter tools shown according to current project category
  const filteredTools = useMemo(() => {
    const list = Object.values(itemCatalog);
    switch (projectType) {
      case 'electricidad':
        return list.filter(i => ['door', 'window', 'outlet', 'switch', 'light', 'panel_tda', 'force_circuit'].includes(i.type));
      case 'camaras':
        return list.filter(i => ['door', 'window', 'camera_ext', 'camera_int', 'nvr', 'monitor', 'junction_box'].includes(i.type));
      case 'gasfiteria':
        return list.filter(i => ['door', 'window', 'wc', 'sink', 'shower', 'kitchen_sink', 'water_valve', 'calefont'].includes(i.type));
      case 'ampliaciones':
        return list.filter(i => ['door', 'door_double', 'window', 'column', 'outlet', 'light'].includes(i.type));
      case 'cerrajeria':
        return list.filter(i => ['door', 'door_double', 'window'].includes(i.type));
      case 'carpinteria':
        return list.filter(i => ['door', 'window', 'stud_post', 'outlet'].includes(i.type));
      default:
        return list;
    }
  }, [projectType, itemCatalog]);

  // Generate or rebuild layout directly using the form parameters
  const generateLayoutFromParams = useCallback((customL?: number, customW?: number) => {
    const l = customL !== undefined ? customL : roomLength;
    const w = customW !== undefined ? customW : roomWidth;

    const spaceData: SpaceDimensions = {
      ...initialSpace,
      length: l,
      width: w,
      area: Math.round(l * w * 100) / 100,
      perimeter: Math.round((l + w) * 2 * 100) / 100
    };

    const { walls: newWalls, items: newItems } = buildLayoutFromSpaceParams(
      spaceData,
      dimensions.width,
      dimensions.height,
      pixelsPerMeter
    );

    setWalls(newWalls);
    setItems(newItems);
  }, [initialSpace, roomLength, roomWidth, dimensions.width, dimensions.height, pixelsPerMeter]);

  // Initial layout generation when canvas is empty or projectType changes
  useEffect(() => {
    if (items.length === 0 && walls.length === 0) {
      generateLayoutFromParams();
    }
  }, [projectType, dimensions.width, dimensions.height, generateLayoutFromParams]);

  // Handler to adjust dimensions from interactive toolbar
  const handleDimensionChange = (axis: 'length' | 'width', delta: number) => {
    if (axis === 'length') {
      const nextL = Math.max(2.0, Math.min(25.0, Math.round((roomLength + delta) * 10) / 10));
      setRoomLength(nextL);
      generateLayoutFromParams(nextL, roomWidth);
      if (onUpdateMeasurements) {
        onUpdateMeasurements({ ...measurements, length: nextL });
      }
    } else {
      const nextW = Math.max(2.0, Math.min(25.0, Math.round((roomWidth + delta) * 10) / 10));
      setRoomWidth(nextW);
      generateLayoutFromParams(roomLength, nextW);
      if (onUpdateMeasurements) {
        onUpdateMeasurements({ ...measurements, width: nextW });
      }
    }
  };

  // Stage Mouse Down: handle placing artifacts, drawing wall, or calibrating scale
  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    // If clicked on an existing Konva node that is an item, let it handle selection/dragging
    if (e.target !== e.target.getStage()) {
      return;
    }

    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    let clickX = pointer.x;
    let clickY = pointer.y;

    if (snapToGrid) {
      clickX = Math.round(clickX / gridSize) * gridSize;
      clickY = Math.round(clickY / gridSize) * gridSize;
    }

    if (activeTool === 'select') {
      setSelectedId(null);
      setSelectedWallId(null);
      return;
    }

    // Ruler calibration tool mode
    if (activeTool === 'calibrate') {
      if (!calibrationPoints) {
        setCalibrationPoints([clickX, clickY, clickX, clickY]);
      } else {
        const dx = clickX - calibrationPoints[0];
        const dy = clickY - calibrationPoints[1];
        const distPx = Math.hypot(dx, dy);
        if (distPx > 8) {
          setCalibratingDistancePx(Math.round(distPx * 10) / 10);
          const estM = (distPx / pixelsPerMeter).toFixed(2);
          setCalibrationInputMeters(estM === '0.00' ? '1.0' : estM);
          setCalibrationModalOpen(true);
        }
        setCalibrationPoints(null);
      }
      return;
    }

    if (activeTool === 'wall') {
      // Start drawing wall segment
      if (!drawingWall) {
        setDrawingWall([clickX, clickY, clickX, clickY]);
      } else {
        // Finish wall segment
        const newWall: WallSegment = {
          id: `wall_${Date.now()}`,
          points: [drawingWall[0], drawingWall[1], clickX, clickY]
        };
        setWalls(prev => [...prev, newWall]);
        setDrawingWall(null);
      }
      return;
    }

    // Place an artifact from palette
    const def = itemCatalog[activeTool];
    if (def) {
      const newItem: CanvasPlacedItem = {
        id: `${activeTool}_${Date.now()}`,
        type: activeTool,
        label: `${def.label.split(' ')[0]} #${items.filter(i => i.type === activeTool).length + 1}`,
        x: clickX,
        y: clickY,
        rotation: 0
      };
      setItems(prev => [...prev, newItem]);
      setSelectedId(newItem.id);
      setSelectedWallId(null);
    }
  };

  // Stage Mouse Move (for live wall preview and calibration ruler preview)
  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    let targetX = pointer.x;
    let targetY = pointer.y;

    if (snapToGrid) {
      targetX = Math.round(targetX / gridSize) * gridSize;
      targetY = Math.round(targetY / gridSize) * gridSize;
    }

    if (drawingWall) {
      setDrawingWall([drawingWall[0], drawingWall[1], targetX, targetY]);
    } else if (activeTool === 'calibrate' && calibrationPoints) {
      setCalibrationPoints([calibrationPoints[0], calibrationPoints[1], targetX, targetY]);
    }
  };

  // Rotate selected item
  const handleRotateSelected = () => {
    if (!selectedId) return;
    setItems(prev => prev.map(item => {
      if (item.id === selectedId) {
        return {
          ...item,
          rotation: (item.rotation + 90) % 360
        };
      }
      return item;
    }));
  };

  // Delete selected item
  const handleDeleteSelected = () => {
    if (!selectedId) return;
    setItems(prev => prev.filter(i => i.id !== selectedId));
    setSelectedId(null);
  };

  // Delete selected wall segment
  const handleDeleteSelectedWall = () => {
    if (!selectedWallId) return;
    setWalls(prev => prev.filter(w => w.id !== selectedWallId));
    setSelectedWallId(null);
  };

  // Item drag end handler
  const handleItemDragEnd = (id: string, e: KonvaEventObject<DragEvent>) => {
    let finalX = e.target.x();
    let finalY = e.target.y();

    if (snapToGrid) {
      finalX = Math.round(finalX / gridSize) * gridSize;
      finalY = Math.round(finalY / gridSize) * gridSize;
      e.target.position({ x: finalX, y: finalY });
    }

    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, x: finalX, y: finalY };
      }
      return item;
    }));
  };

  // Calibrate scale from ruler measurement
  const handleCalibrateScale = (realMeters: number) => {
    if (!calibratingDistancePx || realMeters <= 0) return;
    const newPpm = Math.max(5, calibratingDistancePx / realMeters);
    setScalePixels(Math.round(calibratingDistancePx));
    setScaleMeters(realMeters);
    setCalibrationModalOpen(false);
    setCalibratingDistancePx(null);
    setActiveTool('select');
    setExportNotice(`¡Escala calibrada! ${Math.round(calibratingDistancePx)}px = ${realMeters}m (${newPpm.toFixed(0)} px/m)`);
    setTimeout(() => setExportNotice(null), 4500);
  };

  // Apply scale from configuration modal
  const handleApplyScale = (px: number, m: number, rescalePlan: boolean) => {
    if (px <= 0 || m <= 0) return;
    setScalePixels(px);
    setScaleMeters(m);
    setShowScaleModal(false);

    if (rescalePlan) {
      const newPpm = px / m;
      const spaceData: SpaceDimensions = {
        ...initialSpace,
        length: roomLength,
        width: roomWidth,
        area: Math.round(roomLength * roomWidth * 100) / 100,
        perimeter: Math.round((roomLength + roomWidth) * 2 * 100) / 100
      };
      const { walls: newWalls, items: newItems } = buildLayoutFromSpaceParams(
        spaceData,
        dimensions.width,
        dimensions.height,
        newPpm
      );
      setWalls(newWalls);
      setItems(newItems);
    }

    setExportNotice(`¡Escala aplicada: ${px}px = ${m}m (${(px / m).toFixed(0)} px/m)!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Bounding box of walls for dimension annotations
  const boundingBox = useMemo(() => {
    if (walls.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    walls.forEach(w => {
      minX = Math.min(minX, w.points[0], w.points[2]);
      minY = Math.min(minY, w.points[1], w.points[3]);
      maxX = Math.max(maxX, w.points[0], w.points[2]);
      maxY = Math.max(maxY, w.points[1], w.points[3]);
    });
    return { minX, minY, maxX, maxY };
  }, [walls]);

  // Real metric dimensions based on drawn geometry and active scale (pixelsPerMeter)
  const drawnDimensions = useMemo(() => {
    let totalWallM = 0;
    walls.forEach(w => {
      const dx = (w.points[2] - w.points[0]) / pixelsPerMeter;
      const dy = (w.points[3] - w.points[1]) / pixelsPerMeter;
      totalWallM += Math.hypot(dx, dy);
    });

    let drawnLengthM = roomLength;
    let drawnWidthM = roomWidth;
    let drawnAreaM2 = Math.round(roomLength * roomWidth * 100) / 100;

    if (boundingBox) {
      drawnLengthM = Math.round(((boundingBox.maxX - boundingBox.minX) / pixelsPerMeter) * 100) / 100;
      drawnWidthM = Math.round(((boundingBox.maxY - boundingBox.minY) / pixelsPerMeter) * 100) / 100;
      drawnAreaM2 = Math.round(drawnLengthM * drawnWidthM * 100) / 100;
    }

    const wallAreaM2 = Math.round(totalWallM * wallHeight * 100) / 100;

    return {
      lengthMeters: drawnLengthM,
      widthMeters: drawnWidthM,
      areaM2: drawnAreaM2,
      totalWallMeters: Math.round(totalWallM * 100) / 100,
      wallAreaM2
    };
  }, [boundingBox, walls, pixelsPerMeter, roomLength, roomWidth, wallHeight]);

  // Keep parent measurements in sync with real scale metrics
  useEffect(() => {
    if (onUpdateMeasurements) {
      onUpdateMeasurements({
        ...measurements,
        length: drawnDimensions.lengthMeters,
        width: drawnDimensions.widthMeters,
        wallLength: drawnDimensions.totalWallMeters,
        floorArea: drawnDimensions.areaM2,
        scalePixels,
        scaleMeters,
        wallHeight,
        pixelsPerMeter: Math.round(pixelsPerMeter * 10) / 10,
        scaleReference: `${scalePixels}px = ${scaleMeters}m`
      });
    }
  }, [scalePixels, scaleMeters, pixelsPerMeter, drawnDimensions.lengthMeters, drawnDimensions.widthMeters, drawnDimensions.totalWallMeters, drawnDimensions.areaM2, wallHeight]);

  // Calculate material quantities from all elements placed on canvas based on active scale
  const calculatedMaterialsFromCanvas = useMemo(() => {
    const tally: Record<string, { material: any; totalQty: number; reasoning: string }> = {};

    // 1. Count placed artifact items and add their default materials
    const itemCounts: Record<string, number> = {};
    items.forEach(item => {
      itemCounts[item.type] = (itemCounts[item.type] || 0) + 1;
    });

    Object.entries(itemCounts).forEach(([type, count]) => {
      const def = itemCatalog[type as CanvasItemType];
      if (!def) return;

      def.defaultMaterials.forEach(mat => {
        const key = mat.name;
        const total = mat.qtyPerItem * count;
        if (!tally[key]) {
          tally[key] = {
            material: {
              name: mat.name,
              unit: mat.unit,
              basePrice: mat.basePrice,
              category: mat.category
            },
            totalQty: 0,
            reasoning: `${count} ${def.label.split(' ')[0]}(s) posicionados en plano`
          };
        }
        tally[key].totalQty += total;
      });
    });

    // 2. Precise wall framing and finishing materials based on real drawn wall length & scale
    if (walls.length > 0 && drawnDimensions.totalWallMeters > 0) {
      const totalWallM = drawnDimensions.totalWallMeters;
      const wallAreaTotal = drawnDimensions.wallAreaM2 * 2; // both faces of partition
      const scaleRefStr = `${scalePixels}px = ${scaleMeters}m (${Math.round(pixelsPerMeter)} px/m)`;

      // Montantes Metalcon 60mm (cada 40cm + esquinas)
      const montantesQty = Math.max(2, Math.ceil(totalWallM / 0.4) + walls.length);
      tally['Montante estructural Metalcon 60x38x0.85mm 3m'] = {
        material: {
          name: 'Montante estructural Metalcon 60x38x0.85mm 3m',
          unit: 'tira',
          basePrice: 6200,
          category: 'Tabiquería y Estructura'
        },
        totalQty: montantesQty,
        reasoning: `Escala ${scaleRefStr}: ${totalWallM.toFixed(1)} ml de muros dibujados (1 montante c/40cm + esquinas)`
      };

      // Soleras superior e inferior
      const solerasTiras = Math.max(1, Math.ceil((totalWallM * 2) / 3));
      tally['Solera estructural Metalcon 62x20x0.85mm 3m'] = {
        material: {
          name: 'Solera estructural Metalcon 62x20x0.85mm 3m',
          unit: 'tira',
          basePrice: 5400,
          category: 'Tabiquería y Estructura'
        },
        totalQty: solerasTiras,
        reasoning: `Escala ${scaleRefStr}: ${(totalWallM * 2).toFixed(1)} ml totales (solera superior e inferior)`
      };

      // Planchas Yeso-Cartón / Vulcanita ST 10mm (1.20 x 2.40m = 2.88m² por plancha)
      const volcanitaPlanchas = Math.max(2, Math.ceil((wallAreaTotal * 1.08) / 2.88));
      tally['Plancha Yeso-Cartón ST 10mm 1.20x2.40m (Volcanita)'] = {
        material: {
          name: 'Plancha Yeso-Cartón ST 10mm 1.20x2.40m (Volcanita)',
          unit: 'plancha',
          basePrice: 8990,
          category: 'Revestimientos'
        },
        totalQty: volcanitaPlanchas,
        reasoning: `Escala ${scaleRefStr}: ${wallAreaTotal.toFixed(1)} m² de caras de muro a ${wallHeight}m altura + 8% merma`
      };

      // Tornillos drywall autoperforantes 1-1/4"
      const tornillosPacks = Math.max(1, Math.ceil(totalWallM * 1.2));
      tally['Tornillos yeso-cartón 6x1-1/4" punta broca (pack x100)'] = {
        material: {
          name: 'Tornillos yeso-cartón 6x1-1/4" punta broca (pack x100)',
          unit: 'pack',
          basePrice: 3200,
          category: 'Fijaciones'
        },
        totalQty: tornillosPacks,
        reasoning: `Fijación de planchas para ${totalWallM.toFixed(1)} ml de muro`
      };

      // Aislación térmica y acústica (Lana de vidrio 50mm, rollo 14.4m²)
      const lanaRollos = Math.max(1, Math.ceil(drawnDimensions.wallAreaM2 / 14.4));
      tally['Lana de vidrio AislanGlass 50mm rollo 14.4m²'] = {
        material: {
          name: 'Lana de vidrio AislanGlass 50mm rollo 14.4m²',
          unit: 'rollo',
          basePrice: 24900,
          category: 'Aislación'
        },
        totalQty: lanaRollos,
        reasoning: `Escala ${scaleRefStr}: Aislación interior para ${drawnDimensions.wallAreaM2.toFixed(1)} m² de tabique`
      };
    }

    // 3. Electrical conductor & conduit runs based on real drawn physical distances to TDA panel
    if (projectType === 'electricidad') {
      const panel = items.find(i => i.type === 'panel_tda') || { x: dimensions.width / 2, y: dimensions.height / 2 };
      const elecItems = items.filter(i => ['outlet', 'switch', 'light', 'force_circuit'].includes(i.type));

      if (elecItems.length > 0) {
        let totalRunM = 0;
        elecItems.forEach(item => {
          const distM = (Math.hypot(item.x - panel.x, item.y - panel.y) / pixelsPerMeter) + 1.2; // +1.2m drop
          totalRunM += distM;
        });

        const cableEvaM = Math.max(15, Math.round(totalRunM * 3 * 1.15));
        const conduitTiras = Math.max(2, Math.ceil(totalRunM / 3));

        tally['Cable EVA Libre Halógeno 2.5mm² (Rojo/Blanco/Verde)'] = {
          material: {
            name: 'Cable EVA Libre Halógeno 2.5mm² (Rojo/Blanco/Verde)',
            unit: 'm',
            basePrice: 950,
            category: 'Conductores'
          },
          totalQty: cableEvaM,
          reasoning: `Escala ${scalePixels}px=${scaleMeters}m: ${totalRunM.toFixed(1)}m de trazado físico a TDA x 3 conductores + 15% holgura`
        };

        tally['Tubería Conduit PVC 20mm tramo 3m'] = {
          material: {
            name: 'Tubería Conduit PVC 20mm tramo 3m',
            unit: 'tira',
            basePrice: 1650,
            category: 'Canalización'
          },
          totalQty: conduitTiras,
          reasoning: `Canalización embutida/sobrepuesta para ${totalRunM.toFixed(1)}m de trazado real en plano`
        };
      }
    }

    // 4. CCTV network cable runs based on physical distance between cameras and NVR
    if (projectType === 'camaras') {
      const nvr = items.find(i => i.type === 'nvr') || { x: dimensions.width / 2, y: dimensions.height / 2 };
      const cams = items.filter(i => ['camera_ext', 'camera_int'].includes(i.type));

      if (cams.length > 0) {
        let totalNetM = 0;
        cams.forEach(cam => {
          const distM = (Math.hypot(cam.x - nvr.x, cam.y - nvr.y) / pixelsPerMeter) * 1.25 + 3.0; // routing slack + drop
          totalNetM += distM;
        });

        const totalNetMeters = Math.max(20, Math.round(totalNetM));
        tally['Cable de Red UTP Cat6 100% Cobre Exterior Doble Chaqueta'] = {
          material: {
            name: 'Cable de Red UTP Cat6 100% Cobre Exterior Doble Chaqueta',
            unit: 'm',
            basePrice: 850,
            category: 'Cableado'
          },
          totalQty: totalNetMeters,
          reasoning: `Escala ${scalePixels}px=${scaleMeters}m: ${totalNetM.toFixed(1)}m de cable UTP medidos directamente de ${cams.length} cámaras al NVR`
        };
      }
    }

    // 5. Ceramics & flooring quantities based on real drawn room area
    if (projectType === 'ceramicas' && drawnDimensions.areaM2 > 0) {
      const floorArea = drawnDimensions.areaM2;
      const tileBoxes = Math.max(1, Math.ceil((floorArea * 1.1) / 1.5));
      const bekronBags = Math.max(1, Math.ceil(floorArea / 5));
      const fragueBags = Math.max(1, Math.ceil(floorArea / 3));

      tally['Cerámica Piso / Porcelanato Tráfico Medio (caja 1.5m²)'] = {
        material: {
          name: 'Cerámica Piso / Porcelanato Tráfico Medio (caja 1.5m²)',
          unit: 'caja',
          basePrice: 14990,
          category: 'Revestimiento Cerámico'
        },
        totalQty: tileBoxes,
        reasoning: `Escala ${scalePixels}px=${scaleMeters}m: ${floorArea.toFixed(1)} m² de superficie de piso dibujada + 10% merma`
      };

      tally['Adhesivo Cerámico Bekron E standard 25kg'] = {
        material: {
          name: 'Adhesivo Cerámico Bekron E standard 25kg',
          unit: 'saco',
          basePrice: 5990,
          category: 'Adhesivos'
        },
        totalQty: bekronBags,
        reasoning: `Rendimiento standard 5m² por saco para ${floorArea.toFixed(1)} m² de superficie`
      };

      tally['Fraguador Impermeable Fungicida 1kg'] = {
        material: {
          name: 'Fraguador Impermeable Fungicida 1kg',
          unit: 'bolsa',
          basePrice: 2490,
          category: 'Fragues'
        },
        totalQty: fragueBags,
        reasoning: `Juntas de dilatación para ${floorArea.toFixed(1)} m² de cerámica`
      };
    }

    // 6. Paint based on real drawn wall & ceiling surface
    if (projectType === 'pintura' && (drawnDimensions.wallAreaM2 > 0 || drawnDimensions.areaM2 > 0)) {
      const totalPaintedM2 = (drawnDimensions.wallAreaM2 * 2) + drawnDimensions.areaM2;
      const paintGallons = Math.max(1, Math.ceil(totalPaintedM2 / 30));

      tally['Esmalte al Agua / Látex Extra Cubriente (Galón 3.8L)'] = {
        material: {
          name: 'Esmalte al Agua / Látex Extra Cubriente (Galón 3.8L)',
          unit: 'galón',
          basePrice: 18900,
          category: 'Pinturas'
        },
        totalQty: paintGallons,
        reasoning: `Escala ${scalePixels}px=${scaleMeters}m: ${totalPaintedM2.toFixed(1)} m² (muros y cielo a 2 manos, rinde 30m²/galón)`
      };
    }

    return Object.values(tally).map((entry, idx) => ({
      id: `canvas_mat_${idx}_${Date.now()}`,
      name: entry.material.name,
      unit: entry.material.unit,
      basePrice: entry.material.basePrice,
      quantity: Math.max(1, Math.round(entry.totalQty * 10) / 10),
      selected: true,
      category: entry.material.category,
      aiCalculated: true,
      reasoning: entry.reasoning || `Cubicado según escala ${scalePixels}px = ${scaleMeters}m (${(pixelsPerMeter).toFixed(0)} px/m)`
    }));
  }, [items, walls, itemCatalog, drawnDimensions, pixelsPerMeter, scalePixels, scaleMeters, wallHeight, projectType, dimensions.width, dimensions.height]);

  // Export quantities to project materials state (Core requirement)
  const handleExportToProject = () => {
    if (calculatedMaterialsFromCanvas.length === 0) {
      alert('Debes ubicar al menos un elemento o trazar muros en el plano para exportar materiales.');
      return;
    }

    // Merge or replace: We update matching materials or append new ones
    const updated = [...currentMaterials];

    calculatedMaterialsFromCanvas.forEach(newMat => {
      const existingIdx = updated.findIndex(m => m.name.toLowerCase() === newMat.name.toLowerCase());
      if (existingIdx >= 0) {
        // Update existing material quantity with the calculated one
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newMat.quantity,
          selected: true,
          reasoning: newMat.reasoning
        };
      } else {
        // Add new material
        updated.push(newMat);
      }
    });

    onExportMaterials(updated);

    setExportNotice(`¡${calculatedMaterialsFromCanvas.length} materiales cubicados a escala (${scalePixels}px = ${scaleMeters}m) exportados al presupuesto!`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Color palette according to blueprint theme
  const themeBg = themeMode === 'blueprint' ? '#0a192f' : themeMode === 'dark' ? '#111827' : '#ffffff';
  const gridColor = themeMode === 'blueprint' ? '#1e3a5f' : themeMode === 'dark' ? '#374151' : '#e2e8f0';
  const wallStroke = themeMode === 'blueprint' ? '#38bdf8' : themeMode === 'dark' ? '#93c5fd' : '#1e293b';
  const textColor = themeMode === 'light' ? '#0f172a' : '#f8fafc';

  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-indigo-200/90 dark:border-gray-700 shadow-md overflow-hidden flex flex-col ${className}`}>
      
      {/* Header Toolbar */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-indigo-900/50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/25 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-xs">
            <PenTool className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold tracking-tight">Plano 2D Interactivo (react-konva)</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
                Exportador Activo
              </span>
            </div>
            <p className="text-xs text-gray-300">
              Espacio y artefactos generados desde el formulario. Arrastra los elementos para ajustar su ubicación libremente.
            </p>
          </div>
        </div>

        {/* Action button to export materials & back */}
        <div className="flex items-center space-x-2">
          {onNavigateToBudget && (
            <button
              onClick={onNavigateToBudget}
              className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              title="Volver a los parámetros del formulario y presupuesto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Formulario</span>
            </button>
          )}

          <button
            onClick={handleExportToProject}
            className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-95"
            title="Exportar cantidades de artefactos a la lista de materiales"
          >
            <Download className="w-4 h-4" />
            <span>Exportar al Presupuesto</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">
              {calculatedMaterialsFromCanvas.length}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-Header: Parámetros del Espacio y Artefactos del Formulario */}
      <div className="bg-indigo-50/70 dark:bg-slate-900/80 border-b border-indigo-100 dark:border-indigo-950 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Metric Dimensions Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Dimensiones del Espacio:</span>
          </span>

          {/* Largo */}
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-indigo-200 dark:border-gray-700 shadow-2xs">
            <span className="text-gray-500 text-[11px]">Largo:</span>
            <button
              onClick={() => handleDimensionChange('length', -0.5)}
              className="p-0.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
              title="Reducir 0.5m"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-bold text-gray-800 dark:text-gray-100 min-w-[36px] text-center">
              {roomLength.toFixed(1)} m
            </span>
            <button
              onClick={() => handleDimensionChange('length', 0.5)}
              className="p-0.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
              title="Aumentar 0.5m"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Ancho */}
          <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg border border-indigo-200 dark:border-gray-700 shadow-2xs">
            <span className="text-gray-500 text-[11px]">Ancho:</span>
            <button
              onClick={() => handleDimensionChange('width', -0.5)}
              className="p-0.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
              title="Reducir 0.5m"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-bold text-gray-800 dark:text-gray-100 min-w-[36px] text-center">
              {roomWidth.toFixed(1)} m
            </span>
            <button
              onClick={() => handleDimensionChange('width', 0.5)}
              className="p-0.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer"
              title="Aumentar 0.5m"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Área y Perímetro */}
          <span className="text-indigo-800 dark:text-indigo-300 font-semibold px-2 py-1 bg-indigo-100/60 dark:bg-indigo-950/60 rounded-md">
            Superficie: <strong>{(roomLength * roomWidth).toFixed(1)} m²</strong>
          </span>

          {/* Regenerate layout button */}
          <button
            onClick={() => generateLayoutFromParams()}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-gray-600 rounded-lg font-medium transition-all cursor-pointer shadow-2xs"
            title="Reorganizar automáticamente muros y artefactos según las medidas"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reorganizar desde Parámetros</span>
          </button>
        </div>

        {/* Resumen de Artefactos de Entrada */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-[11px] text-gray-500 font-medium">Artefactos:</span>
          {initialSpace.artifacts.slice(0, 4).map(art => (
            <span 
              key={art.type} 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-300"
              title={`${art.label}: ${art.count} configurados`}
            >
              <span>{art.badge}</span>
              <strong className="text-indigo-600 dark:text-indigo-400">{art.count}</strong>
            </span>
          ))}
          {initialSpace.artifacts.length > 4 && (
            <span className="text-[10px] text-gray-400">+{initialSpace.artifacts.length - 4} más</span>
          )}
        </div>
      </div>

      {/* Export Alert Notification */}
      {exportNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{exportNotice}</span>
          </div>
          <button 
            onClick={() => setExportNotice(null)}
            className="text-white/80 hover:text-white text-xs px-2 py-0.5 rounded"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Controls & Artifact Palette */}
      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 text-xs">
        
        {/* Mode Tools: Select, Wall, Presets */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          <button
            onClick={() => setActiveTool('select')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTool === 'select'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100'
            }`}
            title="Modo Seleccionar y Mover Elementos"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Mover</span>
          </button>

          <button
            onClick={() => setActiveTool('wall')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTool === 'wall'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-100'
            }`}
            title="Dibuja muros lineales haciendo clic para iniciar y finalizar el tramo"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Trazar Muro</span>
            {drawingWall && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
          </button>

          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block" />

          {/* Grid Snap & Theme */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
              snapToGrid
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-700 dark:text-indigo-300'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500'
            }`}
            title="Ajuste magnético a la cuadrícula (0.5m)"
          >
            <Grid className="w-3 h-3" />
            <span>Snap: {snapToGrid ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setThemeMode(prev => prev === 'blueprint' ? 'dark' : prev === 'dark' ? 'light' : 'blueprint')}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer"
            title="Cambiar fondo del plano"
          >
            <span>Fondo: {themeMode === 'blueprint' ? 'Cianotipo' : themeMode === 'dark' ? 'Dark' : 'Blanco'}</span>
          </button>

          <button
            onClick={() => generateLayoutFromParams()}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-indigo-600 rounded-lg cursor-pointer"
            title="Restablecer plano base con habitación estándar"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Auto-Plano</span>
          </button>

          <button
            onClick={() => { setItems([]); setWalls([]); }}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-red-600 dark:text-red-400 hover:bg-red-50 rounded-lg cursor-pointer"
            title="Borrar todos los elementos y muros"
          >
            <Trash2 className="w-3 h-3" />
            <span>Limpiar</span>
          </button>
        </div>

        {/* Selected Item Controls: Rotate & Delete */}
        {selectedItem && (
          <div className="flex items-center space-x-2 bg-indigo-50 dark:bg-indigo-950/70 p-1.5 rounded-xl border border-indigo-300 dark:border-indigo-800 animate-fade-in">
            <span className="font-bold text-indigo-900 dark:text-indigo-200 text-xs px-1 truncate max-w-[140px]">
              {selectedItem.label} ({selectedItem.rotation}°)
            </span>
            <button
              onClick={handleRotateSelected}
              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
              title="Girar 90 grados"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteSelected}
              className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
              title="Eliminar elemento"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Artifact Palette Pills */}
      <div className="px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <div className="flex items-center space-x-2 min-w-max pb-1">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Layers className="w-3 h-3 text-indigo-500" />
            Artefactos:
          </span>
          {filteredTools.map(tool => {
            const isSelected = activeTool === tool.type;
            return (
              <button
                key={tool.type}
                onClick={() => {
                  setActiveTool(tool.type);
                  setSelectedId(null);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs scale-102 ring-2 ring-indigo-400/40'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={tool.description}
              >
                <span>{tool.badge}</span>
                <span>{tool.label.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75 hidden md:inline">({tool.category})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Konva Stage Canvas Container */}
      <div 
        ref={containerRef} 
        className="w-full relative overflow-hidden flex items-center justify-center p-2 select-none"
        style={{ backgroundColor: themeBg, minHeight: '430px' }}
      >
        <Stage
          width={dimensions.width}
          height={dimensions.height}
          onMouseDown={handleStageMouseDown}
          onTouchStart={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onTouchMove={handleStageMouseMove}
          className="cursor-crosshair rounded-xl overflow-hidden shadow-inner"
        >
          {/* Background Grid Layer */}
          <Layer>
            {/* Dark/Blueprint Rect Base */}
            <Rect
              x={0}
              y={0}
              width={dimensions.width}
              height={dimensions.height}
              fill={themeBg}
            />

            {/* Vertical grid lines */}
            {Array.from({ length: Math.ceil(dimensions.width / gridSize) }).map((_, i) => (
              <Line
                key={`v_${i}`}
                points={[i * gridSize, 0, i * gridSize, dimensions.height]}
                stroke={gridColor}
                strokeWidth={i % 2 === 0 ? 0.8 : 0.4}
                opacity={0.6}
              />
            ))}

            {/* Horizontal grid lines */}
            {Array.from({ length: Math.ceil(dimensions.height / gridSize) }).map((_, i) => (
              <Line
                key={`h_${i}`}
                points={[0, i * gridSize, dimensions.width, i * gridSize]}
                stroke={gridColor}
                strokeWidth={i % 2 === 0 ? 0.8 : 0.4}
                opacity={0.6}
              />
            ))}

            {/* North Compass Arrow in top-left corner */}
            <Group x={35} y={35}>
              <Circle radius={16} stroke="#38bdf8" strokeWidth={1} dash={[2, 2]} opacity={0.6} />
              <Line points={[0, 14, 0, -14]} stroke="#38bdf8" strokeWidth={1.5} />
              <Line points={[-4, -2, 0, -14, 4, -2]} stroke="#38bdf8" strokeWidth={2} fill="#38bdf8" closed />
              <Text x={-4} y={-24} text="N" fontSize={10} fontStyle="bold" fill="#38bdf8" />
            </Group>

            {/* Scale Bar in bottom-left */}
            <Group x={30} y={dimensions.height - 25}>
              <Line points={[0, 0, pixelsPerMeter, 0]} stroke="#94a3b8" strokeWidth={2} />
              <Line points={[0, -4, 0, 4]} stroke="#94a3b8" strokeWidth={2} />
              <Line points={[pixelsPerMeter, -4, pixelsPerMeter, 4]} stroke="#94a3b8" strokeWidth={2} />
              <Text x={pixelsPerMeter / 2 - 12} y={-14} text="1.0 m" fontSize={10} fill="#94a3b8" fontStyle="bold" />
            </Group>

            {/* Metric Title Watermark */}
            <Group x={dimensions.width / 2} y={dimensions.height / 2} opacity={0.15}>
              <Text
                x={-120}
                y={-10}
                text="PLANTA ARQUITECTÓNICA 2D"
                fontSize={16}
                fontStyle="bold"
                fill={textColor}
                letterSpacing={3}
              />
            </Group>
          </Layer>

          {/* Architectural Elements & Walls Layer */}
          <Layer>
            {/* Draw Placed Walls */}
            {walls.map((w) => (
              <Group key={w.id}>
                {/* Outer wall border thickness */}
                <Line
                  points={w.points}
                  stroke={wallStroke}
                  strokeWidth={8}
                  lineCap="square"
                />
                {/* Inner wall core */}
                <Line
                  points={w.points}
                  stroke={themeMode === 'light' ? '#475569' : '#0284c7'}
                  strokeWidth={4}
                  lineCap="round"
                />
              </Group>
            ))}

            {/* Architectural Metric Dimension Lines (Cotas de Medidas) */}
            {boundingBox && walls.length >= 4 && (
              <Group>
                {/* Cota Superior (Largo del espacio) */}
                <Line
                  points={[boundingBox.minX, boundingBox.minY - 16, boundingBox.maxX, boundingBox.minY - 16]}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  dash={[4, 3]}
                />
                <Line
                  points={[boundingBox.minX, boundingBox.minY - 22, boundingBox.minX, boundingBox.minY - 10]}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                />
                <Line
                  points={[boundingBox.maxX, boundingBox.minY - 22, boundingBox.maxX, boundingBox.minY - 10]}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                />
                <Text
                  x={(boundingBox.minX + boundingBox.maxX) / 2 - 24}
                  y={boundingBox.minY - 30}
                  text={`${roomLength.toFixed(2)} m`}
                  fontSize={11}
                  fontStyle="bold"
                  fill={themeMode === 'light' ? '#0369a1' : '#38bdf8'}
                />

                {/* Cota Lateral Izquierda (Ancho del espacio) */}
                <Line
                  points={[boundingBox.minX - 16, boundingBox.minY, boundingBox.minX - 16, boundingBox.maxY]}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                  dash={[4, 3]}
                />
                <Line
                  points={[boundingBox.minX - 22, boundingBox.minY, boundingBox.minX - 10, boundingBox.minY]}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                />
                <Line
                  points={[boundingBox.minX - 22, boundingBox.maxY, boundingBox.minX - 10, boundingBox.maxY]}
                  stroke="#0284c7"
                  strokeWidth={1.5}
                />
                <Text
                  x={boundingBox.minX - 52}
                  y={(boundingBox.minY + boundingBox.maxY) / 2 - 6}
                  text={`${roomWidth.toFixed(2)} m`}
                  fontSize={11}
                  fontStyle="bold"
                  fill={themeMode === 'light' ? '#0369a1' : '#38bdf8'}
                />

                {/* Etiqueta Central de Superficie */}
                <Text
                  x={(boundingBox.minX + boundingBox.maxX) / 2 - 45}
                  y={(boundingBox.minY + boundingBox.maxY) / 2 - 8}
                  text={`${(roomLength * roomWidth).toFixed(1)} m²`}
                  fontSize={14}
                  fontStyle="bold"
                  fill={themeMode === 'light' ? '#94a3b8' : '#38bdf8'}
                  opacity={0.4}
                />
              </Group>
            )}

            {/* In-progress drawing wall line */}
            {drawingWall && (
              <Line
                points={drawingWall}
                stroke="#f59e0b"
                strokeWidth={6}
                dash={[6, 4]}
                lineCap="round"
              />
            )}

            {/* Placed Artifacts & Openings */}
            {items.map((item) => {
              const isSelected = selectedId === item.id;
              const def = itemCatalog[item.type];
              const itemColor = def?.color || '#3b82f6';

              return (
                <Group
                  key={item.id}
                  x={item.x}
                  y={item.y}
                  rotation={item.rotation}
                  draggable={activeTool === 'select'}
                  onClick={() => setSelectedId(item.id)}
                  onTap={() => setSelectedId(item.id)}
                  onDragEnd={(e) => handleItemDragEnd(item.id, e)}
                >
                  {/* Selection Glow Circle */}
                  {isSelected && (
                    <Circle
                      radius={24}
                      stroke="#6366f1"
                      strokeWidth={2}
                      dash={[4, 3]}
                    />
                  )}

                  {/* Render Door with 90° Arc */}
                  {item.type === 'door' && (
                    <Group>
                      {/* Door leaf */}
                      <Line points={[-16, 0, -16, -30]} stroke="#f59e0b" strokeWidth={3} lineCap="round" />
                      {/* Jambs */}
                      <Rect x={-18} y={-4} width={4} height={8} fill="#f59e0b" />
                      <Rect x={14} y={-4} width={4} height={8} fill="#f59e0b" />
                      {/* 90° Swing Arc */}
                      <Arc
                        x={-16}
                        y={0}
                        innerRadius={28}
                        outerRadius={28}
                        angle={90}
                        rotation={-90}
                        stroke="#f59e0b"
                        strokeWidth={1.5}
                        dash={[3, 2]}
                      />
                      <Text x={-14} y={10} text="P-0.80" fontSize={8} fontStyle="bold" fill="#fbbf24" />
                    </Group>
                  )}

                  {/* Render Double Door */}
                  {item.type === 'door_double' && (
                    <Group>
                      <Line points={[-28, 0, -28, -24]} stroke="#d97706" strokeWidth={2.5} />
                      <Line points={[28, 0, 28, -24]} stroke="#d97706" strokeWidth={2.5} />
                      <Arc x={-28} y={0} innerRadius={24} outerRadius={24} angle={90} rotation={-90} stroke="#d97706" strokeWidth={1} dash={[2, 2]} />
                      <Arc x={28} y={0} innerRadius={24} outerRadius={24} angle={90} rotation={180} stroke="#d97706" strokeWidth={1} dash={[2, 2]} />
                      <Text x={-16} y={10} text="P-DOBLE" fontSize={8} fontStyle="bold" fill="#f59e0b" />
                    </Group>
                  )}

                  {/* Render Window */}
                  {item.type === 'window' && (
                    <Group>
                      <Rect x={-24} y={-4} width={48} height={8} fill="#0284c7" stroke="#38bdf8" strokeWidth={1.5} rx={1} />
                      <Line points={[-24, 0, 24, 0]} stroke="#ffffff" strokeWidth={1.2} />
                      <Text x={-16} y={10} text="VENTANA" fontSize={8} fontStyle="bold" fill="#38bdf8" />
                    </Group>
                  )}

                  {/* Render Electrical Outlet */}
                  {item.type === 'outlet' && (
                    <Group>
                      <Circle radius={11} fill="#1e293b" stroke="#eab308" strokeWidth={2} />
                      <Circle radius={4} fill="#eab308" />
                      <Line points={[-14, 0, -11, 0]} stroke="#eab308" strokeWidth={2} />
                      <Line points={[11, 0, 14, 0]} stroke="#eab308" strokeWidth={2} />
                      <Text x={-14} y={14} text="2x16A" fontSize={8} fontStyle="bold" fill="#fef08a" />
                    </Group>
                  )}

                  {/* Render Switch */}
                  {item.type === 'switch' && (
                    <Group>
                      <Circle radius={8} fill="#10b981" stroke="#ffffff" strokeWidth={1.5} />
                      <Line points={[0, 0, 10, -10]} stroke="#10b981" strokeWidth={2} />
                      <Circle x={10} y={-10} radius={2.5} fill="#10b981" />
                      <Text x={-10} y={12} text="9/12" fontSize={8} fontStyle="bold" fill="#a7f3d0" />
                    </Group>
                  )}

                  {/* Render Ceiling Light */}
                  {item.type === 'light' && (
                    <Group>
                      <Circle radius={13} fill="#fef08a" opacity={0.25} />
                      <Circle radius={10} stroke="#facc15" strokeWidth={2} />
                      <Line points={[-7, -7, 7, 7]} stroke="#facc15" strokeWidth={1.5} />
                      <Line points={[-7, 7, 7, -7]} stroke="#facc15" strokeWidth={1.5} />
                      <Text x={-10} y={14} text="LUZ" fontSize={8} fontStyle="bold" fill="#fde047" />
                    </Group>
                  )}

                  {/* Render TDA Panel */}
                  {item.type === 'panel_tda' && (
                    <Group>
                      <Rect x={-15} y={-8} width={30} height={16} fill="#b91c1c" stroke="#ffffff" strokeWidth={1.5} />
                      <Line points={[-15, -8, 15, 8]} stroke="#ffffff" strokeWidth={1.5} />
                      <Text x={-11} y={12} text="TDA" fontSize={8} fontStyle="bold" fill="#fca5a5" />
                    </Group>
                  )}

                  {/* Render Force Circuit */}
                  {item.type === 'force_circuit' && (
                    <Group>
                      <Circle radius={11} fill="#f97316" stroke="#ffffff" strokeWidth={1.5} />
                      <Text x={-4} y={-5} text="⚡" fontSize={9} fill="#ffffff" />
                      <Text x={-16} y={13} text="FUERZA" fontSize={7} fontStyle="bold" fill="#fdba74" />
                    </Group>
                  )}

                  {/* Render Exterior Camera with FOV Arc */}
                  {item.type === 'camera_ext' && (
                    <Group>
                      {/* FOV Cone */}
                      <Arc
                        x={0}
                        y={0}
                        innerRadius={0}
                        outerRadius={50}
                        angle={80}
                        rotation={-130}
                        fill="#06b6d4"
                        opacity={0.25}
                      />
                      {/* Camera Body */}
                      <Rect x={-6} y={-10} width={12} height={16} fill="#0284c7" stroke="#ffffff" strokeWidth={1.5} rx={2} />
                      <Circle x={0} y={-4} radius={3} fill="#38bdf8" />
                      <Text x={-16} y={12} text="CAM-EXT" fontSize={7} fontStyle="bold" fill="#67e8f9" />
                    </Group>
                  )}

                  {/* Render Interior Camera */}
                  {item.type === 'camera_int' && (
                    <Group>
                      <Circle radius={18} stroke="#8b5cf6" strokeWidth={1} dash={[2, 2]} opacity={0.4} />
                      <Circle radius={10} fill="#6d28d9" stroke="#ffffff" strokeWidth={1.5} />
                      <Circle radius={4} fill="#a78bfa" />
                      <Text x={-14} y={13} text="DOMO" fontSize={7} fontStyle="bold" fill="#c4b5fd" />
                    </Group>
                  )}

                  {/* Render NVR / Rack */}
                  {item.type === 'nvr' && (
                    <Group>
                      <Rect x={-14} y={-10} width={28} height={20} fill="#065f46" stroke="#10b981" strokeWidth={1.5} rx={2} />
                      <Line points={[-10, -4, 10, -4]} stroke="#34d399" strokeWidth={1} />
                      <Line points={[-10, 2, 10, 2]} stroke="#34d399" strokeWidth={1} />
                      <Text x={-11} y={14} text="NVR" fontSize={8} fontStyle="bold" fill="#6ee7b7" />
                    </Group>
                  )}

                  {/* Render Monitor */}
                  {item.type === 'monitor' && (
                    <Group>
                      <Rect x={-15} y={-9} width={30} height={18} fill="#0e7490" stroke="#22d3ee" strokeWidth={1.5} rx={2} />
                      <Line points={[-5, 9, 5, 9]} stroke="#22d3ee" strokeWidth={2} />
                      <Text x={-12} y={13} text="MON" fontSize={8} fontStyle="bold" fill="#a5f3fc" />
                    </Group>
                  )}

                  {/* Render Junction Box */}
                  {item.type === 'junction_box' && (
                    <Group>
                      <Rect x={-8} y={-8} width={16} height={16} fill="#475569" stroke="#cbd5e1" strokeWidth={1.5} />
                      <Text x={-4} y={-4} text="X" fontSize={8} fill="#ffffff" fontStyle="bold" />
                      <Text x={-10} y={12} text="IP65" fontSize={7} fontStyle="bold" fill="#cbd5e1" />
                    </Group>
                  )}

                  {/* Render WC Toilet */}
                  {item.type === 'wc' && (
                    <Group>
                      <Rect x={-10} y={-14} width={20} height={9} fill="#0284c7" stroke="#ffffff" strokeWidth={1.5} rx={2} />
                      <Circle x={0} y={3} radius={9} fill="#0369a1" stroke="#ffffff" strokeWidth={1.5} />
                      <Text x={-8} y={16} text="WC" fontSize={8} fontStyle="bold" fill="#7dd3fc" />
                    </Group>
                  )}

                  {/* Render Sink */}
                  {item.type === 'sink' && (
                    <Group>
                      <Rect x={-12} y={-8} width={24} height={16} fill="#0284c7" stroke="#ffffff" strokeWidth={1.5} rx={3} />
                      <Circle x={0} y={0} radius={4} fill="#ffffff" />
                      <Text x={-12} y={13} text="LAV" fontSize={8} fontStyle="bold" fill="#7dd3fc" />
                    </Group>
                  )}

                  {/* Render Shower */}
                  {item.type === 'shower' && (
                    <Group>
                      <Rect x={-18} y={-18} width={36} height={36} fill="#0284c7" opacity={0.2} stroke="#38bdf8" strokeWidth={1.5} />
                      <Line points={[-18, -18, 18, 18]} stroke="#38bdf8" strokeWidth={1} dash={[2, 2]} />
                      <Line points={[-18, 18, 18, -18]} stroke="#38bdf8" strokeWidth={1} dash={[2, 2]} />
                      <Circle x={0} y={0} radius={4} fill="#0284c7" stroke="#ffffff" strokeWidth={1} />
                      <Text x={-16} y={23} text="DUCHA" fontSize={8} fontStyle="bold" fill="#38bdf8" />
                    </Group>
                  )}

                  {/* Render Kitchen Sink */}
                  {item.type === 'kitchen_sink' && (
                    <Group>
                      <Rect x={-20} y={-10} width={40} height={20} fill="#065f46" stroke="#34d399" strokeWidth={1.5} rx={2} />
                      <Rect x={-16} y={-7} width={16} height={14} fill="#047857" stroke="#ffffff" strokeWidth={1} />
                      <Text x={-16} y={15} text="LAVAPLATOS" fontSize={7} fontStyle="bold" fill="#6ee7b7" />
                    </Group>
                  )}

                  {/* Render Water Valve */}
                  {item.type === 'water_valve' && (
                    <Group>
                      <Circle radius={8} fill="#dc2626" stroke="#ffffff" strokeWidth={1.5} />
                      <Line points={[-10, 0, 10, 0]} stroke="#ffffff" strokeWidth={2} />
                      <Line points={[0, -6, 0, 6]} stroke="#ffffff" strokeWidth={2} />
                      <Text x={-10} y={13} text="LLAVE" fontSize={7} fontStyle="bold" fill="#fca5a5" />
                    </Group>
                  )}

                  {/* Render Calefont */}
                  {item.type === 'calefont' && (
                    <Group>
                      <Rect x={-12} y={-14} width={24} height={28} fill="#c2410c" stroke="#fdba74" strokeWidth={1.5} rx={2} />
                      <Text x={-4} y={-3} text="🔥" fontSize={8} fill="#ffffff" />
                      <Text x={-16} y={18} text="CALEFONT" fontSize={7} fontStyle="bold" fill="#fed7aa" />
                    </Group>
                  )}

                  {/* Render Column */}
                  {item.type === 'column' && (
                    <Group>
                      <Rect x={-8} y={-8} width={16} height={16} fill="#4338ca" stroke="#c7d2fe" strokeWidth={1.5} />
                      <Line points={[-8, -8, 8, 8]} stroke="#c7d2fe" strokeWidth={1} />
                      <Line points={[-8, 8, 8, -8]} stroke="#c7d2fe" strokeWidth={1} />
                      <Text x={-12} y={13} text="PILAR" fontSize={7} fontStyle="bold" fill="#c7d2fe" />
                    </Group>
                  )}

                  {/* Render Stud Post */}
                  {item.type === 'stud_post' && (
                    <Group>
                      <Rect x={-6} y={-6} width={12} height={12} fill="#0284c7" stroke="#ffffff" strokeWidth={1} />
                      <Text x={-10} y={12} text="POSTE" fontSize={7} fontStyle="bold" fill="#7dd3fc" />
                    </Group>
                  )}
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>

      {/* Footer Preview & Sync Summary */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/90 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        
        {/* Placed Elements Live Breakdown */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            En plano: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{items.length}</strong> artefactos
          </span>
          <span className="text-gray-400">|</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            Muros: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{walls.length}</strong> tramos
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 dark:text-gray-400">
            Genera <strong>{calculatedMaterialsFromCanvas.length}</strong> líneas de materiales cubicadas
          </span>
        </div>

        {/* Primary Export CTA Button */}
        <button
          onClick={handleExportToProject}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Exportar al Presupuesto de Materiales</span>
        </button>
      </div>

    </div>
  );
};
