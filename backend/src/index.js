import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { db } from './db.js';
import authRoutes from './routes/auth.js';
import pizzaRoutes from './routes/pizzas.js';
import toppingsRoutes from './routes/toppings.js';
import orderRoutes from './routes/orders.js';
import { errorMiddleware } from './middleware/error.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/pizzas', pizzaRoutes);
app.use('/toppings', toppingsRoutes);
app.use('/orders', orderRoutes);

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
