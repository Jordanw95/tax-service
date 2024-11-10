import request, { SuperTest, Test } from 'supertest';
import app from '../app';
import { prisma } from '../utils/db';
import { CreateSalesEventRequest, TaxPositionResponse } from '../types';
import { randomUUID } from 'crypto';

export const testApp = request(app);

export const createSalesEvent = async (data: CreateSalesEventRequest) => {
  return testApp.post('/api/transactions').send(data).expect(201);
};

export const getTaxPosition = async (date: string) => {
  return testApp.get('/api/tax-position').query({ date }).expect(200);
};

export const createDate = (dateString: string): Date => {
  // Expect format: DD/MM/YYYY
  const parts = dateString.split('/');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Use: DD/MM/YYYY (e.g., 31/01/2024)');
  }

  const [day, month, year] = parts;
  return new Date(`${year}-${month}-${day}T00:00:00Z`);
};

export const createTestSalesEvent = (date: Date): CreateSalesEventRequest => ({
  eventType: 'SALES',
  date: date.toISOString(),
  invoiceId: randomUUID(),
  items: [
    {
      itemId: randomUUID(),
      cost: 100,
      taxRate: 0.15,
    },
  ],
});
