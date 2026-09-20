# Diseño de módulos: Pacientes y Turnos

> **Estado:** propuesta conceptual / mockup técnico para Frontend.  
> **No implementado** en la API actual (excepto `/turnos` en su forma vigente, documentada más abajo como punto de partida).

## 1. Objetivo

Este documento define la **propuesta conceptual y técnica** de las interfaces REST para los módulos de **Pacientes** y **Turnos** dentro de TurnosRed / TurnosMed.

El objetivo es que el equipo de Frontend pueda conocer de antemano:

- el modelado de datos esperado;
- los endpoints RESTful previstos;
- los cuerpos JSON de entrada/salida;
- los códigos HTTP de éxito y error;

…sin depender aún de la implementación definitiva en base de datos.

La propuesta respeta la arquitectura ya usada en el proyecto:

```text
routes → controllers → services → models / data
```

---

## 2. Modelo conceptual de Paciente

Hoy la API de turnos guarda al paciente como **datos embebidos** en el turno (`paciente: string` + `documento`).  
Para la pantalla de gestión de pacientes se propone **elevar Paciente a entidad propia**, con identidad estable y datos de contacto reutilizables en múltiples turnos.

### 2.1 Datos mínimos

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `id` | `number` | sí (generado) | Identificador interno. Se usa `number` para alinear con el resto del proyecto (`Appointment`, `Doctor`, `Profesional`). |
| `dni` | `string` | sí | Documento de identidad. Equivalente semántico a `documento` usado hoy en turnos/médicos. |
| `nombre` | `string` | sí | Nombre de pila. |
| `apellido` | `string` | sí | Apellido. |
| `fechaNacimiento` | `string` | sí | Formato `YYYY-MM-DD`. |
| `telefono` | `string` | sí | Contacto telefónico. |
| `email` | `string` | sí | Contacto electrónico. |
| `activo` | `boolean` | no | Soft-delete / habilitación. Útil para no borrar historial clínico al dar de baja. |

**Por qué `activo`:** permite baja lógica sin perder la relación con turnos históricos.

**Por qué `id: number` (y no `string`):** el dominio actual del repositorio identifica recursos con enteros positivos; mantener el mismo criterio facilita la integración futura con `/turnos` y `/medicos`.

### 2.2 Ejemplo TypeScript

```typescript
interface Paciente {
  id: number;
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // YYYY-MM-DD
  telefono: string;
  email: string;
  activo?: boolean;
}

type CreatePacienteInput = Omit<Paciente, 'id'>;
type UpdatePacienteInput = Partial<CreatePacienteInput>;
```

### 2.3 Ejemplo JSON

```json
{
  "id": 1,
  "dni": "31654210",
  "nombre": "Carlos",
  "apellido": "Ruiz",
  "fechaNacimiento": "1990-05-14",
  "telefono": "+54 9 11 5555-1234",
  "email": "carlos.ruiz@email.com",
  "activo": true
}
```

---

## 3. Modelo conceptual de Turno

### 3.1 Situación actual (implementada)

El recurso **`GET/POST/PUT/DELETE /turnos`** ya existe. El modelo vigente es:

```typescript
interface Appointment {
  id: number;
  paciente: string;      // nombre libre, no FK
  documento: string;     // DNI embebido
  especialidad: string;  // Title Case validado por Zod
  fecha: string;         // DD/MM/YYYY o YYYY-MM-DD (normalizado)
  hora: string;          // HH:mm o HH.mm (p. ej. "10.00")
  confirmado: boolean;   // acepta también "si"/"no" en entrada
  medicoId: number;      // relación con /medicos
  observaciones?: string;
}
```

### 3.2 Propuesta futura (mockup para Frontend)

Para la gestión formal de pacientes se propone evolucionar el turno hacia **referencias por ID**, sin romper la idea de Clean Architecture ni el vínculo con médicos/profesionales ya existentes.

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `id` | `number` | sí (generado) | Identificador del turno. |
| `pacienteId` | `number` | sí | FK a `/pacientes`. Reemplaza `paciente` + `documento` embebidos. |
| `medicoId` | `number` | sí | FK a `/medicos` (compatibilidad con la API actual). |
| `especialidad` | `string` | sí | Especialidad del turno (Title Case). Alternativa futura: `especialidadId` → `/especialidades`. |
| `fecha` | `string` | sí | `YYYY-MM-DD` (aceptar también `DD/MM/YYYY` en entrada). |
| `hora` | `string` | sí | `HH:mm`. |
| `confirmado` | `boolean` | sí | Estado de confirmación. |
| `observaciones` | `string` | no | Notas clínicas / administrativas. |

**Relación opcional con Profesionales:** si el Frontend trabaja sobre `/profesionales`, puede usarse `profesionalId` en una etapa posterior. En esta propuesta se prioriza `medicoId` porque **ya está implementado** en `/turnos`.

### 3.3 Ejemplo TypeScript (propuesta)

```typescript
interface Turno {
  id: number;
  pacienteId: number;
  medicoId: number;
  especialidad: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:mm
  confirmado: boolean;
  observaciones?: string;
}

type CreateTurnoInput = Omit<Turno, 'id'>;
type UpdateTurnoInput = Partial<CreateTurnoInput>;
```

### 3.4 Ejemplo JSON (propuesta de body POST)

```json
{
  "pacienteId": 1,
  "medicoId": 2,
  "especialidad": "Pediatría",
  "fecha": "14/08/2026",
  "hora": "10.00",
  "confirmado": true,
  "observaciones": "Control de rutina"
}
```

### 3.5 Diagrama de relaciones (conceptual)

