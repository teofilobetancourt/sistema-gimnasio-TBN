## Documentación General

Este documento describe cada módulo del proyecto **Sistema de Gestión para Gimnasios**, abarcando tanto el frontend (Vue + Vuetify) como el backend en PHP. Para cada componente o script se detallan responsabilidades, entradas, salidas, dependencias y consideraciones relevantes.

---

## Frontend (Vue 2 + Vuetify)

### Núcleo de la aplicación

- **`src/main.js`**  
  Configura Vue con el router, la instancia de Vuetify y el plugin `vue-toastification`. Monta el componente raíz `App` en `#app`.

- **`src/Vuetify.js`**  
  Inicializa Vuetify con el set de íconos `mdi`. Define paletas para modos claro y oscuro, a las que acceden los componentes vía `$vuetify.theme`.

- **`src/App.vue`**  
  Contención principal. Gestiona la autenticación básica (persistida en `localStorage`), carga datos de ajustes del negocio y decide qué vista mostrar (`Login`, `CambiarPassword` o layout principal con `Encabezado` + `router-view`). Maneja un snackbar global para notificaciones de sesión.

- **`src/router/index.js`**  
  Declara el enrutamiento de la SPA. Expone rutas para dashboard, gestión de membresías, clientes, usuarios, pagos, visitas, configuración y perfil. La navegación se usa desde `Encabezado` y botones internos.

### Servicios compartidos

- **`src/Servicios/HttpService.js`**  
  Abstracción de `fetch` sobre la API PHP (`RUTA_GLOBAL`). Expone métodos `registrar`, `obtenerConDatos`, `obtener` y `eliminar`, todos retornan `JSON`. Espera cuerpos en formato JSON y reutiliza POST para la mayoría de operaciones (crear, actualizar, obtener con filtros, eliminar).

- **`src/Servicios/Utiles.js`**  
  Utilidades de front:
  - `generarURL` compone rutas absolutas a imágenes alojadas en el backend.
  - Transformadores para arrays de reportes (`obtenerClaves`, `obtenerValores`, `obtenerValoresPagos`).
  - Mapas de días y meses (`cambiarDiaSemana`, `cambiarNumeroANombreMes`) que enriquecen los datos de gráficas.

### Componentes globales

- **`src/components/Encabezado.vue`**  
  Banner superior con botón flotante para el drawer de navegación, toggles de tema y cierre de sesión. Lee datos del gimnasio y del usuario desde `localStorage` y limita el menú según el rol (`admin` vs empleados).

- **`src/components/HelloWorld.vue`**  
  Componente de ejemplo sin uso funcional; muestra un botón de Vuetify.

- **`src/components/InicioComponent.vue`**  
  Dashboard principal:
  - Obtiene métricas de `inicio.php` y tasa BCV desde `tasa_bcv.php` (con fallback manual).
  - Anima tarjetas de mensualidades y pagos, arma listados interactivos y grafica datos mediante `SparklineComponent`.
  - Permite consultar detalles de miembros vía `axios` + `miembros.php`.
  - Persiste la tasa en `localStorage`, maneja modo offline y confirma manualmente cuando la API BCV falla.

### Componentes de utilería (`src/components/Dialogos/*`)

- **`Breadcrumbs.vue`**  
  Render simple de la jerarquía de navegación (props `items`).

- **`CartasPersonalizadas.vue`**  
  Cuadrícula de tarjetas con estadísticos. Recibe arreglo `cartas` con `icono`, `color`, `nombre`, `total`.

- **`CartasTotales.vue`**  
  Variante de tarjetas numéricas parametrizable con `titulo`, `icono`, `color` y `totales`.

- **`CartasTotalesMiembros.vue`**  
  Ranking de miembros. Usa `Utiles.generarURL` para imágenes, calcula estrellas relativas al mayor valor y muestra `v-rating`. Requiere prop `totales`.

- **`DialogoEliminar.vue`**  
  Diálogo de confirmación con texto parametrizable (`nombre`). Emite eventos `cancelar` y `eliminar`.

- **`PeriodoBusqueda.vue`**  
  Selector de rango de fechas. Emite `buscar` con el array `[inicio, fin]`.

- **`PieComponent.vue`**  
  Footer estándar con el logo y el año actual.

- **`SparklineComponent.vue`**  
  Tarjeta con `v-sparkline` y tabla asociada. Props: `etiquetas`, `valores`, `color`, `titulo`, `subtitulo`.

### Configuración (`src/components/Configuracion`)

- **`ConfiguracionComponent.vue`**  
  Pantalla para editar ajustes del negocio. Carga datos actuales desde `ajustes.php`, muestra `FormConfiguracion` y procesa la carga del logo (detecta si se envía base64 nuevo).

- **`FormConfiguracion.vue`**  
  Formulario con validaciones básicas para nombre, teléfono, dirección y logo. Previsualiza la imagen seleccionada y emite `registrar` con los datos normalizados. Usa `Utiles.generarURL` para mostrar el logo actual.

### Membresías (`src/components/Membresias`)

