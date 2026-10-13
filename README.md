# API de cursos

Backend REST desarrollado con NestJS, TypeORM y MySQL. La API administra
usuarios, catálogos y cursos con sus asignaciones e inscripciones.

## Requisitos y ejecución

Instala dependencias y ejecuta en desarrollo:

```bash
npm install
npm run start:dev
```

Para compilar y ejecutar en producción:

```bash
npm run build
npm run start:prod
```

La aplicación escucha en el puerto `3000` por defecto. Se puede configurar con
`PORT`. La conexión requiere `DB_HOST`, `DB_PORT`, `DB_USERNAME`,
`DB_PASSWORD` y `DB_DATABASE`. La firma JWT requiere `JWT_SECRET`.

La base URL local por defecto es `http://localhost:3000`. No se configura un
prefijo global de rutas.

Todas las rutas reciben y devuelven JSON, salvo las que crean o limpian cookies.
La aplicación habilita `ValidationPipe` global con `whitelist` y `transform`:
los bodies se validan según sus DTOs y se eliminan propiedades no declaradas.
Para enviar un body, utiliza `Content-Type: application/json`.

## Protección y autenticación

- **JWT por cookie**: `JwtCookieGuard` valida la cookie `jwt`, carga el usuario
  en la petición y renueva la cookie. El nombre por defecto se puede cambiar con
  `JWT_COOKIE_NAME`.
- **Roles**: `RolesGuard` permite que el rol `0` tenga acceso
  administrativo y omite la comparación de roles; otros roles deben coincidir
  con los declarados en la ruta.
- La validación CSRF está desactivada en `main.ts`; `/csrf-token` emite el token,
  pero el middleware que comprobaría la cabecera `X-CSRF-Token` está comentado.

Las tablas muestran la protección prevista para cada ruta según las anotaciones
del controlador, incluso cuando estas están comentadas en el código. Las
anotaciones comentadas no se aplican hasta descomentarlas.

- 🔓 Ninguna (ruta pública).
- 🍪 JWT por cookie (`JwtCookieGuard`).
- 👥 Roles (`RolesGuard`).
- 🔐 JWT por cookie y roles.

> **Atención:** `PATCH /usuarios/:id` y `PATCH /usuarios/:id/desactivar` usan
> `req.user.sub`. Mientras las anotaciones de guard estén comentadas, sin otra
> capa que asigne `req.user` estas rutas pueden fallar en tiempo de ejecución.

## Rutas

### Estado de la aplicación

| Método | Ruta | Protección | Función                                                        |
| ------ | ---- | ---------- | -------------------------------------------------------------- |
| `GET`  | `/`  | 🔓 Ninguna | Comprueba que la aplicación responde; devuelve `Hello World!`. |

### Autenticación

| Método | Ruta            | Protección                                               | Función                                                                     |
| ------ | --------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `GET`  | `/csrf-token`   | 🔓 Ninguna                                               | Genera un token CSRF y lo devuelve; también lo coloca en la cookie CSRF.    |
| `GET`  | `/me`           | 🍪 JWT por cookie (`JwtCookieGuard`)                     | Devuelve los datos del usuario incluidos en el JWT actual.                  |
| `POST` | `/login`        | 🔓 Ninguna; puede requerir reCAPTCHA si está configurado | Valida credenciales, actualiza el último acceso y emite cookies JWT y CSRF. |
| `POST` | `/login/logout` | 🔓 Ninguna                                               | Limpia las cookies JWT y CSRF.                                              |

Body de `POST /login`:

```json
{
  "correo": "persona@ejemplo.com",
  "password": "ClaveSegura123",
  "captcha": "token-recaptcha"
}
```

`captcha` es opcional si reCAPTCHA no está configurado. También se acepta
`recaptchaToken` en lugar de `captcha`. La respuesta incluye `mensaje`, `correo`,
`nombre` y `csrfToken`; las cookies se envían en los headers de la respuesta.

`GET /me` devuelve `idUsuario`, `idRol`, `nombre`, `apPaterno`, `apMaterno` y
`correo`.

