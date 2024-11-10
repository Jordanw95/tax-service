import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { NotFoundError } from '../types/errors';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: err.message,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: 'Internal server error',
    data: null,
  });
};
