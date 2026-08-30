import { Router } from 'express';
import {
  createAppointmentHandler,
  deleteAppointmentHandler,
  getAppointmentByIdHandler,
  listAppointmentsHandler,
  updateAppointmentHandler,
} from '../controllers/appointmentController.js';
import { routeHandler } from '../middleware/routeHandler.js';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.js';
import {
  appointmentQuerySchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from '../schemas/appointment.schema.js';
import { idParamSchema } from '../schemas/params.schema.js';

const appointmentRouter = Router();

appointmentRouter.get(
  '/',
  validateQuery(appointmentQuerySchema),
  routeHandler(listAppointmentsHandler),
);
appointmentRouter.get(
  '/:id',
  validateParams(idParamSchema),
  routeHandler(getAppointmentByIdHandler),
);
appointmentRouter.post(
  '/',
  validateBody(createAppointmentSchema),
  routeHandler(createAppointmentHandler),
);
appointmentRouter.put(
  '/:id',
  validateParams(idParamSchema),
  validateBody(updateAppointmentSchema),
  routeHandler(updateAppointmentHandler),
);
appointmentRouter.delete(
  '/:id',
  validateParams(idParamSchema),
  routeHandler(deleteAppointmentHandler),
);

export default appointmentRouter;
