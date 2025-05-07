<template>
  <div>
    <v-container fluid class="pa-2 overflow-x-auto">
      <v-row align="center" justify="space-between">
        <v-col cols="12" md="6">
          <h1 class="text-h5 font-weight-bold">Miembros</h1>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="busqueda"
            append-icon="mdi-magnify"
            label="Buscar por nombre o cédula"
            single-line
            hide-details
            clearable
            dense
          />
        </v-col>
      </v-row>

      <v-data-table
        dense
        :loading="cargando"
        :headers="encabezadoTabla"
        :items="miembrosFiltrados"
        :item-key="'cedula'"
        class="elevation-1 table-header-bold"
        :footer-props="{ itemsPerPageText: 'Por página' }"
        show-expand
        :expanded.sync="filasExpandidas"
        @click:row="alternarFilaExpandida"
      >
        <template v-slot:[`item.imagen`]="{ item }">
          <v-avatar size="32">
            <img :src="urlImagen(item.imagen)" alt="Foto" />
          </v-avatar>
        </template>

        <template v-slot:[`item.estado`]="{ item }">
          <v-chip
            class="ma-1"
            :color="estado(item.estado)"
            text-color="white"
            small
          >
            {{ item.estado || 'SIN MEMBRESÍA' }}
          </v-chip>
        </template>

        <template v-slot:[`item.opciones`]="{ item }">
          <v-tooltip bottom color="primary">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small color="primary" v-bind="attrs" v-on="on" @click.stop="editar(item.id)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Editar</span>
          </v-tooltip>

          <v-tooltip bottom color="error">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small color="error" v-bind="attrs" v-on="on" @click.stop="eliminar(item)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Eliminar</span>
          </v-tooltip>

          <v-tooltip bottom color="secondary">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small color="secondary" v-bind="attrs" v-on="on" @click.stop="generarCredencial(item)">
                <v-icon>mdi-card-account-details</v-icon>
              </v-btn>
            </template>
            <span>Generar credencial</span>
          </v-tooltip>

          <v-tooltip bottom color="success" v-if="!item.estado || item.estado === 'VENCIDO'">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small color="success" v-bind="attrs" v-on="on" @click.stop="realizarPago(item.cedula)">
                <v-icon>mdi-wallet-membership</v-icon>
              </v-btn>
            </template>
            <span>Realizar pago</span>
          </v-tooltip>

          <v-tooltip bottom color="info" v-if="item.estado === 'ACTIVO'">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon small color="info" v-bind="attrs" v-on="on" @click.stop="renovarMembresia(item.cedula)">
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </template>
            <span>Renovar membresía</span>
          </v-tooltip>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            <v-card flat>
              <v-card-text>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-icon><v-icon color="indigo">mdi-map-marker</v-icon></v-list-item-icon>
                    <v-list-item-content><b>Dirección:</b> {{ item.direccion }}</v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon><v-icon color="indigo">mdi-calendar</v-icon></v-list-item-icon>
                    <v-list-item-content><b>Miembro desde:</b> {{ item.fechaRegistro }}</v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon><v-icon color="indigo">mdi-calendar-account</v-icon></v-list-item-icon>
                    <v-list-item-content><b>Edad:</b> {{ item.edad }}</v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon><v-icon color="indigo">mdi-account</v-icon></v-list-item-icon>
                    <v-list-item-content><b>Contacto emergencia:</b> {{ item.nombreContacto }} <b>Tel:</b> {{ item.telefonoContacto }}</v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon><v-icon color="indigo">mdi-mother-heart</v-icon></v-list-item-icon>
                    <v-list-item-content><b>Enfermedades:</b> {{ item.enfermedad }}</v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon><v-icon color="indigo">mdi-hospital-building</v-icon></v-list-item-icon>
                    <v-list-item-content><b>Seguro:</b> {{ item.institucion }}</v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </td>
        </template>
      </v-data-table>

      <v-btn fab small color="primary" elevation="4" fixed bottom right to="/nuevo-miembro">
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <v-dialog v-model="mostrarRealizarPago" persistent max-width="600">
        <realizar-pago :cedula="matriculaSeleccionada" @cerrar="cerrarDialogoPago" @pagado="onPagado" />
      </v-dialog>

      <v-dialog v-model="mostrarDialogoEliminar" max-width="500px">
        <dialogo-eliminar :nombre="itemSeleccionado" @cancelar="cerrarDialogoEliminar" @eliminar="confirmarEliminar" />
      </v-dialog>

      <credencial-miembro :matricula="matriculaSeleccionada" :miembro="miembro" @impreso="onImpreso" v-if="mostrarCredencial" />

      <v-snackbar v-model="mostrarMensaje" :timeout="3000" :color="mensaje.color" top>
        {{ mensaje.texto }}
      </v-snackbar>

      <v-overlay :value="cargando">
        <v-progress-circular size="64"></v-progress-circular>
      </v-overlay>
    </v-container>
  </div>
</template>


