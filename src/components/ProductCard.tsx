import type { Product } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface ProductCardProps {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

function getMarginColor(margin: number): string {
  if (margin < 0.3) return 'bg-red-50 border-red-300 text-red-900';
  if (margin < 0.5) return 'bg-gold-50 border-gold-300 text-gold-900';
  return 'bg-leaf-50 border-leaf-300 text-leaf-900';
}

function getMarginBadgeColor(margin: number): string {
  if (margin < 0.3) return 'bg-red-500';
  if (margin < 0.5) return 'bg-gold-500';
  return 'bg-leaf-500';
}

const categoryLabels: Record<string, string> = {
  schwarztee: 'Schwarztee',
  gruentee: 'Grüntee',
  kraeutertee: 'Kräutertee',
  fruechtetee: 'Früchtetee',
};

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const { calculatedCosts } = product;

  return (
    <div className={`rounded-xl border-2 p-4 shadow-sm transition-shadow hover:shadow-md ${getMarginColor(calculatedCosts.actualMargin)}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg">{product.name}</h3>
          <p className="text-sm opacity-75">
            {categoryLabels[product.category]} • {product.weightGrams}g • SKU: {product.sku}
          </p>
        </div>
        <span className={`${getMarginBadgeColor(calculatedCosts.actualMargin)} text-white text-sm font-bold px-2.5 py-1 rounded-lg shadow-sm`}>
          {formatPercent(calculatedCosts.actualMargin)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div>
          <span className="opacity-70">VK Brutto:</span>
          <span className="font-semibold ml-1">{formatCurrency(product.sellingPriceBrutto)}</span>
        </div>
        <div>
          <span className="opacity-70">Gewinn:</span>
          <span className="font-semibold ml-1">{formatCurrency(calculatedCosts.profitPerUnit)}</span>
        </div>
        <div>
          <span className="opacity-70">Produktionskosten:</span>
          <span className="font-semibold ml-1">{formatCurrency(calculatedCosts.totalProductionCost)}</span>
        </div>
        <div>
          <span className="opacity-70">Break-Even:</span>
          <span className="font-semibold ml-1">{formatCurrency(calculatedCosts.breakEvenPrice)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(product.id)}
          className="flex-1 bg-white/60 hover:bg-white/90 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-current/20"
        >
          Bearbeiten
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/60 hover:bg-red-100 hover:text-red-700 transition-colors border border-current/20"
        >
          Löschen
        </button>
      </div>
    </div>
  );
}
