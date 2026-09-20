import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(`Variable de entorno requerida no definida: ${name}`);
  }
  return value.trim();
}

function resolveDataPath(envValue: string): string {
  return path.isAbsolute(envValue) ? envValue : path.resolve(projectRoot, envValue);
}

const portRaw = process.env.PORT ?? '4000';
const port = Number(portRaw);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`PORT inválido: ${portRaw}`);
}

export const env = {
  port,
  appointmentsPath: resolveDataPath(requireEnv('APPOINTMENTS_PATH')),
  doctorsPath: resolveDataPath(requireEnv('DOCTORS_PATH')),
  especialidadesPath: resolveDataPath(
    process.env.ESPECIALIDADES_PATH?.trim() || './src/data/especialidades.json',
  ),
  profesionalesPath: resolveDataPath(
    process.env.PROFESIONALES_PATH?.trim() || './src/data/profesionales.json',
  ),
  projectRoot,
};
