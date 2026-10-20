# API de cursos

API REST desarrollada con NestJS, TypeORM y MySQL. Permite administrar usuarios,
catálogos, cursos, asignaciones e inscripciones.

## Requisitos y ejecución

Instala las dependencias y levanta la API en modo desarrollo:

```bash
npm install
npm run start:dev
```

Para compilar y ejecutar la aplicación en modo producción:

```bash
npm run build
npm run start:prod
```

## Ejecución con Docker

La imagen ejecuta la API en modo producción y se conecta a una instancia MySQL
existente. No crea la base de datos ni sincroniza las tablas: TypeORM está
configurado con `synchronize: false`.

1. Copia `.env.example` a `.env` y configura las credenciales de MySQL y un
   valor privado para `JWT_SECRET`. Si MySQL está en otra máquina, configura
   `DB_HOST` con un nombre de host o una dirección IP accesible desde Docker.
   Si MySQL está instalado en la máquina host, puedes usar
   `host.docker.internal`.
2. Construye y levanta la API:

   ```bash
   docker compose up --build -d
   ```

3. Comprueba el estado y los logs:

   ```bash
   docker compose ps
   docker compose logs -f api
   ```

El contenedor publica la API en `http://localhost:3000` por defecto; puedes
cambiar el puerto de la máquina host con `HOST_PORT` en `.env`. Para detenerla:

```bash
docker compose down
```

Antes de iniciar, comprueba que el contenedor pueda conectarse a MySQL y que la
base tenga todas las tablas y vistas que requiere la aplicación. No agregues
`.env` al repositorio ni lo subas: contiene secretos y está excluido de la
imagen.

La aplicación escucha en el puerto `3000` por defecto; configura `PORT` para
cambiarlo. La conexión a MySQL requiere `DB_HOST`, `DB_PORT`, `DB_USERNAME`,
`DB_PASSWORD` y `DB_DATABASE`. También es necesario definir `JWT_SECRET`.

NestJS no configura un prefijo global. Por eso, en local las rutas se llaman
directamente, por ejemplo:
`http://localhost:3000/niveles`.

En producción, Nginx puede publicar la API bajo un prefijo como `/api-backend`
y quitarlo al reenviar cada solicitud a NestJS. En ese caso, la URL pública
sería, por ejemplo, `https://tu-dominio/api-backend/niveles`, mientras NestJS
recibe internamente `/niveles`. La ubicación y la barra final de `proxy_pass`
en Nginx deben configurarse para quitar ese prefijo.

Las rutas reciben y devuelven JSON, excepto las que crean o eliminan cookies.
La aplicación valida los cuerpos de las solicitudes mediante los DTOs y
`ValidationPipe`. Las opciones `whitelist` y `transform` eliminan las
propiedades no declaradas y convierten los valores a los tipos esperados. Envía
los cuerpos JSON con `Content-Type: application/json`.

## Protección y autenticación

- **JWT en cookie:** `JwtCookieGuard` valida la cookie `jwt`, agrega el usuario
  a la solicitud y renueva la cookie. Puedes cambiar el nombre de la cookie con
  `JWT_COOKIE_NAME`.
- **Roles:** `RolesGuard` concede acceso administrativo al rol `0`; para los
  demás roles, compara el rol del usuario con los permitidos en la ruta.
- **CSRF:** la validación está desactivada en `main.ts`. La ruta `/csrf-token`
  genera un token, pero el middleware que validaría la cabecera
  `X-CSRF-Token` está comentado.

Las tablas indican la protección prevista según las anotaciones de cada
controlador. Si una anotación está comentada en el código, esa protección no se
aplica hasta que se habilite.

- 🔓 Ninguna (ruta pública).
- 🍪 JWT por cookie (`JwtCookieGuard`).
- 👥 Roles (`RolesGuard`).
- 🔐 JWT por cookie y roles.

> **Atención:** `PATCH /usuarios/:id` y `PATCH /usuarios/:id/desactivar` usan
> `req.user.sub`. Si los guards siguen comentados y ninguna otra capa asigna
> `req.user`, estas rutas pueden fallar al ejecutarse.

