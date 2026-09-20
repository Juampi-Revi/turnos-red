import type { Request, Response } from 'express';
import {
  createProfesional,
  deleteProfesional,
  getProfesionalById,
  listProfesionales,
  updateProfesional,
} from '../services/profesionalesService.js';

function parsePositiveInt(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

function parseBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'si', 'sí', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
  }
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return null;
}

export async function listProfesionalesHandler(_req: Request, res: Response): Promise<Response> {
  let status = 200;

  try {
    const data = await listProfesionales();
    return res.status(status).json({ status, data, total: data.length });
  } catch (error) {
    status = status === 200 ? 500 : status;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}

export async function getProfesionalByIdHandler(req: Request, res: Response): Promise<Response> {
  let status = 200;

  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      status = 400;
      throw new Error('El id debe ser un entero positivo');
    }

    const profesional = await getProfesionalById(id);
    if (!profesional) {
      status = 404;
      throw new Error(`No se encontró el profesional con id ${id}`);
    }

    return res.status(status).json({ status, data: profesional });
  } catch (error) {
    status = status === 200 ? 500 : status;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}

export async function createProfesionalHandler(req: Request, res: Response): Promise<Response> {
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

    if (
      (typeof body.documento !== 'string' && typeof body.documento !== 'number') ||
      String(body.documento).trim() === ''
    ) {
      status = 400;
      throw new Error('El campo documento es obligatorio');
    }

    const especialidadId = parsePositiveInt(body.especialidadId);
    if (especialidadId === null) {
      status = 400;
      throw new Error('El campo especialidadId debe ser un entero positivo');
    }

    const disponible = parseBoolean(body.disponible);
    if (disponible === null) {
      status = 400;
      throw new Error('El campo disponible es obligatorio y debe ser boolean');
    }

    const profesional = await createProfesional({
      nombre: body.nombre,
      documento: String(body.documento),
      especialidadId,
      disponible,
    });

    return res.status(status).json({
      status,
      data: profesional,
      message: 'Profesional creado',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';

    if (status === 201) {
      if (
        message.includes('No existe la especialidad') ||
        message.includes('Ya existe un profesional')
      ) {
        status = 400;
      } else {
        status = 500;
      }
    }

    return res.status(status).json({ status, message });
  }
}

export async function updateProfesionalHandler(req: Request, res: Response): Promise<Response> {
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

    if (
      body.documento !== undefined &&
      ((typeof body.documento !== 'string' && typeof body.documento !== 'number') ||
        String(body.documento).trim() === '')
    ) {
      status = 400;
      throw new Error('El campo documento es inválido');
    }

    let especialidadId: number | undefined;
    if (body.especialidadId !== undefined) {
      const parsed = parsePositiveInt(body.especialidadId);
      if (parsed === null) {
        status = 400;
        throw new Error('El campo especialidadId debe ser un entero positivo');
      }
      especialidadId = parsed;
    }

    let disponible: boolean | undefined;
    if (body.disponible !== undefined) {
      const parsed = parseBoolean(body.disponible);
      if (parsed === null) {
        status = 400;
        throw new Error('El campo disponible debe ser boolean');
      }
      disponible = parsed;
    }

    const profesional = await updateProfesional(id, {
      ...(typeof body.nombre === 'string' ? { nombre: body.nombre } : {}),
      ...(body.documento !== undefined ? { documento: String(body.documento) } : {}),
      ...(especialidadId !== undefined ? { especialidadId } : {}),
      ...(disponible !== undefined ? { disponible } : {}),
    });

    if (!profesional) {
      status = 404;
      throw new Error(`No se encontró el profesional con id ${id}`);
    }

    return res.status(status).json({
      status,
      data: profesional,
      message: 'Profesional actualizado',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';

    if (status === 200) {
      if (
        message.includes('No existe la especialidad') ||
        message.includes('Ya existe un profesional')
      ) {
        status = 400;
      } else {
        status = 500;
      }
    }

    return res.status(status).json({ status, message });
  }
}

export async function deleteProfesionalHandler(req: Request, res: Response): Promise<Response> {
  let status = 200;

  try {
    const id = parsePositiveInt(req.params.id);
    if (id === null) {
      status = 400;
      throw new Error('El id debe ser un entero positivo');
    }

    const deleted = await deleteProfesional(id);
    if (!deleted) {
      status = 404;
      throw new Error(`No se encontró el profesional con id ${id}`);
    }

    return res.status(status).json({
      status,
      message: 'Profesional eliminado',
    });
  } catch (error) {
    status = status === 200 ? 500 : status;
    return res.status(status).json({
      status,
      message: error instanceof Error ? error.message : 'Error interno del servidor',
    });
  }
}
