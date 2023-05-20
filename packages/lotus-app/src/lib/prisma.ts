import { PrismaClient } from 'lotus-prisma';

export const prisma = new PrismaClient();

export type { Task as TaskModel, Label, Account } from 'lotus-prisma';
