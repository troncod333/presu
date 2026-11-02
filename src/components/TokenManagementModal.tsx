import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Coins, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Crown, 
  Gift, 
  Sparkles, 
  History, 
  ArrowUpRight, 
  CreditCard, 
  ExternalLink,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Zap,
  MessageCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { PRICING_PLANS, TOKEN_PACKAGES, TOKEN_COSTS, TOKEN_REWARDS } from '../types/auth';

export const TokenManagementModal: React.FC = () => {
  const {
    user,
    isTokenModalOpen,
    closeTokenModal,
    tokenModalTab,
    openTokenModal,
    applyReferralCode,
    simulateReferralJoined,
    upgradeToPro,
    buyTokens,
    resetTokensForTesting,
    toggleProForTesting,
    openPaywallModal
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'balance' | 'referrals' | 'plans'>(tokenModalTab || 'balance');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [friendCodeMsg, setFriendCodeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Sync tab if opened with specific tab
  React.useEffect(() => {
    if (tokenModalTab) {
      setActiveTab(tokenModalTab);
    }
  }, [tokenModalTab]);

  if (!isTokenModalOpen || !user) return null;

  const referralUrl = `${window.location.origin}/?ref=${user.referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = `¡Hola colega! Te recomiendo el Presupuestador Inteligente Pro para cubicaciones y proyectos en Chile (precios Sodimac, Easy, Construmart 2025). Usa mi código ${user.referralCode} para recibir 50+25 tokens gratis: ${referralUrl}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleApplyFriendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;
    const res = applyReferralCode(friendCodeInput);
    if (res.success) {
      setFriendCodeMsg({ type: 'success', text: res.message });
      setFriendCodeInput('');
    } else {
      setFriendCodeMsg({ type: 'error', text: res.message });
    }
  };

  const handleSubscribe = async (planId: 'pro_monthly' | 'pro_annual') => {
    setIsProcessingCheckout(true);
    // Simulate real payment checkout processing
    setTimeout(() => {
      upgradeToPro(planId);
      setIsProcessingCheckout(false);
    }, 1000);
  };

  const handleBuyPack = async (packId: string) => {
    setIsProcessingCheckout(true);
    setTimeout(() => {
      buyTokens(packId);
      setIsProcessingCheckout(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${
              user.isPro 
                ? 'badge-reflective' 
                : 'bg-orange-600 text-white'
            }`}>
              {user.isPro ? <Crown className="w-5 h-5 text-slate-950" /> : <Coins className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {user.isPro ? 'Membresía PRO Ilimitada' : 'Tokens y Centro de Referidos'}
                </h2>
                {user.isPro ? (
                  <span className="badge-reflective text-[9px] px-1.5 py-0.5 rounded-sm">
                    PRO ACTIVO
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-orange-400">
                    Plan Gratuito
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                {user.name} · {user.email}
              </p>
            </div>
          </div>

          <button
            onClick={closeTokenModal}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-1">
          <button
            onClick={() => setActiveTab('balance')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'balance'
                ? 'border-orange-500 text-orange-400 bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-4 h-4 text-orange-400" />
            <span>Mi Saldo ({user.isPro ? '∞ Pro' : user.tokens})</span>
          </button>

          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'referrals'
                ? 'border-orange-500 text-orange-400 bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Ganar Tokens (Referidos)</span>
            <span className="bg-slate-800 text-slate-200 text-[10px] font-mono px-1.5 py-0.2 rounded border border-slate-700">
              +25
            </span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'plans'
                ? 'border-orange-500 text-orange-400 bg-slate-900 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Planes de Pago</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1 bg-slate-900 text-slate-100">
          
          {/* TAB 1: SALDO Y CONSUMO */}
          {activeTab === 'balance' && (
            <div className="space-y-5">
              
              {/* Balance Card */}
              <div className={`p-4 rounded-xl border relative overflow-hidden ${
                user.isPro
                  ? 'bg-slate-950 border-[#ccff00]/60 glow-reflective'
                  : user.tokens <= 5
                  ? 'bg-slate-950 border-reflective-amber'
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Saldo Disponible para Funciones Técnicas
                    </span>
                    <div className="flex items-baseline space-x-2 mt-1">
                      {user.isPro ? (
                        <>
                          <span className="text-3xl font-black text-white font-mono">
                            ILIMITADO
                          </span>
                          <span className="badge-reflective text-[9px] px-1.5 py-0.5 rounded-sm">
                            SIN CONSUMO DE TOKENS
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl font-black font-mono tabular-nums text-orange-400">
                            {user.tokens}
                          </span>
                          <span className="text-sm font-bold text-slate-300">
                            Tokens
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {user.isPro 
                        ? 'Tu suscripción Pro activa te permite usar el 100% de la app sin límites de uso.'
                        : user.tokens > 0 
                        ? `Puedes realizar aproximadamente ${Math.floor(user.tokens / 5)} cubicaciones con IA o ${Math.floor(user.tokens / 10)} exportaciones de cotización.`
                        : '¡Has agotado tus tokens! Para continuar usando la app completa, pasa a Pro o refiere amigos.'}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {!user.isPro && (
                      <button
                        onClick={() => setActiveTab('plans')}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 font-black text-xs shadow-md hover:from-amber-600 hover:to-yellow-600 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Crown className="w-4 h-4" />
                        <span>Pasar a PRO Ilimitado</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('referrals')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Gift className="w-4 h-4" />
                      <span>Ganar Tokens Gratis (+25)</span>
                    </button>
                  </div>
                </div>

                {/* Tokens low alert */}
                {!user.isPro && user.tokens <= 5 && (
                  <div className="mt-4 p-3 bg-red-100/80 dark:bg-red-900/40 rounded-xl border border-red-300 dark:border-red-700 flex items-center justify-between text-xs text-red-800 dark:text-red-200">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                      <span><strong>Saldo bajo:</strong> Te quedan pocos tokens para cálculos con IA o descargas.</span>
                    </div>
                    <button
                      onClick={() => openPaywallModal('Suscripción Pro')}
                      className="font-bold underline text-red-700 dark:text-red-300 shrink-0 ml-2"
                    >
                      Ver Planes
                    </button>
                  </div>
                )}
              </div>

              {/* Table of Token Costs */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-2xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Costo de Operaciones en Modo Gratuito
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60">
                    <span className="font-medium text-gray-700 dark:text-gray-200">🤖 Cubicación con IA Gemini</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{TOKEN_COSTS.AI_CALCULATION} tokens</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60">
                    <span className="font-medium text-gray-700 dark:text-gray-200">📄 Exportar Cotización PDF Formal</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{TOKEN_COSTS.PDF_EXPORT} tokens</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60">
                    <span className="font-medium text-gray-700 dark:text-gray-200">📐 Exportar Plano CAD / Materiales 2D</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{TOKEN_COSTS.CANVAS_EXPORT} tokens</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/60">
                    <span className="font-medium text-gray-700 dark:text-gray-200">💾 Guardar Presupuesto en Historial</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{TOKEN_COSTS.SAVE_BUDGET} tokens</span>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5" />
                    <span>Historial de Tokens y Movimientos</span>
                  </h3>
                  <span className="text-[11px] text-gray-400">
                    {user.tokenHistory.length} transacciones
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {user.tokenHistory.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">No hay movimientos registrados aún.</p>
                  ) : (
                    user.tokenHistory.map((tx) => (
                      <div 
                        key={tx.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-750 text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.amount > 0 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : tx.amount < 0 
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                          }`}>
                            {tx.amount > 0 ? '+' : tx.amount < 0 ? '-' : '★'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200 leading-snug">
                              {tx.description}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {new Date(tx.timestamp).toLocaleString('es-CL')}
                            </p>
                          </div>
                        </div>

                        <span className={`font-black text-sm shrink-0 ml-2 ${
                          tx.amount > 0 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : tx.amount < 0 
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Developer / Testing quick toggles */}
              <div className="p-3 bg-gray-100 dark:bg-gray-700/40 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Prueba de Flujos (Simulador de Usuario):
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => resetTokensForTesting(0)}
                    className="px-2.5 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300 text-[11px] font-bold"
                    title="Simular usuario sin tokens para probar el paywall"
                  >
                    Probar Tokens = 0
                  </button>
                  <button
                    onClick={() => resetTokensForTesting(50)}
                    className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 text-[11px] font-bold"
                  >
                    Reset a 50 Tokens
                  </button>
                  <button
                    onClick={toggleProForTesting}
                    className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 text-[11px] font-bold"
                  >
                    {user.isPro ? 'Desactivar Pro' : 'Activar Pro Demo'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SISTEMA DE REFERIDOS */}
          {activeTab === 'referrals' && (
            <div className="space-y-6">
              
              {/* Promo Banner */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white relative overflow-hidden shadow-lg">
                <div className="relative z-10 space-y-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-xs inline-flex items-center space-x-1">
                    <Gift className="w-3.5 h-3.5 text-amber-300" />
                    <span>Programa de Crecimiento & Referidos</span>
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black">
                    Invita Colegas y Gana +25 Tokens por Cada Uno
                  </h3>
                  <p className="text-xs text-emerald-100 max-w-lg leading-relaxed">
                    Comparte tu enlace o código con maestros, contratistas o clientes. Cuando se registren, 
                    <strong> ellos reciben +25 tokens de bienvenida</strong> y 
                    <strong> tú ganas +25 tokens de inmediato</strong> para seguir cubicando gratis.
                  </p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-center">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Amigos Invitados</p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {user.referralCount || 0}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-center">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Tokens Ganados</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    +{user.tokensEarnedFromReferrals || 0}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-center col-span-2 sm:col-span-1">
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Recompensa</p>
                  <p className="text-lg font-black text-amber-500 mt-0.5">
                    +25 por persona
                  </p>
                </div>
              </div>

              {/* Copy Code & Link Box */}
              <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tu Código de Referido Personal:
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-700 font-mono text-base font-black tracking-widest text-indigo-700 dark:text-indigo-300">
                      {user.referralCode}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? '¡Copiado!' : 'Copiar Código'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Enlace Directo de Invitación:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      readOnly
                      value={referralUrl}
                      className="flex-1 px-3 py-2.5 text-xs font-mono rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'Copiado' : 'Copiar Enlace'}</span>
                    </button>
                    <button
                      onClick={handleShareWhatsApp}
                      className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-sm"
                      title="Compartir por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Instant simulator button */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    ¿Quieres verificar el funcionamiento de los referidos?
                  </span>
                  <button
                    onClick={simulateReferralJoined}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Simular Amigo Registrado (+25 Tokens)</span>
                  </button>
                </div>
              </div>

              {/* Redeem friend's code section */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 space-y-2">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  ¿Un amigo te dio su código? Canjéalo aquí:
                </h4>
                {user.referredBy ? (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ya canjeaste el código de referido: <strong>{user.referredBy}</strong> (+25 tokens recibidos)</span>
                  </p>
                ) : (
                  <form onSubmit={handleApplyFriendCode} className="flex gap-2">
                    <input
                      type="text"
                      value={friendCodeInput}
                      onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                      placeholder="Ej. CARLOS-3421"
                      className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Canjear (+25)
                    </button>
                  </form>
                )}

                {friendCodeMsg && (
                  <p className={`text-xs font-semibold ${
                    friendCodeMsg.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {friendCodeMsg.text}
                  </p>
                )}
              </div>

            </div>
          )}

          {/* TAB 3: PLANES DE PAGO Y SUSCRIPCIÓN PRO */}
          {activeTab === 'plans' && (
            <div className="space-y-6">
              
              <div className="text-center space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-black inline-flex items-center space-x-1">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>APP COMPLETA SIN LÍMITES</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                  Elige tu Plan Pro o Recarga Tokens
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Desbloquea presupuestos ilimitados, planos interactivos exportables y atención prioritaria para tus obras.
                </p>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRICING_PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-3xl p-5 border transition-all flex flex-col justify-between ${
                      plan.popular
                        ? 'border-2 border-indigo-600 dark:border-indigo-500 bg-gradient-to-b from-indigo-50/60 to-white dark:from-indigo-950/40 dark:to-gray-800 shadow-xl'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm'
                    }`}
                  >
                    {plan.discountBadge && (
                      <span className="absolute -top-3 right-5 bg-gradient-to-r from-pink-600 to-rose-600 text-white text-[11px] font-black px-3 py-0.5 rounded-full shadow-md">
                        {plan.discountBadge}
                      </span>
                    )}

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-extrabold text-gray-900 dark:text-white">
                            {plan.name}
                          </h4>
                          {plan.popular && (
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                              Recomendado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {plan.tagline}
                        </p>
                      </div>

                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                          ${plan.priceClp.toLocaleString('es-CL')}
                        </span>
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          CLP / {plan.period}
                        </span>
                      </div>

                      <ul className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-xs">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6">
                      <button
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isProcessingCheckout || (user.isPro && user.subscriptionTier === plan.id)}
                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md ${
                          user.isPro && user.subscriptionTier === plan.id
                            ? 'bg-emerald-600 text-white cursor-default'
                            : plan.popular
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-gray-900 hover:bg-black text-white dark:bg-gray-700 dark:hover:bg-gray-600'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>
                          {user.isPro && user.subscriptionTier === plan.id
                            ? 'Plan Actual Activo'
                            : isProcessingCheckout
                            ? 'Procesando Pago Seguro...'
                            : `Suscribirme a ${plan.name}`}
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Token Recharge Packs */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 space-y-3">
                <div>
                  <h4 className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center space-x-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>¿Prefieres pagar solo por uso? Recarga un Paquete de Tokens:</span>
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Los tokens nunca caducan y puedes usarlos en cualquier proyecto o cálculo.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {TOKEN_PACKAGES.map((pkg) => (
                    <div 
                      key={pkg.id}
                      className="p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-center flex flex-col justify-between hover:border-indigo-400 transition-colors"
                    >
                      <div>
                        {pkg.badge && (
                          <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full inline-block mb-1">
                            {pkg.badge}
                          </span>
                        )}
                        <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                          {pkg.tokens} Tokens
                        </p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          ${pkg.priceClp.toLocaleString('es-CL')} CLP
                        </p>
                      </div>

                      <button
                        onClick={() => handleBuyPack(pkg.id)}
                        disabled={isProcessingCheckout}
                        className="mt-3 w-full py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        Comprar Pack
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guarantees */}
              <div className="flex items-center justify-center space-x-4 text-[11px] text-gray-500 dark:text-gray-400 pt-2">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pagos en Pesos Chilenos (CLP)</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sin contratos forzados: cancela cuando quieras</span>
                </span>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500">
          <span>Presupuestador Inteligente Pro Chile 2025</span>
          <button
            onClick={closeTokenModal}
            className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
