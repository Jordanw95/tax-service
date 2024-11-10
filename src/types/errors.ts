export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`No result for resource ${resource} was found`);
    this.name = 'NotFoundError';
  }
}

export class TaxPositionNotFoundError extends NotFoundError {
  constructor() {
    super('Tax Position');
  }
}
