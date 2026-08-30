import { readFile, writeFile } from 'node:fs/promises';
import type { Doctor, CreateDoctorInput, UpdateDoctorInput } from '../models/Doctor.js';
import { env } from '../config/env.js';
import { AppError, ErrorCodes } from '../errors/AppError.js';
import { doctorRecordSchema } from '../schemas/doctor.schema.js';
import type { DoctorQuery } from '../schemas/doctor.schema.js';

let doctors: Doctor[] = [];
let loaded = false;

async function persist(): Promise<void> {
  await writeFile(env.doctorsPath, JSON.stringify(doctors, null, 2), 'utf8');
}

function ensureLoaded(): void {
  if (!loaded) {
    throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Los médicos aún no fueron cargados');
  }
}

export async function loadDoctors(): Promise<void> {
  const content = await readFile(env.doctorsPath, 'utf8');
  const parsed: unknown = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new AppError(500, ErrorCodes.INTERNAL_ERROR, 'El archivo de médicos debe ser un arreglo');
  }

  const accepted: Doctor[] = [];
  let rejected = 0;

  for (const item of parsed) {
    const result = doctorRecordSchema.safeParse(item);
    if (result.success) {
      accepted.push(result.data);
    } else {
      rejected += 1;
    }
  }

  doctors = accepted;
  loaded = true;

  console.log(
    `[TurnosRed] Médicos cargados → aceptados: ${accepted.length}, rechazados: ${rejected}`,
  );

  await persist();
}

export function listDoctors(filters?: DoctorQuery): Doctor[] {
  ensureLoaded();

  return doctors.filter((doctor) => {
    if (filters?.especialidad && doctor.especialidad !== filters.especialidad) {
      return false;
    }
    if (filters?.disponible !== undefined && doctor.disponible !== filters.disponible) {
      return false;
    }
    return true;
  });
}

export function getDoctorById(id: number): Doctor | undefined {
  ensureLoaded();
  return doctors.find((doctor) => doctor.id === id);
}

export async function createDoctor(input: CreateDoctorInput): Promise<Doctor> {
  ensureLoaded();

  const doctor: Doctor = {
    id: nextId(),
    ...input,
  };

  if (doctors.some((item) => item.documento === doctor.documento)) {
    throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Ya existe un médico con ese documento', [
      { field: 'documento', message: 'documento duplicado' },
    ]);
  }

  doctors.push(doctor);
  await persist();
  return doctor;
}

export async function updateDoctor(id: number, input: UpdateDoctorInput): Promise<Doctor | null> {
  ensureLoaded();

  const index = doctors.findIndex((doctor) => doctor.id === id);
  if (index === -1) {
    return null;
  }

  const current = doctors[index];
  const updated: Doctor = {
    ...current,
    ...input,
    id,
  };

  if (doctors.some((doctor) => doctor.id !== id && doctor.documento === updated.documento)) {
    throw new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Ya existe un médico con ese documento', [
      { field: 'documento', message: 'documento duplicado' },
    ]);
  }

  doctors[index] = updated;
  await persist();
  return updated;
}

export async function deleteDoctor(id: number): Promise<boolean> {
  ensureLoaded();

  const index = doctors.findIndex((doctor) => doctor.id === id);
  if (index === -1) {
    return false;
  }

  doctors.splice(index, 1);
  await persist();
  return true;
}

function nextId(): number {
  if (doctors.length === 0) {
    return 1;
  }
  return Math.max(...doctors.map((doctor) => doctor.id)) + 1;
}