## Rutas

Las rutas de las tablas se muestran tal como las atiende NestJS, sin un
prefijo global. Por ejemplo, `GET /niveles` se llama en local como
`http://localhost:3000/niveles`. Si Nginx publica la API con un prefijo,
antepón ese prefijo a la URL pública; por ejemplo,
`https://tu-dominio/api-backend/niveles`.

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

### Roles

El catálogo `cat_roles` almacena los roles disponibles. `id_rol` es una clave
primaria asignada por quien crea el registro, no es autoincremental. `clave` y
`rol` son opcionales; `fecha_registro` la administra MySQL. Las rutas de lectura
son públicas y las de escritura requieren JWT por cookie y rol administrativo
`0`.

| Método   | Ruta         | Protección                                 | Función                 |
| -------- | ------------ | ------------------------------------------ | ----------------------- |
| `GET`    | `/roles`     | 🔓 Ninguna                                 | Lista los roles.        |
| `GET`    | `/roles/:id` | 🔓 Ninguna                                 | Obtiene un rol por ID.  |
| `POST`   | `/roles`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Crea un rol.            |
| `PATCH`  | `/roles/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza clave o rol.  |
| `DELETE` | `/roles/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina un rol.         |

Body de `POST /roles`:

```json
{
  "idRol": 2,
  "clave": "NR",
  "rol": "Nuevo rol"
}
```

`idRol` es obligatorio. `clave` y `rol` se pueden omitir o enviar como `null`.
Body parcial de `PATCH /roles/:id`:

```json
{
  "rol": "rol"
}
```

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

### Cargos

El catálogo `cat_cargo` almacena los cargos disponibles. Su columna de texto
se llama `cargo`. Cada registro de datos personales puede asociarse a un cargo
mediante `datos_personales.id_cargo`, que referencia `cat_cargo.id_cargo`.
Antes de crear o actualizar la asociación, el backend comprueba que el cargo
exista. Las rutas de escritura tienen anotaciones para JWT por cookie y rol `0`,
pero esas anotaciones están comentadas en el controlador. TypeORM no crea ni
actualiza el esquema automáticamente; las tablas y sus claves foráneas deben
existir previamente en MySQL.

| Método   | Ruta          | Protección                                 | Función                        |
| -------- | ------------- | ------------------------------------------ | ------------------------------ |
| `GET`    | `/cargos`     | 🔓 Ninguna                                 | Lista los cargos.              |
| `GET`    | `/cargos/:id` | 🔓 Ninguna                                 | Obtiene un cargo por ID.       |
| `POST`   | `/cargos`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Crea un cargo.                 |
| `PATCH`  | `/cargos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza el nombre del cargo. |
| `DELETE` | `/cargos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina un cargo.              |

Body de `POST /cargos`:

```json
{
  "cargo": "Docente"
}
```

`cargo` es obligatorio y acepta hasta 45 caracteres. Body parcial de
`PATCH /cargos/:id`:

```json
{
  "cargo": "Director"
}
```

### Inscripciones y datos personales

Los datos personales y las inscripciones forman parte del mismo módulo porque
comparten el flujo de registro, aunque cada uno se implementa en un submódulo
separado. La tabla `datos_personales` usa `id_datos_personales` como clave
primaria autoincremental y almacena CCT, institución, nombre, apellidos y
correo. La columna `inscripciones_cursos.id_datos_personales` debe tener el
mismo tipo y referenciar esa clave mediante una clave foránea.

Las rutas de lectura y creación no tienen guard indicado. Para edición y
eliminación se indica JWT por cookie y `RolesGuard` con rol `0`.

