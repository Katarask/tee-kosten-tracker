import { useState } from 'react';
import type { Settings as SettingsType, PaymentProvider } from '../types';
import { formatCurrency } from '../utils/calculations';

interface SettingsProps {
  settings: SettingsType;
  onUpdateSettings: (updates: Partial<SettingsType>) => void;
  onAddFixedCost: (name: string, cost: number) => void;
  onUpdateFixedCost: (id: string, updates: { name?: string; monthlyCost?: number }) => void;
  onRemoveFixedCost: (id: string) => void;
  onClose: () => void;
}

export function Settings({
  settings,
  onUpdateSettings,
  onAddFixedCost,
  onUpdateFixedCost,
  onRemoveFixedCost,
  onClose,
}: SettingsProps) {
  const [newCostName, setNewCostName] = useState('');
  const [newCostAmount, setNewCostAmount] = useState(0);

  const handleAddFixedCost = () => {
    if (newCostName && newCostAmount > 0) {
      onAddFixedCost(newCostName, newCostAmount);
      setNewCostName('');
      setNewCostAmount(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl sm:text-2xl font-bold text-tea-900">Einstellungen</h2>
        <button
          onClick={onClose}
          className="px-3 sm:px-4 py-2 text-sm border border-tea-300 rounded-lg hover:bg-tea-100 transition-colors"
        >
          Schließen
        </button>
      </div>

      {/* Versand */}
      <div className="bg-white rounded-xl border border-tea-200 p-4 sm:p-5 shadow-sm">
        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-tea-800">Versand</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1 text-tea-700">
              Standard-Versandkosten
            </label>
            <select
              value={settings.defaultShippingCost}
              onChange={e => onUpdateSettings({ defaultShippingCost: Number(e.target.value) })}
              className="w-full border border-tea-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none bg-white"
            >
              {settings.shippingOptions.map(option => (
                <option key={option.id} value={option.price}>
                  {option.name} - {formatCurrency(option.price)} (bis {option.maxWeight}kg)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Zahlungsanbieter */}
      <div className="bg-white rounded-xl border border-tea-200 p-4 sm:p-5 shadow-sm">
        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-tea-800">Zahlungsanbieter</h3>
        <div className="space-y-2">
          {settings.paymentProviders.map(provider => (
            <label
              key={provider.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                settings.paymentProvider === provider.id
                  ? 'border-tea-500 bg-tea-50'
                  : 'border-tea-200 hover:bg-tea-50'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="radio"
                  name="paymentProvider"
                  value={provider.id}
                  checked={settings.paymentProvider === provider.id}
                  onChange={e => onUpdateSettings({ paymentProvider: e.target.value as PaymentProvider })}
                  className="w-4 h-4 accent-tea-600"
                />
                <span className="font-medium text-tea-800 text-sm sm:text-base">{provider.name}</span>
              </div>
              <span className="text-xs sm:text-sm text-tea-600">
                {provider.feePercent}% + {formatCurrency(provider.feeFixed)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Fixkosten */}
      <div className="bg-white rounded-xl border border-tea-200 p-4 sm:p-5 shadow-sm">
        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-tea-800">Monatliche Fixkosten</h3>
        <div className="space-y-3">
          {settings.monthlyFixedCosts.map(cost => (
            <div key={cost.id} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={cost.name}
                onChange={e => onUpdateFixedCost(cost.id, { name: e.target.value })}
                className="flex-1 border border-tea-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={cost.monthlyCost}
                  onChange={e => onUpdateFixedCost(cost.id, { monthlyCost: Number(e.target.value) })}
                  className="w-20 sm:w-24 border border-tea-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
                  min="0"
                  step="0.01"
                />
                <span className="text-tea-500 text-sm">€</span>
                <button
                  onClick={() => onRemoveFixedCost(cost.id)}
                  className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-tea-200">
            <input
              type="text"
              value={newCostName}
              onChange={e => setNewCostName(e.target.value)}
              placeholder="Neue Position"
              className="flex-1 border border-tea-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={newCostAmount}
                onChange={e => setNewCostAmount(Number(e.target.value))}
                placeholder="0"
                className="w-20 sm:w-24 border border-tea-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
                min="0"
                step="0.01"
              />
              <span className="text-tea-500 text-sm">€</span>
              <button
                onClick={handleAddFixedCost}
                className="px-3 py-2 bg-tea-600 text-white rounded-lg hover:bg-tea-700 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-tea-200 flex justify-between font-bold text-tea-800 text-sm sm:text-base">
            <span>Gesamt pro Monat:</span>
            <span>{formatCurrency(settings.totalMonthlyFixedCosts)}</span>
          </div>
        </div>
      </div>

      {/* Erwartete Verkäufe */}
      <div className="bg-white rounded-xl border border-tea-200 p-4 sm:p-5 shadow-sm">
        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-tea-800">Erwartete monatliche Verkäufe</h3>
        <div>
          <input
            type="number"
            value={settings.expectedMonthlySales}
            onChange={e => onUpdateSettings({ expectedMonthlySales: Number(e.target.value) })}
            className="w-full border border-tea-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
            min="1"
          />
          <p className="text-xs sm:text-sm text-tea-600 mt-2">
            Fixkosten-Umlage pro Produkt: <span className="font-semibold">{formatCurrency(settings.totalMonthlyFixedCosts / settings.expectedMonthlySales)}</span>
          </p>
        </div>
      </div>

      {/* MwSt */}
      <div className="bg-white rounded-xl border border-tea-200 p-4 sm:p-5 shadow-sm">
        <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-tea-800">Mehrwertsteuer</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={settings.vatRate * 100}
            onChange={e => onUpdateSettings({ vatRate: Number(e.target.value) / 100 })}
            className="w-20 sm:w-24 border border-tea-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
            min="0"
            max="100"
            step="0.1"
          />
          <span className="text-tea-600 text-xs sm:text-sm">% (Lebensmittel: 7%)</span>
        </div>
      </div>
    </div>
  );
}
