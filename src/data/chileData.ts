import { ProjectType, QualityTier, Supplier, ProjectCategoryConfig, ProjectQuestion } from '../types';

export const QUALITY_MULTIPLIERS: Record<QualityTier, number> = {
  economico: 0.82,
  medio: 1.0,
  premium: 1.38
};

export const PROJECT_CATEGORIES: ProjectCategoryConfig[] = [
  {
    id: 'electricidad',
    name: 'Electricidad e Iluminación',
    iconName: 'Zap',
    description: 'Instalaciones SEC, automáticos, cableado EVA/NYA y luminarias.',
    color: 'amber',
    laborPercent: 0.45
  },
  {
    id: 'ceramicas',
    name: 'Cerámicas y Porcelanatos',
    iconName: 'Grid',
    description: 'Pisos, muros, adhesivo Bekron DA, fragüe y separadores.',
    color: 'cyan',
    laborPercent: 0.40
  },
  {
    id: 'tabiqueria',
    name: 'Tabiquería y Volcanita',
    iconName: 'Layers',
    description: 'Metalcon estructural, perfiles, placas yeso-cartón Volcán y lana mineral.',
    color: 'blue',
    laborPercent: 0.38
  },
  {
    id: 'techumbre',
    name: 'Techumbre y Aislación',
    iconName: 'Home',
    description: 'Costaneras, planchas Zinc-Alum, tejas asfálticas y fieltro 15 lbs.',
    color: 'orange',
    laborPercent: 0.42
  },
  {
    id: 'pintura',
    name: 'Pintura y Terminaciones',
    iconName: 'Paintbrush',
    description: 'Látex, esmalte al agua, pasta muro y selladores acrílicos.',
    color: 'purple',
    laborPercent: 0.50
  },
  {
    id: 'gasfiteria',
    name: 'Gasfitería y Sanitario',
    iconName: 'Droplet',
    description: 'Tuberías PPR Termofusión, PVC Sanitario, artefactos y llaves de paso.',
    color: 'teal',
    laborPercent: 0.48
  },
  {
    id: 'ampliacion',
    name: 'Ampliación Estructural',
    iconName: 'Maximize2',
    description: 'Radier de hormigón H20, muros perimetrales, vigas y cubierta completa.',
    color: 'emerald',
    laborPercent: 0.45
  },
  {
    id: 'cctv',
    name: 'CCTV y Seguridad',
    iconName: 'Camera',
    description: 'Cámaras IP/PoE, grabador NVR, cable UTP Cat6 y canalización exterior.',
    color: 'indigo',
    laborPercent: 0.35
  }
];

