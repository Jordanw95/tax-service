// Required for class-transfomer
import 'reflect-metadata';
import '@jest/globals';
import dotenv from 'dotenv';
import { prisma } from '../utils/db';

// Load test environment variables
dotenv.config({ path: 'test.env' });

beforeAll(async () => {
  // Force Prisma to use test database
  process.env.DATABASE_URL =
    'postgresql://postgres:password@db:5432/novabook_test';

  // Verify we're using test database
  const url = (await prisma.$queryRaw`SELECT current_database()`) as [
    { current_database: string },
  ];
  const dbName = url[0].current_database;

  if (!dbName.includes('test')) {
    throw new Error('Must use test database for testing');
  }
});
beforeEach(async () => {
  await prisma.salesItem.deleteMany();
  await prisma.salesEvent.deleteMany();
  await prisma.taxPaymentEvent.deleteMany();
  await prisma.taxPositionEntry.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
