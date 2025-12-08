/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { INTEGER, STRING, TEXT, DECIMAL, DATE, NUMERIC } = Sequelize;

    await queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      email: { type: STRING, allowNull: false, unique: true },
      user_pass: { type: STRING, allowNull: false },
      role: { type: STRING, allowNull: false },
      created_at: { type: DATE, allowNull: false },
    });

    await queryInterface.createTable('pizzas', {
      pizza_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: STRING(100), allowNull: false, unique: true },
      description: { type: TEXT },
      category: { type: STRING(50), allowNull: false },
      price_regular: { type: DECIMAL(10, 2), allowNull: false },
      price_medium: { type: DECIMAL(10, 2), allowNull: false },
      price_large: { type: DECIMAL(10, 2), allowNull: false },
      img_url: { type: TEXT },
    });

    await queryInterface.createTable('toppings', {
      topping_id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: STRING(100), allowNull: false, unique: true },
      price: { type: DECIMAL(10, 2), allowNull: false },
    });

    await queryInterface.createTable('orders', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: INTEGER, references: { model: 'users', key: 'id' } },
      status: { type: STRING, allowNull: false },
      total_amount: { type: NUMERIC, allowNull: false },
      address_text: { type: TEXT },
      created_at: { type: DATE, allowNull: false },
      updated_at: { type: DATE, allowNull: false },
    });

    await queryInterface.createTable('order_items', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      order_id: { type: INTEGER, references: { model: 'orders', key: 'id' } },
      pizza_id: { type: INTEGER, references: { model: 'pizzas', key: 'pizza_id' } },
      size: { type: STRING, allowNull: false },
      crust: { type: STRING },
      quantity: { type: INTEGER, allowNull: false },
      unit_price: { type: NUMERIC, allowNull: false },
    });

    await queryInterface.createTable('order_item_toppings', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      order_item_id: { type: INTEGER, references: { model: 'order_items', key: 'id' } },
      topping_id: { type: INTEGER, references: { model: 'toppings', key: 'topping_id' } },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('order_item_toppings');
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('toppings');
    await queryInterface.dropTable('pizzas');
    await queryInterface.dropTable('users');
  },
};