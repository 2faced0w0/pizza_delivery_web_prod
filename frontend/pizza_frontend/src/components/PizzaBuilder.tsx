import { useEffect, useState } from 'react';
import { Sparkles, ChefHat, Clock, Flame } from 'lucide-react';
import type { Ingredient, Pizza } from '../App';
import  PizzaCarousel from './PizzaCarousel';
import { CustomizationOverlay } from './CustomizationOverlay';
import { api } from '../api/client';

interface PizzaBuilderProps {
  ingredients: Ingredient[];
  addToCart: (pizza: Pizza) => void;
}

interface PredefinedPizza {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  ingredientIds: string[];
  badge?: string;
}
export default function PizzaBuilder({ ingredients, addToCart }: PizzaBuilderProps) {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [selectedPizza, setSelectedPizza] = useState<PredefinedPizza | null>(null);
  const [pizzas, setPizzas] = useState<PredefinedPizza[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/pizzas');
        const raw = res.data;
        const arr = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const mapped: PredefinedPizza[] = arr.map((p: any) => {
          const priceCandidates = [p.price_regular, p.price_medium, p.price_large]
            .map((x: any) => (x != null ? Number(x) : undefined))
            .filter((x: number | undefined): x is number => typeof x === 'number');
          const price = priceCandidates.length ? Math.min(...priceCandidates) : 0;
          return {
            id: Number(p.pizza_id ?? p.id),
            name: String(p.name ?? 'Pizza'),
            description: String(p.description ?? ''),
            image: String(p.img_url ?? ''),
            price,
            ingredientIds: [],
          };
        });
        setPizzas(mapped);
      } catch (e) {
        console.error('Failed to load pizzas', e);
      }
    })();
  }, []);

  const handleCustomize = (pizza: PredefinedPizza) => {
    setSelectedPizza(pizza);
    setOverlayOpen(true);
  };

  const getPreselectedIngredients = (pizza: PredefinedPizza): Ingredient[] => {
    return pizza.ingredientIds
      .map((id) => ingredients.find((ing) => ing.id === id))
      .filter((ing): ing is Ingredient => ing !== undefined);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-orange-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">Freshly Made, Every Time</span>
            </div>

            <h1 className="text-white mb-6">Craft Your Perfect Pizza</h1>

            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Choose from our premium ingredients and create a masterpiece. Every pizza is handcrafted with love and baked to perfection.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-white/70">Expert</p>
                  <p className="text-white">Chefs</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-white/70">Ready in</p>
                  <p className="text-white">30 Minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-white/70">Stone Oven</p>
                  <p className="text-white">Baked</p>
                </div>
              </div>
            </div>

            {/* Pizza Carousel */}
            <PizzaCarousel />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </div>

      {/* Pizza Menu Section */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-600 rounded-full px-4 py-2 mb-4">
              <Flame className="w-4 h-4" />
              <span className="text-sm">Our Menu</span>
            </div>
            <h2 className="text-gray-900 mb-4">Choose Your Pizza</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select from our signature pizzas or build your own from scratch
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pizzas.map((pizza) => (
              <div
                key={pizza.id}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={pizza.image}
                    alt={pizza.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-gray-900 flex-1">{pizza.name}</h3>
                    <p className="text-red-600 ml-2">
                      Rs. {pizza.price.toFixed(2)}
                    </p>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{pizza.description}</p>

                  <button
                    onClick={() => handleCustomize(pizza)}
                    className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    Customize & Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customization Overlay */}
      <CustomizationOverlay
        isOpen={overlayOpen}
        onClose={() => {
          setOverlayOpen(false);
          setSelectedPizza(null);
        }}
        ingredients={ingredients}
        addToCart={addToCart}
        preselectedIngredients={selectedPizza ? getPreselectedIngredients(selectedPizza) : []}
        pizzaName={selectedPizza?.name || ''}
        pizzaId={selectedPizza?.id}
      />
    </div>
  );
}
