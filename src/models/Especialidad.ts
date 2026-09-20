export interface Especialidad {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

export type CreateEspecialidadInput = Omit<Especialidad, 'id'>;
export type UpdateEspecialidadInput = Partial<CreateEspecialidadInput>;
