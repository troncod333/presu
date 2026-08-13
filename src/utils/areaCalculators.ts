import { ProjectType, MaterialItem } from '../types';
import { BASE_MATERIALS_CHILE, QUALITY_MULTIPLIERS } from '../data/chileData';

export interface AreaCalculationOutput {
  materials: MaterialItem[];
  technicalAdvice: string;
  safetyNote: string;
  savingTips: string;
  estimatedLaborMultiplier: number;
}

export function calculateAreaMaterialsLocal(
  projectType: ProjectType,
  measurements: Record<string, any>,
  quality: 'bajo' | 'medio' | 'premium' = 'medio'
): AreaCalculationOutput {
  const qualityMult = QUALITY_MULTIPLIERS[quality] || 1.0;
  const baseMats = BASE_MATERIALS_CHILE[projectType] || [];

  let calculated: { name: string; unit: string; basePrice: number; quantity: number; category: string; reasoning: string }[] = [];
  let technicalAdvice = '';
  let safetyNote = '';
  let savingTips = '';
  let laborMult = 0.45;

  switch (projectType) {
    case 'electricidad': {
      const isSobrepuesto = (measurements.installType || 'embutido') === 'sobrepuesto';
      const forceCircuits = Number(measurements.forceCircuits) || 0;
      const outlets = Number(measurements.outlets) || 10;
      const lights = Number(measurements.lights) || 6;
      const distance = Number(measurements.distance) || 40;
      const rooms = Number(measurements.rooms) || 3;

      laborMult = isSobrepuesto ? 0.40 : 0.50; // Embutido requiere ranurado de muro

      technicalAdvice = `Conforme a la norma SEC RIC N°02 y N°10 en Chile:
• Modalidad ${isSobrepuesto ? 'SOBREPUESTA' : 'EMBUTIDA'}: ${isSobrepuesto ? 'Uso de canaletas PVC libre de halógenos fijos con tarugos y tornillos a muro cada 40cm, con cajas sobrepuestas.' : 'Tubería conduit PVC rígido embutida en muro/cielo con cajas octogonales y rectangulares embutidas.'}
• Circuitos de Fuerza (RIC N°10): ${forceCircuits > 0 ? `${forceCircuits} circuito(s) independiente(s) con conductor THHN 4.0mm² (hasta 25A) y automáticos C20/C25A dedicados para cocina, horno eléctrico, lavadora o termo.` : 'Se recomienda al menos 1 circuito exclusivo de fuerza para zona de cocina y logia.'}
• Toda la instalación debe contar con conductor de protección a tierra (Verde) y protector diferencial de 30mA (RIC N°02).`;

      safetyNote = 'OBLIGATORIO SEC: Desconectar energía en el empalme o automático general antes de manipular. Realizar medición de continuidad, aislamiento e impedancia de bucle de tierra.';
      savingTips = isSobrepuesto
        ? 'Las canaletas PVC con cinta adhesiva de doble contacto (ej. Dexson / Legrand) reducen significativamente el tiempo de montaje y evitan romper albañilería.'
        : 'Aprovecha las tuberías conduit embutidas respetando el factor de ocupación del 40% según norma SEC para no sobrecalentar conductores.';

      const baseCableMeters = Math.ceil(distance * 3 * 1.1);
      const forceCableMeters = forceCircuits > 0 ? Math.ceil(distance * 0.5 * 3 * forceCircuits * 1.1) : 0;

      calculated = [];

      // Cableado Alumbrado y Enchufes Generales (2.5mm²)
      calculated.push({
        name: 'Cable 2.5mm² THHN (Rojo/Blanco/Verde)',
        unit: 'metro',
        basePrice: Math.round(650 * qualityMult),
        quantity: baseCableMeters,
        category: 'Cableado',
        reasoning: `${distance}m de trazado x 3 conductores (Fase, Neutro, Tierra) + 10% merma`
      });

      // Cableado Fuerza (4.0mm²)
      if (forceCircuits > 0) {
        calculated.push({
          name: 'Cable 4.0mm² THHN Alta Potencia (Rojo/Blanco/Verde)',
          unit: 'metro',
          basePrice: Math.round(980 * qualityMult),
          quantity: forceCableMeters,
          category: 'Cableado de Fuerza',
          reasoning: `${forceCircuits} circuito(s) de fuerza x tramo promedio x 3 conductores para cargas de hasta 25A`
        });
      }

      // Artefactos según modalidad
      if (isSobrepuesto) {
        calculated.push({
          name: 'Enchufe Doble 10A/16A Sobrepuesto Bticino / Marisio',
          unit: 'unidad',
          basePrice: Math.round(3200 * qualityMult),
          quantity: outlets,
          category: 'Artefactos',
          reasoning: `${outlets} enchufes de caja sobrepuesta para montaje en muro`
        });
        calculated.push({
          name: 'Interruptor Simple Sobrepuesto Bticino',
          unit: 'unidad',
          basePrice: Math.round(2600 * qualityMult),
          quantity: Math.ceil(lights * 0.8),
          category: 'Artefactos',
          reasoning: 'Puntos de comando sobrepuestos para iluminación'
        });
      } else {
        calculated.push({
          name: 'Enchufe Doble 10A/16A Embutido con Toma Tierra Bticino',
          unit: 'unidad',
          basePrice: Math.round(2600 * qualityMult),
          quantity: outlets,
          category: 'Artefactos',
          reasoning: `${outlets} puntos de enchufe embutidos con placa de terminación`
        });
        calculated.push({
          name: 'Interruptor Simple Embutido Bticino',
          unit: 'unidad',
          basePrice: Math.round(2100 * qualityMult),
          quantity: Math.ceil(lights * 0.8),
          category: 'Artefactos',
          reasoning: 'Puntos de comando embutidos para iluminación'
        });
      }

      // Enchufes de Fuerza (RIC N°10)
      if (forceCircuits > 0) {
        calculated.push({
          name: 'Enchufe Shuko / Fuerza 16A/20A Reforzado (Cocina/Lavadora)',
          unit: 'unidad',
          basePrice: Math.round(4200 * qualityMult),
          quantity: forceCircuits * 2,
          category: 'Artefactos de Fuerza',
          reasoning: `2 tomas reforzadas de 16A/20A por cada circuito de fuerza de alto consumo`
        });
      }

      // Iluminación
      calculated.push({
        name: isSobrepuesto ? 'Panel LED 24W Sobrepuesto Redondo/Cuadrado' : 'Panel LED 24W Embutido Redondo Blanco',
        unit: 'unidad',
        basePrice: Math.round(8900 * qualityMult),
        quantity: lights,
        category: 'Iluminación',
        reasoning: `${lights} luminarias LED ${isSobrepuesto ? 'sobrepuestas' : 'embutidas'} de alta eficiencia`
      });

      // Canalización según modalidad
      if (isSobrepuesto) {
        calculated.push({
          name: 'Canaleta PVC con Adhesivo Dexson 20x12mm (Tira 2m)',
          unit: 'tira',
          basePrice: Math.round(1850 * qualityMult),
          quantity: Math.ceil((distance * 0.7) / 2),
          category: 'Canalización Sobrepuesta',
          reasoning: 'Canaleta blanca para trazado principal de enchufes e iluminación'
        });
        if (forceCircuits > 0) {
          calculated.push({
            name: 'Canaleta PVC 40x25mm para Circuitos de Fuerza (Tira 2m)',
            unit: 'tira',
            basePrice: Math.round(3400 * qualityMult),
            quantity: Math.ceil((distance * 0.3 + forceCableMeters / 3) / 2),
            category: 'Canalización Sobrepuesta',
            reasoning: 'Canaleta de mayor sección para alojar conductores de 4.0mm² de fuerza'
          });
        }
        calculated.push({
          name: 'Caja Registro / Derivación Sobrepuesta IP44',
          unit: 'unidad',
          basePrice: Math.round(1450 * qualityMult),
          quantity: Math.ceil((outlets + lights) * 0.8),
          category: 'Canalización Sobrepuesta',
          reasoning: 'Cajas de derivación exterior para canaleta'
        });
        calculated.push({
          name: 'Pack Tarugos 6mm + Tornillos de Fijación Muro (Pack 50)',
          unit: 'pack',
          basePrice: Math.round(2900 * qualityMult),
          quantity: Math.max(1, Math.ceil(distance / 15)),
          category: 'Fijaciones',
          reasoning: 'Fijación mecánica de canaletas PVC a pared'
        });
      } else {
        calculated.push({
          name: 'Tubería Conduit PVC Rígido 20mm (Tira 3m)',
          unit: 'tira',
          basePrice: Math.round(1350 * qualityMult),
          quantity: Math.ceil(distance / 3),
          category: 'Canalización Embutida',
          reasoning: `${distance}m de trazado en tiras de 3 metros`
        });
        calculated.push({
          name: 'Caja Derivación Embutida 100x100mm',
          unit: 'unidad',
          basePrice: Math.round(950 * qualityMult),
          quantity: Math.ceil((outlets + lights) * 0.6),
          category: 'Canalización Embutida',
          reasoning: 'Cajas embutidas para derivación y empalmes'
        });
        calculated.push({
          name: 'Caja Estándar Embutida 75x115mm Rectangular',
          unit: 'unidad',
          basePrice: Math.round(450 * qualityMult),
          quantity: outlets + lights,
          category: 'Canalización Embutida',
          reasoning: 'Cajas embutidas para alojar módulos de interruptores y enchufes'
        });
      }

      // Protecciones y Tablero
      const totalCircuits = (rooms + 1) + forceCircuits;
      const boardPolos = totalCircuits <= 6 ? 8 : (totalCircuits <= 10 ? 12 : 18);

      calculated.push({
        name: 'Automático Termomagnético 16A C-Curve Bticino',
        unit: 'unidad',
        basePrice: Math.round(4800 * qualityMult),
        quantity: Math.ceil(rooms + 1),
        category: 'Protección',
        reasoning: 'Protecciones individuales para alumbrado y enchufes generales'
      });

      if (forceCircuits > 0) {
        calculated.push({
          name: 'Automático Termomagnético 20A/25A Fuerza Bticino C-Curve',
          unit: 'unidad',
          basePrice: Math.round(5600 * qualityMult),
          quantity: forceCircuits,
          category: 'Protección de Fuerza',
          reasoning: `${forceCircuits} automático(s) dedicado(s) para circuito(s) de alta potencia`
        });
      }

      calculated.push({
        name: 'Interruptor Diferencial 2x25A 30mA SEC Legrand/Bticino',
        unit: 'unidad',
        basePrice: Math.round(28000 * qualityMult),
        quantity: Math.max(1, Math.ceil(totalCircuits / 3)),
        category: 'Protección',
        reasoning: 'Protección diferencial contra contactos indirectos (RIC N°02)'
      });

      calculated.push({
        name: `Tablero Distribución Eléctrico ${boardPolos} Polos ${isSobrepuesto ? 'Sobrepuesto' : 'Embutido'} IP40`,
        unit: 'unidad',
        basePrice: Math.round((19500 + boardPolos * 1200) * qualityMult),
        quantity: 1,
        category: 'Tableros',
        reasoning: `Tablero modular de ${boardPolos} polos para alojar ${totalCircuits} circuitos`
      });

      calculated.push({
        name: 'Cinta Aisladora 3M Temflex 1700 (18m)',
        unit: 'unidad',
        basePrice: Math.round(1800 * qualityMult),
        quantity: Math.max(2, Math.ceil(rooms / 2)),
        category: 'Insumos',
        reasoning: 'Insumo de aislación y orden de conductores'
      });
      break;
    }

    case 'camaras': {
      const cameraLocation = measurements.cameraLocation || 'exterior';
      const conduitType = measurements.conduitType || 'sobrepuesto';
      const monitorCount = Number(measurements.monitors) || 1;
      const cameras = Number(measurements.cameras) || 4;
      const cableDist = Number(measurements.cableDistance) || 25;
      const recDays = Number(measurements.recordingDays) || 15;

      laborMult = 0.35;
      technicalAdvice = `Recomendación técnica para proyecto de CCTV en Chile:
• Ubicación (${cameraLocation.toUpperCase()}): ${cameraLocation === 'exterior' ? 'Cámaras IP con certificación IP67 intemperie y cajas estancas IP65 con prensaestopas en cada punto.' : cameraLocation === 'interior' ? 'Dómicam IP antirrobo para montaje interior.' : 'Combinación de cámaras IP exteriores IP67 e interiores.'}
• Canalización (${conduitType.toUpperCase()}): ${conduitType === 'sobrepuesto' ? 'Canaleta PVC blanca Dexson/Legrand o tubo conduit exterior fijado con abrazaderas a muro.' : 'Tubería conduit embutida en muro o paso por entretecho.'}
• Red y Video: Cable UTP Cat6 100% Cobre para evitar caídas de tensión en transmisión PoE.
• Monitoreo (${monitorCount} pantalla/s): ${monitorCount > 0 ? `${monitorCount} monitor(es) LED Full HD con cable HDMI reforzado.` : 'Acceso remoto configurado en teléfonos móviles y PC mediante servidor P2P seguro.'}`;

      safetyNote = 'Usar arnés anticaídas en trabajos sobre 1.8m. Asegurar sellado estanco de conectores RJ45 exteriores con botas impermeables.';
      savingTips = 'El uso de Switch PoE centraliza el respaldo de energía mediante una sola UPS para el grabador y todas las cámaras.';

      const totalUtpMeters = Math.ceil(cameras * cableDist * 1.15);
      const hddCapacity = recDays > 15 ? '2TB' : '1TB';
      const hddPrice = recDays > 15 ? 72000 : 49000;

      calculated = [];

      // Cámaras según ubicación
      if (cameraLocation === 'exterior') {
        calculated.push({
          name: 'Cámara IP Bala/Domo 2MP/4MP Exterior IP67 Infrarroja',
          unit: 'unidad',
          basePrice: Math.round(58000 * qualityMult),
          quantity: cameras,
          category: 'Cámaras Exterior',
          reasoning: `${cameras} unidades para intemperie con protección IP67 y visión nocturna`
        });
        calculated.push({
          name: 'Caja Registro Estanca IP65 con Prensaestopas',
          unit: 'unidad',
          basePrice: Math.round(2400 * qualityMult),
          quantity: cameras,
          category: 'Accesorios Exterior',
          reasoning: 'Caja estanca para resguardar conectores RJ45 y jack de energía de la lluvia'
        });
      } else if (cameraLocation === 'interior') {
        calculated.push({
          name: 'Cámara IP Domo Compacta 2MP Interior',
          unit: 'unidad',
          basePrice: Math.round(4200 * qualityMult),
          quantity: cameras,
          category: 'Cámaras Interior',
          reasoning: `${cameras} domos interiores discretos`
        });
      } else {
        const extCount = Math.ceil(cameras / 2);
        const intCount = cameras - extCount;
        calculated.push({
          name: 'Cámara IP Exterior IP67 Intemperie',
          unit: 'unidad',
          basePrice: Math.round(58000 * qualityMult),
          quantity: extCount,
          category: 'Cámaras',
          reasoning: `${extCount} cámaras blindadas para perímetros exteriores`
        });
        calculated.push({
          name: 'Cámara IP Domo Interior',
          unit: 'unidad',
          basePrice: Math.round(4200 * qualityMult),
          quantity: intCount,
          category: 'Cámaras',
          reasoning: `${intCount} cámaras para recintos interiores`
        });
        calculated.push({
          name: 'Caja Registro Estanca IP65 con Prensaestopas',
          unit: 'unidad',
          basePrice: Math.round(2400 * qualityMult),
          quantity: extCount,
          category: 'Accesorios Exterior',
          reasoning: 'Resguardo de conexiones de exterior'
        });
      }

      // Grabación y Almacenamiento
      calculated.push({
        name: 'NVR / DVR Grabador 8 Canales 4K PoE Hikvision/Dahua',
        unit: 'unidad',
        basePrice: Math.round(75000 * qualityMult),
        quantity: 1,
        category: 'Grabación',
        reasoning: 'Grabador central con soporte PoE y gestión vía App P2P'
      });
      calculated.push({
        name: `Disco Duro ${hddCapacity} Western Digital Purple Vigilancia 24/7`,
        unit: 'unidad',
        basePrice: Math.round(hddPrice * qualityMult),
        quantity: 1,
        category: 'Almacenamiento',
        reasoning: `Unidad de almacenamiento dedicada para ${recDays} días de grabación continua`
      });

      // Cableado y Redes
      calculated.push({
        name: 'Cable UTP Cat6 100% Cobre Exterior / Interior (metro)',
        unit: 'metro',
        basePrice: Math.round(450 * qualityMult),
        quantity: totalUtpMeters,
        category: 'Cableado',
        reasoning: `${cameras} cámaras x ${cableDist}m + 15% de holgura de recorrido`
      });
      calculated.push({
        name: 'Pack 50 Conectores RJ45 Cat6 + Botas Protecciones',
        unit: 'pack',
        basePrice: Math.round(9500 * qualityMult),
        quantity: 1,
        category: 'Conectores',
        reasoning: 'Conectores RJ45 blindados con alivio de tensión'
      });
      calculated.push({
        name: 'Switch PoE 8 Puertos 10/100 Mbps',
        unit: 'unidad',
        basePrice: Math.round(49000 * qualityMult),
        quantity: 1,
        category: 'Redes',
        reasoning: 'Alimentación de datos y corriente PoE por el mismo cable UTP'
      });

      // Canalización según opción
      if (conduitType === 'sobrepuesto') {
        calculated.push({
          name: 'Canaleta PVC con Adhesivo 20x12mm Dexson (Tira 2m)',
          unit: 'tira',
          basePrice: Math.round(1850 * qualityMult),
          quantity: Math.ceil((totalUtpMeters * 0.6) / 2),
          category: 'Canalización Sobrepuesta',
          reasoning: 'Canaleta PVC para orden de cableado en muros'
        });
        calculated.push({
          name: 'Pack Tarugos 6mm + Tornillos de Fijación (Pack 50)',
          unit: 'pack',
          basePrice: Math.round(2900 * qualityMult),
          quantity: Math.max(1, Math.ceil(cameras / 2)),
          category: 'Fijaciones',
          reasoning: 'Anclaje de canaletas y bases de cámaras'
        });
      } else {
        calculated.push({
          name: 'Tubería Conduit PVC Rígido 20mm (Tira 3m)',
          unit: 'tira',
          basePrice: Math.round(1350 * qualityMult),
          quantity: Math.ceil((totalUtpMeters * 0.5) / 3),
          category: 'Canalización Embutida',
          reasoning: 'Canalización embutida bajo muros o losas'
        });
      }

      // Monitores opcionales
      if (monitorCount > 0) {
        calculated.push({
          name: 'Monitor LED 22" Full HD con Entrada HDMI/VGA',
          unit: 'unidad',
          basePrice: Math.round(89000 * qualityMult),
          quantity: monitorCount,
          category: 'Monitoreo',
          reasoning: `${monitorCount} pantalla(s) de visualización directa para consolas de seguridad`
        });
        calculated.push({
          name: 'Cable HDMI 2.0 Alta Velocidad 3 metros',
          unit: 'unidad',
          basePrice: Math.round(4900 * qualityMult),
          quantity: monitorCount,
          category: 'Monitoreo',
          reasoning: 'Conexión de video digital entre NVR y monitor'
        });
      }

      break;
    }

    case 'ceramicas': {
      const surfaceType = measurements.surfaceType || 'losa';
      const tileType = measurements.tileType || 'ceramica';
      const wetArea = measurements.wetArea || 'no';
      const floorArea = Number(measurements.floorArea) || 20;
      const wallArea = Number(measurements.wallArea) || 0;
      const wastePercent = Number(measurements.wasteMargin) || 10;

      const totalArea = floorArea + wallArea;
      const areaWithWaste = totalArea * (1 + wastePercent / 100);

      laborMult = 0.50;
      technicalAdvice = `Especificaciones técnicas de revestimiento (Norma NCh 353):
• Revestimiento (${tileType === 'porcelanato' ? 'PORCELANATO' : 'CERÁMICA'}): ${tileType === 'porcelanato' ? 'Porcelanato rectificado. Exige pegamento Bekron Porcelanato y sistema de nivelación (cuñas y clips).' : 'Cerámica estándar adherida con mortero o pasta.'}
• Base de Adhesión (${surfaceType.toUpperCase()}): ${surfaceType === 'tabique' ? 'Muro en Volcanita/Fibrocemento exige Adhesivo en Pasta listo para usar.' : surfaceType === 'existente' ? 'Superficie existente exige aplicar Promotor de Adherencia (Primer Tégula) antes de pegar.' : 'Losa o radier de hormigón utiliza pegamento en polvo Bekron/Cadina.'}
• Zona Húmeda (${wetArea.toUpperCase()}): ${wetArea === 'si' ? 'Exige membrana impermeabilizante elástica previa al pegado y fragüe hidrófugo anti-hongos.' : 'Zonas secas.'}`;

      safetyNote = 'Usar antiparras de impacto para corte de palmetas con esmeril o cortadora manual, y rodilleras ergonómicas de protección.';
      savingTips = 'Mide y verifica la coincidencia del número de lote ("Tono" y "Calibre") impreso en las cajas antes de instalar.';

      const adhesiveBags = Math.max(2, Math.ceil(areaWithWaste / 4.5));
      const groutBags = Math.max(1, Math.ceil(areaWithWaste / 18));

      calculated = [];

      // Palmetas
      if (tileType === 'porcelanato') {
        calculated.push({
          name: 'Porcelanato 60x60cm Rectificado Pulido / Mate',
          unit: 'm²',
          basePrice: Math.round(14990 * qualityMult),
          quantity: Math.ceil(areaWithWaste),
          category: 'Revestimiento Porcelanato',
          reasoning: `${totalArea} m² + ${wastePercent}% merma por cortes rectos y diagonales`
        });
        calculated.push({
          name: 'Adhesivo Bekron Porcelanato / Especial C-2 (Saco 25kg)',
          unit: 'saco',
          basePrice: Math.round(9800 * qualityMult),
          quantity: adhesiveBags,
          category: 'Adhesivos',
          reasoning: 'Adhesivo de alta adherencia y flexibilidad para porcelanatos'
        });
        calculated.push({
          name: 'Kit Sistema Nivelación (100 Cuñas + 300 Clips Niveladores)',
          unit: 'kit',
          basePrice: Math.round(14900 * qualityMult),
          quantity: Math.max(1, Math.ceil(totalArea / 15)),
          category: 'Herramientas y Nivelación',
          reasoning: 'Garantiza alisado sin dientes en palmetas de formato 60x60cm o superior'
        });
      } else {
        calculated.push({
          name: 'Cerámica 30x30 / 45x45cm Antideslizante Alto Tráfico',
          unit: 'm²',
          basePrice: Math.round(7990 * qualityMult),
          quantity: Math.ceil(areaWithWaste),
          category: 'Revestimiento Cerámico',
          reasoning: `${totalArea} m² + ${wastePercent}% merma por cortes`
        });

        if (surfaceType === 'tabique') {
          calculated.push({
            name: 'Adhesivo en Pasta Doble Acción Pasta Muro (Tineta 15kg)',
            unit: 'tineta',
            basePrice: Math.round(12900 * qualityMult),
            quantity: Math.ceil(areaWithWaste / 6),
            category: 'Adhesivos en Pasta',
            reasoning: 'Adhesivo en pasta flexible obligatorio para tabiquerías ligeras'
          });
        } else {
          calculated.push({
            name: 'Adhesivo Cerámico Bekron / Cadina Estándar (Saco 25kg)',
            unit: 'saco',
            basePrice: Math.round(4990 * qualityMult),
            quantity: adhesiveBags,
            category: 'Adhesivos en Polvo',
            reasoning: `Calculado a 5kg/m² para ${areaWithWaste.toFixed(1)} m² de área`
          });
        }
      }

      // Adicional Piso sobre Piso
      if (surfaceType === 'existente') {
        calculated.push({
          name: 'Promotor de Adherencia Primer Tégula / Brikol (Tineta 5L)',
          unit: 'tineta',
          basePrice: Math.round(18900 * qualityMult),
          quantity: Math.max(1, Math.ceil(totalArea / 25)),
          category: 'Preparación de Base',
          reasoning: 'Puente de adherencia para instalar cerámica sobre piso cerámico preexistente'
        });
      }

      // Adicional Zona Húmeda / Ducha
      if (wetArea === 'si') {
        calculated.push({
          name: 'Membrana Impermeabilizante Elástica Sika/Cave (Tineta 10kg)',
          unit: 'tineta',
          basePrice: Math.round(29900 * qualityMult),
          quantity: Math.max(1, Math.ceil(totalArea / 10)),
          category: 'Impermeabilización',
          reasoning: 'Barrera estanca contra filtraciones hídricas en muros de ducha y pisos'
        });
        calculated.push({
          name: 'Fragüe Hidrófugo Anti-Hongos Impermeable (Bolsa 5kg)',
          unit: 'bolsa',
          basePrice: Math.round(4500 * qualityMult),
          quantity: groutBags,
          category: 'Fragüe Especial',
          reasoning: 'Fragüe sellante resistente al agua y formación de moho'
        });
      } else {
        calculated.push({
          name: 'Fragüe Cerámico Estándar (Bolsa 5kg)',
          unit: 'bolsa',
          basePrice: Math.round(3800 * qualityMult),
          quantity: groutBags,
          category: 'Fragüe Estándar',
          reasoning: 'Rendimiento promedio de 1 bolsa 5kg cada 18 m²'
        });
      }

      calculated.push({
        name: 'Crucetas Separadoras 2mm (Bolsa 100 uds)',
        unit: 'bolsa',
        basePrice: Math.round(890 * qualityMult),
        quantity: Math.max(1, Math.ceil(totalArea / 12)),
        category: 'Herramientas',
        reasoning: 'Mantiene separación uniforme de juntura'
      });

      if (wallArea > 0) {
        calculated.push({
          name: 'Perfil Esquinero Aluminio Anodizado (2.5m)',
          unit: 'unidad',
          basePrice: Math.round(3200 * qualityMult),
          quantity: Math.ceil(wallArea / 4),
          category: 'Terminaciones',
          reasoning: 'Protección estética de cantos expuestos en muros'
        });
      }

      break;
    }

    case 'ampliaciones': {
      const structureType = measurements.structureType || 'albanileria';
      const includesFoundation = (measurements.foundation || 'si') === 'si';
      const roofType = measurements.roofType || 'zinc';
      const length = Number(measurements.length) || 4;
      const width = Number(measurements.width) || 3;
      const height = Number(measurements.height) || 2.4;

      const perimeter = 2 * (length + width);
      const wallArea = perimeter * height;
      const floorArea = length * width;
      const roofArea = floorArea * 1.15;

      laborMult = 0.60;
      technicalAdvice = `Criterios de construcción según OGUC y Norma Sísmica NCh 433:
• Estructura (${structureType.toUpperCase()}): ${structureType === 'albanileria' ? 'Albañilería confinada con ladrillo fiscal 28x14x7cm, pegado con mortero cemento:arena 1:3 y cadenas/pilares de hormigón armado con fierro A63-42H.' : structureType === 'metalcon' ? 'Perfilería Metalcon Estructural galvanizado 90mm montantes cada 40cm y canales de piso/cielo.' : 'Estructura en madera de Pino Cepillado 2x4" con cadenetas y soleras.'}
• Fundaciones (${includesFoundation ? 'CON RADIER' : 'SIN RADIER'}): ${includesFoundation ? 'Cimientos 40x50cm, sobrecimientos armados y radier de hormigón H20 de 10cm con malla electrosoldada C-139, polietileno y ripio.' : 'Construcción montada sobre radier o losa ya existente.'}
• Techumbre (${roofType.toUpperCase()}): ${roofType === 'teja_asfaltica' ? 'Planchas OSB 11.1mm + Fieltro asfáltico 15L + Teja asfáltica.' : roofType === 'panel_aislante' ? 'Paneles sándwich PV4 aislantes.' : 'Planchas de Zinc Acanalado 0.35mm.'}`;

      safetyNote = 'Obligatorio uso de casco NCh 461, calzado con puntera de acero y arnés en trabajos de techumbre.';
      savingTips = 'Consolida el pedido de materiales pesados (cemento, áridos, ladrillos/perfiles) en una sola compra para un único flete.';

      calculated = [];

      // Radier / Cimientos opcional
      if (includesFoundation) {
        calculated.push({
          name: 'Cemento Melón Especial Alta Resistencia (Saco 25kg)',
          unit: 'saco',
          basePrice: Math.round(3990 * qualityMult),
          quantity: Math.ceil(floorArea * 0.8 + wallArea * 0.3),
          category: 'Cimientos y Radier',
          reasoning: 'Para dosificación de cimientos, sobrecimientos y radier de 10cm'
        });
        calculated.push({
          name: 'Malla Acma Electrosoldada C-139 (2.0x5.0m)',
          unit: 'plancha',
          basePrice: Math.round(24900 * qualityMult),
          quantity: Math.ceil(floorArea / 10),
          category: 'Cimientos y Radier',
          reasoning: 'Refuerzo de contracción para radier de hormigón'
        });
        calculated.push({
          name: 'Ripio / Gravilla Selección Base',
          unit: 'm³',
          basePrice: Math.round(27000 * qualityMult),
          quantity: Math.ceil(floorArea * 0.08),
          category: 'Áridos Base',
          reasoning: 'Cama de ripio estabilizado bajo radier'
        });
        calculated.push({
          name: 'Arena Gruesa Limpia para Mezcla',
          unit: 'm³',
          basePrice: Math.round(29000 * qualityMult),
          quantity: Math.ceil(floorArea * 0.06 + wallArea * 0.04),
          category: 'Áridos Base',
          reasoning: 'Árido limpio para dosificación de hormigón'
        });
        calculated.push({
          name: 'Polietileno Aislante Humedad 0.1mm (Rollo 100m²)',
          unit: 'rollo',
          basePrice: Math.round(18900 * qualityMult),
          quantity: 1,
          category: 'Barrera de Humedad',
          reasoning: 'Barrera contra humedad de terreno bajo radier'
        });
      }

      // Estructura según tipo
      if (structureType === 'albanileria') {
        const bricksCount = Math.ceil(wallArea * 38);
        const rebarBars10 = Math.ceil((perimeter * 4) / 6) + 4;
        const rebarBars8 = Math.ceil(rebarBars10 * 0.8);

        calculated.push({
          name: 'Ladrillo Fiscal Estructura 28x14x7cm',
          unit: 'unidad',
          basePrice: Math.round(195 * qualityMult),
          quantity: bricksCount,
          category: 'Albañilería',
          reasoning: `${wallArea.toFixed(1)} m² de muro x 38 ladrillos por m²`
        });
        calculated.push({
          name: 'Fierro Estriado 10mm Calidad A63-42H (Tira 6m)',
          unit: 'barra',
          basePrice: Math.round(4400 * qualityMult),
          quantity: rebarBars10,
          category: 'Enfierradura',
          reasoning: 'Armaduras longitudinales para pilares y cadenas de coronación'
        });
        calculated.push({
          name: 'Fierro Estriado 8mm (Tira 6m)',
          unit: 'barra',
          basePrice: Math.round(2950 * qualityMult),
          quantity: rebarBars8,
          category: 'Enfierradura',
          reasoning: 'Estribos cada 15cm en refuerzos estructurales'
        });
      } else if (structureType === 'metalcon') {
        const montantes = Math.ceil((perimeter / 0.4) + 4);
        const canales = Math.ceil((perimeter * 2) / 3.0);

        calculated.push({
          name: 'Perfil Metalcon Estructural Montante 90x38x0.85mm (Tira 2.4m)',
          unit: 'tira',
          basePrice: Math.round(4500 * qualityMult),
          quantity: montantes,
          category: 'Metalcon Estructural',
          reasoning: `Montantes colocados a 40cm eje para perímetro de ${perimeter}m`
        });
        calculated.push({
          name: 'Perfil Metalcon Estructural Canal 92x30x0.85mm (Tira 3.0m)',
          unit: 'tira',
          basePrice: Math.round(4900 * qualityMult),
          quantity: canales,
          category: 'Metalcon Estructural',
          reasoning: 'Soleras de piso y coronación superior'
        });
        calculated.push({
          name: 'Tornillo Autoperforante Lenteja 8x1/2" (Caja 500)',
          unit: 'caja',
          basePrice: Math.round(4800 * qualityMult),
          quantity: Math.max(1, Math.ceil(montantes / 15)),
          category: 'Fijaciones',
          reasoning: 'Unión estructural de perfiles de acero'
        });
      } else {
        const maderas = Math.ceil((perimeter / 0.4) * 1.5);
        calculated.push({
          name: 'Madera Pino Cepillado 2x4" x 3.2m Estructural',
          unit: 'unidad',
          basePrice: Math.round(4200 * qualityMult),
          quantity: maderas,
          category: 'Maderamen',
          reasoning: 'Pies derechos, soleras y cadenetas'
        });
        calculated.push({
          name: 'Clavos 3 y 4 pulgadas con Cabeza (Kilo)',
          unit: 'kg',
          basePrice: Math.round(2200 * qualityMult),
          quantity: Math.max(2, Math.ceil(maderas / 10)),
          category: 'Fijaciones',
          reasoning: 'Armado de entramado de madera'
        });
      }

      // Techumbre según tipo
      if (roofType === 'teja_asfaltica') {
        const osbPlanchas = Math.ceil(roofArea / 2.98);
        calculated.push({
          name: 'Plancha OSB Estructural 11.1mm (1.22x2.44m)',
          unit: 'plancha',
          basePrice: Math.round(11900 * qualityMult),
          quantity: osbPlanchas,
          category: 'Base Techumbre',
          reasoning: 'Soporte rígido de cubierta'
        });
        calculated.push({
          name: 'Fieltro Asfáltico 15L para Techumbre (Rollo 40m²)',
          unit: 'rollo',
          basePrice: Math.round(12900 * qualityMult),
          quantity: Math.max(1, Math.ceil(roofArea / 35)),
          category: 'Aislación Techumbre',
          reasoning: 'Membrana impermeable de protección'
        });
        calculated.push({
          name: 'Teja Asfáltica Gravillada Paquete (3 m²)',
          unit: 'paquete',
          basePrice: Math.round(28900 * qualityMult),
          quantity: Math.ceil(roofArea / 3),
          category: 'Cubierta',
          reasoning: 'Terminación estética de teja asfáltica'
        });
      } else if (roofType === 'panel_aislante') {
        calculated.push({
          name: 'Panel Sándwich Aislante PV4 Poliestireno 50mm (m²)',
          unit: 'm²',
          basePrice: Math.round(21900 * qualityMult),
          quantity: Math.ceil(roofArea),
          category: 'Cubierta Aislante',
          reasoning: 'Panel autosoportante con alta aislación térmica'
        });
      } else {
        calculated.push({
          name: 'Zinc Acanalado 0.35mm x 3.66m Techo',
          unit: 'plancha',
          basePrice: Math.round(8990 * qualityMult),
          quantity: Math.ceil(roofArea / 3),
          category: 'Cubierta Zinc',
          reasoning: `Cubierta metálica para ${roofArea.toFixed(1)} m² de techumbre`
        });
      }

      // Revestimientos Interiores
      calculated.push({
        name: 'Plancha Yeso-Cartón Volcanita 10mm (1.20x2.40m)',
        unit: 'plancha',
        basePrice: Math.round(5990 * qualityMult),
        quantity: Math.ceil((wallArea * 1.1) / 2.88),
        category: 'Revestimiento Interior',
        reasoning: 'Revestimiento interior para cielo y muros'
      });

      break;
    }

    case 'cerrajeria': {
      const doorType = measurements.doorType || 'exterior_madera';
      const securityLevel = measurements.securityLevel || 'alta_seguridad';
      const mainDoors = Number(measurements.mainDoors) || 1;
      const interiorDoors = Number(measurements.interiorDoors) || 4;

      laborMult = 0.30;
      technicalAdvice = `Criterios de cerrajería y herrajes de seguridad:
• Tipo de Puerta (${doorType.toUpperCase()}): ${doorType === 'metal_reja' ? 'Exige cerraduras de sobreponer o caja de soldar para reja con cerrojo de acero.' : doorType === 'exterior_madera' ? 'Puerta sólida exterior requiere cerrojos embutidos o de sobreponer de 3 golpes.' : 'Puertas interiores alveolares utilizan cerraduras cilíndricas de pomo.'}
• Nivel de Seguridad (${securityLevel.toUpperCase()}): ${securityLevel === 'digital' ? 'Cerradura Smart Digital con lector biométrico, PIN táctil, app y llave física de emergencia.' : securityLevel === 'alta_seguridad' ? 'Scanavini 2050 con doble cerrojo de acero macizo de 3 golpes.' : 'Cerradura estándar de pomo/cilindro.'}`;

      safetyNote = 'Al labrar cajas en puertas de madera con formones, mantén las manos por detrás de la dirección de corte.';
      savingTips = 'Comprar packs o "combos" de cerradura principal + cerrojo auxiliar amaestrados con la misma llave ahorra hasta un 25%.';

      calculated = [];

      // Puerta Principal
      if (securityLevel === 'digital') {
        calculated.push({
          name: 'Cerradura Digital Smart Biométrica (Huella / Clave / App)',
          unit: 'unidad',
          basePrice: Math.round(79000 * qualityMult),
          quantity: mainDoors,
          category: 'Cerraduras Smart',
          reasoning: `${mainDoors} cerradura(s) inteligente(s) para acceso controlado`
        });
      } else if (securityLevel === 'alta_seguridad') {
        calculated.push({
          name: 'Cerradura Sobreponer Scanavini 2050 Doble Cerrojo 3 Golpes',
          unit: 'unidad',
          basePrice: Math.round(22900 * qualityMult),
          quantity: mainDoors,
          category: 'Seguridad Exterior',
          reasoning: `${mainDoors} cerradura(s) de alta seguridad de cerrojo macizo`
        });
      } else {
        calculated.push({
          name: 'Cerradura Embutida Cilindro Europerfil Acero Poli',
          unit: 'unidad',
          basePrice: Math.round(18500 * qualityMult),
          quantity: mainDoors,
          category: 'Cerraduras Estándar',
          reasoning: 'Cerradura embutida tradicional'
        });
      }

      // Puertas Interiores
      if (interiorDoors > 0) {
        calculated.push({
          name: 'Cerradura Cilíndrica Pomo Dormitorio / Baño Poli',
          unit: 'unidad',
          basePrice: Math.round(12900 * qualityMult),
          quantity: interiorDoors,
          category: 'Pomos Interiores',
          reasoning: `${interiorDoors} cerraduras de pomo para habitaciones y baños`
        });
        calculated.push({
          name: 'Manilla Puerta Interior Roseta Acero Cepillado',
          unit: 'unidad',
          basePrice: Math.round(9900 * qualityMult),
          quantity: interiorDoors,
          category: 'Manillas',
          reasoning: 'Manillas ergonómicas interiores'
        });
      }

      // Herrajes
      const totalDoors = mainDoors + interiorDoors;
      calculated.push({
        name: 'Bisagra Rodamiento 3.5x3.5" Acero Inoxidable (Par)',
        unit: 'par',
        basePrice: Math.round(4500 * qualityMult),
        quantity: Math.ceil(totalDoors * 1.5),
        category: 'Herrajes',
        reasoning: '3 bisagras (1.5 pares) por cada puerta para soporte de peso'
      });

      break;
    }

    case 'gasfiteria': {
      const pipeType = measurements.pipeType || 'pex';
      const waterHeaterType = measurements.waterHeaterType || 'calefont';
      const bathrooms = Number(measurements.bathrooms) || 1;
      const kitchens = Number(measurements.kitchens) || 1;
      const distance = Number(measurements.distance) || 20;

      laborMult = 0.45;
      technicalAdvice = `Reglamento Domiciliario de Agua Potable y Alcantarillado (RIDAA / SISS):
• Material Red (${pipeType.toUpperCase()}): ${pipeType === 'pex' ? 'Tubería PEX flexible 16mm con accesorios de prensa.' : pipeType === 'ppr' ? 'Polipropileno PPR termofusionado 20mm con dados térmicos.' : 'Cobre Tipo L de 1/2" soldado con aleación 95/5 e hilado sin plomo.'}
• Calentador de Agua (${waterHeaterType.toUpperCase()}): ${waterHeaterType === 'calefont' ? 'Calefont Ionizado Tiro Forzado con ducto de evacuación inox y flexibles flexibles de gas de norma SEC.' : waterHeaterType === 'termo' ? 'Termo eléctrico mural 80L-120L con válvula de alivio térmico.' : 'Conexión a red existente.'}
• Alcantarillado: Tuberías PVC Sanitario de 110mm para descargas de inodoros y 50mm para lavatorios/duchas.`;

      safetyNote = 'Realizar prueba hidráulica a 1.5 veces la presión de trabajo antes de tapar canalizaciones en muro o piso.';
      savingTips = 'El sistema PEX reduce un 60% la cantidad de codos al ser flexible en rollos continuos.';

      calculated = [];

      // Red Agua Potable
      if (pipeType === 'pex') {
        calculated.push({
          name: 'Tubería PEX 16mm para Agua Caliente/Fría (metro)',
          unit: 'metro',
          basePrice: Math.round(920 * qualityMult),
          quantity: Math.ceil(distance * 1.2),
          category: 'Red PEX',
          reasoning: `${distance}m de trazado + 20% de holgura por curvas`
        });
        calculated.push({
          name: 'Pack Conexiones de Prensa PEX (Codos/Tés/Terminales 1/2")',
          unit: 'pack',
          basePrice: Math.round(18900 * qualityMult),
          quantity: Math.max(1, Math.ceil((bathrooms + kitchens))),
          category: 'Accesorios PEX',
          reasoning: 'Terminales y acoples prensados para griferías'
        });
      } else if (pipeType === 'ppr') {
        calculated.push({
          name: 'Tubo Polipropileno PPR Termofusión 20mm x 6m',
          unit: 'tira',
          basePrice: Math.round(4800 * qualityMult),
          quantity: Math.ceil(distance / 5),
          category: 'Red PPR',
          reasoning: 'Tuberías virgenes de termofusión'
        });
        calculated.push({
          name: 'Pack Coplas y Codos PPR 20mm',
          unit: 'pack',
          basePrice: Math.round(9500 * qualityMult),
          quantity: Math.max(1, Math.ceil(distance / 5)),
          category: 'Accesorios PPR',
          reasoning: 'Uniones para fundir con dado térmico'
        });
      } else {
        calculated.push({
          name: 'Tubo Cobre Tipo L 1/2" x 6m',
          unit: 'tira',
          basePrice: Math.round(18900 * qualityMult),
          quantity: Math.ceil(distance / 5),
          category: 'Red Cobre',
          reasoning: 'Tubería de cobre rígido de alta durabilidad'
        });
        calculated.push({
          name: 'Carrete Soldadura Cobre 95/5 + Pasta Fundente',
          unit: 'pack',
          basePrice: Math.round(12900 * qualityMult),
          quantity: 1,
          category: 'Insumos Cobre',
          reasoning: 'Insumo de soldadura sin plomo'
        });
      }

      // Calentador de Agua opcional
      if (waterHeaterType === 'calefont') {
        calculated.push({
          name: 'Calefont 13L Ionizado Tiro Forzado Gas GLP/GN',
          unit: 'unidad',
          basePrice: Math.round(169000 * qualityMult),
          quantity: 1,
          category: 'Agua Caliente',
          reasoning: 'Calentador instantáneo de tiro forzado estanco'
        });
        calculated.push({
          name: 'Kit Ducto Evacuación Inox + Flexible Gas Certificado SEC',
          unit: 'kit',
          basePrice: Math.round(24900 * qualityMult),
          quantity: 1,
          category: 'Accesorios Calefont',
          reasoning: 'Salida de gases y conexión de combustible aprobada'
        });
      } else if (waterHeaterType === 'termo') {
        calculated.push({
          name: 'Termo Eléctrico Mural 80L - 100L Eficiencia A',
          unit: 'unidad',
          basePrice: Math.round(149000 * qualityMult),
          quantity: 1,
          category: 'Agua Caliente',
          reasoning: 'Acumuladores eléctricos con aislamiento térmico'
        });
      }

      // Desagües y Sanitarios
      calculated.push({
        name: 'Tubo PVC Sanitario 110mm x 3m (WC/Descarga)',
        unit: 'tira',
        basePrice: Math.round(9800 * qualityMult),
        quantity: bathrooms,
        category: 'Alcantarillado',
        reasoning: 'Descargas de inodoro'
      });
      calculated.push({
        name: 'Tubo PVC Sanitario 50mm x 3m Hoffens',
        unit: 'tira',
        basePrice: Math.round(3800 * qualityMult),
        quantity: Math.ceil(distance / 3),
        category: 'Alcantarillado',
        reasoning: 'Desagües secundarios de lavatorios y lavaplatos'
      });
      calculated.push({
        name: 'Llave de Paso 1/2" Bronce Cierre Rápido',
        unit: 'unidad',
        basePrice: Math.round(4900 * qualityMult),
        quantity: (bathrooms + kitchens) * 2,
        category: 'Valvulería',
        reasoning: 'Cortes sectorizados por recinto'
      });
      calculated.push({
        name: 'Monocomando Lavatorio Cromo Nibsa-Stretto',
        unit: 'unidad',
        basePrice: Math.round(28900 * qualityMult),
        quantity: bathrooms + kitchens,
        category: 'Grifería',
        reasoning: 'Grifería mono-comando con aireador de consumo eficiente'
      });
      calculated.push({
        name: 'Taza WC One-Piece Descarga Dual Eco 3/6L',
        unit: 'unidad',
        basePrice: Math.round(89000 * qualityMult),
        quantity: bathrooms,
        category: 'Artefactos Sanitarios',
        reasoning: 'Sanitarios ahorradores de agua'
      });

      break;
    }

    case 'pintura': {
      const paintType = measurements.paintType || 'esmalte_agua';
      const surfaceCondition = measurements.surfaceCondition || 'nueva';
      const wallArea = Number(measurements.wallArea) || 60;
      const ceilingArea = Number(measurements.ceilingArea) || 25;
      const coats = Number(measurements.coats) || 2;

      const totalAreaSingle = wallArea + ceilingArea;
      const totalCoverageNeeded = totalAreaSingle * coats;

      laborMult = 0.40;
      technicalAdvice = `Recomendaciones de pintura y preparación de muros:
• Tipo de Pintura (${paintType.toUpperCase()}): ${paintType === 'esmalte_agua' ? 'Esmalte al agua satinado lavable, libre de olor, resistente al moho e ideal para interiores y zonas húmedas.' : paintType === 'oleo' ? 'Óleo brillante anticorrosivo para protecciones metálicas o carpinterías de madera exterior.' : 'Látex extracubriente mate para cielos y habitaciones.'}
• Preparación Base (${surfaceCondition.toUpperCase()}): ${surfaceCondition === 'nueva' ? 'Muro nuevo o enlucido requiere empaste de 2 manos de Pasta Muro Sipar y sellador/primer acrílico fijador de porosidad.' : surfaceCondition === 'con_fisuras' ? 'Muro con fisuras requiere malla de vidrio, pasta de relleno y lijado profundo.' : 'Lijado suave y limpieza previa al pintado.'}`;

      safetyNote = 'Mantener ventilación natural continua en los espacios. Utilizar mascarilla para polvo al lijar empastes.';
      savingTips = 'Las tinetas de 5 galones (18.9 Litros) economizan un 35% el costo por litro en comparación con galones sueltos.';

      const gallonPintura = Math.max(1, Math.ceil(totalCoverageNeeded / 32));

      calculated = [];

      // Pintura según tipo
      if (paintType === 'esmalte_agua') {
        calculated.push({
          name: 'Esmalte al Agua Lavable Satinado (Galón 3.8L)',
          unit: 'galón',
          basePrice: Math.round(22900 * qualityMult),
          quantity: gallonPintura,
          category: 'Pintura Esmalte',
          reasoning: `Para cubrir ${totalAreaSingle} m² a ${coats} manos (${totalCoverageNeeded} m² totales)`
        });
      } else if (paintType === 'oleo') {
        calculated.push({
          name: 'Óleo Sintético Brillante / Anticorrosivo (Galón 3.8L)',
          unit: 'galón',
          basePrice: Math.round(25900 * qualityMult),
          quantity: gallonPintura,
          category: 'Pintura Óleo',
          reasoning: 'Pintura de alto brillo y resistencia mecánica'
        });
      } else {
        calculated.push({
          name: 'Pintura Látex Interior Extracubriente (Galón 3.8L)',
          unit: 'galón',
          basePrice: Math.round(15990 * qualityMult),
          quantity: gallonPintura,
          category: 'Pintura Látex',
          reasoning: `Látex mate para cielos y muros de ${totalAreaSingle} m²`
        });
      }

      // Preparación según estado
      if (surfaceCondition === 'nueva' || surfaceCondition === 'con_fisuras') {
        const tinetaPasta = Math.ceil(wallArea / 40);
        calculated.push({
          name: 'Pasta Muro Interior Sipar (Tineta 25kg)',
          unit: 'tineta',
          basePrice: Math.round(9900 * qualityMult),
          quantity: tinetaPasta,
          category: 'Empaste',
          reasoning: 'Empaste de alisado y nivelación de la superficie'
        });
        calculated.push({
          name: 'Sellador / Primer Acrílico Fijador (Galón 3.8L)',
          unit: 'galón',
          basePrice: Math.round(12900 * qualityMult),
          quantity: Math.max(1, Math.ceil(totalAreaSingle / 40)),
          category: 'Fijador de Porosidad',
          reasoning: 'Fijador de porosidad previa aplicación de pintura de terminación'
        });
      }

      if (surfaceCondition === 'con_fisuras') {
        calculated.push({
          name: 'Cinta de Malla de Vidrio de Refuerzo para Fisuras (Rollo 45m)',
          unit: 'rollo',
          basePrice: Math.round(3900 * qualityMult),
          quantity: 1,
          category: 'Reparación de Fisuras',
          reasoning: 'Puente de unión para sellado de grietas'
        });
      }

      calculated.push({
        name: 'Rodillo Antigota Microfibra 23cm con Mango',
        unit: 'unidad',
        basePrice: Math.round(3800 * qualityMult),
        quantity: 2,
        category: 'Herramientas',
        reasoning: 'Rodillos de microfibra para acabado homogéneo'
      });
      calculated.push({
        name: 'Brocha Cerda Natural 3" Profesional',
        unit: 'unidad',
        basePrice: Math.round(2400 * qualityMult),
        quantity: 2,
        category: 'Herramientas',
        reasoning: 'Brochas de recorte'
      });
      calculated.push({
        name: 'Cinta Enmascarar / Masking Tape 24mm x 50m Pack 2',
        unit: 'pack',
        basePrice: Math.round(3200 * qualityMult),
        quantity: Math.max(1, Math.ceil(totalAreaSingle / 35)),
        category: 'Insumos',
        reasoning: 'Protección de bordes'
      });

      break;
    }

    case 'carpinteria': {
      const structureType = measurements.structureType || 'metalcon';
      const boardType = measurements.boardType || 'volcanita_std';
      const insulationType = measurements.insulationType || 'lana_vidrio';
      const wallLength = Number(measurements.wallLength) || 8;
      const height = Number(measurements.height) || 2.4;
      const sides = Number(measurements.sides) || 2;

      const wallArea = wallLength * height;

      laborMult = 0.45;
      technicalAdvice = `Criterios de tabiquería según ordenanzas de edificación MINVU:
• Estructura (${structureType.toUpperCase()}): ${structureType === 'metalcon' ? 'Perfiles Metalcon de acero galvanizado montantes 60mm cada 40cm eje y canales 62mm.' : 'Estructura en Pino Cepillado 2x2" o 2x3" con cadenetas intermedias.'}
• Revestimiento (${boardType.toUpperCase()}): ${boardType === 'volcanita_rh' ? 'Volcanita RH (Resistente a la Humedad) de 12.5mm con papel verde impermeabilizado.' : boardType === 'osb_volcanita' ? 'Doble emplanchado: Plancha OSB 9.5mm rígida + Volcanita 12.5mm.' : 'Volcanita Estándar 12.5mm.'}
• Aislación (${insulationType.toUpperCase()}): ${insulationType === 'lana_vidrio' ? 'Lana de vidrio 50mm con papel aluminio que actúa como barrera de vapor y aislante acústico/térmico.' : insulationType === 'poliestireno' ? 'Planchas de Poliestireno Aislapor 50mm.' : 'Sin aislación interior.'}`;

      safetyNote = 'Usar guantes, antiparras y mascarilla antipolvo al manipular la lana de vidrio para prevenir alergias e irritaciones.';
      savingTips = 'El Metalcon galvanizado es incombustible, liviano y no se deforma con cambios térmicos o humedad.';

      calculated = [];

      // Estructura
      if (structureType === 'metalcon') {
        const montantes = Math.ceil((wallLength / 0.4) + 2);
        const canales = Math.ceil((wallLength * 2) / 3.0);
        calculated.push({
          name: 'Perfil Metalcon Montante 60x38x0.85mm x 2.4m',
          unit: 'tira',
          basePrice: Math.round(2850 * qualityMult),
          quantity: montantes,
          category: 'Perfilería Metalcon',
          reasoning: `Montantes ubicados verticalmente cada 40cm a lo largo de ${wallLength}m`
        });
        calculated.push({
          name: 'Perfil Metalcon Canal 62x28x0.85mm x 3.0m',
          unit: 'tira',
          basePrice: Math.round(3100 * qualityMult),
          quantity: canales,
          category: 'Perfilería Metalcon',
          reasoning: 'Canales solera a piso y cielo en tiras de 3 metros'
        });
      } else {
        const maderas = Math.ceil((wallLength / 0.4) * 1.5);
        calculated.push({
          name: 'Madera Pino Cepillado 2x3" x 3.2m',
          unit: 'unidad',
          basePrice: Math.round(2990 * qualityMult),
          quantity: maderas,
          category: 'Estructura Madera',
          reasoning: 'Pies derechos y soleras de entramado de madera'
        });
      }

      // Revestimiento Planchas
      const planchaAreaNeeded = wallArea * sides * 1.1;
      const planchasCount = Math.ceil(planchaAreaNeeded / 2.88);

      if (boardType === 'volcanita_rh') {
        calculated.push({
          name: 'Plancha Volcanita RH Anti-Humedad Verde 12.5mm (1.20x2.40m)',
          unit: 'plancha',
          basePrice: Math.round(9200 * qualityMult),
          quantity: planchasCount,
          category: 'Planchas RH',
          reasoning: `${wallArea.toFixed(1)} m² x ${sides} cara(s) con tratamiento anti-humedad`
        });
      } else if (boardType === 'osb_volcanita') {
        calculated.push({
          name: 'Plancha OSB Estructural 9.5mm (1.22x2.44m)',
          unit: 'plancha',
          basePrice: Math.round(9800 * qualityMult),
          quantity: planchasCount,
          category: 'Base Rígida OSB',
          reasoning: 'Base estructural previa a Volcanita'
        });
        calculated.push({
          name: 'Plancha Yeso-Cartón Volcanita 12.5mm (1.20x2.40m)',
          unit: 'plancha',
          basePrice: Math.round(6800 * qualityMult),
          quantity: planchasCount,
          category: 'Terminación Volcanita',
          reasoning: 'Revestimiento exterior sobre OSB'
        });
      } else {
        calculated.push({
          name: 'Plancha Yeso-Cartón Volcanita Estándar 12.5mm (1.20x2.40m)',
          unit: 'plancha',
          basePrice: Math.round(6800 * qualityMult),
          quantity: planchasCount,
          category: 'Planchas Estándar',
          reasoning: `${wallArea.toFixed(1)} m² x ${sides} cara(s) + 10% merma / 2.88 m² por plancha`
        });
      }

      // Aislación opcional
      if (insulationType === 'lana_vidrio') {
        calculated.push({
          name: 'Lana de Vidrio Aislante con Aluminio 50mm (Rollo 12m²)',
          unit: 'rollo',
          basePrice: Math.round(24900 * qualityMult),
          quantity: Math.max(1, Math.ceil(wallArea / 12)),
          category: 'Aislación Lana Vidrio',
          reasoning: 'Aislante acústico y térmico con barrera de vapor'
        });
      } else if (insulationType === 'poliestireno') {
        calculated.push({
          name: 'Plancha Poliestireno Expandido Aislapor 50mm (1.0x0.5m)',
          unit: 'unidad',
          basePrice: Math.round(1800 * qualityMult),
          quantity: Math.ceil(wallArea / 0.5),
          category: 'Aislación Poliestireno',
          reasoning: 'Aislamiento térmico rígido'
        });
      }

      // Fijaciones y Terminaciones
      calculated.push({
        name: 'Tornillo Yeso-Cartón Punta Fina 6x1 5/8" (Caja 500)',
        unit: 'caja',
        basePrice: Math.round(4200 * qualityMult),
        quantity: Math.max(1, Math.ceil(planchasCount / 8)),
        category: 'Fijaciones',
        reasoning: 'Fijación de planchas a perfiles'
      });
      calculated.push({
        name: 'Pasta Junta Yeso Brikol (Caja 15kg)',
        unit: 'caja',
        basePrice: Math.round(11900 * qualityMult),
        quantity: Math.max(1, Math.ceil(wallArea / 25)),
        category: 'Terminación',
        reasoning: 'Tratamiento de juntas y tapado de tornillos'
      });
      calculated.push({
        name: 'Cinta Junta de Papel Volcanita (Rollo 75m)',
        unit: 'rollo',
        basePrice: Math.round(3500 * qualityMult),
        quantity: 1,
        category: 'Terminación',
        reasoning: 'Refuerzo de uniones entre planchas'
      });

      break;
    }

    default: {
      calculated = baseMats.map((m) => ({
        name: m.name,
        unit: m.unit,
        basePrice: Math.round(m.basePrice * qualityMult),
        quantity: 1,
        category: m.category || 'General',
        reasoning: 'Cálculo genérico de base'
      }));
      break;
    }
  }

  const materials: MaterialItem[] = calculated.map((item, idx) => ({
    id: `area_mat_${projectType}_${idx}_${Date.now()}`,
    name: item.name,
    unit: item.unit,
    basePrice: item.basePrice,
    quantity: item.quantity,
    selected: true,
    category: item.category,
    reasoning: item.reasoning,
    aiCalculated: true
  }));

  return {
    materials,
    technicalAdvice,
    safetyNote,
    savingTips,
    estimatedLaborMultiplier: laborMult
  };
}
