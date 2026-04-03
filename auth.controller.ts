import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { query } from '../db/pool';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const { name, email, password } = result.data;

  try {
    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);

    const { rows } = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, password_hash]
    );

    const user = rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('token', token, cookieOptions);
    res.status(201).json({ data: { user } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid credentials' });
    return;
  }

  const { email, password } = result.data;

  try {
    const { rows } = await query(
      'SELECT id, email, name, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.cookie('token', token, cookieOptions);
    res.json({
      data: {
        user: { id: user.id, email: user.email, name: user.name },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const logout = (_req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const { rows } = await query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ data: { user: rows[0] } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
