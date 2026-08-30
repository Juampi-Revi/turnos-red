import type { Specialty } from '../schemas/common.js';

export interface Doctor {
  id: number;
  nombre: string;
  documento: string;
  especialidad: Specialty;
  disponible: boolean;
}

export type CreateDoctorInput = Omit<Doctor, 'id'>;
export type UpdateDoctorInput = Partial<CreateDoctorInput>;
