import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { ok, created, badRequest, unauthorized } from '../utils/response.js';
import { requireFields } from '../utils/validators.js';
import { User } from '../models/index.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    requireFields(req.body, ['email', 'password']);
    const hash = await bcrypt.hash(password, 10);
    await User.create({ email, user_pass: hash, role: 'user' });
    return created(res, { message: 'Registered' });
  } catch (e) {
    // Sequelize unique constraint
    if (e.name === 'SequelizeUniqueConstraintError') {
      e.status = 409;
      e.publicMessage = 'Email already exists';
      return next(e);
    }
    next(e);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    requireFields(req.body, ['email', 'password']);
    const user = await User.findOne({ where: { email }, attributes: ['id', 'user_pass', 'role', 'email'] });
    if (!user) unauthorized('Invalid credentials');
    const match = await bcrypt.compare(password, user.user_pass);
    if (!match) unauthorized('Invalid credentials');
    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '45m' });
    return ok(res, { token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

router.post('/admin/create', authRequired, adminRequired, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    requireFields(req.body, ['email', 'password']);

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUser = await User.create({ email, user_pass: hashedPassword, role: 'admin' });

    return created(res, { message: 'Admin user created successfully', id: createdUser.id });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      e.status = 409;
      e.publicMessage = 'Email already exists';
      return next(e);
    }
    next(e);
  }
});

export default router;
