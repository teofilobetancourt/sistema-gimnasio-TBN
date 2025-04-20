<template>
  <v-container fluid class="pa-0">
    <div class="encabezado-banner d-flex flex-column justify-center align-center text-center">
      <!-- BOTÓN MENÚ solo visible si drawer está cerrado -->
      <transition name="fade-scale">
        <v-btn
          v-if="!drawer"
          icon
          @click="drawer = true"
          title="Abrir menú"
          class="btn-menu-fijo"
        >
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </transition>

      <!-- BARRA SUPERIOR: Botones lado derecho -->
      <div class="barra-funcional d-flex justify-end align-center px-4 pt-2">
        <!-- Botón tema con tooltip -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              class="btn-circular mr-2"
              v-bind="attrs"
              v-on="on"
              @click="toggleDarkMode"
            >
              <v-icon
                :color="$vuetify.theme.dark ? 'yellow lighten-2' : 'black'"
                class="rotate-on-toggle"
              >
                {{ $vuetify.theme.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
              </v-icon>
            </v-btn>
          </template>
          <span>{{ $vuetify.theme.dark ? 'Tema claro' : 'Tema oscuro' }}</span>
        </v-tooltip>

        <!-- Botón salir con tooltip -->
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              class="btn-circular"
              v-bind="attrs"
              v-on="on"
              @click="salir"
            >
              <v-icon>mdi-logout</v-icon>
            </v-btn>
          </template>
          <span>Cerrar sesión</span>
        </v-tooltip>
      </div>

      <!-- TÍTULO Y SUBTÍTULO -->
      <h1 class="titulo font-weight-bold">EVOLUTION FITNESS · GYM, F. P.</h1>
      <p class="subtitulo">Bienvenido al sistema de control de membresías Evolution Fitness Gym</p>
    </div>

    <!-- DRAWER lateral -->
    <v-navigation-drawer
      app
      v-model="drawer"
      class="drawer-degradado shadow-right"
      dark
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6 white--text">
            <v-avatar>
              <img :src="logo" alt="Logo" />
            </v-avatar>
            {{ nombreGimnasio }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-h6 white--text">
            {{ nombreUsuario }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item
          v-for="item in items"
          :key="item.title"
          link
          :to="item.link"
          class="white--text"
          @click="drawer = false"
        >
          <v-list-item-icon>
            <v-icon class="white--text">{{ item.icon }}</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </v-container>
</template>

<script>
import logoLocal from '@/assets/logo.png';

export default {
  name: "Encabezado",
  data: () => ({
    drawer: false,
    nombreUsuario: "",
    nombreGimnasio: "",
    logo: logoLocal,
    items: [
      { title: "Inicio", icon: "mdi-view-dashboard", link: "/" },
      { title: "Usuarios", icon: "mdi-account-box", link: "/usuarios" },
      { title: "Miembros", icon: "mdi-weight-lifter", link: "/miembros" },
      { title: "Membresías", icon: "mdi-wallet-membership", link: "/membresias" },
      { title: "Pagos", icon: "mdi-account-cash", link: "/pagos" },
      { title: "Configurar", icon: "mdi-cog", link: "/configurar" },
      { title: "Mi perfil", icon: "mdi-account-key", link: "/perfil" },
    ],
  }),

  mounted() {
    this.nombreUsuario = localStorage.getItem("nombreUsuario");
    this.nombreGimnasio = localStorage.getItem("nombreGimnasio");

    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      this.$vuetify.theme.dark = savedTheme === 'true';
    }
  },

  methods: {
    salir() {
      localStorage.removeItem('logeado');
      localStorage.removeItem('nombreUsuario');
      localStorage.removeItem('idUsuario');
      window.location.reload();
    },
    toggleDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem('darkMode', this.$vuetify.theme.dark);
    }
  }
};
</script>

<style scoped>
.encabezado-banner {
  background: linear-gradient(to right, #9c27b0, #3f51b5);
  color: white;
  height: 280px;
  position: relative;
  padding-top: 40px;
  padding-bottom: 20px;
}

.drawer-degradado {
  background: #9c27b0; /* morado sólido para evitar el choque */
}

.shadow-right {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
}

.barra-funcional {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
}

.btn-menu-fijo {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 9999;
  background-color: rgba(63, 81, 181, 0.9);
  color: white;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}
.btn-menu-fijo:hover {
  background-color: rgba(63, 81, 181, 1);
}

.btn-circular {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  transition: background-color 0.3s ease, transform 0.3s ease;
}
.btn-circular:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.rotate-on-toggle {
  transition: transform 0.4s ease;
}
.btn-circular:active .rotate-on-toggle {
  transform: rotate(360deg);
}

.titulo {
  font-size: 3.5rem;
  letter-spacing: 2px;
  margin: 0;
  padding: 0 20px;
}

.subtitulo {
  font-size: 1.2rem;
  margin-top: 10px;
  opacity: 0.9;
  padding: 0 20px;
}

.v-icon {
  font-size: 20px;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.7);
}
</style>
