# TurnosRed

Backend para centralizar la gestión de turnos de centros de atención ambulatoria (clínica médica, pediatría, odontología y nutrición).

Stack: **Node.js (LTS) + TypeScript + Express + Zod + Socket.IO**.

## Requisitos previos

- [NVM](https://github.com/nvm-sh/nvm)
- Node.js LTS (ver `.nvmrc`, actualmente `22`)
- npm
- Git
- [Postman](https://www.postman.com/) para pruebas de API y Mock Server

## Instalación

```bash
git clone https://github.com/Juampi-Revi/turnos-red.git
cd turnos-red
nvm use
npm install
cp .env.example .env
npm run dev
```

Servidor: `http://localhost:4000`  
Monitor Socket.IO: `http://localhost:4000/`

## Variables de entorno

| Variable            | Descripción                         | Ejemplo                  |
|---------------------|-------------------------------------|--------------------------|
| `PORT`              | Puerto HTTP del servidor            | `4000`                   |
| `APPOINTMENTS_PATH` | Archivo JSON de turnos              | `./data/turnos.json`     |
| `DOCTORS_PATH`      | Archivo JSON de médicos             | `./data/medicos.json`    |

## Scripts npm

| Script           | Descripción                              |
|------------------|------------------------------------------|
| `npm run dev`    | Servidor en desarrollo (`tsx watch`)     |
| `npm run build`  | Compila TypeScript a `dist/`             |
| `npm start`      | Ejecuta build compilada                  |
| `npm run lint`   | ESLint sobre archivos `.ts`              |
| `npm run format` | Prettier sobre `src/**/*.ts`             |

## Formato de errores

Todas las respuestas fallidas usan el mismo esquema:

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "especialidad", "message": "especialidad inválida" }
  ]
}
```

Códigos comunes: `VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL_ERROR`.

## Endpoints — Turnos (`/turnos`)

| Método   | Ruta           | Descripción        | Status típicos        |
|----------|----------------|--------------------|-----------------------|
| `GET`    | `/turnos`      | Listar turnos      | 200, 400, 500         |
| `GET`    | `/turnos/:id`  | Turno por ID       | 200, 400, 404, 500    |
| `POST`   | `/turnos`      | Crear turno        | 201, 400, 404, 500    |
| `PUT`    | `/turnos/:id`  | Actualizar turno   | 200, 400, 404, 500    |
| `DELETE` | `/turnos/:id`  | Eliminar turno     | 204, 400, 404, 500    |

### Query params — `GET /turnos`

| Parámetro      | Ejemplo              | Descripción                    |
|----------------|----------------------|--------------------------------|
| `especialidad` | `Pediatria`          | Filtra por especialidad        |
| `fecha`        | `14/08/2026`         | Filtra por fecha (DD/MM/YYYY)  |
| `medicoId`     | `1`                  | Filtra por médico asignado     |

Ejemplo: `/turnos?especialidad=Pediatria&fecha=14/08/2026&medicoId=1`

### Body ejemplo — `POST /turnos`

```json
{
  "paciente": "Carlos Ruiz",
  "documento": "31654210",
  "especialidad": "Pediatría",
  "fecha": "14/08/2026",
  "hora": "10.00",
  "confirmado": "si",
  "medicoId": 1,
  "observaciones": "Control de rutina"
}
```

## Endpoints — Médicos (`/medicos`)

| Método   | Ruta            | Descripción         | Status típicos        |
|----------|-----------------|---------------------|-----------------------|
| `GET`    | `/medicos`      | Listar médicos      | 200, 400, 500         |
| `GET`    | `/medicos/:id`  | Médico por ID       | 200, 400, 404, 500    |
| `POST`   | `/medicos`      | Registrar médico    | 201, 400, 500         |
| `PUT`    | `/medicos/:id`  | Actualizar médico   | 200, 400, 404, 500    |
| `DELETE` | `/medicos/:id`  | Dar de baja médico  | 204, 400, 404, 500    |

### Query params — `GET /medicos`

| Parámetro      | Ejemplo        | Descripción              |
|----------------|----------------|--------------------------|
| `especialidad` | `Odontologia`  | Filtra por especialidad  |
| `disponible`   | `true`         | Filtra por disponibilidad|

Ejemplo: `/medicos?especialidad=Odontologia&disponible=false`

### Body ejemplo — `POST /medicos`

```json
{
  "nombre": "Dra. Ana Martínez",
  "documento": "30111222",
  "especialidad": "Pediatría",
  "disponible": true
}
```

Especialidades válidas (Title Case): `Clínica médica`, `Pediatría`, `Odontología`, `Nutrición`.

## Postman

Importar:

- Colección: `turnos-red.postman_collection.json`
- Variables incluidas: `baseUrl`, `doctorId`, `appointmentId`

La colección incluye tests automatizados (status codes, esquema JSON) y **Saved Responses** para configurar un **Mock Server** en Postman.

## Estructura del proyecto

```text
turnos-red/
├── data/
│   ├── turnos.json
│   └── medicos.json
├── public/
│   └── index.html
├── turnos-red.postman_collection.json
└── src/
    ├── index.ts
    ├── app.ts
    ├── config/
    ├── controllers/     # appointmentController, doctorController
    ├── errors/          # AppError
    ├── middleware/      # validate, errorHandler, routeHandler
    ├── models/          # Appointment, Doctor
    ├── routes/          # appointmentRoutes, doctorRoutes
    ├── schemas/         # Zod schemas (appointment, doctor, common)
    ├── services/        # appointmentService, doctorService, eventBus
    └── utils/
```

Flujo: **routes → controllers → services → models/schemas**.

Validación de entrada con **Zod** en middleware. Eventos internos (`EventEmitter`) se retransmiten por **Socket.IO** en operaciones de escritura sobre turnos.

## Uso de Inteligencia Artificial

| Tarea | Herramienta | Prompt | Respuesta generada | Ajuste manual aplicado |
|-------|-------------|--------|--------------------|------------------------|
| Schemas Zod | Cursor / Claude | Definir schemas Zod para Turno y Médico con especialidades Title Case y documento string | Esquemas base con `z.object` y transforms | Agregué `specialtyQuerySchema` sin acentos para query params y normalización de fechas |
| Middleware de errores | Cursor / Claude | Middleware Express con formato `{ status, message, code, details }` | Handler básico + ZodError mapping | Integré `AppError` y `routeHandler` para propagar throws |
| CRUD Médicos | Cursor / Claude | Implementar /medicos con misma arquitectura en capas | Service + controller + routes | Validación de documento duplicado y persistencia JSON |
| Colección Postman | Cursor / Claude | Colección con tests 200/201/400/404 y saved responses | JSON v2.1 con carpetas Happy Path y Errors | Ajusté variables dinámicas `doctorId` / `appointmentId` en scripts |
| README Actividad 2 | Cursor / Claude | Actualizar README con endpoints, query params y tabla IA | Estructura markdown base | Tabla de IA y ejemplos de query params según consigna |

## Depuración en VS Code / Cursor

Configuración **Debug TurnosRed** en `.vscode/launch.json`. Abrir workspace `turnos-red` o raíz con launch apuntando a `turnos-red/`.

## Licencia

ISC
