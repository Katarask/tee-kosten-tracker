import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProductEditor } from './components/ProductEditor';
import { Settings } from './components/Settings';
import { useSettings } from './hooks/useSettings';
import { useProducts } from './hooks/useProducts';
import type { Product } from './types';

type View = 'dashboard' | 'editor' | 'settings';

function App() {
  const {
    settings,
    updateSettings,
    addFixedCost,
    updateFixedCost,
    removeFixedCost,
  } = useSettings();

  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    recalculateAllProducts,
    getProductById,
    exportToCsv,
    stats,
  } = useProducts(settings);

  const [view, setView] = useState<View>('dashboard');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Produkte neu berechnen wenn sich Settings ändern
  useEffect(() => {
    if (products.length > 0) {
      recalculateAllProducts();
    }
  }, [settings.totalMonthlyFixedCosts, settings.expectedMonthlySales, settings.paymentProvider, settings.defaultShippingCost]);

  const handleEditProduct = (id: string) => {
    setEditingProductId(id);
    setView('editor');
  };

  const handleAddProduct = () => {
    setEditingProductId(null);
    setView('editor');
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Produkt wirklich löschen?')) {
      deleteProduct(id);
    }
  };

  const handleSaveProduct = (product: Product) => {
    if (editingProductId) {
      updateProduct(product.id, product);
    } else {
      addProduct(product);
    }
    setView('dashboard');
    setEditingProductId(null);
  };

  const handleCancelEdit = () => {
    setView('dashboard');
    setEditingProductId(null);
  };

  const editingProduct = editingProductId ? getProductById(editingProductId) : undefined;

  return (
    <div className="min-h-screen bg-tea-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <Dashboard
            products={products}
            settings={settings}
            stats={stats}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddProduct={handleAddProduct}
            onOpenSettings={() => setView('settings')}
            onExportCsv={exportToCsv}
          />
        )}

        {view === 'editor' && (
          <div>
            <button
              onClick={handleCancelEdit}
              className="mb-4 text-tea-600 hover:text-tea-800 font-medium"
            >
              ← Zurück zum Dashboard
            </button>
            <h2 className="text-2xl font-bold mb-6 text-tea-900">
              {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </h2>
            <ProductEditor
              product={editingProduct}
              settings={settings}
              onSave={handleSaveProduct}
              onCancel={handleCancelEdit}
            />
          </div>
        )}

        {view === 'settings' && (
          <Settings
            settings={settings}
            onUpdateSettings={updateSettings}
            onAddFixedCost={addFixedCost}
            onUpdateFixedCost={updateFixedCost}
            onRemoveFixedCost={removeFixedCost}
            onClose={() => setView('dashboard')}
          />
        )}
      </div>
    </div>
  );
}

export default App;
