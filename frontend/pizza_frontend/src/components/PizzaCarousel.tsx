import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { api } from '../api/client';

interface CarouselPizza {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
}

export default function PizzaCarousel() {
  const [pizzas, setPizzas] = useState<CarouselPizza[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/pizzas');
        const raw = res.data;
        const arr = Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
          ? raw
          : [];

        const mapped: CarouselPizza[] = arr.map((p: any) => {
          const id = Number(p.pizza_id ?? p.id);
          const name = String(p.name ?? 'Pizza');
          const description = String(p.description ?? '');
          const image = String(p.img_url ?? '');
          const prices = [p.price_regular, p.price_medium, p.price_large]
            .map((x: any) => (x != null ? Number(x) : undefined))
            .filter((x: number | undefined): x is number => typeof x === 'number');
        
          const price = prices.length ? Math.min(...prices) : 0;
          return { id, name, description, image, price };
        });

        // Randomize and pick up to 5 items
        const shuffled = [...mapped].sort(() => Math.random() - 0.5);
        setPizzas(shuffled.slice(0, 5));
      } catch (e) {
        console.error('Failed to load pizzas for carousel', e);
      }
    })();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="mt-12 px-4">
      <Slider {...settings}>
        {pizzas.map((pizza) => (
          <div key={pizza.id} className="px-3">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/20 transition-all duration-300 group">
              <div className="aspect-square overflow-hidden">
                <img
                  src={pizza.image}
                  alt={pizza.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="text-white mb-1">{pizza.name}</h3>
                <p className="text-white/70 text-sm mb-2">{pizza.description}</p>
                <p className="text-white">Starting at Rs. {pizza.price.toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
