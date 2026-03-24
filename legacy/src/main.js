import Vue from 'vue'
import App from './App'
import router from './router'
import vuetify from './Vuetify'
import 'vuetify/dist/vuetify.min.css'
import '@mdi/font/css/materialdesignicons.css'

// 👇 IMPORTA Toast
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// 👇 USA Toast
Vue.use(Toast);

Vue.config.productionTip = false;

// 👇 USA render moderno para que plugins como Toast funcionen
new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