### Usuarios

La protección prevista para las rutas de usuarios es JWT por cookie y rol `0`,
según las anotaciones del controlador.

| Método   | Ruta                       | Protección                                 | Función                                                                                              |
| -------- | -------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `GET`    | `/usuarios`                | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Lista usuarios; nunca incluye `passwordHash`.                                                        |
| `GET`    | `/usuarios/correo/:correo` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Busca un usuario por correo. Codifica el correo como segmento URL si contiene caracteres especiales. |
| `POST`   | `/usuarios`                | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Crea un usuario; asigna el ID la base y almacena la contraseña como hash si se proporciona.          |
| `PATCH`  | `/usuarios/:id`            | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza los campos enviados. La contraseña, si se envía, se almacena como hash.                    |
| `PATCH`  | `/usuarios/:id/activar`    | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Activa el usuario.                                                                                   |
| `PATCH`  | `/usuarios/:id/desactivar` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Desactiva el usuario.                                                                                |
| `DELETE` | `/usuarios/:id`            | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina el usuario.                                                                                  |

Body de `POST /usuarios`:

```json
{
  "idRol": 1,
  "nombre": "Ana",
  "apPaterno": "Pérez",
  "apMaterno": "López",
  "correo": "ana.perez@ejemplo.com",
  "password": "ClaveSegura123"
}
```

`idRol` es obligatorio. Los demás campos son opcionales.

Body parcial de `PATCH /usuarios/:id` (todos los campos son opcionales):

```json
{
  "idRol": 1,
  "nombre": "Ana María",
  "apPaterno": "Pérez",
  "apMaterno": "López",
  "correo": "ana.maria@ejemplo.com",
  "password": "NuevaClave123"
}
```

Los endpoints de activación/desactivación y eliminación no requieren body.

### Niveles

Las rutas de lectura no tienen guard indicado. Para creación, edición y
eliminación se indica JWT por cookie y `RolesGuard` con rol `0`.

| Método   | Ruta           | Protección                                 | Función                     |
| -------- | -------------- | ------------------------------------------ | --------------------------- |
| `GET`    | `/niveles`     | 🔓 Ninguna                                 | Lista niveles del catálogo. |
| `GET`    | `/niveles/:id` | 🔓 Ninguna                                 | Obtiene un nivel por ID.    |
| `POST`   | `/niveles`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Agrega un nivel.            |
| `PATCH`  | `/niveles/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Cambia el nombre del nivel. |
| `DELETE` | `/niveles/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina el nivel.           |

Body de `POST /niveles`:

```json
{ "nivel": "Educación básica" }
```

Body parcial de `PATCH /niveles/:id`:

```json
{ "nivel": "Educación media" }
```

### Dependencias

Las rutas de lectura no tienen guard indicado. Para creación, edición y
eliminación se indica JWT por cookie y `RolesGuard` con rol `0`.

| Método   | Ruta                | Protección                                 | Función                                             |
| -------- | ------------------- | ------------------------------------------ | --------------------------------------------------- |
| `GET`    | `/dependencias`     | 🔓 Ninguna                                 | Lista dependencias.                                 |
| `GET`    | `/dependencias/:id` | 🔓 Ninguna                                 | Obtiene una dependencia.                            |
| `POST`   | `/dependencias`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Crea una dependencia asociada a un nivel existente. |
| `PATCH`  | `/dependencias/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza el nivel asociado y/o el nombre.          |
| `DELETE` | `/dependencias/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina una dependencia.                            |

Body de `POST /dependencias`:

```json
{
  "idNivel": 1,
  "dependencia": "Secretaría de Educación"
}
```

Body parcial de `PATCH /dependencias/:id`:

```json
{
  "idNivel": 2,
  "dependencia": "Nueva dependencia"
}
```

`idNivel` debe corresponder a un nivel existente.

### Inscripciones y datos personales

Los datos personales y las inscripciones están organizados juntos bajo el
módulo de inscripciones porque comparten el flujo de registro. Se mantienen
como submódulos separados y las rutas públicas existentes no cambian.