```text
Paciente (1) ──────── (N) Turno (N) ──────── (1) Medico
                              │
                              └── especialidad (valor / futura Especialidad)
```

---

## 4. Endpoints RESTful propuestos

Convención: plural de recurso, verbos HTTP estándar, IDs en path.

### 4.1 Pacientes — **propuesta (aún no implementada)**

| Método | Path | Descripción | Status esperados |
|--------|------|-------------|------------------|
| `GET` | `/pacientes` | Listar pacientes | 200, 500 |
| `GET` | `/pacientes/:id` | Obtener paciente por ID | 200, 400, 404, 500 |
| `POST` | `/pacientes` | Registrar paciente | 201, 400, 500 |
| `PUT` | `/pacientes/:id` | Actualizar paciente | 200, 400, 404, 500 |
| `DELETE` | `/pacientes/:id` | Baja (lógica o física) | 200/204, 400, 404, 500 |

#### Query params sugeridos (futuro)

| Query | Ejemplo | Uso |
|-------|---------|-----|
| `dni` | `31654210` | Búsqueda exacta |
| `activo` | `true` | Filtrar vigentes |

#### Body `POST /pacientes`

```json
{
  "dni": "31654210",
  "nombre": "Carlos",
  "apellido": "Ruiz",
  "fechaNacimiento": "1990-05-14",
  "telefono": "+54 9 11 5555-1234",
  "email": "carlos.ruiz@email.com",
  "activo": true
}
```

#### Respuesta exitosa `201`

```json
{
  "data": {
    "id": 1,
    "dni": "31654210",
    "nombre": "Carlos",
    "apellido": "Ruiz",
    "fechaNacimiento": "1990-05-14",
    "telefono": "+54 9 11 5555-1234",
    "email": "carlos.ruiz@email.com",
    "activo": true
  },
  "message": "Paciente creado"
}
```

#### Error `400`

```json
{
  "status": 400,
  "message": "Error de validación en los datos ingresados",
  "code": "VALIDATION_ERROR",
  "details": [
    { "field": "dni", "message": "dni es obligatorio" }
  ]
}
```

#### Error `404`

```json
{
  "status": 404,
  "message": "No se encontró el paciente con id 99",
  "code": "NOT_FOUND",
  "details": []
}
```

### 4.2 Turnos — **ya implementado** + evolución propuesta

| Método | Path | Estado | Descripción |
|--------|------|--------|-------------|
| `GET` | `/turnos` | **Implementado** | Listar (filtros: `especialidad`, `fecha`, `medicoId`) |
| `GET` | `/turnos/:id` | **Implementado** | Obtener por ID |
| `POST` | `/turnos` | **Implementado** | Crear (body actual con `paciente` string) |
| `PUT` | `/turnos/:id` | **Implementado** | Actualizar |
| `DELETE` | `/turnos/:id` | **Implementado** | Eliminar (`204`) |

#### Body actual (implementado)

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

#### Body propuesto (evolución, no implementado)

```json
{
  "pacienteId": 1,
  "medicoId": 1,
  "especialidad": "Pediatría",
  "fecha": "14/08/2026",
  "hora": "10.00",
  "confirmado": true,
  "observaciones": "Control de rutina"
}
```

---

## 5. Capas Clean Architecture (propuesta de implementación futura)

Cuando se implemente `/pacientes`, se sugiere la misma separación ya usada en el repo:

```text
src/
├── routes/pacientesRoutes.ts
├── controllers/pacienteController.ts   # o pacientesController.ts
├── services/pacienteService.ts
├── models/Paciente.ts
├── schemas/paciente.schema.ts          # Zod (alineado a /turnos y /medicos)
└── data/pacientes.json                 # o src/data/pacientes.json
```

Flujo:

1. `routes` declara verbos y paths.  
2. `controllers` validan entrada y arman respuesta HTTP.  
3. `services` contienen la lógica de negocio y coordinan las operaciones del dominio, delegando la persistencia en la capa de acceso a datos correspondiente.  
4. `models` tipan el dominio.  

Validaciones mínimas sugeridas:

- `dni` único y no vacío  
- `email` con formato válido  
- `fechaNacimiento` coherente  
- al crear turno: `pacienteId` y `medicoId` deben existir  

---

## 6. Compatibilidad con el sistema actual

| Recurso existente | Relación con este mockup |
|-------------------|--------------------------|
| `/turnos` | Base real del módulo Turnos; el mockup propone migrar a `pacienteId`. |
| `/medicos` | Destino de `medicoId` en turnos. |
| `/profesionales` | Alternativa futura a `medicoId` (`profesionalId`). |
| `/especialidades` | Posible reemplazo futuro del string `especialidad`. |
| `/` y `/health` | Fuera de alcance de este módulo. |

**Importante para Frontend:** mientras `/pacientes` no esté implementado, la asignación de turnos debe usar el contrato **actual** de `POST /turnos` (campos `paciente` + `documento`). Este documento anticipa la interfaz objetivo.

---

## 7. Resumen para el equipo Frontend

1. **Pacientes:** recurso nuevo propuesto en `/pacientes` (CRUD).  
2. **Turnos:** recurso `/turnos` **ya usable hoy**; evolución documentada hacia `pacienteId`.  
3. Arquitectura: mismas capas que el resto de TurnosRed.  
4. Errores: preferir el formato estandarizado `{ status, message, code, details }` ya usado en turnos/médicos.  

Para probar la API vigente, importar `turnos-red.postman_collection.json` y usar la variable de colección `baseUrl` (`http://localhost:4000`).
