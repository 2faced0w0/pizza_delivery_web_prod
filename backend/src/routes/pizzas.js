import express from 'express';
import { query } from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';



const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await query('SELECT pizza_id, name, description, category, price_regular, price_medium, price_large, img_url FROM pizzas ORDER BY pizza_id');
    res.json(result.rows);
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await query('SELECT pizza_id, name, description, category, price_regular, price_medium, price_large, img_url FROM pizzas WHERE pizza_id=$1', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (e) { next(e); }
});

router.post('/', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { name, description, category, priceRegular, priceMedium, priceLarge, imgUrl } = req.body;
    if (!name || !category || !priceRegular || !priceMedium || !priceLarge) {
      return res.status(400).json({ error: 'Name, category, and all three prices required' });
    }
    await query(
      'INSERT INTO pizzas(name, description, category, price_regular, price_medium, price_large, img_url) VALUES($1,$2,$3,$4,$5,$6,$7)', 
      [name, description || '', category, priceRegular, priceMedium, priceLarge, imgUrl || '']
    );
    res.status(201).json({ message: 'Created' });
  } catch (e) { next(e); }
});

router.patch('/:id', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { name, description, category, priceRegular, priceMedium, priceLarge, imgUrl } = req.body;
    await query(
      'UPDATE pizzas SET name=COALESCE($2,name), description=COALESCE($3,description), category=COALESCE($4,category), price_regular=COALESCE($5,price_regular), price_medium=COALESCE($6,price_medium), price_large=COALESCE($7,price_large), img_url=COALESCE($8,img_url) WHERE pizza_id=$1', 
      [req.params.id, name, description, category, priceRegular, priceMedium, priceLarge, imgUrl]
    );
    res.json({ message: 'Updated' });
  } catch (e) { next(e); }
});

export default router;
