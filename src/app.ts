import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import turnosRouter from './routes/turnosRoutes.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(env.projectRoot, 'public')));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'turnos-red' });
  });

  app.use('/turnos', turnosRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
  });

  return app;
}
