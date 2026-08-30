/**
 * Ejemplo comparativo: lectura con callbacks (node:fs) vs promesas (node:fs/promises).
 *
 * Justificación del uso de promesas / async-await en este proyecto:
 * - Evita el "callback hell" al encadenar lectura → parseo → normalización → persistencia.
 * - Los errores se manejan de forma lineal con try...catch en lugar de chequear `err` en cada callback.
 * - Se integra de forma natural con Express async y con Socket.IO.
 *
 * Ejemplo ilustrativo (no se ejecuta en producción):
 *
 * ```ts
 * import fs from 'node:fs';
 *
 * fs.readFile('./data/turnos.json', 'utf8', (err, data) => {
 *   if (err) {
 *     console.error('Error con callback:', err);
 *     return;
 *   }
 *   try {
 *     const turnos = JSON.parse(data);
 *     console.log('OK (callback):', turnos.length);
 *   } catch (parseError) {
 *     console.error('JSON inválido:', parseError);
 *   }
 * });
 * ```
 *
 * Equivalente con promesas (estilo usado en turnosService):
 *
 * ```ts
 * import { readFile } from 'node:fs/promises';
 *
 * try {
 *   const data = await readFile('./data/turnos.json', 'utf8');
 *   const turnos = JSON.parse(data);
 *   console.log('OK (promesa):', turnos.length);
 * } catch (error) {
 *   console.error('Error con promesa:', error);
 * }
 * ```
 */

export const FS_CALLBACKS_VS_PROMISES =
  'Ver comentarios de este módulo: preferimos fs/promises + async/await por claridad y control de errores.';
