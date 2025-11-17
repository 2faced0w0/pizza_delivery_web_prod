import express from 'express';
import { config } from './config.js';
import { db } from './db.js';
import authRoutes from './routes/auth.js';
import pizzaRoutes from './routes/pizzas.js';
import orderRoutes from './routes/orders.js';
import healthRoute from './routes/health.js';
import { errorMiddleware } from './middleware/error.js';

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/pizzas', pizzaRoutes);
app.use('/orders', orderRoutes);
app.use('/healthz', healthRoute);

app.use(errorMiddleware);

const start = async () => {
  try {
    await db.connect();
    console.log('DB connected');
    app.listen(config.port, () => console.log(`Backend listening on ${config.port}`));
  } catch (err) {
    console.error('Startup error', err);
    process.exit(1);
  }
};

start();

export default app;
