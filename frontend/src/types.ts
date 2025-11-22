// Type definitions for the Pizza Delivery application

export interface Pizza {
  pizza_id?: number;
  id?: number;
  name: string;
  description?: string;
  category: 'Veg' | 'Non-Veg';
  price_regular: number;
  price_medium: number;
  price_large: number;
  img_url?: string;
}

export interface Topping {
  topping_id?: number;
  id?: number;
  name: string;
  price: number;
}

export interface CartItem {
  id: number;
  pizza: Pizza;
  crust: string;
  size: string;
  selectedToppings: Topping[];
  totalPrice: number;
}

export interface User {
  token: string;
  role?: string;
  id?: number;
}

export interface OrderItem {
  id: number;
  pizza_id: number;
  pizza_name: string;
  size: string;
  crust: string;
  quantity: number;
  unit_price: number;
  toppings: string[];
}

export interface Order {
  id: number;
  user_id?: number;
  status: string;
  total_amount: number;
  address_text: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}
