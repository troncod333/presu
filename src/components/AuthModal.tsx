import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Sparkles, 
  Mail, 
  User, 
  Gift, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Tag
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    openAuthModal, 
    loginWithGoogle, 
    loginWithEmail 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [refCode, setRefCode] = useState('');
  const [showRefInput, setShowRefInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const isRegister = authModalMode === 'register';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loginEmail = email.trim() || 'tronaik3@gmail.com';
      const loginName = name.trim() || (loginEmail.includes('@') ? loginEmail.split('@')[0] : 'Usuario Google');
      await loginWithGoogle(loginEmail, loginName, refCode);
    } catch (e: any) {
      setError(e.message || 'Error al iniciar sesión con Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }
    const userName = name.trim() || email.split('@')[0] || 'Usuario';
    setIsLoading(true);
    setError(null);
    try {
      await loginWithEmail(email, userName, refCode);
    } catch (e: any) {
      setError(e.message || 'Error al procesar el inicio de sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 text-slate-100 rounded-xl shadow-2xl border border-slate-800 overflow-hidden transform transition-all">
        
        {/* Header Ribbon / Banner - Sober Graphite with Reflective Welcome Marker */}
        <div className="bg-slate-950 p-5 text-white text-center relative border-b border-slate-800">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 mb-2">
            <Gift className="w-3.5 h-3.5 text-orange-400" />
            <span>Acceso Profesional</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            {isRegister ? 'Registro Gratuito de Constructor' : 'Acceso a Presupuestos'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            {isRegister 
              ? 'Activa el asistente IA Gemini, cubicación 2D y cotizaciones oficiales de ferretería.'
              : 'Ingresa para gestionar tus cotizaciones guardadas y tokens.'}
          </p>

          {/* Tokens Welcome Badge - Reflective Lime */}
          {isRegister && (
            <div className="mt-3 inline-flex items-center space-x-1.5 badge-reflective text-[10px] px-2.5 py-1 rounded-sm font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>+50 TOKENS GRATIS DE REGALO</span>
            </div>
          )}
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setError(null); openAuthModal('register'); }}
            className={`flex-1 py-3 text-center transition-colors ${
              isRegister
                ? 'text-orange-400 border-b-2 border-orange-500 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Crear Cuenta (+50 Tokens)
          </button>
          <button
            type="button"
            onClick={() => { setError(null); openAuthModal('login'); }}
            className={`flex-1 py-3 text-center transition-colors ${
              !isRegister
                ? 'text-orange-400 border-b-2 border-orange-500 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-200 rounded-lg text-xs font-medium">
              {error}
            </div>
          )}

          {/* Google Sign-In Button */}
          <div>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-2.5 px-4 rounded-lg border border-slate-700 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-mono tracking-wider absolute">
              o con correo
            </span>
          </div>

          {/* Email / Form Inputs */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo o Empresa
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Pérez - Constructor"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu-correo@ejemplo.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-700 bg-slate-950 text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Optional Referral Code Toggle */}
            {isRegister && (
              <div>
                {!showRefInput ? (
                  <button
                    type="button"
                    onClick={() => setShowRefInput(true)}
                    className="text-xs text-orange-400 font-semibold hover:underline flex items-center space-x-1"
                  >
                    <Tag className="w-3 h-3" />
                    <span>¿Tienes un código de referido de un colega? (+25 tokens extra)</span>
                  </button>
                ) : (
                  <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300">
                      Código de Referido (Opcional)
                    </label>
                    <input
                      type="text"
                      value={refCode}
                      onChange={(e) => setRefCode(e.target.value.toUpperCase())}
                      placeholder="Ej. JUAN-4589"
                      className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-wider rounded border border-slate-700 bg-slate-900 text-white uppercase outline-none focus:border-blue-500"
                    />
                    <p className="text-[10px] text-slate-400">
                      Si un colega te invitó, ambos recibirán +25 tokens al registrar este código.
                    </p>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-sm shadow-orange-950 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isRegister ? 'Crear Cuenta y Reclamar 50 Tokens' : 'Ingresar a mi Cuenta'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Value props bullets */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>50 Tokens gratis de bienvenida sin ingresar tarjeta</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Presupuestos y medidas guardados en la nube</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Normativas SEC y MINVU siempre actualizadas</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
