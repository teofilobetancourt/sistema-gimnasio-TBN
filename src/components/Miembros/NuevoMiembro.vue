<template>
  <div>
    <h1>Registrar miembro</h1>
    <breadcrumbs
      :items="[
        { text: 'Inicio', href: '/' },
        { text: 'Miembros', href: '/#/miembros' },
      ]"
    />
    <form-miembro :miembro="datosMiembro" :desactivar="cargando" @registrado="onRegistrado" />

    <v-dialog v-model="mostrarRealizarPago" persistent max-width="600">
      <realizar-pago
        :cedula="cedula"
        @cerrar="cerrarDialogoPago"
        @pagado="onPagado"
      />
    </v-dialog>

    <credencial-miembro :matricula="cedula" :miembro="miembro" @impreso="onImpreso" v-if="mostrarCredencial" />

    <v-overlay :value="cargando">
      <v-progress-circular size="64"></v-progress-circular>
    </v-overlay>

    <v-snackbar
      v-model="mostrarMensaje"
      :timeout="3000"
      :color="mensaje.color"
      top
    >
      {{ mensaje.texto }}
    </v-snackbar>
  </div>
</template>

<script>
import FormMiembro from "./FormMiembro.vue";
import Breadcrumbs from "../Dialogos/Breadcrumbs.vue";
import HttpService from "../../Servicios/HttpService";
import RealizarPago from "./RealizarPago.vue";
import CredencialMiembro from "./CredencialMiembro.vue";

export default {
  name: "NuevoMiembro",
  components: { FormMiembro, Breadcrumbs, RealizarPago, CredencialMiembro },

  data: () => ({
    mostrarMensaje: false,
    mensaje: {
      color: "",
      texto: ""
    },
    miembro: {},
    mostrarRealizarPago: false,
    mostrarCredencial: false,
    cedula: "",
    cargando: false,
    datosMiembro: {
      datosPersonales: {
        nombre: "",
        telefono: "",
        direccion: "",
        edad: 10,
      },
      datosContacto: {
        sufreEnfermedad: false,
        tieneSeguro: false,
        enfermedad: "",
        institucion: "",
        nombreContacto: "",
        telefonoContacto: "",
      },
      imagen: null
    }
  }),

  methods: {
    generarCredencial() {
      HttpService.obtenerConDatos({
        metodo: 'obtener_imagen',
        cedula: this.cedula
      }, 'miembros.php')
      .then(respuesta => {
        this.miembro.imagen = respuesta.imagen;
        this.miembro.fechaRegistro = new Date().toLocaleDateString();
        this.mostrarCredencial = true;
      });
    },

    onImpreso(resultado) {
      this.mostrarCredencial = resultado;
    },

    onRegistrado(miembro) {
      this.miembro = miembro;
      let payload = {
        metodo: "registrar",
        miembro: this.miembro,
      };

      this.cargando = true;
      HttpService.registrar(payload, "miembros.php").then((registrado) => {
        if (registrado) {
          this.cedula = registrado;
          // abrir pago directamente SIN opción a omitirlo
          setTimeout(() => {
            this.mostrarRealizarPago = true;
            this.cargando = false;
          }, 300);
        } else {
          this.cargando = false;
        }
      });
    },

    onPagado(resultado) {
      if (resultado) {
        this.mostrarRealizarPago = false;
        this.mostrarMensaje = true;
        this.mensaje = {
          color: "success",
          texto: "Pago realizado con éxito"
        };
        this.$router.push('/miembros');
      }
    },

    cerrarDialogoPago(resultado) {
      this.mostrarRealizarPago = resultado;
    },
  },
};
</script>