- **`Membresias.vue`**  
  Tabla de planes. Gestiona CRUD sobre `membresias.php`, abre formularios en dialog, recalcula precios en BsS según tasa BCV almacenada y confirma eliminaciones mediante `DialogoEliminar`.

- **`FormMembresia.vue`**  
  Formulario de creación/edición. Valida campos requeridos, calcula precio aproximado en bolívares usando la tasa guardada y emite `registrar`.

### Miembros (`src/components/Miembros`)

- **`Miembros.vue`**  
  Tabla avanzada de clientes:
  - Usa `HttpService` para listar y eliminar.
  - Ofrece búsqueda, chips de estado, filas expandibles con info adicional, generación de credenciales (`CredencialMiembro`), pagos y renovaciones (`RealizarPago`).
  - Gestiona distintos diálogos y overlays de carga.

- **`BusquedaMiembro.vue`**  
  Autocomplete que consulta miembros por nombre/cédula mientras se escribe. Devuelve el objeto completo vía `seleccionado`.

- **`CredencialMiembro.vue`**  
  Genera una credencial imprimible utilizando `printd`. Lee datos del gimnasio desde `localStorage`, renderiza CSS específico y emite `impreso` al terminar.

- **`EditarMiembro.vue`**  
  Obtiene un miembro por ID, pasa los datos a `FormMiembro` y persiste cambios en `miembros.php`. Controla mensajes y redirección posterior.

- **`FormMiembro.vue`**  
  Formulario en `v-stepper` en tres pasos: datos personales, contacto/salud y foto. Maneja previsualización de imagen, validaciones y normaliza los datos antes de emitir `registrado`.

- **`NuevoMiembro.vue`**  
  Registro de clientes. Muestra breadcrumbs, reutiliza `FormMiembro`, obliga a registrar el primer pago (`RealizarPago`) y genera credencial si todo sale bien.

- **`RealizarPago.vue`**  
  Diálogo reutilizable para cobrar mensualidades:
  - Lista membresías, convierte precios a BsS según la tasa, permite sumar inscripción y elegir fecha.
  - Calcula total dinámico y emite `pagado` tras registrar vía `miembros.php`.

### Pagos (`src/components/Pagos/Pagos.vue`)

Listado histórico de pagos con búsqueda y filtros por periodo. Consume `pagos.php` para obtener totales globales y por dimensión (membresía, usuario, miembro) que se representan con `CartasTotales` y `CartasTotalesMiembros`.

### Usuarios (`src/components/Usuarios`)

- **`Usuarios.vue`**  
  Tabla de usuarios del sistema con acciones de edición y eliminación. Comunica con `usuarios.php`.

- **`NuevoUsuario.vue`**  
  Wrapper que muestra `FormUsuario` y envía los datos para crear un usuario nuevo.

- **`FormUsuario.vue`**  
  Formulario genérico para alta/edición, incluye selección de `rol` (`admin` o `empleado`). Emite `registrado` con el modelo actual.

- **`EditarUsuario.vue`**  
  Carga un usuario por ID, permite editarlo y redirige a la lista tras confirmación.

- **`Login.vue`**  
  Pantalla de inicio de sesión. Valida campos, envía credenciales a `usuarios.php` y maneja respuestas de login normal o obligatorio cambio de contraseña.

- **`CambiarPassword.vue`**  
  Permite al usuario autenticado cambiar su contraseña. Verifica la actual, valida coincidencia de la nueva y al éxito cierra la sesión para forzar reingreso.

- **`MiPerfil.vue`**  
  Vista personal de métricas. Consulta `usuarios.php` (`informacion_perfil`) y arma tarjetas con totales de visitas y pagos relacionados al usuario activo.

### Visitas (`src/components/Visitas`)

- **`Visitas.vue`**  
  Similar a pagos pero enfocado en visitas registradas. Aplica filtros de fecha y agrupa resultados por membresía, usuario y cliente utilizando componentes de tarjetas.

- **`RegistrarVisita.vue`**  
  Flujo para registrar visitas. Busca miembros, muestra estado de su membresía, habilita registrar visita o renovar pagos. Incluye un modo de “visita regular” para ventas únicas.

---

## Backend (PHP)

### Utilidades base

- **`api/encabezado.php`**  
  Define cabeceras comunes de CORS y JSON para todas las respuestas.

- **`api/base_datos.php`**  
  Contiene helpers de acceso a datos:
  - Conexión PDO (`conectarBaseDatos`) y atajos `selectQuery`, `selectPrepare`, `insertar`, `editar`, `eliminar`.
  - Funciones adicionales con PDO/ mysqli para compatibilidad (`obtenerConexion`, `actualizar`, `select`).
  - `obtenerImagen` guarda imágenes en `api/imagenes/`.
  - Constantes `FECHA_HOY` y `DIRECTORIO`.

### Ajustes del sistema

- **`api/funciones_ajustes.php`**  
  Operaciones CRUD sobre la tabla `ajustes`. Maneja carga/edición del logo detectando si viene en base64.

