import type { NextFunction, Request, Response, RequestHandler } from 'express';

type Handler = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

export function routeHandler(handler: Handler): RequestHandler {
  return (req, res, next) => {
    try {
      const result = handler(req, res, next);
      if (result instanceof Promise) {
        result.catch(next);
      }
    } catch (error) {
      next(error);
    }
  };
}
