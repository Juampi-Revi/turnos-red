import { z } from 'zod';
import { normalizeDateInput, normalizeTimeInput } from '../utils/dateTime.js';

export const SPECIALTIES = ['Clínica médica', 'Pediatría', 'Odontología', 'Nutrición'] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export const specialtySchema = z
  .string()
  .trim()
  .min(1, 'especialidad es obligatoria')
  .refine(
    (value) => SPECIALTIES.some((specialty) => specialty.toLowerCase() === value.toLowerCase()),
    { message: 'especialidad debe ser Clínica médica, Pediatría, Odontología o Nutrición' },
  )
  .transform(
    (value) =>
      SPECIALTIES.find((specialty) => specialty.toLowerCase() === value.toLowerCase()) as Specialty,
  );

export const documentSchema = z
  .union([z.string(), z.number()])
  .transform((value) => String(value).trim())
  .refine((value) => value.length > 0, { message: 'documento es obligatorio' });

export const dateInputSchema = z
  .string()
  .trim()
  .min(1, 'fecha es obligatoria')
  .transform((value, ctx) => {
    const normalized = normalizeDateInput(value);
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'fecha inválida (use DD/MM/YYYY o YYYY-MM-DD)' });
      return z.NEVER;
    }
    return normalized;
  });

export const timeInputSchema = z
  .string()
  .trim()
  .min(1, 'hora es obligatoria')
  .transform((value, ctx) => {
    const normalized = normalizeTimeInput(value);
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'hora inválida (use HH:mm o HH.mm)' });
      return z.NEVER;
    }
    return normalized;
  });

export const positiveIntSchema = z.coerce
  .number()
  .int('debe ser un entero')
  .positive('debe ser un entero positivo');

export const booleanInputSchema = z.preprocess(
  (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['si', 'sí', 'true', '1', 'yes'].includes(normalized)) return true;
      if (['no', 'false', '0'].includes(normalized)) return false;
    }
    return value;
  },
  z.boolean({ message: 'confirmado debe ser booleano o si/no' }),
);

export const booleanQuerySchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'si', 'sí', 'yes'].includes(normalized)) return true;
      if (['false', '0', 'no'].includes(normalized)) return false;
    }
    return value;
  },
  z.boolean({ message: 'disponible debe ser true o false' }),
);

export const specialtyQuerySchema = z
  .string()
  .trim()
  .min(1)
  .transform((value, ctx) => {
    const normalizedKey = value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

    const aliases: Record<string, Specialty> = {
      'clinica medica': 'Clínica médica',
      pediatria: 'Pediatría',
      odontologia: 'Odontología',
      nutricion: 'Nutrición',
    };

    const fromAlias = aliases[normalizedKey];
    if (fromAlias) {
      return fromAlias;
    }

    const fromList = SPECIALTIES.find(
      (specialty) =>
        specialty.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '') === normalizedKey,
    );

    if (!fromList) {
      ctx.addIssue({
        code: 'custom',
        message: 'especialidad debe ser Clínica médica, Pediatría, Odontología o Nutrición',
      });
      return z.NEVER;
    }

    return fromList;
  });
