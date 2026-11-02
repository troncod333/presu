import { ProjectType } from '../types';

export interface ArtifactSummary {
  type: string;
  count: number;
  label: string;
  badge: string;
}

export interface SpaceDimensions {
  length: number;
  width: number;
  height: number;
  area: number;
  perimeter: number;
  wallArea: number;
  suggestedItems: Array<{ type: string; count: number; label: string }>;
  artifacts: ArtifactSummary[];
  roomName: string;
}

export type RoomInfo = SpaceDimensions;

export function calculateSpaceAndArtifacts(
  projectType: ProjectType,
  measurements: Record<string, any> = {}
): SpaceDimensions {
  const length = Number(measurements.length) || (projectType === 'techumbre' ? 8 : 5.0);
  const width = Number(measurements.width) || (projectType === 'techumbre' ? 5 : 4.0);
  const height = Number(measurements.height) || 2.4;

  const area = Math.round(length * width * 100) / 100;
  const perimeter = Math.round(2 * (length + width) * 100) / 100;
  const wallArea = Math.round(perimeter * height * 100) / 100;

  const suggestedItems: Array<{ type: string; count: number; label: string }> = [];

  switch (projectType) {
    case 'electricidad': {
      const numOutlets = Number(measurements.numOutlets) || Math.max(4, Math.round(area / 4));
      const numLights = Number(measurements.numLights) || Math.max(2, Math.round(area / 8));
      suggestedItems.push(
        { type: 'door', count: 1, label: 'Puerta Principal' },
        { type: 'window', count: 1, label: 'Ventana' },
        { type: 'panel_tda', count: 1, label: 'Tablero TDA (SEC)' },
        { type: 'switch', count: 1, label: 'Interruptor 9/12' },
        { type: 'light', count: numLights, label: 'Centro Iluminación LED' },
        { type: 'outlet', count: numOutlets, label: 'Enchufe Doble 10/16A' }
      );
      break;
    }
    case 'cctv': {
      const ext = Number(measurements.camerasExt) || 3;
      const int = Number(measurements.camerasInt) || 2;
      suggestedItems.push(
        { type: 'door', count: 1, label: 'Acceso' },
        { type: 'camera_ext', count: ext, label: 'Cámara Exterior Bullet PoE' },
        { type: 'camera_int', count: int, label: 'Cámara Domo Interior' },
        { type: 'nvr', count: 1, label: 'NVR Grabador 4K' },
        { type: 'monitor', count: 1, label: 'Monitor Vigilancia' }
      );
      break;
    }
    case 'gasfiteria': {
      suggestedItems.push(
        { type: 'door', count: 1, label: 'Acceso' },
        { type: 'wc', count: 1, label: 'Inodoro WC' },
        { type: 'sink', count: 1, label: 'Vanitorio / Lavamanos' },
        { type: 'shower', count: 1, label: 'Receptáculo Ducha' },
        { type: 'water_valve', count: 2, label: 'Llave de Paso Bola PPR' }
      );
      break;
    }
    case 'tabiqueria':
    case 'ampliacion':
    default: {
      suggestedItems.push(
        { type: 'door', count: 1, label: 'Puerta' },
        { type: 'window', count: 2, label: 'Ventana' },
        { type: 'outlet', count: 4, label: 'Enchufe' },
        { type: 'light', count: 2, label: 'Luz Cielorraso' }
      );
      break;
    }
  }

  const BADGE_MAP: Record<string, string> = {
    door: '🚪',
    door_double: '🚪🚪',
    window: '🪟',
    outlet: '🔌',
    switch: '🔘',
    light: '💡',
    panel_tda: '⚡',
    camera_ext: '📹',
    camera_int: '📹',
    nvr: '📼',
    monitor: '🖥️',
    wc: '🚽',
    sink: '🚰',
    shower: '🚿',
    water_valve: '🔧',
    calefont: '🔥',
    column: '🏛️',
    stud_post: '📏'
  };

  const artifacts: ArtifactSummary[] = suggestedItems.map(item => ({
    type: item.type,
    count: item.count,
    label: item.label,
    badge: BADGE_MAP[item.type] || '📦'
  }));

  const roomNames: Record<string, string> = {
    electricidad: 'Recinto Eléctrico / Habitación',
    ceramicas: 'Piso Pavimento / Revestimiento',
    tabiqueria: 'Tabique Divisorio Estructural',
    techumbre: 'Planta de Cubierta & Aleros',
    pintura: 'Recinto Acabados Pintura',
    gasfiteria: 'Sala de Baño & Sanitario',
    ampliacion: 'Planta Nueva Ampliación',
    ampliaciones: 'Planta Nueva Ampliación',
    cctv: 'Perímetro Monitoreo CCTV',
    camaras: 'Perímetro Monitoreo CCTV'
  };

  return {
    length,
    width,
    height,
    area,
    perimeter,
    wallArea,
    suggestedItems,
    artifacts,
    roomName: roomNames[projectType] || 'Recinto de Obra'
  };
}

