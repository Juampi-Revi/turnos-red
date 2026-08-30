import { z } from 'zod';
import { normalizeDateInput } from '../utils/dateTime.js';
import {
  booleanInputSchema,
  dateInputSchema,
  documentSchema,
  positiveIntSchema,
  specialtyQuerySchema,
  specialtySchema,
  timeInputSchema,
} from './common.js';

export const createAppointmentSchema = z.object({
  paciente: z.string().trim().min(1, 'paciente es obligatorio'),
  documento: documentSchema,
  especialidad: specialtySchema,
  fecha: dateInputSchema,
  hora: timeInputSchema,
  confirmado: booleanInputSchema,
  medicoId: positiveIntSchema,
  observaciones: z.string().trim().optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const appointmentRecordSchema = createAppointmentSchema.extend({
  id: positiveIntSchema,
});

export const appointmentQuerySchema = z.object({
  especialidad: specialtyQuerySchema.optional(),
  fecha: z
    .string()
    .trim()
    .optional()
    .transform((value, ctx) => {
      if (!value) return undefined;
      const normalized = normalizeDateInput(value);
      if (!normalized) {
        ctx.addIssue({ code: 'custom', message: 'fecha de filtro inválida' });
        return z.NEVER;
      }
      return normalized;
    }),
  medicoId: positiveIntSchema.optional(),
});

export type CreateAppointmentBody = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentBody = z.infer<typeof updateAppointmentSchema>;
export type AppointmentQuery = z.infer<typeof appointmentQuerySchema>;
