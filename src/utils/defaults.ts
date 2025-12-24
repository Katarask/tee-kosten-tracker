import type { Settings, ShippingOption, PaymentProviderConfig, FixedCostItem } from '../types';
import { generateId } from './calculations';

export const defaultShippingOptions: ShippingOption[] = [
  { id: generateId(), name: 'DHL Warenpost', maxWeight: 1, price: 3.99 },
  { id: generateId(), name: 'DHL Paket S', maxWeight: 2, price: 4.99 },
  { id: generateId(), name: 'DHL Paket M', maxWeight: 5, price: 5.99 },
];

export const defaultPaymentProviders: PaymentProviderConfig[] = [
  { id: 'stripe', name: 'Stripe', feePercent: 1.5, feeFixed: 0.25 },
  { id: 'paypal', name: 'PayPal', feePercent: 2.49, feeFixed: 0.35 },
  { id: 'klarna', name: 'Klarna', feePercent: 2.99, feeFixed: 0.35 },
];

export const defaultFixedCosts: FixedCostItem[] = [
  { id: generateId(), name: 'Webflow/Hosting', monthlyCost: 23 },
  { id: generateId(), name: 'Domain', monthlyCost: 2 },
  { id: generateId(), name: 'Tools (Buchhaltung etc.)', monthlyCost: 30 },
  { id: generateId(), name: 'Lager/Miete', monthlyCost: 0 },
];

export const defaultSettings: Settings = {
  defaultShippingCost: 3.99,
  shippingOptions: defaultShippingOptions,
  paymentProvider: 'stripe',
  paymentProviders: defaultPaymentProviders,
  monthlyFixedCosts: defaultFixedCosts,
  totalMonthlyFixedCosts: defaultFixedCosts.reduce((sum, item) => sum + item.monthlyCost, 0),
  expectedMonthlySales: 100,
  vatRate: 0.07,
};
