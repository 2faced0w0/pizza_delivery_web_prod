import express from 'express';
import { query } from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT id, name, description, image_url, base_price, is_active FROM pizzas WHERE is_active = true ORDER BY id');
    res.json(result.rows);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT id, name, description, image_url, base_price, is_active FROM pizzas WHERE id=$1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) { next(e); }
});

router.post('/', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { name, description, imageUrl, basePrice } = req.body;
    if (!name || !basePrice) return res.status(400).json({ error: 'Name and basePrice required' });
    await query('INSERT INTO pizzas(name, description, image_url, base_price, is_active, created_at) VALUES($1,$2,$3,$4,true,NOW())', [name, description || '', imageUrl || '', basePrice]);
    res.status(201).json({ message: 'Created' });
  } catch (e) { next(e); }
});

router.patch('/:id', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { name, description, imageUrl, basePrice, isActive } = req.body;
    await query('UPDATE pizzas SET name=COALESCE($2,name), description=COALESCE($3,description), image_url=COALESCE($4,image_url), base_price=COALESCE($5,base_price), is_active=COALESCE($6,is_active) WHERE id=$1', [req.params.id, name, description, imageUrl, basePrice, isActive]);
    res.json({ message: 'Updated' });
  } catch (e) { next(e); }
});

export default router;