export const BASE_MATERIALS_CHILE: Record<ProjectType, Array<{ name: string; unit: string; basePrice: number; category: string; reasoning?: string }>> = {
  electricidad: [
    { name: 'Cable THHN/EVA 1.5mm² Blanco/Rojo/Verde (Rollo 100m)', unit: 'rollo', basePrice: 28990, category: 'Conductores', reasoning: 'Norma SEC RIC N°04' },
    { name: 'Cable THHN/EVA 2.5mm² (Rollo 100m Enchufes)', unit: 'rollo', basePrice: 42990, category: 'Conductores', reasoning: 'Para circuitos de fuerza y enchufes' },
    { name: 'Disyuntor Termomagnético Legrand 1x16A 6kA Curva C', unit: 'un', basePrice: 5490, category: 'Protecciones', reasoning: 'Protección de sobrecarga circuito' },
    { name: 'Interruptor Diferencial Legrand 2x25A 30mA', unit: 'un', basePrice: 18990, category: 'Protecciones', reasoning: 'Seguridad contra electrocución SEC' },
    { name: 'Tubo Conduit PVC Conex 16mm x 3m (Autoextinguible)', unit: 'tira', basePrice: 1390, category: 'Canalización', reasoning: 'Canalización embutida tabique/losa' },
    { name: 'Caja Derivación Chuqui 5/8" PVC', unit: 'un', basePrice: 590, category: 'Cajas', reasoning: 'Distribución y paso de circuitos' },
    { name: 'Enchufe Doble 10/16A Bticino Modus Plus', unit: 'un', basePrice: 3890, category: 'Artefactos', reasoning: 'Placa armada de alta durabilidad' },
    { name: 'Interruptor 9/12 Bticino Modus Plus', unit: 'un', basePrice: 3290, category: 'Artefactos', reasoning: 'Comando de encendido luminarias' },
    { name: 'Foco Panel LED Embutido Redondo 18W Luz Cálida', unit: 'un', basePrice: 4990, category: 'Iluminación', reasoning: 'Iluminación general eficiente' }
  ],
  ceramicas: [
    { name: 'Porcelanato Rectificado 60x60cm Gres Esmaltado', unit: 'm²', basePrice: 12990, category: 'Revestimiento', reasoning: 'Tránsito medio/alto antideslizante' },
    { name: 'Adhesivo Cerámico Bekron DA Pasta (Saco 25kg)', unit: 'saco', basePrice: 8490, category: 'Adhesivos', reasoning: 'Doble acción para piso sobre losa/radier' },
    { name: 'Fragüe Impermeable Bekron Gris Plata (Bolsa 2kg)', unit: 'bolsa', basePrice: 3490, category: 'Terminación', reasoning: 'Sellado antiséptico para juntas de 2 a 5mm' },
    { name: 'Separadores Cruz 2mm (Bolsa 250 un)', unit: 'bolsa', basePrice: 2890, category: 'Accesorios', reasoning: 'Nivelación uniforme entre palmetas' },
    { name: 'Cuñas Niveladoras y Clips de Nivelación (Kit 100 un)', unit: 'kit', basePrice: 9990, category: 'Nivelación', reasoning: 'Evita cejas en porcelanato rectificado' }
  ],
  tabiqueria: [
    { name: 'Placa Yeso-Cartón Volcanita ST 10mm 1.20x2.40m', unit: 'placa', basePrice: 7990, category: 'Placas', reasoning: 'Cielos y tabiques estándar Volcán' },
    { name: 'Placa Volcanita RH 12.5mm Resistente Humedad 1.20x2.40m', unit: 'placa', basePrice: 11990, category: 'Placas', reasoning: 'Para zonas húmedas baños y cocinas' },
    { name: 'Perfil Montante Acero Galvanizado Metalcon 60x38x0.85mm 3m', unit: 'tira', basePrice: 4390, category: 'Estructura', reasoning: 'Estructuración vertical cada 40cm' },
    { name: 'Perfil Solera Acero Galvanizado Metalcon 62x20x0.85mm 3m', unit: 'tira', basePrice: 3890, category: 'Estructura', reasoning: 'Fijación superior e inferior' },
    { name: 'Lana de Vidrio Rollo Aislante Libre 50mm 1.2x12m Aislan', unit: 'rollo', basePrice: 26990, category: 'Aislación', reasoning: 'Aislación termoacústica MINVU OGUC' },
    { name: 'Tornillo Yeso-Cartón Trompeta 6x1" Punta Broca (Caja 1000)', unit: 'caja', basePrice: 7990, category: 'Fijaciones', reasoning: 'Fijación firme a perfiles metálicos' },
    { name: 'Pasta Junta Yeso Volcán (Tineta 25kg)', unit: 'tineta', basePrice: 14990, category: 'Terminación', reasoning: 'Tratamiento de juntura invisible' },
    { name: 'Cinta Papel Microperforada Volcán 50mm x 75m', unit: 'rollo', basePrice: 4290, category: 'Terminación', reasoning: 'Refuerzo anti-fisuras en uniones' }
  ],
  techumbre: [
    { name: 'Plancha Zinc-Alum Ondulada 0.35mm x 3.66m', unit: 'plancha', basePrice: 11490, category: 'Cubierta', reasoning: 'Resistencia a intemperie y corrosión' },
    { name: 'Costanera Perfil C 80x40x15x2.0mm Acero x 6m', unit: 'tira', basePrice: 15990, category: 'Estructura', reasoning: 'Apoyo y fijación de planchas' },
    { name: 'Fieltro Asfáltico 15 Libras (Rollo 40m²)', unit: 'rollo', basePrice: 17990, category: 'Impermeabilización', reasoning: 'Barrera de humedad bajo cubierta' },
    { name: 'Tornillo Autoperforante Techo con Golilla Neopreno 2" (100 un)', unit: 'ciento', basePrice: 6490, category: 'Fijaciones', reasoning: 'Sello hermético estanco sin filtraciones' },
    { name: 'Caballete Cumbrera Zinc-Alum 0.40mm x 2m', unit: 'un', basePrice: 5990, category: 'Terminación', reasoning: 'Remate superior cumbrera' }
  ],
  pintura: [
    { name: 'Esmalte al Agua Semibrillo Blanco Galón 1 Galón Sipa', unit: 'galon', basePrice: 21990, category: 'Pinturas', reasoning: 'Lavable, antiséptico para muros interiores' },
    { name: 'Látex Extracubriente Blanco Tineta 5 Galones Ceresita', unit: 'tineta', basePrice: 44990, category: 'Pinturas', reasoning: 'Cielos y muros de alto rendimiento' },
    { name: 'Pasta Muro Interior Tineta 25kg Tajamar', unit: 'tineta', basePrice: 12990, category: 'Preparación', reasoning: 'Nivelación y alisado previo a pintura' },
    { name: 'Lija de Agua Grano 120 / 180 (Pliego)', unit: 'un', basePrice: 490, category: 'Preparación', reasoning: 'Desbaste fino entre manos' },
    { name: 'Cinta Enmascarar Masking Tape 24mm x 40m', unit: 'rollo', basePrice: 1890, category: 'Accesorios', reasoning: 'Protección de marcos y zócalos' }
  ],
  gasfiteria: [
    { name: 'Tubo PPR Termofusión PN16 20mm x 4m Polifusión', unit: 'tira', basePrice: 4990, category: 'Agua Potable', reasoning: 'Sin fugas, resistente a presión y sarro' },
    { name: 'Tee PPR 20mm Polifusión', unit: 'un', basePrice: 690, category: 'Fittings', reasoning: 'Ramificaciones de agua fría y caliente' },
    { name: 'Llave de Paso Bola PPR 20mm con Manilla Metálica', unit: 'un', basePrice: 6990, category: 'Válvulas', reasoning: 'Corte individual por recinto' },
    { name: 'Tubo Sanitario PVC Gris 110mm x 3m Tigre', unit: 'tira', basePrice: 13990, category: 'Desagües', reasoning: 'Descarga principal WC y cámara' },
    { name: 'Tubo Sanitario PVC Gris 50mm x 3m Tigre', unit: 'tira', basePrice: 6990, category: 'Desagües', reasoning: 'Descarga lavamanos, tina y lavaplatos' },
    { name: 'Adhesivo PVC Sanitario Frasco 240cc con Pincel Vinilit', unit: 'frasco', basePrice: 4490, category: 'Pegamentos', reasoning: 'Soldadura química para empalmes PVC' }
  ],
  ampliacion: [
    { name: 'Cemento Melón Extra Especial (Saco 25kg)', unit: 'saco', basePrice: 4390, category: 'Hormigones', reasoning: 'Confección de radier y fundaciones' },
    { name: 'Arena Gruesa y Ripio Estructural m³ (A granel)', unit: 'm³', basePrice: 19990, category: 'Áridos', reasoning: 'Dosificación hormigón H20' },
    { name: 'Malla Acersa C-139 Electrooldada 2.6x5.0m', unit: 'malla', basePrice: 24990, category: 'Fierro', reasoning: 'Armadura retracción de radier' },
    { name: 'Pino Oregón o Radiata Dimensionado 2x4" x 3.2m', unit: 'pieza', basePrice: 5990, category: 'Maderas', reasoning: 'Estructuración de muros perimetrales' },
    { name: 'Polietileno 0.10mm Barrera de Humedad (Rollo 100m²)', unit: 'rollo', basePrice: 18990, category: 'Aislación', reasoning: 'Bajo radier para evitar humedad por capilaridad' }
  ],
  cctv: [
    { name: 'Cámara IP Bullet Exterior 4MP PoE Hikvision/Dahua IR 30m', unit: 'un', basePrice: 38990, category: 'Cámaras', reasoning: 'Visión nocturna IP67 para frontis y patios' },
    { name: 'Cámara Domo Interior 2MP PoE Gran Angular', unit: 'un', basePrice: 24990, category: 'Cámaras', reasoning: 'Monitoreo discreto recintos interiores' },
    { name: 'Grabador NVR 8 Canales 4K con Switch PoE Integrado', unit: 'un', basePrice: 94990, category: 'Equipos', reasoning: 'Alimentación directa por cable de red PoE' },
    { name: 'Disco Duro Western Digital Purple Vigilancia 2TB 24/7', unit: 'un', basePrice: 59990, category: 'Almacenamiento', reasoning: 'Grabación continua sin saltos' },
    { name: 'Bobina Cable Red UTP Cat6 100% Cobre Exterior (100m)', unit: 'bobina', basePrice: 36990, category: 'Cableado', reasoning: 'Transmisión de video y energía sin caída' }
  ],
  camaras: [],
  ampliaciones: [],
  cerrajeria: [],
  carpinteria: []
};
BASE_MATERIALS_CHILE.camaras = BASE_MATERIALS_CHILE.cctv;
BASE_MATERIALS_CHILE.ampliaciones = BASE_MATERIALS_CHILE.ampliacion;
BASE_MATERIALS_CHILE.cerrajeria = BASE_MATERIALS_CHILE.tabiqueria;
BASE_MATERIALS_CHILE.carpinteria = BASE_MATERIALS_CHILE.tabiqueria;

