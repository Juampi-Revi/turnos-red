import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import appointmentRouter from './routes/appointmentRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(env.projectRoot, 'public')));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'turnos-red' });
  });

  app.use('/turnos', appointmentRouter);
  app.use('/medicos', doctorRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
