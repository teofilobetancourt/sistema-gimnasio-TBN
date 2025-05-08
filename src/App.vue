<template>
  <div id="app">
    <v-app>
      <!-- Mostrar login si no ha iniciado sesión -->
      <login @logeado="onLog" v-if="!logeado && !debeCambiarPassword" />

      <!-- Mostrar cambio de contraseña si es necesario -->
      <cambiar-password v-if="debeCambiarPassword" />

      <!-- Mostrar la app solo si está logeado y no debe cambiar contraseña -->
      <div v-if="logeado && !debeCambiarPassword">
        <encabezado />
        <v-main>
          <v-container fluid>
            <router-view />
          </v-container>
        </v-main>
      </div>

      <!-- Mensajes tipo snackbar -->
      <v-snackbar
        v-model="mostrarMensaje"
        :timeout="3000"
        :color="mensaje.color"
        top
      >
        {{ mensaje.texto }}
      </v-snackbar>
    </v-app>
  </div>
</template>

<script>
import Encabezado from './components/Encabezado.vue'
import Login from './components/Usuarios/Login.vue'
import CambiarPassword from './components/Usuarios/CambiarPassword.vue'
import HttpService from './Servicios/HttpService'

export default {
  name: 'App',
  components: {
    Encabezado,
    Login,
    CambiarPassword,
  },

  data: () => ({
    logeado: false,
    debeCambiarPassword: false,
    mostrarMensaje: false,
    mensaje: {
      texto: '',
      color: '',
    },
  }),

  mounted() {
    this.obtenerInformacionNegocio()
    this.logeado = this.verificarSesion()
  },

  methods: {
    onLog(datos) {
      console.log("Datos recibidos:", datos);

      if (!datos || !datos.idUsuario || !datos.rol) {
        this.mostrarMensaje = true;
        this.mensaje = {
          texto: 'Datos incorrectos, verifica la información',
          color: 'error',
        };
        return;
      }

      if (datos.requiereCambioPassword) {
        this.mostrarMensaje = true;
        this.mensaje = {
          texto: 'Datos correctos. Por favor cambia tu contraseña',
          color: 'indigo',
        };
        this.debeCambiarPassword = true;
        this.logeado = true;
      } else {
        this.logeado = true;
        localStorage.setItem('logeado', 'true');
        this.mostrarMensaje = true;
        this.mensaje = {
          texto: 'Datos correctos. Bienvenido',
          color: 'success',
        };
        this.$router.push({ name: 'InicioComponent' }).catch(() => {});
      }

      this.establecerUsuario(datos.nombreUsuario, datos.idUsuario, datos.rol);
    },

    verificarSesion() {
      return localStorage.getItem('logeado') === 'true'
    },

    establecerUsuario(usuario, id, rol) {
      localStorage.setItem('nombreUsuario', usuario)
      localStorage.setItem('idUsuario', id)
      localStorage.setItem('rolUsuario', rol)
    },

    obtenerInformacionNegocio() {
      HttpService.obtenerConDatos({ metodo: 'obtener' }, 'ajustes.php').then(
        (resultado) => {
          localStorage.setItem('nombreGimnasio', resultado.nombre)
          localStorage.setItem('logoGimnasio', resultado.logo)
          localStorage.setItem('telefonoGimnasio', resultado.telefono)
          localStorage.setItem('direccionGimnasio', resultado.direccion)
        }
      )
    },
  },
}
</script>

<style>
.gradient-drawer {
  background: linear-gradient(to bottom, #8e24aa, #5e35b1);
  color: white;
}
</style>