# Project Update:
### Backend
  #### Error Management:
  Implemented a centralized and standardized error-handling mechanism. A common error manager will help ensure consistent responses across all endpoints.
  
  #### ORM Usage:
  Used Sequelize (or another ORM) to streamline database operations. This will improve code readability, reduce raw SQL repetition, and simplify validations and relationships.
  
  #### Helper & Utility Functions:
  Created common helpers and utility modules for recurring logic (e.g., response formatting, database queries, validations). This will significantly improve the code’s maintainability and readability.

### Frontend
  #### UI Modernization:
  The current UI has been enhanced with modern design principles to improve user experience and align it with current industry standards.
  
  #### Filtering & User Experience:
  Added more filtering options and user-friendly components to make the interface more intuitive.
  
  #### API Layer Improvements:
  Used a common Axios instance with interceptors for handling tokens, errors, and base URLs consistently.
  


## Frontend Docker Deployment

- Build the image:

```
docker build -t pizza-frontend:latest ./frontend/pizza_frontend
```

- Run the container on port 8080:

```
docker run -d --name pizza-frontend -p 8080:80 pizza-frontend:latest
```

- Open the app: http://localhost:8080

- Stop and remove:

```
docker stop pizza-frontend
docker rm pizza-frontend
```

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
Calculated client-side using size multiplier + toppings.



