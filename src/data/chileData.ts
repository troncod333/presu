import { ProjectType, ProjectQuestion, Supplier, MaterialItem, QualityTier } from '../types';

export const QUALITY_MULTIPLIERS: Record<QualityTier, number> = {
  bajo: 0.70,   // Económico (-30%)
  medio: 1.00,  // Estándar (Base)
  premium: 1.40 // Premium (+40%)
};

export const AREA_COLORS: Record<ProjectType | 'general', string> = {
  electricidad: '#2563EB', // Blue
  camaras: '#16A34A',      // Green
  ceramicas: '#EA580C',    // Orange
  ampliaciones: '#7C3AED', // Purple
  cerrajeria: '#CA8A04',   // Yellow
  gasfiteria: '#DC2626',   // Red
  pintura: '#DB2777',      // Pink
  carpinteria: '#059669',  // Emerald
  general: '#4B5563'       // Gray
};

export const PROJECT_CATEGORIES: {
  id: ProjectType;
  title: string;
  icon: string;
  description: string;
  bgLight: string;
  bgDark: string;
  laborPercent: number; // Mano de obra recomendada
}[] = [
  {
    id: 'electricidad',
    title: 'Electricidad',
    icon: '⚡',
    description: 'Instalaciones SEC, tableros, cableado, enchufes e iluminación',
    bgLight: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    bgDark: 'dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/50 dark:border-blue-800',
    laborPercent: 0.45
  },
  {
    id: 'camaras',
    title: 'Cámaras y Seguridad',
    icon: '📹',
    description: 'Sistemas CCTV IP, DVR, cableado UTP Cat6, kits de monitoreo',
    bgLight: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200',
    bgDark: 'dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50 dark:border-emerald-800',
    laborPercent: 0.35
  },
  {
    id: 'ceramicas',
    title: 'Cerámicas y Pisos',
    icon: '🏺',
    description: 'Cerámicos, porcelanatos, adhesivos 25kg, fragüe, niveladores',
    bgLight: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
    bgDark: 'dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-900/50 dark:border-orange-800',
    laborPercent: 0.50
  },
  {
    id: 'ampliaciones',
    title: 'Ampliaciones',
    icon: '🏠',
    description: 'Obra gruesa, hormigón, ladrillos fiscal, techumbres, losas',
    bgLight: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200',
    bgDark: 'dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/50 dark:border-purple-800',
    laborPercent: 0.60
  },
  {
    id: 'cerrajeria',
    title: 'Cerrajería',
    icon: '🔐',
    description: 'Cerraduras de sobreponer, embutidas, cilindros, bisagras',
    bgLight: 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
    bgDark: 'dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 dark:border-amber-800',
    laborPercent: 0.30
  },
  {
    id: 'gasfiteria',
    title: 'Gasfitería',
    icon: '🚿',
    description: 'Tuberías PVC/PEX, llaves de paso, griferías, WC, sifones',
    bgLight: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
    bgDark: 'dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/50 dark:border-red-800',
    laborPercent: 0.45
  },
  {
    id: 'pintura',
    title: 'Pintura',
    icon: '🎨',
    description: 'Látex, esmalte al agua, empaste de muros, rodillos y selladores',
    bgLight: 'bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200',
    bgDark: 'dark:bg-pink-950/40 dark:text-pink-300 dark:hover:bg-pink-900/50 dark:border-pink-800',
    laborPercent: 0.40
  },
  {
    id: 'carpinteria',
    title: 'Carpintería y Drywall',
    icon: '🔩',
    description: 'Tabiquería Volcanita, perfiles Metalcon, aislación lana de vidrio',
    bgLight: 'bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200',
    bgDark: 'dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/50 dark:border-teal-800',
    laborPercent: 0.45
  }
];

