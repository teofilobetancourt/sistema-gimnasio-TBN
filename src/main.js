import Vue from 'vue'
import App from './App'
import router from './router'
import vuetify from './Vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  vuetify,
  components: { App },
  template: '<App/>'
})
