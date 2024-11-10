// Required for class-transformer
import 'reflect-metadata';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class TaxPositionResponse {
  @Expose() taxPosition!: number;

  constructor(partial: Partial<TaxPositionResponse>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class SalesItemResponse {
  @Expose() itemId!: string;

  @Expose()
  cost!: number;

  @Expose()
  taxRate!: number;

  constructor(partial: Partial<SalesItemResponse>) {
    Object.assign(this, partial);
  }
}

@Exclude()
export class SalesEventResponse {
  @Expose()
  eventType!: 'SALES';

  @Expose()
  date!: string;

  @Expose()
  invoiceId!: string;

  @Expose()
  @Type(() => SalesItemResponse)
  salesItems!: SalesItemResponse[];

  constructor(partial: Partial<SalesEventResponse>) {
    Object.assign(this, partial);
  }
}
