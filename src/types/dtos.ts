import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TaxPositionDto {
  @Expose() taxPosition: number = 0;

  constructor(partial: Partial<TaxPositionDto>) {
    Object.assign(this, partial);
  }
}