Las rutas de lectura y creación no tienen guard indicado. Para edición y
eliminación se indica JWT por cookie y `RolesGuard` con rol `0`. La CURP es la
clave primaria, se normaliza a mayúsculas y no se cambia en `PATCH`.

| Método   | Ruta                      | Protección                                 | Función                                        |
| -------- | ------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `GET`    | `/datos-personales`       | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Lista los registros personales.                |
| `GET`    | `/datos-personales/:curp` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Obtiene el registro identificado por CURP.     |
| `POST`   | `/datos-personales`       | 🔓 Ninguna                                 | Crea un registro personal.                     |
| `PATCH`  | `/datos-personales/:curp` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza parcialmente los datos del registro. |
| `DELETE` | `/datos-personales/:curp` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina el registro.                           |

Body de `POST /datos-personales`:

```json
{
  "curp": "PEGJ800101HDFRRN09",
  "cct": "09ABC0001A",
  "escuela": "Escuela de ejemplo",
  "nombre": "Juan",
  "apPaterno": "Pérez",
  "amMaterno": "García",
  "correo": "juan.perez@ejemplo.com"
}
```

`curp` es obligatoria y debe tener 18 caracteres. Los demás campos son
opcionales. Body parcial de `PATCH /datos-personales/:curp`:

```json
{
  "escuela": "Nueva escuela",
  "correo": "juan.nuevo@ejemplo.com"
}
```

### Cursos

Las rutas de lectura no tienen guard indicado. Para creación, edición y
eliminación se indica JWT por cookie y `RolesGuard` con rol `0`.

| Método   | Ruta          | Protección                                 | Función                                                                           |
| -------- | ------------- | ------------------------------------------ | --------------------------------------------------------------------------------- |
| `GET`    | `/cursos`     | 🔓 Ninguna                                 | Lista cursos.                                                                     |
| `GET`    | `/cursos/:id` | 🔓 Ninguna                                 | Obtiene un curso por ID.                                                          |
| `POST`   | `/cursos`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Crea un curso y recibe fechas de inscripción y del curso, además del cupo máximo. |
| `PATCH`  | `/cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza parcialmente los datos del curso.                                       |
| `DELETE` | `/cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina un curso.                                                                 |

Body de `POST /cursos`:

```json
{
  "nombre": "Curso de ejemplo",
  "fechaInicioInscripcion": "2026-10-01",
  "fechaFinInscripcion": "2026-10-31",
  "fechaInicioCurso": "2026-11-10",
  "fechaFinCurso": "2026-12-10",
  "cuposMax": 30
}
```

`nombre` y `cuposMax` son obligatorios. Las fechas son opcionales y deben usar
formato `YYYY-MM-DD`. Body parcial de `PATCH /cursos/:id`:

```json
{
  "fechaFinInscripcion": "2026-11-05",
  "cuposMax": 35
}
```

### Asignaciones de cursos

Todas las rutas indican JWT por cookie y `RolesGuard` con rol `0`. Se comprueba
que el curso y el nivel existan antes de crear o cambiar su asignación. Los
valores de subnivel y dependencia son identificadores opcionales externos.

