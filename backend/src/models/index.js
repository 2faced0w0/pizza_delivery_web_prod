import { sequelize } from '../orm/sequelize.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define('users', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  user_pass: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user' },
});

export const Pizza = sequelize.define('pizzas', {
  pizza_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  description: DataTypes.TEXT,
  category: DataTypes.STRING,
  price_regular: DataTypes.DECIMAL,
  price_medium: DataTypes.DECIMAL,
  price_large: DataTypes.DECIMAL,
  img_url: DataTypes.STRING,
});

export const Topping = sequelize.define('toppings', {
  topping_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING,
  price: DataTypes.DECIMAL,
});

export const Order = sequelize.define('orders', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: DataTypes.INTEGER,
  status: DataTypes.STRING,
  total_amount: DataTypes.DECIMAL,
  address_text: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
});

export const OrderItem = sequelize.define('order_items', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_id: DataTypes.INTEGER,
  pizza_id: DataTypes.INTEGER,
  size: DataTypes.STRING,
  crust: DataTypes.STRING,
  quantity: DataTypes.INTEGER,
  unit_price: DataTypes.DECIMAL,
});

export const OrderItemTopping = sequelize.define('order_item_toppings', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_item_id: { type: DataTypes.INTEGER, allowNull: false },
  topping_id: { type: DataTypes.INTEGER, allowNull: false },
}, { timestamps: false });

// Associations (minimal)
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Pizza, { foreignKey: 'pizza_id' });
OrderItem.belongsToMany(Topping, { through: OrderItemTopping, foreignKey: 'order_item_id' });
Topping.belongsToMany(OrderItem, { through: OrderItemTopping, foreignKey: 'topping_id' });