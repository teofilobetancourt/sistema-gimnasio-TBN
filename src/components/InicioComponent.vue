<template>
  <v-container fluid class="pa-0 ma-0 fill-height" style="max-width: 100vw !important;">
    <!-- Cartas de membresías -->
    <v-row dense no-gutters class="ma-0 pa-4">
      <transition-group name="fade" tag="div" class="d-flex flex-wrap" style="width: 100%;">
        <v-col cols="12" md="3" class="pa-2" v-for="(card, index) in datosVisitas" :key="'visita-' + index">
          <div class="glass-card-custom">
            <v-icon size="40" :color="card.color" class="mb-2">{{ card.icono }}</v-icon>
            <div class="label">{{ card.nombre }}</div>
            <div class="counter">{{ card.total }}</div>
          </div>
        </v-col>
      </transition-group>
    </v-row>

    <!-- Listado de membresías -->
    <v-row dense no-gutters class="ma-0 pa-0">
      <v-col cols="12" md="4" class="pa-2" v-for="(grafica, i) in graficasVisitas" :key="'grafica-' + i">
        <v-card class="pa-3 mb-2 fill-height glass-section" elevation="2">
          <div class="d-flex align-center justify-space-between">
            <div>
              <v-icon size="30" class="mb-1" :color="grafica.color">mdi-account</v-icon>
              <div class="text-h6">{{ grafica.titulo }}</div>
              <div class="text-subtitle-2 mb-2">
                {{ grafica.subtitulo }}
                <v-chip color="primary" dark small class="ml-2">{{ grafica.etiquetas.length }}</v-chip>
              </div>
            </div>
          </div>
          <v-text-field
            v-model="grafica.search"
            dense hide-details solo flat
            placeholder="Buscar nombre"
            prepend-inner-icon="mdi-account-search"
          ></v-text-field>
          <div class="scroll-box no-scrollbar">
            <div
              v-for="(nombre, j) in grafica.etiquetas.filter(n => !grafica.search || n.toLowerCase().includes(grafica.search.toLowerCase()))"
              :key="'miembro-' + i + '-' + j"
              class="nombre-item"
              v-html="resaltarCoincidencia(nombre, grafica.search, j + 1)"
            ></div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cartas de pagos -->
    <v-row dense no-gutters class="ma-0 pa-4">
      <transition-group name="fade" tag="div" class="d-flex flex-wrap" style="width: 100%;">
        <v-col cols="12" md="3" class="pa-2" v-for="(card, index) in datosPagos" :key="'pago-' + index">
          <div class="glass-card-custom">
            <v-icon size="40" :color="card.color" class="mb-2">{{ card.icono }}</v-icon>
            <div class="label">{{ card.nombre }}</div>
            <div class="counter">{{ card.total }}</div>
          </div>
        </v-col>
      </transition-group>
    </v-row>

    <!-- Gráficas de pagos -->
    <v-row dense no-gutters class="ma-0 pa-2">
      <v-col cols="12" md="4" class="pa-2" v-for="(grafica, i) in graficasPagos" :key="'graf-pago-' + i">
        <v-card class="pa-3 mb-2 fill-height glass-section" elevation="2">
          <sparkline-component
            :etiquetas="grafica.etiquetas"
            :valores="grafica.valores"
            :color="grafica.color"
            :titulo="grafica.titulo"
            :subtitulo="grafica.subtitulo"
          />
        </v-card>
      </v-col>
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
    resaltarCoincidencia(nombre, texto, index) {
      if (!texto) return `<span>${index}. ${nombre}</span>`;
      const regex = new RegExp(`(${texto})`, "gi");
      const resaltado = nombre.replace(regex, '<mark>$1</mark>');
      return `<span>${index}. ${resaltado}</span>`;
    },
    obtenerDatos() {
      this.cargando = true;
      HttpService.obtenerConDatos({ metodo: "obtener" }, "inicio.php").then((resultado) => {
        this.datosVisitas = [
          { color: "pink", icono: "mdi-calendar", nombre: "Membresías hoy", total: resultado.membresiasHoy },
          { color: "red", icono: "mdi-calendar-range", nombre: "Membresías semana", total: resultado.membresiasSemana },
          { color: "indigo", icono: "mdi-calendar-month", nombre: "Membresías mes", total: resultado.membresiasMes },
          { color: "purple", icono: "mdi-calendar-star", nombre: "Total membresías", total: resultado.membresiasTotales },
        ];
        this.datosPagos = [
          { color: "teal", icono: "mdi-calendar", nombre: "Ingreso diario", total: "$" + resultado.datosPagos.pagosHoy },
          { color: "green", icono: "mdi-calendar-range", nombre: "Ingreso semanal", total: "$" + resultado.datosPagos.pagosSemana },
          { color: "orange", icono: "mdi-calendar-month", nombre: "Ingreso mensual", total: "$" + resultado.datosPagos.pagosMes },
          { color: "blue", icono: "mdi-currency-usd", nombre: "Ingreso total", total: "$" + resultado.datosPagos.totalPagos },
        ];
        this.graficasVisitas = [
          { etiquetas: (resultado.miembrosVencidos || []).map(m => m.nombre), color: "pink", titulo: "Membresías vencidas", subtitulo: "Miembros finalizadas", search: "" },
          { etiquetas: (resultado.miembrosPorVencer || []).map(m => m.nombre), color: "red", titulo: "Membresías por vencer", subtitulo: "Miembros próximos a vencer", search: "" },
          { etiquetas: (resultado.miembrosActivos || []).map(m => m.nombre), color: "indigo", titulo: "Membresías activas", subtitulo: "Miembros actualmente activos", search: "" },
        ];
        this.graficasPagos = [
          {
            etiquetas: Utiles.obtenerClaves(Utiles.cambiarDiaSemana(resultado.pagosSemana)),
            valores: Utiles.obtenerValoresPagos(Utiles.cambiarDiaSemana(resultado.pagosSemana)),
            color: "green", titulo: "Pagos semana", subtitulo: "Pagos registrados esta semana"
          },
          {
            etiquetas: Utiles.obtenerClaves(resultado.pagosMes),
            valores: Utiles.obtenerValoresPagos(resultado.pagosMes),
            color: "orange", titulo: "Pagos mes", subtitulo: "Pagos registrados este mes"
          },
          {
            etiquetas: Utiles.obtenerClaves(Utiles.cambiarNumeroANombreMes(resultado.pagosMeses)),
            valores: Utiles.obtenerValoresPagos(Utiles.cambiarNumeroANombreMes(resultado.pagosMeses)),
            color: "blue", titulo: "Pagos meses", subtitulo: "Pagos registrados por mes"
          },
        ];
        this.cargando = false;
      });
    },
  },
};
</script>

<style scoped>
.glass-card-custom {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.glass-card-custom:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}
.glass-card-custom .label {
  font-size: 16px;
  margin-top: 8px;
  opacity: 0.85;
}
.glass-card-custom .counter {
  font-size: 28px;
  font-weight: bold;
  margin-top: 4px;
}

.glass-section {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  color: white;
}

.scroll-box {
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  margin-top: 8px;
}
.nombre-item {
  padding: 6px 10px;
  border-radius: 4px;
  transition: background 0.3s ease;
}
.nombre-item:hover {
  background-color: rgba(255, 255, 255, 0.07);
}
mark {
  background-color: #ffeb3b;
  padding: 0 2px;
  border-radius: 3px;
}
</style>