export const DEFAULT_SUPPLIERS: Supplier[] = [
  {
    id: 'sup_sodimac_cerrillos',
    name: 'Sodimac Homecenter Cerrillos',
    chain: 'Sodimac',
    address: 'Av. Américo Vespucio 1501, Cerrillos, Santiago',
    distanceKm: 2.4,
    phone: '+56 2 2489 5000',
    discountPercent: 5,
    rating: 4.6,
    lat: -33.5015,
    lng: -70.7095
  },
  {
    id: 'sup_easy_maipu',
    name: 'Easy Maipú Pajaritos',
    chain: 'Easy',
    address: 'Av. Los Pajaritos 1948, Maipú, Santiago',
    distanceKm: 3.8,
    phone: '+56 600 600 3010',
    discountPercent: 7,
    rating: 4.4,
    lat: -33.5050,
    lng: -70.7520
  },
  {
    id: 'sup_construmart_stgo',
    name: 'Construmart Panamericana Sur',
    chain: 'Construmart',
    address: 'Autopista Central 7500, San Bernardo / Santiago',
    distanceKm: 5.2,
    phone: '+56 2 2580 8000',
    discountPercent: 10,
    rating: 4.5,
    lat: -33.5410,
    lng: -70.6890
  },
  {
    id: 'sup_imperial_la_cisterna',
    name: 'Imperial Tableros & Maderas',
    chain: 'Imperial',
    address: 'Gran Avenida José Miguel Carrera 7900, La Cisterna',
    distanceKm: 4.6,
    phone: '+56 2 2439 7000',
    discountPercent: 8,
    rating: 4.7,
    lat: -33.5240,
    lng: -70.6620
  },
  {
    id: 'sup_chilemat_ferreteria',
    name: 'Ferretería Chilemat Don Pedro',
    chain: 'Chilemat',
    address: 'Av. Pedro Aguirre Cerda 5420, Cerrillos, Santiago',
    distanceKm: 1.1,
    phone: '+56 2 2557 3341',
    discountPercent: 12,
    rating: 4.8,
    lat: -33.4880,
    lng: -70.7080
  }
];