export const PROJECT_QUESTIONS: Record<ProjectType, ProjectQuestion[]> = {
  electricidad: [
    {
      id: 'installType',
      label: 'Tipo de Instalación Eléctrica',
      type: 'select',
      unit: 'tipo',
      defaultValue: 'embutido',
      options: [
        { value: 'embutido', label: 'Embutida (Muros / Conduit PVC)' },
        { value: 'sobrepuesto', label: 'Sobrepuesta (Canaletas PVC Dexson / Cajas Exterior)' }
      ],
      helpText: 'Embutido requiere picado/tubo conduit; sobrepuesto usa canaletas PVC a muro.'
    },
    {
      id: 'forceCircuits',
      label: 'Circuitos de Fuerza Dedicados (Cocina / Horno / Lavadora)',
      type: 'number',
      unit: 'circuitos',
      defaultValue: 1,
      helpText: 'Norma SEC RIC N°10: Conductor THHN 4.0mm² y automáticos independientes C20/C25A'
    },
    { id: 'rooms', label: 'Número de habitaciones / recintos', type: 'number', unit: 'unidades', defaultValue: 3 },
    { id: 'outlets', label: 'Enchufes generales (10A/16A)', type: 'number', unit: 'unidades', defaultValue: 10 },
    { id: 'lights', label: 'Puntos de luz / focos LED', type: 'number', unit: 'unidades', defaultValue: 6 },
    { id: 'distance', label: 'Distancia estimada de canalización/cableado', type: 'number', unit: 'metros', defaultValue: 40 }
  ],
  camaras: [
    {
      id: 'cameraLocation',
      label: 'Ubicación Principal de Cámaras',
      type: 'select',
      unit: 'tipo',
      defaultValue: 'exterior',
      options: [
        { value: 'exterior', label: 'Exterior (Cámaras IP67 Intemperie + Cajas IP65 Estancas)' },
        { value: 'interior', label: 'Interior (Domo Compacto Antirrobo)' },
        { value: 'mixto', label: 'Mixto (Cámaras de Exterior e Interior)' }
      ],
      helpText: 'Cámaras de exterior incluyen grado IP67 y cajas de derivación selladas.'
    },
    {
      id: 'conduitType',
      label: 'Tipo de Canalización / Cableado',
      type: 'select',
      unit: 'tipo',
      defaultValue: 'sobrepuesto',
      options: [
        { value: 'sobrepuesto', label: 'Sobrepuesto (Canaletas PVC Dexson / Tubo Conduit Exterior)' },
        { value: 'embutido', label: 'Embutido (Tubería Conduit bajo muro o entretecho)' }
      ],
      helpText: 'Sobrepuesto incluye canaletas PVC con adhesivo/tarugos; embutido considera tuberías en muro.'
    },
    {
      id: 'monitors',
      label: 'Monitores / Pantallas de Control',
      type: 'select',
      unit: 'pantallas',
      defaultValue: '1',
      options: [
        { value: '0', label: 'Sin Monitor (Monitoreo solo vía App Móvil / PC)' },
        { value: '1', label: '1 Monitor LED 22" Full HD con Cable HDMI 3m' },
        { value: '2', label: '2 Monitores LED (Monitoreo Centralizado Dual)' }
      ],
      helpText: 'Incluye pantalla LED Full HD, soporte de pared y cableado HDMI/VGA.'
    },
    { id: 'cameras', label: 'Número total de cámaras IP / Domo', type: 'number', unit: 'unidades', defaultValue: 4 },
    { id: 'cableDistance', label: 'Distancia promedio de cable UTP por cámara', type: 'number', unit: 'metros', defaultValue: 25 },
    { id: 'recordingDays', label: 'Días deseados de almacenamiento', type: 'number', unit: 'días', defaultValue: 15 }
  ],
  ceramicas: [
    {
      id: 'surfaceType',
      label: 'Tipo de Superficie de Base',
      type: 'select',
      unit: 'tipo',
      defaultValue: 'losa',
      options: [
        { value: 'losa', label: 'Piso Losa de Hormigón / Radier' },
        { value: 'tabique', label: 'Muro Tabiquería (Volcanita / Fibrocemento / Madera)' },
        { value: 'existente', label: 'Sobre Cerámica Existente (Piso sobre Piso)' }
      ],
      helpText: 'Tabiquería requiere Adhesivo en Pasta; piso sobre piso requiere Promotor de Adherencia.'
    },
    {
      id: 'tileType',
      label: 'Tipo de Revestimiento',
      type: 'select',
      unit: 'material',
      defaultValue: 'ceramica',
      options: [
        { value: 'ceramica', label: 'Cerámica Estándar (30x30cm / 45x45cm)' },
        { value: 'porcelanato', label: 'Porcelanato Rectificado (60x60cm / 120x60cm)' }
      ],
      helpText: 'El porcelanato requiere Adhesivo Bekron Porcelanato y Cuñas Niveladoras Auto-nivelantes.'
    },
    {
      id: 'wetArea',
      label: '¿Incluye Zona Húmeda / Ducha / Exterior?',
      type: 'select',
      unit: 'zona',
      defaultValue: 'no',
      options: [
        { value: 'no', label: 'No (Habitaciones / Living / Comedor)' },
        { value: 'si', label: 'Sí (Ducha / Baño / Exterior - Con Membrana Impermeabilizante)' }
      ],
      helpText: 'Incluye membrana impermeabilizante y fragüe hidráulico anti-hongos.'
    },
    { id: 'floorArea', label: 'Área de piso a revestir', type: 'number', unit: 'm²', defaultValue: 20 },
    { id: 'wallArea', label: 'Área de muros a revestir', type: 'number', unit: 'm²', defaultValue: 15 },
    { id: 'wasteMargin', label: 'Margen de corte/merma estimado', type: 'number', unit: '%', defaultValue: 10 }
  ],
  ampliaciones: [
    {
      id: 'structureType',
      label: 'Sistema Estructural Principal',
      type: 'select',
      unit: 'sistema',
      defaultValue: 'albanileria',
      options: [
        { value: 'albanileria', label: 'Albañilería Confinada (Ladrillo Fiscal + Pilares/Cadenas Hormigón)' },
        { value: 'metalcon', label: 'Metalcon Estructural Galvanizado (Estructura de Acero)' },
        { value: 'madera', label: 'Madera Estructural (Pino Cepillado / Tratado)' }
      ],
      helpText: 'Ladrillo fiscal requiere fierros estriados y morteros; Metalcon requiere perfilería galvanizada.'
    },
    {
      id: 'foundation',
      label: '¿Incluye Radier y Cimientos de Hormigón?',
      type: 'select',
      unit: 'radier',
      defaultValue: 'si',
      options: [
        { value: 'si', label: 'Sí (Cimiento, Sobrecimiento, Radier 10cm + Malla Acma)' },
        { value: 'no', label: 'No (Construcción sobre Radier o Losa ya existente)' }
      ],
      helpText: 'Radier 10cm incluye Hormigón Melón H20, malla electrosoldada C-139, ripio y polietileno.'
    },
    {
      id: 'roofType',
      label: 'Tipo de Cubierta de Techumbre',
      type: 'select',
      unit: 'techumbre',
      defaultValue: 'zinc',
      options: [
        { value: 'zinc', label: 'Planchas Zinc Acanalado 0.35mm' },
        { value: 'teja_asfaltica', label: 'Teja Asfáltica sobre Plancha OSB 11.1mm + Fieltro 15L' },
        { value: 'panel_aislante', label: 'Panel Sándwich Aislante PV4 Poliestireno' }
      ],
      helpText: 'Teja asfáltica requiere OSB estructural 11.1mm y fieltro asfáltico de barrera.'
    },
    { id: 'length', label: 'Largo de la ampliación', type: 'number', unit: 'metros', defaultValue: 4 },
    { id: 'width', label: 'Ancho de la ampliación', type: 'number', unit: 'metros', defaultValue: 3 },
    { id: 'height', label: 'Altura promedio de muros', type: 'number', unit: 'metros', defaultValue: 2.4 }
  ],
  cerrajeria: [
    {
      id: 'doorType',
      label: 'Tipo de Puerta Principal',
      type: 'select',
      unit: 'tipo',
      defaultValue: 'exterior_madera',
      options: [
        { value: 'exterior_madera', label: 'Puerta Madera Sólida / Exterior' },
        { value: 'interior_paso', label: 'Puerta Interior Alveolar' },
        { value: 'metal_reja', label: 'Puerta Metálica / Reja de Acceso Exterior' }
      ],
      helpText: 'Puertas metálicas/rejas utilizan cerraduras de sobreponer soldables/atornillables.'
    },
    {
      id: 'securityLevel',
      label: 'Nivel de Seguridad Deseado',
      type: 'select',
      unit: 'nivel',
      defaultValue: 'alta_seguridad',
      options: [
        { value: 'alta_seguridad', label: 'Alta Seguridad (Scanavini 2050 3 Golpes / Cerrojo Macizo)' },
        { value: 'digital', label: 'Cerradura Digital Smart (Huella / Clave / Bluetooth)' },
        { value: 'estandar', label: 'Cerradura Estándar de Cilindro / Pomo' }
      ],
      helpText: 'Cerraduras Smart digitales incluyen teclado táctil, lector biométrico y llaves mecánicas de emergencia.'
    },
    { id: 'mainDoors', label: 'Puertas de acceso principal (seguridad)', type: 'number', unit: 'unidades', defaultValue: 1 },
    { id: 'interiorDoors', label: 'Puertas interiores o de paso', type: 'number', unit: 'unidades', defaultValue: 4 }
  ],
  gasfiteria: [
    {
      id: 'pipeType',
      label: 'Sistema de Tubería de Agua Potable',
      type: 'select',
      unit: 'sistema',
      defaultValue: 'pex',
      options: [
        { value: 'pex', label: 'Tubería PEX Flexible con Conexiones de Prensa' },
        { value: 'ppr', label: 'Polipropileno PPR Termofusión' },
        { value: 'cobre', label: 'Tubería Cobre Tipo L Soldada' }
      ],
      helpText: 'PEX permite instalación flexible en tramos continuos; PPR requiere dado termofusor.'
    },
    {
      id: 'waterHeaterType',
      label: 'Sistema de Calentamiento de Agua',
      type: 'select',
      unit: 'equipo',
      defaultValue: 'calefont',
      options: [
        { value: 'calefont', label: 'Calefont Ionizado Tiro Forzado (Gas GLP/GN)' },
        { value: 'termo', label: 'Termo Eléctrico Eficiente 80L - 120L' },
        { value: 'ninguno', label: 'Sin Calentador (Conexión a Red Existente)' }
      ],
      helpText: 'Calefont requiere ducto de evacuación inox y flexibles de gas certificados por SEC.'
    },
    { id: 'bathrooms', label: 'Número de baños completos', type: 'number', unit: 'unidades', defaultValue: 1 },
    { id: 'kitchens', label: 'Cocinas / Logias', type: 'number', unit: 'unidades', defaultValue: 1 },
    { id: 'distance', label: 'Distancia estimada de tuberías', type: 'number', unit: 'metros', defaultValue: 20 }
  ],
  pintura: [
    {
      id: 'paintType',
      label: 'Tipo de Pintura de Terminación',
      type: 'select',
      unit: 'tipo',
      defaultValue: 'esmalte_agua',
      options: [
        { value: 'esmalte_agua', label: 'Esmalte al Agua Satinado Lavable (Baños, Cocinas, Interiores)' },
        { value: 'latex', label: 'Látex Extracubriente Estándar (Cielos y Zonas Secas)' },
        { value: 'oleo', label: 'Óleo / Anticorrosivo (Superficies Metálicas / Maderas Exterior)' }
      ],
      helpText: 'El esmalte al agua es lavable, antihongos e ideal para zonas de tráfico y humedad.'
    },
    {
      id: 'surfaceCondition',
      label: 'Estado Previo de la Superficie',
      type: 'select',
      unit: 'estado',
      defaultValue: 'nueva',
      options: [
        { value: 'nueva', label: 'Muro Nuevo / Enlucido Pasta (Requiere Pasta Muro 2 Manos + Primer Fijador)' },
        { value: 'repintado', label: 'Repintado / Superficie en Buen Estado (Solo Limpieza + Pintura)' },
        { value: 'con_fisuras', label: 'Muro Dañado / Con Fisuras (Requiere Malla de Refuerzo + Pasta y Lijado)' }
      ],
      helpText: 'Muros nuevos o dañados requieren tineta de pasta muro y fijador de porosidad.'
    },
    { id: 'wallArea', label: 'Superficie total muros a pintar', type: 'number', unit: 'm²', defaultValue: 60 },
    { id: 'ceilingArea', label: 'Superficie de cielos/techos', type: 'number', unit: 'm²', defaultValue: 25 },
    { id: 'coats', label: 'Número de manos de pintura', type: 'number', unit: 'manos', defaultValue: 2 }
  ],
  carpinteria: [
    {
      id: 'structureType',
      label: 'Perfilería o Estructura de Tabiques',
      type: 'select',
      unit: 'material',
      defaultValue: 'metalcon',
      options: [
        { value: 'metalcon', label: 'Metalcon Galvanizado (Montantes 60mm + Canales 62mm)' },
        { value: 'madera', label: 'Madera Pino Cepillado (2x2" / 2x3")' }
      ],
      helpText: 'Metalcon es incombustible y no se deforma; la madera requiere tornillos para madera.'
    },
    {
      id: 'boardType',
      label: 'Tipo de Planchas de Revestimiento',
      type: 'select',
      unit: 'plancha',
      defaultValue: 'volcanita_std',
      options: [
        { value: 'volcanita_std', label: 'Volcanita Estándar 12.5mm (Zonas Secas)' },
        { value: 'volcanita_rh', label: 'Volcanita RH Anti-Humedad Verde 12.5mm (Baños / Cocinas)' },
        { value: 'osb_volcanita', label: 'OSB Estructural 9.5mm + Volcanita 12.5mm (Doble Plancha Antirrobo/Acústica)' }
      ],
      helpText: 'Volcanita RH es resistente a la humedad; OSB + Volcanita da alta rigidez estructural.'
    },
    {
      id: 'insulationType',
      label: 'Aislación Termoacústica Interior',
      type: 'select',
      unit: 'aislación',
      defaultValue: 'lana_vidrio',
      options: [
        { value: 'lana_vidrio', label: 'Lana de Vidrio 50mm con Papel Aluminio (Barrera de Vapor)' },
        { value: 'poliestireno', label: 'Poliestireno Expandido Aislapor 50mm (Planchas)' },
        { value: 'ninguno', label: 'Sin Aislación Interior' }
      ],
      helpText: 'Lana de vidrio con aluminio brinda aislamientos acústico y térmico con barrera de vapor.'
    },
    { id: 'wallLength', label: 'Largo total de tabique a construir', type: 'number', unit: 'metros', defaultValue: 8 },
    { id: 'height', label: 'Altura del tabique', type: 'number', unit: 'metros', defaultValue: 2.4 },
    { id: 'sides', label: 'Nivel de emplanchado', type: 'number', unit: 'caras', defaultValue: 2 }
  ]
};

