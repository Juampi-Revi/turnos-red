import type { Turno } from '../models/Turno.js';
import type { TurnoCrudo } from '../models/TurnoCrudo.js';

function sanitizeSpaces(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function parseId(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(n) || n <= 0) {
    return null;
  }
  return n;
}

function normalizeFecha(raw: string): string | null {
  const value = raw.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

  if (iso.test(value)) {
    return value;
  }

  const match = value.match(dmy);
  if (!match) {
    return null;
  }

  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3];
  return `${year}-${month}-${day}`;
}

function normalizeHora(raw: string): string | null {
  const value = raw.trim().replace('.', ':');
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function normalizeConfirmado(raw: unknown): boolean | null {
  if (typeof raw === 'boolean') {
    return raw;
  }

  if (typeof raw === 'number') {
    if (raw === 1) return true;
    if (raw === 0) return false;
    return null;
  }

  if (typeof raw === 'string') {
    const v = raw.trim().toLowerCase();
    if (['si', 'sí', 'true', '1', 'yes'].includes(v)) return true;
    if (['no', 'false', '0'].includes(v)) return false;
  }

  return null;
}

/**
 * Transforma un registro crudo al modelo de dominio.
 * Devuelve null si no cumple la estructura mínima esperada.
 */
export function normalizarTurno(crudo: TurnoCrudo): Turno | null {
  const id = parseId(crudo.id);
  if (id === null) {
    return null;
  }

  if (typeof crudo.paciente !== 'string' || crudo.paciente.trim() === '') {
    return null;
  }

  if (crudo.documento === undefined || crudo.documento === null || crudo.documento === '') {
    return null;
  }

  if (typeof crudo.especialidad !== 'string' || crudo.especialidad.trim() === '') {
    return null;
  }

  if (typeof crudo.fecha !== 'string' || typeof crudo.hora !== 'string') {
    return null;
  }

  const fecha = normalizeFecha(crudo.fecha);
  const hora = normalizeHora(crudo.hora);
  const confirmado = normalizeConfirmado(crudo.confirmado);

  if (fecha === null || hora === null || confirmado === null) {
    return null;
  }

  const turno: Turno = {
    id,
    paciente: sanitizeSpaces(crudo.paciente),
    documento: String(crudo.documento).trim(),
    especialidad: sanitizeSpaces(crudo.especialidad).toUpperCase(),
    fecha,
    hora,
    confirmado,
  };

  if (typeof crudo.observaciones === 'string' && crudo.observaciones.trim() !== '') {
    turno.observaciones = sanitizeSpaces(crudo.observaciones);
  }

  return turno;
}

export function normalizarColeccion(crudos: TurnoCrudo[]): {
  aceptados: Turno[];
  rechazados: number;
} {
  const aceptados: Turno[] = [];
  let rechazados = 0;

  for (const crudo of crudos) {
    const turno = normalizarTurno(crudo);
    if (turno) {
      aceptados.push(turno);
    } else {
      rechazados += 1;
    }
  }

  return { aceptados, rechazados };
}
