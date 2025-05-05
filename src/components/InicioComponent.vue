<template>
  <v-container fluid class="pa-0 ma-0 fill-height" style="max-width: 100vw !important;">
    <!-- Alerta de tasa BCV + botón actualizar -->
    <v-row dense no-gutters class="ma-0 pa-4">
      <v-col cols="12" class="pa-2 d-flex align-center">
        <v-alert type="info" border="left" colored-border elevation="2" class="flex-grow-1">
          Tasa BCV Actual: <strong>BsS {{ tasaDolar }}</strong>
        </v-alert>
        <v-btn icon @click="obtenerTasaBCV" class="ml-2" color="primary" title="Actualizar tasa">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <!-- Modal para ingresar tasa manual -->
    <v-dialog v-model="dialogoTasaManual" max-width="400px">
  <v-card>
    <v-card-title>Ingresar Tasa Manual</v-card-title>
    <v-card-text>
      <v-text-field
  label="Tasa BCV"
  v-model="tasaManual"
  type="number"
  step="0.0001"
  min="0"
  :rules="[valor => esTasaManualValida || 'Ingrese una tasa válida']"
  :error="!esTasaManualValida && tasaManual !== ''"
  @input="validarDecimales"
></v-text-field>



    </v-card-text>

    <!-- Aquí reemplazas tu botón antiguo -->
    <v-card-actions class="d-flex justify-end">
      <v-btn color="red darken-1" text @click="dialogoTasaManual = false">
        Cancelar
      </v-btn>
      <v-btn
        color="green darken-1"
        text
        :disabled="!esTasaManualValida"
        @click="confirmarTasaManual"
      >
        Aceptar
      </v-btn>
    </v-card-actions>

  </v-card>
</v-dialog>



    <!-- Cartas de visitas (mensualidades) -->
    <v-row dense no-gutters class="ma-0 pa-4">
      <transition-group name="fade" tag="div" class="d-flex flex-wrap" style="width: 100%;">
        <v-col cols="12" md="3" class="pa-2" v-for="(card, index) in datosVisitas" :key="'visita-' + index">
          <div class="glass-card-custom">
            <v-icon size="40" :color="card.color" class="mb-2">{{ card.icono }}</v-icon>
            <div class="label">
              {{ card.nombre === 'Membresías hoy' ? 'Mensualidad hoy' :
                 card.nombre === 'Membresías semana' ? 'Mensualidad semana' :
                 card.nombre === 'Membresías mes' ? 'Mensualidad mes' :
                 card.nombre === 'Total membresías' ? 'Total mensualidades' :
                 card.nombre.replace('Membresías', 'Mensualidades').replace('membresías', 'mensualidades') }}
            </div>
            <div class="counter">{{ Math.floor(card.valorAnimado) }}</div>
          </div>
        </v-col>
      </transition-group>
    </v-row>

    <!-- Listado de mensualidades -->
    <v-row dense no-gutters class="ma-0 pa-0">
      <v-col cols="12" md="4" class="pa-2" v-for="(grafica, i) in graficasVisitas" :key="'grafica-' + i">
        <v-card class="pa-3 mb-2 fill-height glass-section" elevation="2">
          <div class="d-flex align-center justify-space-between">
            <div>
              <v-icon size="30" class="mb-1" :color="grafica.color">mdi-account</v-icon>
              <div class="text-h6">{{ grafica.titulo.replace('Membresías', 'Mensualidades') }}</div>
              <div class="text-subtitle-2 mb-2">
                {{ grafica.subtitulo.replace('Membresías', 'Mensualidades').replace('Miembros', 'Mensualidades') }}
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
              @click="mostrarDetalles(nombre)"
              style="cursor: pointer;"
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
            <div class="counter" v-html="card.valorAnimado"></div>
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

    <!-- Modal de detalles -->
    <v-dialog v-model="dialogoDetalle" max-width="400">
      <v-card>
        <v-card-title class="text-h6">Detalles de mensualidad</v-card-title>
        <v-card-text>
          Información de la mensualidad: <strong>{{ miembroSeleccionado }}</strong>
          <br />
          (Aquí podrías mostrar más detalles reales...)
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="dialogoDetalle = false">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-overlay :value="cargando">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script>
import HttpService from "../Servicios/HttpService";
import Utiles from "../Servicios/Utiles";
import SparklineComponent from "./Dialogos/SparklineComponent.vue";
import axios from "axios";

