import React, { useState } from 'react';
import { MaterialItem, QualityTier, ProjectType } from '../types';
import { PROJECT_CATEGORIES } from '../data/chileData';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Send, 
  MessageCircle, 
  Mail, 
  Smartphone, 
  ExternalLink,
  FileText,
  Building2,
  CheckCircle2
} from 'lucide-react';

interface ShareBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  materials: MaterialItem[];
  quality: QualityTier;
  projectType: ProjectType;
  projectAddress: string;
  totalCost?: number;
}

export const ShareBudgetModal: React.FC<ShareBudgetModalProps> = ({
  isOpen,
  onClose,
  materials,
  quality,
  projectType,
  projectAddress,
  totalCost
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const selectedMaterials = materials.filter(m => m.selected);
  const categoryConfig = PROJECT_CATEGORIES.find(c => c.id === projectType);
  const categoryName = categoryConfig?.name || projectType.toUpperCase();

  // Financial summary calculation
  const subtotal = selectedMaterials.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
  const laborPercent = categoryConfig ? categoryConfig.laborPercent : 0.45;
  const labor = Math.round(subtotal * laborPercent);
  const transport = Math.min(25000, Math.max(5000, Math.round(subtotal * 0.05)));
  const calculatedTotal = totalCost || (subtotal + labor + transport);

  // Formatted message text
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://cubicadorpro.cl';
  
  const shareText = `📋 *COTIZACIÓN DE OBRA - CUBICADOR PRO*
---------------------------------------
🏗️ *Partida:* ${categoryName}
⭐ *Estándar de Calidad:* ${quality.toUpperCase()}
📍 *Ubicación Obra:* ${projectAddress || 'Santiago, Chile'}
📅 *Fecha:* ${new Date().toLocaleDateString('es-CL')}

*RESUMEN FINANCIERO ESTIMADO:*
• Insumos y Materiales (${selectedMaterials.length} ítems): $${Math.round(subtotal).toLocaleString('es-CL')} CLP
• Mano de Obra Estimada (~${Math.round(laborPercent * 100)}%): $${Math.round(labor).toLocaleString('es-CL')} CLP
• Flete y Logística: $${Math.round(transport).toLocaleString('es-CL')} CLP
💰 *TOTAL PROYECTADO:* $${Math.round(calculatedTotal).toLocaleString('es-CL')} CLP

*PRINCIPALES MATERIALES:*
${selectedMaterials.slice(0, 5).map(m => `• ${m.name}: ${m.quantity} ${m.unit}`).join('\n')}${selectedMaterials.length > 5 ? `\n... y ${selectedMaterials.length - 5} materiales más.` : ''}

---------------------------------------
Generado con *Cubicador Pro* - Cubicación y Presupuestos de Construcción Chile 🇨🇱
Accede y calcula tu proyecto aquí: ${shareUrl}`;

  // Native Web Share API
  const canUseNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const handleNativeShare = async () => {
    if (canUseNativeShare) {
      try {
        await navigator.share({
          title: `Cotización ${categoryName} - Cubicador Pro`,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        // User cancelled or aborted
        console.log('Share dismissed or cancelled:', err);
      }
    }
  };

  // WhatsApp
  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Telegram
  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Messenger / Facebook Dialog
  const handleShareMessenger = () => {
    // Open Facebook Share or Messenger link
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Email
  const handleShareEmail = () => {
    const subject = `Presupuesto y Cotización: ${categoryName} - Cubicador Pro`;
    const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shareText)}`;
    window.location.href = mailto;
  };

  // Copy full quotation text
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Copy app link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-60 overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-5 relative my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="share-modal-title" className="text-base font-bold text-white flex items-center gap-1.5">
                Compartir Cotización
              </h3>
              <p className="text-xs text-slate-400">
                Envía este presupuesto a clientes, maestros o proveedores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            aria-label="Cerrar modal de compartir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Share Platform Buttons */}
        <div className="space-y-3">
          <span className="text-xs font-semibold text-slate-300 block">
            Selecciona la app para compartir:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* WhatsApp */}
            <button
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-600/40 text-emerald-300 transition-all cursor-pointer group active:scale-95 shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xs font-bold text-white">WhatsApp</span>
              <span className="text-[10px] text-emerald-400/80">Mensaje directo</span>
            </button>

            {/* Telegram */}
            <button
              onClick={handleShareTelegram}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-600/40 text-sky-300 transition-all cursor-pointer group active:scale-95 shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                <Send className="w-5 h-5 ml-0.5" />
              </div>
              <span className="text-xs font-bold text-white">Telegram</span>
              <span className="text-[10px] text-sky-400/80">Canal o chat</span>
            </button>

            {/* Messenger / Facebook */}
            <button
              onClick={handleShareMessenger}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 border border-blue-600/40 text-blue-300 transition-all cursor-pointer group active:scale-95 shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Messenger</span>
              <span className="text-[10px] text-blue-400/80">Facebook chat</span>
            </button>

            {/* Correo Electrónico */}
            <button
              onClick={handleShareEmail}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/40 text-amber-300 transition-all cursor-pointer group active:scale-95 shadow-xs"
            >
              <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white">Correo</span>
              <span className="text-[10px] text-amber-400/80">Email formal</span>
            </button>
          </div>

          {/* Native Web Share API (Smartphone Sheet) if available */}
          {canUseNativeShare && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-xs active:scale-98"
            >
              <Smartphone className="w-4 h-4" />
              <span>Abrir menú de compartir del teléfono (Apps instaladas)</span>
            </button>
          )}
        </div>

        {/* Copy Options */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-300 block">
            Acciones rápidas de portapapeles:
          </span>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCopyText}
              className={`flex-1 flex items-center justify-center space-x-2 p-2.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                copiedText
                  ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {copiedText ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Resumen copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-orange-400" />
                  <span>Copiar texto de cotización</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopyLink}
              className={`flex-1 flex items-center justify-center space-x-2 p-2.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>¡Enlace copiado!</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 text-blue-400" />
                  <span>Copiar enlace web</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Vista previa del mensaje a enviar:</span>
            <span className="font-mono text-[10px] text-slate-500">Formato WhatsApp / Chat</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-line leading-relaxed select-all">
            {shareText}
          </div>
        </div>

        {/* Return / Close Button */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Cerrar y Volver
          </button>
        </div>

      </div>
    </div>
  );
};
