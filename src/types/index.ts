export type TeaCategory = 'schwarztee' | 'gruentee' | 'kraeutertee' | 'fruechtetee';

export type PaymentProvider = 'stripe' | 'paypal' | 'klarna';

export interface Ingredient {
  id: string;
  name: string;
  percentageOfBlend: number; // 0-100
  pricePerKg: number;
}

export interface Packaging {
  bagCost: number;
  labelCost: number;
  boxCost: number;
}

export interface CalculatedCosts {
  rawMaterialCost: number;
  packagingCost: number;
  fixedCostAllocation: number;
  totalProductionCost: number;
  shippingCost: number;
  transactionFee: number;
  vatAmount: number;
  breakEvenPrice: number;
  profitPerUnit: number;
  actualMargin: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: TeaCategory;
  weightGrams: number;
  ingredients: Ingredient[];
  packaging: Packaging;
  targetMargin: number; // 0.0 - 1.0
  sellingPriceBrutto: number;
  calculatedCosts: CalculatedCosts;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  // Versand
  defaultShippingCost: number;
  shippingOptions: ShippingOption[];

  // Zahlungsanbieter
  paymentProvider: PaymentProvider;
  paymentProviders: PaymentProviderConfig[];

  // Fixkosten
  monthlyFixedCosts: FixedCostItem[];
  totalMonthlyFixedCosts: number;
  expectedMonthlySales: number;

  // Steuern
  vatRate: number; // 0.07 für Lebensmittel
}

export interface ShippingOption {
  id: string;
  name: string;
  maxWeight: number; // in kg
  price: number;
}

export interface PaymentProviderConfig {
  id: PaymentProvider;
  name: string;
  feePercent: number;
  feeFixed: number;
}

export interface FixedCostItem {
  id: string;
  name: string;
  monthlyCost: number;
}
