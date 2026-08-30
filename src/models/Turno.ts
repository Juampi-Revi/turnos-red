/**
 * Modelo de dominio: turno válido y normalizado usado por la aplicación.
 */
export interface Turno {
  id: number;
  paciente: string;
  documento: string;
  especialidad: string;
  /** Fecha en formato ISO local YYYY-MM-DD */
  fecha: string;
  /** Hora en formato HH:mm */
  hora: string;
  confirmado: boolean;
  observaciones?: string;
}

export type TurnoInput = Omit<Turno, 'id'> & { id?: number };
