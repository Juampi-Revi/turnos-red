export interface Profesional {
  id: number;
  nombre: string;
  documento: string;
  especialidadId: number;
  disponible: boolean;
}

export type CreateProfesionalInput = Omit<Profesional, 'id'>;
export type UpdateProfesionalInput = Partial<CreateProfesionalInput>;
