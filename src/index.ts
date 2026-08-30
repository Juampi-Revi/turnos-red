import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { EventosInternos, eventBus } from './services/eventBus.js';
import { cargarTurnos } from './services/turnosService.js';
import type { Turno } from './models/Turno.js';

async function bootstrap(): Promise<void> {
  await cargarTurnos();

  const app = createApp();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Cliente conectado: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Cliente desconectado: ${socket.id}`);
    });
  });

  // Puente: eventos internos → WebSockets en tiempo real
  eventBus.on(EventosInternos.CREADO, (turno: Turno) => {
    io.emit('turno:nuevo', turno);
  });

  eventBus.on(EventosInternos.ACTUALIZADO, (turno: Turno) => {
    io.emit('turno:actualizado', turno);
  });

  eventBus.on(EventosInternos.ELIMINADO, (turno: Turno) => {
    io.emit('turno:eliminado', turno);
  });

  httpServer.listen(env.port, () => {
    console.log(`[TurnosRed] API escuchando en http://localhost:${env.port}`);
    console.log(`[TurnosRed] Cliente realtime: http://localhost:${env.port}/`);
    console.log(`[TurnosRed] Datos: ${env.dataPath}`);
  });
}

bootstrap().catch((error) => {
  console.error('[TurnosRed] No se pudo iniciar el servidor:', error);
  process.exit(1);
});
