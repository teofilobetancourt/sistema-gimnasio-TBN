<template>
    <div>
      <v-progress-linear
        :active="cargando"
        :indeterminate="cargando"
        absolute top
        color="deep-purple accent-4"
      ></v-progress-linear>
  
      <h1>Planes</h1>
  
      <v-data-table
        :headers="encabezadoTabla"
        :items="membresias"
        sort-by="nombre"
        class="elevation-1"
        :footer-props="{ itemsPerPageText: 'Por página' }"
      >
        <template v-slot:[`item.opciones`]="{ item }">
          <v-icon color="blue" class="mr-2" @click="editar(item)">mdi-pencil</v-icon>
          <v-icon color="red" @click="eliminar(item)">mdi-delete</v-icon>
        </template>
      </v-data-table>
  
      <v-snackbar v-model="mostrarMensaje" :timeout="3000" :color="mensaje.color" top>
        {{ mensaje.texto }}
      </v-snackbar>
  
      <v-btn 
        fab dark x-large elevation="8" 
        color="primary" 
        fixed right bottom 
        @click="mostrarDialogo = true">
        <v-icon dark>add</v-icon>
      </v-btn>
  
      <v-dialog v-model="mostrarDialogo" persistent max-width="600px">
        <FormMembresia 
          :membresia="membresia" 
          :titulo="titulo" 
          @cerrado="onCerrado" 
          @registrar="onRegistrar" 
        />
      </v-dialog>
  
      <v-dialog v-model="mostrarDialogoEliminar" max-width="500px">
        <DialogoEliminar 
          :nombre="itemSeleccionado" 
          @cancelar="cerrarDialogoEliminar" 
          @eliminar="confirmarEliminar" 
        />
      </v-dialog>
    </div>
  </template>
  
  <script>
  import FormMembresia from './FormMembresia.vue';
  import DialogoEliminar from '../Dialogos/DialogoEliminar.vue';
  import HttpService from '../../Servicios/HttpService';
  
  export default {
    name: "Membresias",
    components: { FormMembresia, DialogoEliminar },
  
    data: () => ({
      cargando: false,
      mostrarDialogo: false,
      mostrarDialogoEliminar: false,
      membresia: {
        nombre: "",
        duracion: "",
        precio: ""
      },
      membresias: [],
      mensaje: {
        texto: "",
        color: ""
      },
      mostrarMensaje: false,
      encabezadoTabla: [
        { text: "Mensualidad", sortable: true, value: "nombre" },
        { text: "Duración (días)", value: "duracion" },
        { text: "Precio (Bs.S)", value: "precioBs" },
        { text: "Opciones", value: "opciones", sortable: false }
      ],
      titulo: "Agregar",
      itemSeleccionado: "",
      tasaDolar: 0
    }),
  
    mounted() {
  const tasaGuardada = localStorage.getItem('tasaBCV');
  if (tasaGuardada) {
    this.tasaDolar = parseFloat(tasaGuardada);
  }
  this.obtenerMembresias();
},

methods: {
  calcularPrecioBs(precioUSD) {
    if (!this.tasaDolar || !precioUSD) return "0,00";
    const precioBs = precioUSD * this.tasaDolar;
    return precioBs
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  },

  editar(membresia) {
    this.titulo = "Editar";
    this.membresia = { ...membresia };
    this.mostrarDialogo = true;
  },

  eliminar(membresia) {
    this.itemSeleccionado = membresia.nombre;
    this.membresia = membresia;
    this.mostrarDialogoEliminar = true;
  },

  cerrarDialogoEliminar() {
    this.mostrarDialogoEliminar = false;
    this.membresia = { nombre: "", duracion: "", precio: "" };
  },

  confirmarEliminar() {
    this.cargando = true;
    const payload = { metodo: "delete", id: this.membresia.id };
    HttpService.eliminar("membresias.php", payload)
      .then(eliminado => {
        if (eliminado) {
          this.mostrarDialogoEliminar = false;
          this.mostrarMensaje = true;
          this.mensaje.texto = "Mensualidad eliminada";
          this.mensaje.color = "success";
          this.obtenerMembresias();
        }
        this.cargando = false;
      });
  },

  onCerrado(valor) {
    this.membresia = { nombre: "", duracion: "", precio: "" };
    this.mostrarDialogo = valor;
    this.titulo = "Agregar";
  },

  onRegistrar(membresia) {
    const metodo = this.titulo === "Agregar" ? "post" : "put";
    this.membresia = membresia;
    this.cargando = true;
    const payload = { metodo: metodo, membresia: this.membresia };
    HttpService.registrar(payload, "membresias.php")
      .then(respuesta => {
        if (respuesta) {
          this.membresia = { nombre: "", duracion: "", precio: "" };
          this.mostrarDialogo = false;
          this.mostrarMensaje = true;
          this.mensaje.texto = "Mensualidad registrada";
          this.mensaje.color = "success";
          this.obtenerMembresias();
          this.titulo = "Agregar";
        }
        this.cargando = false;
      });
  },

  obtenerMembresias() {
    this.cargando = true;
    const payload = { metodo: "get" };
    HttpService.obtenerConDatos(payload, "membresias.php")
      .then(respuesta => {
        const tasaGuardada = localStorage.getItem('tasaBCV');
        this.tasaDolar = tasaGuardada ? parseFloat(tasaGuardada) : 0;

        this.membresias = respuesta.map(membresia => ({
          ...membresia,
          precioBs: this.calcularPrecioBs(membresia.precio)
        }));

        this.cargando = false;
      });
  }
},

watch: {
  tasaDolar(newTasa) {
    if (newTasa > 0 && this.membresias.length > 0) {
      this.membresias = this.membresias.map(membresia => ({
        ...membresia,
        precioBs: this.calcularPrecioBs(membresia.precio)
      }));
      console.log("🔁 Tasa actualizada, precios recalculados.");
    }
  }
}

  };
  </script>
  