import { readFile, writeFile } from 'node:fs/promises';
import type {
  Appointment,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../models/Appointment.js';
import { env } from '../config/env.js';
import { AppError, ErrorCodes } from '../errors/AppError.js';
import { appointmentRecordSchema, type AppointmentQuery } from '../schemas/appointment.schema.js';
import { InternalEvents, eventBus } from './eventBus.js';
import { getDoctorById } from './doctorService.js';

let appointments: Appointment[] = [];
let loaded = false;

async function persist(): Promise<void> {
  await writeFile(env.appointmentsPath, JSON.stringify(appointments, null, 2), 'utf8');
}

function ensureLoaded(): void {
  if (!loaded) {
    throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Los turnos aún no fueron cargados');
  }
}

function assertDoctorExists(medicoId: number): void {
  const doctor = getDoctorById(medicoId);
  if (!doctor) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, `No se encontró el médico con id ${medicoId}`, [
      { field: 'medicoId', message: 'médico no encontrado' },
    ]);
  }
}

export async function loadAppointments(): Promise<void> {
  const content = await readFile(env.appointmentsPath, 'utf8');
  const parsed: unknown = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new AppError(
      500,
      ErrorCodes.INTERNAL_ERROR,
      'El archivo de turnos debe contener un arreglo',
    );
  }

  const accepted: Appointment[] = [];
  let rejected = 0;

  for (const item of parsed) {
    const result = appointmentRecordSchema.safeParse(item);
    if (result.success) {
      accepted.push(result.data);
    } else {
      rejected += 1;
    }
  }

  appointments = accepted;
  loaded = true;

  console.log(
    `[TurnosRed] Turnos cargados → aceptados: ${accepted.length}, rechazados: ${rejected}`,
  );

  await persist();
}

export function listAppointments(filters?: AppointmentQuery): Appointment[] {
  ensureLoaded();

  return appointments.filter((appointment) => {
    if (filters?.especialidad && appointment.especialidad !== filters.especialidad) {
      return false;
    }
    if (filters?.fecha && appointment.fecha !== filters.fecha) {
      return false;
    }
    if (filters?.medicoId !== undefined && appointment.medicoId !== filters.medicoId) {
      return false;
    }
    return true;
  });
}

export function getAppointmentById(id: number): Appointment | undefined {
  ensureLoaded();
  return appointments.find((appointment) => appointment.id === id);
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  ensureLoaded();
  assertDoctorExists(input.medicoId);

  const appointment: Appointment = {
    id: nextId(),
    ...input,
  };

  appointments.push(appointment);
  await persist();
  eventBus.emit(InternalEvents.CREATED, appointment);
  return appointment;
}

export async function updateAppointment(
  id: number,
  input: UpdateAppointmentInput,
): Promise<Appointment | null> {
  ensureLoaded();

  const index = appointments.findIndex((appointment) => appointment.id === id);
  if (index === -1) {
    return null;
  }

  const current = appointments[index];
  const medicoId = input.medicoId ?? current.medicoId;
  assertDoctorExists(medicoId);

  const updated: Appointment = {
    ...current,
    ...input,
    id,
    medicoId,
  };

  appointments[index] = updated;
  await persist();
  eventBus.emit(InternalEvents.UPDATED, updated);
  return updated;
}

export async function deleteAppointment(id: number): Promise<boolean> {
  ensureLoaded();

  const index = appointments.findIndex((appointment) => appointment.id === id);
  if (index === -1) {
    return false;
  }

  const [deleted] = appointments.splice(index, 1);
  await persist();
  eventBus.emit(InternalEvents.DELETED, deleted);
  return true;
}

function nextId(): number {
  if (appointments.length === 0) {
    return 1;
  }
  return Math.max(...appointments.map((appointment) => appointment.id)) + 1;
}
