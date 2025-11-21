import express from 'express';
import { query } from '../db.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { calculatePrice } from '../utils/pricing.js';

const router = express.Router();

router.get('/pending', authRequired, adminRequired, async (req, res, next) => {
  try {
    // Fetch pending orders with items and toppings
    const ordersResult = await query(
      `SELECT o.id, o.user_id, o.status, o.total_amount, o.address_text, o.created_at, o.updated_at
       FROM orders o
       WHERE o.status = 'pending'
       ORDER BY o.created_at ASC`
    );

    const orders = ordersResult.rows;

    // Fetch order items for each order
    for (const order of orders) {
      const itemsResult = await query(
        `SELECT oi.id, oi.pizza_id, p.name as pizza_name, oi.size, oi.crust, 
                oi.quantity, oi.unit_price
         FROM order_items oi
         JOIN pizzas p ON oi.pizza_id = p.pizza_id
         WHERE oi.order_id = $1`,
        [order.id]
      );

      order.items = itemsResult.rows;

      // Fetch toppings for each item
      for (const item of order.items) {
        const toppingsResult = await query(
          `SELECT t.name
           FROM order_item_toppings oit
           JOIN toppings t ON oit.topping_id = t.topping_id
           WHERE oit.order_item_id = $1`,
          [item.id]
        );
        item.toppings = toppingsResult.rows.map(t => t.name);
      }
    }

    res.json(orders);
  } catch (e) { 
    console.error('Error fetching pending orders:', e);
    next(e); 
  }
});

router.get('/my-orders', authRequired, async (req, res, next) => {
  try {
    // Fetch orders with items and toppings
    const ordersResult = await query(
      `SELECT o.id, o.status, o.total_amount, o.address_text, o.created_at, o.updated_at
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    const orders = ordersResult.rows;

    // Fetch order items for each order
    for (const order of orders) {
      const itemsResult = await query(
        `SELECT oi.id, oi.pizza_id, p.name as pizza_name, oi.size, oi.crust, 
                oi.quantity, oi.unit_price
         FROM order_items oi
         JOIN pizzas p ON oi.pizza_id = p.pizza_id
         WHERE oi.order_id = $1`,
        [order.id]
      );

      order.items = itemsResult.rows;

      // Fetch toppings for each item
      for (const item of order.items) {
        const toppingsResult = await query(
          `SELECT t.name
           FROM order_item_toppings oit
           JOIN toppings t ON oit.topping_id = t.topping_id
           WHERE oit.order_item_id = $1`,
          [item.id]
        );
        item.toppings = toppingsResult.rows.map(t => t.name);
      }
    }

    res.json(orders);
  } catch (e) { 
    console.error('Error fetching user orders:', e);
    next(e); 
  }
});

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
    const { items, address_text, phone, total_amount } = req.body;
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items required' });
    }

    if (!address_text || !address_text.trim()) {
      return res.status(400).json({ error: 'Delivery address required' });
    }

    // Create the order with status 'pending'
    const orderRes = await query(
      `INSERT INTO orders(user_id, status, total_amount, address_text, created_at, updated_at) 
       VALUES($1, $2, $3, $4, NOW(), NOW()) 
       RETURNING id`,
      [req.user.id, 'pending', total_amount || 0, address_text]
    );

    const orderId = orderRes.rows[0].id;

    // Insert order items and their toppings
    for (const item of items) {
      const { pizza_id, size, crust, quantity, unit_price, toppings } = item;

      // Insert order item
      const itemRes = await query(
        `INSERT INTO order_items(order_id, pizza_id, size, crust, quantity, unit_price) 
         VALUES($1, $2, $3, $4, $5, $6) 
         RETURNING id`,
        [orderId, pizza_id, size, crust, quantity || 1, unit_price]
      );

      const itemId = itemRes.rows[0].id;

      // Insert toppings for this item
      if (toppings && Array.isArray(toppings) && toppings.length > 0) {
        for (const toppingId of toppings) {
          await query(
            `INSERT INTO order_item_toppings(order_item_id, topping_id) 
             VALUES($1, $2)`,
            [itemId, toppingId]
          );
        }
      }
    }

    res.status(201).json({ 
      id: orderId, 
      total: total_amount,
      message: 'Order placed successfully' 
    });
  } catch (e) { 
    console.error('Error creating order:', e);
    next(e); 
  }
});

router.patch('/:id/status', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'preparing', 'baking', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
    await query('UPDATE orders SET status=$2, updated_at=NOW() WHERE id=$1', [req.params.id, status]);
    res.json({ message: 'Status updated' });
  } catch (e) { next(e); }
});

export default router;
