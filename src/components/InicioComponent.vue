<template>
  <v-container fluid class="pa-0 ma-0 fill-height" style="max-width: 100vw !important;">
    <!-- Cartas de visitas (membresías) -->
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

    <!-- Listado vertical de membresías con animación -->
    <v-row dense no-gutters class="ma-0 pa-0">
      <v-col cols="12" md="4" class="pa-1 ma-0" v-for="(grafica, i) in graficasVisitas" :key="'grafica-' + i">
        <v-card class="pa-3 mb-2 fill-height" elevation="2">
          <v-icon size="30" class="mb-1" :color="grafica.color">mdi-account</v-icon>
          <div class="text-h6">{{ grafica.titulo }}</div>
          <div class="text-subtitle-2 mb-2">{{ grafica.subtitulo }}</div>
          <div class="scroll-box no-scrollbar">
            <div v-for="(nombre, j) in grafica.etiquetas" :key="'miembro-' + i + '-' + j" class="nombre-item">
              <v-icon left small class="mr-2" color="grey lighten-1">mdi-account-circle</v-icon>
              <span>{{ j + 1 }}. {{ nombre }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
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
        this.datosVisitas = [
          { color: "pink darken-1", icono: "mdi-calendar", nombre: "Membresías hoy", total: resultado.membresiasHoy },
          { color: "red darken-1", icono: "mdi-calendar-range", nombre: "Membresías semana", total: resultado.membresiasSemana },
          { color: "indigo darken-1", icono: "mdi-calendar-month", nombre: "Membresías mes", total: resultado.membresiasMes },
          { color: "purple darken-1", icono: "mdi-calendar-star", nombre: "Total membresías", total: resultado.membresiasTotales },
        ];

        this.datosPagos = [
          { color: "teal darken-1", icono: "mdi-calendar", nombre: "Ingreso diario", total: "$" + resultado.datosPagos.pagosHoy },
          { color: "green darken-1", icono: "mdi-calendar-range", nombre: "Ingreso semanal", total: "$" + resultado.datosPagos.pagosSemana },
          { color: "orange darken-1", icono: "mdi-calendar-month", nombre: "Ingreso mensual", total: "$" + resultado.datosPagos.pagosMes },
          { color: "blue darken-1", icono: "mdi-currency-usd", nombre: "Ingreso total", total: "$" + resultado.datosPagos.totalPagos },
        ];

        this.graficasVisitas = [
          {
            etiquetas: (resultado.miembrosVencidos || []).map(m => m.nombre),
            color: "pink darken-1",
            titulo: "Membresías vencidas",
            subtitulo: "Miembros finalizadas",
          },
          {
            etiquetas: (resultado.miembrosPorVencer || []).map(m => m.nombre),
            color: "red darken-1",
            titulo: "Membresías por vencer",
            subtitulo: "Miembros próximas a vencer",
          },
          {
            etiquetas: (resultado.miembrosActivos || []).map(m => m.nombre),
            color: "indigo darken-1",
            titulo: "Membresías activas",
            subtitulo: "Miembros actualmente activos",
          },
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
            subtitulo: "Pagos registrados por mes",
          },
        ];

        this.cargando = false;
      });
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

.scroll-box {
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 8px;
}

.scroll-box::-webkit-scrollbar:horizontal {
  display: none;
}

.nombre-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  font-size: 15px;
  border-bottom: 1px solid #ccc;
  transition: all 0.2s ease;
  border-radius: 4px;
}
.nombre-item:hover {
  background-color: rgba(255, 255, 255, 0.07);
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  transform: scale(1.01);
  cursor: pointer;
}
</style>
