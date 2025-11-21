import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { config } from '../config.js';
import { authRequired, adminRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const hash = await bcrypt.hash(password, 10);
    await query('INSERT INTO users(email, user_pass, role, created_at) VALUES($1,$2,$3, NOW())', [email, hash, 'user']);
    return res.status(201).json({ message: 'Registered' });
  } catch (e) { 
    if (e.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(e); 
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const result = await query('SELECT id, user_pass, role FROM users WHERE email=$1', [email]);
    if (result.rowCount === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.user_pass);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '45m' });
    return res.json({ token, user: { id: user.id, email, role: user.role } });
  } catch (e) { next(e); }
});

router.post('/admin/create', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users(email, user_pass, role, created_at) VALUES($1,$2,$3,NOW()) RETURNING id',
      [email, hashedPassword, 'admin']
    );

    res.status(201).json({ 
      message: 'Admin user created successfully',
      id: result.rows[0].id 
    });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(e);
  }
});

export default router;
