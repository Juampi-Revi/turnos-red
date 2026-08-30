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

const portRaw = process.env.PORT ?? '4000';
const port = Number(portRaw);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`PORT inválido: ${portRaw}`);
}

const dataPathEnv = requireEnv('DATA_PATH');

export const env = {
  port,
  dataPath: path.isAbsolute(dataPathEnv) ? dataPathEnv : path.resolve(projectRoot, dataPathEnv),
  projectRoot,
};