| Método   | Ruta                    | Protección                                 | Función                                          |
| -------- | ----------------------- | ------------------------------------------ | ------------------------------------------------ |
| `GET`    | `/datos-personales`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Lista los registros personales.                  |
| `GET`    | `/datos-personales/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Obtiene el registro por su ID autoincremental.   |
| `POST`   | `/datos-personales`     | 🔓 Ninguna                                 | Crea un registro; la base de datos genera su ID. |
| `PATCH`  | `/datos-personales/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza parcialmente los datos del registro.   |
| `DELETE` | `/datos-personales/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina el registro identificado por ID.         |

Body de `POST /datos-personales`:

```json
{
  "cct": "09ABC0001A",
  "institucion": "Institución de ejemplo",
  "nombre": "Juan",
  "apPaterno": "Pérez",
  "amMaterno": "García",
  "correo": "juan.perez@ejemplo.com",
  "idCargo": 1
}
```

Todos los campos del body son opcionales. `idCargo` debe corresponder a un
cargo existente o enviarse como `null`. `id_datos_personales` lo genera la
base de datos y aparece en la respuesta, junto con la información del cargo
asociado cuando existe. Body parcial de
`PATCH /datos-personales/:id`:

```json
{
  "institucion": "Nueva institución",
  "correo": "juan.nuevo@ejemplo.com",
  "idCargo": null
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

`cuposMax` no puede reducirse por debajo de la suma de los cupos base asignados
a los niveles del curso.

### Asignaciones de cursos

Todas las rutas indican JWT por cookie y `RolesGuard` con rol `0`. Se comprueba
que el curso y el nivel existan antes de crear o cambiar su asignación.
`subnivel`, si se proporciona, debe ser un ID existente del catálogo local y
pertenecer al mismo nivel; `dependencias` es un identificador externo opcional.
Cada asignación debe tener un cupo igual o inferior a `cursos.cupos_max`. La
suma de los cupos de las asignaciones base (sin subnivel ni dependencia) no
puede superar ese máximo del curso. Las asignaciones de subnivel son cupos
incluidos en el cupo base de su nivel: su suma no puede excederlo y no se suman
de nuevo al límite global del curso. No se puede reducir el cupo base por
debajo de los cupos ya asignados a sus subniveles; primero debe existir la
asignación base del nivel. Estas validaciones se aplican al crear y editar
asignaciones, dentro de una transacción que bloquea el curso para evitar
sobreasignaciones concurrentes. Si `POST /asignaciones-cursos` recibe una
combinación de curso, nivel, subnivel y dependencia que ya existe, devuelve un
conflicto y no modifica el cupo existente. Si la base ya contiene más de una
coincidencia, también devuelve un conflicto para evitar elegir una fila
arbitrariamente. Para modificar una asignación existente, usa
`PATCH /asignaciones-cursos/:id`.

| Método   | Ruta                       | Protección                                 | Función                                                           |
| -------- | -------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| `GET`    | `/asignaciones-cursos`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Lista asignaciones.                                               |
| `GET`    | `/asignaciones-cursos/cupos-por-nivel` | 🔓 Ninguna | Lee `v_cupos_por_nivel`, con cupos por nivel y total del curso. |
| `GET`    | `/asignaciones-cursos/cupos-por-subnivel` | 🔓 Ninguna | Lee `v_cupos_por_subnivel`, con cupos por subnivel/dependencia y total por nivel. |
| `GET`    | `/asignaciones-cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Obtiene una asignación.                                           |
| `POST`   | `/asignaciones-cursos`     | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Asigna curso, nivel, cupo y, opcionalmente, subnivel/dependencia. |
| `PATCH`  | `/asignaciones-cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza parcialmente una asignación.                            |
| `DELETE` | `/asignaciones-cursos/:id` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina una asignación.                                           |

Las dos rutas de cupos no reciben parámetros. Las vistas `v_cupos_por_nivel` y
`v_cupos_por_subnivel` deben existir previamente en MySQL. Ejemplos de URL local:

```text
GET http://localhost:3000/asignaciones-cursos/cupos-por-nivel
GET http://localhost:3000/asignaciones-cursos/cupos-por-subnivel
```

Si Nginx publica la API bajo `/api-backend`, antepón ese prefijo a la ruta
pública, por ejemplo:
`https://tu-dominio/api-backend/asignaciones-cursos/cupos-por-nivel`.

La ruta `cupos-por-nivel` devuelve las filas de la vista: un detalle por nivel
y un total por curso. La ruta `cupos-por-subnivel` agrupa las filas por curso y
nivel; cada elemento contiene `cupoTotalAsignado` y un arreglo `opciones` con
el nombre del subnivel o de la dependencia y su cupo asignado. Ejemplo:

```json
[
  {
    "idCurso": 1,
    "nombreCurso": "Curso de ejemplo",
    "idNivel": 2,
    "nombreNivel": "Educación básica",
    "cupoTotalAsignado": 15,
    "opciones": [
      {
        "idAsignacion": 8,
        "idSubnivel": 3,
        "nombreSubnivel": "Primaria",
        "idDependencias": null,
        "nombreDependencia": null,
        "tipoOpcion": "SUBNIVEL",
        "cupoAsignado": 10
      },
      {
        "idAsignacion": 9,
        "idSubnivel": null,
        "nombreSubnivel": null,
        "idDependencias": 4,
        "nombreDependencia": "Secretaría de Educación",
        "tipoOpcion": "DEPENDENCIA",
        "cupoAsignado": 5
      }
    ]
  }
]
```

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
pueden omitir o enviar como `null`; el subnivel debe existir y corresponder al
nivel indicado. Body parcial de
`PATCH /asignaciones-cursos/:id`:

```json
{
  "cupo": 20,
  "dependencias": null
}
```

### Inscripciones a cursos

La creación de inscripciones es pública para permitir el registro de personas
que no tienen una cuenta en el módulo de usuarios. Las rutas de consulta,
edición y eliminación tienen anotaciones para JWT por cookie y rol `0`; consulta
la sección de autenticación para conocer el estado de esas protecciones.

El `POST /inscripciones-cursos` recibe en un solo cuerpo los datos de la
inscripción y los datos personales. El correo es obligatorio y se utiliza para
identificar a la persona y evitar que se inscriba más de una vez al mismo curso.
Si ya existe un registro personal con ese correo, se reutiliza sin modificarlo;
si no existe, se crea. La inscripción y, cuando corresponda, el registro
personal se guardan juntos en una transacción.

La columna `fecha_registro` es de tipo `DATE`. MySQL la establece
automáticamente al crear la inscripción; no es necesario enviarla en el body.
Como TypeORM no crea ni actualiza tablas o vistas, crea previamente en MySQL
las vistas que se describen a continuación.

#### Vista de inscripciones

`GET /inscripciones-cursos/vista` consulta `v_inscripciones_cursos` y devuelve
todas las inscripciones con los datos del curso, nivel, subnivel, dependencia,
persona y cargo. Las rutas de consulta filtrada utilizan esta misma vista.

La columna `subnivel` de la vista debe devolver el nombre del subnivel, no su
ID. Para ello, une `inscripciones_cursos` con `cat_subniveles` y selecciona
`s.subnivel`. Esta definición conserva el nombre `subnivel` que espera el
endpoint:


#### Validación de cupos al inscribir

Antes de guardar, se verifica el cupo global del curso (`cursos.cupos_max`) y
el cupo base del nivel, que requiere una asignación del curso/nivel sin
subnivel ni dependencia. Si se selecciona un subnivel o una dependencia y hay
una asignación específica para esa opción, también se valida su cupo. Si no hay
asignación específica, se aplica únicamente el cupo base del nivel. El
formulario no puede enviar subnivel y dependencia a la vez. Los cupos y
duplicados se validan dentro de una transacción que bloquea el curso, para
evitar excederlos con solicitudes concurrentes. Para el mismo curso se
rechaza otra inscripción con el mismo correo; inscribir a la persona en cursos
distintos está permitido.

#### Resumen de las reglas de cupo

- **Cupo del curso:** la cantidad total de inscripciones del curso no puede
  superar `cursos.cupos_max`, sin importar el nivel ni la opción seleccionada.
- **Cupo del nivel:** cada inscripción, incluidas las que eligen subnivel o
  dependencia, cuenta para el cupo base de ese nivel. Por lo tanto, las opciones
  específicas no pueden hacer que el total del nivel sobrepase su cupo.
- **Cupos reservados:** las asignaciones específicas de subnivel o dependencia
  reservan lugares dentro del cupo base. Las inscripciones sin subnivel ni
  dependencia solo pueden usar el cupo base menos esos lugares reservados. Por
  ejemplo, con 5 lugares para el nivel y 2 asignados a un subnivel, solo se
  aceptan 3 inscripciones generales; los otros 2 quedan disponibles para ese
  subnivel.
- **Cupo de subnivel o dependencia:** la persona puede elegir como máximo una
  de estas opciones. Si existe una asignación específica para la opción
  seleccionada, también se verifica su cupo; si no existe, se aplica solamente
  el cupo base del nivel.
- **Asignación base requerida:** para inscribir personas en un nivel debe
  existir una asignación del curso y nivel con `subnivel` y `dependencias` en
  `NULL`.

| Método   | Ruta                          | Protección                                 | Función                                                         |
| -------- | ----------------------------- | ------------------------------------------ | --------------------------------------------------------------- |
| `GET`    | `/inscripciones-cursos`       | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Lista inscripciones.                                            |
| `GET`    | `/inscripciones-cursos/vista` | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Lista inscripciones con curso, nivel, datos personales y cargo. |
| `GET`    | `/inscripciones-cursos/vista/curso/:idCurso` | 🔓 Ninguna | Lista las inscripciones de un curso, sin filtrar por nivel ni subnivel. |
| `GET`    | `/inscripciones-cursos/vista/nivel/:nivel?idCurso=:idCurso` | 🔓 Ninguna | Filtra las inscripciones por curso y nivel. |
| `GET`    | `/inscripciones-cursos/conteo?idCurso=:idCurso&nivel=:nivel` | 🔓 Ninguna | Cuenta las inscripciones de un curso y nivel. |
| `GET`    | `/inscripciones-cursos/cupos?idCurso=:idCurso&nivel=:nivel` | 🔓 Ninguna | Devuelve el cupo del nivel, las plazas ocupadas y las disponibles. |
| `GET`    | `/inscripciones-cursos/:id`   | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Obtiene una inscripción.                                        |
| `POST`   | `/inscripciones-cursos`       | 🔓 Ninguna                                 | Inscribe los datos enviados a un curso y nivel.                 |
| `PATCH`  | `/inscripciones-cursos/:id`   | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza parcialmente una inscripción.                         |
| `DELETE` | `/inscripciones-cursos/:id`   | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina una inscripción.                                        |

El filtro por nivel y las rutas de conteo y cupos requieren tanto el ID del
curso como el ID del nivel, ya que cada curso puede tener cupos distintos por
nivel. El filtro por curso solo requiere el ID del curso. Ejemplos:

```text
GET /inscripciones-cursos/vista/nivel/2?idCurso=1
GET /inscripciones-cursos/vista/curso/1
GET /inscripciones-cursos/conteo?idCurso=1&nivel=2
GET /inscripciones-cursos/cupos?idCurso=1&nivel=2
```

`GET /inscripciones-cursos/cupos` consulta la vista `vista_cupos_nivel`.
La vista incluye solo las asignaciones base del nivel (sin subnivel ni
dependencia). Si no existe una asignación base para el curso y nivel indicados,
la ruta de cupos devuelve `404`. El endpoint de conteo devuelve `0` cuando no
hay inscripciones.

Body de `POST /inscripciones-cursos`:

```json
{
  "idCurso": 1,
  "cct": "09ABC0001A",
  "institucion": "Institución de ejemplo",
  "nombre": "Juan",
  "apPaterno": "Pérez",
  "amMaterno": "García",
  "correo": "juan.perez@ejemplo.com",
  "idCargo": 1,
  "nivel": 1,
  "subnivel": "PRIMARIA GENERAL"
}
```

Los campos `idCurso`, `correo` y `nivel` son obligatorios. `nivel` debe ser el
ID del nivel en el catálogo local. Si se envía `subnivel`, debe ser el nombre
concatenado que proporciona el frontend (por ejemplo,
`n_nivel + " " + n_subnivel`). El backend busca ese nombre en
`cat_subniveles.subnivel`, dentro del nivel indicado, y obtiene el
`id_subnivel` correspondiente. La búsqueda ignora mayúsculas y minúsculas, así
como espacios al inicio y al final. Si no encuentra el subnivel, responde
`404`; si hay más de una coincidencia en el mismo nivel, responde `409`.

`dependencia` también es opcional. Se puede enviar un subnivel, una dependencia
o ninguno de los dos (omitido o con valor `null`) para una inscripción general.
No se permite enviar ambos con valor. Al enviar un subnivel, `nivel` debe
identificar el nivel al que pertenece. Los demás datos personales son
opcionales. Si ya existe un registro personal con el correo enviado, se
reutiliza y sus datos no se sobrescriben.

Ejemplo de inscripción general, sin subnivel ni dependencia:

```json
{
  "idCurso": 1,
  "nivel": 1,
  "correo": "persona@ejemplo.com",
  "subnivel": null,
  "dependencia": null
}
```

`GET /inscripciones-cursos/vista` devuelve cada inscripción como un registro
plano, con `idCurso`, nombre del curso, `idNivel`, nombre del nivel, subnivel,
dependencia, cargo, datos personales y `fechaRegistro`. Si no hay cargo
asociado, `cargo` será `null`; `subnivel` contiene el nombre del catálogo o
`null` si la inscripción no tiene uno. La fecha se genera en MySQL y no se
envía en el body.

Body parcial de `PATCH /inscripciones-cursos/:id`:

```json
{
  "nivel": 1,
  "subnivel": "PRIMARIA GENERAL"
}
```

Al enviar `subnivel` en una actualización, también se debe enviar `nivel` con
el ID local del nivel. El backend resuelve el nombre dentro de ese nivel. Para
quitar el subnivel y dejar la inscripción general, envía `"subnivel": null`
junto con `nivel`.

### Subniveles

El módulo administra `cat_subniveles`. Cada subnivel tiene un ID asignado por
el cliente, pertenece a un nivel y recibe `fecha_registro` automáticamente.
Los subniveles se validan al asignar cupos y al inscribir: el subnivel enviado
debe existir y pertenecer al mismo nivel de la asignación o inscripción. No se
puede cambiar de nivel ni eliminar un subnivel usado por asignaciones o
inscripciones.

| Método   | Ruta                         | Protección                                 | Función                                                               |
| -------- | ---------------------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| `GET`    | `/subniveles`                | 🔓 Ninguna                                 | Lista subniveles.                                                     |
| `GET`    | `/subniveles/vista`          | 🔓 Ninguna                                 | Lista niveles con sus subniveles usando `v_niveles_subniveles`.       |
| `GET`    | `/subniveles/nivel/:idNivel` | 🔓 Ninguna                                 | Consulta en `v_niveles_subniveles` los subniveles del nivel indicado. |
| `GET`    | `/subniveles/:id`            | 🔓 Ninguna                                 | Obtiene un subnivel por ID.                                           |
| `POST`   | `/subniveles`                | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Crea un subnivel asociado a un nivel.                                 |
| `PATCH`  | `/subniveles/:id`            | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Actualiza nivel o descripción del subnivel.                           |
| `DELETE` | `/subniveles/:id`            | 🔐 JWT por cookie + `RolesGuard` (rol `0`) | Elimina un subnivel que no esté en uso.                               |

Las rutas `/subniveles/vista` y `/subniveles/nivel/:idNivel` consultan la vista
`v_niveles_subniveles`, que debe existir en MySQL. `GET /subniveles/vista`
devuelve todas las filas de la vista; cada fila contiene un nivel y uno de sus
subniveles. `GET /subniveles/nivel/1` devuelve solo las filas del nivel con ID
`1` y responde `404` si ese nivel no existe. La vista usa un `JOIN` interno,
por lo que no incluye niveles que todavía no tengan subniveles.

Body de `POST /subniveles`:

```json
{
  "idNivel": 1,
  "subnivel": "Primaria"
}
```

`idSubnivel` e `idNivel` son obligatorios; `subnivel` puede ser `null` y
acepta hasta 50 caracteres. Body parcial de `PATCH /subniveles/:id`:

```json
{
  "subnivel": "Primaria alta"
}
```

## Pruebas

```bash
npm test -- --runInBand
npm run test:e2e
```
