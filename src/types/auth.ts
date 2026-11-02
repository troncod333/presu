export type SubscriptionTier = 'free' | 'pro_monthly' | 'pro_annual';

export interface TokenTransaction {
  id: string;
  type: 'welcome' | 'referral_earned' | 'referral_applied' | 'consumed' | 'purchase' | 'manual';
  amount: number;
  description: string;
  timestamp: string; // ISO date
  feature?: 'ai_calc' | 'pdf_export' | 'canvas_export' | 'price_compare' | 'save_budget';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'email';
  createdAt: string;
  isPro: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: string;
  tokens: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  tokensEarnedFromReferrals: number;
  tokenHistory: TokenTransaction[];
}

export const TOKEN_COSTS = {
  AI_CALCULATION: 5,
  PDF_EXPORT: 10,
  CANVAS_EXPORT: 8,
  PRICE_COMPARISON: 5,
  SAVE_BUDGET: 3,
} as const;

export const TOKEN_REWARDS = {
  WELCOME_BONUS: 50,
  REFERRAL_INVITER_BONUS: 25,
  REFERRAL_INVITEE_BONUS: 25,
} as const;

export interface PricingPlan {
  id: 'pro_monthly' | 'pro_annual';
  name: string;
  tagline: string;
  priceClp: number;
  period: string;
  discountBadge?: string;
  features: string[];
  popular?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'pro_monthly',
    name: 'Plan Pro Mensual',
    tagline: 'Ideal para contratistas y maestros independientes',
    priceClp: 9990,
    period: 'mes',
    features: [
      'Acceso 100% ILIMITADO sin consumo de tokens',
      'Asistente IA Gemini 2.0 sin restricciones',
      'Descarga de cotizaciones PDF formal con tu logo',
      'Plano 2D interactivo con exportación CAD/Cubicación',
      'Comparativa de precios Sodimac, Easy, Construmart en vivo',
      'Presupuestos y proyectos guardados sin límite'
    ]
  },
  {
    id: 'pro_annual',
    name: 'Plan Pro Anual',
    tagline: 'El más elegido: ahorro garantizado todo el año',
    priceClp: 79900,
    period: 'año (equivale a $6.658/mes)',
    discountBadge: 'Ahorra 33%',
    popular: true,
    features: [
      'Todo lo incluido en el Plan Pro Mensual',
      'Tokens infinitos y prioridad máxima en IA',
      'Plantillas premium para constructoras e ingenieros',
      'Exportación en formato Excel / CSV para compras',
      'Soporte prioritario por WhatsApp para cubicaciones complejas',
      'Acceso garantizado a todas las actualizaciones 2025'
    ]
  }
];

export interface TokenPackage {
  id: string;
  tokens: number;
  priceClp: number;
  badge?: string;
}

export const TOKEN_PACKAGES: TokenPackage[] = [
  { id: 'pack_50', tokens: 50, priceClp: 3990, badge: 'Popular' },
  { id: 'pack_150', tokens: 150, priceClp: 7990, badge: 'Mejor Valor (33% extra)' },
  { id: 'pack_350', tokens: 350, priceClp: 14990, badge: 'Pack Maestro' },
];
