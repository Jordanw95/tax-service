export interface CreateSalesItemRequest {
  itemId: string;
  cost: number; // in pennies
  taxRate: number; // as decimal
}

export interface CreateSalesEventRequest {
  eventType: 'SALES';
  date: string;
  invoiceId: string;
  items: CreateSalesItemRequest[];
}

export interface CreateTaxPaymentRequest {
  eventType: 'TAX_PAYMENT';
  date: string;
  amount: number; // in pennies
}

export interface ModifySalesItemRequest {
  date: string;
  invoiceId: string;
  itemId: string;
  cost: number;
  taxRate: number;
}