export const PROJECT_QUESTIONS: Record<ProjectType, ProjectQuestion[]> = {
  electricidad: [
    { id: 'length', label: 'Largo del Recinto (m)', type: 'number', isInteger: false, defaultValue: 5.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'width', label: 'Ancho del Recinto (m)', type: 'number', isInteger: false, defaultValue: 4.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'height', label: 'Altura de Muro (m)', type: 'number', isInteger: false, defaultValue: 2.4, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'numOutlets', label: 'Cantidad de Enchufes Dobles', type: 'number', isInteger: true, min: 0, defaultValue: 6, unit: 'unidades', helpText: 'Artefactos enteros (sin decimales)' },
    { id: 'numLights', label: 'Cantidad de Centros de Luz / Focos', type: 'number', isInteger: true, min: 0, defaultValue: 4, unit: 'unidades', helpText: 'Artefactos enteros (sin decimales)' },
    {
      id: 'voltageType',
      label: 'Tipo de Instalación',
      type: 'select',
      defaultValue: 'monofasica',
      options: [
        { label: 'Monofásica 220V Domiciliaria (SEC)', value: 'monofasica' },
        { label: 'Trifásica 380V Taller / Comercial', value: 'trifasica' }
      ]
    }
  ],
  ceramicas: [
    { id: 'length', label: 'Largo de la Superficie (m)', type: 'number', isInteger: false, defaultValue: 4.5, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'width', label: 'Ancho de la Superficie (m)', type: 'number', isInteger: false, defaultValue: 3.5, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'tileFormat', label: 'Formato de Palmeta', type: 'select', defaultValue: '60x60', options: [
      { label: 'Porcelanato 60x60 cm Rectificado', value: '60x60' },
      { label: 'Porcelanato 80x80 cm Gran Formato', value: '80x80' },
      { label: 'Cerámica 33x33 cm Estándar', value: '33x33' },
      { label: 'Cerámica Muro Baño 20x30 cm', value: '20x30' }
    ]},
    { id: 'wastePercent', label: 'Margen de Merma (%)', type: 'number', isInteger: false, defaultValue: 10, unit: '%' }
  ],
  tabiqueria: [
    { id: 'length', label: 'Largo Total del Tabique (m)', type: 'number', isInteger: false, defaultValue: 6.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'height', label: 'Altura del Tabique (m)', type: 'number', isInteger: false, defaultValue: 2.4, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'doors', label: 'Cantidad de Puertas de Paso', type: 'number', isInteger: true, min: 0, defaultValue: 1, unit: 'puertas', helpText: 'Artefactos enteros (sin decimales)' },
    { id: 'panelType', label: 'Tipo de Placa Yeso-Cartón', type: 'select', defaultValue: 'st', options: [
      { label: 'Volcanita Estándar ST 10mm (Dormitorios/Living)', value: 'st' },
      { label: 'Volcanita Resistente a la Humedad RH 12.5mm (Baño/Cocina)', value: 'rh' },
      { label: 'Volcanita Ignífuga RF 15mm (Corta-fuego)', value: 'rf' }
    ]}
  ],
  techumbre: [
    { id: 'length', label: 'Largo del Techo (m)', type: 'number', isInteger: false, defaultValue: 8.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'width', label: 'Ancho de Caída (m)', type: 'number', isInteger: false, defaultValue: 5.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'roofType', label: 'Tipo de Cubierta', type: 'select', defaultValue: 'zincalum', options: [
      { label: 'Zinc-Alum Ondulado 0.35mm', value: 'zincalum' },
      { label: 'Plancha PV-4 Trapezoidal Prepintada', value: 'pv4' },
      { label: 'Teja Asfáltica Gravillada 3 Lengüetas', value: 'asfaltica' }
    ]}
  ],
  pintura: [
    { id: 'length', label: 'Largo del Recinto (m)', type: 'number', isInteger: false, defaultValue: 5.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'width', label: 'Ancho del Recinto (m)', type: 'number', isInteger: false, defaultValue: 4.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'height', label: 'Altura de Muro (m)', type: 'number', isInteger: false, defaultValue: 2.4, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'coats', label: 'Número de Manos a Aplicar', type: 'number', isInteger: true, min: 1, defaultValue: 2, unit: 'manos', helpText: 'Número entero (sin decimales)' }
  ],
  gasfiteria: [
    { id: 'bathrooms', label: 'Cantidad de Baños Completos', type: 'number', isInteger: true, min: 1, defaultValue: 1, unit: 'recintos', helpText: 'Recintos enteros (sin decimales)' },
    { id: 'kitchen', label: 'Puntos de Cocina y Lavadero', type: 'number', isInteger: true, min: 0, defaultValue: 2, unit: 'puntos', helpText: 'Puntos enteros (sin decimales)' },
    { id: 'length', label: 'Largo Aproximado del Trazado (m)', type: 'number', isInteger: false, defaultValue: 12.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' }
  ],
  ampliacion: [
    { id: 'length', label: 'Largo de la Ampliación (m)', type: 'number', isInteger: false, defaultValue: 6.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'width', label: 'Ancho de la Ampliación (m)', type: 'number', isInteger: false, defaultValue: 4.0, unit: 'm', helpText: 'Medida en metros (permite decimales)' },
    { id: 'floors', label: 'Pisos de la Estructura', type: 'number', isInteger: true, min: 1, defaultValue: 1, unit: 'pisos', helpText: 'Pisos enteros (sin decimales)' }
  ],
  cctv: [
    { id: 'camerasExt', label: 'Cámaras Exterior Visión Nocturna IP67', type: 'number', isInteger: true, min: 0, defaultValue: 3, unit: 'cámaras', helpText: 'Artefactos enteros (sin decimales)' },
    { id: 'camerasInt', label: 'Cámaras Interiores Domo PoE', type: 'number', isInteger: true, min: 0, defaultValue: 2, unit: 'cámaras', helpText: 'Artefactos enteros (sin decimales)' },
    { id: 'storageDays', label: 'Días de Grabación Deseados', type: 'number', isInteger: true, min: 1, defaultValue: 15, unit: 'días', helpText: 'Días enteros (sin decimales)' }
  ],
  camaras: [],
  ampliaciones: [],
  cerrajeria: [],
  carpinteria: []
};
PROJECT_QUESTIONS.camaras = PROJECT_QUESTIONS.cctv;
PROJECT_QUESTIONS.ampliaciones = PROJECT_QUESTIONS.ampliacion;
PROJECT_QUESTIONS.cerrajeria = PROJECT_QUESTIONS.tabiqueria;
PROJECT_QUESTIONS.carpinteria = PROJECT_QUESTIONS.tabiqueria;
