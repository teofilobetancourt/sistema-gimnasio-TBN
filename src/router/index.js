import Vue from 'vue'
import Router from 'vue-router'

const InicioComponent = () => import(/* webpackChunkName: "inicio" */ '../components/InicioComponent')
const Membresias = () => import(/* webpackChunkName: "membresias" */ '../components/Membresias/Membresias')
const Miembros = () => import(/* webpackChunkName: "miembros" */ '../components/Miembros/Miembros')
const NuevoMiembro = () => import(/* webpackChunkName: "miembros" */ '../components/Miembros/NuevoMiembro')
const EditarMiembro = () => import(/* webpackChunkName: "miembros" */ '../components/Miembros/EditarMiembro')
const Usuarios = () => import(/* webpackChunkName: "usuarios" */ '../components/Usuarios/Usuarios')
const NuevoUsuario = () => import(/* webpackChunkName: "usuarios" */ '../components/Usuarios/NuevoUsuario')
const EditarUsuario = () => import(/* webpackChunkName: "usuarios" */ '../components/Usuarios/EditarUsuario')
const CambiarPassword = () => import(/* webpackChunkName: "usuarios" */ '../components/Usuarios/CambiarPassword')
const MiPerfil = () => import(/* webpackChunkName: "usuarios" */ '../components/Usuarios/MiPerfil')
const Pagos = () => import(/* webpackChunkName: "pagos" */ '../components/Pagos/Pagos')
const RegistrarVisita = () => import(/* webpackChunkName: "visitas" */ '../components/Visitas/RegistrarVisita')
const Visitas = () => import(/* webpackChunkName: "visitas" */ '../components/Visitas/Visitas')
const ConfiguracionComponent = () => import(/* webpackChunkName: "configuracion" */ '../components/Configuracion/ConfiguracionComponent')
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'InicioComponent',
      component: InicioComponent
    },
    {
      path: '/membresias',
      name: 'Membresias',
      component: Membresias
    },
    {
      path: '/miembros',
      name: 'Miembros',
      component: Miembros
    },
    {
      path: '/nuevo-miembro',
      name: 'NuevoMiembro',
      component: NuevoMiembro
    },
    {
      path: '/editar-miembro/:id',
      name: 'EditarMiembro',
      component: EditarMiembro,
    },
    {
      path: '/usuarios',
      name: 'Usuarios',
      component: Usuarios
    },
    {
      path: '/nuevo-usuario',
      name: 'NuevoUsuario',
      component: NuevoUsuario
    },
    {
      path: '/editar-usuario/:id',
      name: 'EditarUsuario',
      component: EditarUsuario,
    },
    {
      path: '/cambiar-password',
      name: 'CambiarPassword',
      component: CambiarPassword
    },
    {
      path: '/pagos',
      name: 'Pagos',
      component: Pagos
    },
    {
      path: '/registrar-visita',
      name: 'RegistrarVisita',
      component: RegistrarVisita
    },
    {
      path: '/visitas',
      name: 'Visitas',
      component: Visitas
    },
    {
      path: '/configurar',
      name: 'Configurar',
      component: ConfiguracionComponent
    },
    {
      path: '/perfil',
      name: 'MiPerfil',
      component: MiPerfil
    },
  ]
})
