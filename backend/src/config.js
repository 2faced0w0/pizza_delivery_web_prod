export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || '',
  dbUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5425/pizzastore'
};
