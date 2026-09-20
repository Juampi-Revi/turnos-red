import type { Request, Response } from 'express';
import {
  createEspecialidad,
  deleteEspecialidad,
  getEspecialidadById,
  listEspecialidades,
  updateEspecialidad,
} from '../services/especialidadesService.js';

function parsePositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

export async function listEspecialidadesHandler(_req: Request, res: Response): Promise<Response> {
  let status = 200;

  try {
    const data = await listEspecialidades();
    return res.status(status).json({ status, data, total: data.length });
  } catch (error) {
    status = status === 200 ? 500 : status;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}

export async function getEspecialidadByIdHandler(req: Request, res: Response): Promise<Response> {
  let status = 200;

  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      status = 400;
      throw new Error('El id debe ser un entero positivo');
    }

    const especialidad = await getEspecialidadById(id);
    if (!especialidad) {
      status = 404;
      throw new Error(`No se encontró la especialidad con id ${id}`);
    }

    return res.status(status).json({ status, data: especialidad });
  } catch (error) {
    status = status === 200 ? 500 : status;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}

export async function createEspecialidadHandler(req: Request, res: Response): Promise<Response> {
  let status = 201;

  try {
    const body = req.body as Record<string, unknown>;

    if (!body || typeof body !== 'object') {
      status = 400;
      throw new Error('Body JSON inválido');
    }

    if (typeof body.nombre !== 'string' || body.nombre.trim() === '') {
      status = 400;
      throw new Error('El campo nombre es obligatorio y debe ser string');
    }

    if (typeof body.activa !== 'boolean') {
      status = 400;
      throw new Error('El campo activa es obligatorio y debe ser boolean');
    }

    if (body.descripcion !== undefined && typeof body.descripcion !== 'string') {
      status = 400;
      throw new Error('El campo descripcion debe ser string');
    }

    const especialidad = await createEspecialidad({
      nombre: body.nombre,
      activa: body.activa,
      ...(typeof body.descripcion === 'string' ? { descripcion: body.descripcion } : {}),
    });

    return res.status(status).json({
      status,
      data: especialidad,
      message: 'Especialidad creada',
    });
  } catch (error) {
    status = status === 201 ? 500 : status;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}

export async function updateEspecialidadHandler(req: Request, res: Response): Promise<Response> {
  let status = 200;

  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      status = 400;
      throw new Error('El id debe ser un entero positivo');
    }

    const body = req.body as Record<string, unknown>;
    if (!body || typeof body !== 'object') {
      status = 400;
      throw new Error('Body JSON inválido');
    }

    if (
      body.nombre !== undefined &&
      (typeof body.nombre !== 'string' || body.nombre.trim() === '')
    ) {
      status = 400;
      throw new Error('El campo nombre debe ser un string no vacío');
    }

    if (body.activa !== undefined && typeof body.activa !== 'boolean') {
      status = 400;
      throw new Error('El campo activa debe ser boolean');
    }

    if (body.descripcion !== undefined && typeof body.descripcion !== 'string') {
      status = 400;
      throw new Error('El campo descripcion debe ser string');
    }

    const especialidad = await updateEspecialidad(id, {
      ...(typeof body.nombre === 'string' ? { nombre: body.nombre } : {}),
      ...(typeof body.activa === 'boolean' ? { activa: body.activa } : {}),
      ...(typeof body.descripcion === 'string' ? { descripcion: body.descripcion } : {}),
    });

    if (!especialidad) {
      status = 404;
      throw new Error(`No se encontró la especialidad con id ${id}`);
    }

    return res.status(status).json({
      status,
      data: especialidad,
      message: 'Especialidad actualizada',
    });
  } catch (error) {
    status = status === 200 ? 500 : status;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}

export async function deleteEspecialidadHandler(req: Request, res: Response): Promise<Response> {
  let status = 200;

  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      status = 400;
      throw new Error('El id debe ser un entero positivo');
    }

    const deleted = await deleteEspecialidad(id);
    if (!deleted) {
      status = 404;
      throw new Error(`No se encontró la especialidad con id ${id}`);
    }

    return res.status(status).json({
      status,
      message: 'Especialidad eliminada',
    });
  } catch (error) {
    status = status === 200 ? 500 : status;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}
