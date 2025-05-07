
<template>
  <div class="fondo">
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12" height="100%">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Iniciar sesión</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form>
                <v-text-field
                  prepend-icon="person"
                  name="login"
                  label="Usuario"
                  type="text"
                  v-model="usuario"
                ></v-text-field>
                <v-text-field
                  id="password"
                  prepend-icon="lock"
                  name="password"
                  label="Contraseña"
                  type="password"
                  v-model="password"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="iniciarSesion">Ingresar</v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>

      <v-snackbar
        v-model="mostrarMensaje"
        :timeout="3000"
        :color="mensaje.color"
        top
      >
        {{ mensaje.texto }}
      </v-snackbar>
    </v-container>

    <!-- Logo debajo -->
    <div class="logo-container">
      <img
        src="https://2.bp.blogspot.com/-jKpjKDz7IMA/W7z4LIu9k_I/AAAAAAAACoA/r7AvmvmDDkomR1KA96D1cvBV5gom69zOgCLcBGAs/s0/gym.png"
        alt="Logo gimnasio"
      >
    </div>
  </div>
</template>

<script>
import HttpService from '../../Servicios/HttpService'

export default {
  name: "Login",
  data: () => ({
    usuario: "",
    password: "",
    mensaje: {
      texto: "",
      color: "",
    },
    mostrarMensaje: false
  }),
  methods: {
    iniciarSesion() {
      if (!this.usuario) {
        this.mostrarMensaje = true;
        this.mensaje.texto = "Debes colocar el usuario";
        this.mensaje.color = "warning";
        return;
      }
      if (!this.password) {
        this.mostrarMensaje = true;
        this.mensaje.texto = "Debes colocar la contraseña";
        this.mensaje.color = "warning";
        return;
      }

      let payload = {
        metodo: "login",
        usuario: {
          usuario: this.usuario,
          password: this.password
        }
      };

      HttpService.obtenerConDatos(payload, "usuarios.php")
        .then(resultado => {
          if (resultado && resultado.resultado === true) {
            const datos = resultado.datos;
            localStorage.setItem("rolUsuario", datos.rol);
            this.$emit("logeado", datos);
          } else if (resultado && resultado.resultado === "cambia") {
            const datos = resultado.datos;
            datos.requiereCambioPassword = true;
            localStorage.setItem("rolUsuario", datos.rol);
            this.$emit("logeado", datos);
          } else {
            this.mostrarMensaje = true;
            this.mensaje.texto = (resultado && resultado.mensaje) ? resultado.mensaje : "Usuario o contraseña incorrecta";
            this.mensaje.color = "error";
          }
        })
        .catch(() => {
          this.mostrarMensaje = true;
          this.mensaje.texto = "Error de conexión con el servidor";
          this.mensaje.color = "error";
        });
    },
  },
};
</script>

<style>
.fondo {
  background: linear-gradient(135deg, #6a11cb, #2575fc);
  min-height: 100vh;
  background-attachment: fixed;
  background-size: cover;
  padding-bottom: 40px;
}

.logo-container {
  text-align: center;
  margin-top: 20px;
}
</style>
