import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  TokenTransaction, 
  TOKEN_COSTS, 
  TOKEN_REWARDS, 
  PRICING_PLANS, 
  TOKEN_PACKAGES,
  SubscriptionTier 
} from '../types/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isPro: boolean;
  tokens: number;
  loginWithGoogle: (email?: string, name?: string, refCode?: string) => Promise<boolean>;
  loginWithEmail: (email: string, name: string, refCode?: string) => Promise<boolean>;
  logout: () => void;
  consumeTokens: (amount: number, description: string, feature?: TokenTransaction['feature']) => { success: boolean; remaining: number };
  canPerformAction: (requiredTokens: number) => boolean;
  applyReferralCode: (code: string) => { success: boolean; message: string };
  simulateReferralJoined: () => void;
  upgradeToPro: (planId: 'pro_monthly' | 'pro_annual') => void;
  buyTokens: (packageId: string) => void;
  resetTokensForTesting: (amount?: number) => void;
  toggleProForTesting: () => void;
  
  // UI Modal Controls
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  
  isTokenModalOpen: boolean;
  tokenModalTab: 'balance' | 'referrals' | 'plans';
  openTokenModal: (tab?: 'balance' | 'referrals' | 'plans') => void;
  closeTokenModal: () => void;
  
  isPaywallModalOpen: boolean;
  paywallReason: string;
  paywallRequiredTokens: number;
  openPaywallModal: (reason: string, requiredTokens?: number) => void;
  closePaywallModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'presupuestador_user_auth_v1';