| Método   | Ruta                       | Protección                                 | Función                                                           |
| -------- | -------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| `GET`    | `/asignaciones-cursos`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Lista asignaciones.                                               |
| `GET`    | `/asignaciones-cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Obtiene una asignación.                                           |
| `POST`   | `/asignaciones-cursos`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Asigna curso, nivel, cupo y, opcionalmente, subnivel/dependencia. |
| `PATCH`  | `/asignaciones-cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza parcialmente una asignación.                            |
| `DELETE` | `/asignaciones-cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina una asignación.                                           |

Body de `POST /asignaciones-cursos`:

```json
{
  "idCurso": 1,
  "idNivel": 2,
  "subnivel": 3,
  "dependencias": 4,
  "cupo": 25
}
```

`idCurso`, `idNivel` y `cupo` son obligatorios. `subnivel` y `dependencias` se
pueden omitir o enviar como `null`. Body parcial de
`PATCH /asignaciones-cursos/:id`:

```json
{
  "cupo": 20,
  "dependencias": null
}
```

### Inscripciones a cursos

Las rutas de consulta, edición y eliminación indican JWT por cookie y
`RolesGuard` con rol `0`; la creación es pública para permitir inscripciones
sin una cuenta del módulo de usuarios. El `POST` recibe en un mismo body los
datos de inscripción y los datos personales. Si la CURP no existe, crea el
registro personal dentro de la misma transacción; si ya existe, lo reutiliza
sin modificarlo. La inscripción y el alta personal se confirman juntas.

Antes de guardar, se verifica el cupo global del curso (`cursos.cupos_max`) y
el cupo base del nivel, que requiere una asignación del curso/nivel sin
subnivel ni dependencia. Si se selecciona un subnivel o una dependencia y hay
una asignación específica para esa opción, también se valida su cupo. Si no hay
asignación específica, se aplica únicamente el cupo base del nivel. El
formulario no puede enviar subnivel y dependencia a la vez. Los cupos y
duplicados se validan dentro de una transacción que bloquea el curso, para
evitar excederlos con solicitudes concurrentes. Para el mismo curso se
rechaza otra inscripción con la misma CURP o con el mismo correo asociado;
inscribir a la persona en cursos distintos está permitido.

#### Reglas de inscripción

- **Cupo del curso:** la cantidad total de inscripciones del curso no puede
  superar `cursos.cupos_max`, sin importar el nivel ni la opción seleccionada.
- **Cupo del nivel:** cada inscripción, incluidas las que eligen subnivel o
  dependencia, cuenta para el cupo base de ese nivel. Por lo tanto, las opciones
  específicas no pueden hacer que el total del nivel sobrepase su cupo.
- **Cupo de subnivel o dependencia:** la persona puede elegir como máximo una
  de estas opciones. Si existe una asignación específica para la opción
  seleccionada, también se verifica su cupo; si no existe, se aplica solamente
  el cupo base del nivel.
- **Asignación base requerida:** para inscribir personas en un nivel debe
  existir una asignación del curso y nivel con `subnivel` y `dependencias` en
  `NULL`.

| Método   | Ruta                        | Protección                                 | Función                                         |
| -------- | --------------------------- | ------------------------------------------ | ----------------------------------------------- |
| `GET`    | `/inscripciones-cursos`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Lista inscripciones.                            |
| `GET`    | `/inscripciones-cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Obtiene una inscripción.                        |
| `POST`   | `/inscripciones-cursos`     | 🔓 Ninguna                                 | Inscribe los datos enviados a un curso y nivel. |
| `PATCH`  | `/inscripciones-cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza parcialmente una inscripción.         |
| `DELETE` | `/inscripciones-cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina una inscripción.                        |

Body de `POST /inscripciones-cursos`:

```json
{
  "idCurso": 1,
  "curp": "PEGJ800101HDFRRN09",
  "cct": "09ABC0001A",
  "escuela": "Escuela de ejemplo",
  "nombre": "Juan",
  "apPaterno": "Pérez",
  "amMaterno": "García",
  "correo": "juan.perez@ejemplo.com",
  "nivel": 2,
  "subnivel": 3
}
```

`idCurso`, `curp` y `nivel` son obligatorios. La CURP debe tener 18 caracteres.
Los campos personales restantes y `subnivel`/`dependencia` son opcionales; solo
se puede proporcionar uno de los dos últimos. Si la CURP ya existe, los datos
personales enviados no sobrescriben el registro existente.
Body parcial de `PATCH /inscripciones-cursos/:id`:

```json
{
  "nivel": 3,
  "curp": "PEGJ800101HDFRRN09",
  "subnivel": null
}
```

### Subniveles

No existe una ruta local `/subniveles`: el módulo de subniveles fue retirado y
esa información se obtendrá de una API externa.

## Pruebas

```bash
npm test -- --runInBand
npm run test:e2e
```