export default {
  name: "InicioComponent",
  components: { SparklineComponent },
  data: () => ({
    cargando: false,
    tasaDolar: 0,
    tasaManual: "",
    dialogoTasaManual: false,
    datosVisitas: [],
    datosPagos: [],
    graficasVisitas: [],
    graficasPagos: [],
    dialogoDetalle: false,
    miembroSeleccionado: "",
    intervaloTasa: null,
    frecuenciaActualizacion: 10800000, // cada 3 horas
  }),

  mounted() {
  const tasaGuardada = localStorage.getItem('tasaBCV');
  const ultimaActualizacion = localStorage.getItem('tasaBCV_actualizada');

  if (tasaGuardada) {
    this.tasaDolar = parseFloat(tasaGuardada);
  }
  if (ultimaActualizacion) {
    this.ultimaActualizacionTasa = parseInt(ultimaActualizacion);
  }

  const ahora = Date.now();
  const tresHoras = 3 * 60 * 60 * 1000;

  if ((!ultimaActualizacion || ahora - ultimaActualizacion > tresHoras) && navigator.onLine) {
    // 🔥 Solo si han pasado 3 horas y HAY internet
    console.log("🌐 Internet disponible y tasa vieja, consultando API...");
    this.obtenerTasaBCV();
  } else if (!navigator.onLine) {
    console.log("🚫 No hay internet, usando tasa local sin consultar API.");
  } else {
    console.log("✅ Tasa actualizada, no se consulta API todavía.");
  }

  this.obtenerDatos();
  this.intervaloTasa = setInterval(this.verificarActualizarTasa, this.frecuenciaActualizacion);

  window.addEventListener('online', this.intentarActualizarTasa);
},


  beforeDestroy() {
    clearInterval(this.intervaloTasa);
    window.removeEventListener('online', this.intentarActualizarTasa);
  },

  computed: {
    formatearTasaReferencia() {
      if (!this.tasaDolar) return "0,00";
      return this.tasaDolar.toFixed(2).replace(".", ",");
    },
    esTasaManualValida() {
      const valor = parseFloat(this.tasaManual);
      return !isNaN(valor) && valor > 0;
    }
  },

  methods: {
    obtenerTasaBCV() {
      axios.get('http://localhost/sistema-gimnasio/api/tasa_bcv.php')
        .then(response => {
          if (response.data && response.data.bcv) {
            this.tasaDolar = parseFloat(response.data.bcv);
            localStorage.setItem('tasaBCV', this.tasaDolar);
            this.$toast.success("✅ Tasa BCV actualizada exitosamente", {
              timeout: 2500,
              position: "top-right"
            });
          } else {
            this.mostrarDialogoTasaManual();
          }
        })
        .catch(error => {
          console.error('Error obteniendo tasa BCV:', error);
          this.mostrarDialogoTasaManual();
        });
    },

    intentarActualizarTasa() {
  console.log("🌐 Internet restaurado, esperando para intentar verificar actualización de tasa...");
  setTimeout(() => {
    this.verificarActualizarTasa();
  }, 3000);
},


    validarDecimales() {
      if (this.tasaManual) {
        this.tasaManual = this.tasaManual.toString().replace(",", ".");
        const partes = this.tasaManual.split(".");
        if (partes.length > 1 && partes[1].length > 4) {
          this.tasaManual = parseFloat(this.tasaManual).toFixed(4);
        }
      }
    },

    mostrarDialogoTasaManual() {
      this.dialogoTasaManual = true;
      this.$toast.error("⚠️ No se pudo obtener la tasa BCV automáticamente. Ingrese manualmente.", {
        timeout: 4000,
        position: "top-right"
      });
    },

    confirmarTasaManual() {
      const tasa = parseFloat(this.tasaManual);
      if (!isNaN(tasa) && tasa > 0) {
        this.tasaDolar = tasa;
        localStorage.setItem('tasaBCV', this.tasaDolar);
        this.destellarTasa();
        this.$toast.success(`✅ Nueva tasa manual aplicada: BsS ${this.formatearTasaReferencia}`, {
          timeout: 3000,
          position: "top-right"
        });
        this.dialogoTasaManual = false;
      } else {
        this.$toast.error("⚠️ Por favor ingrese un número válido para la tasa", {
          timeout: 3000,
          position: "top-right"
        });
      }
    },

    destellarTasa() {
      const alerta = document.querySelector('.v-alert');
      if (alerta) {
        alerta.style.transition = 'background-color 0.5s';
        alerta.style.backgroundColor = '#b9f6ca';
        setTimeout(() => {
          alerta.style.backgroundColor = '';
        }, 500);
      }
    },

    animarTarjetasVisitas() {
      this.datosVisitas.forEach(card => {
        card.valorAnimado = 0;
        const total = typeof card.total === 'string' ? parseFloat(card.total) : card.total;
        const incremento = total / 40;
        let paso = 0;
        const intervalo = setInterval(() => {
          card.valorAnimado += incremento;
          paso++;
          if (paso >= 40) {
            card.valorAnimado = total;
            clearInterval(intervalo);
          }
        }, 25);
      });
    },

    formatearBsS(valor) {
      if (isNaN(valor)) return `<small>Bs.S</small> 0,00`;
      const valorFormateado = valor
        .toFixed(2)
        .replace(".", ",")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return `<small>Bs.S</small> ${valorFormateado}`;
    },

    animarTarjetasPagos() {
      this.datosPagos.forEach(card => {
        const valorNumerico = parseFloat(card.total) || 0;
        card.valorAnimado = this.formatearBsS(0);
        let actual = 0;
        let pasos = 40;
        if (valorNumerico > 1000000) {
          pasos = 80;
        } else if (valorNumerico > 100000) {
          pasos = 60;
        }
        const incremento = valorNumerico / pasos;
        let paso = 0;
        const intervalo = setInterval(() => {
          actual += incremento;
          paso++;
          let valorMostrar = actual;
          if (paso >= pasos) {
            valorMostrar = valorNumerico;
            clearInterval(intervalo);
          }
          let texto = this.formatearBsS(valorMostrar);
          if (valorMostrar >= 1000000) {
            texto += " 💰";
          }
          card.valorAnimado = texto;
        }, 25);
      });
    },

    resaltarCoincidencia(nombre, texto, index) {
      if (!texto) return `<span>${index}. ${nombre}</span>`;
      const regex = new RegExp(`(${texto})`, "gi");
      const resaltado = nombre.replace(regex, '<mark>$1</mark>');
      return `<span>${index}. ${resaltado}</span>`;
    },

    mostrarDetalles(nombre) {
      this.miembroSeleccionado = nombre;
      this.dialogoDetalle = true;
    },
  obtenerDatos() {
    this.cargando = true;
    HttpService.obtenerConDatos({ metodo: "obtener" }, "inicio.php").then((resultado) => {
      this.datosVisitas = [
        { color: "pink", icono: "mdi-calendar", nombre: "Membresías hoy", total: resultado.membresiasHoy, valorAnimado: 0 },
        { color: "red", icono: "mdi-calendar-range", nombre: "Membresías semana", total: resultado.membresiasSemana, valorAnimado: 0 },
        { color: "indigo", icono: "mdi-calendar-month", nombre: "Membresías mes", total: resultado.membresiasMes, valorAnimado: 0 },
        { color: "purple", icono: "mdi-calendar-star", nombre: "Total membresías", total: resultado.membresiasTotales, valorAnimado: 0 },
      ];
      this.animarTarjetasVisitas();

      this.datosPagos = [
        { color: "teal", icono: "mdi-calendar", nombre: "Ingreso diario", total: resultado.datosPagos.pagosHoy, valorAnimado: this.formatearBsS(0) },
        { color: "green", icono: "mdi-calendar-range", nombre: "Ingreso semanal", total: resultado.datosPagos.pagosSemana, valorAnimado: this.formatearBsS(0) },
        { color: "orange", icono: "mdi-calendar-month", nombre: "Ingreso mensual", total: resultado.datosPagos.pagosMes, valorAnimado: this.formatearBsS(0) },
        { color: "blue", icono: "mdi-currency-usd", nombre: "Ingreso total", total: resultado.datosPagos.totalPagos, valorAnimado: this.formatearBsS(0) },
      ];
      this.animarTarjetasPagos();

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
}

};
</script>

<style scoped>
.glass-card-custom {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  color: var(--v-theme-on-surface);
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
  color: var(--v-theme-on-surface);
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
