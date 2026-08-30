import type { Specialty } from '../schemas/common.js';

export interface Appointment {
  id: number;
  paciente: string;
  documento: string;
  especialidad: Specialty;
  fecha: string;
  hora: string;
  confirmado: boolean;
  medicoId: number;
  observaciones?: string;
}

export type CreateAppointmentInput = Omit<Appointment, 'id'>;
export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;
