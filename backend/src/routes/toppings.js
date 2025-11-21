import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT topping_id, name, price FROM toppings  ORDER BY topping_id');
    res.json(result.rows);
  } catch (e) { next(e); }
});

export default router;
