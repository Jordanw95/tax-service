import { z } from 'zod';

export const createSalesItemSchema = z.object({
  itemId: z.string().uuid(),
  cost: z.number().int().positive(),
  taxRate: z.number().min(0).max(1),
});

export const createSalesEventSchema = z.object({
  eventType: z.literal('SALES'),
  date: z.string().datetime(),
  invoiceId: z.string().uuid(),
  items: z.array(createSalesItemSchema).min(1),
});

export type ValidatedCreateSalesEventDto = z.infer<
  typeof createSalesEventSchema
>;

export const createTaxPaymentSchema = z.object({
  eventType: z.literal('TAX_PAYMENT'),
  date: z.string().datetime(),
  amount: z.number().int().positive(),
});

export const modifySalesItemSchema = z.object({
  date: z.string().datetime(),
  invoiceId: z.string().uuid(),
  itemId: z.string().uuid(),
  cost: z.number().int().positive(),
  taxRate: z.number().min(0).max(1),
});
