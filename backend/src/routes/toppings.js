import express from 'express';
import { query } from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT topping_id, name, price FROM toppings  ORDER BY topping_id');
    res.json(result.rows);
  } catch (e) { next(e); }
});

router.post('/', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { name, price } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Name and price required' });
    }
    await query('INSERT INTO toppings(name, price) VALUES($1,$2)', [name, price]);
    res.status(201).json({ message: 'Created' });
  } catch (e) { next(e); }
});

router.delete('/:id', authRequired, adminRequired, async (req, res, next) => {
  try {
    await query('DELETE FROM toppings WHERE topping_id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

export default router;
