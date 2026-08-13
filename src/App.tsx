import React, { useState, useEffect } from 'react';
import { ProjectType, QualityTier, MaterialItem, Supplier, BudgetRecord, AICalculationResult } from './types';
import { BASE_MATERIALS_CHILE, DEFAULT_SUPPLIERS, PROJECT_CATEGORIES } from './data/chileData';
import { Navbar } from './components/Navbar';
import { ProjectCategorySelector } from './components/ProjectCategorySelector';
import { AIAssistantPanel } from './components/AIAssistantPanel';
import { LocationAndMapPanel } from './components/LocationAndMapPanel';
import { MaterialsList } from './components/MaterialsList';
import { PriceComparisonMatrix } from './components/PriceComparisonMatrix';
import { BudgetSummaryPanel } from './components/BudgetSummaryPanel';
import { SavedBudgetsModal } from './components/SavedBudgetsModal';
import { PrintBudgetModal } from './components/PrintBudgetModal';
import { AndroidGuideModal } from './components/AndroidGuideModal';
import { Smartphone, Sparkles, Building2, Layers, CheckCircle } from 'lucide-react';

export function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isAndroidView, setIsAndroidView] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<ProjectType>('electricidad');
  const [quality, setQuality] = useState<QualityTier>('medio');
  const [projectAddress, setProjectAddress] = useState<string>('Av. Pedro Aguirre Cerda 6800, Cerrillos, Santiago');
  const [projectLocation, setProjectLocation] = useState<{ lat: number; lng: number } | null>({
    lat: -33.4845,
    lng: -70.7156
  });

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

  // Apply AI Calculation Result
  const handleApplyCalculatedMaterials = (result: AICalculationResult) => {
    if (result.materials && result.materials.length > 0) {
      setMaterials(result.materials);
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

    const subtotal = selected.reduce((sum, item) => sum + (item.basePrice * item.quantity), 0);
    const transport = projectAddress ? Math.min(25000, Math.max(5000, Math.round(subtotal * 0.05))) : 0;
    const labor = Math.round(subtotal * 0.45);

    const newRecord: BudgetRecord = {
      id: `budget_${Date.now()}`,
      title: `Presupuesto ${selectedCategory.toUpperCase()} - ${new Date().toLocaleDateString('es-CL')}`,
      createdAt: new Date().toISOString(),
      projectType: selectedCategory,
      projectAddress,
      measurements: {},
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

  // Main UI render
  const mainContent = (
    <div className="space-y-6">
      
      {/* Category Selection */}
      <ProjectCategorySelector
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Grid Layout for AI & Location */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIAssistantPanel
          projectType={selectedCategory}
          quality={quality}
          projectAddress={projectAddress}
          onApplyCalculatedMaterials={handleApplyCalculatedMaterials}
          onApplyBasicMaterials={handleApplyBasicMaterials}
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
          />

          <PriceComparisonMatrix
            materials={materials}
            suppliers={suppliers}
            projectLocation={projectLocation}
            quality={quality}
          />
        </div>

      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      
      {/* Navbar Header */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isAndroidView={isAndroidView}
        onToggleAndroidView={() => setIsAndroidView(!isAndroidView)}
        onOpenSavedBudgets={() => setShowSavedModal(true)}
        onOpenAndroidGuide={() => setShowAndroidGuide(true)}
        savedCount={savedBudgets.length}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Smartphone Android Frame Wrapper when activated */}
        {isAndroidView ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-200 px-4 py-2 rounded-full text-xs font-bold border border-purple-300 dark:border-purple-700">
              <Smartphone className="w-4 h-4 text-purple-600" />
              <span>Simulador WebView Android Smartphone (390px x 844px)</span>
            </div>

            {/* Device frame container */}
            <div className="w-[410px] h-[820px] bg-gray-900 dark:bg-gray-950 rounded-[48px] p-3 shadow-2xl border-4 border-gray-800 relative flex flex-col">
              
              {/* Speaker / Camera Notch */}
              <div className="w-32 h-5 bg-black rounded-b-2xl mx-auto z-30 mb-1 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-gray-800"></div>
              </div>

              {/* WebView Display Canvas */}
              <div className="w-full h-full bg-gray-50 dark:bg-gray-900 rounded-[36px] overflow-y-auto p-4 space-y-4 shadow-inner scrollbar-thin">
                {mainContent}
              </div>

              {/* Bottom Home Indicator Line */}
              <div className="w-32 h-1 bg-gray-600 rounded-full mx-auto my-1.5 shrink-0"></div>
            </div>
          </div>
        ) : (
          mainContent
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80 mt-12 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            Presupuestador Inteligente Pro v2.0 • Optimizado para Chile 2025
          </p>
          <p>
            Desarrollado con Google Gemini AI, Leaflet Maps y Tailwind CSS • Compatible con Android WebView
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

    </div>
  );
}

export default App;
