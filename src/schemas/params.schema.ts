import { z } from 'zod';
import { positiveIntSchema } from '../schemas/common.js';

export const idParamSchema = z.object({
  id: positiveIntSchema,
});
