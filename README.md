# Pizza Delivery Web (MVP)

deployed @ https://pizza-delivery-web-prod.onrender.com/

## Backend Quick Start

```cmd
cd backend
npm install
set DATABASE_URL=postgresql://postgres:postgres@localhost:5425/pizzastore
set JWT_SECRET=replace_with_actual
set PORT=4000
docker run -d --name pizza-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pizzastore -p 5425:5432 -v pizzastore_data:/var/lib/postgresql/data postgres:16
nodemon src/index.js
```

DB schema (minimal SQL):

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);
CREATE TABLE pizzas (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  base_price NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL,
  created_at TIMESTAMP NOT NULL
);
CREATE TABLE toppings (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL
);
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  address_text TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  pizza_id INTEGER REFERENCES pizzas(id),
  size TEXT NOT NULL,
  crust TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL
);
CREATE TABLE order_item_toppings (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER REFERENCES order_items(id),
  topping_id INTEGER REFERENCES toppings(id)
);
```

Seed sample data:

```cmd
psql %DATABASE_URL% -f backend\scripts\seed.sql
```

## Frontend Quick Start
```cmd
cd frontend
npm install
npm run dev
```
Open <http://localhost:5173>

## Basic API Flow
1. Register: POST /auth/register {email,password}
2. Login: POST /auth/login -> token
3. Auth header: Authorization: Bearer <token>
4. List pizzas: GET /pizzas
5. Create order: POST /orders {items:[{pizzaId,size,crust,toppingIds,quantity,quantity}],address}
6. Update status (admin): PATCH /admin/orders/:id/status {status}

## Pricing
Calculated server-side using size multiplier + toppings.

