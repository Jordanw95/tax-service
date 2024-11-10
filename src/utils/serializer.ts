import { ClassConstructor, plainToInstance } from 'class-transformer';

export function serialize<T>(dto: ClassConstructor<T>, data: any): T {
  return plainToInstance(dto, data, { excludeExtraneousValues: true });
}

export function serializeArray<T>(dto: ClassConstructor<T>, data: any[]): T[] {
  return plainToInstance(dto, data, { excludeExtraneousValues: true });
}
