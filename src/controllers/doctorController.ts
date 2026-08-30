import type { NextFunction, Request, Response } from 'express';
import type { DoctorQuery } from '../schemas/doctor.schema.js';
import type { CreateDoctorBody, UpdateDoctorBody } from '../schemas/doctor.schema.js';
import { AppError, ErrorCodes } from '../errors/AppError.js';
import {
  createDoctor,
  deleteDoctor,
  getDoctorById,
  listDoctors,
  updateDoctor,
} from '../services/doctorService.js';

export function listDoctorsHandler(req: Request, res: Response): void {
  const filters = req.validatedQuery as DoctorQuery | undefined;
  const data = listDoctors(filters);
  res.status(200).json({ data, total: data.length });
}

export function getDoctorByIdHandler(req: Request, res: Response): void {
  const { id } = req.validatedParams as { id: number };
  const doctor = getDoctorById(id);

  if (!doctor) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, `No se encontró el médico con id ${id}`);
  }

  res.status(200).json({ data: doctor });
}

export async function createDoctorHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const body = req.validatedBody as CreateDoctorBody;
  const doctor = await createDoctor(body);
  res.status(201).json({ data: doctor, message: 'Médico creado' });
}

export async function updateDoctorHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const { id } = req.validatedParams as { id: number };
  const body = req.validatedBody as UpdateDoctorBody;
  const doctor = await updateDoctor(id, body);

  if (!doctor) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, `No se encontró el médico con id ${id}`);
  }

  res.status(200).json({ data: doctor, message: 'Médico actualizado' });
}

export async function deleteDoctorHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  const { id } = req.validatedParams as { id: number };
  const deleted = await deleteDoctor(id);

  if (!deleted) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, `No se encontró el médico con id ${id}`);
  }

  res.status(204).send();
}
