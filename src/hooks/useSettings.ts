import { useCallback } from 'react';
import type { Settings, FixedCostItem, ShippingOption, PaymentProvider } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { defaultSettings } from '../utils/defaults';
import { generateId } from '../utils/calculations';

const SETTINGS_KEY = 'tee-tracker-settings';

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<Settings>(SETTINGS_KEY, defaultSettings);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  const setDefaultShippingCost = useCallback((cost: number) => {
    updateSettings({ defaultShippingCost: cost });
  }, [updateSettings]);

  const setPaymentProvider = useCallback((provider: PaymentProvider) => {
    updateSettings({ paymentProvider: provider });
  }, [updateSettings]);

  const setExpectedMonthlySales = useCallback((sales: number) => {
    updateSettings({ expectedMonthlySales: sales });
  }, [updateSettings]);

  const addFixedCost = useCallback((name: string, monthlyCost: number) => {
    const newItem: FixedCostItem = {
      id: generateId(),
      name,
      monthlyCost,
    };
    const newCosts = [...settings.monthlyFixedCosts, newItem];
    const total = newCosts.reduce((sum, item) => sum + item.monthlyCost, 0);
    updateSettings({
      monthlyFixedCosts: newCosts,
      totalMonthlyFixedCosts: total,
    });
  }, [settings.monthlyFixedCosts, updateSettings]);

  const updateFixedCost = useCallback((id: string, updates: Partial<FixedCostItem>) => {
    const newCosts = settings.monthlyFixedCosts.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    const total = newCosts.reduce((sum, item) => sum + item.monthlyCost, 0);
    updateSettings({
      monthlyFixedCosts: newCosts,
      totalMonthlyFixedCosts: total,
    });
  }, [settings.monthlyFixedCosts, updateSettings]);

  const removeFixedCost = useCallback((id: string) => {
    const newCosts = settings.monthlyFixedCosts.filter(item => item.id !== id);
    const total = newCosts.reduce((sum, item) => sum + item.monthlyCost, 0);
    updateSettings({
      monthlyFixedCosts: newCosts,
      totalMonthlyFixedCosts: total,
    });
  }, [settings.monthlyFixedCosts, updateSettings]);

  const addShippingOption = useCallback((option: Omit<ShippingOption, 'id'>) => {
    const newOption: ShippingOption = {
      ...option,
      id: generateId(),
    };
    updateSettings({
      shippingOptions: [...settings.shippingOptions, newOption],
    });
  }, [settings.shippingOptions, updateSettings]);

  const updateShippingOption = useCallback((id: string, updates: Partial<ShippingOption>) => {
    updateSettings({
      shippingOptions: settings.shippingOptions.map(option =>
        option.id === id ? { ...option, ...updates } : option
      ),
    });
  }, [settings.shippingOptions, updateSettings]);

  const removeShippingOption = useCallback((id: string) => {
    updateSettings({
      shippingOptions: settings.shippingOptions.filter(option => option.id !== id),
    });
  }, [settings.shippingOptions, updateSettings]);

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings);
  }, [setSettings]);

  return {
    settings,
    updateSettings,
    setDefaultShippingCost,
    setPaymentProvider,
    setExpectedMonthlySales,
    addFixedCost,
    updateFixedCost,
    removeFixedCost,
    addShippingOption,
    updateShippingOption,
    removeShippingOption,
    resetSettings,
  };
}
