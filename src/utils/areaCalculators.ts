import { ProjectType, QualityTier, AICalculationResult, MaterialItem } from '../types';
import { BASE_MATERIALS_CHILE, QUALITY_MULTIPLIERS } from '../data/chileData';

export function calculateAreaMaterialsLocal(
  projectType: ProjectType,
  measurements: Record<string, any>,
  quality: QualityTier = 'medio'
): AICalculationResult {
  const length = Number(measurements.length) || 5;
  const width = Number(measurements.width) || 4;
  const height = Number(measurements.height) || 2.4;
  const area = Math.round(length * width * 100) / 100;
  const perimeter = Math.round(2 * (length + width) * 100) / 100;
  const wallArea = Math.round(perimeter * height * 100) / 100;
  const mult = QUALITY_MULTIPLIERS[quality] || 1.0;

  const baseList = BASE_MATERIALS_CHILE[projectType] || [];
  let calculatedMaterials: MaterialItem[] = [];
  let technicalAdvice = 'Cálculo estructurado según normativa chilena y buenas prácticas de obra.';
  let safetyNote = 'Utilizar elementos de protección personal (EPP) y verificar cortes de energía o agua.';
  let savingTips = 'Cotizar con ferreterías de barrio o distribuidores oficiales para obtener descuentos por volumen.';
  let laborMultiplier = 0.45;

  switch (projectType) {
    case 'electricidad': {
      const outlets = Number(measurements.numOutlets) || 6;
      const lights = Number(measurements.numLights) || 4;
      technicalAdvice = 'Normativa SEC Pliego RIC N°10: Circuitos separados de enchufes y alumbrado con diferencial de 30mA.';
      safetyNote = 'Desenergizar el automático general y comprobar ausencia de tensión antes de manipular.';
      savingTips = 'Comprar rollos de 100m de cable libre de halógenos EVA/H07Z1-K rinde hasta 35% más barato que por metro fraccionado.';
      laborMultiplier = 0.45;

      calculatedMaterials = [
        {
          id: `calc_elec_1_${Date.now()}`,
          name: 'Cable THHN/EVA 1.5mm² Alumbrado (Rollo 100m)',
          unit: 'rollo',
          basePrice: Math.round(28990 * mult),
          quantity: Math.max(1, Math.ceil(lights * 0.3)),
          selected: true,
          category: 'Conductores',
          reasoning: `Cableado para ${lights} centros de luz según norma SEC`,
          aiCalculated: true
        },
        {
          id: `calc_elec_2_${Date.now()}`,
          name: 'Cable THHN/EVA 2.5mm² Enchufes (Rollo 100m)',
          unit: 'rollo',
          basePrice: Math.round(42990 * mult),
          quantity: Math.max(1, Math.ceil(outlets * 0.4)),
          selected: true,
          category: 'Conductores',
          reasoning: `Circuito de fuerza para ${outlets} módulos de enchufe`,
          aiCalculated: true
        },
        {
          id: `calc_elec_3_${Date.now()}`,
          name: 'Enchufe Doble 10/16A Bticino Modus Plus',
          unit: 'un',
          basePrice: Math.round(3890 * mult),
          quantity: outlets,
          selected: true,
          category: 'Artefactos',
          reasoning: `${outlets} placas dobles completas con bastidor`,
          aiCalculated: true
        },
        {
          id: `calc_elec_4_${Date.now()}`,
          name: 'Foco Panel LED Embutido Redondo 18W',
          unit: 'un',
          basePrice: Math.round(4990 * mult),
          quantity: lights,
          selected: true,
          category: 'Iluminación',
          reasoning: `${lights} luminarias de alto rendimiento energético`,
          aiCalculated: true
        },
        {
          id: `calc_elec_5_${Date.now()}`,
          name: 'Disyuntor Termomagnético 1x16A Curva C Legrand',
          unit: 'un',
          basePrice: Math.round(5490 * mult),
          quantity: 2,
          selected: true,
          category: 'Protecciones',
          reasoning: '1 para alumbrado + 1 para circuito de enchufes',
          aiCalculated: true
        },
        {
          id: `calc_elec_6_${Date.now()}`,
          name: 'Interruptor Diferencial 2x25A 30mA Legrand',
          unit: 'un',
          basePrice: Math.round(18990 * mult),
          quantity: 1,
          selected: true,
          category: 'Protecciones',
          reasoning: 'Obligatorio por norma SEC para protección humana',
          aiCalculated: true
        },
        {
          id: `calc_elec_7_${Date.now()}`,
          name: 'Tubo Conduit PVC 16mm x 3m Autoextinguible',
          unit: 'tira',
          basePrice: Math.round(1390 * mult),
          quantity: Math.ceil(perimeter * 0.8),
          selected: true,
          category: 'Canalización',
          reasoning: 'Distribución perimetral embutida',
          aiCalculated: true
        }
      ];
      break;
    }

    case 'ceramicas': {
      const waste = (Number(measurements.wastePercent) || 10) / 100;
      const totalAreaWithWaste = Math.round(area * (1 + waste) * 100) / 100;
      const adhesiveBags = Math.ceil(totalAreaWithWaste / 4.2); // ~4.2 m2 por saco 25kg
      const groutBags = Math.ceil(totalAreaWithWaste / 12); // ~12 m2 por bolsa 2kg

      technicalAdvice = `Área neta: ${area}m² + ${measurements.wastePercent || 10}% merma = ${totalAreaWithWaste}m². Aplicar con llana dentada de 10mm en doble encolado si el porcelanato supera 45x45.`;
      safetyNote = 'Usar rodilleras ergonómicas y antiparras durante el corte con guillotina o esmeril.';
      savingTips = 'Revisar que todas las cajas sean del mismo tono y calibre para no tener desperdicios ni diferencias estéticas.';
      laborMultiplier = 0.40;

      calculatedMaterials = [
        {
          id: `calc_cer_1_${Date.now()}`,
          name: 'Porcelanato / Cerámica Rectificada',
          unit: 'm²',
          basePrice: Math.round(12990 * mult),
          quantity: totalAreaWithWaste,
          selected: true,
          category: 'Revestimiento',
          reasoning: `Superficie calculada ${area}m² con ${Math.round(waste * 100)}% de merma`,
          aiCalculated: true
        },
        {
          id: `calc_cer_2_${Date.now()}`,
          name: 'Adhesivo Bekron DA Pasta (Saco 25kg)',
          unit: 'saco',
          basePrice: Math.round(8490 * mult),
          quantity: adhesiveBags,
          selected: true,
          category: 'Adhesivos',
          reasoning: `Rendimiento de ~4.2 m² por saco de 25kg`,
          aiCalculated: true
        },
        {
          id: `calc_cer_3_${Date.now()}`,
          name: 'Fragüe Impermeable Bekron (Bolsa 2kg)',
          unit: 'bolsa',
          basePrice: Math.round(3490 * mult),
          quantity: Math.max(1, groutBags),
          selected: true,
          category: 'Terminación',
          reasoning: 'Sellado de juntas con aditivo antihongos',
          aiCalculated: true
        },
        {
          id: `calc_cer_4_${Date.now()}`,
          name: 'Cuñas y Clips Niveladores (Kit 100 un)',
          unit: 'kit',
          basePrice: Math.round(9990 * mult),
          quantity: Math.max(1, Math.ceil(totalAreaWithWaste / 10)),
          selected: true,
          category: 'Nivelación',
          reasoning: 'Garantiza superficie 100% plana sin cejas',
          aiCalculated: true
        }
      ];
      break;
    }

    case 'tabiqueria': {
      const wallLen = Number(measurements.length) || 6.0;
      const wallH = Number(measurements.height) || 2.4;
      const tabiqueArea = Math.round(wallLen * wallH * 100) / 100;
      // 2 caras de volcanita
      const platesCount = Math.ceil((tabiqueArea * 2 * 1.08) / 2.88); // 1.20x2.40m = 2.88m2
      const studsCount = Math.ceil(wallLen / 0.40) + 2; // montantes cada 40cm
      const solerasCount = Math.ceil((wallLen * 2) / 3.0); // solera sup e inf
      const insulRolls = Math.ceil(tabiqueArea / 14.4); // rollo 14.4 m2

      technicalAdvice = `Tabique de ${wallLen}m x ${wallH}m (${tabiqueArea}m²). Montantes cada 40cm para rigidez estructural según norma sísmica NCh433.`;
      safetyNote = 'Mascarilla contra polvo al cortar planchas de volcanita y guantes anticorte.';
      savingTips = 'Instalar soleras con fijaciones Hilti o tarugos clavo cada 60cm maximiza la firmeza con mínimo gasto.';
      laborMultiplier = 0.38;

      calculatedMaterials = [
        {
          id: `calc_tab_1_${Date.now()}`,
          name: 'Placa Volcanita ST 10mm 1.20x2.40m',
          unit: 'placa',
          basePrice: Math.round(7990 * mult),
          quantity: platesCount,
          selected: true,
          category: 'Placas',
          reasoning: `${tabiqueArea}m² a 2 caras = ${tabiqueArea * 2}m² con 8% merma`,
          aiCalculated: true
        },
        {
          id: `calc_tab_2_${Date.now()}`,
          name: 'Montante Acero Metalcon 60x38x0.85mm 3m',
          unit: 'tira',
          basePrice: Math.round(4390 * mult),
          quantity: studsCount,
          selected: true,
          category: 'Estructura',
          reasoning: `Montantes verticales cada 40cm a lo largo de ${wallLen}m`,
          aiCalculated: true
        },
        {
          id: `calc_tab_3_${Date.now()}`,
          name: 'Solera Acero Metalcon 62x20x0.85mm 3m',
          unit: 'tira',
          basePrice: Math.round(3890 * mult),
          quantity: solerasCount,
          selected: true,
          category: 'Estructura',
          reasoning: 'Guía superior e inferior en piso y cielo',
          aiCalculated: true
        },
        {
          id: `calc_tab_4_${Date.now()}`,
          name: 'Lana de Vidrio Rollo Aislante Libre 50mm 14m²',
          unit: 'rollo',
          basePrice: Math.round(26990 * mult),
          quantity: Math.max(1, insulRolls),
          selected: true,
          category: 'Aislación',
          reasoning: 'Aislación termoacústica interior',
          aiCalculated: true
        },
        {
          id: `calc_tab_5_${Date.now()}`,
          name: 'Tornillo Trompeta 6x1" Punta Broca (Caja 1000)',
          unit: 'caja',
          basePrice: Math.round(7990 * mult),
          quantity: Math.ceil(platesCount / 12) || 1,
          selected: true,
          category: 'Fijaciones',
          reasoning: 'Fijación de placas cada 25cm',
          aiCalculated: true
        },
        {
          id: `calc_tab_6_${Date.now()}`,
          name: 'Pasta Junta Yeso Volcán (Tineta 25kg)',
          unit: 'tineta',
          basePrice: Math.round(14990 * mult),
          quantity: 1,
          selected: true,
          category: 'Terminación',
          reasoning: 'Tratamiento de juntas invisibles',
          aiCalculated: true
        }
      ];
      break;
    }

    case 'pintura': {
      const coats = Number(measurements.coats) || 2;
      const totalPaintArea = wallArea * coats;
      const galonesParedes = Math.ceil(totalPaintArea / 35); // ~35 m2 por galon por mano
      const tinetaTecho = Math.ceil(area * coats / 150) || 1;

      technicalAdvice = `Superficie muro: ${wallArea}m² x ${coats} manos = ${totalPaintArea}m². Aplicar sellador acrílico fijador si el muro es nuevo.`;
      safetyNote = 'Ventilación constante y uso de cinta masking para bordes limpios sin salpicaduras.';
      savingTips = 'Comprar tineta de 5 galones en lugar de galones individuales ahorra hasta un 25% del presupuesto de pintura.';
      laborMultiplier = 0.50;

      calculatedMaterials = [
        {
          id: `calc_pint_1_${Date.now()}`,
          name: 'Esmalte al Agua Semibrillo Lavable (Galón)',
          unit: 'galon',
          basePrice: Math.round(21990 * mult),
          quantity: Math.max(1, galonesParedes),
          selected: true,
          category: 'Pinturas',
          reasoning: `${totalPaintArea}m² cubiertos en ${coats} manos`,
          aiCalculated: true
        },
        {
          id: `calc_pint_2_${Date.now()}`,
          name: 'Látex Blanco Cielos (Galón)',
          unit: 'galon',
          basePrice: Math.round(14990 * mult),
          quantity: Math.max(1, Math.ceil((area * coats) / 35)),
          selected: true,
          category: 'Pinturas',
          reasoning: 'Cielos y molduras superiores',
          aiCalculated: true
        },
        {
          id: `calc_pint_3_${Date.now()}`,
          name: 'Pasta Muro Interior (Tineta 25kg)',
          unit: 'tineta',
          basePrice: Math.round(12990 * mult),
          quantity: Math.max(1, Math.ceil(wallArea / 40)),
          selected: true,
          category: 'Preparación',
          reasoning: 'Reparación y empaste previo',
          aiCalculated: true
        },
        {
          id: `calc_pint_4_${Date.now()}`,
          name: 'Cinta Enmascarar Masking Tape 24mm',
          unit: 'rollo',
          basePrice: Math.round(1890 * mult),
          quantity: Math.ceil(perimeter / 15) || 2,
          selected: true,
          category: 'Accesorios',
          reasoning: 'Protección de molduras y zócalos',
          aiCalculated: true
        }
      ];
      break;
    }

    default: {
      // Fallback: adapt from BASE_MATERIALS_CHILE with sensible quantities
      calculatedMaterials = baseList.map((m, idx) => ({
        id: `calc_gen_${idx}_${Date.now()}`,
        name: m.name,
        unit: m.unit,
        basePrice: Math.round(m.basePrice * mult),
        quantity: idx === 0 ? Math.max(1, Math.round(area * 0.5)) : idx === 1 ? 2 : 1,
        selected: true,
        category: m.category,
        reasoning: m.reasoning || `Requerido para obra de ${projectType}`,
        aiCalculated: true
      }));
      break;
    }
  }

  return {
    materials: calculatedMaterials,
    technicalAdvice,
    safetyNote,
    savingTips,
    estimatedLaborMultiplier: laborMultiplier
  };
}
