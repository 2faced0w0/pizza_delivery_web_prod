import { X, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Ingredient, Pizza } from '../App';
import { toast } from 'sonner';
import { api } from '../api/client';

interface CustomizationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  addToCart: (pizza: Pizza) => void;
  preselectedIngredients?: Ingredient[];
  pizzaName?: string;
  pizzaId?: number;
}

export function CustomizationOverlay({
  isOpen,
  onClose,
  ingredients,
  addToCart,
  preselectedIngredients = [],
  pizzaName = '',
  pizzaId,
}: CustomizationOverlayProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(preselectedIngredients);
  const [customPizzaName, setCustomPizzaName] = useState(pizzaName);
  const [size, setSize] = useState<'small' | 'medium' | 'large'>('small');
  const [basePrices, setBasePrices] = useState<{ small: number; medium: number; large: number }>({ small: 0, medium: 0, large: 0 });
  const [pizzaDescription, setPizzaDescription] = useState<string>('');

  const categories = ['base', 'sauce', 'cheese', 'meat', 'vegetable', 'other'] as const;

  const toggleIngredient = (ingredient: Ingredient) => {
    const isSelected = selectedIngredients.some((ing) => ing.id === ingredient.id);

    if (isSelected) {
      setSelectedIngredients(selectedIngredients.filter((ing) => ing.id !== ingredient.id));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Fetch base prices using ORM-backed API
  useEffect(() => {
    (async () => {
      if (!pizzaId) return;
      try {
        const res = await api.get(`/pizzas/${pizzaId}`);
        const raw = res.data?.data ?? res.data;
        const desc = String(raw?.description ?? '');
        const priceRegular = raw?.price_regular != null ? Number(raw.price_regular) : 0;
        const priceMedium = raw?.price_medium != null ? Number(raw.price_medium) : 0;
        const priceLarge = raw?.price_large != null ? Number(raw.price_large) : 0;
        setBasePrices({ small: priceRegular, medium: priceMedium, large: priceLarge });
        setPizzaDescription(desc);
      } catch (e) {
        console.error('Failed to load pizza details', e);
        setBasePrices({ small: 0, medium: 0, large: 0 });
      }
    })();
  }, [pizzaId]);

  // Pricing
  const toppingsSubtotal: number = selectedIngredients.reduce((sum, ing) => sum + ing.price, 0);
  const basePrice: number = basePrices[size] || 0;
  const totalPrice: number = basePrice + toppingsSubtotal;

  const handleAddToCart = () => {

    const pizza: Pizza = {
      id: Date.now().toString(),
      name: (customPizzaName && customPizzaName.trim()) ? customPizzaName.trim() : (pizzaName || ''),
      ingredients: selectedIngredients,
      totalPrice,
      size,
      basePizzaId: pizzaId,
    };

    addToCart(pizza);
    toast.success('Pizza added to cart!');
    onClose();
    setSelectedIngredients([]);
    setCustomPizzaName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-red-600 to-orange-500 text-white p-6 flex items-center justify-between">
            <div>
              <h2 className="text-white mb-1">Customize Your Pizza</h2>
              <p className="text-white/90">Select your favorite ingredients</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="grid lg:grid-cols-3 gap-6 p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Select Size & Add Toppings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Select Size */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-orange-500 rounded-full"></div>
                  <h3 className="text-gray-900">Select Size</h3>
                </div>
                <div className="flex gap-3">
                  {(['small', 'medium', 'large'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        size === s
                          ? 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-red-200'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Toppings */}
              {categories.map((category) => {
                const categoryIngredients = ingredients.filter((ing) => ing.category === category);
                if (categoryIngredients.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-orange-500 rounded-full"></div>
                      <h3 className="text-gray-900 capitalize">{category}</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {categoryIngredients.map((ingredient) => {
                        const isSelected = selectedIngredients.some((ing) => ing.id === ingredient.id);

                        return (
                          <button
                            key={ingredient.id}
                            onClick={() => toggleIngredient(ingredient)}
                            className={`group relative p-3 rounded-xl border-2 transition-all duration-300 ${
                              isSelected
                                ? 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg scale-105'
                                : 'border-gray-200 bg-white hover:border-red-200 hover:shadow-md hover:-translate-y-1'
                            }`}
                          >
                            <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-50">
                              <img
                                src={ingredient.image}
                                alt={ingredient.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <p className="text-gray-900 text-sm mb-1">{ingredient.name}</p>
                            <p className="text-red-600 text-sm">Rs. {ingredient.price.toFixed(2)}</p>
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-red-600 to-orange-500 text-white rounded-full p-1 shadow-lg">
                                <Plus className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Your Pizza */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-gray-900">Your Pizza</h3>
                </div>

                <input
                  type="text"
                  placeholder="Name your pizza (optional)"
                  value={customPizzaName}
                  onChange={(e) => setCustomPizzaName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />

                {pizzaDescription && (
                  <p className="text-gray-600 mb-4">{pizzaDescription}</p>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm">Selected Size</span>
                  <span className="text-gray-900 capitalize">{size}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600 text-sm">Base Price</span>
                  <span className="text-gray-900">Rs. {(basePrices[size] || 0).toFixed(2)}</span>
                </div>

                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                  {selectedIngredients.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">No ingredients selected</p>
                  ) : (
                    selectedIngredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100 group hover:border-red-200 transition-all"
                      >
                        <div>
                          <p className="text-gray-900 text-sm">{ingredient.name}</p>
                          <p className="text-gray-500 text-xs">Rs. {ingredient.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => toggleIngredient(ingredient)}
                          className="text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Toppings Subtotal</span>
                    <span className="text-gray-900">Rs. {toppingsSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 text-sm">Base Price</span>
                    <span className="text-gray-900">Rs. {(basePrices[size] || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900">Total</span>
                    <span className="text-red-600">Rs. {totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
