import express from 'express';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { ok, created, badRequest } from '../utils/response.js';
import { isArrayNonEmpty, requireFields } from '../utils/validators.js';
import { Order, OrderItem, OrderItemTopping, Pizza, Topping } from '../models/index.js';

const router = express.Router();

router.get('/pending', authRequired, adminRequired, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { status: 'pending' },
      order: [['created_at', 'ASC']],
      attributes: ['id', 'user_id', 'status', 'total_amount', 'address_text', 'created_at', 'updated_at'],
      include: [{
        model: OrderItem,
        attributes: ['id', 'pizza_id', 'size', 'crust', 'quantity', 'unit_price'],
        include: [
          { model: Pizza, attributes: ['name'] },
          { model: Topping, attributes: ['name'], through: { attributes: [] } }
        ]
      }]
    });

    const shaped = orders.map(o => ({
      id: o.id,
      user_id: o.user_id,
      status: o.status,
      total_amount: o.total_amount,
      address_text: o.address_text,
      created_at: o.created_at,
      updated_at: o.updated_at,
      items: (o.order_items || []).map(oi => ({
        id: oi.id,
        pizza_id: oi.pizza_id,
        pizza_name: oi.pizza?.name,
        size: oi.size,
        crust: oi.crust,
        quantity: oi.quantity,
        unit_price: oi.unit_price,
        toppings: (oi.toppings || []).map(t => t.name)
      }))
    }));

    ok(res, shaped);
  } catch (e) {
    console.error('Error fetching pending orders:', e);
    next(e);
  }
});

router.get('/my-orders', authRequired, async (req, res, next) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      attributes: ['id', 'status', 'total_amount', 'address_text', 'created_at', 'updated_at'],
      include: [{
        model: OrderItem,
        attributes: ['id', 'pizza_id', 'size', 'crust', 'quantity', 'unit_price'],
        include: [
          { model: Pizza, attributes: ['name'] },
          { model: Topping, attributes: ['name'], through: { attributes: [] } }
        ]
      }]
    });

    const shaped = orders.map(o => ({
      id: o.id,
      status: o.status,
      total_amount: o.total_amount,
      address_text: o.address_text,
      created_at: o.created_at,
      updated_at: o.updated_at,
      items: (o.order_items || []).map(oi => ({
        id: oi.id,
        pizza_id: oi.pizza_id,
        pizza_name: oi.pizza?.name,
        size: oi.size,
        crust: oi.crust,
        quantity: oi.quantity,
        unit_price: oi.unit_price,
        toppings: (oi.toppings || []).map(t => t.name)
      }))
    }));

    ok(res, shaped);
  } catch (e) {
    console.error('Error fetching user orders:', e);
    next(e);
  }
});

router.get('/', authRequired, async (req, res, next) => {
  try {
    const orders = await Order.findAll({ where: { user_id: req.user.id }, attributes: ['id', 'status', 'total_amount', 'created_at'], order: [['created_at', 'DESC']] });
    ok(res, orders);
  } catch (e) { next(e); }
});

router.get('/:id', authRequired, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const order = await Order.findOne({
      where: isAdmin ? { id: req.params.id } : { id: req.params.id, user_id: req.user.id },
      attributes: ['id', 'status', 'total_amount', 'created_at', 'updated_at']
    });
    if (!order) return next(Object.assign(new Error('Not found'), { status: 404, publicMessage: 'Not found' }));
    ok(res, order);
  } catch (e) { next(e); }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { items, address_text } = req.body;
    isArrayNonEmpty(items, 'items');
    requireFields({ address_text }, ['address_text']);

    const order = await Order.create({ user_id: req.user.id, status: 'pending', total_amount: 0, address_text, created_at: new Date(), updated_at: new Date() });

    let computedTotal = 0;

    for (const item of items) {
      const { pizza_id, size, crust, quantity, toppings } = item;
      if (!pizza_id) return next(badRequest('pizza_id required'));

      const pizza = await Pizza.findByPk(pizza_id, { attributes: ['pizza_id', 'price_regular', 'price_medium', 'price_large'] });
      if (!pizza) return next(badRequest('Pizza not found'));

      // Normalize size to our price fields
      const normalizedSize = (size === 'medium' || size === 'large') ? size : 'regular';
      const basePrice = normalizedSize === 'regular' ? Number(pizza.price_regular)
        : normalizedSize === 'medium' ? Number(pizza.price_medium)
        : Number(pizza.price_large);

      let toppingsSum = 0;
      if (Array.isArray(toppings) && toppings.length > 0) {
        const toppingRows = await Topping.findAll({
          where: { topping_id: toppings },
          attributes: ['topping_id', 'price']
        });
        toppingsSum = toppingRows.reduce((sum, t) => sum + Number(t.price || 0), 0);
      }

      const unit_price = Number((basePrice + toppingsSum).toFixed(2));
      const qty = Number(quantity || 1);
      computedTotal += unit_price * qty;

      const oi = await OrderItem.create({ order_id: order.id, pizza_id, size: normalizedSize, crust, quantity: qty, unit_price });
      if (Array.isArray(toppings) && toppings.length > 0) {
        for (const toppingId of toppings) {
          await OrderItemTopping.create({ order_item_id: oi.id, topping_id: toppingId });
        }
      }
    }

    // Update order total
    await Order.update({ total_amount: Number(computedTotal.toFixed(2)), updated_at: new Date() }, { where: { id: order.id } });

    created(res, { id: order.id, total: Number(computedTotal.toFixed(2)), message: 'Order placed successfully' });
  } catch (e) {
    console.error('Error creating order:', e);
    next(e);
  }
});

router.patch('/:id/status', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'preparing', 'baking', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!allowed.includes(status)) badRequest('Invalid status');
    await Order.update({ status, updated_at: new Date() }, { where: { id: req.params.id } });
    ok(res, { message: 'Status updated' });
  } catch (e) { next(e); }
});

export default router;
