export type ProjectType = 
  | 'electricidad'
  | 'camaras'
  | 'ceramicas'
  | 'ampliaciones'
  | 'cerrajeria'
  | 'gasfiteria'
  | 'pintura'
  | 'carpinteria';

export type QualityTier = 'bajo' | 'medio' | 'premium';

export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  basePrice: number; // in CLP
  quantity: number;
  selected: boolean;
  category?: string;
  custom?: boolean;
  aiCalculated?: boolean;
  reasoning?: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  area: ProjectType | 'general';
  rating?: number;
  specialties?: string;
  notes?: string;
}

export interface ProjectQuestion {
  id: string;
  label: string;
  type: 'number' | 'text';
  unit: string;
  placeholder?: string;
  defaultValue?: number;
  helpText?: string;
}

export interface BudgetRecord {
  id: string;
  title: string;
  createdAt: string; // ISO string
  projectType: ProjectType;
  projectAddress: string;
  measurements: Record<string, number>;
  quality: QualityTier;
  materials: MaterialItem[];
  subtotalMaterials: number;
  transportCost: number;
  laborCost: number;
  totalCost: number;
  clientName?: string;
  notes?: string;
}

export interface AICalculationResult {
  materials: MaterialItem[];
  technicalAdvice: string;
  safetyNote: string;
  savingTips: string;
  estimatedLaborMultiplier: number;
}
