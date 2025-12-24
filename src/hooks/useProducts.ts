import { useCallback } from 'react';
import type { Product, Ingredient, Packaging, TeaCategory, Settings } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { calculateCostsFromPrice, generateId } from '../utils/calculations';

const PRODUCTS_KEY = 'tee-tracker-products';

export function useProducts(settings: Settings) {
  const [products, setProducts] = useLocalStorage<Product[]>(PRODUCTS_KEY, []);

  const createProduct = useCallback((
    name: string,
    sku: string,
    category: TeaCategory,
    weightGrams: number,
    ingredients: Ingredient[],
    packaging: Packaging,
    targetMargin: number,
    sellingPriceBrutto: number
  ): Product => {
    const calculatedCosts = calculateCostsFromPrice(
      ingredients,
      packaging,
      weightGrams,
      sellingPriceBrutto,
      settings
    );

    const now = new Date().toISOString();

    return {
      id: generateId(),
      name,
      sku,
      category,
      weightGrams,
      ingredients,
      packaging,
      targetMargin,
      sellingPriceBrutto,
      calculatedCosts,
      createdAt: now,
      updatedAt: now,
    };
  }, [settings]);

  const addProduct = useCallback((product: Product) => {
    setProducts(prev => [...prev, product]);
  }, [setProducts]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => {
      if (product.id !== id) return product;

      const updatedProduct = {
        ...product,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Neu berechnen wenn relevante Felder geändert wurden
      if (
        updates.ingredients ||
        updates.packaging ||
        updates.weightGrams ||
        updates.sellingPriceBrutto
      ) {
        updatedProduct.calculatedCosts = calculateCostsFromPrice(
          updatedProduct.ingredients,
          updatedProduct.packaging,
          updatedProduct.weightGrams,
          updatedProduct.sellingPriceBrutto,
          settings
        );
      }

      return updatedProduct;
    }));
  }, [setProducts, settings]);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  }, [setProducts]);

  const recalculateAllProducts = useCallback(() => {
    setProducts(prev => prev.map(product => ({
      ...product,
      calculatedCosts: calculateCostsFromPrice(
        product.ingredients,
        product.packaging,
        product.weightGrams,
        product.sellingPriceBrutto,
        settings
      ),
      updatedAt: new Date().toISOString(),
    })));
  }, [setProducts, settings]);

  const getProductById = useCallback((id: string): Product | undefined => {
    return products.find(p => p.id === id);
  }, [products]);

  const exportToCsv = useCallback(() => {
    const headers = [
      'Name',
      'SKU',
      'Kategorie',
      'Gewicht (g)',
      'Rohstoffkosten',
      'Verpackungskosten',
      'Fixkosten-Umlage',
      'Produktionskosten',
      'Versandkosten',
      'Transaktionsgebühr',
      'MwSt',
      'Break-Even',
      'VK Brutto',
      'Gewinn',
      'Marge',
    ].join(';');

    const rows = products.map(p => [
      p.name,
      p.sku,
      p.category,
      p.weightGrams,
      p.calculatedCosts.rawMaterialCost.toFixed(2),
      p.calculatedCosts.packagingCost.toFixed(2),
      p.calculatedCosts.fixedCostAllocation.toFixed(2),
      p.calculatedCosts.totalProductionCost.toFixed(2),
      p.calculatedCosts.shippingCost.toFixed(2),
      p.calculatedCosts.transactionFee.toFixed(2),
      p.calculatedCosts.vatAmount.toFixed(2),
      p.calculatedCosts.breakEvenPrice.toFixed(2),
      p.sellingPriceBrutto.toFixed(2),
      p.calculatedCosts.profitPerUnit.toFixed(2),
      (p.calculatedCosts.actualMargin * 100).toFixed(1) + '%',
    ].join(';'));

    const csv = [headers, ...rows].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tee-kalkulation-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [products]);

  // Statistiken
  const stats = {
    totalProducts: products.length,
    averageMargin: products.length > 0
      ? products.reduce((sum, p) => sum + p.calculatedCosts.actualMargin, 0) / products.length
      : 0,
    totalMonthlyRevenue: products.reduce((sum, p) => sum + p.sellingPriceBrutto, 0) * (settings.expectedMonthlySales / Math.max(products.length, 1)),
    totalMonthlyProfit: products.reduce((sum, p) => sum + p.calculatedCosts.profitPerUnit, 0) * (settings.expectedMonthlySales / Math.max(products.length, 1)),
    problemProducts: products.filter(p => p.calculatedCosts.actualMargin < 0.3),
    bestProducts: products.filter(p => p.calculatedCosts.actualMargin >= 0.5),
  };

  return {
    products,
    createProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    recalculateAllProducts,
    getProductById,
    exportToCsv,
    stats,
  };
}
