import React, { useState, useEffect } from 'react';
import { ProjectType, QualityTier, MaterialItem, Supplier, BudgetRecord, AICalculationResult } from './types';
import { BASE_MATERIALS_CHILE, DEFAULT_SUPPLIERS, PROJECT_CATEGORIES, QUALITY_MULTIPLIERS } from './data/chileData';
import { Navbar } from './components/Navbar';
import { ProjectCategorySelector } from './components/ProjectCategorySelector';
import { AIAssistantPanel } from './components/AIAssistantPanel';
import { LocationAndMapPanel } from './components/LocationAndMapPanel';
import { MaterialsList } from './components/MaterialsList';
import { PriceComparisonMatrix } from './components/PriceComparisonMatrix';
import { BudgetSummaryPanel } from './components/BudgetSummaryPanel';
import { SavedBudgetsModal } from './components/SavedBudgetsModal';
import { PrintBudgetModal } from './components/PrintBudgetModal';
import { ShareBudgetModal } from './components/ShareBudgetModal';
import { AndroidGuideModal } from './components/AndroidGuideModal';
import { FloorPlanCanvas } from './components/FloorPlanCanvas';
import { AuthModal } from './components/AuthModal';
import { TokenManagementModal } from './components/TokenManagementModal';
import { SubscriptionPaywallModal } from './components/SubscriptionPaywallModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  Smartphone, 
  Sparkles, 
  Building2, 
  Layers, 
  CheckCircle, 
  PenTool, 
  Calculator, 
  Compass, 
  Gift, 
  Crown, 
  AlertTriangle, 
  ArrowRight,
  ArrowLeft,
  Home,
  RotateCcw,
  Share2,
  FileText
} from 'lucide-react';

