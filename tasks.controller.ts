import { Response } from 'express';
import { z } from 'zod';
import { query } from '../db/pool';
import { AuthRequest } from '../middleware/auth';

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional().default('todo'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  due_date: z.string().datetime({ offset: true }).optional().nullable(),
});

const updateTaskSchema = createTaskSchema.partial();

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, priority, sort = 'created_at', order = 'desc' } = req.query;

  // Whitelist sort columns to prevent SQL injection
  const allowedSorts = ['created_at', 'updated_at', 'due_date', 'priority', 'title'];
  const sortColumn = allowedSorts.includes(sort as string) ? sort : 'created_at';
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const conditions: string[] = ['user_id = $1'];
  const params: unknown[] = [req.user!.userId];
  let paramCount = 1;

  if (status) {
    paramCount++;
    conditions.push(`status = $${paramCount}`);
    params.push(status);
  }

  if (priority) {
    paramCount++;
    conditions.push(`priority = $${paramCount}`);
    params.push(priority);
  }

  const whereClause = conditions.join(' AND ');

  try {
    const { rows } = await query(
      `SELECT id, title, description, status, priority, due_date, created_at, updated_at
       FROM tasks
       WHERE ${whereClause}
       ORDER BY ${sortColumn} ${sortOrder}`,
      params
    );

    res.json({ data: { tasks: rows } });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rows } = await query(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ data: { task: rows[0] } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const { title, description, status, priority, due_date } = result.data;

  try {
    const { rows } = await query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [req.user!.userId, title, description ?? null, status, priority, due_date ?? null]
    );

    res.status(201).json({ data: { task: rows[0] } });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = updateTaskSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten().fieldErrors });
    return;
  }

  const updates = result.data;
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }

  // Build dynamic SET clause safely
  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramCount = 0;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      paramCount++;
      setClauses.push(`${key} = $${paramCount}`);
      params.push(value);
    }
  }

  paramCount++;
  params.push(req.params.id);
  paramCount++;
  params.push(req.user!.userId);

  try {
    const { rows } = await query(
      `UPDATE tasks SET ${setClauses.join(', ')}
       WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
       RETURNING *`,
      params
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ data: { task: rows[0] } });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rowCount } = await query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );

    if (rowCount === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
