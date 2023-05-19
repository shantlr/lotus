import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type { Task as TaskModel, Label, Account } from '@prisma/client';