export function buildLayoutFromSpaceParams(
  space: SpaceDimensions,
  canvasWidth: number,
  canvasHeight: number,
  pixelsPerMeter: number
): {
  walls: Array<{ id: string; points: number[] }>;
  items: Array<{
    id: string;
    type: any;
    label: string;
    x: number;
    y: number;
    rotation: number;
  }>;
} {
  const ppm = pixelsPerMeter || 45;
  const roomPxW = Math.max(120, space.width * ppm);
  const roomPxH = Math.max(100, space.length * ppm);

  const startX = Math.round(Math.max(40, (canvasWidth - roomPxW) / 2));
  const startY = Math.round(Math.max(40, (canvasHeight - roomPxH) / 2));
  const endX = startX + roomPxW;
  const endY = startY + roomPxH;

  // 4 Perimeter Walls
  const walls = [
    { id: 'wall_top', points: [startX, startY, endX, startY] },
    { id: 'wall_right', points: [endX, startY, endX, endY] },
    { id: 'wall_bottom', points: [endX, endY, startX, endY] },
    { id: 'wall_left', points: [startX, endY, startX, startY] }
  ];

  const items: Array<{
    id: string;
    type: any;
    label: string;
    x: number;
    y: number;
    rotation: number;
  }> = [];

  let itemIdCounter = 1;

  // Always add an access door and window
  items.push({
    id: `item_${itemIdCounter++}`,
    type: 'door',
    label: 'Puerta Principal 80cm',
    x: startX + Math.min(60, roomPxW * 0.25),
    y: endY,
    rotation: 0
  });

  items.push({
    id: `item_${itemIdCounter++}`,
    type: 'window',
    label: 'Ventana 120x100',
    x: startX + roomPxW * 0.5,
    y: startY,
    rotation: 0
  });

  // Switch near door
  items.push({
    id: `item_${itemIdCounter++}`,
    type: 'switch',
    label: 'Interruptor 9/12',
    x: startX + Math.min(60, roomPxW * 0.25) + 35,
    y: endY - 12,
    rotation: 0
  });

  // Central light
  items.push({
    id: `item_${itemIdCounter++}`,
    type: 'light',
    label: 'Centro LED 18W',
    x: startX + roomPxW / 2,
    y: startY + roomPxH / 2,
    rotation: 0
  });

  // Outlets
  items.push({
    id: `item_${itemIdCounter++}`,
    type: 'outlet',
    label: 'Enchufe Doble',
    x: startX + 15,
    y: startY + roomPxH * 0.4,
    rotation: 90
  });

  items.push({
    id: `item_${itemIdCounter++}`,
    type: 'outlet',
    label: 'Enchufe Doble',
    x: endX - 15,
    y: startY + roomPxH * 0.4,
    rotation: 270
  });

  // Panel TDA on left wall
  items.push({
    id: `item_${itemIdCounter++}`,
    type: 'panel_tda',
    label: 'Tablero TDA',
    x: startX + 15,
    y: startY + 40,
    rotation: 0
  });

  return { walls, items };
}
