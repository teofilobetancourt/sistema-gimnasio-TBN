# Documentación del Proyecto: Sistema de Gestión de Gimnasio

Este documento proporciona una descripción detallada de la arquitectura, componentes y flujo de datos del sistema de gestión de gimnasio.

## 1. Visión General del Proyecto

El sistema es una aplicación web diseñada para administrar las operaciones diarias de un gimnasio. Permite la gestión de miembros, membresías, pagos, visitas, usuarios del sistema y configuración del negocio.

**Tecnologías Principales:**
*   **Frontend:** Vue.js (v2), Vuetify (Framework de UI), Vue Router, Vue Toastification.
*   **Backend:** PHP (Nativo/Vanilla), PDO para base de datos.
*   **Base de Datos:** MySQL / MariaDB.
*   **Comunicación:** API RESTful (JSON).

---

## 2. Arquitectura del Sistema

El proyecto sigue una arquitectura **Cliente-Servidor**:

1.  **Cliente (Frontend):** Una Single Page Application (SPA) construida con Vue.js. Se encarga de la interfaz de usuario y la lógica de presentación.
2.  **Servidor (Backend):** Scripts de PHP que exponen una API. Reciben peticiones JSON, procesan la lógica de negocio y se comunican con la base de datos.
3.  **Base de Datos:** Almacena toda la información persistente.

### Flujo de Datos Típico
1.  El usuario interactúa con un componente Vue (ej. `Miembros.vue`).
2.  El componente llama a `HttpService.js`.
3.  `HttpService.js` hace una petición `fetch` (POST/GET) a un archivo PHP en `api/` (ej. `api/miembros.php`).
4.  El archivo PHP recibe la petición, decodifica el JSON, y llama a una función específica (ej. en `funciones_miembros.php`).
5.  La función ejecuta una consulta SQL mediante `base_datos.php`.
6.  El resultado se devuelve como JSON al frontend para actualizar la vista.

---

## 3. Estructura de Carpetas

### Raíz del Proyecto
*   `api/`: Contiene todo el código del backend PHP.
*   `src/`: Contiene el código fuente del frontend Vue.js.
*   `bd_esquema.sql`: Script SQL para crear la estructura de la base de datos.
*   `package.json`: Dependencias de Node.js y scripts de construcción.

### Backend (`api/`)
Los archivos aquí actúan como "Controladores".
*   `base_datos.php`: Maneja la conexión a la base de datos usando PDO.
*   `encabezado.php`: Configura los headers CORS para permitir peticiones desde el frontend.
*   `[entidad].php` (ej. `miembros.php`, `pagos.php`): Puntos de entrada de la API. Reciben el payload JSON y deciden qué acción tomar (switch case).
*   `funciones_[entidad].php` (ej. `funciones_miembros.php`): Contienen la lógica pura y las consultas SQL.

### Frontend (`src/`)
*   `main.js`: Punto de entrada. Inicializa Vue, Vuetify, Router y Toast.
*   `App.vue`: Componente raíz. Maneja el estado global de autenticación (`logeado`), el layout principal (menú lateral/encabezado) y las notificaciones (`snackbar`).
*   `router/index.js`: Define las rutas de la aplicación (URLs) y qué componente cargar para cada una.
*   `Servicios/HttpService.js`: Módulo centralizado para realizar peticiones HTTP a la API.
*   `components/`: Contiene las vistas y componentes de la UI, organizados por módulos.

---

## 4. Módulos Principales (Frontend y Backend)

### 4.1. Autenticación y Usuarios
*   **Frontend:** `src/components/Usuarios/` (`Login.vue`, `Usuarios.vue`, `NuevoUsuario.vue`, `CambiarPassword.vue`).
*   **Backend:** `api/usuarios.php`, `api/funciones_usuarios.php`.
*   **Funcionalidad:** Login, gestión de usuarios del sistema (administradores/empleados), cambio de contraseñas. El estado de sesión se persiste en `localStorage`.

### 4.2. Miembros (Clientes)
*   **Frontend:** `src/components/Miembros/` (`Miembros.vue`, `NuevoMiembro.vue`, `EditarMiembro.vue`, `CredencialMiembro.vue`).
*   **Backend:** `api/miembros.php`, `api/funciones_miembros.php`.
*   **Funcionalidad:** CRUD completo de clientes. Incluye foto, generación de credenciales, historial de pagos y estado de la membresía (ACTIVO/VENCIDO).

### 4.3. Membresías
*   **Frontend:** `src/components/Membresias/` (`Membresias.vue`, `FormMembresia.vue`).
*   **Backend:** `api/membresias.php`, `api/funciones_membresias.php`.
*   **Funcionalidad:** Definición de tipos de planes (ej. "Mensualidad", "Semanal"), precios y duración en días.

### 4.4. Pagos y Caja
*   **Frontend:** `src/components/Pagos/` (`Pagos.vue`), `src/components/Miembros/RealizarPago.vue`.
*   **Backend:** `api/pagos.php`, `api/funciones_pagos.php`.
*   **Funcionalidad:** Registro de pagos de membresías. Los pagos se asocian a un miembro y un usuario (quien cobra).

### 4.5. Visitas
*   **Frontend:** `src/components/Visitas/` (`Visitas.vue`, `RegistrarVisita.vue`).
*   **Backend:** `api/visitas.php`, `api/funciones_visitas.php`.
*   **Funcionalidad:** Registro de entrada de clientes. Verifica si la membresía está activa.

### 4.6. Configuración
*   **Frontend:** `src/components/Configuracion/`.
*   **Backend:** `api/ajustes.php`.
*   **Funcionalidad:** Configuración de datos del gimnasio (nombre, logo, teléfono) que aparecen en reportes y credenciales.

---

## 5. Base de Datos (Esquema)

Las tablas principales identificadas en `bd_esquema.sql`:

*   `membresias`: Tipos de planes (id, nombre, duracion, precio).
*   `usuarios`: Usuarios del sistema (login, password, nombre).
*   `miembros`: Clientes (datos personales, foto, estado, fechas de inicio/fin, idMembresia).
*   `pagos`: Registro histórico de pagos (monto, fecha, idMiembro, idUsuario).
*   `visitas`: Registro de asistencias.
*   `ajustes`: Configuración global.
*   `gastos`, `productos`, `ventas`: Tablas adicionales para gestión financiera y punto de venta (si están implementadas en el frontend).

---

## 6. Detalles de Implementación Clave

### Servicio HTTP (`HttpService.js`)
Utiliza una constante `RUTA_GLOBAL` apuntando a `http://localhost/sistema-gimnasio/api/`.
Métodos principales:
*   `obtener(ruta)`: GET request.
*   `registrar(datos, ruta)`: POST request con payload JSON.
*   `obtenerConDatos(datos, ruta)`: POST request para búsquedas o filtros.

### Seguridad
*   **Frontend:** `App.vue` verifica `localStorage` para determinar si el usuario está logueado. Si no, muestra el componente `Login`.
*   **Backend:** Se recomienda validar sesiones en el backend (actualmente parece depender de la validación del frontend y envío de IDs).
*   **Contraseñas:** Se almacenan (deberían estar hasheadas, verificar en `funciones_usuarios.php`).

### UI/UX
*   Uso extensivo de **Vuetify** (`v-data-table`, `v-dialog`, `v-card`, `v-snackbar`) para una interfaz material design consistente.
*   Sistema de notificaciones Toast para feedback al usuario.
