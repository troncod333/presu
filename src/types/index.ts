export type ProjectType = 
  | 'electricidad' 
  | 'ceramicas' 
  | 'tabiqueria' 
  | 'techumbre' 
  | 'pintura' 
  | 'gasfiteria' 
  | 'ampliacion' 
  | 'ampliaciones'
  | 'cctv'
  | 'camaras'
  | 'cerrajeria'
  | 'carpinteria';

export type QualityTier = 'economico' | 'medio' | 'premium';

export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
  quantity: number;
  selected: boolean;
  category: string;
  reasoning?: string;
  aiCalculated?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  chain: 'Sodimac' | 'Easy' | 'Construmart' | 'Chilemat' | 'Imperial' | 'Local';
  address: string;
  distanceKm: number;
  phone: string;
  discountPercent?: number;
  rating: number;
  lat: number;
  lng: number;
}

export interface BudgetRecord {
  id: string;
  title: string;
  createdAt: string;
  projectType: ProjectType;
  projectAddress: string;
  measurements: Record<string, any>;
  quality: QualityTier;
  materials: MaterialItem[];
  subtotalMaterials: number;
  transportCost: number;
  laborCost: number;
  totalCost: number;
}

export interface AICalculationResult {
  materials: MaterialItem[];
  technicalAdvice: string;
  safetyNote: string;
  savingTips: string;
  estimatedLaborMultiplier: number;
}

export interface ProjectQuestion {
  id: string;
  label: string;
  type: 'number' | 'select';
  isInteger?: boolean;
  min?: number;
  defaultValue: any;
  unit?: string;
  helpText?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface ProjectCategoryConfig {
  id: ProjectType;
  name: string;
  iconName: string;
  description: string;
  color: string;
  laborPercent: number;
}