<script>
import HttpService from "../../Servicios/HttpService";
import Utiles from "../../Servicios/Utiles";
import RealizarPago from "./RealizarPago.vue";
import DialogoEliminar from "../Dialogos/DialogoEliminar.vue";
import CredencialMiembro from "./CredencialMiembro.vue";

export default {
  name: "Miembros",
  components: { RealizarPago, DialogoEliminar, CredencialMiembro },

  data: () => ({
    encabezadoTabla: [
      { text: "Imagen", align: "start", sortable: false, value: "imagen" },
      { text: "Cédula", sortable: true, value: "cedula" },
      { text: "Nombre", sortable: true, value: "nombre" },
      { text: "Teléfono", sortable: false, value: "telefono" },
      { text: "Estado", sortable: true, value: "estado" },
      { text: "Inicio membresía", sortable: true, value: "fechaInicio" },
      { text: "Fin membresía", sortable: true, value: "fechaFin" },
      { text: "Membresía", sortable: true, value: "membresia" },
      { text: "Opciones", value: "opciones", sortable: false },
    ],
    cargando: false,
    mostrarMensaje: false,
    mensaje: { color: "", texto: "" },
    miembros: [],
    busqueda: "",
    matriculaSeleccionada: "",
    mostrarRealizarPago: false,
    itemSeleccionado: null,
    miembro: null,
    mostrarDialogoEliminar: false,
    mostrarCredencial: false,
    filasExpandidas: [],
  }),

  computed: {
    miembrosFiltrados() {
      const texto = this.busqueda.toLowerCase();
      return this.miembros
        .map(m => ({
          ...m,
          fechaInicio: m.fechaInicio ? m.fechaInicio.split(' ')[0] : '',
          fechaFin: m.fechaFin ? m.fechaFin.split(' ')[0] : ''
        }))
        .filter(m => m.nombre.toLowerCase().includes(texto) || String(m.cedula).toLowerCase().includes(texto))
        .sort((a, b) => {
          if ((a.estado === 'VENCIDO') !== (b.estado === 'VENCIDO')) return a.estado === 'VENCIDO' ? -1 : 1;
          return new Date(b.fechaRegistro) - new Date(a.fechaRegistro);
        });
    },
  },

  mounted() {
    this.obtenerMiembros();
  },

  methods: {
    generarCredencial(miembro) {
      this.matriculaSeleccionada = miembro.cedula;
      this.miembro = miembro;
      this.mostrarCredencial = true;
    },

    alternarFilaExpandida(item) {
      const index = this.filasExpandidas.findIndex(f => f.cedula === item.cedula);
      if (index >= 0) {
        this.filasExpandidas.splice(index, 1);
      } else {
        this.filasExpandidas.push(item);
      }
    },
    onImpreso(resultado) {
      this.mostrarCredencial = resultado;
    },
    eliminar(miembro) {
      this.itemSeleccionado = miembro.nombre;
      this.miembro = miembro;
      this.mostrarDialogoEliminar = true;
    },
    cerrarDialogoEliminar() {
      this.mostrarDialogoEliminar = false;
      this.miembro = null;
    },
    confirmarEliminar() {
      this.cargando = true;
      HttpService.eliminar("miembros.php", { metodo: "eliminar", id: this.miembro.id }).then((eliminado) => {
        if (eliminado) {
          this.mostrarDialogoEliminar = false;
          this.mostrarMensaje = true;
          this.mensaje = { texto: "Miembro eliminado", color: "success" };
          this.cargando = false;
          this.obtenerMiembros();
        }
      });
    },
    editar(idMiembro) {
      this.$router.push({ name: "EditarMiembro", params: { id: idMiembro } });
    },
    urlImagen(imagen) {
      return Utiles.generarURL(imagen);
    },
    cerrarDialogoPago(resultado) {
      this.mostrarRealizarPago = resultado;
    },
    realizarPago(cedula) {
      this.matriculaSeleccionada = cedula;
      this.mostrarRealizarPago = true;
    },
    onPagado(resultado) {
      if (resultado) {
        this.mostrarRealizarPago = false;
        this.mostrarMensaje = true;
        this.mensaje = { color: "success", texto: "✅ Pago realizado con éxito" };
        this.obtenerMiembros();
      }
    },
    obtenerMiembros() {
      this.cargando = true;
      HttpService.obtenerConDatos({ metodo: "get" }, "miembros.php").then((resultado) => {
        this.miembros = resultado;
        this.cargando = false;
      });
    },
    estado(val) {
      return val === "ACTIVO" ? "success" : val === "VENCIDO" ? "error" : "warning";
    },
    renovarMembresia(cedula) {
      // Cambiado para abrir el diálogo de pagos
      this.matriculaSeleccionada = cedula;
      this.mostrarRealizarPago = true;
    },
  },
};
</script>

<style scoped>
::v-deep .v-data-table thead th {
  font-weight: bold;
  font-size: 14px;
  background-color: #1e1e1e;
  color: #ffffff;
}
</style>
