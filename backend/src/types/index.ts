import { Request } from 'express';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  type: 'access' | 'refresh';
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  status?: string;
  search?: string;
  priority?: string;
}
