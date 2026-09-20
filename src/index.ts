import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import type { Appointment } from './models/Appointment.js';
import { loadAppointments } from './services/appointmentService.js';
import { loadDoctors } from './services/doctorService.js';
import { loadEspecialidades } from './services/especialidadesService.js';
import { loadProfesionales } from './services/profesionalesService.js';
import { InternalEvents, eventBus } from './services/eventBus.js';

async function bootstrap(): Promise<void> {
  await loadDoctors();
  await loadAppointments();
  await loadEspecialidades();
  await loadProfesionales();

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

  eventBus.on(InternalEvents.CREATED, (appointment: Appointment) => {
    io.emit('turno:nuevo', appointment);
  });

  eventBus.on(InternalEvents.UPDATED, (appointment: Appointment) => {
    io.emit('turno:actualizado', appointment);
  });

  eventBus.on(InternalEvents.DELETED, (appointment: Appointment) => {
    io.emit('turno:eliminado', appointment);
  });

  httpServer.listen(env.port, () => {
    console.log(`[TurnosRed] API escuchando en http://localhost:${env.port}`);
    console.log(`[TurnosRed] Cliente realtime: http://localhost:${env.port}/`);
    console.log(`[TurnosRed] Turnos: ${env.appointmentsPath}`);
    console.log(`[TurnosRed] Médicos: ${env.doctorsPath}`);
    console.log(`[TurnosRed] Especialidades: ${env.especialidadesPath}`);
    console.log(`[TurnosRed] Profesionales: ${env.profesionalesPath}`);
  });
}

bootstrap().catch((error) => {
  console.error('[TurnosRed] No se pudo iniciar el servidor:', error);
  process.exit(1);
});
