import express from 'express';
import { Pizza } from '../models/index.js';
import { ok, created, notFound, badRequest } from '../utils/response.js';
import { authRequired, adminRequired } from '../middleware/auth.js';



const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const pizzas = await Pizza.findAll({
      attributes: ['pizza_id', 'name', 'description', 'category', 'price_regular', 'price_medium', 'price_large', 'img_url'],
      order: [['pizza_id', 'ASC']],
    });
    ok(res, pizzas);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id, {
      attributes: ['pizza_id', 'name', 'description', 'category', 'price_regular', 'price_medium', 'price_large', 'img_url'],
    });
    if (!pizza) return next(notFound('Pizza not found'));
    ok(res, pizza);
  } catch (e) { next(e); }
});

router.post('/', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { name, description, category, price_regular, price_medium, price_large, img_url } = req.body;
    if (!name || !category || price_regular == null || price_medium == null || price_large == null) {
      return next(badRequest('Name, category, and all three prices required'));
    }
    const createdPizza = await Pizza.create({ name, description, category, price_regular, price_medium, price_large, img_url });
    created(res, { id: createdPizza.pizza_id });
  } catch (e) { next(e); }
});

router.patch('/:id', authRequired, adminRequired, async (req, res, next) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);
    if (!pizza) return next(notFound('Pizza not found'));
    await pizza.update(req.body);
    ok(res, { message: 'Updated' });
  } catch (e) { next(e); }
});

router.delete('/:id', authRequired, adminRequired, async (req, res, next) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);
    if (!pizza) return next(notFound('Pizza not found'));
    await pizza.destroy();
    ok(res, { message: 'Deleted' });
  } catch (e) { next(e); }
});

export default router;
