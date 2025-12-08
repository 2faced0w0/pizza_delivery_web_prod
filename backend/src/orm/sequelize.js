import { Sequelize } from 'sequelize';
import { config } from '../config.js';

// Prefer DATABASE_URL; supports Postgres
export const sequelize = new Sequelize(config.dbUrl, {
  dialect: 'postgres',
  logging: false,
  define: {
    underscored: true,
    freezeTableName: true,
  },
});

export async function initORM() {
  await sequelize.authenticate();
  // Ensure models align with existing schema without destructive changes
  await sequelize.sync({ alter: false });
}