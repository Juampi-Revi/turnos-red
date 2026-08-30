import { z } from 'zod';
import {
  booleanInputSchema,
  booleanQuerySchema,
  documentSchema,
  positiveIntSchema,
  specialtyQuerySchema,
  specialtySchema,
} from './common.js';

export const createDoctorSchema = z.object({
  nombre: z.string().trim().min(1, 'nombre es obligatorio'),
  documento: documentSchema,
  especialidad: specialtySchema,
  disponible: booleanInputSchema.default(true),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export const doctorRecordSchema = createDoctorSchema.extend({
  id: positiveIntSchema,
});

export const doctorQuerySchema = z.object({
  especialidad: specialtyQuerySchema.optional(),
  disponible: booleanQuerySchema.optional(),
});

export type CreateDoctorBody = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorBody = z.infer<typeof updateDoctorSchema>;
export type DoctorQuery = z.infer<typeof doctorQuerySchema>;