function generateReferralCode(name: string): string {
  const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4) || 'CHIL';
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${clean}-${num}`;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading user from localStorage:', e);
    }
    return null;
  });

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [tokenModalTab, setTokenModalTab] = useState<'balance' | 'referrals' | 'plans'>('balance');
  const [isPaywallModalOpen, setIsPaywallModalOpen] = useState(false);
  const [paywallReason, setPaywallReason] = useState('Función Pro');
  const [paywallRequiredTokens, setPaywallRequiredTokens] = useState(5);

  // Sync user changes to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Error saving user to localStorage:', e);
    }
  }, [user]);

  const openAuthModal = (mode: 'login' | 'register' = 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const openTokenModal = (tab: 'balance' | 'referrals' | 'plans' = 'balance') => {
    setTokenModalTab(tab);
    setIsTokenModalOpen(true);
  };

  const closeTokenModal = () => setIsTokenModalOpen(false);

  const openPaywallModal = (reason: string, requiredTokens: number = 5) => {
    setPaywallReason(reason);
    setPaywallRequiredTokens(requiredTokens);
    setIsPaywallModalOpen(true);
  };

  const closePaywallModal = () => setIsPaywallModalOpen(false);

  // Login / Register with Google
  const loginWithGoogle = async (
    customEmail = 'tronaik3@gmail.com', 
    customName = 'Maestro Constructor',
    refCode?: string
  ): Promise<boolean> => {
    const isNew = !user || user.email !== customEmail;
    const initialTokens = isNew ? TOKEN_REWARDS.WELCOME_BONUS : (user?.tokens ?? TOKEN_REWARDS.WELCOME_BONUS);
    
    const history: TokenTransaction[] = user?.tokenHistory || [];
    let currentTokens = initialTokens;

    if (isNew) {
      history.push({
        id: `tx_${Date.now()}_welcome`,
        type: 'welcome',
        amount: TOKEN_REWARDS.WELCOME_BONUS,
        description: 'Bono de bienvenida por nuevo registro con Google',
        timestamp: new Date().toISOString()
      });

      if (refCode && refCode.trim().length > 3) {
        currentTokens += TOKEN_REWARDS.REFERRAL_INVITEE_BONUS;
        history.push({
          id: `tx_${Date.now()}_ref_bonus`,
          type: 'referral_applied',
          amount: TOKEN_REWARDS.REFERRAL_INVITEE_BONUS,
          description: `Bono de referido aplicado (código: ${refCode.trim().toUpperCase()})`,
          timestamp: new Date().toISOString()
        });
      }
    }

    const newUser: UserProfile = {
      id: user?.id || `user_google_${Date.now()}`,
      name: customName,
      email: customEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customEmail)}`,
      provider: 'google',
      createdAt: user?.createdAt || new Date().toISOString(),
      isPro: user?.isPro || false,
      subscriptionTier: user?.subscriptionTier || 'free',
      tokens: currentTokens,
      referralCode: user?.referralCode || generateReferralCode(customName),
      referredBy: refCode?.trim() || user?.referredBy,
      referralCount: user?.referralCount || 0,
      tokensEarnedFromReferrals: user?.tokensEarnedFromReferrals || 0,
      tokenHistory: history
    };

    setUser(newUser);
    closeAuthModal();
    return true;
  };

  // Login / Register with Email
  const loginWithEmail = async (email: string, name: string, refCode?: string): Promise<boolean> => {
    if (!email || !name) return false;

    const isNew = !user || user.email !== email;
    let currentTokens = isNew ? TOKEN_REWARDS.WELCOME_BONUS : (user?.tokens ?? TOKEN_REWARDS.WELCOME_BONUS);
    const history: TokenTransaction[] = user?.tokenHistory || [];

    if (isNew) {
      history.push({
        id: `tx_${Date.now()}_welcome`,
        type: 'welcome',
        amount: TOKEN_REWARDS.WELCOME_BONUS,
        description: 'Bono de bienvenida por registro con correo electrónico',
        timestamp: new Date().toISOString()
      });

      if (refCode && refCode.trim().length > 3) {
        currentTokens += TOKEN_REWARDS.REFERRAL_INVITEE_BONUS;
        history.push({
          id: `tx_${Date.now()}_ref_bonus`,
          type: 'referral_applied',
          amount: TOKEN_REWARDS.REFERRAL_INVITEE_BONUS,
          description: `Bono de referido aplicado (código: ${refCode.trim().toUpperCase()})`,
          timestamp: new Date().toISOString()
        });
      }
    }

    const newUser: UserProfile = {
      id: user?.id || `user_email_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      provider: 'email',
      createdAt: user?.createdAt || new Date().toISOString(),
      isPro: user?.isPro || false,
      subscriptionTier: user?.subscriptionTier || 'free',
      tokens: currentTokens,
      referralCode: user?.referralCode || generateReferralCode(name),
      referredBy: refCode?.trim() || user?.referredBy,
      referralCount: user?.referralCount || 0,
      tokensEarnedFromReferrals: user?.tokensEarnedFromReferrals || 0,
      tokenHistory: history
    };

    setUser(newUser);
    closeAuthModal();
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  // Check if action can be performed
  const canPerformAction = useCallback((requiredTokens: number): boolean => {
    if (!user) return false;
    if (user.isPro) return true; // Unlimited Pro user
    return user.tokens >= requiredTokens;
  }, [user]);

  // Consume tokens
  const consumeTokens = useCallback((
    amount: number, 
    description: string, 
    feature?: TokenTransaction['feature']
  ): { success: boolean; remaining: number } => {
    if (!user) {
      openAuthModal('register');
      return { success: false, remaining: 0 };
    }

    // If user is Pro, features are 100% free and don't consume tokens!
    if (user.isPro) {
      return { success: true, remaining: user.tokens };
    }

    if (user.tokens < amount) {
      // Trigger paywall modal with the exact missing tokens & feature
      openPaywallModal(description, amount);
      return { success: false, remaining: user.tokens };
    }

    const newTokens = user.tokens - amount;
    const newTx: TokenTransaction = {
      id: `tx_${Date.now()}_consume`,
      type: 'consumed',
      amount: -amount,
      description,
      feature,
      timestamp: new Date().toISOString()
    };

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tokens: newTokens,
        tokenHistory: [newTx, ...prev.tokenHistory]
      };
    });

    return { success: true, remaining: newTokens };
  }, [user]);

  // Apply a friend's referral code
  const applyReferralCode = (code: string): { success: boolean; message: string } => {
    if (!user) {
      return { success: false, message: 'Debes iniciar sesión para canjear un código.' };
    }
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === user.referralCode) {
      return { success: false, message: 'No puedes usar tu propio código de referido.' };
    }
    if (user.referredBy) {
      return { success: false, message: `Ya canjeaste un código de referido anteriormente (${user.referredBy}).` };
    }
    if (cleanCode.length < 4) {
      return { success: false, message: 'Código de referido no válido.' };
    }

    const bonus = TOKEN_REWARDS.REFERRAL_INVITEE_BONUS;
    const newTx: TokenTransaction = {
      id: `tx_${Date.now()}_ref`,
      type: 'referral_applied',
      amount: bonus,
      description: `Bono por canje de código de amigo (${cleanCode})`,
      timestamp: new Date().toISOString()
    };

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tokens: prev.tokens + bonus,
        referredBy: cleanCode,
        tokenHistory: [newTx, ...prev.tokenHistory]
      };
    });

    return { 
      success: true, 
      message: `¡Excelente! Has recibido +${bonus} tokens gratis por el código de tu amigo.` 
    };
  };

  // Simulate a new user joining with this user's referral code
  const simulateReferralJoined = () => {
    if (!user) return;
    const bonus = TOKEN_REWARDS.REFERRAL_INVITER_BONUS;
    const randomFriendNames = ['Juan Soto', 'Carlos Tapia', 'Patricia Morales', 'Rodrigo Díaz', 'Claudio Bravo', 'Marcelo Valenzuela'];
    const friendName = randomFriendNames[Math.floor(Math.random() * randomFriendNames.length)];

    const newTx: TokenTransaction = {
      id: `tx_${Date.now()}_ref_join`,
      type: 'referral_earned',
      amount: bonus,
      description: `¡Tu amigo ${friendName} se registró con tu enlace de referido!`,
      timestamp: new Date().toISOString()
    };

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tokens: prev.tokens + bonus,
        referralCount: (prev.referralCount || 0) + 1,
        tokensEarnedFromReferrals: (prev.tokensEarnedFromReferrals || 0) + bonus,
        tokenHistory: [newTx, ...prev.tokenHistory]
      };
    });
  };

  // Upgrade to Pro
  const upgradeToPro = (planId: 'pro_monthly' | 'pro_annual') => {
    if (!user) {
      openAuthModal('register');
      return;
    }

    const expires = new Date();
    if (planId === 'pro_monthly') {
      expires.setMonth(expires.getMonth() + 1);
    } else {
      expires.setFullYear(expires.getFullYear() + 1);
    }

    const newTx: TokenTransaction = {
      id: `tx_${Date.now()}_sub`,
      type: 'purchase',
      amount: 0,
      description: `Activación de suscripción: ${planId === 'pro_monthly' ? 'Plan Pro Mensual' : 'Plan Pro Anual'} (Funcionalidades 100% Ilimitadas)`,
      timestamp: new Date().toISOString()
    };

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        isPro: true,
        subscriptionTier: planId,
        subscriptionExpiresAt: expires.toISOString(),
        tokenHistory: [newTx, ...prev.tokenHistory]
      };
    });

    closePaywallModal();
  };

  // Buy token packages
  const buyTokens = (packageId: string) => {
    if (!user) {
      openAuthModal('register');
      return;
    }

    const pkg = TOKEN_PACKAGES.find(p => p.id === packageId) || TOKEN_PACKAGES[0];
    const newTx: TokenTransaction = {
      id: `tx_${Date.now()}_pack`,
      type: 'purchase',
      amount: pkg.tokens,
      description: `Recarga de paquete de tokens (+${pkg.tokens} tokens)`,
      timestamp: new Date().toISOString()
    };

    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tokens: prev.tokens + pkg.tokens,
        tokenHistory: [newTx, ...prev.tokenHistory]
      };
    });

    closePaywallModal();
  };

  // Quick testing helpers
  const resetTokensForTesting = (amount: number = 0) => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tokens: amount,
        isPro: false,
        subscriptionTier: 'free'
      };
    });
  };

  const toggleProForTesting = () => {
    if (!user) return;
    setUser(prev => {
      if (!prev) return null;
      const nextPro = !prev.isPro;
      return {
        ...prev,
        isPro: nextPro,
        subscriptionTier: nextPro ? 'pro_monthly' : 'free'
      };
    });
  };

  const isPro = Boolean(user?.isPro);
  const tokens = user ? user.tokens : 0;
  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isPro,
        tokens,
        loginWithGoogle,
        loginWithEmail,
        logout,
        consumeTokens,
        canPerformAction,
        applyReferralCode,
        simulateReferralJoined,
        upgradeToPro,
        buyTokens,
        resetTokensForTesting,
        toggleProForTesting,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isTokenModalOpen,
        tokenModalTab,
        openTokenModal,
        closeTokenModal,
        isPaywallModalOpen,
        paywallReason,
        paywallRequiredTokens,
        openPaywallModal,
        closePaywallModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
