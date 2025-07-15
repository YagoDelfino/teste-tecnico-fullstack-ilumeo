// backend/src/middlewares/errorHandler.ts

import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Backend Error:', err);

  const statusCode = err.status || 500;

  const message = err.message || 'Erro interno do servidor';

  res.status(statusCode).json({
    message: message,
  });
};