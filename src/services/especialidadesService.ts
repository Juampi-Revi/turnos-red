import { readFile, writeFile } from 'node:fs/promises';
import type {
  CreateEspecialidadInput,
  Especialidad,
  UpdateEspecialidadInput,
} from '../models/Especialidad.js';
import { env } from '../config/env.js';

let especialidades: Especialidad[] = [];
let loaded = false;

async function persist(): Promise<void> {
  await writeFile(env.especialidadesPath, JSON.stringify(especialidades, null, 2), 'utf8');
}

function ensureLoaded(): void {
  if (!loaded) {
    throw new Error('Las especialidades aún no fueron cargadas');
  }
}

function isEspecialidad(value: unknown): value is Especialidad {
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
    typeof item.activa === 'boolean' &&
    (item.descripcion === undefined || typeof item.descripcion === 'string')
  );
}

export async function loadEspecialidades(): Promise<void> {
  const content = await readFile(env.especialidadesPath, 'utf8');
  const parsed: unknown = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error('El archivo de especialidades debe ser un arreglo');
  }

  const accepted: Especialidad[] = [];
  let rejected = 0;

  for (const item of parsed) {
    if (isEspecialidad(item)) {
      accepted.push({
        id: item.id,
        nombre: item.nombre.trim(),
        activa: item.activa,
        ...(item.descripcion !== undefined ? { descripcion: String(item.descripcion).trim() } : {}),
      });
    } else {
      rejected += 1;
    }
  }

  especialidades = accepted;
  loaded = true;

  console.log(
    `[TurnosRed] Especialidades cargadas → aceptadas: ${accepted.length}, rechazadas: ${rejected}`,
  );

  await persist();
}

export async function listEspecialidades(): Promise<Especialidad[]> {
  ensureLoaded();
  return [...especialidades];
}

export async function getEspecialidadById(id: number): Promise<Especialidad | null> {
  ensureLoaded();
  return especialidades.find((item) => item.id === id) ?? null;
}

export async function createEspecialidad(input: CreateEspecialidadInput): Promise<Especialidad> {
  ensureLoaded();

  const especialidad: Especialidad = {
    id: nextId(),
    nombre: input.nombre.trim(),
    activa: input.activa,
    ...(input.descripcion !== undefined && input.descripcion.trim() !== ''
      ? { descripcion: input.descripcion.trim() }
      : {}),
  };

  especialidades.push(especialidad);
  await persist();
  return especialidad;
}

export async function updateEspecialidad(
  id: number,
  input: UpdateEspecialidadInput,
): Promise<Especialidad | null> {
  ensureLoaded();

  const index = especialidades.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }

  const current = especialidades[index];
  const updated: Especialidad = {
    ...current,
    ...input,
    id,
    nombre: input.nombre !== undefined ? input.nombre.trim() : current.nombre,
    ...(input.descripcion !== undefined
      ? {
          descripcion: input.descripcion.trim() === '' ? undefined : input.descripcion.trim(),
        }
      : {}),
  };

  especialidades[index] = updated;
  await persist();
  return updated;
}

export async function deleteEspecialidad(id: number): Promise<boolean> {
  ensureLoaded();

  const index = especialidades.findIndex((item) => item.id === id);
  if (index === -1) {
    return false;
  }

  especialidades.splice(index, 1);
  await persist();
  return true;
}

function nextId(): number {
  if (especialidades.length === 0) {
    return 1;
  }
  return Math.max(...especialidades.map((item) => item.id)) + 1;
}
