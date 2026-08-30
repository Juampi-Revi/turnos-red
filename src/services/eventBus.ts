import { EventEmitter } from 'node:events';

/**
 * Bus de eventos internos desacoplado del transporte HTTP/WebSocket.
 */
export const eventBus = new EventEmitter();

export const EventosInternos = {
  CREADO: 'turno:creado',
  ACTUALIZADO: 'turno:actualizado',
  ELIMINADO: 'turno:eliminado',
} as const;

export type NombreEventoInterno = (typeof EventosInternos)[keyof typeof EventosInternos];
