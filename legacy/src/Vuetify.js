import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

export default new Vuetify({
  icons: {
    iconfont: 'mdi' // ✅ ahora los iconos se mostrarán correctamente
  },
  theme: {
    dark: false,
    themes: {
      light: {
        primary: '#5E35B1',
        secondary: '#512DA8',
        accent: '#9575CD',
      },
      dark: {
        primary: '#5E35B1',
        secondary: '#512DA8',
        accent: '#9575CD',
        error: '#f44336',
      },
    }
  }
})