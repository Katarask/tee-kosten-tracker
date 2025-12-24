import type { Ingredient, Packaging, Settings, CalculatedCosts, PaymentProviderConfig } from '../types';

/**
 * Berechnet die Rohstoffkosten pro Einheit basierend auf Zutaten und Gewicht
 */
export function calculateRawMaterialCost(
  ingredients: Ingredient[],
  weightGrams: number
): number {
  const weightKg = weightGrams / 1000;

  return ingredients.reduce((total, ingredient) => {
    const ingredientWeight = weightKg * (ingredient.percentageOfBlend / 100);
    return total + (ingredientWeight * ingredient.pricePerKg);
  }, 0);
}

/**
 * Berechnet die Verpackungskosten
 */
export function calculatePackagingCost(packaging: Packaging): number {
  return packaging.bagCost + packaging.labelCost + (packaging.boxCost || 0);
}

/**
 * Berechnet die Fixkosten-Umlage pro Produkt
 */
export function calculateFixedCostAllocation(
  totalMonthlyFixedCosts: number,
  expectedMonthlySales: number
): number {
  if (expectedMonthlySales <= 0) return 0;
  return totalMonthlyFixedCosts / expectedMonthlySales;
}

/**
 * Berechnet die Transaktionsgebühren
 */
export function calculateTransactionFee(
  sellingPrice: number,
  provider: PaymentProviderConfig
): number {
  return (sellingPrice * provider.feePercent / 100) + provider.feeFixed;
}

/**
 * Berechnet den MwSt-Anteil
 */
export function calculateVat(nettoPrice: number, vatRate: number): number {
  return nettoPrice * vatRate;
}

/**
 * Berechnet den Break-Even-Preis (Netto)
 */
export function calculateBreakEvenPrice(
  productionCost: number,
  shippingCost: number,
  transactionFeePercent: number,
  transactionFeeFixed: number
): number {
  // Break-Even = (Produktionskosten + Versand + Fixgebühr) / (1 - Transaktionsgebühr%)
  return (productionCost + shippingCost + transactionFeeFixed) / (1 - transactionFeePercent / 100);
}

/**
 * Berechnet den Verkaufspreis mit Marge
 */
export function calculateSellingPrice(
  breakEvenPrice: number,
  targetMargin: number,
  vatRate: number
): { netto: number; brutto: number } {
  const netto = breakEvenPrice / (1 - targetMargin);
  const brutto = netto * (1 + vatRate);
  return { netto, brutto };
}

/**
 * Berechnet den Gewinn pro Einheit
 */
export function calculateProfit(
  sellingPriceBrutto: number,
  productionCost: number,
  shippingCost: number,
  transactionFee: number,
  vatAmount: number
): number {
  return sellingPriceBrutto - productionCost - shippingCost - transactionFee - vatAmount;
}

/**
 * Berechnet die tatsächliche Marge
 */
export function calculateActualMargin(
  profit: number,
  sellingPriceBrutto: number
): number {
  if (sellingPriceBrutto <= 0) return 0;
  return profit / sellingPriceBrutto;
}

/**
 * Führt die komplette Kostenberechnung durch
 */
