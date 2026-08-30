/**
 * Representa un registro heterogéneo tal como llega desde las sedes (JSON crudo).
 * Los tipos son amplios a propósito: cada centro envía formatos inconsistentes.
 */
export interface TurnoCrudo {
  id?: string | number;
  paciente?: string;
  documento?: string | number;
  especialidad?: string;
  fecha?: string;
  hora?: string;
  confirmado?: string | boolean | number;
  observaciones?: string;
  [key: string]: unknown;
}
