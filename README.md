# TurnosRed

Backend para centralizar la gestión de turnos de centros de atención ambulatoria (clínica médica, pediatría, odontología y nutrición).

Stack: **Node.js (LTS) + TypeScript + Express + Zod + Socket.IO**.

El proyecto evoluciona en dos etapas:

1. **Actividad anterior:** API REST de `/turnos` y `/medicos` con validación Zod, errores estandarizados, filtros por query params, EventEmitter y Socket.IO.
2. **Actividad 2 — Controllers Async:** refactor hacia controladores asincrónicos con patrón `status` + `try/catch` + `throw new Error(...)`, recursos `/especialidades` y `/profesionales`, y `generalController` (bienvenida + 404).

Ambas capas **conviven** en el mismo repositorio sin reemplazarse.

## Requisitos previos

- [NVM](https://github.com/nvm-sh/nvm)
- Node.js LTS (ver `.nvmrc`, actualmente `22`)
- npm
- Git
- [Postman](https://www.postman.com/) para pruebas de API y Mock Server
- Newman (devDependency) para ejecutar la colección desde CLI

## Instalación y ejecución

```bash
git clone https://github.com/Juampi-Revi/turnos-red.git
cd turnos-red
nvm use
npm install
cp .env.example .env
npm run dev
```

Servidor: `http://localhost:4000`  
Bienvenida (Hello World): `http://localhost:4000/`  
Monitor Socket.IO: `http://localhost:4000/index.html`

### Ejecutar la colección Postman con Newman

Con el servidor en marcha (`npm run dev`), en **otra terminal**:

```bash
npx newman run turnos-red.postman_collection.json
```

## Variables de entorno

| Variable               | Descripción                            | Ejemplo                              |
|------------------------|----------------------------------------|--------------------------------------|
| `PORT`                 | Puerto HTTP del servidor               | `4000`                               |
| `APPOINTMENTS_PATH`    | Archivo JSON de turnos                 | `./data/turnos.json`                 |
| `DOCTORS_PATH`         | Archivo JSON de médicos                | `./data/medicos.json`                |
| `ESPECIALIDADES_PATH`  | Archivo JSON de especialidades         | `./src/data/especialidades.json`     |
| `PROFESIONALES_PATH`   | Archivo JSON de profesionales          | `./src/data/profesionales.json`      |

## Scripts npm

| Script           | Descripción                              |
|------------------|------------------------------------------|
| `npm run dev`    | Servidor en desarrollo (`tsx watch`)     |
| `npm run build`  | Compila TypeScript a `dist/`             |
| `npm start`      | Ejecuta build compilada                  |
| `npm run lint`   | ESLint sobre archivos `.ts`              |
| `npm run format` | Prettier sobre `src/**/*.ts`             |

## Arquitectura

Flujo de capas:

```text
routes → controllers → services → models / data
```

| Capa | Responsabilidad |
|------|-----------------|
| `routes/` | Define endpoints HTTP y enlaza handlers |
| `controllers/` | Validaciones, códigos HTTP, respuestas |
| `services/` | Lógica de negocio y persistencia en memoria/JSON |
| `models/` | Tipos de dominio |
| `data/` / `src/data/` | Persistencia ficticia en archivos JSON |
| `schemas/` | Validación Zod (recursos de la actividad anterior) |
| `middleware/` | Zod validate, errorHandler, routeHandler |

Persistencia: **ficticia** (arrays en memoria + JSON). Los cambios duran mientras el proceso esté en ejecución / reescriba el archivo.

---

## Recursos existentes (actividad anterior)

| Recurso | Ruta base | Notas |
|---------|-----------|-------|
| Turnos | `/turnos` | Zod + filtros + Socket.IO en escrituras |
| Médicos | `/medicos` | Zod + filtros |
| Health | `/health` | Estado del servicio |

### Formato de errores (turnos / médicos — Zod / AppError)

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

### Endpoints — Turnos (`/turnos`)

| Método   | Ruta           | Descripción        | Status típicos        |
|----------|----------------|--------------------|-----------------------|
| `GET`    | `/turnos`      | Listar turnos      | 200, 400, 500         |
| `GET`    | `/turnos/:id`  | Turno por ID       | 200, 400, 404, 500    |
| `POST`   | `/turnos`      | Crear turno        | 201, 400, 404, 500    |
| `PUT`    | `/turnos/:id`  | Actualizar turno   | 200, 400, 404, 500    |
| `DELETE` | `/turnos/:id`  | Eliminar turno     | 204, 400, 404, 500    |

#### Query params — `GET /turnos`

| Parámetro      | Ejemplo              | Descripción                    |
|----------------|----------------------|--------------------------------|
| `especialidad` | `Pediatria`          | Filtra por especialidad        |
| `fecha`        | `14/08/2026`         | Filtra por fecha (DD/MM/YYYY)  |
| `medicoId`     | `1`                  | Filtra por médico asignado     |

Ejemplo: `/turnos?especialidad=Pediatria&fecha=14/08/2026&medicoId=1`

#### Body ejemplo — `POST /turnos`

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

### Endpoints — Médicos (`/medicos`)

| Método   | Ruta            | Descripción         | Status típicos        |
|----------|-----------------|---------------------|-----------------------|
| `GET`    | `/medicos`      | Listar médicos      | 200, 400, 500         |
| `GET`    | `/medicos/:id`  | Médico por ID       | 200, 400, 404, 500    |
| `POST`   | `/medicos`      | Registrar médico    | 201, 400, 500         |
| `PUT`    | `/medicos/:id`  | Actualizar médico   | 200, 400, 404, 500    |
| `DELETE` | `/medicos/:id`  | Dar de baja médico  | 204, 400, 404, 500    |

#### Query params — `GET /medicos`

| Parámetro      | Ejemplo        | Descripción              |
|----------------|----------------|--------------------------|
| `especialidad` | `Odontologia`  | Filtra por especialidad  |
| `disponible`   | `true`         | Filtra por disponibilidad|

Ejemplo: `/medicos?especialidad=Odontologia&disponible=false`

#### Body ejemplo — `POST /medicos`

```json
{
  "nombre": "Dra. Ana Martínez",
  "documento": "30111222",
  "especialidad": "Pediatría",
  "disponible": true
}
```

Especialidades válidas en Zod (Title Case): `Clínica médica`, `Pediatría`, `Odontología`, `Nutrición`.

### Tiempo real (Socket.IO)

Ante operaciones exitosas de escritura sobre turnos, el bus interno (`EventEmitter`) emite eventos que Socket.IO retransmite a los clientes:

- `turno:nuevo`
- `turno:actualizado`
- `turno:eliminado`

Abrí `http://localhost:4000/index.html` y dispará POST/PUT/DELETE sobre `/turnos` para ver el feed sin recargar.

---

## Actividad 2 — Controllers Async

### Recursos nuevos

| Recurso | Ruta base | Descripción |
|---------|-----------|-------------|
| Bienvenida | `/` | Hello World / mensaje de bienvenida |
| Especialidades | `/especialidades` | CRUD de especialidades |
| Profesionales | `/profesionales` | CRUD de profesionales (vinculados a `especialidadId`) |

### `generalController`

Archivo: `src/controllers/generalController.ts`

| Método | Función | Comportamiento |
|--------|---------|----------------|
| `GET /` | `welcome` | Responde HTTP 200 con mensaje de bienvenida y mapa de endpoints |
| `*` (no mapeada) | `notFound` | Responde HTTP 404 con `{ status, message }` para rutas inexistentes |

El 404 de rutas no contempladas se genera **desde el controller general**, no solo desde un middleware anónimo.

### Patrón de los nuevos controllers

Los handlers de `especialidadesController` y `profesionalesController` siguen este contrato pedagógico:

1. Función **`async`**
2. Variable local **`let status = 200`** (o `201` en altas)
3. Bloque **`try/catch`** dentro del controller
4. **Validaciones previas** antes de manipular datos
5. Si falla una validación: `status = 400` o `404` y luego **`throw new Error("...")`**
6. Respuestas con **`return res.status(status).json(...)`**
7. En el `catch`: si el status sigue siendo el del camino feliz, se fuerza **`status = 500`**
8. El `catch` devuelve JSON coherente:

```json
{
  "status": 400,
  "message": "El campo nombre es obligatorio y debe ser string"
}
```

> Nota: los controllers de `/turnos` y `/medicos` mantienen el estilo de la actividad anterior (`AppError` + middleware Zod). Los nuevos recursos demuestran el patrón pedido en esta Actividad 2.

### Endpoints — Especialidades (`/especialidades`)

| Método   | Ruta                    | Descripción              | Status típicos     |
|----------|-------------------------|--------------------------|--------------------|
| `GET`    | `/especialidades`       | Listar especialidades    | 200, 500           |
| `GET`    | `/especialidades/:id`   | Especialidad por ID      | 200, 400, 404, 500 |
| `POST`   | `/especialidades`       | Crear especialidad       | 201, 400, 500      |
| `PUT`    | `/especialidades/:id`   | Actualizar especialidad  | 200, 400, 404, 500 |
| `DELETE` | `/especialidades/:id`   | Eliminar especialidad    | 200, 400, 404, 500 |

#### Body ejemplo — `POST /especialidades`

```json
{
  "nombre": "Cardiología",
  "descripcion": "Atención cardiológica",
  "activa": true
}
```

### Endpoints — Profesionales (`/profesionales`)

| Método   | Ruta                   | Descripción             | Status típicos     |
|----------|------------------------|-------------------------|--------------------|
| `GET`    | `/profesionales`       | Listar profesionales    | 200, 500           |
| `GET`    | `/profesionales/:id`   | Profesional por ID      | 200, 400, 404, 500 |
| `POST`   | `/profesionales`       | Crear profesional       | 201, 400, 500      |
| `PUT`    | `/profesionales/:id`   | Actualizar profesional  | 200, 400, 404, 500 |
| `DELETE` | `/profesionales/:id`   | Eliminar profesional    | 200, 400, 404, 500 |

#### Body ejemplo — `POST /profesionales`

```json
{
  "nombre": "Dr. Test Postman",
  "documento": "77001122",
  "especialidadId": 1,
  "disponible": true
}
```

### Errores de la Actividad 2 (controllers async)

| Caso | HTTP | Body típico |
|------|------|-------------|
| Datos inválidos / incompletos | `400` | `{ "status": 400, "message": "..." }` |
| Recurso inexistente (id) | `404` | `{ "status": 404, "message": "..." }` |
| Ruta no contemplada | `404` | `{ "status": 404, "message": "Ruta no encontrada" }` |
| Error inesperado | `500` | `{ "status": 500, "message": "..." }` |

---

## Postman

Archivo: **`turnos-red.postman_collection.json`**

### Contenido de la colección

| Carpeta | Origen |
|---------|--------|
| Turnos - Happy Path | Actividad anterior |
| Medicos - Happy Path | Actividad anterior |
| Query Filters | Actividad anterior |
| Errors | Actividad anterior (Zod 400 / 404) |
| **Actividad 2 - Controllers Async** | Nueva actividad (bienvenida, especialidades, profesionales, unhappy paths) |

Variables de colección: `baseUrl`, `doctorId`, `appointmentId`, `especialidadSeedId`, `profesionalSeedId`, `especialidadId`, `profesionalId`.

La colección incluye tests automatizados y **Saved Responses** (útil para Mock Server de la actividad anterior).

### Resultado de ejecución (Newman)

Última corrida completa de la colección:

| Métrica | Valor |
|---------|-------|
| Requests ejecutadas | **36** |
| Assertions | **68** |
| PASS | **68** |
| FAIL | **0** |

Incluye happy path, unhappy path (400/404) y la carpeta **Actividad 2 - Controllers Async**.

### Newman (devDependency)

`newman` está instalado como **devDependency** para ejecutar la colección desde la terminal:

```bash
# Terminal 1
npm run dev

# Terminal 2
npx newman run turnos-red.postman_collection.json
```

---

## Estructura del proyecto

```text
turnos-red/
├── data/
│   ├── turnos.json
│   └── medicos.json
├── public/
│   └── index.html              # Monitor Socket.IO (/index.html)
├── turnos-red.postman_collection.json
└── src/
    ├── index.ts
    ├── app.ts
    ├── config/
    ├── controllers/
    │   ├── appointmentController.ts
    │   ├── doctorController.ts
    │   ├── generalController.ts          # Actividad 2
    │   ├── especialidadesController.ts   # Actividad 2
    │   └── profesionalesController.ts    # Actividad 2
    ├── data/                             # Actividad 2
    │   ├── especialidades.json
    │   └── profesionales.json
    ├── errors/
    ├── middleware/
    ├── models/
    │   ├── Appointment.ts
    │   ├── Doctor.ts
    │   ├── Especialidad.ts               # Actividad 2
    │   └── Profesional.ts                # Actividad 2
    ├── routes/
    ├── schemas/
    ├── services/
    └── utils/
```

## Uso de Inteligencia Artificial

| Tarea | Herramienta | Prompt | Respuesta generada | Ajuste manual aplicado |
|-------|-------------|--------|--------------------|------------------------|
| Schemas Zod | Cursor / Claude | Definir schemas Zod para Turno y Médico con especialidades Title Case y documento string | Esquemas base con `z.object` y transforms | Agregué `specialtyQuerySchema` sin acentos para query params y normalización de fechas |
| Middleware de errores | Cursor / Claude | Middleware Express con formato `{ status, message, code, details }` | Handler básico + ZodError mapping | Integré `AppError` y `routeHandler` para propagar throws |
| CRUD Médicos | Cursor / Claude | Implementar /medicos con misma arquitectura en capas | Service + controller + routes | Validación de documento duplicado y persistencia JSON |
| Colección Postman | Cursor / Claude | Colección con tests 200/201/400/404 y saved responses | JSON v2.1 con carpetas Happy Path y Errors | Ajusté variables dinámicas `doctorId` / `appointmentId` en scripts |
| Controllers async (Actividad 2) | Cursor / Claude | Controllers async con status, try/catch y throw new Error para especialidades/profesionales | Handlers con patrón pedagógico | Convivencia con /turnos y /medicos; 404 desde generalController |
| Postman Controllers Async | Cursor / Claude | Carpeta Postman para bienvenida, CRUD y unhappy paths | Requests + scripts de test | Variables dinámicas `especialidadId` / `profesionalId`; ejecución Newman 68/68 |
| README Actividad 2 | Cursor / Claude | Actualizar README con endpoints Controllers Async y resultados Newman | Estructura markdown base | Se conservó documentación de turnos/médicos/Zod/Socket.IO |

## Depuración en VS Code / Cursor

Configuración **Debug TurnosRed** en `.vscode/launch.json`. Abrir workspace `turnos-red` o raíz con launch apuntando a `turnos-red/`.

## Licencia

ISC
