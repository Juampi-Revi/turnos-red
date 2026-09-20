import type { Request, Response } from 'express';

export async function welcome(_req: Request, res: Response): Promise<Response> {
  let status = 200;

  try {
    return res.status(status).json({
      status,
      message: 'Bienvenido a TurnosRed API',
      service: 'turnos-red',
      version: '2.0.0',
      endpoints: {
        health: '/health',
        turnos: '/turnos',
        medicos: '/medicos',
        especialidades: '/especialidades',
        profesionales: '/profesionales',
      },
    });
  } catch (error) {
    status = 500;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}

export async function notFound(_req: Request, res: Response): Promise<Response> {
  let status = 404;

  try {
    return res.status(status).json({
      status,
      message: 'Ruta no encontrada',
    });
  } catch (error) {
    status = 500;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}
