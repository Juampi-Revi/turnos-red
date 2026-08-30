import { Router } from 'express';
import {
  createDoctorHandler,
  deleteDoctorHandler,
  getDoctorByIdHandler,
  listDoctorsHandler,
  updateDoctorHandler,
} from '../controllers/doctorController.js';
import { routeHandler } from '../middleware/routeHandler.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import {
  createDoctorSchema,
  doctorQuerySchema,
  updateDoctorSchema,
} from '../schemas/doctor.schema.js';
import { idParamSchema } from '../schemas/params.schema.js';

const doctorRouter = Router();

doctorRouter.get('/', validateQuery(doctorQuerySchema), routeHandler(listDoctorsHandler));
doctorRouter.get('/:id', validateParams(idParamSchema), routeHandler(getDoctorByIdHandler));
doctorRouter.post('/', validateBody(createDoctorSchema), routeHandler(createDoctorHandler));
doctorRouter.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateDoctorSchema),
  routeHandler(updateDoctorHandler),
);
doctorRouter.delete('/:id', validateParams(idParamSchema), routeHandler(deleteDoctorHandler));

export default doctorRouter;
