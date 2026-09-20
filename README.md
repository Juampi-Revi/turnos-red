# TurnosRed

Backend para centralizar la gestión de turnos de centros de atención ambulatoria (clínica médica, pediatría, odontología y nutrición).

Stack: **Node.js (LTS) + TypeScript + Express + Zod + Socket.IO**.

El proyecto evoluciona en etapas acumulativas:

1. **API REST base:** `/turnos` y `/medicos` con validación Zod, errores estandarizados, filtros, EventEmitter y Socket.IO.
2. **Controllers Async:** `/especialidades`, `/profesionales` y `generalController` (bienvenida + 404) con patrón `async` / `status` / `throw new Error`.
3. **Mockup Pacientes y Turnos:** propuesta conceptual para Frontend en [`pacientes-turnos.md`](./pacientes-turnos.md) (**no implementa** todavía el CRUD de `/pacientes`).

Las capas **conviven** en el mismo repositorio sin reemplazarse.

## Índice rápido

| Sección | Contenido |
|---------|-----------|
| [Instalación](#instalación-y-ejecución) | `npm install` / `npm run dev` |
| [Arquitectura](#arquitectura) | Capas Clean Architecture |
| [API implementada](#documentación-rest--api-implementada) | Endpoints reales |
| [Mockup Pacientes/Turnos](#mockup-pacientes-y-turnos) | Propuesta para Frontend |
| [Postman y `baseUrl`](#postman) | Variables de colección / environment |
| [`.gitignore`](#gitignore) | Archivos excluidos del repo |

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

## Documentación REST — API implementada

A continuación se documenta la API **realmente disponible** al ejecutar `npm run dev`.

### Recursos disponibles

| Recurso | Ruta base | Estado |
|---------|-----------|--------|
| Bienvenida | `/` | Implementado |
| Health | `/health` | Implementado |
| Turnos | `/turnos` | Implementado |
| Médicos | `/medicos` | Implementado |
| Especialidades | `/especialidades` | Implementado |
| Profesionales | `/profesionales` | Implementado |
| Pacientes | `/pacientes` | **Propuesta** → ver [`pacientes-turnos.md`](./pacientes-turnos.md) |

### `GET /` — Bienvenida

| Ítem | Detalle |
|------|---------|
| Método / Path | `GET /` |
| Descripción | Mensaje de bienvenida y mapa de endpoints |
| Respuesta 200 | `{ status, message, service, version, endpoints }` |

### `GET /health`

| Ítem | Detalle |
|------|---------|
| Método / Path | `GET /health` |
| Descripción | Healthcheck del servicio |
| Respuesta 200 | `{ status: "ok", service: "turnos-red" }` |

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

| Método   | Ruta           | Descripción        | Params | Query | Body | Status típicos        |
|----------|----------------|--------------------|--------|-------|------|-----------------------|
| `GET`    | `/turnos`      | Listar turnos      | — | `especialidad`, `fecha`, `medicoId` | — | 200, 400, 500         |
| `GET`    | `/turnos/:id`  | Turno por ID       | `id` | — | — | 200, 400, 404, 500    |
| `POST`   | `/turnos`      | Crear turno        | — | — | JSON turno | 201, 400, 404, 500    |
| `PUT`    | `/turnos/:id`  | Actualizar turno   | `id` | — | JSON parcial | 200, 400, 404, 500    |
| `DELETE` | `/turnos/:id`  | Eliminar turno     | `id` | — | — | 204, 400, 404, 500    |

#### Query params — `GET /turnos`

| Parámetro      | Ejemplo              | Descripción                    |
|----------------|----------------------|--------------------------------|
| `especialidad` | `Pediatria`          | Filtra por especialidad        |
| `fecha`        | `14/08/2026`         | Filtra por fecha (DD/MM/YYYY)  |
| `medicoId`     | `1`                  | Filtra por médico asignado     |

Ejemplo: `{{baseUrl}}/turnos?especialidad=Pediatria&fecha=14/08/2026&medicoId=1`

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

| Método   | Ruta            | Descripción         | Params | Query | Body | Status típicos        |
|----------|-----------------|---------------------|--------|-------|------|-----------------------|
| `GET`    | `/medicos`      | Listar médicos      | — | `especialidad`, `disponible` | — | 200, 400, 500         |
| `GET`    | `/medicos/:id`  | Médico por ID       | `id` | — | — | 200, 400, 404, 500    |
| `POST`   | `/medicos`      | Registrar médico    | — | — | JSON médico | 201, 400, 500         |
| `PUT`    | `/medicos/:id`  | Actualizar médico   | `id` | — | JSON parcial | 200, 400, 404, 500    |
| `DELETE` | `/medicos/:id`  | Dar de baja médico  | `id` | — | — | 204, 400, 404, 500    |

#### Query params — `GET /medicos`

| Parámetro      | Ejemplo        | Descripción              |
|----------------|----------------|--------------------------|
| `especialidad` | `Odontologia`  | Filtra por especialidad  |
| `disponible`   | `true`         | Filtrar por disponibilidad|

Ejemplo: `{{baseUrl}}/medicos?especialidad=Odontologia&disponible=false`

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

## Mockup Pacientes y Turnos

La propuesta de diseño para el módulo de **Pacientes** y la evolución de **Turnos** (hacia `pacienteId`) está documentada en:

**[`pacientes-turnos.md`](./pacientes-turnos.md)**

Incluye:

- modelo conceptual de Paciente (`dni`, nombre, apellido, fecha de nacimiento, contacto);
- modelo de Turno actual vs propuesto;
- endpoints REST sugeridos (`/pacientes`, evolución de `/turnos`);
- ejemplos TypeScript y JSON;
- capas Clean Architecture previstas.

> `/pacientes` **no está implementado** en el código. `/turnos` **sí** está implementado con el contrato actual (`paciente` + `documento` embebidos).

---

## Actividad 2 — Controllers Async

### Recursos

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

### Archivos

| Archivo | Uso |
|---------|-----|
| `turnos-red.postman_collection.json` | Colección completa (tests + examples) |
| `turnos-red.postman_environment.json` | Environment **TurnosRed Local** con `baseUrl` |

### Variable `baseUrl`

La colección y el environment definen:

| Variable | Valor típico |
|----------|--------------|
| `baseUrl` | `http://localhost:4000` |

Todas las peticiones usan la sintaxis:

```text
{{baseUrl}}/turnos
{{baseUrl}}/medicos
{{baseUrl}}/especialidades
{{baseUrl}}/profesionales
```

**Cómo usarlo en Postman**

1. Importar `turnos-red.postman_collection.json`
2. (Opcional) Importar `turnos-red.postman_environment.json` y seleccionarlo arriba a la derecha
3. Verificar en **Variables** de la colección (o del environment) que `baseUrl` apunte a tu servidor
4. Ejecutar requests: la URL se resuelve dinámicamente

### Carpetas de la colección

| Carpeta | Origen |
|---------|--------|
| Turnos - Happy Path | API turnos |
| Medicos - Happy Path | API médicos |
| Query Filters | Filtros query |
| Errors | Zod 400 / 404 |
| Actividad 2 - Controllers Async | Bienvenida, especialidades, profesionales |

Otras variables: `doctorId`, `appointmentId`, `especialidadSeedId`, `profesionalSeedId`, `especialidadId`, `profesionalId`.

La colección incluye tests automatizados y **Saved Responses** (útil para Mock Server).

### Resultado de ejecución (Newman)

| Métrica | Valor |
|---------|-------|
| Requests ejecutadas | **36** |
| Assertions | **68** |
| PASS | **68** |
| FAIL | **0** |

### Newman (devDependency)

```bash
# Terminal 1
npm run dev

# Terminal 2
npx newman run turnos-red.postman_collection.json
```

Con environment:

```bash
npx newman run turnos-red.postman_collection.json -e turnos-red.postman_environment.json
```

---

## `.gitignore`

El archivo `.gitignore` en la raíz excluye (entre otros):

| Entrada | Motivo |
|---------|--------|
| `node_modules/` | Dependencias instaladas (no versionar) |
| `dist/` | Salida compilada de TypeScript |
| `.env` | Secretos / configuración local |
| `*.log` | Logs temporales |
| `.DS_Store` | Metadatos del sistema |

Así el repositorio público no sube artefactos generados ni variables sensibles. La plantilla versionada es `.env.example`.

---

## Estructura del proyecto

```text
turnos-red/
├── data/
│   ├── turnos.json
│   └── medicos.json
├── public/
│   └── index.html
├── pacientes-turnos.md                 # Mockup Pacientes / Turnos
├── turnos-red.postman_collection.json
├── turnos-red.postman_environment.json # baseUrl local
├── .gitignore
└── src/
    ├── index.ts
    ├── app.ts
    ├── config/
    ├── controllers/
    │   ├── appointmentController.ts
    │   ├── doctorController.ts
    │   ├── generalController.ts
    │   ├── especialidadesController.ts
    │   └── profesionalesController.ts
    ├── data/
    │   ├── especialidades.json
    │   └── profesionales.json
    ├── errors/
    ├── middleware/
    ├── models/
    │   ├── Appointment.ts
    │   ├── Doctor.ts
    │   ├── Especialidad.ts
    │   └── Profesional.ts
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
| Mockup Pacientes/Turnos | Cursor / Claude | Propuesta conceptual pacientes-turnos.md + README REST + Postman baseUrl | Documento de diseño + docs | Sin implementar `/pacientes`; se documentó contrato actual vs propuesto |

## Depuración en VS Code / Cursor

Configuración **Debug TurnosRed** en `.vscode/launch.json`. Abrir workspace `turnos-red` o raíz con launch apuntando a `turnos-red/`.

## Licencia

ISC
