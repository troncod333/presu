import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Coins, 
  Crown, 
  Gift, 
  LogOut, 
  ChevronDown, 
  Share2
} from 'lucide-react';

export const UserAccountWidget: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isPro,
    tokens,
    openAuthModal,
    logout,
    openTokenModal,
    openPaywallModal
  } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => openAuthModal('register')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm shadow-orange-950 transition-all cursor-pointer whitespace-nowrap"
          title="Regístrate gratis y recibe 50 tokens"
        >
          <Gift className="w-3.5 h-3.5 text-white" />
          <span>Iniciar (+50 Tokens)</span>
        </button>

        <button
          onClick={() => openAuthModal('login')}
          className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors cursor-pointer hidden sm:block whitespace-nowrap"
        >
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex items-center space-x-2" ref={menuRef}>
      
      {/* Token Pill Button */}
      <button
        onClick={() => openTokenModal('balance')}
        className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer shadow-xs whitespace-nowrap ${
          isPro
            ? 'badge-reflective'
            : tokens <= 5
            ? 'border-reflective-amber bg-slate-900 text-amber-300'
            : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-slate-500'
        }`}
        title="Ver saldo de tokens y planes"
      >
        {isPro ? (
          <>
            <Crown className="w-3.5 h-3.5 text-slate-950" />
            <span>PRO ACTIVO</span>
          </>
        ) : (
          <>
            <Coins className={`w-3.5 h-3.5 ${tokens <= 5 ? 'text-amber-400' : 'text-orange-400'}`} />
            <span>{tokens} Tokens</span>
          </>
        )}
      </button>

      {/* Referral Quick Action */}
      {!isPro && (
        <button
          onClick={() => openTokenModal('referrals')}
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 hover:border-orange-500 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
          title="Gana +25 tokens refiriendo amigos"
        >
          <Gift className="w-3.5 h-3.5 text-orange-400" />
          <span>+25</span>
        </button>
      )}

      {/* User Profile Avatar & Dropdown Trigger */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center space-x-1.5 p-1 rounded-lg hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
      >
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
          alt={user.name}
          className="w-7 h-7 rounded-md bg-slate-800 object-cover border border-slate-700"
        />
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 p-2 z-50 text-xs animate-fade-in space-y-1 text-slate-200">
          
          {/* User info box */}
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
            <p className="font-bold text-white truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate font-mono">
              {user.email}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Estado:
              </span>
              {isPro ? (
                <span className="badge-reflective text-[9px] px-1.5 py-0.5 rounded-sm">
                  SUSCRIPTOR PRO
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-orange-400">
                  {tokens} Tokens
                </span>
              )}
            </div>
          </div>

          {/* Menu Actions */}
          <button
            onClick={() => { setMenuOpen(false); openTokenModal('balance'); }}
            className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-colors text-left cursor-pointer"
          >
            <Coins className="w-4 h-4 text-orange-400" />
            <span>Mi Saldo y Consumo</span>
          </button>

          <button
            onClick={() => { setMenuOpen(false); openTokenModal('referrals'); }}
            className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-colors text-left cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-blue-400" />
            <span>Ganar Tokens (+25 por amigo)</span>
          </button>

          <button
            onClick={() => { setMenuOpen(false); openTokenModal('plans'); }}
            className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-colors text-left cursor-pointer"
          >
            <Crown className="w-4 h-4 text-orange-400" />
            <span>{isPro ? 'Gestionar Suscripción' : 'Desbloquear PRO Ilimitado'}</span>
          </button>

          <div className="border-t border-slate-800 my-1"></div>

          <button
            onClick={() => { setMenuOpen(false); logout(); }}
            className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-red-950/40 text-red-400 font-medium transition-colors text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>

        </div>
      )}

    </div>
  );
};
