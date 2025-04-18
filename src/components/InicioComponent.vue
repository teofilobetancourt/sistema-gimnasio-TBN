<template>
  <v-container fluid class="pa-0 ma-0 fill-height" style="max-width: 100vw !important;">
    <!-- Cartas de visitas -->
    <v-row dense no-gutters class="ma-0 pa-0">
      <transition-group name="fade" tag="div" class="d-flex flex-wrap ma-0 pa-0" style="width: 100%;">
        <v-col cols="12" md="3" class="pa-1 ma-0" style="max-width: 25%;" v-for="(card, index) in datosVisitas" :key="'visita-' + index" :style="{ animationDelay: (index * 100) + 'ms' }">
          <v-card :color="card.color" dark class="d-flex flex-column justify-center align-center pa-4 fill-height" height="160px">
            <v-icon size="40" class="mb-2">{{ card.icono }}</v-icon>
            <div class="text-h6 text-center">{{ card.nombre }}</div>
            <div class="text-subtitle-1 font-weight-bold text-center">{{ card.total }}</div>
          </v-card>
        </v-col>
      </transition-group>
    </v-row>

    <!-- Gráficas de visitas -->
    <v-row dense no-gutters class="ma-0 pa-0">
      <transition-group name="fade" tag="div" class="d-flex flex-wrap ma-0 pa-0" style="width: 100%;">
        <v-col cols="12" md="4" class="pa-1 ma-0" style="max-width: 33.33%;" v-for="(grafica, i) in graficasVisitas" :key="'graf-visita-' + i" :style="{ animationDelay: (i * 100) + 'ms' }">
          <v-card class="pa-3 mb-2 fill-height" elevation="2">
            <sparkline-component
              :etiquetas="grafica.etiquetas"
              :valores="grafica.valores"
              :color="grafica.color"
              :titulo="grafica.titulo"
              :subtitulo="grafica.subtitulo"
            />
          </v-card>
        </v-col>
      </transition-group>
    </v-row>

    <!-- Cartas de pagos -->
    <v-row dense no-gutters class="ma-0 pa-0">
      <transition-group name="fade" tag="div" class="d-flex flex-wrap ma-0 pa-0" style="width: 100%;">
        <v-col cols="12" md="3" class="pa-1 ma-0" style="max-width: 25%;" v-for="(card, index) in datosPagos" :key="'pago-' + index" :style="{ animationDelay: (index * 100) + 'ms' }">
          <v-card :color="card.color" dark class="d-flex flex-column justify-center align-center pa-4 fill-height" height="160px">
            <v-icon size="40" class="mb-2">{{ card.icono }}</v-icon>
            <div class="text-h6 text-center">{{ card.nombre }}</div>
            <div class="text-subtitle-1 font-weight-bold text-center">{{ card.total }}</div>
          </v-card>
        </v-col>
      </transition-group>
    </v-row>

    <!-- Gráficas de pagos -->
    <v-row dense no-gutters class="ma-0 pa-0">
      <transition-group name="fade" tag="div" class="d-flex flex-wrap ma-0 pa-0" style="width: 100%;">
        <v-col cols="12" md="4" class="pa-1 ma-0" style="max-width: 33.33%;" v-for="(grafica, i) in graficasPagos" :key="'graf-pago-' + i" :style="{ animationDelay: (i * 100) + 'ms' }">
          <v-card class="pa-3 mb-2 fill-height" elevation="2">
            <sparkline-component
              :etiquetas="grafica.etiquetas"
              :valores="grafica.valores"
              :color="grafica.color"
              :titulo="grafica.titulo"
              :subtitulo="grafica.subtitulo"
            />
          </v-card>
        </v-col>
      </transition-group>
    </v-row>

    <v-overlay :value="cargando">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import HttpService from "../Servicios/HttpService";
import Utiles from "../Servicios/Utiles";
import SparklineComponent from "./Dialogos/SparklineComponent.vue";

