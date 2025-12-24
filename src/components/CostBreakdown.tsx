import type { CalculatedCosts } from '../types';
import { formatCurrency, formatPercent } from '../utils/calculations';

interface CostBreakdownProps {
  costs: CalculatedCosts;
  sellingPriceBrutto: number;
}

export function CostBreakdown({ costs, sellingPriceBrutto }: CostBreakdownProps) {
  const rows = [
    { label: 'Rohstoffkosten', value: costs.rawMaterialCost },
    { label: 'Verpackungskosten', value: costs.packagingCost },
    { label: 'Fixkosten-Umlage', value: costs.fixedCostAllocation },
    { label: 'Produktionskosten', value: costs.totalProductionCost, isSubtotal: true },
    { label: 'Versandkosten', value: costs.shippingCost },
    { label: 'Transaktionsgebühr', value: costs.transactionFee },
    { label: 'MwSt (7%)', value: costs.vatAmount },
    { label: 'Break-Even-Preis', value: costs.breakEvenPrice, isSubtotal: true },
    { label: 'VK Brutto', value: sellingPriceBrutto, isTotal: true },
    { label: 'Gewinn pro Einheit', value: costs.profitPerUnit, isProfit: true },
  ];

  return (
    <div className="bg-white rounded-xl border border-tea-200 p-5 shadow-sm">
      <h3 className="font-bold text-lg mb-4 text-tea-800">Kostenaufstellung</h3>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className={`flex justify-between ${
              row.isTotal ? 'font-bold text-lg border-t-2 border-tea-300 pt-2 mt-2 text-tea-900' :
              row.isSubtotal ? 'font-semibold border-t border-tea-200 pt-2 text-tea-800' :
              row.isProfit ? `font-bold ${costs.profitPerUnit >= 0 ? 'text-leaf-600' : 'text-red-600'}` :
              'text-tea-700'
            }`}
          >
            <span>{row.label}</span>
            <span>{formatCurrency(row.value)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-tea-200">
        <div className="flex justify-between items-center">
          <span className="font-bold text-tea-800">Tatsächliche Marge</span>
          <span className={`text-xl font-bold px-3 py-1.5 rounded-lg ${
            costs.actualMargin < 0.3 ? 'bg-red-100 text-red-800' :
            costs.actualMargin < 0.5 ? 'bg-gold-100 text-gold-800' :
            'bg-leaf-100 text-leaf-800'
          }`}>
            {formatPercent(costs.actualMargin)}
          </span>
        </div>
      </div>
    </div>
  );
}
