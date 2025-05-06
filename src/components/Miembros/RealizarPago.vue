<template>
  <div>
    <v-card>
      <v-card-title>
        <span class="text-h5">Realizar pago para {{ cedula }}</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-select
            v-model="membresiaSeleccionada"
            :items="membresias"
            item-text="nombreExtendido"
            item-value="id"
            label="Selecciona una membresía"
            persistent-hint
            return-object
            single-line
          />
          <v-row justify="center">
            <v-date-picker
              v-model="fechaSeleccionada"
              :first-day-of-week="1"
              locale="es-se"
            />
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="cerrarDialogo">Cerrar</v-btn>
        <v-btn color="blue darken-1" text @click="realizarPago">Registrar</v-btn>
      </v-card-actions>
    </v-card>

    <v-snackbar v-model="mostrarSnackbar" :timeout="3000" top color="success">
      ✅ Pago realizado con éxito
    </v-snackbar>

    <v-overlay :value="cargando">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
  </div>
</template>

<script>
import HttpService from '../../Servicios/HttpService';

export default {
  name: "RealizarPago",
  props: ["cedula"],

  data: () => ({
    membresiaSeleccionada: null,
    fechaSeleccionada: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().substr(0, 10),
    membresias: [],
    cargando: false,
    tasaDolar: 0,
    mostrarSnackbar: false,
  }),

  mounted() {
    this.obtenerTasa();
    this.obtenerMembresias();
  },

  methods: {
    obtenerTasa() {
      const tasaGuardada = localStorage.getItem('tasaBCV');
      this.tasaDolar = tasaGuardada ? parseFloat(tasaGuardada) : 0;
    },

    obtenerMembresias() {
      const payload = { metodo: "get" };
      HttpService.obtenerConDatos(payload, "membresias.php").then(respuesta => {
        this.membresias = respuesta.map(m => ({
          ...m,
          nombreExtendido: `${m.nombre} - BsS ${this.formatearBsS(m.precio * this.tasaDolar)}`,
          precioBsS: (m.precio * this.tasaDolar).toFixed(2),
          precioOriginal: m.precio
        }));
      });
    },

    cerrarDialogo() {
      this.$emit("cerrar", false);
    },

    realizarPago() {
      if (!this.membresiaSeleccionada) return;
      this.cargando = true;

      const tasaBCV = parseFloat(localStorage.getItem('tasaBCV')) || 0;
      const precioUSD = parseFloat(this.membresiaSeleccionada.precio);
      const montoBsS = (precioUSD * tasaBCV).toFixed(2);

      const payload = {
        metodo: 'pagar',
        pago: {
          cedula: this.cedula,
          pago: montoBsS,
          idMembresia: this.membresiaSeleccionada.id,
          duracion: this.membresiaSeleccionada.duracion,
          fecha: this.fechaSeleccionada,
          idUsuario: localStorage.getItem('idUsuario')
        }
      };

      HttpService.registrar(payload, "miembros.php")
        .then(registrado => {
          this.cargando = false;
          if (registrado) {
            this.mostrarSnackbar = true;
            this.$emit("pagado", registrado);
          }
        })
        .catch(error => {
          this.cargando = false;
          console.error("❌ Error al registrar pago:", error);
        });

      console.log("🌟 Payload enviado:", payload);
    },

    formatearBsS(valor) {
      if (isNaN(valor)) return "0,00";
      return parseFloat(valor)
        .toFixed(2)
        .replace('.', ',')
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
  }
};
</script>