export default {
  name: "InicioComponent",
  components: { SparklineComponent },

  data: () => ({
    cargando: false,
    datosVisitas: [],
    datosPagos: [],
    graficasVisitas: [],
    graficasPagos: [],
  }),

  mounted() {
    this.obtenerDatos();
  },

  methods: {
    obtenerDatos() {
      this.cargando = true;
      HttpService.obtenerConDatos({ metodo: "obtener" }, "inicio.php").then((resultado) => {
        this.crearCartas(resultado.datosVisitas, resultado.datosPagos);

        this.graficasVisitas = [
          {
            etiquetas: Utiles.obtenerClaves(resultado.visitasHora),
            valores: Utiles.obtenerValores(resultado.visitasHora),
            color: "pink darken-1",
            titulo: "Membresias vencidas",
            subtitulo: "Membresias finalizadas",
          },
          {
            etiquetas: Utiles.obtenerClaves(Utiles.cambiarDiaSemana(resultado.visitasSemana)),
            valores: Utiles.obtenerValores(Utiles.cambiarDiaSemana(resultado.visitasSemana)),
            color: "red darken-1",
            titulo: "Membresias por vencer",
            subtitulo: "Membresias pronto a vencer",
          },
          {
            etiquetas: Utiles.obtenerClaves(resultado.visitasMes),
            valores: Utiles.obtenerValores(resultado.visitasMes),
            color: "indigo darken-1",
            titulo: "Membresias activas",
            subtitulo: "Membresias activas",
          }
        ];

        this.graficasPagos = [
          {
            etiquetas: Utiles.obtenerClaves(Utiles.cambiarDiaSemana(resultado.pagosSemana)),
            valores: Utiles.obtenerValoresPagos(Utiles.cambiarDiaSemana(resultado.pagosSemana)),
            color: "green darken-1",
            titulo: "Pagos semana",
            subtitulo: "Pagos registrados esta semana",
          },
          {
            etiquetas: Utiles.obtenerClaves(resultado.pagosMes),
            valores: Utiles.obtenerValoresPagos(resultado.pagosMes),
            color: "orange darken-1",
            titulo: "Pagos mes",
            subtitulo: "Pagos registrados este mes",
          },
          {
            etiquetas: Utiles.obtenerClaves(Utiles.cambiarNumeroANombreMes(resultado.pagosMeses)),
            valores: Utiles.obtenerValoresPagos(Utiles.cambiarNumeroANombreMes(resultado.pagosMeses)),
            color: "blue darken-1",
            titulo: "Pagos meses",
            subtitulo: "Pagos registrados mes",
          }
        ];

        this.cargando = false;
      });
    },

    crearCartas(visitas, pagos) {
  this.datosVisitas = [
    { color: "pink darken-1", icono: "mdi-calendar", nombre: "Membresías hoy", total: visitas.visitasHoy },
    { color: "red darken-1", icono: "mdi-calendar-range", nombre: "Membresías semana", total: visitas.visitasSemana },
    { color: "indigo darken-1", icono: "mdi-calendar-month", nombre: "Membresías mes", total: visitas.visitasMes },
    { color: "purple darken-1", icono: "mdi-calendar-star", nombre: "Total membresías", total: visitas.totalVisitas },
  ];

  this.datosPagos = [
    { color: "teal darken-1", icono: "mdi-calendar", nombre: "Ingreso diario", total: "$" + pagos.pagosHoy },
    { color: "green darken-1", icono: "mdi-calendar-range", nombre: "Ingreso semanal", total: "$" + pagos.pagosSemana },
    { color: "orange darken-1", icono: "mdi-calendar-month", nombre: "Ingreso mensual", total: "$" + pagos.pagosMes },
    { color: "blue darken-1", icono: "mdi-currency-usd", nombre: "Ingreso total", total: "$" + pagos.totalPagos },
  ];
},

  },
};
</script>

<style scoped>
.fade-enter-active {
  animation: fadeInUp 0.5s ease forwards;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.v-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}
</style>
