import type { Request, Response } from 'express';
import type { TurnoCrudo } from '../models/TurnoCrudo.js';
import {
  ValidationError,
  actualizarTurno,
  crearTurno,
  eliminarTurno,
  listarTurnos,
  obtenerTurnoPorId,
} from '../services/turnosService.js';

function parseIdParam(raw: string | string[] | undefined): number | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === undefined) {
    return null;
  }
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export function getTurnos(_req: Request, res: Response): void {
  try {
    const turnos = listarTurnos();
    res.status(200).json({ data: turnos, total: turnos.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al listar turnos' });
  }
}

export function getTurnoById(req: Request, res: Response): void {
  try {
    const id = parseIdParam(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'El id debe ser un entero positivo' });
      return;
    }

    const turno = obtenerTurnoPorId(id);
    if (!turno) {
      res.status(404).json({ error: `No se encontró el turno con id ${id}` });
      return;
    }

    res.status(200).json({ data: turno });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al obtener el turno' });
  }
}

export async function postTurno(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as TurnoCrudo;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Body JSON inválido' });
      return;
    }

    const turno = await crearTurno(body);
    res.status(201).json({ data: turno, message: 'Turno creado' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno al crear el turno' });
  }
}

export async function putTurno(req: Request, res: Response): Promise<void> {
  try {
    const id = parseIdParam(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'El id debe ser un entero positivo' });
      return;
    }

    const body = req.body as TurnoCrudo;
    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Body JSON inválido' });
      return;
    }

    const turno = await actualizarTurno(id, body);
    if (!turno) {
      res.status(404).json({ error: `No se encontró el turno con id ${id}` });
      return;
    }

    res.status(200).json({ data: turno, message: 'Turno actualizado' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Error interno al actualizar el turno' });
  }
}

export async function deleteTurno(req: Request, res: Response): Promise<void> {
  try {
    const id = parseIdParam(req.params.id);
    if (id === null) {
      res.status(400).json({ error: 'El id debe ser un entero positivo' });
      return;
    }

    const turno = await eliminarTurno(id);
    if (!turno) {
      res.status(404).json({ error: `No se encontró el turno con id ${id}` });
      return;
    }

    res.status(200).json({ data: turno, message: 'Turno eliminado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno al eliminar el turno' });
  }
}
