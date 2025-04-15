<template>
  <div>
    <v-app-bar color="primary" class="flex-grow-0" app dark>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      
      <v-toolbar-title>
        <img src="@/assets/logo.png" width="200" />
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Botón para cambiar el tema -->
      <v-btn icon @click="toggleDarkMode" :title="$vuetify.theme.dark ? 'Tema claro' : 'Tema oscuro'">
        <v-icon>{{ $vuetify.theme.dark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- Botón de cerrar sesión -->
      <v-btn icon @click="salir" title="Cerrar sesión">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Usamos color "primary" y "dark" directamente -->
    <v-navigation-drawer app v-model="drawer" color="primary" dark>
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
  </div>
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
      { title: "Registrar visita", icon: "mdi-home-account", link: "/registrar-visita" },
      { title: "Usuarios", icon: "mdi-account-box", link: "/usuarios" },
      { title: "Miembros", icon: "mdi-weight-lifter", link: "/miembros" },
      { title: "Membresías", icon: "mdi-wallet-membership", link: "/membresias" },
      { title: "Pagos", icon: "mdi-account-cash", link: "/pagos" },
      { title: "Visitas", icon: "mdi-calendar-star", link: "/visitas" },
      { title: "Configurar", icon: "mdi-cog", link: "/configurar" },
      { title: "Mi perfil", icon: "mdi-account-key", link: "/perfil" },
    ],
  }),

  mounted() {
    this.nombreUsuario = localStorage.getItem("nombreUsuario")
    this.nombreGimnasio = localStorage.getItem("nombreGimnasio")

    // Establece el tema guardado si existe
    const savedTheme = localStorage.getItem('darkMode')
    if (savedTheme !== null) {
      this.$vuetify.theme.dark = savedTheme === 'true'
    }
  },

  methods: {
    salir() {
      localStorage.removeItem('logeado')
      localStorage.removeItem('nombreUsuario')
      localStorage.removeItem('idUsuario')
      window.location.reload()
    },
    toggleDarkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      localStorage.setItem('darkMode', this.$vuetify.theme.dark)
    }
  }
};
</script>

<style>
/* Ya no usamos clase .fondo personalizada */
</style>