- **`api/ajustes.php`**  
  Endpoint que expone métodos `registrar` y `obtener`. Cuando no existen datos retorna valores por defecto para el gimnasio.

### Dashboard / Inicio

- **`api/funciones_inicio.php`**  
  Conjunto de consultas para generar métricas de membresías y pagos (totales, por periodo, por estado) y listas de miembros según situación (vencidos, por vencer, activos).

- **`api/inicio.php`**  
  Endpoint que responde a `metodo=obtener` empaquetando todas las métricas de dashboard (visitas/mensualidades y pagos) en un solo JSON.

### Membresías

- **`api/funciones_membresias.php`**  
  CRUD básico para la tabla `membresias`.

- **`api/membresias.php`**  
  Endpoint que enruta métodos `post`, `get`, `delete`, `put` a las funciones correspondientes.

### Miembros y Pagos asociados

- **`api/funciones_miembros.php`**  
  Gestiona miembros y operaciones relacionadas:
  - Registro (con almancenaje de imagen), edición y eliminación.
  - Consultas filtradas (`obtenerMiembros`, `obtenerMiembroNombreCedula`, `obtenerImagenPorCedula`).
  - Registro de pagos y actualización de membresías (`actualizarMembresia`, `verificarMembresia`, `marcarMembresiaVencida`).
  - Helpers para renovación automática según estado de la membresía.

- **`api/miembros.php`**  
  Endpoint robusto que:
  - Atiende consultas especiales (`accion=obtenerMiembro`).
  - Expone métodos `registrar`, `get`, `eliminar`, `editar`, `pagar`, `renovar`, `obtener_nombre_cedula`, `obtener_imagen`, `obtener_id`.
  - Maneja excepciones para respuestas consistentes.

### Pagos

- **`api/funciones_pagos.php`**  
  Consultas para listar pagos, totales y agregados por membresía, usuario y miembro. Incluye lógica legacy que actualiza fechas de membresía (repensar uso de `$conexion` global).

- **`api/pagos.php`**  
  Endpoint de reportes. Para `metodo=obtener` retorna pagos y todas las agregaciones derivadas.

### Visitas

- **`api/funciones_visitas.php`**  
  Maneja:
  - Registro de visitas (`registrarVisista`) y visitas “regulares”.
  - Listados filtrados por fecha y agregados por membresía, usuario y miembro.

- **`api/visitas.php`**  
  Endpoint que atiende `registrar`, `registrar_regular` y `obtener` devolviendo visitas y sus métricas asociadas.

### Usuarios

- **`api/funciones_usuarios.php`**  
  Responsabilidades:
  - CRUD de usuarios con contraseña por defecto hasheada.
  - Autenticación (`iniciarSesion`) con soporte para forzar cambio de contraseña al primer inicio.
  - Cambio de password, verificación y métricas personalizadas de visitas/pagos del usuario.

- **`api/usuarios.php`**  
  Endpoint expuesto para registrar, listar, eliminar, editar, obtener usuario por id, login, verificación y cambio de password, además de métricas de perfil.

### Otros scripts

- **`api/renovaciones.php`**  
  Devuelve historial de renovaciones por cédula (usa conexión mysqli global, alinearlo con PDO en el futuro).

- **`api/tasa_bcv.php`**  
  Proxy que consulta la API pública `pydolarve` para obtener la tasa del dólar BCV y devolverla en JSON.

- **`api/test_log.php`**  
  Script de prueba que escribe en el log de PHP y responde con un mensaje plano.

### Recursos

- **`api/imagenes/`**  
  Directorio donde `obtenerImagen` guarda los archivos subidos (nombres basados en `uniqid()`). Los componentes front construyen las rutas completas con `Utiles.generarURL`.

---

## Consideraciones de Integración

- **Persistencia de estado**: se usan múltiples claves en `localStorage` (`logeado`, `rolUsuario`, `nombreUsuario`, datos del gimnasio, `tasaBCV`). Cualquier refactor debe centralizar estas interacciones para evitar inconsistencia.
- **Errores heredados**: algunos módulos PHP mezclan PDO y mysqli (`$conexion` global). Al extender o migrar, homogenizar la capa de acceso a datos.
- **Rutas absolutas**: Tanto `HttpService` como `Utiles` asumen el backend en `http://localhost/sistema-gimnasio/api/`. Para despliegues se recomienda parametrizar la URL base.
- **Validaciones front**: La mayoría de los formularios usan validaciones mínimas (campos requeridos). Si se agregan reglas adicionales, se deben reflejar en el backend para seguridad.

---

## Próximos Pasos Sugeridos

- Añadir pruebas automatizadas (PHPUnit para backend, Jest/Vitest para Vue) que cubran funciones críticas (`funciones_miembros.php`, `funciones_pagos.php`).
- Centralizar manejo de errores y respuestas en el backend para evitar duplicación de lógica.
- Migrar a un store (Vuex/Pinia) para gestionar sesión, ajustes y tasa BCV de forma reactiva.
- Revisar seguridad de endpoints (validación de payloads, sanitización, autenticación real por token).
