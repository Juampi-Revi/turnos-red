import type { NextFunction, Request, Response } from 'express';
import type { AppointmentQuery } from '../schemas/appointment.schema.js';
import type {
  CreateAppointmentBody,
  UpdateAppointmentBody,
} from '../schemas/appointment.schema.js';
import { AppError, ErrorCodes } from '../errors/AppError.js';
import {
  createAppointment,
  deleteAppointment,
  getAppointmentById,
  listAppointments,
  updateAppointment,
} from '../services/appointmentService.js';

export function listAppointmentsHandler(req: Request, res: Response): void {
  const filters = req.validatedQuery as AppointmentQuery | undefined;
  const data = listAppointments(filters);
  res.status(200).json({ data, total: data.length });
}

export function getAppointmentByIdHandler(req: Request, res: Response): void {
  const { id } = req.validatedParams as { id: number };
  const appointment = getAppointmentById(id);

  if (!appointment) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, `No se encontró el turno con id ${id}`);
  }

  res.status(200).json({ data: appointment });
}

export async function createAppointmentHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const body = req.validatedBody as CreateAppointmentBody;
  const appointment = await createAppointment(body);
  res.status(201).json({ data: appointment, message: 'Turno creado' });
}

export async function updateAppointmentHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const { id } = req.validatedParams as { id: number };
  const body = req.validatedBody as UpdateAppointmentBody;
  const appointment = await updateAppointment(id, body);

  if (!appointment) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, `No se encontró el turno con id ${id}`);
  }

  res.status(200).json({ data: appointment, message: 'Turno actualizado' });
}

export async function deleteAppointmentHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const { id } = req.validatedParams as { id: number };
  const deleted = await deleteAppointment(id);

  if (!deleted) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, `No se encontró el turno con id ${id}`);
  }

  res.status(204).send();
}
