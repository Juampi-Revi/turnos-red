import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError, ErrorCodes } from '../errors/AppError.js';

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.status).json({
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      field: issue.path.join('.') || 'request',
      message: issue.message,
    }));

    res.status(400).json({
      status: 400,
      message: 'Error de validación en los datos ingresados',
      code: ErrorCodes.VALIDATION_ERROR,
      details,
    });
    return;
  }

  console.error('[TurnosRed] Error no controlado:', error);

  res.status(500).json({
    status: 500,
    message: 'Error interno del servidor',
    code: ErrorCodes.INTERNAL_ERROR,
    details: [],
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    status: 404,
    message: 'Ruta no encontrada',
    code: ErrorCodes.NOT_FOUND,
    details: [],
  });
}
