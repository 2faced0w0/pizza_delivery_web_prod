import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { db } from './db.js';
import authRoutes from './routes/auth.js';
import pizzaRoutes from './routes/pizzas.js';
import toppingsRoutes from './routes/toppings.js';
import orderRoutes from './routes/orders.js';
import { errorMiddleware } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.use('/auth', authRoutes);
app.use('/pizzas', pizzaRoutes);
app.use('/toppings', toppingsRoutes);
app.use('/orders', orderRoutes);

// Serve static frontend files in production
if (config.nodeEnv === 'production') {
  const publicPath = path.join(__dirname, '..', 'public');
  console.log('Serving static files from:', publicPath);
  app.use(express.static(publicPath));
  
  // Serve index.html for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

app.use(errorMiddleware);

const start = async () => {
  try {
    console.log('Environment:', config.nodeEnv);
    console.log('Attempting to connect to database...');
    console.log('DB URL (masked):', config.dbUrl.replace(/:[^:@]+@/, ':****@'));
    await db.connect();
    console.log('DB connected successfully');
    app.listen(config.port, () => console.log(`Backend listening on ${config.port}`));
  } catch (err) {
    console.error('Startup error', err);
    process.exit(1);
  }
};

start();

export default app;
