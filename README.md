# TurnosRed

Backend prototipo para centralizar la gestión de turnos de centros de atención ambulatoria (clínica médica, pediatría, odontología y nutrición).

Stack: **Node.js (LTS) + TypeScript + Express + Socket.IO**.

## Requisitos previos

- [NVM](https://github.com/nvm-sh/nvm)
- Node.js LTS (ver `.nvmrc`, actualmente `22`)
- npm (único manejador de paquetes del proyecto)
- Git
- Cliente HTTP (Postman o similar) para probar la API

## Instalación

```bash
# Clonar el repositorio
git clone <URL_DEL_REPO>
cd turnos-red

# Usar la versión de Node indicada
nvm use

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Desarrollo (recarga con tsx)
npm run dev
```

Servidor: `http://localhost:4000`  
Monitor Socket.IO: `http://localhost:4000/`

## Variables de entorno

| Variable    | Descripción                                      | Ejemplo                 |
|-------------|--------------------------------------------------|-------------------------|
| `PORT`      | Puerto HTTP del servidor                         | `4000`                  |
| `DATA_PATH` | Ruta al archivo JSON de turnos (relativa o abs.) | `./data/turnos.json`    |

## Scripts npm

| Script          | Descripción                                      |
|-----------------|--------------------------------------------------|
| `npm run dev`   | Levanta el servidor en modo desarrollo (`tsx`)   |
| `npm run build` | Compila TypeScript a `dist/`                     |
| `npm start`     | Ejecuta la build (`node dist/index.js`)          |
| `npm run lint`  | Ejecuta ESLint sobre archivos `.ts`              |
| `npm run format`| Formatea el código fuente con Prettier           |

## Endpoints REST

| Método   | Ruta           | Descripción              | Status típicos     |
|----------|----------------|--------------------------|--------------------|
| `GET`    | `/turnos`      | Listar todos los turnos  | 200, 500           |
| `GET`    | `/turnos/:id`  | Obtener un turno por ID  | 200, 400, 404, 500 |
| `POST`   | `/turnos`      | Crear un turno           | 201, 400, 500      |
| `PUT`    | `/turnos/:id`  | Actualizar un turno      | 200, 400, 404, 500 |
| `DELETE` | `/turnos/:id`  | Eliminar un turno        | 200, 400, 404, 500 |

### Ejemplo de body (POST)

```json
{
  "paciente": " Carlos Ruiz ",
  "documento": 31654210,
  "especialidad": "PEDIATRÍA",
  "fecha": "14/08/2026",
  "hora": "10.00",
  "confirmado": "si",
  "observaciones": "Control de rutina"
}
```

El servidor normaliza tipos (id numérico, documento string, hora `HH:mm`, fecha `YYYY-MM-DD`, `confirmado` booleano) y descarta registros inválidos al cargar el archivo inicial.

## Tiempo real (Socket.IO)

Ante operaciones exitosas de escritura, el bus interno (`EventEmitter`) emite:

- `turno:creado`
- `turno:actualizado`
- `turno:eliminado`

Esos eventos se retransmiten a los clientes WebSocket como:

- `turno:nuevo`
- `turno:actualizado`
- `turno:eliminado`

Abrí `http://localhost:4000/` y ejecutá POST/PUT/DELETE desde Postman para ver el feed sin recargar.

## Estructura del proyecto

```text
turnos-red/
├── .env.example          # Plantilla de variables de entorno
├── .nvmrc                # Versión de Node (LTS)
├── .eslintrc.cjs         # ESLint + TypeScript
├── .prettierrc           # Prettier
├── package.json          # type: module + scripts
├── package-lock.json     # Único lockfile (npm)
├── tsconfig.json         # strict: true, outDir: dist
├── data/
│   └── turnos.json       # Datos de entrada / persistencia
├── public/
│   └── index.html        # Cliente Socket.IO de demostración
└── src/
    ├── index.ts          # Bootstrap HTTP + Socket.IO
    ├── app.ts            # App Express
    ├── config/           # Variables de entorno
    ├── models/           # TurnoCrudo y Turno
    ├── utils/            # Normalización + ejemplo callbacks vs promises
    ├── services/         # Lógica de negocio + EventEmitter
    ├── controllers/      # Handlers HTTP
    └── routes/           # Rutas REST
```

Separación de responsabilidades: **routes → controllers → services → models**.

## Depuración en VS Code

1. Abrí la carpeta `turnos-red` en VS Code / Cursor.
2. Colocá un breakpoint (por ejemplo en `src/utils/normalizeTurno.ts` o en un controller).
3. Ejecutá la configuración **Debug TurnosRed** (`.vscode/launch.json`).
4. Dispará un request desde Postman y capturá la sesión de debug.

## Licencia

ISC
