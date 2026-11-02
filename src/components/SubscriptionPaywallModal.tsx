import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Crown, 
  Lock, 
  Check, 
  Gift, 
  Coins, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { PRICING_PLANS } from '../types/auth';

export const SubscriptionPaywallModal: React.FC = () => {
  const {
    user,
    isAuthenticated,
    isPaywallModalOpen,
    closePaywallModal,
    paywallReason,
    paywallRequiredTokens,
    upgradeToPro,
    buyTokens,
    openTokenModal,
    openAuthModal
  } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<'pro_monthly' | 'pro_annual'>('pro_monthly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successPayment, setSuccessPayment] = useState(false);

  if (!isPaywallModalOpen) return null;

  const handleCheckout = () => {
    if (!isAuthenticated) {
      closePaywallModal();
      openAuthModal('register');
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      upgradeToPro(selectedPlan);
      setIsProcessing(false);
      setSuccessPayment(true);
      setTimeout(() => {
        setSuccessPayment(false);
        closePaywallModal();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
        
        {/* Banner with Alert & Lock */}
        <div className="bg-slate-950 p-5 text-white text-center relative border-b border-slate-800">
          <button
            onClick={closePaywallModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-md mb-2.5">
            <Lock className="w-6 h-6" />
          </div>

          <span className="badge-reflective-amber text-[9px] px-2 py-0.5 rounded-xs inline-block mb-1.5">
            LÍMITE GRATUITO ALCANZADO
          </span>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Has agotado tus tokens gratuitos
          </h2>

          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
            La acción <strong className="text-orange-400 font-bold">"{paywallReason}"</strong> requiere {paywallRequiredTokens} tokens. 
            Actualmente tienes <strong className="text-white">{user?.tokens ?? 0} tokens</strong> disponibles.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">
          
          {successPayment ? (
            <div className="p-8 text-center space-y-3 bg-slate-950 rounded-xl border border-emerald-500/40">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-bold text-white">
                ¡Activación Exitosa!
              </h3>
              <p className="text-xs text-slate-400">
                Tu cuenta ahora tiene acceso completo e ilimitado a todas las herramientas de cálculo y planos.
              </p>
            </div>
          ) : (
            <>
              {/* Value Proposition Box: Free vs Pro */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-orange-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Desbloquea la App Completa con el Plan PRO
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1 p-2.5 rounded-md bg-slate-900 border border-slate-800">
                    <p className="font-bold text-red-400 flex items-center gap-1">
                      <span>✕</span> Plan Gratuito (Sin tokens):
                    </p>
                    <ul className="text-[11px] text-slate-400 space-y-0.5 pl-1">
                      <li>· Bloqueo de cubicación con IA</li>
                      <li>· Sin descargas de cotizaciones PDF</li>
                      <li>· Plano 2D sin exportación de insumos</li>
                    </ul>
                  </div>

                  <div className="space-y-1 p-2.5 rounded-md bg-slate-900 border border-orange-500/30">
                    <p className="font-bold text-orange-400 flex items-center gap-1">
                      <span>✓</span> Suscriptor PRO (Ilimitado):
                    </p>
                    <ul className="text-[11px] text-slate-300 space-y-0.5 pl-1">
                      <li>· Cálculos ilimitados con IA Gemini</li>
                      <li>· Cotizaciones formales en PDF</li>
                      <li>· Planos 2D y cotizaciones sin restricciones</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Plan Choice Selector */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Elige cómo deseas continuar:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PRICING_PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedPlan === plan.id
                          ? 'border-orange-500 bg-slate-950 shadow-sm ring-1 ring-orange-500/20'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-white">
                          {plan.name}
                        </span>
                        {plan.discountBadge && (
                          <span className="text-[9px] font-mono font-bold bg-orange-600 text-white px-1.5 py-0.2 rounded">
                            {plan.discountBadge}
                          </span>
                        )}
                      </div>
                      <div className="text-base font-bold font-mono text-orange-400">
                        ${plan.priceClp.toLocaleString('es-CL')} <span className="text-[10px] text-slate-400 font-sans font-normal">CLP / {plan.period}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {plan.tagline}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment CTA Button */}
              <div>
                <button
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm shadow-orange-950 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>
                    {isProcessing 
                      ? 'Procesando Pago Seguro...' 
                      : `Activar ${selectedPlan === 'pro_monthly' ? 'Plan Mensual ($9.990 CLP)' : 'Plan Anual ($79.990 CLP)'}`}
                  </span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
                <p className="text-[10px] text-slate-400 text-center mt-1.5 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-orange-400" />
                  <span>Activación instantánea de todas las herramientas de obra</span>
                </p>
              </div>

              {/* Alternative: Free referral option */}
              <div className="pt-2 border-t border-slate-800">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-200">
                        ¿Prefieres no pagar? Refiere colegas
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Gana +25 tokens gratis por cada colega que invites.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      closePaywallModal();
                      openTokenModal('referrals');
                    }}
                    className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-colors cursor-pointer"
                  >
                    Ver mi Enlace (+25)
                  </button>
                </div>
              </div>

              {/* Or Quick token recharge */}
              <div className="text-center pt-1">
                <button
                  onClick={() => {
                    closePaywallModal();
                    openTokenModal('plans');
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-white inline-flex items-center space-x-1"
                >
                  <Coins className="w-3.5 h-3.5 text-orange-400" />
                  <span>O recarga un paquete de tokens individuales desde $3.990 CLP</span>
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
