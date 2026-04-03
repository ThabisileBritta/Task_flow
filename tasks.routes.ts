import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/tasks.controller';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
