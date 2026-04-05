import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
} from '../controllers/task.controller';

const router = Router();

router.use(authenticate as any);

router.get('/', getTasks as any);
router.post('/', createTask as any);
router.get('/:id', getTask as any);
router.patch('/:id', updateTask as any);
router.delete('/:id', deleteTask as any);
router.patch('/:id/toggle', toggleTask as any);

export default router;
