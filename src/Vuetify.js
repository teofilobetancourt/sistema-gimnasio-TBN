import Vue from 'vue'
import Vuetify from 'vuetify'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    dark: false,
    themes: {
      light: {
        primary: '#5E35B1',    // Morado oscuro
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

