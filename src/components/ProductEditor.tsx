import { useState, useMemo } from 'react';
import type { Product, Ingredient, Packaging, TeaCategory, Settings } from '../types';
import { CostBreakdown } from './CostBreakdown';
import { calculateCostsFromPrice, generateId } from '../utils/calculations';

interface ProductEditorProps {
  product?: Product;
  settings: Settings;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const defaultPackaging: Packaging = {
  bagCost: 0.18,
  labelCost: 0.12,
  boxCost: 0,
};

const defaultIngredient = (): Ingredient => ({
  id: generateId(),
  name: '',
  percentageOfBlend: 0,
  pricePerKg: 0,
});

export function ProductEditor({ product, settings, onSave, onCancel }: ProductEditorProps) {
  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [category, setCategory] = useState<TeaCategory>(product?.category || 'schwarztee');
  const [weightGrams, setWeightGrams] = useState(product?.weightGrams || 100);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    product?.ingredients.length ? product.ingredients : [defaultIngredient()]
  );
  const [packaging, setPackaging] = useState<Packaging>(product?.packaging || defaultPackaging);
  const [targetMargin, setTargetMargin] = useState(product?.targetMargin || 0.5);
  const [sellingPriceBrutto, setSellingPriceBrutto] = useState(product?.sellingPriceBrutto || 19.90);

  const totalPercentage = ingredients.reduce((sum, i) => sum + i.percentageOfBlend, 0);

  const calculatedCosts = useMemo(() => {
    return calculateCostsFromPrice(ingredients, packaging, weightGrams, sellingPriceBrutto, settings);
  }, [ingredients, packaging, weightGrams, sellingPriceBrutto, settings]);

  const addIngredient = () => {
    setIngredients([...ingredients, defaultIngredient()]);
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(ingredients.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(i => i.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: product?.id || generateId(),
      name,
      sku,
      category,
      weightGrams,
      ingredients,
      packaging,
      targetMargin,
      sellingPriceBrutto,
      calculatedCosts,
      createdAt: product?.createdAt || now,
      updatedAt: now,
    };

    onSave(newProduct);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linke Spalte - Formular */}
        <div className="space-y-6">
          {/* Grunddaten */}
          <div className="bg-white rounded-xl border border-tea-200 p-5 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-tea-800">Produktdaten</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-tea-700">Produktname</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-tea-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-tea-700">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={e => setSku(e.target.value)}
                  className="w-full border border-tea-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-tea-700">Gewicht (g)</label>
                <input
                  type="number"
                  value={weightGrams}
                  onChange={e => setWeightGrams(Number(e.target.value))}
                  className="w-full border border-tea-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none transition-colors"
                  min="1"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1 text-tea-700">Kategorie</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as TeaCategory)}
                  className="w-full border border-tea-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none transition-colors bg-white"
                >
                  <option value="schwarztee">Schwarztee</option>
                  <option value="gruentee">Grüntee</option>
                  <option value="kraeutertee">Kräutertee</option>
                  <option value="fruechtetee">Früchtetee</option>
                </select>
              </div>
            </div>
          </div>

          {/* Zutaten */}
          <div className="bg-white rounded-xl border border-tea-200 p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-tea-800">Zutaten</h3>
              <span className={`text-sm font-medium px-2 py-1 rounded-lg ${totalPercentage === 100 ? 'bg-leaf-100 text-leaf-700' : 'bg-red-100 text-red-700'}`}>
                Gesamt: {totalPercentage}%
              </span>
            </div>
            <div className="space-y-3">
              {ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    {index === 0 && <label className="block text-xs font-medium mb-1 text-tea-600">Name</label>}
                    <input
                      type="text"
                      value={ingredient.name}
                      onChange={e => updateIngredient(ingredient.id, { name: e.target.value })}
                      placeholder="z.B. Schwarztee"
                      className="w-full border border-tea-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    {index === 0 && <label className="block text-xs font-medium mb-1 text-tea-600">Anteil %</label>}
                    <input
                      type="number"
                      value={ingredient.percentageOfBlend}
                      onChange={e => updateIngredient(ingredient.id, { percentageOfBlend: Number(e.target.value) })}
                      className="w-full border border-tea-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                  <div className="col-span-3">
                    {index === 0 && <label className="block text-xs font-medium mb-1 text-tea-600">€/kg</label>}
                    <input
                      type="number"
                      value={ingredient.pricePerKg}
                      onChange={e => updateIngredient(ingredient.id, { pricePerKg: Number(e.target.value) })}
                      className="w-full border border-tea-200 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient.id)}
                      className="w-full py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={ingredients.length === 1}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addIngredient}
              className="mt-3 text-sm text-tea-600 hover:text-tea-800 font-medium"
            >
              + Zutat hinzufügen
            </button>
          </div>

          {/* Verpackung */}
          <div className="bg-white rounded-xl border border-tea-200 p-5 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-tea-800">Verpackung</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-tea-700">Beutel (€)</label>
                <input
                  type="number"
                  value={packaging.bagCost}
                  onChange={e => setPackaging({ ...packaging, bagCost: Number(e.target.value) })}
                  className="w-full border border-tea-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-tea-700">Etikett (€)</label>
                <input
                  type="number"
                  value={packaging.labelCost}
                  onChange={e => setPackaging({ ...packaging, labelCost: Number(e.target.value) })}
                  className="w-full border border-tea-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-tea-700">Box (€)</label>
                <input
                  type="number"
                  value={packaging.boxCost}
                  onChange={e => setPackaging({ ...packaging, boxCost: Number(e.target.value) })}
                  className="w-full border border-tea-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Preis & Marge */}
          <div className="bg-white rounded-xl border border-tea-200 p-5 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-tea-800">Preis & Marge</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-tea-700">
                  Verkaufspreis Brutto (€)
                </label>
                <input
                  type="number"
                  value={sellingPriceBrutto}
                  onChange={e => setSellingPriceBrutto(Number(e.target.value))}
                  className="w-full border-2 border-tea-300 rounded-lg px-3 py-2 text-lg font-bold focus:ring-2 focus:ring-tea-400 focus:border-tea-400 outline-none"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-tea-700">
                  Ziel-Marge: <span className="text-tea-600 font-bold">{Math.round(targetMargin * 100)}%</span>
                </label>
                <input
                  type="range"
                  value={targetMargin * 100}
                  onChange={e => setTargetMargin(Number(e.target.value) / 100)}
                  className="w-full accent-tea-600"
                  min="10"
                  max="80"
                />
                <div className="flex justify-between text-xs text-tea-500">
                  <span>10%</span>
                  <span>80%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rechte Spalte - Live-Kalkulation */}
        <div className="lg:sticky lg:top-4 h-fit">
          <CostBreakdown costs={calculatedCosts} sellingPriceBrutto={sellingPriceBrutto} />

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
            >
              {product ? 'Speichern' : 'Produkt anlegen'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-tea-300 rounded-xl hover:bg-tea-100 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
