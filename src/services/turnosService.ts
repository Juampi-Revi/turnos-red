import { readFile, writeFile } from 'node:fs/promises';
import type { Turno, TurnoInput } from '../models/Turno.js';
import type { TurnoCrudo } from '../models/TurnoCrudo.js';
import { env } from '../config/env.js';
import { normalizarColeccion, normalizarTurno } from '../utils/normalizeTurno.js';
import { FS_CALLBACKS_VS_PROMISES } from '../utils/fsCallbacksExample.js';
import { EventosInternos, eventBus } from './eventBus.js';

void FS_CALLBACKS_VS_PROMISES;

let turnos: Turno[] = [];
let loaded = false;

async function persistir(): Promise<void> {
  await writeFile(env.dataPath, JSON.stringify(turnos, null, 2), 'utf8');
}

export async function cargarTurnos(): Promise<void> {
  try {
    const contenido = await readFile(env.dataPath, 'utf8');
    const parsed: unknown = JSON.parse(contenido);

    if (!Array.isArray(parsed)) {
      throw new Error('El archivo de turnos debe contener un arreglo JSON');
    }

    const { aceptados, rechazados } = normalizarColeccion(parsed as TurnoCrudo[]);
    turnos = aceptados;
    loaded = true;

    console.log(
      `[TurnosRed] Carga completada → aceptados: ${aceptados.length}, rechazados: ${rechazados}`,
    );

    // Persistimos ya normalizados para mantener consistencia en disco.
    await persistir();
  } catch (error) {
    loaded = false;
    console.error('[TurnosRed] Error al leer/procesar el archivo de turnos:', error);
    throw error;
  }
}

function asegurarCargado(): void {
  if (!loaded) {
    throw new Error('Los turnos aún no fueron cargados en memoria');
  }
}

export function listarTurnos(): Turno[] {
  asegurarCargado();
  return [...turnos];
}

export function obtenerTurnoPorId(id: number): Turno | undefined {
  asegurarCargado();
  return turnos.find((t) => t.id === id);
}

export async function crearTurno(input: TurnoCrudo | TurnoInput): Promise<Turno> {
  asegurarCargado();

  const payload: TurnoCrudo = {
    ...input,
    id: input.id ?? nextId(),
  };

  const turno = normalizarTurno(payload);
  if (!turno) {
    throw new ValidationError('El cuerpo no cumple la estructura mínima de un turno válido');
  }

  if (turnos.some((t) => t.id === turno.id)) {
    throw new ValidationError(`Ya existe un turno con id ${turno.id}`);
  }

  turnos.push(turno);
  await persistir();
  eventBus.emit(EventosInternos.CREADO, turno);
  return turno;
}

export async function actualizarTurno(id: number, input: TurnoCrudo): Promise<Turno | null> {
  asegurarCargado();

  const index = turnos.findIndex((t) => t.id === id);
  if (index === -1) {
    return null;
  }

  const actual = turnos[index];
  const payload: TurnoCrudo = {
    id,
    paciente: input.paciente ?? actual.paciente,
    documento: input.documento ?? actual.documento,
    especialidad: input.especialidad ?? actual.especialidad,
    fecha: input.fecha ?? actual.fecha,
    hora: input.hora ?? actual.hora,
    confirmado: input.confirmado ?? actual.confirmado,
    observaciones: input.observaciones !== undefined ? input.observaciones : actual.observaciones,
  };

  const turno = normalizarTurno(payload);
  if (!turno) {
    throw new ValidationError('Los datos de actualización no son válidos');
  }

  turnos[index] = turno;
  await persistir();
  eventBus.emit(EventosInternos.ACTUALIZADO, turno);
  return turno;
}

export async function eliminarTurno(id: number): Promise<Turno | null> {
  asegurarCargado();

  const index = turnos.findIndex((t) => t.id === id);
  if (index === -1) {
    return null;
  }

  const [eliminado] = turnos.splice(index, 1);
  await persistir();
  eventBus.emit(EventosInternos.ELIMINADO, eliminado);
  return eliminado;
}

function nextId(): number {
  if (turnos.length === 0) {
    return 1;
  }
  return Math.max(...turnos.map((t) => t.id)) + 1;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
