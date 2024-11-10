import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TaxPositionDto {
  @Expose() taxPosition: number = 0;

  constructor(partial: Partial<TaxPositionDto>) {
    Object.assign(this, partial);
  }
}

export interface CreateSalesItemDto {
  itemId: string;
  cost: number; // in pennies
  taxRate: number; // as decimal
}

export interface CreateSalesEventDto {
  eventType: 'SALES';
  date: string;
  invoiceId: string;
  items: CreateSalesItemDto[];
}
