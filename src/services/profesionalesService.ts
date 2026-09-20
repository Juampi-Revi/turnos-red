import { readFile, writeFile } from 'node:fs/promises';
import type {
  CreateProfesionalInput,
  Profesional,
  UpdateProfesionalInput,
} from '../models/Profesional.js';
import { env } from '../config/env.js';
import { getEspecialidadById } from './especialidadesService.js';

let profesionales: Profesional[] = [];
let loaded = false;

async function persist(): Promise<void> {
  await writeFile(env.profesionalesPath, JSON.stringify(profesionales, null, 2), 'utf8');
}

function ensureLoaded(): void {
  if (!loaded) {
    throw new Error('Los profesionales aún no fueron cargados');
  }
}

function isProfesional(value: unknown): value is Profesional {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === 'number' &&
    Number.isInteger(item.id) &&
    item.id > 0 &&
    typeof item.nombre === 'string' &&
    item.nombre.trim() !== '' &&
    typeof item.documento === 'string' &&
    item.documento.trim() !== '' &&
    typeof item.especialidadId === 'number' &&
    Number.isInteger(item.especialidadId) &&
    item.especialidadId > 0 &&
    typeof item.disponible === 'boolean'
  );
}

export async function loadProfesionales(): Promise<void> {
  const content = await readFile(env.profesionalesPath, 'utf8');
  const parsed: unknown = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error('El archivo de profesionales debe ser un arreglo');
  }

  const accepted: Profesional[] = [];
  let rejected = 0;

  for (const item of parsed) {
    if (isProfesional(item)) {
      accepted.push({
        id: item.id,
        nombre: item.nombre.trim(),
        documento: item.documento.trim(),
        especialidadId: item.especialidadId,
        disponible: item.disponible,
      });
    } else {
      rejected += 1;
    }
  }

  profesionales = accepted;
  loaded = true;

  console.log(
    `[TurnosRed] Profesionales cargados → aceptados: ${accepted.length}, rechazados: ${rejected}`,
  );

  await persist();
}

export async function listProfesionales(): Promise<Profesional[]> {
  ensureLoaded();
  return [...profesionales];
}

export async function getProfesionalById(id: number): Promise<Profesional | null> {
  ensureLoaded();
  return profesionales.find((item) => item.id === id) ?? null;
}

export async function createProfesional(input: CreateProfesionalInput): Promise<Profesional> {
  ensureLoaded();

  const especialidad = await getEspecialidadById(input.especialidadId);
  if (!especialidad) {
    throw new Error(`No existe la especialidad con id ${input.especialidadId}`);
  }

  if (profesionales.some((item) => item.documento === input.documento.trim())) {
    throw new Error('Ya existe un profesional con ese documento');
  }

  const profesional: Profesional = {
    id: nextId(),
    nombre: input.nombre.trim(),
    documento: String(input.documento).trim(),
    especialidadId: input.especialidadId,
    disponible: input.disponible,
  };

  profesionales.push(profesional);
  await persist();
  return profesional;
}

export async function updateProfesional(
  id: number,
  input: UpdateProfesionalInput,
): Promise<Profesional | null> {
  ensureLoaded();

  const index = profesionales.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const current = profesionales[index];
  const especialidadId = input.especialidadId ?? current.especialidadId;
  const especialidad = await getEspecialidadById(especialidadId);
  if (!especialidad) {
    throw new Error(`No existe la especialidad con id ${especialidadId}`);
  }

  const documento =
    input.documento !== undefined ? String(input.documento).trim() : current.documento;

  if (profesionales.some((item) => item.id !== id && item.documento === documento)) {
    throw new Error('Ya existe un profesional con ese documento');
  }

  const updated: Profesional = {
    ...current,
    ...input,
    id,
    nombre: input.nombre !== undefined ? input.nombre.trim() : current.nombre,
    documento,
    especialidadId,
    disponible: input.disponible ?? current.disponible,
  };

  profesionales[index] = updated;
  await persist();
  return updated;
}

export async function deleteProfesional(id: number): Promise<boolean> {
  ensureLoaded();

  const index = profesionales.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  profesionales.splice(index, 1);
  await persist();
  return true;
}

function nextId(): number {
  if (profesionales.length === 0) {
    return 1;
  }
  return Math.max(...profesionales.map((item) => item.id)) + 1;
}
