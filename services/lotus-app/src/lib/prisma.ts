import { PrismaClient } from 'lotus-prisma';

export const prisma = new PrismaClient();

export type { Event as EventModel, Label, Account } from 'lotus-prisma';
