import { EventEmitter } from 'node:events';

/**
 * Internal event bus decoupled from HTTP/WebSocket transport.
 */
export const eventBus = new EventEmitter();

export const InternalEvents = {
  CREATED: 'appointment:created',
  UPDATED: 'appointment:updated',
  DELETED: 'appointment:deleted',
} as const;

export type InternalEventName = (typeof InternalEvents)[keyof typeof InternalEvents];
