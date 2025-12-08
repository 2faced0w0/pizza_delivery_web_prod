-- Database schema for pizza delivery application

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  user_pass TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS pizzas (
    pizza_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Veg', 'Non-Veg')), -- Ensures data integrity for category
    price_regular DECIMAL(10, 2) NOT NULL,
    price_medium DECIMAL(10, 2) NOT NULL,
    price_large DECIMAL(10, 2) NOT NULL,
    img_url TEXT
);

CREATE TABLE IF NOT EXISTS toppings (
    topping_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  address_text TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  pizza_id INTEGER REFERENCES pizzas(pizza_id),
  size TEXT NOT NULL,
  crust TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS order_item_toppings (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id),
  topping_id INTEGER REFERENCES toppings(topping_id)
);
