export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class TaxPositionNotFoundError extends NotFoundError {
  constructor() {
    super('Tax Position');
  }
}
