import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodType } from 'zod';
import { AppError, ErrorCodes } from '../errors/AppError.js';

function formatZodError(error: ZodError): AppError {
  const details = error.issues.map((issue) => ({
    field: issue.path.join('.') || 'body',
    message: issue.message,
  }));

  return new AppError(
    400,
    ErrorCodes.VALIDATION_ERROR,
    'Error de validación en los datos ingresados',
    details,
  );
}

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(formatZodError(error));
        return;
      }
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(formatZodError(error));
        return;
      }
      next(error);
    }
  };
}

export function validateParams<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.validatedParams = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(formatZodError(error));
        return;
      }
      next(error);
    }
  };
}
