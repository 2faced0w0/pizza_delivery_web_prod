import express from 'express';
import { query } from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { calculatePrice } from '../utils/pricing.js';

const router = express.Router();

router.get('/', authRequired, async (req, res, next) => {
  try {
    const result = await query('SELECT id, status, total_amount, created_at FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (e) { next(e); }
});

router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const result = await query('SELECT id, status, total_amount, created_at, updated_at FROM orders WHERE id=$1 AND (user_id=$2 OR $3=TRUE)', [req.params.id, req.user.id, req.user.role === 'admin']);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) { next(e); }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { items, address } = req.body; // items: [{pizzaId,size,crust,toppingIds,quantity}]
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Items required' });
    let total = 0;
    for (const item of items) {
      const pizzaRes = await query('SELECT base_price FROM pizzas WHERE id=$1 AND is_active=true', [item.pizzaId]);
      if (pizzaRes.rowCount === 0) return res.status(400).json({ error: 'Invalid pizza' });
      const basePrice = Number(pizzaRes.rows[0].base_price);
      // Simplified: each topping has uniform price = 1 for demo; fetch real prices in production.
      const toppingPrices = (item.toppingIds || []).map(() => 1);
      total += calculatePrice({ basePrice, size: item.size, crustModifier: 0, toppingPrices, quantity: item.quantity || 1 });
    }
    const orderRes = await query('INSERT INTO orders(user_id,status,total_amount,address_text,created_at,updated_at) VALUES($1,$2,$3,$4,NOW(),NOW()) RETURNING id', [req.user.id, 'RECEIVED', total, address || '']);
    res.status(201).json({ id: orderRes.rows[0].id, total });
  } catch (e) { next(e); }
});

router.patch('/:id/status', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['RECEIVED','PREPARING','BAKING','OUT_FOR_DELIVERY','DELIVERED','CANCELED'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await query('UPDATE orders SET status=$2, updated_at=NOW() WHERE id=$1', [req.params.id, status]);
    res.json({ message: 'Status updated' });
  } catch (e) { next(e); }
});

export default router;
