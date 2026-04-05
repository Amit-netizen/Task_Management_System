import { Response } from 'express';
import { z } from 'zod';
import { Prisma, TaskStatus, Priority } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { AuthenticatedRequest } from '../types';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

const updateTaskSchema = createTaskSchema.partial();

export async function getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { page = '1', limit = '10', status, search, priority } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where: Prisma.TaskWhereInput = { userId };

  if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
    where.status = status as TaskStatus;
  }
  if (priority && Object.values(Priority).includes(priority as Priority)) {
    where.priority = priority as Priority;
  }
  if (search) {
  const isPg = process.env.DATABASE_URL?.startsWith('postgresql') ||
               process.env.DATABASE_URL?.startsWith('postgres');
  where.title = isPg
    ? { contains: search, mode: 'insensitive' }
    : { contains: search };
}

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.task.count({ where }),
  ]);

  res.json({
    tasks,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNext: pageNum < Math.ceil(total / limitNum),
      hasPrev: pageNum > 1,
    },
  });
}

export async function getTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  res.json(task);
}

export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;

  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  const { dueDate, ...rest } = parsed.data;

  const task = await prisma.task.create({
    data: {
      ...rest,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      userId,
    },
  });

  res.status(201).json(task);
}

export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.errors });
    return;
  }

  const { dueDate, ...rest } = parsed.data;

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
    },
  });

  res.json(task);
}

export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  await prisma.task.delete({ where: { id } });
  res.json({ message: 'Task deleted successfully' });
}

export async function toggleTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  const userId = req.user!.id;
  const { id } = req.params;

  const existing = await prisma.task.findFirst({ where: { id, userId } });
  if (!existing) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }

  const nextStatus =
    existing.status === TaskStatus.COMPLETED ? TaskStatus.PENDING : TaskStatus.COMPLETED;

  const task = await prisma.task.update({
    where: { id },
    data: { status: nextStatus },
  });

  res.json(task);
}
