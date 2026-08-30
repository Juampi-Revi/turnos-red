import type { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      validatedBody?: unknown;
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {};