export const BASE_MATERIALS_CHILE: Record<ProjectType, Omit<MaterialItem, 'id' | 'quantity' | 'selected'>[]> = {
  electricidad: [
    { name: 'Cable 2.5mm² THHN (Rojo/Blanco/Verde)', unit: 'metro', basePrice: 650, category: 'Cableado' },
    { name: 'Cable 4.0mm² THHN (Alimentación)', unit: 'metro', basePrice: 950, category: 'Cableado' },
    { name: 'Interruptor Diferencial 2x25A 30mA (Legrand/Bticino)', unit: 'unidad', basePrice: 28000, category: 'Protección' },
    { name: 'Automático Termomagnético 16A (Bticino)', unit: 'unidad', basePrice: 4800, category: 'Protección' },
    { name: 'Tablero Distribución Eléctrico 8 Polos Embutido', unit: 'unidad', basePrice: 19500, category: 'Tableros' },
    { name: 'Enchufe Doble 10A/16A con Toma Tierra Bticino', unit: 'unidad', basePrice: 2600, category: 'Artefactos' },
    { name: 'Interruptor Simple Embutido Bticino', unit: 'unidad', basePrice: 2100, category: 'Artefactos' },
    { name: 'Panel LED 24W Embutido Redondo Blanco Cálido/Frío', unit: 'unidad', basePrice: 8900, category: 'Iluminación' },
    { name: 'Foco LED 9W E27 Pack 4 unidades', unit: 'pack', basePrice: 5990, category: 'Iluminación' },
    { name: 'Tubería Conduit PVC Rígido 20mm (3m)', unit: 'tira', basePrice: 1350, category: 'Canalización' },
    { name: 'Caja Derivación Embutida 100x100mm', unit: 'unidad', basePrice: 950, category: 'Canalización' },
    { name: 'Cinta Aisladora 3M Temflex 1700 (18m)', unit: 'unidad', basePrice: 1800, category: 'Insumos' }
  ],
  camaras: [
    { name: 'Cámara IP Domo 2MP Full HD Exterior IP67', unit: 'unidad', basePrice: 48000, category: 'Cámaras' },
    { name: 'Cámara IP Bala 4MP UltraHD Visión Nocturna', unit: 'unidad', basePrice: 78000, category: 'Cámaras' },
    { name: 'NVR / DVR 8 Canales HD Dahua/Hikvision', unit: 'unidad', basePrice: 69000, category: 'Grabación' },
    { name: 'Disco Duro 1TB Western Digital Purple Vigilancia', unit: 'unidad', basePrice: 49000, category: 'Almacenamiento' },
    { name: 'Cable UTP Cat6 100% Cobre Exterior (metro)', unit: 'metro', basePrice: 420, category: 'Cableado' },
    { name: 'Pack 50 Conectores RJ45 Cat6 + Botas Protecciones', unit: 'pack', basePrice: 9500, category: 'Conectores' },
    { name: 'Switch PoE 8 Puertos 10/100 Mbps', unit: 'unidad', basePrice: 49000, category: 'Redes' },
    { name: 'Fuente Poder Regulada 12V 5A con Pulpo 4 Salidas', unit: 'unidad', basePrice: 12500, category: 'Energía' },
    { name: 'Caja Registro Estanca IP65 para Conexiones', unit: 'unidad', basePrice: 2200, category: 'Accesorios' }
  ],
  ceramicas: [
    { name: 'Cerámica 30x30cm Antideslizante Alto Tráfico', unit: 'm²', basePrice: 7990, category: 'Revestimiento' },
    { name: 'Porcelanato 60x60cm Rectificado Pulido', unit: 'm²', basePrice: 14990, category: 'Revestimiento' },
    { name: 'Adhesivo Cerámico Bekron / Cadina (Saco 25kg)', unit: 'saco', basePrice: 4990, category: 'Adhesivos' },
    { name: 'Adhesivo Pasta Doble Acción (Saco 25kg)', unit: 'saco', basePrice: 8900, category: 'Adhesivos' },
    { name: 'Fragüe Impermeable Anti-hongos (Bolsa 5kg)', unit: 'bolsa', basePrice: 3800, category: 'Fragüe' },
    { name: 'Crucetas Niveladoras 2mm (Bolsa 100 uds)', unit: 'bolsa', basePrice: 890, category: 'Herramientas' },
    { name: 'Perfil Esquinero Aluminio Anodizado (2.5m)', unit: 'unidad', basePrice: 3200, category: 'Terminaciones' }
  ],
  ampliaciones: [
    { name: 'Ladrillo Fiscal Estructura 28x14x7cm', unit: 'unidad', basePrice: 195, category: 'Obra Gruesa' },
    { name: 'Cemento Melón Especial Alta Resistencia (Saco 25kg)', unit: 'saco', basePrice: 3990, category: 'Aglomerantes' },
    { name: 'Arena Gruesa Limpia para Mezcla', unit: 'm³', basePrice: 29000, category: 'Áridos' },
    { name: 'Ripio / Gravilla Selección', unit: 'm³', basePrice: 27000, category: 'Áridos' },
    { name: 'Fierro Estriado 8mm Calidad A63-42H (Tira 6m)', unit: 'barra', basePrice: 2950, category: 'Enfierradura' },
    { name: 'Fierro Estriado 10mm (Tira 6m)', unit: 'barra', basePrice: 4400, category: 'Enfierradura' },
    { name: 'Madera Pino Cepillado 2x3" x 3.2m', unit: 'unidad', basePrice: 2990, category: 'Maderamen' },
    { name: 'Plancha Yeso-Cartón Volcanita 10mm (1.20x2.40m)', unit: 'plancha', basePrice: 5990, category: 'Tabiquería' },
    { name: 'Zinc Acanalado 0.35mm x 3.66m Techo', unit: 'plancha', basePrice: 8990, category: 'Techumbre' },
    { name: 'Malla Acma Electrosoldada C-139 (2x5m)', unit: 'plancha', basePrice: 24900, category: 'Losas' }
  ],
  cerrajeria: [
    { name: 'Cerradura Sobreponer Scanavini 2050 Doble Cerrojo', unit: 'unidad', basePrice: 21900, category: 'Seguridad' },
    { name: 'Cerradura Embutida Cilindro Europerfil Acero', unit: 'unidad', basePrice: 18500, category: 'Cerraduras' },
    { name: 'Cerradura Cilíndrica Pomo Dormitorio Poli', unit: 'unidad', basePrice: 12900, category: 'Cerraduras' },
    { name: 'Bisagra Rodamiento 3.5x3.5" Acero Inoxidable (Par)', unit: 'par', basePrice: 4500, category: 'Herrajes' },
    { name: 'Manilla Puerta Interior Roseta Acero Cepillado', unit: 'unidad', basePrice: 9900, category: 'Manillas' },
    { name: 'Cierre de Seguridad Ventana Aluminio Corrediza', unit: 'unidad', basePrice: 3800, category: 'Ventanas' }
  ],
  gasfiteria: [
    { name: 'Tubo PVC Sanitario 50mm x 3m Hoffens', unit: 'tira', basePrice: 3800, category: 'Alcantarillado' },
    { name: 'Tubo PVC Sanitario 110mm x 3m (WC/Descarga)', unit: 'tira', basePrice: 9800, category: 'Alcantarillado' },
    { name: 'Tubería PEX 16mm para Agua Caliente/Fría (metro)', unit: 'metro', basePrice: 920, category: 'Agua Potable' },
    { name: 'Llave de Paso 1/2" Bronce Cierre Rápido', unit: 'unidad', basePrice: 4900, category: 'Valvulería' },
    { name: 'Monocomando Lavatorio Cromo Nibsa / Nibsa-Stretto', unit: 'unidad', basePrice: 28900, category: 'Grifería' },
    { name: 'Taza WC One-Piece Descarga Dual Eco 3/6L', unit: 'unidad', basePrice: 89000, category: 'Artefactos Sanitaros' },
    { name: 'Sifón Lavatorio Cromado Extensible Anti-Olores', unit: 'unidad', basePrice: 4900, category: 'Sifones' },
    { name: 'Flexibles Agua Potable 1/2" H-H 40cm (Par)', unit: 'par', basePrice: 3400, category: 'Conexiones' }
  ],
  pintura: [
    { name: 'Pintura Látex Interior Extracubriente (Galón 3.8L)', unit: 'galón', basePrice: 15990, category: 'Pinturas' },
    { name: 'Esmalte al Agua Lavable Satinado (Galón 3.8L)', unit: 'galón', basePrice: 22900, category: 'Pinturas' },
    { name: 'Sellador / Primer Acrílico Fijador (Galón 3.8L)', unit: 'galón', basePrice: 12900, category: 'Preparación' },
    { name: 'Pasta Muro Interior Sipar (Tineta 25kg)', unit: 'tineta', basePrice: 9900, category: 'Preparación' },
    { name: 'Rodillo Antigota Microfibra 23cm con Mango', unit: 'unidad', basePrice: 3800, category: 'Herramientas' },
    { name: 'Brocha Cerda Natural 3" Profesional', unit: 'unidad', basePrice: 2400, category: 'Herramientas' },
    { name: 'Cinta Enmascarar / Masking Tape 24mm x 50m Pack 2', unit: 'pack', basePrice: 3200, category: 'Insumos' }
  ],
  carpinteria: [
    { name: 'Plancha Yeso-Cartón Volcanita 12.5mm (1.20x2.40m)', unit: 'plancha', basePrice: 6800, category: 'Emplanchado' },
    { name: 'Perfil Metalcon Montante 60x38x0.85mm x 2.4m', unit: 'tira', basePrice: 2850, category: 'Perfilería' },
    { name: 'Perfil Metalcon Canal 62x28x0.85mm x 3.0m', unit: 'tira', basePrice: 3100, category: 'Perfilería' },
    { name: 'Lana de Vidrio Aislante con Aluminio 50mm (Rollo 12m²)', unit: 'rollo', basePrice: 24900, category: 'Aislación' },
    { name: 'Tornillo Yeso-Cartón Punta Fina 6x1 5/8" (Caja 500)', unit: 'caja', basePrice: 4200, category: 'Fijaciones' },
    { name: 'Cinta Junta de Papel Volcanita (Rollo 75m)', unit: 'rollo', basePrice: 3500, category: 'Terminación' },
    { name: 'Pasta Junta Yeso Brikol (Caja 15kg)', unit: 'caja', basePrice: 11900, category: 'Terminación' }
  ]
};