function AppMain() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isAndroidView, setIsAndroidView] = useState<boolean>(false);
  const [activeAppTab, setActiveAppTab] = useState<'budget' | 'floorplan'>('budget');
  const [selectedCategory, setSelectedCategory] = useState<ProjectType>('electricidad');
  const [quality, setQuality] = useState<QualityTier>('medio');
  const [hasGeneratedBudget, setHasGeneratedBudget] = useState<boolean>(false);
  const [projectAddress, setProjectAddress] = useState<string>('Av. Pedro Aguirre Cerda 6800, Cerrillos, Santiago');
  const [projectLocation, setProjectLocation] = useState<{ lat: number; lng: number } | null>({
    lat: -33.4845,
    lng: -70.7156
  });

  const { 
    user, 
    isAuthenticated, 
    isPro, 
    tokens, 
    openAuthModal, 
    openTokenModal, 
    openPaywallModal 
  } = useAuth();

  // Auto-detect referral code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode && !isAuthenticated) {
      openAuthModal('register');
    }
  }, [isAuthenticated]);

  // Measurements state shared between Form and 2D Canvas
  const [measurements, setMeasurements] = useState<Record<string, any>>({});

  // Materials & Suppliers State
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(DEFAULT_SUPPLIERS);
  const [savedBudgets, setSavedBudgets] = useState<BudgetRecord[]>(() => {
    try {
      const stored = localStorage.getItem('presupuestador_saved_budgets');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Modal Visibility States
  const [showSavedModal, setShowSavedModal] = useState<boolean>(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  // Sync dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load default materials when category changes
  useEffect(() => {
    if (selectedCategory) {
      const defaults = BASE_MATERIALS_CHILE[selectedCategory] || [];
      const formatted: MaterialItem[] = defaults.map((mat, idx) => ({
        id: `mat_${selectedCategory}_${idx}`,
        ...mat,
        quantity: idx === 0 ? 3 : idx === 1 ? 2 : 1,
        selected: true
      }));
      setMaterials(formatted);
    }
  }, [selectedCategory]);

  // Save budgets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('presupuestador_saved_budgets', JSON.stringify(savedBudgets));
    } catch (e) {
      console.error('Error saving budgets:', e);
    }
  }, [savedBudgets]);

  // Handle Category Select
  const handleSelectCategory = (cat: ProjectType) => {
    setSelectedCategory(cat);
  };

  // Toggle material selection
  const handleToggleMaterial = (id: string) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  // Update material quantity
  const handleUpdateQuantity = (id: string, qty: number) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, quantity: Math.max(0.1, qty) } : m));
  };

  // Remove material
  const handleRemoveMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  // Add custom material
  const handleAddCustomMaterial = (item: Omit<MaterialItem, 'id' | 'selected'>) => {
    const newItem: MaterialItem = {
      id: `custom_${Date.now()}`,
      ...item,
      selected: true
    };
    setMaterials(prev => [newItem, ...prev]);
  };

  // Go back to main page / initial view
  const handleGoBackToHome = () => {
    setHasGeneratedBudget(false);
    setActiveAppTab('budget');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Apply AI Calculation Result
  const handleApplyCalculatedMaterials = (result: AICalculationResult) => {
    if (result.materials && result.materials.length > 0) {
      setMaterials(result.materials);
      setHasGeneratedBudget(true);
      setTimeout(() => {
        const target = document.getElementById('budget-results-section');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Apply Basic Materials Fallback
  const handleApplyBasicMaterials = () => {
    const defaults = BASE_MATERIALS_CHILE[selectedCategory] || [];
    const formatted: MaterialItem[] = defaults.map((mat, idx) => ({
      id: `basic_${selectedCategory}_${idx}_${Date.now()}`,
      ...mat,
      quantity: 1,
      selected: true
    }));
    setMaterials(formatted);
    setHasGeneratedBudget(true);
    setTimeout(() => {
      const target = document.getElementById('budget-results-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Add new Supplier
  const handleAddSupplier = (newSupplier: Supplier) => {
    setSuppliers(prev => [newSupplier, ...prev]);
  };

  // Find Suppliers Action
  const handleFindSuppliers = () => {
    // Scroll map panel into view smoothly
    const mapEl = document.getElementById('map-panel-section');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Save current budget
  const handleSaveBudget = () => {
    const selected = materials.filter(m => m.selected);
    if (selected.length === 0) return;

    const multiplier = QUALITY_MULTIPLIERS[quality] || 1.0;
    const categoryConfig = PROJECT_CATEGORIES.find(c => c.id === selectedCategory);
    const laborPercent = categoryConfig ? categoryConfig.laborPercent : 0.45;

    const subtotal = selected.reduce((sum, item) => {
      const adjustedPrice = Math.round(item.basePrice * multiplier);
      return sum + (adjustedPrice * item.quantity);
    }, 0);

    const transport = projectAddress ? Math.min(25000, Math.max(5000, Math.round(subtotal * 0.05))) : 0;
    const labor = Math.round(subtotal * laborPercent);

    const newRecord: BudgetRecord = {
      id: `budget_${Date.now()}`,
      title: `Presupuesto ${selectedCategory.toUpperCase()} - ${new Date().toLocaleDateString('es-CL')}`,
      createdAt: new Date().toISOString(),
      projectType: selectedCategory,
      projectAddress,
      measurements,
      quality,
      materials: selected,
      subtotalMaterials: subtotal,
      transportCost: transport,
      laborCost: labor,
      totalCost: subtotal + transport + labor
    };

    setSavedBudgets(prev => [newRecord, ...prev]);
    setShowSavedModal(true);
  };

  // Load saved budget
  const handleLoadBudget = (record: BudgetRecord) => {
    setSelectedCategory(record.projectType);
    setQuality(record.quality);
    if (record.projectAddress) setProjectAddress(record.projectAddress);
    setMaterials(record.materials);
    setShowSavedModal(false);
  };

  // Delete saved budget
  const handleDeleteBudget = (id: string) => {
    setSavedBudgets(prev => prev.filter(b => b.id !== id));
  };

  // Dynamic project total computation for mobile sticky bar and sync
  const selectedMaterials = materials.filter(m => m.selected);
  const mult = QUALITY_MULTIPLIERS[quality] || 1.0;
  const subtotalMaterials = selectedMaterials.reduce((sum, item) => sum + Math.round(item.basePrice * mult * item.quantity), 0);
  const categoryConfig = PROJECT_CATEGORIES.find(c => c.id === selectedCategory);
  const laborPercent = categoryConfig ? categoryConfig.laborPercent : 0.45;
  const laborCost = Math.round(subtotalMaterials * laborPercent);
  const transportCost = projectAddress ? Math.min(25000, Math.max(5000, Math.round(subtotalMaterials * 0.05))) : 0;
  const totalProjectCost = subtotalMaterials + laborCost + transportCost;

  // Main UI render
  const mainContent = (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Category Selection */}
      <ProjectCategorySelector
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Tab Switcher: Presupuesto vs Plano 2D Canvas */}
      <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between bg-slate-900 p-1 sm:p-1.5 rounded-xl border border-slate-800 shadow-sm gap-1.5">
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 col-span-2 sm:col-span-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveAppTab('budget')}
            className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeAppTab === 'budget'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 shrink-0" />
            <span className="truncate">Cálculo & Insumos</span>
          </button>

          <button
            onClick={() => setActiveAppTab('floorplan')}
            className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeAppTab === 'floorplan'
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 shrink-0" />
            <span className="truncate">Plano 2D CAD</span>
          </button>
        </div>

        {/* Quick info badge */}
        <div className="text-xs text-slate-400 px-2 hidden md:flex items-center space-x-2">
          <span>Insumos activos:</span>
          <span className="font-mono tabular-nums font-bold text-orange-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
            {selectedMaterials.length} / {materials.length}
          </span>
        </div>
      </div>

      {/* Conditional Content: FloorPlanCanvas Mode vs Default Budget Mode */}
      {activeAppTab === 'floorplan' ? (
        <div className="space-y-6">
          <FloorPlanCanvas
            projectType={selectedCategory}
            quality={quality}
            currentMaterials={materials}
            measurements={measurements}
            onUpdateMeasurements={setMeasurements}
            onExportMaterials={(updated) => setMaterials(updated)}
            onNavigateToBudget={() => setActiveAppTab('budget')}
          />

          {/* Side by side mini summary and return button */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MaterialsList
                materials={materials}
                quality={quality}
                onQualityChange={setQuality}
                onToggleMaterial={handleToggleMaterial}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveMaterial={handleRemoveMaterial}
                onAddCustomMaterial={handleAddCustomMaterial}
                onGoBack={handleGoBackToHome}
              />
            </div>
            <div>
              <BudgetSummaryPanel
                materials={materials}
                quality={quality}
                projectType={selectedCategory}
                projectLocation={projectLocation}
                projectAddress={projectAddress}
                onGeneratePdf={() => setShowPrintModal(true)}
                onSaveBudget={handleSaveBudget}
                onGoBack={handleGoBackToHome}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Grid Layout for AI & Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIAssistantPanel
              projectType={selectedCategory}
              quality={quality}
              projectAddress={projectAddress}
              measurements={measurements}
              onUpdateMeasurements={setMeasurements}
              onApplyCalculatedMaterials={handleApplyCalculatedMaterials}
              onApplyBasicMaterials={handleApplyBasicMaterials}
              currentMaterials={materials}
              onExportMaterials={(updated) => {
                setMaterials(updated);
                setHasGeneratedBudget(true);
              }}
              onOpenCanvasTab={() => setActiveAppTab('floorplan')}
              onGoBackToHome={handleGoBackToHome}
              onResetToInitial={handleGoBackToHome}
            />

            <div id="map-panel-section">
              <LocationAndMapPanel
                projectAddress={projectAddress}
                onAddressChange={setProjectAddress}
                projectLocation={projectLocation}
                onLocationChange={setProjectLocation}
                suppliers={suppliers}
                onAddSupplier={handleAddSupplier}
                onFindSuppliers={handleFindSuppliers}
              />
            </div>
          </div>

          {/* Prominent Back Button / Status Banner when Budget is Generated */}
          <div id="budget-results-section" className="scroll-mt-20">
            {hasGeneratedBudget && (
              <div className="bg-slate-900 border-2 border-orange-500/80 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-orange-950/20">
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleGoBackToHome}
                    className="flex items-center space-x-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg shadow-sm shadow-orange-950 transition-all cursor-pointer text-xs group shrink-0 active:scale-95"
                    title="Regresar a la página principal para elegir otra partida o reiniciar"
                  >
                    <ArrowLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform" />
                    <span>← Volver a la Página Principal</span>
                  </button>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Presupuesto Generado: {PROJECT_CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory.toUpperCase()}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {materials.filter(m => m.selected).length} insumos activos con cálculo de mano de obra y transporte para Chile
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95"
                    title="Compartir presupuesto por WhatsApp, Telegram, Messenger o correo"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Compartir</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGoBackToHome}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                    <span>Cambiar Partida / Inicio</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Materials List & Summary Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Materials List (2 cols) */}
            <div className="lg:col-span-2">
              <MaterialsList
                materials={materials}
                quality={quality}
                onQualityChange={setQuality}
                onToggleMaterial={handleToggleMaterial}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveMaterial={handleRemoveMaterial}
                onAddCustomMaterial={handleAddCustomMaterial}
                onGoBack={hasGeneratedBudget ? handleGoBackToHome : undefined}
              />
            </div>

            {/* Financial Summary & Actions (1 col) */}
            <div className="space-y-6">
              <BudgetSummaryPanel
                materials={materials}
                quality={quality}
                projectType={selectedCategory}
                projectLocation={projectLocation}
                projectAddress={projectAddress}
                onGeneratePdf={() => setShowPrintModal(true)}
                onSaveBudget={handleSaveBudget}
                onGoBack={handleGoBackToHome}
              />

              <PriceComparisonMatrix
                materials={materials}
                suppliers={suppliers}
                projectLocation={projectLocation}
                quality={quality}
              />
            </div>

          </div>
        </>
      )}

    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans bg-blueprint-grid selection:bg-orange-500 selection:text-white transition-colors duration-200">
      
      {/* Navbar Header */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isAndroidView={isAndroidView}
        onToggleAndroidView={() => setIsAndroidView(!isAndroidView)}
        onOpenSavedBudgets={() => setShowSavedModal(true)}
        onOpenAndroidGuide={() => setShowAndroidGuide(true)}
        savedCount={savedBudgets.length}
        onGoHome={handleGoBackToHome}
      />

      {/* Global Notification & Token Status Banner */}
      {!isAuthenticated ? (
        <div className="bg-slate-900 text-slate-200 text-xs py-2 px-3 sm:px-4 shadow-sm border-b border-orange-500/30">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 truncate">
              <Gift className="w-4 h-4 text-orange-400 shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">
                Inicia sesión para recibir <strong className="text-orange-300">50 Tokens gratis</strong> de cubicación.
              </span>
            </div>
            <button
              onClick={() => openAuthModal('register')}
              className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-md font-bold transition-all shrink-0 shadow-sm flex items-center space-x-1 cursor-pointer active:scale-95 text-[11px] sm:text-xs whitespace-nowrap"
            >
              <span>+50 Tokens</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : isPro ? (
        <div className="bg-slate-900 text-slate-200 text-xs py-1 px-3 sm:px-4 shadow-xs border-b border-[#ccff00]/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2 truncate">
              <Crown className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="text-[11px] sm:text-xs truncate">Membresía PRO Activa · Acceso ilimitado a cubicación y planos.</span>
            </div>
            <span className="badge-reflective text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded-xs shrink-0">
              PRO
            </span>
          </div>
        </div>
      ) : tokens <= 5 ? (
        <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 sm:px-4 shadow-sm border-b border-reflective-amber">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 truncate">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs truncate">
                {tokens === 0 
                  ? 'Tokens agotados. Refiere colegas o pasa a PRO.'
                  : `Te quedan ${tokens} tokens.`}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                onClick={() => openTokenModal('referrals')}
                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold cursor-pointer text-[10px] sm:text-xs border border-slate-700"
              >
                +25
              </button>
              <button
                onClick={() => openPaywallModal('Suscripción Pro')}
                className="px-2.5 py-0.5 bg-orange-600 hover:bg-orange-500 text-white rounded font-bold cursor-pointer text-[10px] sm:text-xs"
              >
                Pagar PRO
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-6">
        
        {/* Smartphone Android Frame Wrapper when activated */}
        {isAndroidView ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-2 sm:py-4">
            <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 px-3 py-1.5 rounded-full text-xs font-bold border border-purple-300 dark:border-purple-700">
              <Smartphone className="w-3.5 h-3.5 text-purple-600" />
              <span>Simulador Android (390px × 844px)</span>
            </div>

            {/* Device frame container (fluid max-w-full so it never overflows small screens) */}
            <div className="w-full max-w-[410px] h-[820px] max-h-[85vh] bg-gray-900 dark:bg-gray-950 rounded-[36px] sm:rounded-[48px] p-2.5 sm:p-3 shadow-2xl border-4 border-gray-800 relative flex flex-col">
              
              {/* Speaker / Camera Notch */}
              <div className="w-28 sm:w-32 h-4 sm:h-5 bg-black rounded-b-2xl mx-auto z-30 mb-1 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-800"></div>
              </div>

              {/* WebView Display Canvas */}
              <div className="w-full h-full bg-gray-50 dark:bg-gray-900 rounded-[28px] sm:rounded-[36px] overflow-y-auto p-3 sm:p-4 space-y-4 shadow-inner scrollbar-thin">
                {mainContent}
              </div>

              {/* Bottom Home Indicator Line */}
              <div className="w-28 h-1 bg-gray-600 rounded-full mx-auto my-1 shrink-0"></div>
            </div>
          </div>
        ) : (
          mainContent
        )}

      </main>

      {/* Mobile Sticky Bottom Total & Action Bar (md:hidden) */}
      {selectedMaterials.length > 0 && !isAndroidView && (
        <aside className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-slate-950/95 backdrop-blur-md border-t border-slate-800 px-4 py-2.5 flex items-center justify-between shadow-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Obra:</span>
            <span className="text-sm font-black font-mono tabular-nums text-white">
              ${totalProjectCost.toLocaleString('es-CL')} <span className="text-[10px] text-orange-400 font-sans">CLP</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-slate-900 border border-slate-700 text-slate-200 active:bg-slate-800 cursor-pointer"
              title="Compartir presupuesto"
              aria-label="Compartir presupuesto"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="min-h-[44px] flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-orange-600 active:bg-orange-500 text-white font-bold text-xs shadow-sm shadow-orange-950 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ver PDF</span>
            </button>
          </div>
        </aside>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 mt-12 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-300">
            Cubicador Pro v2.0 • Cubicación y Presupuestos de Construcción Chile 2025
          </p>
          <p className="text-slate-500">
            Desarrollado con Google Gemini AI, Leaflet Maps y Tailwind CSS • Optimizado para Normas SEC y MINVU
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showSavedModal && (
        <SavedBudgetsModal
          savedBudgets={savedBudgets}
          onLoadBudget={handleLoadBudget}
          onDeleteBudget={handleDeleteBudget}
          onClose={() => setShowSavedModal(false)}
        />
      )}

      {showPrintModal && (
        <PrintBudgetModal
          materials={materials}
          quality={quality}
          projectType={selectedCategory}
          projectAddress={projectAddress}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showAndroidGuide && (
        <AndroidGuideModal
          onClose={() => setShowAndroidGuide(false)}
        />
      )}

      {showShareModal && (
        <ShareBudgetModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          materials={materials}
          quality={quality}
          projectType={selectedCategory}
          projectAddress={projectAddress}
        />
      )}

      {/* Auth, Tokens, Referrals and Subscription Paywall Modals */}
      <AuthModal />
      <TokenManagementModal />
      <SubscriptionPaywallModal />

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppMain />
    </AuthProvider>
  );
}

export default App;
