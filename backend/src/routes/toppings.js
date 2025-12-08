import express from 'express';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { ok, created, badRequest } from '../utils/response.js';
import { requireFields } from '../utils/validators.js';
import { Topping } from '../models/index.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const toppings = await Topping.findAll({ attributes: ['topping_id', 'name', 'price'], order: [['topping_id', 'ASC']] });
    ok(res, toppings);
  } catch (e) { next(e); }
});

router.post('/', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { name, price } = req.body;
    requireFields(req.body, ['name']);
    if (price === undefined) return next(badRequest('Price required'));
    const t = await Topping.create({ name, price });
    created(res, { message: 'Created', id: t.topping_id });
  } catch (e) { next(e); }
});

router.delete('/:id', authRequired, adminRequired, async (req, res, next) => {
  try {
    const id = req.params.id;
    const deleted = await Topping.destroy({ where: { topping_id: id } });
    ok(res, { message: deleted ? 'Deleted' : 'No change' });
  } catch (e) { next(e); }
});

export default router;
