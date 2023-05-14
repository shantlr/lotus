import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type { Task as TaskModel, Label } from '@prisma/client';
