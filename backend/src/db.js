import pkg from 'pg';
const { Client } = pkg;
import { config } from './config.js';

export const db = new Client({ connectionString: config.dbUrl });

export async function query(q, params) {
  return db.query(q, params);
}
