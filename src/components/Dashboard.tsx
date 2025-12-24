import type { Product, Settings } from '../types';
import { ProductCard } from './ProductCard';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface DashboardProps {
  products: Product[];
  settings: Settings;
  stats: {
    totalProducts: number;
    averageMargin: number;
    problemProducts: Product[];
    bestProducts: Product[];
  };
  onEditProduct: (id: string) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: () => void;
  onOpenSettings: () => void;
  onExportCsv: () => void;
}

export function Dashboard({
  products,
  settings,
  stats,
  onEditProduct,
  onDeleteProduct,
  onAddProduct,
  onOpenSettings,
  onExportCsv,
}: DashboardProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-tea-900">Tee-Kosten-Tracker</h1>
          <p className="text-tea-600">Kalkulation & Tracking für deine Tee-Produktion</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onExportCsv}
            disabled={products.length === 0}
            className="px-4 py-2 border border-tea-300 rounded-lg hover:bg-tea-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            CSV Export
          </button>
          <button
            onClick={onOpenSettings}
            className="px-4 py-2 border border-tea-300 rounded-lg hover:bg-tea-100 transition-colors"
          >
            Einstellungen
          </button>
          <button
            onClick={onAddProduct}
            className="px-4 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 font-medium transition-colors shadow-md"
          >
            + Neues Produkt
          </button>
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-tea-200 p-4 shadow-sm">
          <div className="text-sm text-tea-600">Produkte</div>
          <div className="text-2xl font-bold text-tea-800">{stats.totalProducts}</div>
        </div>
        <div className="bg-white rounded-xl border border-tea-200 p-4 shadow-sm">
          <div className="text-sm text-tea-600">Durchschnittliche Marge</div>
          <div className={`text-2xl font-bold ${
            stats.averageMargin < 0.3 ? 'text-red-600' :
            stats.averageMargin < 0.5 ? 'text-gold-600' :
            'text-leaf-600'
          }`}>
            {formatPercent(stats.averageMargin)}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-tea-200 p-4 shadow-sm">
          <div className="text-sm text-tea-600">Problem-Produkte</div>
          <div className="text-2xl font-bold text-red-600">{stats.problemProducts.length}</div>
          <div className="text-xs text-tea-500">Marge unter 30%</div>
        </div>
        <div className="bg-white rounded-xl border border-tea-200 p-4 shadow-sm">
          <div className="text-sm text-tea-600">Top-Produkte</div>
          <div className="text-2xl font-bold text-leaf-600">{stats.bestProducts.length}</div>
          <div className="text-xs text-tea-500">Marge über 50%</div>
        </div>
      </div>

      {/* Aktuelle Einstellungen */}
      <div className="bg-gold-50 border border-gold-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-gold-700 font-medium">Versand:</span>{' '}
            <span className="text-gold-900">{formatCurrency(settings.defaultShippingCost)}</span>
          </div>
          <div>
            <span className="text-gold-700 font-medium">Zahlungsanbieter:</span>{' '}
            <span className="text-gold-900">{settings.paymentProviders.find(p => p.id === settings.paymentProvider)?.name}</span>
          </div>
          <div>
            <span className="text-gold-700 font-medium">Fixkosten/Monat:</span>{' '}
            <span className="text-gold-900">{formatCurrency(settings.totalMonthlyFixedCosts)}</span>
          </div>
          <div>
            <span className="text-gold-700 font-medium">Erwartete Verkäufe:</span>{' '}
            <span className="text-gold-900">{settings.expectedMonthlySales}/Monat</span>
          </div>
        </div>
      </div>

      {/* Produkt-Grid */}
      {products.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-tea-300 p-12 text-center">
          <div className="text-tea-400 text-lg mb-4">Noch keine Produkte angelegt</div>
          <button
            onClick={onAddProduct}
            className="px-6 py-3 bg-tea-600 text-white rounded-lg hover:bg-tea-700 font-medium transition-colors shadow-md"
          >
            Erstes Produkt anlegen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