export function calculateAllCosts(
  ingredients: Ingredient[],
  packaging: Packaging,
  weightGrams: number,
  targetMargin: number,
  settings: Settings
): CalculatedCosts {
  // 1. Rohstoffkosten
  const rawMaterialCost = calculateRawMaterialCost(ingredients, weightGrams);

  // 2. Verpackungskosten
  const packagingCost = calculatePackagingCost(packaging);

  // 3. Fixkosten-Umlage
  const fixedCostAllocation = calculateFixedCostAllocation(
    settings.totalMonthlyFixedCosts,
    settings.expectedMonthlySales
  );

  // 4. Produktionskosten
  const totalProductionCost = rawMaterialCost + packagingCost + fixedCostAllocation;

  // 5. Versandkosten
  const shippingCost = settings.defaultShippingCost;

  // 6. Finde aktuellen Payment Provider
  const currentProvider = settings.paymentProviders.find(
    p => p.id === settings.paymentProvider
  ) || settings.paymentProviders[0];

  // 7. Break-Even-Preis
  const breakEvenPrice = calculateBreakEvenPrice(
    totalProductionCost,
    shippingCost,
    currentProvider.feePercent,
    currentProvider.feeFixed
  );

  // 8. Verkaufspreis mit Marge
  const { netto, brutto: sellingPriceBrutto } = calculateSellingPrice(
    breakEvenPrice,
    targetMargin,
    settings.vatRate
  );

  // 9. Transaktionsgebühren
  const transactionFee = calculateTransactionFee(sellingPriceBrutto, currentProvider);

  // 10. MwSt-Anteil
  const vatAmount = calculateVat(netto, settings.vatRate);

  // 11. Gewinn pro Einheit
  const profitPerUnit = calculateProfit(
    sellingPriceBrutto,
    totalProductionCost,
    shippingCost,
    transactionFee,
    vatAmount
  );

  // 12. Tatsächliche Marge
  const actualMargin = calculateActualMargin(profitPerUnit, sellingPriceBrutto);

  return {
    rawMaterialCost,
    packagingCost,
    fixedCostAllocation,
    totalProductionCost,
    shippingCost,
    transactionFee,
    vatAmount,
    breakEvenPrice,
    profitPerUnit,
    actualMargin,
  };
}

/**
 * Berechnet Kosten basierend auf gegebenem Brutto-Verkaufspreis
 */
export function calculateCostsFromPrice(
  ingredients: Ingredient[],
  packaging: Packaging,
  weightGrams: number,
  sellingPriceBrutto: number,
  settings: Settings
): CalculatedCosts {
  // 1. Rohstoffkosten
  const rawMaterialCost = calculateRawMaterialCost(ingredients, weightGrams);

  // 2. Verpackungskosten
  const packagingCost = calculatePackagingCost(packaging);

  // 3. Fixkosten-Umlage
  const fixedCostAllocation = calculateFixedCostAllocation(
    settings.totalMonthlyFixedCosts,
    settings.expectedMonthlySales
  );

  // 4. Produktionskosten
  const totalProductionCost = rawMaterialCost + packagingCost + fixedCostAllocation;

  // 5. Versandkosten
  const shippingCost = settings.defaultShippingCost;

  // 6. Finde aktuellen Payment Provider
  const currentProvider = settings.paymentProviders.find(
    p => p.id === settings.paymentProvider
  ) || settings.paymentProviders[0];

  // 7. Transaktionsgebühren
  const transactionFee = calculateTransactionFee(sellingPriceBrutto, currentProvider);

  // 8. Netto-Preis aus Brutto
  const nettoPrice = sellingPriceBrutto / (1 + settings.vatRate);

  // 9. MwSt-Anteil
  const vatAmount = sellingPriceBrutto - nettoPrice;

  // 10. Break-Even-Preis
  const breakEvenPrice = calculateBreakEvenPrice(
    totalProductionCost,
    shippingCost,
    currentProvider.feePercent,
    currentProvider.feeFixed
  );

  // 11. Gewinn pro Einheit
  const profitPerUnit = calculateProfit(
    sellingPriceBrutto,
    totalProductionCost,
    shippingCost,
    transactionFee,
    vatAmount
  );

  // 12. Tatsächliche Marge
  const actualMargin = calculateActualMargin(profitPerUnit, sellingPriceBrutto);

  return {
    rawMaterialCost,
    packagingCost,
    fixedCostAllocation,
    totalProductionCost,
    shippingCost,
    transactionFee,
    vatAmount,
    breakEvenPrice,
    profitPerUnit,
    actualMargin,
  };
}

/**
 * Formatiert einen Betrag als Euro-Währung
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

/**
 * Formatiert eine Zahl als Prozent
 */
export function formatPercent(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Generiert eine eindeutige ID
 */
export function generateId(): string {
  return crypto.randomUUID();
}