export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sod_cerrillos',
    name: 'Sodimac Constructor Cerrillos',
    address: 'Av. Pedro Aguirre Cerda 6800, Cerrillos, Región Metropolitana',
    phone: '+56 600 600 4010',
    lat: -33.4845,
    lng: -70.7156,
    area: 'ampliaciones',
    rating: 4.6,
    specialties: 'Materiales obra gruesa, maderamen, ferretería industrial'
  },
  {
    id: 'const_cerrillos',
    name: 'Construmart Pedro Aguirre Cerda',
    address: 'Av. Pedro Aguirre Cerda 7631, Cerrillos, Región Metropolitana',
    phone: '+56 600 360 0100',
    lat: -33.4912,
    lng: -70.7180,
    area: 'ampliaciones',
    rating: 4.5,
    specialties: 'Fierros, cemento, techumbre, tabiquería Metalcon'
  },
  {
    id: 'casa_royal_vespucio',
    name: 'Casa Royal Américo Vespucio',
    address: 'Av. Américo Vespucio 1501, Cerrillos (Mall Plaza Oeste)',
    phone: '+56 2 2488 7000',
    lat: -33.5152,
    lng: -70.7121,
    area: 'electricidad',
    rating: 4.4,
    specialties: 'Electrónica, cámaras IP, redes, iluminación LED'
  },
  {
    id: 'easy_maipu',
    name: 'Easy Maipú / Central',
    address: 'Av. Pajaritos 2621, Maipú, Santiago',
    phone: '+56 600 600 3000',
    lat: -33.5042,
    lng: -70.7510,
    area: 'ceramicas',
    rating: 4.5,
    specialties: 'Pisos, cerámicas, pinturas, gasfitería, sanitarios'
  },
  {
    id: 'ferr_central',
    name: 'Ferretería Central Cerrillos',
    address: 'Av. Departamental 4500, Cerrillos, Santiago',
    phone: '+56 2 2555 1234',
    lat: -33.5011,
    lng: -70.7020,
    area: 'cerrajeria',
    rating: 4.7,
    specialties: 'Atención rápida, cerrajería, herramientas manuales'
  },
  {
    id: 'distelsa_stgo',
    name: 'Distelsa Electricidad Santiago',
    address: 'Av. General Velásquez 8756, Estación Central, Santiago',
    phone: '+56 2 2901 2345',
    lat: -33.4589,
    lng: -70.6834,
    area: 'electricidad',
    rating: 4.8,
    specialties: 'Distribución cables THHN, tableros industriales SEC'
  },
  {
    id: 'seguridad_total',
    name: 'Seguridad Total Chile',
    address: 'Av. San Pablo 9876, Pudahuel / Estación Central',
    phone: '+56 2 2678 9012',
    lat: -33.4420,
    lng: -70.7280,
    area: 'camaras',
    rating: 4.6,
    specialties: 'Kits CCTV Dahua, alarmas, control de acceso'
  },
  {
    id: 'imperial_macul',
    name: 'Ferretería Imperial Macul',
    address: 'Av. Vicuña Mackenna 3200, Macul, Santiago',
    phone: '+56 600 400 2000',
    lat: -33.4790,
    lng: -70.6220,
    area: 'carpinteria',
    rating: 4.7,
    specialties: 'Maderas en bruto, tableros dimensionados, bisagras'
  }
];
