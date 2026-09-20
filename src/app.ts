import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { notFound } from './controllers/generalController.js';
import { errorHandler } from './middleware/errorHandler.js';
import appointmentRouter from './routes/appointmentRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import especialidadesRouter from './routes/especialidadesRoutes.js';
import generalRouter from './routes/generalRoutes.js';
import profesionalesRouter from './routes/profesionalesRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'turnos-red' });
  });

  // Hello World / bienvenida (GET /) — antes de static para no servir index.html
  app.use('/', generalRouter);

  // Monitor Socket.IO disponible en /index.html
  app.use(express.static(path.join(env.projectRoot, 'public')));

  app.use('/turnos', appointmentRouter);
  app.use('/medicos', doctorRouter);
  app.use('/especialidades', especialidadesRouter);
  app.use('/profesionales', profesionalesRouter);

  // 404 desde generalController (requisito de la nueva actividad)
  app.use(notFound);
  // Mantener errorHandler para /turnos y /medicos (AppError / Zod)
  app.use(errorHandler);

  return app;
}
